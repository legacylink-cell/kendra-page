import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowUpRight, ArrowLeft, Dumbbell, Users, Laptop, Baby, Salad, Flower2, Check, Menu, Facebook, Instagram, HeartHandshake } from "lucide-react";

/* THEME-ONLY PREVIEW — Alive & Free colors + Poppins/Roboto fonts on the real KP layout.
   Nothing here touches the live site. */

const C = {
  bg: "#F7EFE3", sectionAlt: "#FBF5EA", sand: "#E7D4AB", clay: "#D2AF9A",
  accent: "#C08B6F", accentHover: "#A9714F", card: "#FBF5EA", border: "#E7D4AB",
  ink: "#2B2620", muted: "#6E665A", dark: "#2B2620",
};
const IMG = { hero: "/kendra-white.jpg", aboutMain: "/kendra-selfie.jpg", aboutSub: "/kendra-cable.jpg", barbell: "/kendra-barbell.jpg", cable: "/kendra-cable.jpg", community: "/kp-community.jpg", marathon: "/kendra-marathon.jpg" };
const H = { fontFamily: "'Poppins', sans-serif" };
const B = { fontFamily: "'Roboto', sans-serif" };

const Curve = ({ fill, flip }) => (
  <div className="w-full overflow-hidden leading-none" style={{ transform: flip ? "rotate(180deg)" : "none" }}>
    <svg viewBox="0 0 1000 100" preserveAspectRatio="none" className="w-full h-[60px]"><path d="M1000,4.3V0H0v4.3C0.9,23.1,126.7,99.2,500,100S1000,22.7,1000,4.3z" fill={fill} /></svg>
  </div>
);
const Reveal = ({ children, delay = 0, className = "" }) => (
  <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }} className={className}>{children}</motion.div>
);
const Eyebrow = ({ children }) => (<p style={{ ...H, color: C.accent }} className="text-xs tracking-[0.25em] uppercase font-semibold mb-4">{children}</p>);
const Btn = ({ children, dark }) => (
  <span style={{ ...H, background: dark ? C.dark : C.accent }} className="inline-flex items-center gap-2 text-white px-7 py-3.5 rounded-full text-sm font-medium tracking-wide cursor-default">{children} <ArrowUpRight className="h-4 w-4" /></span>
);

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

