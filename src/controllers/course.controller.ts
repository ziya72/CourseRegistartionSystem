import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { checkPrerequisites } from "../services/prerequisite.service";
import { validateCreditLimit, calculateCurrentCredits } from "../services/credit.service";
import { checkScheduleConflict } from "../services/schedule.service";
import { validateElectiveSelection } from "../services/elective.service";

const prisma = new PrismaClient();

export class CourseController {
  /**
   * Get available courses for student
   * GET /api/courses/available
   */
  static async getAvailableCourses(req: Request, res: Response) {
    try {
      const enrollmentNo = req.user?.enrollmentNo;

      if (!enrollmentNo) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      // Get student details
      const student = await prisma.student.findUnique({
        where: { enrollment_no: enrollmentNo },
        include: { faculty: true },
      });

      if (!student) {
        res.status(404).json({ error: "Student not found" });
        return;
      }

      // Get courses for student's branch and semester
      const courses = await prisma.course.findMany({
        where: {
          branch_code: student.faculty?.branch_code,
          semester_no: student.current_semester,
        },
        include: {
          prerequisites: {
            include: {
              prerequisite: true,
            },
          },
          schedules: true,
        },
      });

      // Get student's current registrations
      const registrations = await prisma.courseRegistration.findMany({
        where: { enrollment_no: enrollmentNo },
      });

      const registeredCodes = registrations.map((r) => r.course_code);

      // Filter out already registered courses
      const availableCourses = courses.filter(
        (course) => !registeredCodes.includes(course.course_code)
      );

      // Format response
      const formattedCourses = availableCourses.map((course) => ({
        course_code: course.course_code,
        course_name: course.course_name,
        credits: course.credits,
        is_elective: course.is_elective,
        elective_group: course.elective_group,
        course_type: course.course_type,
        prerequisites: course.prerequisites.map((p) => ({
          course_code: p.prerequisite_course_code,
          course_name: p.prerequisite.course_name,
          min_grade: p.min_grade,
        })),
        schedule: course.schedules.map((s) => ({
          day: s.day_of_week,
          start_time: s.start_time,
          end_time: s.end_time,
        })),
      }));

      res.json({
        courses: formattedCourses,
        total: formattedCourses.length,
      });
    } catch (error) {
      console.error("Error fetching available courses:", error);
      res.status(500).json({ error: "Failed to fetch available courses" });
    }
  }

  /**
   * Register for a course
   * POST /api/courses/register
   */
  static async registerCourse(req: Request, res: Response) {
    try {
      const enrollmentNo = req.user?.enrollmentNo;
      const { course_code } = req.body;

      if (!enrollmentNo) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      if (!course_code) {
        res.status(400).json({ error: "Course code is required" });
        return;
      }

      // Get student details
      const student = await prisma.student.findUnique({
        where: { enrollment_no: enrollmentNo },
        include: { faculty: true },
      });

      if (!student) {
        res.status(404).json({ error: "Student not found" });
        return;
      }

      // Get course details
      const course = await prisma.course.findUnique({
        where: { course_code: course_code },
      });

      if (!course) {
        res.status(404).json({ error: "Course not found" });
        return;
      }

      // Check if already registered
      const existingRegistration = await prisma.courseRegistration.findFirst({
        where: {
          enrollment_no: enrollmentNo,
          course_code: course_code,
        },
      });

      if (existingRegistration) {
        res.status(400).json({ error: "Already registered for this course" });
        return;
      }

      // Validation 1: Check prerequisites
      const prereqCheck = await checkPrerequisites(enrollmentNo, course_code);
      if (!prereqCheck.met) {
        res.status(400).json({
          error: "Prerequisites not met",
          missing_prerequisites: prereqCheck.missing,
        });
        return;
      }

      // Validation 2: Check credit limit
      const creditCheck = await validateCreditLimit(enrollmentNo, course_code);
      if (!creditCheck.valid) {
        res.status(400).json({
          error: "Credit limit exceeded",
          details: creditCheck,
        });
        return;
      }

      // Validation 3: Check schedule conflicts
      const scheduleCheck = await checkScheduleConflict(
        enrollmentNo,
        course_code
      );
      if (scheduleCheck.conflict) {
        res.status(400).json({
          error: "Schedule conflict",
          conflicting_course: scheduleCheck.conflictingCourse,
        });
        return;
      }

      // Validation 4: Check elective group constraints
      const electiveCheck = await validateElectiveSelection(
        enrollmentNo,
        course_code
      );
      if (!electiveCheck.valid) {
        res.status(400).json({
          error: "Elective group constraint violated",
          details: electiveCheck,
        });
        return;
      }

      // All validations passed - create registration
      const registration = await prisma.courseRegistration.create({
        data: {
          enrollment_no: enrollmentNo,
          course_code: course_code,
          academic_year: new Date().getFullYear(),
          semester_type: student.current_semester,
          registration_type: "regular",
          is_approved: true, // Auto-approve for now
        },
        include: {
          course: true,
        },
      });

      res.status(201).json({
        message: `Successfully registered for ${course.course_name}`,
        registration: {
          course_code: registration.course.course_code,
          course_name: registration.course.course_name,
          credits: registration.course.credits,
          registered_at: registration.registered_at,
          is_approved: registration.is_approved,
        },
      });
    } catch (error) {
      console.error("Error registering course:", error);
      res.status(500).json({ error: "Failed to register for course" });
    }
  }

