import { z } from "zod";

export const scheduleItemSchema = z.object({
  day: z.string().min(1, "Day is required"),
  start: z.number().min(0).max(24),
  end: z.number().min(0).max(24),
  title: z.string().min(1, "Title is required"),
  room: z.string().optional(),
  color: z.string().optional(),
});

export const scheduleArraySchema = z.array(scheduleItemSchema);

export const customSizeSchema = z.object({
  width: z.number().min(200, "Width must be at least 200px").max(8000, "Width cannot exceed 8000px"),
  height: z.number().min(200, "Height must be at least 200px").max(8000, "Height cannot exceed 8000px"),
});

export const studentLoginSchema = z.object({
  studentId: z.string().min(6, "Student ID must be at least 6 characters"),
  verificationCode: z.string().min(4, "Verification code must be at least 4 digits"),
});

export const adminLoginSchema = z.object({
  email: z.string().email("Invalid admin email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type CustomSizeValues = z.infer<typeof customSizeSchema>;
export type StudentLoginValues = z.infer<typeof studentLoginSchema>;
export type AdminLoginValues = z.infer<typeof adminLoginSchema>;
