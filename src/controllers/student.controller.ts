import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class StudentController {
  /**
   * Get student dashboard data
   * GET /api/student/dashboard
   */
  static async getDashboard(req: Request, res: Response) {
    try {
      const enrollmentNo = req.user!.enrollmentNo;
      console.log("📊 Fetching dashboard for:", enrollmentNo);

      const student = await prisma.student.findUnique({
        where: { enrollment_no: enrollmentNo },
        include: { faculty: true },
      });

      if (!student) {
        res.status(404).json({ error: "Student not found" });
        return;
      }

      // Calculate earned credits from passed courses (grade records with passing grades)
      const gradeRecords = await prisma.gradeRecord.findMany({
        where: { 
          enrollment_no: enrollmentNo,
          grade: { not: null }, // Has a grade
        },
        include: { course: true },
      });

      // Calculate earned credits (grades D and above, excluding F and I)
      const passGrades = ["A+", "A", "B+", "B", "C", "D"];
      const earnedCredits = gradeRecords
        .filter(record => record.grade && passGrades.includes(record.grade))
        .reduce((sum, record) => sum + record.course.credits, 0);

      console.log(`💯 Earned credits: ${earnedCredits}`);

      // Get registered courses for current semester
      const currentYear = new Date().getFullYear();
      const currentSemesterType = student.current_semester % 2 === 0 ? 2 : 1; // Odd sem = 1, Even sem = 2

      const registeredCourses = await prisma.courseRegistration.findMany({
        where: {
          enrollment_no: enrollmentNo,
          academic_year: currentYear,
          semester_type: currentSemesterType,
        },
        include: {
          course: true,
        },
      });

      console.log(`📚 Registered courses: ${registeredCourses.length}`);

      let courses: any[] = [];

      if (registeredCourses.length > 0) {
        // Show registered courses
        courses = registeredCourses.map(reg => ({
          courseCode: reg.course.course_code,
          courseName: reg.course.course_name,
          credits: reg.course.credits,
          status: reg.is_approved ? "Approved" : "Pending",
          courseType: reg.course.course_type,
        }));
      } else {
        // Show available courses for their branch and semester
        console.log(`🔍 No registrations found, fetching available courses`);
        console.log(`   Branch Code: ${student.faculty?.branch_code}`);
        console.log(`   Current Semester: ${student.current_semester}`);
        
        // First, let's check what courses exist in the database
        const allCourses = await prisma.course.findMany({
          select: {
            course_code: true,
            course_name: true,
            branch_code: true,
            semester_no: true,
            credits: true,
          },
        });
        console.log(`📚 Total courses in DB: ${allCourses.length}`);
        
        // Log unique branch codes and semesters
        const uniqueBranches = [...new Set(allCourses.map(c => c.branch_code))];
        const uniqueSemesters = [...new Set(allCourses.map(c => c.semester_no))];
        console.log(`   Unique branches in DB: ${uniqueBranches.join(", ")}`);
        console.log(`   Unique semesters in DB: ${uniqueSemesters.join(", ")}`);
        
        const availableCourses = await prisma.course.findMany({
          where: {
            branch_code: student.faculty?.branch_code || "COBEA",
            semester_no: student.current_semester,
          },
          take: 10, // Limit to 10 courses
        });

        console.log(`📖 Available courses for branch ${student.faculty?.branch_code}, semester ${student.current_semester}: ${availableCourses.length}`);
        
        if (availableCourses.length > 0) {
          console.log(`   First course: ${availableCourses[0].course_code} - ${availableCourses[0].course_name}`);
        }

        courses = availableCourses.map(course => ({
          courseCode: course.course_code,
          courseName: course.course_name,
          credits: course.credits,
          status: "Available",
          courseType: course.course_type,
          isElective: course.is_elective,
        }));
      }

      res.json({
        name: student.name,
        email: student.email,
        enrollmentNo: student.enrollment_no,
        branch: student.faculty?.branch_name || "Computer Engineering",
        branchCode: student.faculty?.branch_code || "COBEA",
        admissionYear: student.faculty?.admission_year || 2024,
        cpi: Number(student.current_cpi) || 0.0,
        totalCredits: earnedCredits,
        currentSemester: student.current_semester,
        courses: courses,
      });

      console.log("✅ Dashboard fetched successfully");
    } catch (error) {
      console.error("❌ Dashboard error:", error);
      res.status(500).json({ error: "Failed to fetch dashboard data" });
    }
  }

  /**
   * Get student course history with grades
   * GET /api/student/course-history
   */
  static async getCourseHistory(req: Request, res: Response) {
    try {
      const enrollmentNo = req.user!.enrollmentNo;
      console.log("📚 Fetching course history for:", enrollmentNo);

      // Fetch all grade records for the student
      const gradeRecords = await prisma.gradeRecord.findMany({
        where: { enrollment_no: enrollmentNo },
        include: {
          course: true,
        },
        orderBy: [
          { academic_year: "asc" },
          { semester_type: "asc" },
        ],
      });

      console.log(`Found ${gradeRecords.length} grade records`);

      // Group by semester
      const semesterMap = new Map<string, any>();

      gradeRecords.forEach((record) => {
        const semesterKey = `${record.academic_year}-${record.semester_type}`;

        if (!semesterMap.has(semesterKey)) {
          semesterMap.set(semesterKey, {
            academicYear: record.academic_year,
            semesterType: record.semester_type,
            courses: [],
          });
        }

        semesterMap.get(semesterKey).courses.push({
          courseCode: record.course_code,
          courseName: record.course.course_name,
          credits: record.course.credits,
          grade: record.grade,
          gradePoints: Number(record.grade_points),
        });
      });

      // Convert map to array and calculate SGPA for each semester
      const semesters = Array.from(semesterMap.values()).map((sem) => {
        const totalCredits = sem.courses.reduce(
          (sum: number, c: any) => sum + c.credits,
          0
        );
        const totalGradePoints = sem.courses.reduce(
          (sum: number, c: any) => sum + c.gradePoints * c.credits,
          0
        );
        const sgpa =
          totalCredits > 0
            ? (totalGradePoints / totalCredits).toFixed(2)
            : "0.00";

        return {
          academicYear: sem.academicYear,
          semesterType: sem.semesterType,
          sgpa: parseFloat(sgpa),
          totalCredits,
          courses: sem.courses,
        };
      });

      // Calculate overall statistics
      const totalCourses = gradeRecords.length;
      const totalCredits = gradeRecords.reduce(
        (sum, r) => sum + r.course.credits,
        0
      );
      const totalGradePoints = gradeRecords.reduce(
        (sum, r) => sum + Number(r.grade_points) * r.course.credits,
        0
      );
      const cpi =
        totalCredits > 0
          ? (totalGradePoints / totalCredits).toFixed(2)
          : "0.00";

      console.log("✅ Course history fetched successfully");

      res.json({
        semesters,
        statistics: {
          totalCourses,
          totalCredits,
          cpi: parseFloat(cpi),
          totalSemesters: semesters.length,
        },
      });
    } catch (error) {
      console.error("❌ Course history error:", error);
      res.status(500).json({ error: "Failed to fetch course history" });
    }
  }
}