  /**
   * Drop a course
   * DELETE /api/courses/drop/:courseCode
   */
  static async dropCourse(req: Request, res: Response) {
    try {
      const enrollmentNo = req.user?.enrollmentNo;
      const courseCode = req.params.courseCode as string;

      if (!enrollmentNo) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      // Check if registered
      const registration = await prisma.courseRegistration.findFirst({
        where: {
          enrollment_no: enrollmentNo,
          course_code: courseCode,
        },
        include: {
          course: true,
        },
      });

      if (!registration) {
        res.status(404).json({ error: "Not registered for this course" });
        return;
      }

      // Delete registration
      await prisma.courseRegistration.delete({
        where: {
          registration_id: registration.registration_id,
        },
      });

      res.json({
        message: `Successfully dropped ${registration.course.course_name}`,
        course: {
          course_code: registration.course.course_code,
          course_name: registration.course.course_name,
          credits: registration.course.credits,
        },
      });
    } catch (error) {
      console.error("Error dropping course:", error);
      res.status(500).json({ error: "Failed to drop course" });
    }
  }

  /**
   * Get enrolled courses
   * GET /api/courses/enrolled
   */
  static async getEnrolledCourses(req: Request, res: Response) {
    try {
      const enrollmentNo = req.user?.enrollmentNo;

      if (!enrollmentNo) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const registrations = await prisma.courseRegistration.findMany({
        where: { enrollment_no: enrollmentNo },
        include: {
          course: {
            include: {
              schedules: true,
            },
          },
        },
        orderBy: {
          registered_at: "desc",
        },
      });

      const totalCredits = await calculateCurrentCredits(enrollmentNo);

      const courses = registrations.map((reg) => ({
        course_code: reg.course.course_code,
        course_name: reg.course.course_name,
        credits: reg.course.credits,
        course_type: reg.course.course_type,
        is_elective: reg.course.is_elective,
        registration_type: reg.registration_type,
        is_approved: reg.is_approved,
        registered_at: reg.registered_at,
        schedule: reg.course.schedules.map((s) => ({
          day: s.day_of_week,
          start_time: s.start_time,
          end_time: s.end_time,
        })),
      }));

      res.json({
        courses,
        total_courses: courses.length,
        total_credits: totalCredits,
      });
    } catch (error) {
      console.error("Error fetching enrolled courses:", error);
      res.status(500).json({ error: "Failed to fetch enrolled courses" });
    }
  }
}
