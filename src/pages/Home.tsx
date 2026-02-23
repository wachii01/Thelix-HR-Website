import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Briefcase, Users, Globe, Zap } from 'lucide-react';
import { motion } from 'motion/react';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center w-full">
      {/* Hero Section */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 flex flex-col items-center text-center relative">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="z-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border-primary/20 text-primary mb-8">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
            <span className="text-sm font-medium tracking-wide uppercase">We're Hiring</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-6 max-w-4xl mx-auto leading-tight">
            Connecting Top Talent with <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Leading Opportunities</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto font-mono">
            Unlocking potentials, impacting 300,000+ lives by 2030 through intelligent systems and strategic investment.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/jobs" 
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5"
            >
              View Open Positions
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              to="/hr/login" 
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl glass-panel text-slate-700 font-medium hover:bg-white/60 transition-all hover:-translate-y-0.5"
            >
              HR Portal
            </Link>
          </div>
        </motion.div>

        {/* Decorative background blobs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/4 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
      </section>

      {/* Features Section */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 border-t border-slate-200/50">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Why Join Thelix Holdings?</h2>
          <p className="text-slate-600 max-w-2xl mx-auto font-mono">
            We are creating pathways to economic freedom across the globe. Join us in our mission to build intelligent systems.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <Globe className="w-8 h-8 text-primary" />,
              title: "Global Impact",
              description: "Work on projects that impact hundreds of thousands of lives globally."
            },
            {
              icon: <Zap className="w-8 h-8 text-accent" />,
              title: "Intelligent Systems",
              description: "Be at the forefront of building strategic and intelligent investment systems."
            },
            {
              icon: <Users className="w-8 h-8 text-emerald-500" />,
              title: "Top Talent",
              description: "Collaborate with industry leaders and experts in a dynamic environment."
            }
          ].map((feature, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-card p-8 rounded-2xl hover:-translate-y-1 transition-transform duration-300"
            >
              <div className="w-16 h-16 rounded-xl bg-white/50 flex items-center justify-center mb-6 shadow-sm">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
              <p className="text-slate-600 font-mono text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
