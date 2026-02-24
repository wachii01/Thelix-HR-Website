import React from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/AuthContext';
import type { Applicant, Job } from '../data/mockData';
import {
  Search, Download, User, Briefcase, Calendar, CheckCircle2, XCircle, Clock,
  Send, ExternalLink, LogOut, Loader2, FileText, Star, MessageSquare,
  AlertCircle, X, Phone, Mail, Plus, Pencil, Trash2, ToggleLeft, ToggleRight,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const WEBHOOK_URL = import.meta.env.DEV
  ? '/api/webhook/send-email'       // proxied through Vite dev server to bypass CORS
  : 'https://n8n.thelixholdings.com/webhook/send-email'; // direct in production

/* ───────── Toast Component ───────── */
function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  React.useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className={`fixed bottom-6 right-6 z-[60] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl font-mono text-sm font-semibold border ${type === 'success'
        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
        : 'bg-rose-50 text-rose-700 border-rose-200'
        }`}
    >
      {type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
      {message}
    </motion.div>
  );
}

/* ───────── Main Dashboard ───────── */
export default function HRDashboard() {
  const { signOut } = useAuth();

  // Tab state
  const [activeTab, setActiveTab] = React.useState<'applicants' | 'jobs'>('applicants');

  // Toast
  const [toast, setToast] = React.useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const showToast = (message: string, type: 'success' | 'error' = 'success') => setToast({ message, type });

  /* ═══════ APPLICANTS STATE ═══════ */
  const [applicants, setApplicants] = React.useState<Applicant[]>([]);
  const [loadingApplicants, setLoadingApplicants] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('All');
  const [sendingEmail, setSendingEmail] = React.useState<string | null>(null);
  const [selectedApplicant, setSelectedApplicant] = React.useState<Applicant | null>(null);
  const [editingDraft, setEditingDraft] = React.useState('');
  const [savingDraft, setSavingDraft] = React.useState(false);

  const statuses = ['All', 'New', 'Qualified', 'Reviewing', 'Interviewed', 'Offered', 'Rejected'];

  /* ═══════ JOBS STATE ═══════ */
  const [jobs, setJobs] = React.useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = React.useState(true);
  const [showJobForm, setShowJobForm] = React.useState(false);
  const [editingJob, setEditingJob] = React.useState<Job | null>(null);
  const [savingJob, setSavingJob] = React.useState(false);
  const [jobForm, setJobForm] = React.useState({
    title: '',
    department: '',
    location: '',
    type: 'Full-time',
    description: '',
    requirements: '',
    is_active: true,
  });

  /* ═══════ EFFECTS ═══════ */
  React.useEffect(() => { fetchApplicants(); fetchJobs(); }, []);

  React.useEffect(() => {
    if (selectedApplicant) setEditingDraft(selectedApplicant.email_draft || '');
  }, [selectedApplicant]);

  /* ═══════ APPLICANT FUNCTIONS ═══════ */
  const fetchApplicants = async () => {
    setLoadingApplicants(true);
    const { data, error } = await supabase
      .from('applicants')
      .select('*, jobs(title, department)')
      .order('date_applied', { ascending: false });
    if (error) { console.error(error); showToast('Failed to load applicants', 'error'); }
    else setApplicants(data || []);
    setLoadingApplicants(false);
  };

  const handleStatusChange = async (applicantId: string, newStatus: string) => {
    const { error } = await supabase.from('applicants').update({ status: newStatus }).eq('id', applicantId);
    if (error) { console.error(error); showToast('Failed to update status', 'error'); }
    else {
      setApplicants(prev => prev.map(a => a.id === applicantId ? { ...a, status: newStatus } : a));
      if (selectedApplicant?.id === applicantId) setSelectedApplicant(prev => prev ? { ...prev, status: newStatus } : null);
      showToast('Status updated');
    }
  };

  const handleSaveDraft = async () => {
    if (!selectedApplicant) return;
    setSavingDraft(true);
    const { error } = await supabase.from('applicants').update({ email_draft: editingDraft }).eq('id', selectedApplicant.id);
    if (error) {
      console.error('Save draft error:', error);
      showToast('Failed to save draft: ' + error.message, 'error');
    } else {
      setApplicants(prev => prev.map(a => a.id === selectedApplicant.id ? { ...a, email_draft: editingDraft } : a));
      setSelectedApplicant(prev => prev ? { ...prev, email_draft: editingDraft } : null);
      showToast('Draft saved successfully');
    }
    setSavingDraft(false);
  };

  const handleSendEmail = async (applicant: Applicant) => {
    setSendingEmail(applicant.id);
    try {
      const draftToSend = selectedApplicant?.id === applicant.id ? editingDraft : applicant.email_draft;
      if (selectedApplicant?.id === applicant.id && editingDraft !== applicant.email_draft) {
        await supabase.from('applicants').update({ email_draft: editingDraft }).eq('id', applicant.id);
      }
      const params = new URLSearchParams({
        recordId: applicant.id,
        firstName: applicant.first_name,
        lastName: applicant.last_name,
        email: applicant.email,
        position: applicant.position || '',
        emailDraft: draftToSend || '',
        cvScore: String(applicant.cv_score ?? ''),
        tccScore: String(applicant.tcc_score ?? ''),
        status: applicant.status,
      });
      const response = await fetch(`${WEBHOOK_URL}?${params.toString()}`);
      if (response.ok) {
        await supabase.from('applicants')
          .update({ email_sent: true, email_sent_at: new Date().toISOString(), email_draft: draftToSend })
          .eq('id', applicant.id);
        const updated = { ...applicant, email_sent: true, email_sent_at: new Date().toISOString(), email_draft: draftToSend || applicant.email_draft };
        setApplicants(prev => prev.map(a => a.id === applicant.id ? updated : a));
        if (selectedApplicant?.id === applicant.id) setSelectedApplicant(updated);
        showToast('Email sent successfully');
      } else {
        const errText = await response.text();
        console.error('Webhook response:', response.status, errText);
        showToast(`Webhook error (${response.status}): ${errText || 'Unknown error'}`, 'error');
      }
    } catch (err) {
      console.error('Webhook error:', err);
      showToast('Failed to reach webhook', 'error');
    }
    setSendingEmail(null);
  };

  /* ═══════ JOBS FUNCTIONS ═══════ */
  const fetchJobs = async () => {
    setLoadingJobs(true);
    const { data, error } = await supabase.from('jobs').select('*').order('created_at', { ascending: false });
    if (error) { console.error(error); showToast('Failed to load jobs', 'error'); }
    else setJobs((data || []) as Job[]);
    setLoadingJobs(false);
  };

  const openJobForm = (job?: Job) => {
    if (job) {
      setEditingJob(job);
      setJobForm({
        title: job.title,
        department: job.department,
        location: job.location,
        type: job.type,
        description: job.description,
        requirements: (job.requirements || []).join('\n'),
        is_active: job.is_active,
      });
    } else {
      setEditingJob(null);
      setJobForm({ title: '', department: '', location: '', type: 'Full-time', description: '', requirements: '', is_active: true });
    }
    setShowJobForm(true);
  };

  const handleSaveJob = async () => {
    setSavingJob(true);
    const payload = {
      title: jobForm.title,
      department: jobForm.department,
      location: jobForm.location,
      type: jobForm.type,
      description: jobForm.description,
      requirements: jobForm.requirements.split('\n').map(r => r.trim()).filter(Boolean),
      is_active: jobForm.is_active,
      updated_at: new Date().toISOString(),
    };

    if (editingJob) {
      const { error } = await supabase.from('jobs').update(payload).eq('id', editingJob.id);
      if (error) { showToast('Failed to update job: ' + error.message, 'error'); }
      else { showToast('Job updated successfully'); setShowJobForm(false); fetchJobs(); }
    } else {
      const { error } = await supabase.from('jobs').insert(payload);
      if (error) { showToast('Failed to create job: ' + error.message, 'error'); }
      else { showToast('Job created successfully'); setShowJobForm(false); fetchJobs(); }
    }
    setSavingJob(false);
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    const { error } = await supabase.from('jobs').delete().eq('id', jobId);
    if (error) showToast('Failed to delete job: ' + error.message, 'error');
    else { showToast('Job deleted'); fetchJobs(); }
  };

  const handleToggleJob = async (job: Job) => {
    const { error } = await supabase.from('jobs').update({ is_active: !job.is_active }).eq('id', job.id);
    if (error) showToast('Failed to toggle job', 'error');
    else { showToast(job.is_active ? 'Job deactivated' : 'Job activated'); fetchJobs(); }
  };

  /* ═══════ HELPERS ═══════ */
  const filteredApplicants = applicants.filter(app => {
    const matchesSearch =
      `${app.first_name} ${app.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.position || '').toLowerCase().includes(searchTerm.toLowerCase());
    return (statusFilter === 'All' || app.status === statusFilter) && matchesSearch;
  });

  const getStatusColor = (s: string) => {
    const map: Record<string, string> = {
      New: 'bg-blue-100 text-blue-700 border-blue-200',
      Qualified: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      Reviewing: 'bg-amber-100 text-amber-700 border-amber-200',
      Interviewed: 'bg-purple-100 text-purple-700 border-purple-200',
      Offered: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      Rejected: 'bg-rose-100 text-rose-700 border-rose-200',
    };
    return map[s] || 'bg-slate-100 text-slate-700 border-slate-200';
  };
  const getStatusIcon = (s: string) => {
    const map: Record<string, React.ReactNode> = {
      New: <User className="w-3 h-3" />, Qualified: <CheckCircle2 className="w-3 h-3" />,
      Reviewing: <Clock className="w-3 h-3" />, Interviewed: <Briefcase className="w-3 h-3" />,
      Offered: <CheckCircle2 className="w-3 h-3" />, Rejected: <XCircle className="w-3 h-3" />,
    };
    return map[s] || <User className="w-3 h-3" />;
  };
  const getCvScoreColor = (score: number | null) => score === null ? 'text-slate-400' : score >= 5 ? 'text-emerald-600' : 'text-rose-600';
  const getTccScoreColor = (score: number | null) => score === null ? 'text-slate-400' : score >= 50 ? 'text-emerald-600' : 'text-rose-600';

  /* ═══════ RENDER ═══════ */
  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">HR Dashboard</h1>
          <p className="text-slate-500 font-mono text-sm">Manage applicants and job postings</p>
        </div>
        <button onClick={signOut} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-50 text-rose-600 font-medium hover:bg-rose-100 transition-all font-mono text-sm shadow-sm border border-rose-100">
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 bg-slate-100 p-1 rounded-2xl w-fit">
        <button onClick={() => setActiveTab('applicants')} className={`px-6 py-2.5 rounded-xl font-mono text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'applicants' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
          <User className="w-4 h-4" /> Applicants
        </button>
        <button onClick={() => setActiveTab('jobs')} className={`px-6 py-2.5 rounded-xl font-mono text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'jobs' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
          <Briefcase className="w-4 h-4" /> Job Postings
        </button>
      </div>

      {/* ═══════ APPLICANTS TAB ═══════ */}
      {activeTab === 'applicants' && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {[
              { label: 'Total', value: applicants.length, color: 'text-primary' },
              { label: 'New', value: applicants.filter(a => a.status === 'New').length, color: 'text-blue-600' },
              { label: 'Qualified', value: applicants.filter(a => a.status === 'Qualified').length, color: 'text-emerald-600' },
              { label: 'In Review', value: applicants.filter(a => a.status === 'Reviewing').length, color: 'text-amber-600' },
              { label: 'Interviewed', value: applicants.filter(a => a.status === 'Interviewed').length, color: 'text-purple-600' }
            ].map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.1 }} className="glass-card p-5 rounded-2xl border-white/60">
                <p className="text-slate-500 font-mono text-xs mb-1">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Filters */}
          <div className="glass-panel p-4 rounded-2xl mb-8 flex flex-col md:flex-row gap-4 shadow-sm border-white/60">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input type="text" placeholder="Search by name, email, or position..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-sm transition-all" />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
              {statuses.map(s => (
                <button key={s} onClick={() => setStatusFilter(s)} className={`px-4 py-2 rounded-xl font-mono text-sm whitespace-nowrap transition-all flex items-center gap-2 ${statusFilter === s ? 'bg-slate-900 text-white shadow-md' : 'bg-white/50 text-slate-600 hover:bg-white/80 border border-slate-200'}`}>
                  {s !== 'All' && getStatusIcon(s)}{s}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          {loadingApplicants ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : (
            <div className="glass-card rounded-2xl overflow-hidden border-white/60 shadow-lg shadow-slate-200/50">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200/50 bg-white/40">
                      <th className="px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Applicant</th>
                      <th className="px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Position</th>
                      <th className="px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Date</th>
                      <th className="px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">CV</th>
                      <th className="px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">TCC</th>
                      <th className="px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Status</th>
                      <th className="px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider font-mono text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/50">
                    {filteredApplicants.map((app, idx) => (
                      <motion.tr key={app.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15, delay: idx * 0.02 }}
                        className="hover:bg-white/40 transition-colors cursor-pointer" onClick={() => setSelectedApplicant(app)}>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shadow-inner text-sm">{app.first_name.charAt(0)}{app.last_name.charAt(0)}</div>
                            <div className="ml-3">
                              <div className="text-sm font-bold text-slate-900">{app.first_name} {app.last_name}</div>
                              <div className="text-xs text-slate-500 font-mono">{app.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-900 font-medium">{app.position || '-'}</div>
                          {app.jobs && <div className="text-xs text-slate-500 font-mono">{(app.jobs as any).department}</div>}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-600 font-mono flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {app.date_applied ? new Date(app.date_applied).toLocaleDateString() : '-'}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Star className={`w-3.5 h-3.5 ${getCvScoreColor(app.cv_score)}`} />
                            <span className={`text-sm font-bold font-mono ${getCvScoreColor(app.cv_score)}`}>{app.cv_score ?? '-'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`text-sm font-bold font-mono ${getTccScoreColor(app.tcc_score)}`}>{app.tcc_score ?? '-'}</span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <select value={app.status} onChange={e => { e.stopPropagation(); handleStatusChange(app.id, e.target.value); }} onClick={e => e.stopPropagation()}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-full border ${getStatusColor(app.status)} font-mono appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30`}>
                            {statuses.filter(s => s !== 'All').map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-2">
                            {app.cv_link && (
                              <a href={app.cv_link} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="p-2 rounded-lg text-slate-500 hover:text-primary hover:bg-primary/5 transition-colors" title="View CV"><ExternalLink className="w-4 h-4" /></a>
                            )}
                            <button onClick={e => { e.stopPropagation(); handleSendEmail(app); }} disabled={sendingEmail === app.id || app.email_sent}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs font-semibold transition-all ${app.email_sent ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-default' : 'bg-primary text-white hover:bg-primary/90 shadow-sm hover:shadow-md'} disabled:opacity-50`}
                              title={app.email_sent ? `Sent ${app.email_sent_at ? new Date(app.email_sent_at).toLocaleString() : ''}` : 'Send email'}>
                              {sendingEmail === app.id ? <Loader2 className="w-3 h-3 animate-spin" /> : app.email_sent ? <CheckCircle2 className="w-3 h-3" /> : <Send className="w-3 h-3" />}
                              {app.email_sent ? 'Sent' : 'Send'}
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                    {filteredApplicants.length === 0 && (
                      <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-500 font-mono"><AlertCircle className="w-8 h-8 mx-auto mb-3 text-slate-300" />No applicants found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* ═══════ JOBS TAB ═══════ */}
      {activeTab === 'jobs' && (
        <>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold text-slate-900">Manage Job Postings</h2>
            <button onClick={() => openJobForm()} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-mono text-sm font-semibold hover:bg-primary/90 shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5">
              <Plus className="w-4 h-4" /> New Job
            </button>
          </div>

          {loadingJobs ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : jobs.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center">
              <Briefcase className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <p className="text-slate-500 font-mono text-sm mb-4">No job postings yet</p>
              <button onClick={() => openJobForm()} className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-white font-mono text-sm font-semibold hover:bg-primary/90 transition-all">
                <Plus className="w-4 h-4" /> Create First Job
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {jobs.map(job => (
                <motion.div key={job.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="glass-card rounded-2xl p-6 border-white/60 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-slate-900 truncate">{job.title}</h3>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full font-mono ${job.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                          {job.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm text-slate-500 font-mono">
                        <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" /> {job.department}</span>
                        <span>•</span>
                        <span>{job.location}</span>
                        <span>•</span>
                        <span>{job.type}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(job.created_at).toLocaleDateString()}</span>
                      </div>
                      {job.description && <p className="text-sm text-slate-600 mt-3 line-clamp-2">{job.description}</p>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => handleToggleJob(job)} className={`p-2 rounded-lg transition-colors ${job.is_active ? 'text-emerald-600 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-50'}`} title={job.is_active ? 'Deactivate' : 'Activate'}>
                        {job.is_active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                      </button>
                      <button onClick={() => openJobForm(job)} className="p-2 rounded-lg text-slate-500 hover:text-primary hover:bg-primary/5 transition-colors" title="Edit"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDeleteJob(job.id)} className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ═══════ CANDIDATE DETAIL MODAL ═══════ */}
      <AnimatePresence>
        {selectedApplicant && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md" onClick={() => setSelectedApplicant(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 30 }} transition={{ duration: 0.3, ease: 'easeOut' }}
              className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-hidden border border-white/60" onClick={e => e.stopPropagation()}>

              {/* ── Premium Header ── */}
              <div className="relative bg-gradient-to-r from-primary via-primary/90 to-primary px-8 py-7 overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
                <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-y-1/2"></div>
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-black/20 border border-white/20">
                      {selectedApplicant.first_name.charAt(0)}{selectedApplicant.last_name.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white tracking-tight">{selectedApplicant.first_name} {selectedApplicant.last_name}</h2>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-white/60 text-sm font-mono">{selectedApplicant.position || 'No position'}</span>
                        <span className="text-white/30">&bull;</span>
                        <select value={selectedApplicant.status} onChange={e => handleStatusChange(selectedApplicant.id, e.target.value)}
                          className={`px-3 py-1 text-xs font-semibold rounded-full border cursor-pointer focus:outline-none ${getStatusColor(selectedApplicant.status)} font-mono`}>
                          {statuses.filter(s => s !== 'All').map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setSelectedApplicant(null)} className="p-2.5 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-all duration-200">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* ── Body ── */}
              <div className="overflow-y-auto max-h-[calc(92vh-120px)]">
                <div className="p-8">
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

                    {/* ── Left Column (3/5) ── */}
                    <div className="lg:col-span-3 space-y-6">

                      {/* Contact Card */}
                      <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono mb-4 flex items-center gap-2">
                          <User className="w-3.5 h-3.5" /> Contact Information
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-100">
                            <div className="p-2 rounded-lg bg-primary/10"><Mail className="w-4 h-4 text-primary" /></div>
                            <div className="min-w-0">
                              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">Email</p>
                              <p className="text-sm font-medium text-slate-800 truncate">{selectedApplicant.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-100">
                            <div className="p-2 rounded-lg bg-accent/10"><Phone className="w-4 h-4 text-accent" /></div>
                            <div className="min-w-0">
                              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">Phone</p>
                              <p className="text-sm font-medium text-slate-800">{selectedApplicant.phone || 'Not provided'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-100">
                            <div className="p-2 rounded-lg bg-purple-500/10"><Calendar className="w-4 h-4 text-purple-500" /></div>
                            <div className="min-w-0">
                              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">Applied</p>
                              <p className="text-sm font-medium text-slate-800">{selectedApplicant.date_applied ? new Date(selectedApplicant.date_applied).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}</p>
                            </div>
                          </div>
                          {selectedApplicant.cv_link && (
                            <a href={selectedApplicant.cv_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-100 hover:border-primary/30 hover:bg-primary/5 transition-all group">
                              <div className="p-2 rounded-lg bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors"><FileText className="w-4 h-4 text-emerald-500" /></div>
                              <div className="min-w-0">
                                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">Resume</p>
                                <p className="text-sm font-medium text-primary group-hover:underline">View CV &rarr;</p>
                              </div>
                            </a>
                          )}
                        </div>
                      </div>

                      {/* AI Scores */}
                      <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono mb-4 flex items-center gap-2">
                          <Star className="w-3.5 h-3.5" /> AI Scoring Analysis
                        </h3>
                        <div className="grid grid-cols-2 gap-5">
                          {/* CV Score */}
                          <div className="relative bg-white rounded-2xl p-5 border border-slate-100 overflow-hidden">
                            <div className={`absolute top-0 left-0 w-1 h-full ${(selectedApplicant.cv_score ?? 0) < 5 ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
                            <div className="flex items-center justify-between mb-3">
                              <p className="text-xs text-slate-400 font-mono font-medium">CV Score</p>
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${(selectedApplicant.cv_score ?? 0) < 5 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                {(selectedApplicant.cv_score ?? 0) < 5 ? 'Below Threshold' : 'Pass'}
                              </span>
                            </div>
                            <p className={`text-4xl font-black font-mono ${getCvScoreColor(selectedApplicant.cv_score)}`}>{selectedApplicant.cv_score ?? '-'}<span className="text-lg text-slate-300 font-normal">/10</span></p>
                            {selectedApplicant.cv_score_note && <p className="text-xs text-slate-500 font-mono mt-3 leading-relaxed border-t border-slate-100 pt-3">{selectedApplicant.cv_score_note}</p>}
                          </div>
                          {/* TCC Score */}
                          <div className="relative bg-white rounded-2xl p-5 border border-slate-100 overflow-hidden">
                            <div className={`absolute top-0 left-0 w-1 h-full ${(selectedApplicant.tcc_score ?? 0) < 50 ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
                            <div className="flex items-center justify-between mb-3">
                              <p className="text-xs text-slate-400 font-mono font-medium">TCC Score</p>
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${(selectedApplicant.tcc_score ?? 0) < 50 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                {(selectedApplicant.tcc_score ?? 0) < 50 ? 'Below Threshold' : 'Pass'}
                              </span>
                            </div>
                            <p className={`text-4xl font-black font-mono ${getTccScoreColor(selectedApplicant.tcc_score)}`}>{selectedApplicant.tcc_score ?? '-'}<span className="text-lg text-slate-300 font-normal">/100</span></p>
                            {selectedApplicant.tcc_remark && <p className="text-xs text-slate-500 font-mono mt-3 leading-relaxed border-t border-slate-100 pt-3">{selectedApplicant.tcc_remark}</p>}
                          </div>
                        </div>
                      </div>

                      {/* Cover Letter */}
                      {selectedApplicant.cover_letter && (
                        <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
                          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono mb-4 flex items-center gap-2">
                            <FileText className="w-3.5 h-3.5" /> Cover Letter
                          </h3>
                          <p className="text-sm text-slate-700 font-mono bg-white p-5 rounded-xl border border-slate-100 whitespace-pre-wrap leading-relaxed">{selectedApplicant.cover_letter}</p>
                        </div>
                      )}
                    </div>

                    {/* ── Right Column (2/5) ── */}
                    <div className="lg:col-span-2 space-y-6">
                      <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-6 border border-slate-200/80 shadow-sm h-full flex flex-col">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono mb-4 flex items-center gap-2">
                          <MessageSquare className="w-3.5 h-3.5" /> Email Draft
                        </h3>
                        <textarea value={editingDraft} onChange={e => setEditingDraft(e.target.value)} rows={10} placeholder="Write or edit the email draft here before sending..."
                          className="flex-1 w-full px-4 py-4 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 font-mono text-sm transition-all resize-y leading-relaxed mb-4" />
                        {editingDraft !== (selectedApplicant.email_draft || '') && (
                          <div className="flex items-center gap-2 mb-3 px-1">
                            <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></div>
                            <span className="text-xs text-amber-600 font-mono font-medium">Unsaved changes</span>
                          </div>
                        )}
                        <div className="flex flex-col gap-3">
                          <button onClick={handleSaveDraft} disabled={savingDraft || editingDraft === (selectedApplicant.email_draft || '')}
                            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white text-slate-700 font-mono text-sm font-semibold hover:bg-slate-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed border border-slate-200 shadow-sm">
                            {savingDraft ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                            {savingDraft ? 'Saving...' : 'Save Draft'}
                          </button>
                          <button onClick={() => handleSendEmail(selectedApplicant)} disabled={sendingEmail === selectedApplicant.id || selectedApplicant.email_sent}
                            className={`w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-mono text-sm font-bold transition-all shadow-md ${selectedApplicant.email_sent
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-default shadow-none'
                              : 'bg-gradient-to-r from-primary to-accent text-white hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5'
                              } disabled:opacity-50`}>
                            {sendingEmail === selectedApplicant.id ? <Loader2 className="w-4 h-4 animate-spin" /> : selectedApplicant.email_sent ? <CheckCircle2 className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                            {selectedApplicant.email_sent ? 'Email Sent' : 'Send Email'}
                          </button>
                        </div>
                        {selectedApplicant.email_sent && selectedApplicant.email_sent_at && (
                          <p className="text-xs text-emerald-600 font-mono flex items-center gap-1.5 mt-3 px-1">
                            <CheckCircle2 className="w-3 h-3" />Sent on {new Date(selectedApplicant.email_sent_at).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════ JOB FORM MODAL ═══════ */}
      <AnimatePresence>
        {showJobForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setShowJobForm(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ duration: 0.2 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-slate-200/50 px-8 py-6 rounded-t-3xl flex items-center justify-between z-10">
                <h2 className="text-xl font-bold text-slate-900">{editingJob ? 'Edit Job' : 'Create New Job'}</h2>
                <button onClick={() => setShowJobForm(false)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <div className="px-8 py-6 space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider font-mono mb-2">Job Title *</label>
                  <input type="text" value={jobForm.title} onChange={e => setJobForm({ ...jobForm, title: e.target.value })} placeholder="e.g. Senior Frontend Engineer"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider font-mono mb-2">Department *</label>
                    <input type="text" value={jobForm.department} onChange={e => setJobForm({ ...jobForm, department: e.target.value })} placeholder="e.g. Engineering"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider font-mono mb-2">Location *</label>
                    <input type="text" value={jobForm.location} onChange={e => setJobForm({ ...jobForm, location: e.target.value })} placeholder="e.g. Remote"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider font-mono mb-2">Type</label>
                    <select value={jobForm.type} onChange={e => setJobForm({ ...jobForm, type: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-sm cursor-pointer">
                      <option>Full-time</option><option>Part-time</option><option>Contract</option><option>Internship</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-3 cursor-pointer py-3">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Active</span>
                      <button type="button" onClick={() => setJobForm({ ...jobForm, is_active: !jobForm.is_active })}
                        className={`relative w-12 h-6 rounded-full transition-colors ${jobForm.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${jobForm.is_active ? 'left-6' : 'left-0.5'}`} />
                      </button>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider font-mono mb-2">Description</label>
                  <textarea value={jobForm.description} onChange={e => setJobForm({ ...jobForm, description: e.target.value })} rows={4} placeholder="Job description..."
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-sm resize-y" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider font-mono mb-2">Requirements (one per line)</label>
                  <textarea value={jobForm.requirements} onChange={e => setJobForm({ ...jobForm, requirements: e.target.value })} rows={4} placeholder={"5+ years experience with React\nStrong TypeScript skills\n..."}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-sm resize-y" />
                </div>
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button onClick={() => setShowJobForm(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-mono text-sm font-medium hover:bg-slate-50 transition-all">Cancel</button>
                  <button onClick={handleSaveJob} disabled={savingJob || !jobForm.title || !jobForm.department || !jobForm.location}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-mono text-sm font-semibold hover:bg-primary/90 shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                    {savingJob ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    {editingJob ? 'Update Job' : 'Create Job'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════ TOAST ═══════ */}
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
}
