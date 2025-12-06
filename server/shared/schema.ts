import { pgTable, serial, text, varchar, timestamp, integer, boolean, date, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: varchar("role", { length: 20 }).notNull().default("seeker"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull().unique(),
  name: varchar("name", { length: 255 }),
  skills: jsonb("skills").$type<string[]>().default([]),
  experience: text("experience"),
  gmailId: varchar("gmail_id", { length: 255 }),
  gmailAppPassword: text("gmail_app_password"),
  resumeUrl: text("resume_url"),
  dailyEmailSentCount: integer("daily_email_sent_count").default(0),
  lastEmailResetDate: date("last_email_reset_date"),
  subscriptionStatus: varchar("subscription_status", { length: 20 }).default("inactive"),
  subscriptionExpiry: timestamp("subscription_expiry"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const recruiters = pgTable("recruiters", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull().unique(),
  companyName: varchar("company_name", { length: 255 }),
  recruiterName: varchar("recruiter_name", { length: 255 }),
  recruiterEmail: varchar("recruiter_email", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  recruiterId: integer("recruiter_id").references(() => recruiters.id).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  requiredSkills: jsonb("required_skills").$type<string[]>().default([]),
  location: varchar("location", { length: 255 }),
  salary: varchar("salary", { length: 100 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const coldEmailLogs = pgTable("cold_email_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  recruiterEmail: varchar("recruiter_email", { length: 255 }).notNull(),
  jobId: integer("job_id").references(() => jobs.id),
  status: varchar("status", { length: 20 }).notNull().default("sent"),
  errorMessage: text("error_message"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  planName: varchar("plan_name", { length: 100 }).notNull(),
  amount: integer("amount").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("active"),
  startDate: timestamp("start_date").defaultNow().notNull(),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(userProfiles, {
    fields: [users.id],
    references: [userProfiles.userId],
  }),
  recruiter: one(recruiters, {
    fields: [users.id],
    references: [recruiters.userId],
  }),
  coldEmailLogs: many(coldEmailLogs),
  subscriptions: many(subscriptions),
}));

export const recruitersRelations = relations(recruiters, ({ one, many }) => ({
  user: one(users, {
    fields: [recruiters.userId],
    references: [users.id],
  }),
  jobs: many(jobs),
}));

export const jobsRelations = relations(jobs, ({ one, many }) => ({
  recruiter: one(recruiters, {
    fields: [jobs.recruiterId],
    references: [recruiters.id],
  }),
  emailLogs: many(coldEmailLogs),
}));

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = typeof userProfiles.$inferInsert;
export type Recruiter = typeof recruiters.$inferSelect;
export type InsertRecruiter = typeof recruiters.$inferInsert;
export type Job = typeof jobs.$inferSelect;
export type InsertJob = typeof jobs.$inferInsert;
export type ColdEmailLog = typeof coldEmailLogs.$inferSelect;
export type InsertColdEmailLog = typeof coldEmailLogs.$inferInsert;
export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;
