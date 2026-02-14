import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class TeacherController {
  /**
   * Get teacher/admin dashboard data
   * GET /api/teacher/dashboard
   */
  static async getDashboard(req: Request, res: Response) {
    try {
      const teacherId = req.user?.teacherId;

      if (!teacherId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      // Get teacher info
      const teacher = await prisma.teacher.findUnique({
        where: { teacher_id: teacherId },
      });

      if (!teacher) {
        res.status(404).json({ error: "Teacher not found" });
        return;
      }

      // Get statistics
      const totalStudents = await prisma.student.count();
      const activeStudents = await prisma.student.count({
        where: { is_active: true },
      });
      const totalCourses = await prisma.course.count();
      const pendingApprovals = await prisma.courseRegistration.count({
        where: { is_approved: false },
      });

      // Get recent registrations (last 5)
      const recentActivity = await prisma.courseRegistration.findMany({
        take: 5,
        orderBy: { registered_at: "desc" },
        include: {
          student: true,
          course: true,
        },
      });

      res.json({
        teacher: {
          id: teacher.teacher_id,
          name: teacher.name,
          email: teacher.email,
          department: teacher.department,
          role: teacher.role,
        },
        statistics: {
          totalStudents,
          activeStudents,
          totalCourses,
          pendingApprovals,
        },
        recentActivity: recentActivity.map((reg) => ({
          id: reg.registration_id,
          action: "Course Registration",
          student: reg.student.name,
          studentId: reg.student.enrollment_no,
          course: reg.course.course_name,
          courseCode: reg.course.course_code,
          time: reg.registered_at,
          status: reg.is_approved ? "approved" : "pending",
        })),
      });
    } catch (error) {
      console.error("Error fetching teacher dashboard:", error);
      res.status(500).json({ error: "Failed to fetch dashboard data" });
    }
  }

  /**
   * Get all students with filters
   * GET /api/teacher/students
   */
  static async getStudents(req: Request, res: Response) {
    try {
      const { search, branch, semester, status } = req.query;

      const where: any = {};

      // Search filter
      if (search) {
        where.OR = [
          { name: { contains: search as string, mode: "insensitive" } },
          { enrollment_no: { contains: search as string, mode: "insensitive" } },
          { email: { contains: search as string, mode: "insensitive" } },
        ];
      }

      // Branch filter
      if (branch) {
        where.faculty = {
          branch_code: branch as string,
        };
      }

      // Semester filter
      if (semester) {
        where.current_semester = parseInt(semester as string);
      }

      // Status filter
      if (status) {
        where.is_active = status === "active";
      }

      const students = await prisma.student.findMany({
        where,
        include: {
          faculty: true,
        },
        orderBy: { enrollment_no: "asc" },
      });

      res.json({
        students: students.map((student) => ({
          enrollmentNo: student.enrollment_no,
          name: student.name,
          email: student.email,
          branch: student.faculty?.branch_name || "N/A",
          branchCode: student.faculty?.branch_code || "N/A",
          semester: student.current_semester,
          cpi: Number(student.current_cpi),
          status: student.is_active ? "active" : "inactive",
          admissionYear: student.faculty?.admission_year || 0,
        })),
        total: students.length,
      });
    } catch (error) {
      console.error("Error fetching students:", error);
      res.status(500).json({ error: "Failed to fetch students" });
    }
  }

  /**
   * Get all courses
   * GET /api/teacher/courses
   */
  static async getCourses(req: Request, res: Response) {
    try {
      const courses = await prisma.course.findMany({
        include: {
          prerequisites: {
            include: {
              prerequisite: true,
            },
          },
        },
        orderBy: { course_code: "asc" },
      });

      res.json({
        courses: courses.map((course) => ({
          courseCode: course.course_code,
          courseName: course.course_name,
          credits: course.credits,
          semester: course.semester_no,
          branch: course.branch_code,
          isElective: course.is_elective,
          electiveGroup: course.elective_group,
          courseType: course.course_type,
          prerequisites: course.prerequisites.map((p) => ({
            courseCode: p.prerequisite_course_code,
            courseName: p.prerequisite.course_name,
            minGrade: p.min_grade,
          })),
        })),
        total: courses.length,
      });
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ error: "Failed to fetch courses" });
    }
  }

  /**
   * Get pending approvals
   * GET /api/teacher/approvals
   */
  static async getApprovals(req: Request, res: Response) {
    try {
      const approvals = await prisma.courseRegistration.findMany({
        where: { is_approved: false },
        include: {
          student: true,
          course: true,
        },
        orderBy: { registered_at: "desc" },
      });

      res.json({
        approvals: approvals.map((approval) => ({
          id: approval.registration_id,
          studentId: approval.student.enrollment_no,
          studentName: approval.student.name,
          courseCode: approval.course.course_code,
          courseName: approval.course.course_name,
          credits: approval.course.credits,
          registrationType: approval.registration_type,
          submittedAt: approval.registered_at,
          academicYear: approval.academic_year,
          semester: approval.semester_type,
        })),
        total: approvals.length,
      });
    } catch (error) {
      console.error("Error fetching approvals:", error);
      res.status(500).json({ error: "Failed to fetch approvals" });
    }
  }

  /**
   * Approve a registration
   * POST /api/teacher/approvals/:id/approve
   */
  static async approveRegistration(req: Request, res: Response) {
    try {
      const registrationId = parseInt(req.params.id as string);

      const registration = await prisma.courseRegistration.update({
        where: { registration_id: registrationId },
        data: { is_approved: true },
        include: {
          student: true,
          course: true,
        },
      });

      res.json({
        message: "Registration approved successfully",
        registration: {
          id: registration.registration_id,
          student: registration.student.name,
          course: registration.course.course_name,
        },
      });
    } catch (error) {
      console.error("Error approving registration:", error);
      res.status(500).json({ error: "Failed to approve registration" });
    }
  }

  /**
   * Reject a registration
   * POST /api/teacher/approvals/:id/reject
   */
  static async rejectRegistration(req: Request, res: Response) {
    try {
      const registrationId = parseInt(req.params.id as string);

      const registration = await prisma.courseRegistration.delete({
        where: { registration_id: registrationId },
        include: {
          student: true,
          course: true,
        },
      });

      res.json({
        message: "Registration rejected successfully",
        registration: {
          id: registration.registration_id,
          student: registration.student.name,
          course: registration.course.course_name,
        },
      });
    } catch (error) {
      console.error("Error rejecting registration:", error);
      res.status(500).json({ error: "Failed to reject registration" });
    }
  }

  /**
   * Get registration statistics
   * GET /api/teacher/reports/stats
   */
  static async getStatistics(req: Request, res: Response) {
    try {
      const totalRegistrations = await prisma.courseRegistration.count();
      const approvedRegistrations = await prisma.courseRegistration.count({
        where: { is_approved: true },
      });
      const pendingRegistrations = await prisma.courseRegistration.count({
        where: { is_approved: false },
      });

      // Get registrations by course
      const courseStats = await prisma.courseRegistration.groupBy({
        by: ["course_code"],
        _count: true,
        orderBy: {
          _count: {
            course_code: "desc",
          },
        },
        take: 10,
      });

      // Get course details for top courses
      const topCourses = await Promise.all(
        courseStats.map(async (stat) => {
          const course = await prisma.course.findUnique({
            where: { course_code: stat.course_code },
          });
          return {
            courseCode: stat.course_code,
            courseName: course?.course_name || "Unknown",
            registrations: stat._count,
          };
        })
      );

      res.json({
        overview: {
          total: totalRegistrations,
          approved: approvedRegistrations,
          pending: pendingRegistrations,
          rejected: 0, // Rejected registrations are deleted
        },
        topCourses,
      });
    } catch (error) {
      console.error("Error fetching statistics:", error);
      res.status(500).json({ error: "Failed to fetch statistics" });
    }
  }

  /**
   * Update student status (admin only)
   * PUT /api/teacher/students/:enrollmentNo/status
   */
  static async updateStudentStatus(req: Request, res: Response) {
    try {
      const enrollmentNo = req.params.enrollmentNo as string;
      const { isActive } = req.body;

      const student = await prisma.student.update({
        where: { enrollment_no: enrollmentNo },
        data: { is_active: isActive },
      });

      res.json({
        message: "Student status updated successfully",
        student: {
          enrollmentNo: student.enrollment_no,
          name: student.name,
          isActive: student.is_active,
        },
      });
    } catch (error) {
      console.error("Error updating student status:", error);
      res.status(500).json({ error: "Failed to update student status" });
    }
  }
}
