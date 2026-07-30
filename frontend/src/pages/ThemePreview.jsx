import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, ArrowUpRight, ArrowLeft, Dumbbell, Users, Laptop,
  Baby, Salad, Flower2, Check, Menu, Facebook, Instagram, UserCheck,
} from "lucide-react";

/* THEME-ONLY PREVIEW — VRTO colors + Roboto Flex fonts on the real KP layout.
   Nothing here touches the live site. */

const C = {
  bg: "#FFFFFF",
  sectionAlt: "#F0F9FF",
  card: "#FFFFFF",
  border: "#E2ECF3",
  ink: "#003C5D",     // midnight azure — headings
  muted: "#4B4B4B",   // body
  blue: "#007BBF",    // electric blue — primary
  blueHover: "#0069A3",
  rose: "#FF2E92",    // electric rose — accent
  navy: "#003C5D",
};

const IMG = {
  hero: "/kendra-white.jpg", aboutMain: "/kendra-selfie.jpg", aboutSub: "/kendra-cable.jpg",
  barbell: "/kendra-barbell.jpg", cable: "/kendra-cable.jpg", community: "/kp-community.jpg", marathon: "/kendra-marathon.jpg",
};

const H = { fontFamily: "'Roboto Flex', sans-serif" };
const B = { fontFamily: "'Roboto Flex', Arial, sans-serif" };

const Reveal = ({ children, delay = 0, className = "" }) => (
  <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }}
    transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }} className={className}>{children}</motion.div>
);

const Eyebrow = ({ children }) => (
  <p style={{ ...H, color: C.rose }} className="text-xs tracking-[0.2em] uppercase font-extrabold mb-4">{children}</p>
);

const features = [
  { icon: UserCheck, t: "Expert Coaching", d: "Real guidance from Kendra — form-first, personal, and built around your goals." },
  { icon: Dumbbell, t: "Intelligent Training", d: "Proven strength programming designed to build real, lasting power." },
  { icon: Salad, t: "Smart Nutrition", d: "Flexible, sustainable nutrition that fits your real life — no crash diets." },
  { icon: Users, t: "Supportive Community", d: "Train alongside women committed to becoming their strongest selves." },
];

const programs = [
  { icon: Dumbbell, title: "1:1 Personal Training", tag: "Signature" },
  { icon: Users, title: "Small Group Strength", tag: "Community" },
  { icon: Laptop, title: "Online Coaching", tag: "Anywhere" },
  { icon: Baby, title: "Pre & Postnatal", tag: "Mama Strong" },
  { icon: Salad, title: "Nutrition Coaching", tag: "Fuel" },
  { icon: Flower2, title: "Mind · Body · Soul", tag: "Holistic" },
];

const testimonials = [
  { q: "Kendra didn't just change my body. She rebuilt how I see myself.", n: "Maya R.", r: "Down 22 lbs · 14 months" },
  { q: "I deadlifted double my bodyweight at 41. I never thought that could be me.", n: "Danielle P.", r: "1:1 Client" },
  { q: "The most thoughtful coaching I've ever had. She treats your goals like they're sacred.", n: "Priya S.", r: "Online Coaching" },
];

const Btn = ({ children, dark }) => (
  <span style={{ ...H, background: dark ? C.navy : C.blue }}
    className="inline-flex items-center gap-2 text-white font-extrabold uppercase tracking-wide px-7 py-3.5 rounded-lg text-sm cursor-default">
    {children} <ArrowUpRight className="h-4 w-4" />
  </span>
);

