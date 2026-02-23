import React from 'react';
import { Link } from 'react-router-dom';
import { mockJobs } from '../data/mockData';
import { Search, MapPin, Briefcase, Clock, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function Jobs() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [departmentFilter, setDepartmentFilter] = React.useState('All');

  const departments = ['All', ...Array.from(new Set(mockJobs.map(job => job.department)))];

  const filteredJobs = mockJobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          job.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === 'All' || job.department === departmentFilter;
    return matchesSearch && matchesDepartment;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <div className="mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Open Positions</h1>
        <p className="text-lg text-slate-600 font-mono max-w-2xl">
          Join our team and help us build intelligent systems that impact lives globally.
        </p>
      </div>

      {/* Filters */}
      <div className="glass-panel p-6 rounded-2xl mb-12 flex flex-col md:flex-row gap-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search jobs..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-sm transition-all"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          {departments.map(dept => (
            <button
              key={dept}
              onClick={() => setDepartmentFilter(dept)}
              className={`px-6 py-3 rounded-xl font-mono text-sm whitespace-nowrap transition-all ${
                departmentFilter === dept 
                  ? 'bg-primary text-white shadow-md shadow-primary/20' 
                  : 'bg-white/50 text-slate-600 hover:bg-white/80 border border-slate-200'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Job List */}
      <div className="grid gap-6">
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job, index) => (
            <motion.div 
              key={job.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="glass-card p-6 md:p-8 rounded-2xl hover:border-primary/30 transition-all group"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-mono text-xs font-semibold uppercase tracking-wider">
                      {job.department}
                    </span>
                    <span className="flex items-center gap-1 text-slate-500 font-mono text-xs">
                      <Clock className="w-3 h-3" />
                      {job.type}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-primary transition-colors">
                    {job.title}
                  </h2>
                  <div className="flex items-center gap-4 text-slate-500 font-mono text-sm mb-4">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4" />
                      {job.type}
                    </span>
                  </div>
                  <p className="text-slate-600 font-mono text-sm line-clamp-2 max-w-3xl">
                    {job.description}
                  </p>
                </div>
                
                <div className="flex items-center md:justify-end">
                  <Link 
                    to={`/apply/${job.id}`}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white font-medium hover:bg-primary transition-all shadow-md group-hover:shadow-lg group-hover:-translate-y-0.5"
                  >
                    Apply Now
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-20 glass-panel rounded-2xl">
            <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">No jobs found</h3>
            <p className="text-slate-500 font-mono">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
