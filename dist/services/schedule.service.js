"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkScheduleConflict = checkScheduleConflict;
exports.getCourseSchedule = getCourseSchedule;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
/**
 * Check for schedule conflicts when registering a new course
 */
async function checkScheduleConflict(enrollmentNo, newCourseCode) {
    try {
        // Get student's currently registered courses
        const registrations = await prisma.courseRegistration.findMany({
            where: {
                enrollment_no: enrollmentNo,
            },
            include: {
                course: {
                    include: {
                        schedules: true,
                    },
                },
            },
        });
        // Get schedule for new course
        const newCourseSchedules = await prisma.courseSchedule.findMany({
            where: {
                course_code: newCourseCode,
            },
        });
        // If no schedules defined, no conflict
        if (newCourseSchedules.length === 0) {
            return { conflict: false };
        }
        // Check each registered course for conflicts
        for (const registration of registrations) {
            const existingSchedules = registration.course.schedules;
            for (const newSchedule of newCourseSchedules) {
                for (const existingSchedule of existingSchedules) {
                    // Check if same day
                    if (newSchedule.day_of_week === existingSchedule.day_of_week &&
                        newSchedule.start_time &&
                        newSchedule.end_time &&
                        existingSchedule.start_time &&
                        existingSchedule.end_time) {
                        // Check for time overlap
                        const conflict = checkTimeOverlap(newSchedule.start_time, newSchedule.end_time, existingSchedule.start_time, existingSchedule.end_time);
                        if (conflict) {
                            return {
                                conflict: true,
                                conflictingCourse: {
                                    course_code: registration.course.course_code,
                                    course_name: registration.course.course_name,
                                    day: existingSchedule.day_of_week || "",
                                    time: `${formatTime(existingSchedule.start_time)}-${formatTime(existingSchedule.end_time)}`,
                                },
                                message: `Schedule conflict with ${registration.course.course_code} on ${existingSchedule.day_of_week}`,
                            };
                        }
                    }
                }
            }
        }
        return { conflict: false };
    }
    catch (error) {
        console.error("Error checking schedule conflict:", error);
        throw new Error("Failed to check schedule conflict");
    }
}
/**
 * Check if two time ranges overlap
 */
function checkTimeOverlap(start1, end1, start2, end2) {
    const s1 = start1.getTime();
    const e1 = end1.getTime();
    const s2 = start2.getTime();
    const e2 = end2.getTime();
    // Check if ranges overlap
    return s1 < e2 && s2 < e1;
}
/**
 * Format time for display
 */
function formatTime(date) {
    return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });
}
/**
 * Get schedule for a course
 */
async function getCourseSchedule(courseCode) {
    try {
        return await prisma.courseSchedule.findMany({
            where: { course_code: courseCode },
        });
    }
    catch (error) {
        console.error("Error fetching course schedule:", error);
        throw new Error("Failed to fetch course schedule");
    }
}
