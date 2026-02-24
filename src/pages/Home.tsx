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
          background: 'radial-gradient(circle, rgba(15, 118, 110, 0.25) 0%, transparent 70%)',
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
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.20) 0%, transparent 70%)',
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
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.18) 0%, transparent 70%)',
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
            linear-gradient(rgba(15, 118, 110, 0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(15, 118, 110, 0.06) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
      {/* Animated scan line */}
      <motion.div
        className="absolute left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(15, 118, 110, 0.3), transparent)' }}
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
              gradientLight={{ from: 'from-[#2575FC]/50', via: 'via-[#2575FC]/40', to: 'to-[#2575FC]/60' }}
              gradientDark={{ from: 'from-[#2575FC]/30', via: 'via-black/50', to: 'to-black/70' }}
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
              className="glass-card p-8 rounded-2xl hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden"
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
