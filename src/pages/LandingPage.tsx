import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Globe, Users, BarChart3, ArrowRight, Zap, Shield, TrendingUp, ChevronDown, ChevronUp, Target, Layers, Workflow } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

function HeroSection() {
  const navigate = useNavigate();
  return (
    <section className="relative overflow-hidden pt-20 pb-32 lg:pt-28 lg:pb-40">
      <div className="absolute inset-0 bg-gradient-to-b from-foreground/[0.02] to-transparent" />
      <div className="container relative mx-auto px-4">
        <motion.div initial="hidden" animate="visible" className="mx-auto max-w-4xl text-center">
          <motion.div variants={fadeUp} custom={0} className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground">
            <Zap className="h-3.5 w-3.5 text-primary" />
            <span>Domain prospecting, reimagined</span>
          </motion.div>
          <motion.h1 variants={fadeUp} custom={1} className="font-display text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Find high-value geo-service domains and the local businesses{' '}
            <span className="text-gradient">most likely to buy them</span>
          </motion.h1>
          <motion.p variants={fadeUp} custom={2} className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Generate generic location-based domain opportunities, check availability, discover local prospects, and organize your outreach — all in one place.
          </motion.p>
          <motion.div variants={fadeUp} custom={3} className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" onClick={() => navigate('/dashboard')} className="h-12 px-8 text-base font-semibold shadow-glow">
              Start Searching <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/dashboard?demo=true')} className="h-12 px-8 text-base">
              View Demo
            </Button>
          </motion.div>
        </motion.div>
        {/* Product preview */}
        <motion.div variants={fadeUp} custom={4} initial="hidden" animate="visible" className="mx-auto mt-16 max-w-5xl">
          <div className="rounded-3xl border border-border bg-card p-2 shadow-prominent">
            <div className="rounded-2xl bg-secondary/50 p-6 lg:p-8">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <PreviewCard icon={<Globe className="h-5 w-5 text-primary" />} label="Domains Generated" value="847" />
                <PreviewCard icon={<Users className="h-5 w-5 text-primary" />} label="Prospects Found" value="234" />
                <PreviewCard icon={<BarChart3 className="h-5 w-5 text-primary" />} label="Avg. Buyer Score" value="78" />
              </div>
              <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
                <div className="space-y-2">
                  {['richmondcardetailing.com', 'tamparoofingpros.com', 'phoenixacrepair.com'].map((d, i) => (
                    <div key={d} className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-success" />
                        <span className="text-sm font-medium">{d}</span>
                      </div>
                      <span className="text-xs font-semibold text-primary">{95 - i * 7}/100</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  {['Diamond Detail RVA', 'Tampa Pro Roofers', 'Valley AC Pros'].map((b, i) => (
                    <div key={b} className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
                      <span className="text-sm font-medium">{b}</span>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-secondary">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${92 - i * 4}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground">{92 - i * 4}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function PreviewCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="mt-1 text-2xl font-bold font-display">{value}</p>
    </div>
  );
}

function HowItWorks() {
  const steps = [
    { icon: <Search className="h-6 w-6" />, title: 'Search a niche & location', desc: 'Enter a local service type and geography. We generate dozens of clean, generic domain ideas.' },
    { icon: <Globe className="h-6 w-6" />, title: 'Discover available domains', desc: 'See quality scores, SEO potential, and availability status for every generated domain.' },
    { icon: <Users className="h-6 w-6" />, title: 'Find the best buyers', desc: 'Match domains to local businesses with weak online presence and high buyer likelihood.' },
  ];
  return (
    <section className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center">
          <motion.h2 variants={fadeUp} custom={0} className="font-display text-3xl font-bold sm:text-4xl">How it works</motion.h2>
          <motion.p variants={fadeUp} custom={1} className="mt-3 text-muted-foreground">Three steps to your next domain deal</motion.p>
        </motion.div>
        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
          {steps.map((s, i) => (
            <motion.div key={i} variants={fadeUp} custom={i + 2} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="relative rounded-2xl border border-border bg-card p-8 text-center shadow-elegant hover:shadow-elevated transition-shadow duration-300">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                {s.icon}
              </div>
              <div className="absolute -top-3 left-6 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {i + 1}
              </div>
              <h3 className="mt-6 font-display text-lg font-semibold">{s.title}</h3>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhyItWorks() {
  const points = [
    { icon: <Target className="h-5 w-5" />, title: 'Exact-match geo domains convert', desc: 'Local businesses rank higher and build trust faster with city + service .com domains.' },
    { icon: <TrendingUp className="h-5 w-5" />, title: 'Weak domains everywhere', desc: 'Most local businesses still use Wix subdomains, GoDaddy builders, or have no website at all.' },
    { icon: <Shield className="h-5 w-5" />, title: '100% generic, no risk', desc: 'We only generate safe, non-trademarked, generic geo-service patterns. No brand conflicts.' },
    { icon: <Layers className="h-5 w-5" />, title: 'Data-driven prospecting', desc: 'Buyer scores based on domain weakness, review count, and online presence analysis.' },
  ];
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center">
          <motion.h2 variants={fadeUp} custom={0} className="font-display text-3xl font-bold sm:text-4xl">Why this works</motion.h2>
        </motion.div>
        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {points.map((p, i) => (
            <motion.div key={i} variants={fadeUp} custom={i + 1} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="rounded-2xl border border-border bg-card p-6 hover:shadow-elevated transition-all duration-300">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">{p.icon}</div>
              <h3 className="mt-4 font-display font-semibold">{p.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function UseCases() {
  const cases = [
    'Car Detailing', 'Roofing', 'HVAC', 'Plumbing', 'Landscaping', 'Pest Control',
    'Electricians', 'Cleaning Services', 'Towing', 'Auto Repair', 'Window Cleaning', 'Pressure Washing',
  ];
  return (
    <section className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4 text-center">
        <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
          className="font-display text-3xl font-bold sm:text-4xl">Works for any local service niche</motion.h2>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="mt-12 flex flex-wrap justify-center gap-3">
          {cases.map((c, i) => (
            <motion.span key={c} variants={fadeUp} custom={i * 0.3}
              className="rounded-full border border-border bg-card px-5 py-2 text-sm font-medium hover:border-primary/40 hover:shadow-elegant transition-all duration-200 cursor-default">
              {c}
            </motion.span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function WorkflowSection() {
  const steps = [
    { icon: <Search className="h-5 w-5" />, title: 'Search', desc: 'Enter niche, state, and city' },
    { icon: <Globe className="h-5 w-5" />, title: 'Discover', desc: 'Review scored domain opportunities' },
    { icon: <Users className="h-5 w-5" />, title: 'Prospect', desc: 'Find matching local businesses' },
    { icon: <Target className="h-5 w-5" />, title: 'Match', desc: 'Pair domains with ideal buyers' },
    { icon: <Workflow className="h-5 w-5" />, title: 'Outreach', desc: 'Manage your CRM pipeline' },
  ];
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
          className="text-center font-display text-3xl font-bold sm:text-4xl">Your complete prospecting workflow</motion.h2>
        <div className="mt-16 flex flex-col items-center gap-4 md:flex-row md:justify-center md:gap-0">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center">
              <motion.div variants={fadeUp} custom={i + 1} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className="flex flex-col items-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">{s.icon}</div>
                <h4 className="mt-3 font-display font-semibold text-sm">{s.title}</h4>
                <p className="mt-1 max-w-[120px] text-xs text-muted-foreground">{s.desc}</p>
              </motion.div>
              {i < steps.length - 1 && <ArrowRight className="mx-4 hidden h-4 w-4 text-muted-foreground/40 md:block" />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  const faqs = [
    { q: 'Is this cybersquatting?', a: 'No. We only generate generic geo-service domain patterns (like "tamparoofing.com"). These are descriptive, non-trademarked domains. We never encourage purchasing domains that resemble existing brand names.' },
    { q: 'Can I buy domains directly through the app?', a: 'Not yet. GeoDomain Scout helps you discover, evaluate, and save domain opportunities. When you\'re ready, you can register domains through your preferred registrar.' },
    { q: 'Where does the business data come from?', a: 'Business prospect data comes from publicly available sources. Email addresses are only shown when publicly listed. We never fabricate contact information.' },
    { q: 'What niches work best?', a: 'Any local service business — car detailing, roofing, HVAC, plumbing, landscaping, cleaning, and dozens more. The model works wherever businesses serve a specific geographic area.' },
    { q: 'How accurate are the buyer scores?', a: 'Buyer scores are estimates based on domain weakness, online presence, review count, and local relevance. They help prioritize outreach but should be combined with your own research.' },
  ];
  return (
    <section className="py-24 bg-secondary/30">
      <div className="container mx-auto max-w-3xl px-4">
        <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
          className="text-center font-display text-3xl font-bold sm:text-4xl">Frequently asked questions</motion.h2>
        <div className="mt-12 space-y-3">
          {faqs.map((f, i) => (
            <motion.div key={i} variants={fadeUp} custom={i + 1} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="rounded-2xl border border-border bg-card overflow-hidden">
              <button onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between p-5 text-left font-display font-semibold hover:bg-secondary/30 transition-colors">
                {f.q}
                {open === i ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
              </button>
              {open === i && <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">{f.a}</div>}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  const navigate = useNavigate();
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-card p-12 text-center shadow-prominent">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">Ready to find your next domain deal?</h2>
          <p className="mt-4 text-muted-foreground">Start discovering high-value geo-service domains and matching them with local businesses today.</p>
          <Button size="lg" onClick={() => navigate('/dashboard')} className="mt-8 h-12 px-10 text-base font-semibold shadow-glow">
            Start Searching <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Globe className="h-6 w-6 text-primary" />
            <span className="font-display text-lg font-bold">GeoDomain Scout</span>
          </div>
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Docs</a>
          </nav>
          <Button size="sm" onClick={() => window.location.href = '/dashboard'}>Get Started</Button>
        </div>
      </header>
      <HeroSection />
      <HowItWorks />
      <WhyItWorks />
      <UseCases />
      <WorkflowSection />
      <FAQ />
      <FinalCTA />
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              <span className="font-display font-semibold">GeoDomain Scout</span>
            </div>
            <p className="text-xs text-muted-foreground">Only generic, non-trademarked geo-service domains. Contact data from publicly available sources only.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
