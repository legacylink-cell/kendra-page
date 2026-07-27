import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Dumbbell, Users, Laptop, Check } from "lucide-react";
import { toast } from "sonner";
import { MarketingNav, MarketingFooter } from "@/components/marketing/MarketingChrome";
import api, { apiErr } from "@/lib/api";

const IMG = {
  hero: "https://images.unsplash.com/photo-1708011108776-45ad9e625269?w=1920&q=80&auto=format&fit=crop",
  about: "/kendra.jpg",
  g1: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=1000&q=80&auto=format&fit=crop",
  g2: "https://images.unsplash.com/photo-1708011108850-49646bd34503?w=1000&q=80&auto=format&fit=crop",
  g3: "https://images.pexels.com/photos/7900679/pexels-photo-7900679.jpeg?auto=compress&cs=tinysrgb&w=1000",
  g4: "https://images.pexels.com/photos/6739123/pexels-photo-6739123.jpeg?auto=compress&cs=tinysrgb&w=1000",
};

const Reveal = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-80px" }}
    transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.div>
);

const marquee = ["STRENGTH", "DISCIPLINE", "POWER", "RESILIENCE", "CONFIDENCE", "GRIT"];

const programs = [
  { icon: Dumbbell, title: "1:1 Personal Training", desc: "Fully bespoke strength programming, coached in person. Every rep intentional, every session progressing toward your goal.", tag: "Signature" },
  { icon: Users, title: "Small Group Strength", desc: "Train alongside 2–4 women in a focused, high-energy room. Community accountability with individual coaching eyes on you.", tag: "Community" },
  { icon: Laptop, title: "Online Coaching", desc: "Custom programs, weekly check-ins, and video form reviews — train on your schedule with Kendra in your corner.", tag: "Anywhere" },
];

const testimonials = [
  { q: "Kendra didn't just change my body. She rebuilt how I see myself. I walk into any room differently now.", n: "Maya R.", r: "Down 22 lbs · 14 months" },
  { q: "I deadlifted double my bodyweight at 41. I never thought that sentence could be about me.", n: "Danielle P.", r: "1:1 Client" },
  { q: "The most professional, thoughtful coaching I've ever had. She treats your goals like they're sacred.", n: "Priya S.", r: "Online Coaching" },
];

