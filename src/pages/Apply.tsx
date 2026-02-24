import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import type { Job } from '../data/mockData';
import { ArrowLeft, CheckCircle2, UploadCloud, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function Apply() {
  const { id } = useParams();
  const [job, setJob] = React.useState<Job | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [formData, setFormData] = React.useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    cvLink: '',
    coverLetter: ''
  });

  React.useEffect(() => {
    fetchJob();
  }, [id]);

  const fetchJob = async () => {
    if (!id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching job:', error);
      setJob(null);
    } else {
      setJob(data);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Job Not Found</h2>
        <Link to="/jobs" className="text-primary hover:underline font-mono">Return to Job Board</Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const { error } = await supabase.from('applicants').insert({
      job_id: job.id,
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      cv_link: formData.cvLink,
      cover_letter: formData.coverLetter,
      position: job.title,
      status: 'New',
      date_applied: new Date().toISOString().split('T')[0],
    });

    if (error) {
      console.error('Error submitting application:', error);
      alert('There was an error submitting your application. Please try again.');
    } else {
      setIsSubmitted(true);
    }
    setSubmitting(false);
  };

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto px-4 py-24 text-center"
      >
        <div className="glass-panel p-12 rounded-3xl flex flex-col items-center shadow-xl shadow-primary/10">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Application Submitted!</h2>
          <p className="text-slate-600 font-mono mb-8 max-w-md">
            Thank you for applying to the <span className="font-semibold text-slate-900">{job.title}</span> position. Our team will review your application and get back to you soon.
          </p>
          <Link
            to="/jobs"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-slate-900 text-white font-medium hover:bg-primary transition-all shadow-lg hover:-translate-y-0.5"
          >
            Back to Jobs
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <Link
        to="/jobs"
        className="inline-flex items-center gap-2 text-slate-500 hover:text-primary font-mono text-sm mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to all jobs
      </Link>

      <div className="grid md:grid-cols-3 gap-12">
        {/* Job Details */}
        <div className="md:col-span-1 space-y-8">
          <div>
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-mono text-xs font-semibold uppercase tracking-wider mb-4 inline-block">
              {job.department}
            </span>
            <h1 className="text-3xl font-bold text-slate-900 mb-4 leading-tight">{job.title}</h1>
            <div className="flex flex-col gap-2 text-slate-600 font-mono text-sm">
              <span>📍 {job.location}</span>
              <span>💼 {job.type}</span>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-3">About the Role</h3>
            <p className="text-slate-600 font-mono text-sm leading-relaxed">
              {job.description}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-3">Requirements</h3>
            <ul className="list-disc list-inside space-y-2 text-slate-600 font-mono text-sm">
              {job.requirements.map((req, i) => (
                <li key={i} className="leading-relaxed">{req}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Application Form */}
        <div className="md:col-span-2">
          <div className="glass-card p-8 rounded-3xl shadow-xl shadow-slate-200/50 border-white/60">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Submit your application</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="block text-sm font-bold text-slate-700">First Name *</label>
                  <input
                    type="text"
                    id="firstName"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-sm transition-all"
                    placeholder="Jane"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="lastName" className="block text-sm font-bold text-slate-700">Last Name *</label>
                  <input
                    type="text"
                    id="lastName"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-sm transition-all"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-bold text-slate-700">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-sm transition-all"
                    placeholder="jane@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="phone" className="block text-sm font-bold text-slate-700">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-sm transition-all"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="cvLink" className="block text-sm font-bold text-slate-700">CV / Resume Link *</label>
                <input
                  type="url"
                  id="cvLink"
                  required
                  value={formData.cvLink}
                  onChange={(e) => setFormData({ ...formData, cvLink: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-sm transition-all"
                  placeholder="https://drive.google.com/your-cv-link"
                />
                <p className="text-xs text-slate-500 font-mono">Upload your CV to Google Drive, Dropbox, etc. and paste the link here</p>
              </div>

              <div className="space-y-2">
                <label htmlFor="coverLetter" className="block text-sm font-bold text-slate-700">Cover Letter (Optional)</label>
                <textarea
                  id="coverLetter"
                  rows={4}
                  value={formData.coverLetter}
                  onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-sm transition-all resize-none"
                  placeholder="Tell us why you're a great fit for this role..."
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Application'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
