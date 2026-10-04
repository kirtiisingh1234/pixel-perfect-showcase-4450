import { z } from "zod";

export const PROFICIENCY = ["Beginner", "Intermediate", "Advanced", "Expert"] as const;
export const SKILL_CATEGORIES = [
  "Programming",
  "Web Development",
  "Database",
  "Data Science",
  "Design",
  "Soft Skills",
  "Other",
] as const;
export const INTERNSHIP_TYPES = ["Remote", "On-site", "Hybrid"] as const;
export const INTERNSHIP_STATUS = ["Upcoming", "Ongoing", "Completed"] as const;
export const APPLICATION_STATUS = [
  "Applied",
  "Shortlisted",
  "Interview",
  "Selected",
  "Rejected",
] as const;
export const YEARS = ["FY", "SY", "TY"] as const;

const req = (label: string, max = 100) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .max(max, `${label} must be under ${max} characters`);
const optUrl = z
  .string()
  .trim()
  .max(500)
  .refine(
    (v) => v === "" || /^https?:\/\/.+/.test(v),
    "Enter a valid URL starting with http(s)://",
  );
const optDate = z.string().refine((v) => v === "" || !isNaN(Date.parse(v)), "Invalid date");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Za-z]/, "Password must contain a letter")
  .regex(/[0-9]/, "Password must contain a number");

export const registerSchema = z.object({
  full_name: req("Full name"),
  email: z.string().trim().email("Enter a valid email").max(255),
  password: passwordSchema,
  phone: z
    .string()
    .trim()
    .regex(/^[0-9]{10}$/, "Phone must be 10 digits"),
  college: req("College", 150),
  course: req("Course"),
  year: z.enum(YEARS, { errorMap: () => ({ message: "Select a year" }) }),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const profileSchema = registerSchema.omit({ email: true, password: true });

export const skillSchema = z.object({
  name: req("Skill name", 60),
  category: z.enum(SKILL_CATEGORIES),
  proficiency: z.enum(PROFICIENCY),
  progress: z.coerce
    .number({ invalid_type_error: "Progress is required" })
    .int()
    .min(0, "Minimum 0")
    .max(100, "Maximum 100"),
});

export const certificateSchema = z.object({
  name: req("Certificate name", 120),
  organization: req("Issuing organization", 120),
  issue_date: optDate,
  credential_id: z.string().trim().max(100),
  url: optUrl,
});

export const internshipSchema = z
  .object({
    company: req("Company name"),
    role: req("Role"),
    start_date: optDate,
    end_date: optDate,
    internship_type: z.enum(INTERNSHIP_TYPES),
    status: z.enum(INTERNSHIP_STATUS),
    description: z.string().trim().max(1000),
  })
  .refine((d) => !d.start_date || !d.end_date || d.end_date >= d.start_date, {
    path: ["end_date"],
    message: "End date must be after start date",
  });

export const applicationSchema = z.object({
  company: req("Company name"),
  role: req("Role"),
  applied_date: z.string().min(1, "Applied date is required"),
  status: z.enum(APPLICATION_STATUS),
  notes: z.string().trim().max(500),
});