export default function ThemePreview() {
  const [ti, setTi] = useState(0);
  useEffect(() => {
    const l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Roboto+Flex:opsz,wght@8..144,300;8..144,400;8..144,600;8..144,800&display=swap";
    document.head.appendChild(l);
    return () => { document.head.removeChild(l); };
  }, []);
  const inputStyle = { background: "#fff", border: `1px solid ${C.border}`, color: C.ink, ...B };

  return (
    <div style={{ background: C.bg, color: C.muted, ...B }} data-testid="theme-preview">
      <div className="text-center text-[11px] tracking-[0.2em] uppercase py-2 text-white font-extrabold" style={{ ...H, background: C.navy }}>
        Theme preview · VRTO colors + Roboto Flex on the real KP layout · not live
      </div>

      {/* NAV */}
      <header className="sticky top-0 z-50" style={{ background: "#fff", borderBottom: `1px solid ${C.border}` }}>
        <div className="text-white text-center text-[11px] uppercase py-2.5 font-extrabold tracking-wide" style={{ ...H, background: C.blue }}>
          Now coaching women in Argyle, TX — virtual &amp; in-person
        </div>
        <nav className="max-w-7xl mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
          <span style={{ ...H, color: C.ink }} className="text-3xl font-extrabold uppercase tracking-tight">KP <span style={{ color: C.blue }}>Studio</span></span>
          <div className="hidden lg:flex gap-8 text-sm font-semibold uppercase tracking-wide" style={{ ...H, color: C.ink }}>
            <span>About</span><span>Approach</span><span>Programs</span><span>Results</span><span>Contact</span>
          </div>
          <div className="hidden lg:block"><Btn>Start Here</Btn></div>
          <Menu className="lg:hidden" style={{ color: C.ink }} />
        </nav>
      </header>

      {/* HERO — photo with dark gradient overlay */}
      <section className="relative min-h-[70vh] flex items-end overflow-hidden">
        <img src={IMG.hero} alt="Kendra" className="absolute inset-0 w-full h-full object-cover object-top" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,20,35,0.9) 0%, rgba(0,30,55,0.45) 45%, rgba(0,30,55,0.1) 100%)" }} />
        <div className="relative z-10 max-w-7xl mx-auto w-full px-6 md:px-12 py-16">
          <p style={{ ...H }} className="text-white/90 uppercase font-bold text-sm tracking-wide mb-2">Strength for women · by a woman</p>
          <h1 style={H} className="text-white font-extrabold uppercase leading-[0.95] text-5xl sm:text-6xl md:text-7xl max-w-3xl">
            Real strength. <span style={{ color: C.rose }}>Built to last.</span>
          </h1>
          <p style={B} className="text-white/90 text-lg max-w-xl mt-5">
            KP Studio is the private strength practice of Kendra Albritton — where women build real power and unshakeable confidence.
          </p>
          <div className="flex flex-wrap gap-4 mt-8"><Btn>Start Here</Btn><Btn dark>View Programs</Btn></div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-16">
        <h2 style={{ ...H, color: C.ink }} className="uppercase font-extrabold text-3xl sm:text-5xl leading-tight mb-10">
          Built for women who want <span style={{ color: C.rose }}>real progress</span>
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <div key={f.t} className="group">
              <div className="inline-flex p-4 rounded-2xl mb-5 transition-transform group-hover:scale-110" style={{ border: `1px solid ${C.rose}` }}>
                <f.icon className="h-10 w-10" style={{ color: C.rose }} />
              </div>
              <h3 style={{ ...H, color: C.ink }} className="uppercase font-bold text-xl tracking-tight mb-2">{f.t}</h3>
              <div className="w-12 h-px mb-3" style={{ background: `linear-gradient(to right, ${C.blue}, transparent)` }} />
              <p style={B} className="text-[15px] leading-relaxed">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="py-20 px-6 md:px-12" style={{ background: C.sectionAlt }}>
        <div className="max-w-7xl mx-auto grid md:grid-cols-12 gap-12 items-center">
          <Reveal className="md:col-span-5">
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden aspect-[4/5] w-4/5 ring-8 ring-white shadow-[0_25px_60px_rgba(0,60,93,0.25)]">
                <img src={IMG.aboutMain} alt="Kendra" className="w-full h-full object-cover object-top" />
              </div>
              <div className="absolute -bottom-6 right-0 w-1/2 aspect-square rounded-2xl overflow-hidden ring-8 ring-white shadow-xl">
                <img src={IMG.aboutSub} alt="Kendra coaching" className="w-full h-full object-cover" />
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.15} className="md:col-span-7">
            <Eyebrow>Meet Kendra</Eyebrow>
            <h2 style={{ ...H, color: C.ink }} className="uppercase font-extrabold text-4xl sm:text-5xl leading-tight mb-6">Coaching that treats your goals like they're sacred</h2>
            <p style={B} className="text-lg leading-relaxed mb-5">
              Hi ya'll! I'm Kendra Albritton and I've had the joy of leading others to their health &amp; fitness goals for over a decade. Since becoming a mom, my passion is supporting women in becoming their strongest &amp; healthiest — for themselves and their loved ones.
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {["Women-only coaching", "Personalized programming", "Form-first strength", "Real accountability"].map((f) => (
                <div key={f} style={{ ...B, color: C.ink }} className="flex items-center gap-3 text-sm font-medium">
                  <span className="h-6 w-6 rounded-full flex items-center justify-center shrink-0" style={{ background: `${C.blue}1a` }}><Check className="h-3.5 w-3.5" style={{ color: C.blue }} /></span>{f}
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* PROGRAMS */}
      <section id="programs" className="max-w-7xl mx-auto px-6 md:px-12 py-20">
        <Eyebrow>The Work</Eyebrow>
        <h2 style={{ ...H, color: C.ink }} className="uppercase font-extrabold text-4xl sm:text-6xl leading-tight mb-12">Choose how you want to get strong</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((p) => (
            <div key={p.title} className="rounded-2xl p-8 flex flex-col shadow-[0_8px_30px_rgba(0,60,93,0.06)] hover:shadow-[0_14px_40px_rgba(0,60,93,0.12)] transition-shadow" style={{ background: C.card, border: `1px solid ${C.border}` }}>
              <div className="flex items-center justify-between mb-6">
                <span className="h-12 w-12 rounded-xl flex items-center justify-center" style={{ background: `${C.blue}12` }}><p.icon className="h-5 w-5" style={{ color: C.blue }} /></span>
                <span style={{ ...H, color: C.rose }} className="text-[10px] uppercase tracking-[0.2em] font-extrabold">{p.tag}</span>
              </div>
              <h3 style={{ ...H, color: C.ink }} className="uppercase font-bold text-2xl mb-4 tracking-tight">{p.title}</h3>
              <p style={B} className="text-sm leading-relaxed flex-1">Expert programming that evolves with your progress and your life.</p>
              <span style={{ ...H, color: C.blue }} className="mt-6 inline-flex items-center gap-1 font-extrabold uppercase text-xs tracking-wide">Enquire <ArrowRight className="h-4 w-4" /></span>
            </div>
          ))}
        </div>
      </section>

      {/* RESULTS band — navy gradient */}
      <section className="py-20 px-6 md:px-12 text-white relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${C.navy} 0%, ${C.blue} 100%)` }}>
        <div className="max-w-7xl mx-auto">
          <h2 style={H} className="uppercase font-extrabold text-4xl sm:text-6xl leading-tight mb-10">Real women. <span style={{ color: C.rose }}>Real strength.</span></h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {[{ src: IMG.barbell, cap: "Strength platform" }, { src: IMG.cable, cap: "Every rep, coached" }].map((g, i) => (
              <div key={i} className="relative overflow-hidden rounded-2xl ring-4 ring-white/10">
                <img src={g.src} alt={g.cap} className="w-full aspect-[3/2] object-cover" />
                <span style={H} className="absolute bottom-3 left-4 text-xs uppercase font-bold tracking-wide">{g.cap}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 px-6 md:px-12" style={{ background: C.sectionAlt }}>
        <div className="max-w-4xl mx-auto text-center">
          <Eyebrow>Client Love</Eyebrow>
          <div className="relative min-h-[180px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.blockquote key={ti} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.5 }} style={{ ...H, color: C.ink }} className="uppercase font-extrabold text-2xl sm:text-4xl leading-tight">
                "{testimonials[ti].q}"
                <footer className="mt-6 not-italic">
                  <span style={{ ...B, color: C.blue }} className="block text-sm tracking-wide uppercase font-bold">{testimonials[ti].n}</span>
                  <span style={{ ...B, color: C.muted }} className="block text-xs mt-1 uppercase tracking-wide">{testimonials[ti].r}</span>
                </footer>
              </motion.blockquote>
            </AnimatePresence>
          </div>
          <div className="flex items-center justify-center gap-4 mt-8">
            {[ArrowLeft, ArrowRight].map((Ic, i) => (
              <button key={i} onClick={() => setTi(i ? (ti + 1) % testimonials.length : (ti - 1 + testimonials.length) % testimonials.length)}
                className="h-12 w-12 rounded-full flex items-center justify-center text-white" style={{ background: C.blue }}><Ic className="h-4 w-4" /></button>
            ))}
          </div>
        </div>
      </section>

      {/* CTA — signature VRTO gradient */}
      <section className="py-20 px-6 md:px-12 text-white text-center" style={{ background: "linear-gradient(135deg,#FF2E92 0%,#7B7DE2 45%,#00A3E0 100%)" }}>
        <h2 style={H} className="uppercase font-extrabold text-4xl sm:text-6xl leading-tight max-w-3xl mx-auto">Not sure where to start?</h2>
        <p style={B} className="text-white/90 mt-4 max-w-xl mx-auto">Just a clear plan built around you to get results. This is KP Studio.</p>
        <div className="mt-8 flex justify-center">
          <span style={{ ...H, background: C.rose }} className="inline-flex items-center gap-2 text-white font-extrabold uppercase px-8 py-4 rounded-lg text-lg shadow-lg cursor-default">Apply to train</span>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="py-20 px-6 md:px-12">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-14">
          <div>
            <Eyebrow>Apply to Train</Eyebrow>
            <h2 style={{ ...H, color: C.ink }} className="uppercase font-extrabold text-4xl sm:text-5xl leading-tight mb-5">Let's build the strongest version of you</h2>
            <p style={B} className="text-lg leading-relaxed max-w-md">Spots are limited and every client is coached personally. Tell Kendra your goals and she'll reach out.</p>
          </div>
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <input placeholder="Full name" className="w-full rounded-lg px-4 py-3.5" style={inputStyle} />
              <input placeholder="Phone" className="w-full rounded-lg px-4 py-3.5" style={inputStyle} />
            </div>
            <input placeholder="Email address" className="w-full rounded-lg px-4 py-3.5" style={inputStyle} />
            <textarea placeholder="Your main goal" rows={4} className="w-full rounded-lg px-4 py-3.5 resize-none" style={inputStyle} />
            <span style={{ ...H, background: C.blue }} className="w-full flex items-center justify-center text-white font-extrabold uppercase py-4 rounded-lg cursor-default">Send message</span>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="text-white py-16 px-6 md:px-12" style={{ background: C.navy }}>
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-10">
          <div>
            <div style={H} className="text-4xl font-extrabold uppercase tracking-tight">KP <span style={{ color: C.rose }}>Studio</span></div>
            <p style={{ ...B, color: "#cfe0ec" }} className="mt-3 max-w-xs text-sm">Strength coaching for women, by Kendra Albritton.</p>
            <div className="flex gap-3 mt-5">{[Instagram, Facebook].map((Ic, i) => <span key={i} className="h-9 w-9 rounded-full border border-white/20 flex items-center justify-center"><Ic className="h-4 w-4" /></span>)}</div>
          </div>
          <div style={{ ...B, color: "#cfe0ec" }} className="text-sm space-y-2">
            <p style={{ ...H, color: C.rose }} className="uppercase tracking-[0.2em] text-xs font-extrabold mb-3">Explore</p>
            <span className="block">About Kendra</span><span className="block">Programs</span><span className="block">Results</span>
          </div>
          <div style={{ ...B, color: "#cfe0ec" }} className="text-sm space-y-2">
            <p style={{ ...H, color: C.rose }} className="uppercase tracking-[0.2em] text-xs font-extrabold mb-3">Studio</p>
            <span className="block">kalbritton13@gmail.com</span><p>Argyle, TX · By appointment</p><p>PayPal · Venmo · Zelle</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
