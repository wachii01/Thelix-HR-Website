import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Briefcase, Users, Globe, Zap, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { Component as GradientButton } from '@/components/ui/button';

/* ───────── Animated Particles ───────── */
function FloatingParticles() {
  const particles = React.useMemo(() =>
    Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 5 + 3,
      duration: Math.random() * 12 + 8,
      delay: Math.random() * -15,
      opacity: Math.random() * 0.3 + 0.2,
    })), []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-primary"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            opacity: p.opacity,
          }}
          animate={{
            y: [0, -80, -30, -100, 0],
            x: [0, 30, -20, 10, 0],
            opacity: [p.opacity, p.opacity * 1.5, p.opacity * 0.5, p.opacity * 1.2, p.opacity],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: p.delay,
          }}
        />
      ))}
    </div>
  );
}

/* ───────── Animated Gradient Orbs ───────── */
function GradientOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Primary orb */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(244, 130, 32, 0.20) 0%, transparent 70%)',
          top: '10%',
          left: '60%',
        }}
        animate={{
          x: [0, 100, -50, 80, 0],
          y: [0, -60, 40, -80, 0],
          scale: [1, 1.2, 0.9, 1.1, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Accent orb */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(0, 0, 0, 0.15) 0%, transparent 70%)',
          bottom: '5%',
          left: '10%',
        }}
        animate={{
          x: [0, -80, 60, -40, 0],
          y: [0, 50, -30, 70, 0],
          scale: [1, 0.85, 1.15, 0.95, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Purple accent */}
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(244, 130, 32, 0.15) 0%, transparent 70%)',
          top: '50%',
          left: '40%',
        }}
        animate={{
          x: [0, 60, -80, 30, 0],
          y: [0, -40, 60, -20, 0],
          scale: [1, 1.1, 0.9, 1.2, 1],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}

/* ───────── Grid Lines (animated) ───────── */
function AnimatedGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(244, 130, 32, 0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(244, 130, 32, 0.06) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
      {/* Animated scan line */}
      <motion.div
        className="absolute left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(244, 130, 32, 0.2), transparent)' }}
        animate={{ top: ['-5%', '105%'] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}

/* ───────── Logo Watermark ───────── */
function LogoWatermark() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
      <motion.img
        src="https://thelixholdings.com/wp-content/uploads/2024/09/cropped-Thelix.png"
        alt=""
        aria-hidden="true"
        className="w-[500px] md:w-[700px] h-auto select-none"
        style={{ opacity: 0.08, filter: 'grayscale(50%)' }}
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.08, 0.12, 0.08],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}

/* ───────── Home Page ───────── */
export default function Home() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center w-full relative">
      {/* ══ Animated Background Layers ══ */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <AnimatedGrid />
        <GradientOrbs />
        <FloatingParticles />
        <LogoWatermark />
      </div>

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
            <GradientButton
              icon={<Briefcase />}
              title="View Open Positions"
              subtitle="Explore career opportunities"
              size="md"
              gradientLight={{ from: 'from-primary/50', via: 'via-primary/40', to: 'to-primary/60' }}
              gradientDark={{ from: 'from-primary/30', via: 'via-black/50', to: 'to-black/70' }}
              onClick={() => navigate('/jobs')}
            />
            <GradientButton
              icon={<ShieldCheck />}
              title="HR Portal"
              subtitle="Staff access"
              size="md"
              gradientLight={{ from: 'from-[#F48220]/50', via: 'via-[#F48220]/40', to: 'to-[#F48220]/60' }}
              gradientDark={{ from: 'from-[#F48220]/30', via: 'via-black/50', to: 'to-black/70' }}
              onClick={() => navigate('/hr/login')}
            />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 border-t border-slate-200/50 relative z-10">
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
              className="glass-card p-8 rounded-2xl hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden group"
            >
              <div className="w-16 h-16 rounded-xl bg-primary/5 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
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

      {/* Core Values Section */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10 border-t border-slate-200/50">
        <div className="mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">What We Believe <span className="text-slate-400 font-medium">(Core Values)</span></h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Excellence */}
          <motion.div
            initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="rounded-3xl p-8 bg-amber-50 backdrop-blur-sm border border-amber-200/50 hover:shadow-lg hover:shadow-amber-100/50 transition-all"
          >
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-6">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-amber-900 mb-3">Excellence</h3>
            <p className="text-amber-800/80 font-medium leading-relaxed">
              We are committed to being the absolute best at what we do. That requires continuous improvement; excellence is not a destination it is an infinite journey.
            </p>
          </motion.div>

          {/* Ownership */}
          <motion.div
            initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="rounded-3xl p-8 bg-emerald-50 backdrop-blur-sm border border-emerald-200/50 hover:shadow-lg hover:shadow-emerald-100/50 transition-all"
          >
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-emerald-900 mb-3">Ownership</h3>
            <p className="text-emerald-800/80 font-medium leading-relaxed">
              We believe in taking proactive initiative and being fully accountable for our work. We take responsibility for driving our tasks to completion, ensuring that the job gets done efficiently and effectively.
            </p>
          </motion.div>

          {/* Accountability */}
          <motion.div
            initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
            className="rounded-3xl p-8 bg-cyan-50 backdrop-blur-sm border border-cyan-200/50 hover:shadow-lg hover:shadow-cyan-100/50 transition-all"
          >
            <div className="w-12 h-12 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center mb-6">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-cyan-900 mb-3">Accountability</h3>
            <p className="text-cyan-800/80 font-medium leading-relaxed">
              We understand that we are responsible for ourselves, our colleagues, our company and our customers.
            </p>
          </motion.div>

          {/* Innovation */}
          <motion.div
            initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
            className="rounded-3xl p-8 bg-rose-50 backdrop-blur-sm border border-rose-200/50 hover:shadow-lg hover:shadow-rose-100/50 transition-all"
          >
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center mb-6">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-rose-900 mb-3">Innovation</h3>
            <p className="text-rose-800/80 font-medium leading-relaxed">
              We believe in challenging the status quo and constantly seeking new ways to solve problems, improve processes, and create products that redefine the future.
            </p>
          </motion.div>

          {/* Spacer to push TeamWork to the right */}
          <div className="hidden md:block"></div>

          {/* TeamWork */}
          <motion.div
            initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }}
            className="rounded-3xl p-8 bg-purple-50 backdrop-blur-sm border border-purple-200/50 hover:shadow-lg hover:shadow-purple-100/50 transition-all"
          >
            <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mb-6">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-purple-900 mb-3">TeamWork</h3>
            <p className="text-purple-800/80 font-medium leading-relaxed">
              We value diverse perspectives and believe that the best solutions come from the collective strength of our team.
            </p>
          </motion.div>

        </div>
      </section>

      {/* Perks & Benefits Section */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10 border-t border-slate-200/50 mb-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">Perks & Benefits Of Joining Us</h2>
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">

          {/* Left Column */}
          <div className="w-full lg:w-1/3 flex flex-col gap-12 justify-center">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="text-center lg:text-right">
              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg mx-auto lg:ml-auto lg:mr-0 mb-4 shadow-lg shadow-primary/30">1</div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Continuous Learning</h3>
              <p className="text-slate-600 font-medium leading-relaxed">
                Growth never stops here. Get free access to courses, certifications, learning tools, and mentorship opportunities to level up your skills on your own terms.
              </p>
            </motion.div>
          </div>

          {/* Center Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="w-full lg:w-1/3 flex justify-center"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-primary/10 border-4 border-white aspect-[4/5] w-full max-w-sm">
              <img
                src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=800&auto=format&fit=crop"
                alt="Team collaboration"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent"></div>
            </div>
          </motion.div>

          {/* Right Column */}
          <div className="w-full lg:w-1/3 flex flex-col gap-12 justify-center">
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="text-center lg:text-left">
              <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center font-bold text-lg mx-auto lg:mr-auto lg:ml-0 mb-4 shadow-lg shadow-accent/30">2</div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Monthly Data Allowance</h3>
              <p className="text-slate-600 font-medium leading-relaxed">
                Whether you're working from home, on the go, or researching your next big idea, we cover your data costs so you stay connected without stress.
              </p>
            </motion.div>
          </div>

        </div>
      </section>

      {/* Call to Action Section */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 relative z-10 flex justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col items-center text-center"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-8 tracking-tight">Ready to build the future with us?</h2>
          <GradientButton
            icon={<Briefcase />}
            title="View Open Positions"
            subtitle="Explore career opportunities"
            size="lg"
            gradientLight={{ from: 'from-primary/50', via: 'via-primary/40', to: 'to-primary/60' }}
            gradientDark={{ from: 'from-primary/30', via: 'via-black/50', to: 'to-black/70' }}
            onClick={() => navigate('/jobs')}
          />
        </motion.div>
      </section>

    </div>
  );
}