const Home = () => {
  const [form, setForm] = useState({ name: "", email: "", phone: "", goal: "", message: "" });
  const [sending, setSending] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.post("/leads", form);
      toast.success("Application received — Kendra will reach out personally.");
      setForm({ name: "", email: "", phone: "", goal: "", message: "" });
    } catch (err) {
      toast.error(apiErr(err.response?.data?.detail));
    } finally {
      setSending(false);
    }
  };

  return (
    <div id="top" className="bg-[#0A0A0B] text-brand-text font-sans selection:bg-brand-bronze">
      <MarketingNav />

      {/* HERO */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={IMG.hero} alt="Woman training with battle ropes" className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0B] via-[#0A0A0B]/85 to-[#0A0A0B]/30" />
          <div className="absolute inset-0 grain opacity-[0.15] mix-blend-overlay" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 lg:px-10 w-full pt-28">
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="text-brand-bronze uppercase tracking-[0.35em] text-xs mb-6">
            Strength for women · by a woman
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
            className="font-display font-light text-6xl sm:text-7xl lg:text-8xl leading-[0.9] tracking-tight max-w-4xl">
            Train like the woman<br /> you're <span className="italic text-brand-bronze">becoming.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.35 }}
            className="text-brand-muted text-lg max-w-xl mt-8 leading-relaxed">
            KP Studio is the private strength practice of <span className="text-brand-text">Kendra Albritton</span> — where
            women build real power, unshakeable confidence, and results that outlast any trend.
          </motion.p>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-wrap gap-4 mt-10">
            <a href="#contact" data-testid="hero-cta-start"
              className="group inline-flex items-center gap-3 bg-brand-bronze text-brand-bg px-8 py-4 font-medium hover:bg-brand-text transition-colors">
              Start your transformation
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </a>
            <a href="#programs" data-testid="hero-cta-programs"
              className="inline-flex items-center gap-2 border border-brand-line text-brand-text px-8 py-4 hover:border-brand-bronze transition-colors">
              View programs
            </a>
          </motion.div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="border-y border-brand-line bg-[#141312] py-6 overflow-hidden">
        <div className="marquee-track">
          {[...marquee, ...marquee, ...marquee, ...marquee].map((w, i) => (
            <span key={i} className="font-display text-4xl md:text-5xl mx-8 text-brand-text/40 whitespace-nowrap flex items-center gap-16">
              {w} <span className="text-brand-bronze text-2xl">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* ABOUT */}
      <section id="about" className="py-28 px-6 lg:px-10">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <Reveal>
            <div className="relative">
              <img src={IMG.about} alt="Kendra Albritton" className="w-full aspect-[4/5] object-cover" />
              <div className="absolute -bottom-6 -right-4 bg-brand-bronze text-brand-bg p-6 hidden sm:block">
                <p className="font-display text-5xl leading-none">10+</p>
                <p className="text-xs uppercase tracking-[0.2em] mt-1">Years coaching women</p>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="text-brand-bronze uppercase tracking-[0.3em] text-xs mb-5">Meet Kendra</p>
            <h2 className="font-display text-5xl lg:text-6xl leading-none tracking-tight mb-8">
              Coaching that treats your goals like they're sacred.
            </h2>
            <p className="text-brand-muted leading-relaxed mb-5">
              Kendra Albritton is a personal trainer and group fitness coach at <span className="text-brand-text">Shapes Fitness</span>,
              the boutique women's club in Flower Mound, TX. She built KP Studio for one reason: too many women were
              handed generic programs and told to shrink. She coaches the opposite — get <span className="text-brand-text">stronger</span>,
              take up space, and train with intention.
            </p>
            <p className="text-brand-muted leading-relaxed mb-8">
              Every program is built around your body, your history, and your life. No guesswork, no fads —
              just expert programming and relentless accountability.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {["Women-only coaching", "Personalized programming", "Form-first strength", "Real accountability"].map((f) => (
                <div key={f} className="flex items-center gap-3 text-sm text-brand-text">
                  <Check className="h-4 w-4 text-brand-bronze shrink-0" /> {f}
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* PROGRAMS */}
      <section id="programs" className="py-28 px-6 lg:px-10 bg-[#141312] border-y border-brand-line">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <p className="text-brand-bronze uppercase tracking-[0.3em] text-xs mb-4">The Work</p>
            <h2 className="font-display text-5xl lg:text-6xl tracking-tight max-w-2xl leading-none">
              Choose how you want to get strong.
            </h2>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-6 mt-16">
            {programs.map((p, i) => (
              <Reveal key={p.title} delay={i * 0.12}>
                <div data-testid={`program-${i}`} className="group h-full bg-[#0A0A0B] border border-brand-line p-8 hover:border-brand-bronze transition-colors">
                  <div className="flex items-center justify-between mb-8">
                    <p.icon className="h-8 w-8 text-brand-bronze" />
                    <span className="text-[10px] uppercase tracking-[0.2em] text-brand-muted border border-brand-line px-3 py-1">{p.tag}</span>
                  </div>
                  <h3 className="font-display text-3xl mb-4">{p.title}</h3>
                  <p className="text-brand-muted text-sm leading-relaxed">{p.desc}</p>
                  <a href="#contact" className="inline-flex items-center gap-2 text-brand-bronze text-sm mt-8 group-hover:gap-3 transition-all">
                    Enquire <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* RESULTS / GALLERY */}
      <section id="results" className="py-28 px-6 lg:px-10">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
              <div>
                <p className="text-brand-bronze uppercase tracking-[0.3em] text-xs mb-4">Proof, not promises</p>
                <h2 className="font-display text-5xl lg:text-6xl tracking-tight leading-none">Real women. Real strength.</h2>
              </div>
              <a href="#contact" className="text-brand-muted hover:text-brand-text text-sm inline-flex items-center gap-2">
                Your story is next <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </Reveal>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[IMG.g2, IMG.g1, IMG.g4, IMG.g3].map((src, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div className="overflow-hidden">
                  <img src={src} alt="Client training" className={`w-full object-cover hover:scale-105 transition-transform duration-700 ${i % 2 ? "aspect-[3/4]" : "aspect-[3/4] mt-0"}`} />
                </div>
              </Reveal>
            ))}
          </div>

          {/* TESTIMONIALS */}
          <div className="grid md:grid-cols-3 gap-6 mt-20">
            {testimonials.map((t, i) => (
              <Reveal key={i} delay={i * 0.12}>
                <div className="border border-brand-line p-8 h-full bg-[#141312]">
                  <p className="text-brand-bronze text-4xl font-display leading-none mb-4">“</p>
                  <p className="text-brand-text leading-relaxed mb-6">{t.q}</p>
                  <p className="text-sm text-brand-text font-medium">{t.n}</p>
                  <p className="text-xs text-brand-muted uppercase tracking-[0.15em] mt-1">{t.r}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="py-28 px-6 lg:px-10 bg-[#141312] border-t border-brand-line">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16">
          <Reveal>
            <p className="text-brand-bronze uppercase tracking-[0.3em] text-xs mb-5">Apply to train</p>
            <h2 className="font-display text-5xl lg:text-6xl tracking-tight leading-none mb-6">
              Let's build the strongest version of you.
            </h2>
            <p className="text-brand-muted leading-relaxed max-w-md">
              Spots are limited and every client is coached personally. Tell Kendra about your goals and she'll
              reach out to see if KP Studio is the right fit.
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <form onSubmit={submit} data-testid="lead-form" className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  data-testid="lead-name" placeholder="Full name"
                  className="w-full bg-[#0A0A0B] border border-brand-line px-4 py-3.5 text-brand-text placeholder:text-brand-muted focus:border-brand-bronze focus:outline-none" />
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  data-testid="lead-phone" placeholder="Phone"
                  className="w-full bg-[#0A0A0B] border border-brand-line px-4 py-3.5 text-brand-text placeholder:text-brand-muted focus:border-brand-bronze focus:outline-none" />
              </div>
              <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                data-testid="lead-email" placeholder="Email address"
                className="w-full bg-[#0A0A0B] border border-brand-line px-4 py-3.5 text-brand-text placeholder:text-brand-muted focus:border-brand-bronze focus:outline-none" />
              <input value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })}
                data-testid="lead-goal" placeholder="Your main goal (e.g. get stronger, lose fat, feel confident)"
                className="w-full bg-[#0A0A0B] border border-brand-line px-4 py-3.5 text-brand-text placeholder:text-brand-muted focus:border-brand-bronze focus:outline-none" />
              <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                data-testid="lead-message" placeholder="Anything else Kendra should know?" rows={4}
                className="w-full bg-[#0A0A0B] border border-brand-line px-4 py-3.5 text-brand-text placeholder:text-brand-muted focus:border-brand-bronze focus:outline-none resize-none" />
              <button type="submit" disabled={sending} data-testid="lead-submit"
                className="w-full bg-brand-bronze text-brand-bg py-4 font-medium hover:bg-brand-text transition-colors disabled:opacity-60">
                {sending ? "Sending…" : "Send my application"}
              </button>
            </form>
          </Reveal>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
};

export default Home;
