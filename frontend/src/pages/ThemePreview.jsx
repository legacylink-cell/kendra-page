import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, ArrowUpRight, ArrowLeft, Dumbbell, Users, Laptop,
  Baby, Salad, Flower2, Check, Menu, Facebook, Instagram,
} from "lucide-react";

/*
  THEME-ONLY PREVIEW
  Same layout/content/images as the live site — only COLORS and FONTS
  are swapped to the "Alive & Free" palette (sand / tan / clay) with
  Poppins headings + Roboto body. Nothing here touches the live site.
*/

// Alive & Free palette mapped onto the existing site's color slots
const C = {
  bg: "#F7EFE3",        // page background (was #EFE9E1)
  sectionAlt: "#FBF5EA",// alt section bg (was #F5F2ED)
  card: "#F1E6D2",      // card / panel bg (was #E5DCCF)
  border: "#E2D2B4",    // hairline border (was #DCD4C7)
  ink: "#2B2620",       // near-black text (was #1C1B1A)
  muted: "#6E665A",     // muted text (was #4A4744)
  accent: "#C08B6F",    // primary accent — clay deep (was #A9784E)
  accentHover: "#A9714F",// accent hover (was #8C5F3F)
  sand: "#E7D4AB",      // sand highlight
  dark: "#2B2620",      // dark sections (was #1C1B1A)
};

const IMG = {
  hero: "/kendra-white.jpg",
  aboutMain: "/kendra-selfie.jpg",
  aboutSub: "/kendra-cable.jpg",
  barbell: "/kendra-barbell.jpg",
  cable: "/kendra-cable.jpg",
  community: "/kp-community.jpg",
  marathon: "/kendra-marathon.jpg",
};

// font helpers
const H = { fontFamily: "'Poppins', sans-serif" };       // headings
const B = { fontFamily: "'Roboto', sans-serif" };         // body

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
  <p style={{ ...H, color: C.accent }} className="text-xs tracking-[0.25em] uppercase font-semibold mb-6">/ {children} /</p>
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

