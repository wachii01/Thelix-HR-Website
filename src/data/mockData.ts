// TypeScript interfaces matching Supabase schema

export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
  requirements: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Applicant {
  id: string;
  job_id: string | null;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  position: string;
  cv_link: string;
  cv_score: number | null;
  cv_score_note: string | null;
  date_applied: string;
  status: string;
  last_updated: string;
  tcc_score: number | null;
  tcc_remark: string | null;
  email_draft: string | null;
  email_sent: boolean;
  email_sent_at: string | null;
  cover_letter: string | null;
  years_of_experience: string | null;
  video_url: string | null;
  video_summary: string | null;
  created_at: string;
  // Joined data
  jobs?: Job;
}
