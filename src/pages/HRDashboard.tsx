import React from 'react';
import { mockApplicants, mockJobs } from '../data/mockData';
import { Search, Filter, Download, User, Briefcase, Calendar, ChevronDown, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { motion } from 'motion/react';

export default function HRDashboard() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('All');

  const statuses = ['All', 'New', 'Reviewing', 'Interviewed', 'Offered', 'Rejected'];

  const filteredApplicants = mockApplicants.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          app.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'New': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Reviewing': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Interviewed': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Offered': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Rejected': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'New': return <User className="w-3 h-3" />;
      case 'Reviewing': return <Clock className="w-3 h-3" />;
      case 'Interviewed': return <Briefcase className="w-3 h-3" />;
      case 'Offered': return <CheckCircle2 className="w-3 h-3" />;
      case 'Rejected': return <XCircle className="w-3 h-3" />;
      default: return <User className="w-3 h-3" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Applicant Dashboard</h1>
          <p className="text-slate-500 font-mono text-sm">Manage and track job applications</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl glass-panel text-slate-700 font-medium hover:bg-white/60 transition-all font-mono text-sm shadow-sm">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {[
          { label: 'Total Applicants', value: mockApplicants.length, color: 'text-primary' },
          { label: 'New Applications', value: mockApplicants.filter(a => a.status === 'New').length, color: 'text-blue-600' },
          { label: 'In Review', value: mockApplicants.filter(a => a.status === 'Reviewing').length, color: 'text-amber-600' },
          { label: 'Interviews', value: mockApplicants.filter(a => a.status === 'Interviewed').length, color: 'text-purple-600' }
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.1 }}
            className="glass-card p-6 rounded-2xl border-white/60"
          >
            <p className="text-slate-500 font-mono text-sm mb-2">{stat.label}</p>
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="glass-panel p-4 rounded-2xl mb-8 flex flex-col md:flex-row gap-4 shadow-sm border-white/60">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search applicants by name or email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-sm transition-all"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          {statuses.map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-xl font-mono text-sm whitespace-nowrap transition-all flex items-center gap-2 ${
                statusFilter === status 
                  ? 'bg-slate-900 text-white shadow-md' 
                  : 'bg-white/50 text-slate-600 hover:bg-white/80 border border-slate-200'
              }`}
            >
              {status !== 'All' && getStatusIcon(status)}
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl overflow-hidden border-white/60 shadow-lg shadow-slate-200/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/50 bg-white/40">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Applicant</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Applied For</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider font-mono text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/50">
              {filteredApplicants.map((app, index) => {
                const job = mockJobs.find(j => j.id === app.jobId);
                return (
                  <motion.tr 
                    key={app.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="hover:bg-white/40 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shadow-inner">
                          {app.name.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-slate-900">{app.name}</div>
                          <div className="text-sm text-slate-500 font-mono">{app.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900 font-medium">{job?.title}</div>
                      <div className="text-xs text-slate-500 font-mono">{job?.department}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-600 font-mono flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        {new Date(app.appliedAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(app.status)} font-mono items-center gap-1.5`}>
                        {getStatusIcon(app.status)}
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-primary hover:text-primary/80 font-mono border border-primary/20 px-3 py-1.5 rounded-lg hover:bg-primary/5 transition-colors">
                        View Details
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
              {filteredApplicants.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-mono">
                    No applicants found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
