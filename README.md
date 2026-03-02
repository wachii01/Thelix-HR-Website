# Thelix HR - Applicant Tracking System (ATS)

Thelix HR is a modern Applicant Tracking System built to simplify and enhance the hiring process for both candidates and HR professionals. It provides a beautiful, seamless, and automated experience from job application to candidate evaluation.

## 🚀 Key Features

### For Applicants
- **Careers Page**: Browse open positions within the company.
- **Application Portal**: Apply for jobs with an easy-to-use form, including uploading resumes (stored securely).
- **Video Introductions**: Candidates can record and upload a short introductory video (up to 2 minutes) to present their skills and personality directly, giving HR a better sense of their cultural fit.
- **Confetti & Delight**: A polished UI with micro-animations and positive feedback states to give candidates a world-class experience.

### For HR Professionals
- **Secure HR Dashboard**: Protected by Supabase Authentication, ensuring only authorized personnel can access candidate data.
- **Real-Time Updates**: Instantly see new applications appear on the dashboard the moment they are submitted without refreshing the page, powered by Supabase Realtime subscriptions.
- **AI Talent Metrics**: View automated Resume Fit Scores (`cv_score`) and Technical Proficiency (`tcc_score`) for rapid screening.
- **Rich Candidate Profiles**: Click on any applicant to view their cover letter, download their resume, review their AI summary, and **watch their introductory video** directly from within the dashboard.

## 🛠 Tech Stack

Thelix HR is built with a cutting-edge, modern web stack aimed at high performance, rich UI, and rapid development:

- **Frontend Core**: [React 18](https://react.dev/) powered by [Vite](https://vitejs.dev/) for lightning-fast HMR and optimized builds.
- **Styling & UI**: [Tailwind CSS](https://tailwindcss.com/) for utility-first styling, enabling custom glassmorphism effects and modern premium aesthetics.
- **Icons**: [Lucide React](https://lucide.dev/) for crisp, consistent vector iconography.
- **Animations**: [Framer Motion](https://www.framer.com/motion/) (`motion/react`) for fluid page transitions, hover states, and modal animations.
- **Backend Service (BaaS)**: [Supabase](https://supabase.com/)
  - **Database**: PostgreSQL for securely housing applicant data.
  - **Storage**: Highly scalable S3-compatible buckets (`Resumes` and `Videos`) for handling candidate uploads.
  - **Realtime**: WebSockets for live applicant tracking.
  - **Auth**: Secure JWT-based authentication for the HR Dashboard.
- **Workflow Automation**: [n8n](https://n8n.io/) Webhooks and Edge Functions for triggering background tasks upon application or video submission (e.g., AI scoring, email notifications, lead routing).

## ⚙️ Setup & Local Development

### Prerequisites
- Node.js (v18+ recommended)
- A Supabase Project (with `applicants` table and `Resumes`/`Videos` storage buckets configured).

### 1. Installation

Clone the repository and install dependencies:

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory based on `.env.example`. You will need to provide your Supabase URL and Anon Key.

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Run the Development Server

Start the Vite development server:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

## 📦 Deployment

The application is fully optimized for production. To build the project, run:

```bash
npm run build
```

This will generate a highly optimized `dist/` directory that can be statically hosted on platforms like Vercel, Netlify, or Cloudflare Pages.
