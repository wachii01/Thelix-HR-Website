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
    experience: 'Less than 1 yr',
    coverLetter: ''
  });
  const [cvFile, setCvFile] = React.useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = React.useState(0);

  const experienceOptions = [
    'Less than 1 yr', '1 year', '2 years', '3 years', '4 years', '5 years', 'More than 5 years'
  ];

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
    if (!cvFile) {
      alert('Please upload a CV/Resume.');
      return;
    }

    setSubmitting(true);
    setUploadProgress(10);

    try {
      // 1. Upload CV to Supabase bucket
      const fileExt = cvFile.name.split('.').pop();
      const fileName = `${Date.now()}_${formData.firstName}_${formData.lastName}.${fileExt}`;
      const filePath = `cvs/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('Resumes')
        .upload(filePath, cvFile, { cacheControl: '3600', upsert: false });

      if (uploadError) throw new Error(`CV Upload failed: ${uploadError.message}`);
      setUploadProgress(50);

      // 2. Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('Resumes')
        .getPublicUrl(filePath);

      setUploadProgress(70);

      // 3. Send Webhook
      try {
        const { data: webhookResponse, error: proxyError } = await supabase.functions.invoke('n8n-proxy', {
          body: {
            targetUrl: 'https://n8n.thelixholdings.com/webhook/Jobs',
            payload: {
              firstName: formData.firstName,
              lastName: formData.lastName,
              email: formData.email,
              phone: formData.phone,
              experience: formData.experience,
              coverLetter: formData.coverLetter,
              jobRole: job?.title,
              jobId: job?.id,
              cvLink: publicUrl,
              submittedAt: new Date().toISOString()
            }
          }
        });

        console.log('Webhook Response:', proxyError || webhookResponse);

        if (proxyError || !webhookResponse?.success) {
          console.warn('Webhook failed, but application succeeded', webhookResponse?.error || proxyError);
        }
      } catch (webhookErr: any) {
        console.error('Webhook fetch error:', webhookErr.message);
      }

      setUploadProgress(90);

      // 4. Save to DB
      const { error: dbError } = await supabase.from('applicants').insert({
        job_id: job?.id,
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        years_of_experience: formData.experience,
        cv_link: publicUrl,
        cover_letter: formData.coverLetter,
        position: job?.title,
        status: 'New',
        date_applied: new Date().toISOString().split('T')[0],
      });

      if (dbError) throw new Error(`Database error: ${dbError.message}`);

      setUploadProgress(100);
      setIsSubmitted(true);
    } catch (err: any) {
      console.error('Error submitting application:', err);
      alert(err.message || 'There was an error submitting your application. Please try again.');
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
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
                <label htmlFor="experience" className="block text-sm font-bold text-slate-700">Years of Experience *</label>
                <select
                  id="experience"
                  required
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-sm transition-all appearance-none"
                >
                  {experienceOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">Upload CV/Resume *</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-xl bg-white/30 hover:bg-white/50 transition-colors relative overflow-hidden group">
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div
                      className="absolute top-0 left-0 h-1 bg-primary transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  )}
                  <div className="space-y-2 text-center">
                    <UploadCloud className="mx-auto h-12 w-12 text-slate-400 group-hover:text-primary transition-colors" />
                    <div className="flex text-sm text-slate-600 font-mono justify-center">
                      <label htmlFor="cv-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none">
                        <span>Upload a file</span>
                        <input
                          id="cv-upload"
                          type="file"
                          accept=".pdf,.doc,.docx"
                          className="sr-only"
                          onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                          ref={fileInputRef}
                        />
                      </label>
                    </div>
                    <p className="text-xs text-slate-500 font-mono">PDF, DOC, DOCX up to 10MB</p>
                  </div>
                </div>
                {cvFile && (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg mt-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">{cvFile.name}</p>
                      <p className="text-xs text-slate-500 font-mono">{(cvFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                    <button type="button" onClick={() => { setCvFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} className="text-xs text-rose-500 hover:text-rose-700 font-bold">Remove</button>
                  </div>
                )}
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
