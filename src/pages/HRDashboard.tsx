import React from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/AuthContext';
import type { Applicant, Job } from '../data/mockData';
import {
  Search, Download, User, Briefcase, Calendar, CheckCircle2, XCircle, Clock,
  Send, ExternalLink, LogOut, Loader2, FileText, Star, MessageSquare,
  AlertCircle, X, Phone, Mail, Plus, Pencil, Trash2, ToggleLeft, ToggleRight,
  ChevronDown, Video
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
  const { signOut, user } = useAuth();

  // Greeting Logic
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };
  const greeting = getGreeting();
  const firstName = user?.user_metadata?.first_name || user?.user_metadata?.full_name?.split(' ')[0] || user?.user_metadata?.name?.split(' ')[0] || 'User';

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

  React.useEffect(() => {
    // Set up realtime subscription for applicants table
    const subscription = supabase
      .channel('public:applicants')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'applicants' },
        (payload: any) => {


          if (payload.eventType === 'INSERT') {
            const newApplicant = payload.new as Applicant;
            setApplicants(prev => [newApplicant, ...prev]);
          }
          else if (payload.eventType === 'UPDATE') {
            const updatedApplicant = payload.new as Applicant;
            setApplicants(prev => prev.map(a => {
              if (a.id === updatedApplicant.id) {
                // Preserve the nested 'jobs' data which isn't sent in the realtime payload
                return { ...a, ...updatedApplicant, jobs: a.jobs };
              }
              return a;
            }));

            // Update selected applicant if it's the one being edited
            setSelectedApplicant(prev => {
              if (prev?.id === updatedApplicant.id) {
                return { ...prev, ...updatedApplicant, jobs: prev.jobs };
              }
              return prev;
            });
          }
          else if (payload.eventType === 'DELETE') {
            setApplicants(prev => prev.filter(a => a.id !== payload.old.id));
            setSelectedApplicant(prev => prev?.id === payload.old.id ? null : prev);
          }
        }
      )
      .subscribe((status) => {

      });

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

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
      const { data: webhookResponse, error: proxyError } = await supabase.functions.invoke('n8n-proxy', {
        body: {
          targetUrl: `${WEBHOOK_URL}?${params.toString()}`,
          method: 'GET'
        }
      });
      if (!proxyError && webhookResponse?.success) {
        await supabase.from('applicants')
          .update({ email_sent: true, email_sent_at: new Date().toISOString(), email_draft: draftToSend })
          .eq('id', applicant.id);
        const updated = { ...applicant, email_sent: true, email_sent_at: new Date().toISOString(), email_draft: draftToSend || applicant.email_draft };
        setApplicants(prev => prev.map(a => a.id === applicant.id ? updated : a));
        if (selectedApplicant?.id === applicant.id) setSelectedApplicant(updated);
        showToast('Email sent successfully');
      } else {
        const errText = proxyError || webhookResponse?.error || 'Unknown error';
        console.error('Webhook response error:', errText);
        showToast(`Webhook error: ${errText}`, 'error');
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
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{greeting}, {firstName}</h1>
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
              <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-8 py-10 overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4 animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/4"></div>

                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-tr from-primary to-accent rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
                      <div className="relative h-20 w-20 rounded-2xl bg-slate-800 flex items-center justify-center text-white font-bold text-2xl shadow-2xl border border-white/10">
                        {selectedApplicant.first_name.charAt(0)}{selectedApplicant.last_name.charAt(0)}
                      </div>
                    </div>

                    <div>
                      <h2 className="text-3xl font-black text-white tracking-tight mb-2">
                        {selectedApplicant.first_name} {selectedApplicant.last_name}
                      </h2>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-white/70 text-sm font-mono flex items-center gap-2">
                          <Briefcase className="w-3.5 h-3.5" /> {selectedApplicant.position || 'No position'}
                        </span>
                        <span className="px-3 py-1 rounded-lg bg-amber-400/10 border border-amber-400/20 text-amber-400 text-sm font-mono flex items-center gap-2 shadow-[0_0_15px_rgba(251,191,36,0.1)]">
                          <Clock className="w-3.5 h-3.5" /> <span className="text-amber-400/60 mr-1 italic">Exp:</span> {selectedApplicant.years_of_experience || 'Not specified'}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-white/20">|</span>
                          <select value={selectedApplicant.status} onChange={e => handleStatusChange(selectedApplicant.id, e.target.value)}
                            className={`px-4 py-1.5 text-xs font-bold rounded-xl border-2 transition-all cursor-pointer focus:outline-none appearance-none hover:scale-105 ${getStatusColor(selectedApplicant.status)} font-mono shadow-lg`}>
                            {statuses.filter(s => s !== 'All').map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button onClick={() => setSelectedApplicant(null)}
                    className="p-3 rounded-2xl bg-white/5 text-white/40 hover:text-white hover:bg-white/10 hover:rotate-90 transition-all duration-300 border border-white/5">
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* ── Body ── */}
              <div className="overflow-y-auto max-h-[calc(92vh-160px)] custom-scrollbar">
                <div className="p-10">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                    {/* ── Left Content (7/12) ── */}
                    <div className="lg:col-span-7 space-y-10">

                      {/* Section: Professional Bio Data */}
                      <section>
                        <div className="flex items-center gap-3 mb-6">
                          <div className="h-8 w-1 bg-primary rounded-full"></div>
                          <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] font-mono">Professional Overview</h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="group p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-primary/20 hover:bg-white hover:shadow-md transition-all duration-300">
                            <div className="flex items-center gap-4">
                              <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform"><Mail className="w-5 h-5" /></div>
                              <div className="min-w-0">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono mb-0.5">Email Address</p>
                                <p className="text-sm font-bold text-slate-800 truncate">{selectedApplicant.email}</p>
                              </div>
                            </div>
                          </div>

                          <div className="group p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-accent/20 hover:bg-white hover:shadow-md transition-all duration-300">
                            <div className="flex items-center gap-4">
                              <div className="p-3 rounded-xl bg-accent/10 text-accent group-hover:scale-110 transition-transform"><Phone className="w-5 h-5" /></div>
                              <div className="min-w-0">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono mb-0.5">Contact Number</p>
                                <p className="text-sm font-bold text-slate-800">{selectedApplicant.phone || 'Not provided'}</p>
                              </div>
                            </div>
                          </div>

                          <div className="group p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-purple-500/20 hover:bg-white hover:shadow-md transition-all duration-300">
                            <div className="flex items-center gap-4">
                              <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500 group-hover:scale-110 transition-transform"><Calendar className="w-5 h-5" /></div>
                              <div className="min-w-0">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono mb-0.5">Submission Date</p>
                                <p className="text-sm font-bold text-slate-800">{selectedApplicant.date_applied ? new Date(selectedApplicant.date_applied).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}</p>
                              </div>
                            </div>
                          </div>

                          {selectedApplicant.cv_link && (
                            <a href={selectedApplicant.cv_link} target="_blank" rel="noopener noreferrer"
                              className="group p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-primary/50 hover:bg-black hover:shadow-xl transition-all duration-300">
                              <div className="flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-primary/20 text-primary group-hover:rotate-12 transition-transform"><FileText className="w-5 h-5" /></div>
                                <div className="min-w-0">
                                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono mb-0.5">Credential</p>
                                  <p className="text-sm font-bold text-white group-hover:text-primary transition-colors flex items-center gap-2">View Full Resume <ExternalLink className="w-3 h-3" /></p>
                                </div>
                              </div>
                            </a>
                          )}

                          {selectedApplicant.video_url && (
                            <a href={selectedApplicant.video_url} target="_blank" rel="noopener noreferrer"
                              className="group p-5 rounded-2xl bg-primary border border-primary/80 hover:bg-primary/90 hover:shadow-xl transition-all duration-300">
                              <div className="flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-white/20 text-white group-hover:scale-110 transition-transform"><Video className="w-5 h-5" /></div>
                                <div className="min-w-0">
                                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary-50 text-white/70 font-mono mb-0.5">Media</p>
                                  <p className="text-sm font-bold text-white transition-colors flex items-center gap-2">Watch Intro Video <ExternalLink className="w-3 h-3" /></p>
                                </div>
                              </div>
                            </a>
                          )}
                        </div>

                        {selectedApplicant.video_summary && (
                          <div className="mt-4 relative p-6 rounded-2xl bg-emerald-50/50 border border-emerald-100/50">
                            <div className="flex items-center gap-2 mb-3">
                              <Video className="w-4 h-4 text-emerald-500" />
                              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Video Summary</span>
                            </div>
                            <p className="relative z-10 text-sm text-slate-700 font-sans leading-relaxed whitespace-pre-wrap">{selectedApplicant.video_summary}</p>
                          </div>
                        )}
                      </section>

                      {/* Section: AI Talent Analysis */}
                      <section>
                        <div className="flex items-center gap-3 mb-6">
                          <div className="h-8 w-1 bg-accent rounded-full"></div>
                          <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] font-mono flex items-center gap-2">
                            AI Talent Metrics
                          </h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          {/* CV Score Card */}
                          <div className="relative group bg-white rounded-3xl p-7 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden">
                            <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl opacity-10 transition-opacity group-hover:opacity-20 ${(selectedApplicant.cv_score ?? 0) < 5 ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
                            <div className="relative z-10">
                              <div className="flex items-center justify-between mb-6">
                                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100"><Star className="w-4 h-4 text-slate-400" /></div>
                                <span className={`text-[10px] font-black uppercase tracking-[0.15em] px-3 py-1 rounded-full ${(selectedApplicant.cv_score ?? 0) < 5 ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                                  {(selectedApplicant.cv_score ?? 0) < 5 ? 'Low Match' : 'High Potential'}
                                </span>
                              </div>
                              <div className="flex items-baseline gap-1">
                                <span className={`text-5xl font-black font-mono tracking-tighter ${getCvScoreColor(selectedApplicant.cv_score)}`}>{selectedApplicant.cv_score ?? '-'}</span>
                                <span className="text-xl text-slate-300 font-bold font-mono">/10</span>
                              </div>
                              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1 mb-4">Resume Fit Score</p>
                              {selectedApplicant.cv_score_note && (
                                <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                                  <p className="text-xs text-slate-600 font-mono leading-relaxed italic">"{selectedApplicant.cv_score_note}"</p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* TCC Score Card */}
                          <div className="relative group bg-white rounded-3xl p-7 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden">
                            <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl opacity-10 transition-opacity group-hover:opacity-20 ${(selectedApplicant.tcc_score ?? 0) < 50 ? 'bg-rose-500' : 'bg-primary-light'}`}></div>
                            <div className="relative z-10">
                              <div className="flex items-center justify-between mb-6">
                                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100"><CheckCircle2 className="w-4 h-4 text-slate-400" /></div>
                                <span className={`text-[10px] font-black uppercase tracking-[0.15em] px-3 py-1 rounded-full ${(selectedApplicant.tcc_score ?? 0) < 50 ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-primary/5 text-primary border border-primary/10'}`}>
                                  {(selectedApplicant.tcc_score ?? 0) < 50 ? 'Re-test Required' : 'Elite Performer'}
                                </span>
                              </div>
                              <div className="flex items-baseline gap-1">
                                <span className={`text-5xl font-black font-mono tracking-tighter ${getTccScoreColor(selectedApplicant.tcc_score)}`}>{selectedApplicant.tcc_score ?? '-'}</span>
                                <span className="text-xl text-slate-300 font-bold font-mono">/100</span>
                              </div>
                              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1 mb-4">Technical Proficiency</p>
                              {selectedApplicant.tcc_remark && (
                                <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                                  <p className="text-xs text-slate-600 font-mono leading-relaxed italic">"{selectedApplicant.tcc_remark}"</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </section>

                      {/* Cover Letter Section */}
                      {selectedApplicant.cover_letter && (
                        <section>
                          <div className="flex items-center gap-3 mb-6">
                            <div className="h-8 w-1 bg-purple-500 rounded-full"></div>
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] font-mono">Personal Motivation</h3>
                          </div>
                          <div className="relative p-8 rounded-3xl bg-slate-50 border border-slate-200/50 italic">
                            <div className="absolute top-4 left-4 text-slate-200"><MessageSquare className="w-8 h-8 opacity-20" /></div>
                            <p className="relative z-10 text-sm text-slate-700 font-mono leading-loose whitespace-pre-wrap">{selectedApplicant.cover_letter}</p>
                          </div>
                        </section>
                      )}


                    </div>

                    {/* ── Right Content: Communication (5/12) ── */}
                    <div className="lg:col-span-5">
                      <div className="sticky top-0 space-y-6">
                        <div className="bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden relative group">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                          <div className="relative z-10 flex flex-col h-full">
                            <div className="flex items-center justify-between mb-8">
                              <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] font-mono flex items-center gap-3">
                                <Send className="w-4 h-4 text-primary" /> Outreach Portal
                              </h3>
                              {selectedApplicant.email_sent && (
                                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest">
                                  <CheckCircle2 className="w-3 h-3" /> Sent
                                </div>
                              )}
                            </div>

                            <div className="relative mb-6">
                              <textarea value={editingDraft} onChange={e => setEditingDraft(e.target.value)} rows={14}
                                placeholder="Craft your personalized response..."
                                className="w-full px-6 py-6 rounded-3xl bg-slate-800/50 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 font-mono text-sm text-slate-100 transition-all resize-none leading-relaxed custom-scrollbar" />

                              <div className="absolute bottom-4 right-6 flex items-center gap-3">
                                {editingDraft !== (selectedApplicant.email_draft || '') && (
                                  <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></div>
                                    <span className="text-[10px] text-amber-500 font-black uppercase tracking-widest">Unsaved</span>
                                  </motion.div>
                                )}
                              </div>
                            </div>

                            <div className="space-y-4">
                              <button onClick={handleSaveDraft} disabled={savingDraft || editingDraft === (selectedApplicant.email_draft || '')}
                                className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-white/5 text-slate-300 font-mono text-xs font-black uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all border border-white/10 disabled:opacity-20 shadow-lg">
                                {savingDraft ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                                {savingDraft ? 'Syncing...' : 'Update Draft'}
                              </button>

                              <button onClick={() => handleSendEmail(selectedApplicant)} disabled={sendingEmail === selectedApplicant.id || selectedApplicant.email_sent}
                                className={`w-full flex items-center justify-center gap-3 px-6 py-5 rounded-2xl font-mono text-sm font-black uppercase tracking-[0.15em] transition-all shadow-2xl group ${selectedApplicant.email_sent
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 cursor-default'
                                  : 'bg-orange-600 text-white hover:bg-orange-700 hover:shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98]'
                                  } disabled:opacity-50`}>
                                {sendingEmail === selectedApplicant.id ? <Loader2 className="w-5 h-5 animate-spin" /> : selectedApplicant.email_sent ? <CheckCircle2 className="w-5 h-5" /> : <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                                {selectedApplicant.email_sent ? 'Delivered' : 'Dispatch Email'}
                              </button>
                            </div>

                            {selectedApplicant.email_sent && selectedApplicant.email_sent_at && (
                              <div className="mt-6 p-4 rounded-2xl bg-slate-800/30 border border-slate-700/50">
                                <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mb-1">Transmission Timestamp</p>
                                <p className="text-xs text-emerald-400 font-mono font-bold tracking-tight">
                                  {new Date(selectedApplicant.email_sent_at).toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
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
