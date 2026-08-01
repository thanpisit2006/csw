import { z } from "zod";

export const StudentIdSchema = z.string().min(1, "Student ID is required").max(50);

export const CourseItemSchema = z.object({
  day: z.string(),
  start: z.number(),
  end: z.number(),
  title: z.string().min(1, "Course title required"),
  room: z.string().optional(),
  color: z.string().optional(),
});

export const ScheduleSchema = z.array(CourseItemSchema);

export const AnnouncementSchema = z.object({
  message: z.string().min(1, "Announcement message required"),
  type: z.enum(["info", "warning", "holiday"]),
});
