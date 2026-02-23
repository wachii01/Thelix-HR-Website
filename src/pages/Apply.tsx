import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { mockJobs } from '../data/mockData';
import { ArrowLeft, CheckCircle2, UploadCloud } from 'lucide-react';
import { motion } from 'motion/react';

export default function Apply() {
  const { id } = useParams();
  const navigate = useNavigate();
  const job = mockJobs.find(j => j.id === id);
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    phone: '',
    resume: null as File | null,
    coverLetter: ''
  });

  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Job Not Found</h2>
        <Link to="/jobs" className="text-primary hover:underline font-mono">Return to Job Board</Link>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    setTimeout(() => {
      setIsSubmitted(true);
    }, 1000);
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
                  <label htmlFor="name" className="block text-sm font-bold text-slate-700">Full Name *</label>
                  <input 
                    type="text" 
                    id="name" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-white/50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-sm transition-all"
                    placeholder="Jane Doe"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-bold text-slate-700">Email Address *</label>
                  <input 
                    type="email" 
                    id="email" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-white/50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-sm transition-all"
                    placeholder="jane@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className="block text-sm font-bold text-slate-700">Phone Number</label>
                <input 
                  type="tel" 
                  id="phone" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-white/50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-sm transition-all"
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">Resume / CV *</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-xl hover:border-primary/50 hover:bg-white/40 transition-all cursor-pointer bg-white/20">
                  <div className="space-y-1 text-center">
                    <UploadCloud className="mx-auto h-12 w-12 text-slate-400" />
                    <div className="flex text-sm text-slate-600 font-mono justify-center">
                      <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none">
                        <span>Upload a file</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" required />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-slate-500 font-mono">PDF, DOC, DOCX up to 10MB</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="coverLetter" className="block text-sm font-bold text-slate-700">Cover Letter (Optional)</label>
                <textarea 
                  id="coverLetter" 
                  rows={4}
                  value={formData.coverLetter}
                  onChange={(e) => setFormData({...formData, coverLetter: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-white/50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-sm transition-all resize-none"
                  placeholder="Tell us why you're a great fit for this role..."
                />
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all hover:-translate-y-0.5"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