export default function ThemePreview() {
  const [ti, setTi] = useState(0);
  useEffect(() => {
    const l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;1,600&family=Roboto:wght@300;400;500&display=swap";
    document.head.appendChild(l);
    return () => { document.head.removeChild(l); };
  }, []);
  const inputStyle = { background: "#fff", border: `1px solid ${C.clay}`, color: C.ink, ...B };

  return (
    <div style={{ background: C.bg, color: C.muted, ...B }} data-testid="theme-preview">
      <div className="text-center text-[11px] tracking-[0.2em] uppercase py-2 text-white" style={{ ...H, background: C.dark }}>
        Theme preview · Alive &amp; Free colors + fonts on the real KP layout · not live
      </div>

      {/* NAV */}
      <header className="sticky top-0 z-50" style={{ background: `${C.bg}f2`, borderBottom: `1px solid ${C.border}`, backdropFilter: "blur(8px)" }}>
        <div className="text-white text-center text-[11px] uppercase py-2.5 tracking-wide font-medium" style={{ ...H, background: C.accent }}>Now coaching women in Argyle, TX — virtual &amp; in-person</div>
        <nav className="max-w-7xl mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
          <span style={{ ...H, color: C.ink }} className="text-3xl font-bold tracking-tight">KP<span style={{ color: C.accent }} className="italic">.</span> Studio</span>
          <div className="hidden lg:flex gap-8 text-sm tracking-wide" style={{ ...B, color: C.muted }}><span>About</span><span>Approach</span><span>Programs</span><span>Results</span><span>Contact</span></div>
          <div className="hidden lg:block"><Btn>Start Here</Btn></div>
          <Menu className="lg:hidden" style={{ color: C.ink }} />
        </nav>
      </header>

      {/* HERO */}
      <section className="relative pt-14 pb-6 px-6 md:px-12" style={{ background: C.sectionAlt }}>
        <div className="max-w-7xl mx-auto grid md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-7">
            <p style={{ ...H, color: C.accent }} className="text-xs tracking-[0.25em] uppercase font-semibold mb-5">Strength for women · by a woman</p>
            <h1 style={{ ...H, color: C.ink }} className="text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.02] tracking-tight">Come alive.<br /><span style={{ color: C.accent }} className="italic">Get strong.</span></h1>
            <p style={B} className="text-lg max-w-lg mt-6 leading-relaxed">KP Studio is the private strength practice of Kendra Albritton — where women build real power, confidence, and results that last.</p>
            <div className="flex flex-wrap gap-4 mt-8"><Btn>Start Here</Btn><Btn dark>View Programs</Btn></div>
          </div>
          <div className="md:col-span-5 relative">
            <div className="relative rounded-[32px] overflow-hidden ring-8 ring-white shadow-[0_25px_60px_rgba(43,38,32,0.18)]"><img src={IMG.hero} alt="Kendra" className="w-full h-full object-cover" /></div>
            <div style={{ background: C.dark }} className="absolute -bottom-5 left-4 text-white px-6 py-4 rounded-2xl"><p style={H} className="text-4xl font-bold leading-none">10+</p><p style={{ ...H, color: "#ffffffb0" }} className="text-[10px] uppercase tracking-[0.2em] mt-1">Years coaching women</p></div>
          </div>
        </div>
      </section>
      <Curve fill={C.bg} />

      {/* ABOUT */}
      <section id="about" className="py-16 px-6 md:px-12">
        <div className="max-w-7xl mx-auto grid md:grid-cols-12 gap-12 items-center">
          <Reveal className="md:col-span-5 order-2 md:order-1">
            <div className="relative">
              <div className="relative rounded-[28px] overflow-hidden aspect-[4/5] w-4/5"><img src={IMG.aboutMain} alt="Kendra" className="w-full h-full object-cover object-top" /></div>
              <div className="absolute -bottom-6 right-0 w-1/2 aspect-square rounded-[20px] overflow-hidden ring-8" style={{ borderColor: C.bg, boxShadow: "0 10px 40px rgba(43,38,32,0.15)" }}><img src={IMG.aboutSub} alt="Kendra coaching" className="w-full h-full object-cover" /></div>
            </div>
          </Reveal>
          <Reveal delay={0.15} className="md:col-span-7 order-1 md:order-2">
            <Eyebrow>Meet Kendra</Eyebrow>
            <h2 style={{ ...H, color: C.ink }} className="text-4xl sm:text-5xl font-bold leading-[1.08] tracking-tight mb-6">Coaching that treats your goals like they're sacred</h2>
            <p style={B} className="text-lg leading-relaxed mb-6">Hi ya'll! I'm Kendra Albritton and I've had the joy of leading others to their health &amp; fitness goals for over a decade. Since becoming a mom, my passion is supporting women in becoming their strongest &amp; healthiest — for themselves and their loved ones.</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {["Women-only coaching", "Personalized programming", "Form-first strength", "Real accountability"].map((f) => (
                <div key={f} style={{ ...B, color: C.ink }} className="flex items-center gap-3 text-sm"><span className="h-6 w-6 rounded-full flex items-center justify-center shrink-0" style={{ background: `${C.accent}26` }}><Check className="h-3.5 w-3.5" style={{ color: C.accent }} /></span>{f}</div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* PROGRAMS */}
      <Curve fill={C.sectionAlt} />
      <section id="programs" className="py-16 px-6 md:px-12" style={{ background: C.sectionAlt }}>
        <div className="max-w-7xl mx-auto">
          <Eyebrow>The Work</Eyebrow>
          <h2 style={{ ...H, color: C.ink }} className="text-4xl sm:text-6xl font-bold tracking-tight leading-[1.05] mb-12">Choose how you want to get strong</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((p) => (
              <div key={p.title} className="rounded-[28px] p-8 flex flex-col" style={{ background: "#fff", border: `1px solid ${C.clay}` }}>
                <div className="flex items-center justify-between mb-6"><span className="h-12 w-12 rounded-full flex items-center justify-center" style={{ background: `${C.accent}18` }}><p.icon className="h-5 w-5" style={{ color: C.accent }} /></span><span style={{ ...H, color: C.accent }} className="text-[10px] uppercase tracking-[0.2em] font-medium">{p.tag}</span></div>
                <h3 style={{ ...H, color: C.ink }} className="text-2xl font-bold mb-3">{p.title}</h3>
                <p style={B} className="text-sm leading-relaxed flex-1">Expert programming built around your body, your history and your life.</p>
                <span style={{ ...H, color: C.accent }} className="mt-6 inline-flex items-center gap-1 font-medium text-sm">Enquire <ArrowRight className="h-4 w-4" /></span>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Curve fill={C.sectionAlt} flip />

      {/* RESULTS */}
      <section id="results" className="py-16 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <Eyebrow>Proof, not promises</Eyebrow>
          <h2 style={{ ...H, color: C.ink }} className="text-4xl sm:text-6xl font-bold tracking-tight leading-[1.05] mb-10">Real women. <span style={{ color: C.accent }} className="italic">Real strength.</span></h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {[{ src: IMG.barbell, cap: "Strength platform" }, { src: IMG.cable, cap: "Every rep, coached" }].map((g, i) => (
              <div key={i} className="relative overflow-hidden rounded-[24px]"><img src={g.src} alt={g.cap} className="w-full aspect-[3/2] object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" /><span style={H} className="absolute bottom-4 left-5 text-xs uppercase tracking-[0.2em] text-white">{g.cap}</span></div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS — dark */}
      <Curve fill={C.dark} />
      <section className="py-16 px-6 md:px-12 text-white" style={{ background: C.dark }}>
        <div className="max-w-4xl mx-auto text-center">
          <p style={{ ...H, color: C.accent }} className="text-xs tracking-[0.25em] uppercase font-semibold mb-6">Client Love</p>
          <div className="relative min-h-[180px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.blockquote key={ti} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.5 }} style={{ ...H }} className="text-2xl sm:text-4xl font-medium leading-[1.25] italic">
                "{testimonials[ti].q}"
                <footer className="mt-6 not-italic"><span style={{ ...B }} className="block text-sm tracking-[0.1em] uppercase">{testimonials[ti].n}</span><span style={{ ...B, color: "#ffffff80" }} className="block text-xs mt-1 tracking-[0.12em] uppercase">{testimonials[ti].r}</span></footer>
              </motion.blockquote>
            </AnimatePresence>
          </div>
          <div className="flex items-center justify-center gap-4 mt-8">
            {[ArrowLeft, ArrowRight].map((Ic, i) => (<button key={i} onClick={() => setTi(i ? (ti + 1) % testimonials.length : (ti - 1 + testimonials.length) % testimonials.length)} className="h-12 w-12 rounded-full flex items-center justify-center text-white" style={{ background: C.accent }}><Ic className="h-4 w-4" /></button>))}
          </div>
        </div>
      </section>
      <Curve fill={C.dark} flip />

      {/* CTA */}
      <section className="py-16 px-6 md:px-12 text-white text-center" style={{ background: C.accent }}>
        <h2 style={H} className="text-3xl sm:text-5xl font-bold leading-[1.1] tracking-tight max-w-3xl mx-auto">You were made to live fully alive &amp; strong</h2>
        <div className="mt-8 flex justify-center"><span style={{ ...H, background: C.dark }} className="inline-flex items-center gap-2 text-white px-8 py-4 rounded-full text-sm uppercase tracking-[0.15em] cursor-default">Apply to train</span></div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="py-16 px-6 md:px-12" style={{ background: C.sectionAlt }}>
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-14">
          <div>
            <Eyebrow>Apply to Train</Eyebrow>
            <h2 style={{ ...H, color: C.ink }} className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.08] mb-5">Let's build the strongest version of you</h2>
            <p style={B} className="text-lg leading-relaxed max-w-md">Spots are limited and every client is coached personally. Tell Kendra your goals and she'll reach out.</p>
          </div>
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4"><input placeholder="Full name" className="w-full rounded-xl px-4 py-3.5" style={inputStyle} /><input placeholder="Phone" className="w-full rounded-xl px-4 py-3.5" style={inputStyle} /></div>
            <input placeholder="Email address" className="w-full rounded-xl px-4 py-3.5" style={inputStyle} />
            <textarea placeholder="Your main goal" rows={4} className="w-full rounded-xl px-4 py-3.5 resize-none" style={inputStyle} />
            <span style={{ ...H, background: C.accent }} className="w-full flex items-center justify-center text-white py-4 rounded-full text-sm uppercase tracking-[0.15em] cursor-default">Send message</span>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="text-white py-14 px-6 md:px-12" style={{ background: C.dark }}>
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-10">
          <div>
            <div style={H} className="text-4xl font-bold tracking-tight">KP<span style={{ color: C.accent }} className="italic">.</span> Studio</div>
            <p style={{ ...B, color: "#ffffff99" }} className="mt-3 max-w-xs text-sm">Strength coaching for women, by Kendra Albritton.</p>
            <div className="flex gap-3 mt-5">{[Instagram, Facebook].map((Ic, i) => <span key={i} className="h-9 w-9 rounded-full border border-white/20 flex items-center justify-center"><Ic className="h-4 w-4" /></span>)}</div>
          </div>
          <div style={{ ...B, color: "#ffffffb0" }} className="text-sm space-y-2"><p style={{ ...H, color: C.accent }} className="uppercase tracking-[0.25em] text-xs mb-3">Explore</p><span className="block">About Kendra</span><span className="block">Programs</span><span className="block">Results</span></div>
          <div style={{ ...B, color: "#ffffffb0" }} className="text-sm space-y-2"><p style={{ ...H, color: C.accent }} className="uppercase tracking-[0.25em] text-xs mb-3">Studio</p><span className="block">kalbritton13@gmail.com</span><p>Argyle, TX · By appointment</p><p>PayPal · Venmo · Zelle</p></div>
        </div>
      </footer>
    </div>
  );
}
