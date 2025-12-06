✅ MERN App – Complete Feature List
1️⃣ Authentication & User Management

Signup / Login

JWT authentication

Forgot password (email OTP or link)

User roles: Job Seeker, Recruiter, Admin

Basic user profile management

2️⃣ Job Seeker Onboarding

Gmail ID input

Gmail App Password (encrypted)

Skills (multi-select)

Experience summary (text)

Resume upload (PDF → S3/Supabase)

Preview + Save onboarding data

3️⃣ Job Seeker Dashboard

Overview section (stats)

Jobs listing

Filters: skill, location, company

Job detail page

Cold Email Automation tab

My Account → edit:

Gmail + app password

Resume

Skills

Experience

4️⃣ Recruiter Features

Recruiter signup/login

Post new job (form)

View all posted jobs

Edit/delete jobs

View matched candidates (basic skill-overlap logic)

Candidate details page

5️⃣ Cold Email Automation (Core MVP)

One email template with placeholders:

{{recruiter_name}}

{{job_role}}

{{company_name}}

Template editor (basic rich-text)

Auto-fill dynamic fields per recipient

Send emails via Gmail SMTP

Attach resume automatically

Show sending progress

Logs for each email:

sent / failed

timestamp

recruiter email

6️⃣ Email Sending Rules

Daily limit: 20 emails/day

Reset logic every 24 hours

Track:

emails_sent_today

last_reset_date

7️⃣ Subscription System (₹500/month)

Razorpay checkout

Subscription activation screen

Save subscription status + expiry in DB

Restrict cold-email features unless subscribed

Show subscription status in dashboard

8️⃣ Email Logs & Tracking

Table view of sent emails

Status (sent/failed)

Time sent

Recipient email

Filter by date & status

9️⃣ Internal Recruiter Database (MERN-managed)

Built-in DB of recruiter contacts (added manually or from admin)

Job seekers can select:

Recruiters connected to jobs

Extra recruiters stored in DB

Merge recruiter data with template fields

🔟 AI Features (Inside MERN App)
AI Resume Analyzer

Upload resume → extract:

skills

experience summary

projects

Option to auto-fill onboarding form

AI Email Personalization

Rewrite base template for:

tone

company name

recruiter info

Generate improved subject line

AI Matching Score

Job + user profile → 0–100 match score

Used on job list & recruiter match view

1️⃣1️⃣ Admin Dashboard (MERN App Only)
Admin user can:

View all users (seekers & recruiters)

Ban / delete users

View jobs

View email logs across the app

Manually add recruiter contacts

View daily email sending volume

Update global settings:

daily email limit

system availability toggle

1️⃣2️⃣ System & Infrastructure Managed in MERN

BullMQ or simple Node Cron worker for:

daily quota reset

scheduled follow-up emails (if added later)

Secure encryption for Gmail app passwords

Rate limiting (per user & global)

Error logging (Sentry optional)

1️⃣3️⃣ General UI & Usability Features

Fully responsive UI

Sidebar navigation

Dark mode (optional)

User notifications (toast)

Modals & confirmations

Loading skeletons

1️⃣4️⃣ Optional but Easy MERN Add-ons

(These require no external scrapers, still inside MERN)

Saved recruiters list

Saved jobs

Follow-up reminder (manual)

Multi-email template support

Chat/support widget

Activity timeline (emails sent, jobs viewed)