export default function ThemePreview() {
  const [ti, setTi] = useState(0);

  useEffect(() => {
    const l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;1,500;1,600&family=Roboto:wght@300;400;500&display=swap";
    document.head.appendChild(l);
    return () => { document.head.removeChild(l); };
  }, []);

  const inputCls = "w-full rounded-xl px-4 py-3.5 focus:outline-none transition-colors";
  const inputStyle = { background: C.sectionAlt, border: `1px solid ${C.border}`, color: C.ink, ...B };

  return (
    <div id="top" style={{ background: C.bg, color: C.ink, ...B }} data-testid="theme-preview">
      {/* preview flag */}
      <div className="text-center text-[11px] tracking-[0.2em] uppercase py-2 text-white" style={{ ...H, background: C.dark }}>
        Theme preview · Alive &amp; Free colors + fonts on the real layout · not live
      </div>

      {/* NAV (static) */}
      <header className="sticky top-0 z-50">
        <div className="text-white text-center text-[11px] sm:text-xs tracking-[0.15em] uppercase py-2.5 px-4" style={{ background: C.accent, ...H }}>
          Now coaching women in Argyle, TX — virtual &amp; in-person
        </div>
        <div style={{ background: `${C.bg}f2`, borderBottom: `1px solid ${C.border}` }} className="backdrop-blur-md">
          <nav className="max-w-7xl mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
            <div className="flex flex-col leading-none">
              <span style={{ ...H, color: C.ink }} className="text-3xl md:text-[34px] font-bold tracking-[-0.02em]">C<span style={{ color: C.accent }} className="italic">K</span> Studio</span>
              <span style={{ ...H, color: C.accent }} className="text-[9px] tracking-[0.4em] uppercase mt-1">Kendra Albritton</span>
            </div>
            <div className="hidden lg:flex items-center gap-9">
              {["About", "Approach", "Programs", "Results", "Contact"].map((l) => (
                <span key={l} style={{ ...B, color: C.muted }} className="text-sm tracking-wide cursor-default">{l}</span>
              ))}
            </div>
            <div className="hidden lg:flex items-center gap-5">
              <span style={{ ...H, color: C.muted }} className="text-xs tracking-wide uppercase">Trainer Login</span>
              <span style={{ ...H, background: C.accent }} className="inline-flex items-center gap-2 text-white px-6 py-3 rounded-full text-xs uppercase tracking-[0.15em]">
                Start Here <ArrowUpRight className="h-3.5 w-3.5" />
              </span>
            </div>
            <Menu className="lg:hidden" style={{ color: C.ink }} />
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="relative pt-16 md:pt-20 pb-20 md:pb-28 px-6 md:px-12 overflow-hidden">
        <div className="max-w-7xl mx-auto grid md:grid-cols-12 gap-10 md:gap-8 items-center">
          <div className="md:col-span-7">
            <p style={{ ...H, color: C.accent }} className="text-xs tracking-[0.25em] uppercase font-semibold mb-6">/ Strength for women · by a woman /</p>
            <h1 style={{ ...H, color: C.ink }} className="text-5xl sm:text-6xl md:text-7xl font-bold leading-[0.98] tracking-tight">
              Real strength.<br />
              <span style={{ color: C.accent }} className="italic">Built to last.</span>
            </h1>
            <p style={{ ...B, color: C.muted }} className="text-lg max-w-lg mt-8 leading-relaxed">
              CK Studio is the private strength practice of <span style={{ color: C.ink }} className="font-semibold">Kendra Albritton</span> —
              where women build real power, unshakeable confidence, and results that outlast any trend.
            </p>
            <div className="flex flex-wrap gap-4 mt-10">
              <span style={{ ...H, background: C.accent }} className="group inline-flex items-center gap-2 text-white px-8 py-4 rounded-full text-sm uppercase tracking-[0.15em] cursor-default">
                Start Here <ArrowUpRight className="h-4 w-4" />
              </span>
              <span style={{ ...H, border: `1px solid ${C.ink}40`, color: C.ink }} className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-sm uppercase tracking-[0.15em] cursor-default">
                View Programs
              </span>
            </div>
          </div>
          <div className="md:col-span-5 relative">
            <div className="relative rounded-[32px] overflow-hidden" style={{ background: C.card }}>
              <img src={IMG.hero} alt="Kendra Albritton" className="w-full h-full object-cover mix-blend-multiply" />
            </div>
            <div style={{ background: C.dark }} className="absolute -bottom-5 -left-3 sm:left-6 text-white px-6 py-4 rounded-2xl shadow-[0_10px_40px_rgba(43,38,32,0.2)]">
              <p style={H} className="text-4xl font-bold leading-none">10+</p>
              <p style={{ ...H, color: "#ffffffb0" }} className="text-[10px] uppercase tracking-[0.2em] mt-1">Years coaching women</p>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT KENDRA */}
      <section id="about" className="py-20 md:py-32 px-6 md:px-12" style={{ background: C.sectionAlt }}>
        <div className="max-w-7xl mx-auto grid md:grid-cols-12 gap-12 md:gap-16 items-center">
          <Reveal className="md:col-span-5 order-2 md:order-1">
            <div className="relative">
              <div className="relative rounded-[28px] overflow-hidden aspect-[4/5] w-4/5">
                <img src={IMG.aboutMain} alt="Kendra Albritton" className="w-full h-full object-cover object-top" />
              </div>
              <div className="absolute bottom-[-2rem] right-0 w-1/2 aspect-square rounded-[20px] overflow-hidden shadow-[0_10px_40px_rgba(43,38,32,0.15)]" style={{ border: `8px solid ${C.sectionAlt}` }}>
                <img src={IMG.aboutSub} alt="Kendra coaching" className="w-full h-full object-cover" />
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.15} className="md:col-span-7 order-1 md:order-2">
            <Eyebrow>Meet Kendra</Eyebrow>
            <h2 style={{ ...H, color: C.ink }} className="text-4xl sm:text-5xl font-bold leading-[1.05] tracking-tight mb-8">
              Coaching that treats your goals like they're sacred.
            </h2>
            <p style={{ ...B, color: C.muted }} className="text-lg leading-relaxed mb-5">
              Kendra Albritton is a personal trainer and group fitness coach at <span style={{ color: C.ink }} className="font-medium">Shapes Fitness</span>,
              the boutique women's club in Flower Mound, TX. She built CK Studio for one reason: too many women were handed generic
              programs and told to shrink. She coaches the opposite — get <span style={{ color: C.ink }} className="font-medium">stronger</span>,
              take up space, and train with intention.
            </p>
            <p style={{ ...B, color: C.muted }} className="text-lg leading-relaxed mb-8">
              Every program is built around your body, your history, and your life. No guesswork, no fads —
              just expert programming and relentless accountability.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {["Women-only coaching", "Personalized programming", "Form-first strength", "Real accountability"].map((f) => (
                <div key={f} style={{ ...B, color: C.ink }} className="flex items-center gap-3 text-sm">
                  <span style={{ background: `${C.accent}26` }} className="h-6 w-6 rounded-full flex items-center justify-center shrink-0">
                    <Check className="h-3.5 w-3.5" style={{ color: C.accent }} />
                  </span>
                  {f}
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ABOUT YOU + DIFFERENTIATOR */}
      <section id="approach" className="py-20 md:py-32 px-6 md:px-12">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 md:gap-20">
          <Reveal>
            <Eyebrow>This is you</Eyebrow>
            <h2 style={{ ...H, color: C.ink }} className="text-4xl sm:text-5xl font-bold leading-[1.05] tracking-tight mb-10">
              You're not chasing the latest fitness trend.
            </h2>
            <ul className="space-y-5">
              {aboutYou.map((t) => (
                <li key={t} style={{ ...B, color: C.muted }} className="flex gap-4 leading-relaxed">
                  <span style={{ background: C.accent }} className="mt-2.5 h-1.5 w-1.5 rounded-full shrink-0" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
            <p style={{ ...B, color: C.ink }} className="mt-10 font-medium text-lg">
              You need coaching that's customized to you, intelligent, and built to last.
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <div style={{ background: C.card }} className="rounded-[32px] p-8 md:p-12 h-full">
              <Eyebrow>What makes this different</Eyebrow>
              <h3 style={{ ...H, color: C.ink }} className="text-3xl sm:text-4xl font-bold leading-[1.08] tracking-tight mb-8">
                Not another template. A method built around you.
              </h3>
              <ul className="space-y-5">
                {different.map((t) => (
                  <li key={t} style={{ ...B, color: C.muted }} className="flex gap-4 leading-relaxed">
                    <Check className="h-5 w-5 shrink-0 mt-0.5" style={{ color: C.accent }} />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* PROGRAMS */}
      <section id="programs" className="py-20 md:py-32 px-6 md:px-12" style={{ background: C.sectionAlt }}>
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <Eyebrow>The Work</Eyebrow>
            <h2 style={{ ...H, color: C.ink }} className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.02] max-w-2xl">
              Choose how you want to get strong.
            </h2>
          </Reveal>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mt-16">
            {programs.map((p, i) => (
              <Reveal key={p.title} delay={(i % 3) * 0.1}>
                <div style={{ background: C.card }} className="group h-full rounded-[28px] p-8 md:p-9 flex flex-col">
                  <div className="flex items-center justify-between mb-8">
                    <span style={{ background: C.bg }} className="h-12 w-12 rounded-full flex items-center justify-center">
                      <p.icon className="h-5 w-5" style={{ color: C.accent }} />
                    </span>
                    <span style={{ ...H, color: C.muted }} className="text-[10px] uppercase tracking-[0.2em]">{p.tag}</span>
                  </div>
                  <h3 style={{ ...H, color: C.ink }} className="text-2xl md:text-3xl font-bold mb-4">{p.title}</h3>
                  <p style={{ ...B, color: C.muted }} className="text-sm leading-relaxed flex-1">{p.desc}</p>
                  <span style={{ ...H, background: C.accent }} className="mt-8 inline-flex items-center justify-center gap-2 text-white px-6 py-3 rounded-full text-xs uppercase tracking-[0.15em] self-start cursor-default">
                    Enquire <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* RESULTS */}
      <section id="results" className="py-20 md:py-32 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
              <div>
                <Eyebrow>Proof, not promises</Eyebrow>
                <h2 style={{ ...H, color: C.ink }} className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.02]">Real women. Real strength.</h2>
              </div>
              <span style={{ ...H, color: C.accent }} className="text-sm inline-flex items-center gap-2 uppercase tracking-[0.12em]">
                Your story is next <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[{ src: IMG.barbell, cap: "Strength platform" }, { src: IMG.cable, cap: "Every rep, coached" }].map((g, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div className="relative overflow-hidden rounded-[24px] group">
                  <img src={g.src} alt={g.cap} className="w-full aspect-[3/4] object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <span style={H} className="absolute bottom-4 left-5 text-xs uppercase tracking-[0.2em] text-white">{g.cap}</span>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <div className="relative overflow-hidden rounded-[28px] mt-5">
              <img src={IMG.community} alt="Women who've trained with Kendra" className="w-full aspect-[2/1] md:aspect-[21/9] object-cover object-top" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
              <div className="absolute bottom-6 left-6 lg:bottom-10 lg:left-10">
                <p style={H} className="text-4xl lg:text-5xl font-bold text-white leading-none">Stronger together.</p>
                <p style={H} className="text-white/70 text-sm mt-2 uppercase tracking-[0.2em]">Women who've trained with Kendra</p>
              </div>
            </div>
          </Reveal>

          <Reveal>
            <div style={{ background: C.card }} className="grid lg:grid-cols-2 gap-8 lg:gap-14 items-center mt-16 rounded-[32px] p-6 lg:p-12">
              <div className="relative overflow-hidden rounded-[24px]">
                <img src={IMG.marathon} alt="Kendra at the 2024 half marathon finish line" className="w-full aspect-[4/3] object-cover" />
                <div style={{ ...H, background: C.accent }} className="absolute bottom-4 left-4 text-white px-4 py-2 rounded-full text-[11px] uppercase tracking-[0.2em]">2024 · 13.1 finishers</div>
              </div>
              <div>
                <Eyebrow>Beyond the studio</Eyebrow>
                <h3 style={{ ...H, color: C.ink }} className="text-3xl lg:text-4xl font-bold leading-[1.08] tracking-tight mb-5">She lives it, too.</h3>
                <p style={{ ...B, color: C.muted }} className="leading-relaxed mb-4">
                  Kendra doesn't just coach the work — she does it. Here she is with her fiancé crossing the finish line
                  of the 2024 Tour des Fleurs half marathon, medals earned.
                </p>
                <p style={{ ...B, color: C.muted }} className="leading-relaxed">
                  Strength isn't a look — it's a life. Train with Kendra and you're learning from someone who shows up
                  for her own goals every single day.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 md:py-32 px-6 md:px-12 text-white" style={{ background: C.dark }}>
        <div className="max-w-4xl mx-auto text-center">
          <p style={{ ...H, color: C.accent }} className="text-xs tracking-[0.25em] uppercase font-semibold mb-8">/ Client love /</p>
          <div className="relative min-h-[220px] md:min-h-[200px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.blockquote key={ti}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                style={{ ...H }} className="text-2xl sm:text-3xl md:text-4xl font-medium leading-[1.25] italic">
                “{testimonials[ti].q}”
                <footer className="mt-8 not-italic">
                  <span style={B} className="block text-sm tracking-[0.1em] uppercase text-white">{testimonials[ti].n}</span>
                  <span style={{ ...B, color: "#ffffff80" }} className="block text-xs mt-1 tracking-[0.12em] uppercase">{testimonials[ti].r}</span>
                </footer>
              </motion.blockquote>
            </AnimatePresence>
          </div>
          <div className="flex items-center justify-center gap-4 mt-10">
            <button onClick={() => setTi((ti - 1 + testimonials.length) % testimonials.length)}
              className="h-12 w-12 rounded-full border border-white/20 flex items-center justify-center hover:border-transparent transition-colors"
              style={{ ["--h"]: C.accent }} onMouseEnter={(e) => (e.currentTarget.style.background = C.accent)} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button onClick={() => setTi((ti + 1) % testimonials.length)}
              className="h-12 w-12 rounded-full border border-white/20 flex items-center justify-center transition-colors"
              onMouseEnter={(e) => (e.currentTarget.style.background = C.accent)} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="py-20 md:py-28 px-6 md:px-12 text-white" style={{ background: C.accent }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 style={H} className="text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.1] tracking-tight">
            There's no feeling like living in a strong, capable body you trust.
          </h2>
          <span style={{ ...H, background: C.dark }} className="mt-10 inline-flex items-center gap-2 text-white px-8 py-4 rounded-full text-sm uppercase tracking-[0.15em] cursor-default">
            Apply to train <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="py-20 md:py-32 px-6 md:px-12" style={{ background: C.sectionAlt }}>
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-14 lg:gap-20">
          <Reveal>
            <Eyebrow>Apply to train</Eyebrow>
            <h2 style={{ ...H, color: C.ink }} className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.05] mb-6">
              Let's build the strongest version of you.
            </h2>
            <p style={{ ...B, color: C.muted }} className="text-lg leading-relaxed max-w-md">
              Spots are limited and every client is coached personally. Tell Kendra about your goals and she'll
              reach out to see if CK Studio is the right fit.
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <input placeholder="Full name" className={inputCls} style={inputStyle} />
                <input placeholder="Phone" className={inputCls} style={inputStyle} />
              </div>
              <input placeholder="Email address" className={inputCls} style={inputStyle} />
              <input placeholder="Your main goal (e.g. get stronger, lose fat, feel confident)" className={inputCls} style={inputStyle} />
              <textarea placeholder="Anything else Kendra should know?" rows={4} className={`${inputCls} resize-none`} style={inputStyle} />
              <span style={{ ...H, background: C.accent }} className="w-full flex items-center justify-center text-white py-4 rounded-full text-sm uppercase tracking-[0.15em] cursor-default">
                Send message
              </span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="text-white py-20 px-6 md:px-12" style={{ background: C.dark }}>
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12">
          <div>
            <div style={H} className="text-5xl md:text-6xl font-bold tracking-[-0.02em]">C<span style={{ color: C.accent }} className="italic">K</span> Studio</div>
            <p style={{ ...B, color: "#ffffff99" }} className="mt-4 max-w-xs text-sm leading-relaxed">
              Strength coaching for women, by Kendra Albritton. Build the body — and the belief — to match.
            </p>
            <div className="flex items-center gap-3 mt-6">
              {[Instagram, Facebook].map((Ic, i) => (
                <span key={i} className="h-9 w-9 rounded-full border border-white/20 flex items-center justify-center"><Ic className="h-4 w-4" /></span>
              ))}
            </div>
          </div>
          <div style={{ ...B, color: "#ffffffb0" }} className="text-sm space-y-3">
            <p style={{ ...H, color: C.accent }} className="uppercase tracking-[0.25em] text-xs mb-4">Explore</p>
            <span className="block">About Kendra</span>
            <span className="block">Programs</span>
            <span className="block">Results</span>
            <span className="block">Work with Kendra</span>
          </div>
          <div style={{ ...B, color: "#ffffffb0" }} className="text-sm space-y-3">
            <p style={{ ...H, color: C.accent }} className="uppercase tracking-[0.25em] text-xs mb-4">Studio</p>
            <span className="block">kalbritton13@gmail.com</span>
            <p>Argyle, TX · By appointment only</p>
            <p>Payments accepted: PayPal · Venmo · Zelle</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-14 pt-6 border-t border-white/10 text-xs flex flex-col sm:flex-row justify-between gap-2" style={{ ...B, color: "#ffffff80" }}>
          <span>© {new Date().getFullYear()} CK Studio. All rights reserved.</span>
          <span>Designed by <span style={{ color: C.accent }}>Mo Studio</span></span>
        </div>
      </footer>
    </div>
  );
}
