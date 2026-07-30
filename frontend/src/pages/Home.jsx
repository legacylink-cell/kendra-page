import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, ArrowUpRight, ArrowLeft, Dumbbell, Users, Laptop,
  Baby, Salad, Flower2, Check,
} from "lucide-react";
import { toast } from "sonner";
import { MarketingNav, MarketingFooter } from "@/components/marketing/MarketingChrome";
import api, { apiErr } from "@/lib/api";
import { track } from "@/lib/track";

const IMG = {
  hero: "/kendra-white.jpg",
  aboutMain: "/kendra-selfie.jpg",
  aboutSub: "/kendra-cable.jpg",
  barbell: "/kendra-barbell.jpg",
  cable: "/kendra-cable.jpg",
  community: "/kp-community.jpg",
  marathon: "/kendra-marathon.jpg",
};

const Reveal = ({ children, delay = 0, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-80px" }}
    transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

const Eyebrow = ({ children }) => (
  <p className="text-xs tracking-[0.25em] uppercase font-semibold text-[#A9784E] mb-6">/ {children} /</p>
);

const programs = [
  { icon: Dumbbell, title: "1:1 Personal Training", desc: "Fully bespoke strength programming, coached in person. Every rep intentional, every session progressing toward your goal.", tag: "Signature" },
  { icon: Users, title: "Small Group Strength", desc: "Train alongside 2–4 women in a focused, high-energy room. Community accountability with individual coaching eyes on you.", tag: "Community" },
  { icon: Laptop, title: "Online Coaching", desc: "Custom programs, weekly check-ins, and video form reviews — train on your schedule with Kendra in your corner.", tag: "Anywhere" },
  { icon: Baby, title: "Pre & Postnatal", desc: "Safe, expert strength coaching through every trimester and beyond — stay strong during pregnancy and rebuild after baby.", tag: "Mama Strong" },
  { icon: Salad, title: "Nutrition Coaching", desc: "Personalized, sustainable nutrition that fuels your training and fits your real life — no crash diets, no guilt.", tag: "Fuel" },
  { icon: Flower2, title: "Mind · Body · Soul", desc: "A holistic program connecting movement, mindset, and recovery so you feel as strong inside as you look outside.", tag: "Holistic" },
];

const aboutYou = [
  "You want to get genuinely strong — not smaller.",
  "You're done with cookie-cutter programs that ignore how your body actually moves.",
  "You want a coach who watches your form and adjusts to you, session by session.",
  "You want to understand the why, not just follow a template.",
  "You're building strength that lasts — for life, not just a season.",
];

const different = [
  "Every program is built around your body, your history, and your goals.",
  "Form-first coaching — we fix movement patterns, not just chase reps.",
  "Women-only, judgment-free training focused on strength and confidence.",
  "Sustainable nutrition guidance that fits your real, busy life.",
  "Progress you can measure — in strength, energy, and how you feel.",
];

const testimonials = [
  { q: "Kendra didn't just change my body. She rebuilt how I see myself. I walk into any room differently now.", n: "Maya R.", r: "Down 22 lbs · 14 months" },
  { q: "I deadlifted double my bodyweight at 41. I never thought that sentence could be about me.", n: "Danielle P.", r: "1:1 Client" },
  { q: "The most professional, thoughtful coaching I've ever had. She treats your goals like they're sacred.", n: "Priya S.", r: "Online Coaching" },
  { q: "After two pregnancies I felt broken. Kendra rebuilt my core and my confidence — I feel unstoppable.", n: "Renee T.", r: "Pre & Postnatal" },
  { q: "She notices everything — a tweak here, a cue there. My chronic back pain is finally gone.", n: "Alison W.", r: "Small Group" },
];

const Home = () => {
  const [form, setForm] = useState({ name: "", email: "", phone: "", goal: "", message: "" });
  const [sending, setSending] = useState(false);
  const [ti, setTi] = useState(0);

  const enquire = (title) => {
    setForm((f) => ({ ...f, goal: `Interested in: ${title}` }));
    track("click", { label: `Enquire — ${title}` });
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    let load = 0;
    try {
      const nav = performance.getEntriesByType("navigation")[0];
      if (nav) load = Math.round(nav.loadEventEnd || nav.responseEnd || 0);
    } catch (e) {}
    track("page_view", { value: load });
    const seen = new Set();
    const onScroll = () => {
      const el = document.documentElement;
      const pct = ((window.scrollY + window.innerHeight) / el.scrollHeight) * 100;
      [25, 50, 75, 100].forEach((m) => { if (pct >= m && !seen.has(m)) { seen.add(m); track("scroll", { value: m }); } });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.post("/leads", form);
      toast.success("Message sent — Kendra will reach out personally.");
      track("form_submit", { label: form.goal || "contact" });
      setForm({ name: "", email: "", phone: "", goal: "", message: "" });
    } catch (err) {
      toast.error(apiErr(err.response?.data?.detail));
    } finally {
      setSending(false);
    }
  };

  const inputCls = "w-full bg-[#F5F2ED] border border-[#DCD4C7] rounded-xl px-4 py-3.5 text-[#1C1B1A] placeholder:text-[#4A4744]/50 focus:border-[#A9784E] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A9784E]/30 transition-colors";

  return (
    <div id="top" className="bg-[#EFE9E1] text-[#1C1B1A] font-body selection:bg-[#A9784E] selection:text-white">
      <MarketingNav />

      {/* HERO */}
      <section className="relative pt-36 md:pt-40 pb-20 md:pb-28 px-6 md:px-12 overflow-hidden">
        <div className="max-w-7xl mx-auto grid md:grid-cols-12 gap-10 md:gap-8 items-center">
          <div className="md:col-span-7">
            <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
              className="text-xs tracking-[0.25em] uppercase font-semibold text-[#A9784E] mb-6">/ Strength for women · by a woman /</motion.p>
            <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
              className="font-display text-5xl sm:text-6xl md:text-7xl leading-[0.98] tracking-tight text-[#1C1B1A]">
              Real strength.
              <br />
              <span className="italic text-[#A9784E]">Built to last.</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.35 }}
              className="text-[#4A4744] text-lg max-w-lg mt-8 leading-relaxed">
              KP Studio is the private strength practice of <span className="text-[#1C1B1A] font-semibold">Kendra Albritton</span> —
              where women build real power, unshakeable confidence, and results that outlast any trend.
            </motion.p>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.5 }}
              className="flex flex-wrap gap-4 mt-10">
              <a href="#contact" data-testid="hero-cta-start" onClick={() => track("click", { label: "Hero — Start Here" })}
                className="group inline-flex items-center gap-2 bg-[#A9784E] text-white px-8 py-4 rounded-full text-sm uppercase tracking-[0.15em] hover:bg-[#8C5F3F] hover:scale-[1.03] transition-transform">
                Start Here
                <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
              <a href="#programs" data-testid="hero-cta-programs"
                className="inline-flex items-center gap-2 border border-[#1C1B1A]/25 text-[#1C1B1A] px-8 py-4 rounded-full text-sm uppercase tracking-[0.15em] hover:border-[#A9784E] hover:text-[#A9784E] transition-colors">
                View Programs
              </a>
            </motion.div>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="md:col-span-5 relative">
            <div className="relative rounded-[32px] overflow-hidden bg-[#E5DCCF]">
              <img src={IMG.hero} alt="Kendra Albritton" className="w-full h-full object-cover mix-blend-multiply" />
            </div>
            <div className="absolute -bottom-5 -left-3 sm:left-6 bg-[#1C1B1A] text-[#EFE9E1] px-6 py-4 rounded-2xl shadow-[0_10px_40px_rgba(28,27,26,0.15)]">
              <p className="font-display text-4xl leading-none">10+</p>
              <p className="text-[10px] uppercase tracking-[0.2em] mt-1 text-[#EFE9E1]/70">Years coaching women</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ABOUT KENDRA */}
      <section id="about" className="scroll-mt-32 py-20 md:py-32 px-6 md:px-12 bg-[#F5F2ED]">
        <div className="max-w-7xl mx-auto grid md:grid-cols-12 gap-12 md:gap-16 items-center">
          <Reveal className="md:col-span-5 order-2 md:order-1">
            <div className="relative">
              <div className="relative rounded-[28px] overflow-hidden aspect-[4/5] w-4/5">
                <img src={IMG.aboutMain} alt="Kendra Albritton" className="w-full h-full object-cover object-top" />
              </div>
              <div className="absolute bottom-[-2rem] right-0 w-1/2 aspect-square rounded-[20px] overflow-hidden border-8 border-[#F5F2ED] shadow-[0_10px_40px_rgba(28,27,26,0.12)]">
                <img src={IMG.aboutSub} alt="Kendra coaching" className="w-full h-full object-cover" />
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.15} className="md:col-span-7 order-1 md:order-2">
            <Eyebrow>Meet Kendra</Eyebrow>
            <h2 className="font-display text-4xl sm:text-5xl leading-[1.05] tracking-tight mb-8">
              Coaching that treats your goals like they're sacred.
            </h2>
            <p className="text-[#4A4744] text-lg leading-relaxed mb-5">
              Hi ya'll! My name is <span className="text-[#1C1B1A] font-medium">Kendra Albritton</span> and I have had the joy &amp; pleasure of
              leading others to achieve their health &amp; fitness goals for over a decade now. Since obtaining my ACE personal training
              certification back in 2016, I have worked with all ages including kids to seniors and both men and women. However, since becoming
              a first time mom back in 2019 &amp; now being postpartum with my second little babe, my passion is to support women in becoming
              their strongest &amp; healthiest for themselves as well as their loved ones.
            </p>
            <p className="text-[#4A4744] text-lg leading-relaxed mb-5">
              Witnessing women break mental barriers &amp; push past their limiting beliefs in &amp; out of the gym is what fires me up most!
              I have a degree in psychology from Oklahoma State University (Go Pokes! 🍊) &amp; with my background in studying the mind and from
              my decade of experience working closely with individuals in the gym, I have discovered everything begins in the mind.
            </p>
            <p className="text-[#4A4744] text-lg leading-relaxed mb-5">
              I coach my clients to dig deep in discovering their <span className="text-[#1C1B1A] font-medium">'why'</span> behind their
              fitness &amp; health goals so they may obtain lasting &amp; long term success that will not only change their lives for the
              better, but have a positive impact on future generations!
            </p>
            <p className="text-[#4A4744] text-lg leading-relaxed mb-8">
              So if you're looking to make lasting change this year &amp; years to come, I'd love the opportunity to support you on your
              journey! I'm so excited to get to continue this life changing work &amp; I look forward to supporting more of you in becoming
              the best versions of YOU! 💪💞
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {["Women-only coaching", "Personalized programming", "Form-first strength", "Real accountability"].map((f) => (
                <div key={f} className="flex items-center gap-3 text-sm text-[#1C1B1A]">
                  <span className="h-6 w-6 rounded-full bg-[#A9784E]/15 flex items-center justify-center shrink-0">
                    <Check className="h-3.5 w-3.5 text-[#A9784E]" />
                  </span>
                  {f}
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ABOUT YOU + DIFFERENTIATOR */}
      <section id="approach" className="scroll-mt-32 py-20 md:py-32 px-6 md:px-12">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 md:gap-20">
          <Reveal>
            <Eyebrow>This is you</Eyebrow>
            <h2 className="font-display text-4xl sm:text-5xl leading-[1.05] tracking-tight mb-10">
              You're not chasing the latest fitness trend.
            </h2>
            <ul className="space-y-5">
              {aboutYou.map((t) => (
                <li key={t} className="flex gap-4 text-[#4A4744] leading-relaxed">
                  <span className="mt-2.5 h-1.5 w-1.5 rounded-full bg-[#A9784E] shrink-0" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
            <p className="mt-10 font-medium text-[#1C1B1A] text-lg">
              You need coaching that's customized to you, intelligent, and built to last.
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="bg-[#E5DCCF] rounded-[32px] p-8 md:p-12 h-full">
              <Eyebrow>What makes this different</Eyebrow>
              <h3 className="font-display text-3xl sm:text-4xl leading-[1.08] tracking-tight mb-8">
                Not another template. A method built around you.
              </h3>
              <ul className="space-y-5">
                {different.map((t) => (
                  <li key={t} className="flex gap-4 text-[#4A4744] leading-relaxed">
                    <Check className="h-5 w-5 text-[#A9784E] shrink-0 mt-0.5" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* PROGRAMS / SERVICES */}
      <section id="programs" className="scroll-mt-32 py-20 md:py-32 px-6 md:px-12 bg-[#F5F2ED]">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <Eyebrow>The Work</Eyebrow>
            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl tracking-tight leading-[1.02] max-w-2xl">
              Choose how you want to get strong.
            </h2>
          </Reveal>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mt-16">
            {programs.map((p, i) => (
              <Reveal key={p.title} delay={(i % 3) * 0.1}>
                <div data-testid={`program-${i}`} className="group h-full bg-[#E5DCCF] rounded-[28px] p-8 md:p-9 flex flex-col">
                  <div className="flex items-center justify-between mb-8">
                    <span className="h-12 w-12 rounded-full bg-[#EFE9E1] flex items-center justify-center">
                      <p.icon className="h-5 w-5 text-[#A9784E]" />
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-[#4A4744]">{p.tag}</span>
                  </div>
                  <h3 className="font-display text-2xl md:text-3xl mb-4 text-[#1C1B1A]">{p.title}</h3>
                  <p className="text-[#4A4744] text-sm leading-relaxed flex-1">{p.desc}</p>
                  <button type="button" onClick={() => enquire(p.title)} data-testid={`program-enquire-${i}`}
                    className="mt-8 inline-flex items-center justify-center gap-2 bg-[#A9784E] text-white px-6 py-3 rounded-full text-xs uppercase tracking-[0.15em] hover:bg-[#8C5F3F] hover:scale-[1.03] transition-transform self-start">
                    Enquire <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* RESULTS / GALLERY */}
      <section id="results" className="scroll-mt-32 py-20 md:py-32 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
              <div>
                <Eyebrow>Proof, not promises</Eyebrow>
                <h2 className="font-display text-4xl sm:text-5xl md:text-6xl tracking-tight leading-[1.02]">Real women. Real strength.</h2>
              </div>
              <a href="#contact" className="text-[#A9784E] hover:text-[#8C5F3F] text-sm inline-flex items-center gap-2 uppercase tracking-[0.12em]">
                Your story is next <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              { src: IMG.barbell, cap: "Strength platform" },
              { src: IMG.cable, cap: "Every rep, coached" },
            ].map((g, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div className="relative overflow-hidden rounded-[24px] group">
                  <img src={g.src} alt={g.cap} className="w-full aspect-[3/4] object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <span className="absolute bottom-4 left-5 text-xs uppercase tracking-[0.2em] text-white">{g.cap}</span>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <div className="relative overflow-hidden rounded-[28px] mt-5">
              <img src={IMG.community} alt="Women who've trained with Kendra" className="w-full aspect-[2/1] md:aspect-[21/9] object-cover object-top" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
              <div className="absolute bottom-6 left-6 lg:bottom-10 lg:left-10">
                <p className="font-display text-4xl lg:text-5xl text-white leading-none">Stronger together.</p>
                <p className="text-white/70 text-sm mt-2 uppercase tracking-[0.2em]">Women who've trained with Kendra</p>
              </div>
            </div>
          </Reveal>

          {/* Beyond the studio */}
          <Reveal>
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-14 items-center mt-16 bg-[#E5DCCF] rounded-[32px] p-6 lg:p-12">
              <div className="relative overflow-hidden rounded-[24px]">
                <img src={IMG.marathon} alt="Kendra at the 2024 half marathon finish line" className="w-full aspect-[4/3] object-cover" />
                <div className="absolute bottom-4 left-4 bg-[#A9784E] text-white px-4 py-2 rounded-full text-[11px] uppercase tracking-[0.2em]">2024 · 13.1 finishers</div>
              </div>
              <div>
                <Eyebrow>Beyond the studio</Eyebrow>
                <h3 className="font-display text-3xl lg:text-4xl leading-[1.08] tracking-tight mb-5">She lives it, too.</h3>
                <p className="text-[#4A4744] leading-relaxed mb-4">
                  Kendra doesn't just coach the work — she does it. Here she is with her fiancé crossing the finish line
                  of the 2024 Tour des Fleurs half marathon, medals earned.
                </p>
                <p className="text-[#4A4744] leading-relaxed">
                  Strength isn't a look — it's a life. Train with Kendra and you're learning from someone who shows up
                  for her own goals every single day.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 md:py-32 px-6 md:px-12 bg-[#1C1B1A] text-[#EFE9E1]">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs tracking-[0.25em] uppercase font-semibold text-[#A9784E] mb-8">/ Client love /</p>
          <div className="relative min-h-[220px] md:min-h-[200px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.blockquote key={ti}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                data-testid="testimonial-quote" className="font-display text-2xl sm:text-3xl md:text-4xl leading-[1.25] italic">
                “{testimonials[ti].q}”
                <footer className="mt-8 not-italic">
                  <span className="block font-body text-sm tracking-[0.1em] uppercase text-white">{testimonials[ti].n}</span>
                  <span className="block font-body text-xs text-[#EFE9E1]/50 mt-1 tracking-[0.12em] uppercase">{testimonials[ti].r}</span>
                </footer>
              </motion.blockquote>
            </AnimatePresence>
          </div>
          <div className="flex items-center justify-center gap-4 mt-10">
            <button data-testid="testimonial-prev-button" aria-label="Previous testimonial"
              onClick={() => setTi((ti - 1 + testimonials.length) % testimonials.length)}
              className="h-12 w-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-[#A9784E] hover:border-[#A9784E] transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button data-testid="testimonial-next-button" aria-label="Next testimonial"
              onClick={() => setTi((ti + 1) % testimonials.length)}
              className="h-12 w-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-[#A9784E] hover:border-[#A9784E] transition-colors">
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="py-20 md:py-28 px-6 md:px-12 bg-[#A9784E] text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl leading-[1.1] tracking-tight">
            There's no feeling like living in a strong, capable body you trust.
          </h2>
          <a href="#contact" data-testid="cta-banner-button"
            className="mt-10 inline-flex items-center gap-2 bg-[#1C1B1A] text-white px-8 py-4 rounded-full text-sm uppercase tracking-[0.15em] hover:scale-[1.03] transition-transform">
            Apply to train <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="scroll-mt-32 py-20 md:py-32 px-6 md:px-12 bg-[#F5F2ED]">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-14 lg:gap-20">
          <Reveal>
            <Eyebrow>Apply to train</Eyebrow>
            <h2 className="font-display text-4xl sm:text-5xl tracking-tight leading-[1.05] mb-6">
              Let's build the strongest version of you.
            </h2>
            <p className="text-[#4A4744] text-lg leading-relaxed max-w-md">
              Spots are limited and every client is coached personally. Tell Kendra about your goals and she'll
              reach out to see if KP Studio is the right fit.
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <form onSubmit={submit} data-testid="lead-form" className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  data-testid="lead-name" placeholder="Full name" className={inputCls} />
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  data-testid="lead-phone" placeholder="Phone" className={inputCls} />
              </div>
              <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                data-testid="lead-email" placeholder="Email address" className={inputCls} />
              <input value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })}
                data-testid="lead-goal" placeholder="Your main goal (e.g. get stronger, lose fat, feel confident)" className={inputCls} />
              <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                data-testid="lead-message" placeholder="Anything else Kendra should know?" rows={4} className={`${inputCls} resize-none`} />
              <button type="submit" disabled={sending} data-testid="lead-submit"
                className="w-full bg-[#A9784E] text-white py-4 rounded-full text-sm uppercase tracking-[0.15em] hover:bg-[#8C5F3F] transition-colors disabled:opacity-60">
                {sending ? "Sending…" : "Send message"}
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
