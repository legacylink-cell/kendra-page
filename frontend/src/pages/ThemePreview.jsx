import { useEffect } from "react";
import { HeartHandshake, Sparkles, Users, Flower2, ArrowRight } from "lucide-react";

const C = { cream: "#F7EFE3", sand: "#E7D4AB", clay: "#D2AF9A", clayDeep: "#C08B6F", ink: "#363636", black: "#1A1A1A" };

const Wave = ({ color = "#FFFFFF", flip }) => (
  <svg viewBox="0 0 1000 100" preserveAspectRatio="none" className="w-full h-[60px] block" style={flip ? { transform: "rotate(180deg)" } : {}}>
    <path d="M1000,4.3V0H0v4.3C0.9,23.1,126.7,99.2,500,100S1000,22.7,1000,4.3z" fill={color} />
  </svg>
);

const features = [
  { icon: HeartHandshake, t: "1:1 Coaching", d: "Personal strength coaching built around your body, your history, your goals." },
  { icon: Sparkles, t: "Feel Strong", d: "Break free from doubt and build confidence that carries into every room." },
  { icon: Users, t: "Community", d: "Train alongside women committed to becoming their strongest selves." },
  { icon: Flower2, t: "Whole-Person", d: "Movement, mindset and recovery — strong inside and out." },
];

const Btn = ({ children, dark }) => (
  <button style={{ background: dark ? C.black : C.clayDeep, fontFamily: "Poppins" }}
    className="inline-flex items-center gap-2 text-white font-semibold px-7 py-3.5 rounded-md hover:brightness-110 transition">
    {children} <ArrowRight className="h-4 w-4" />
  </button>
);

export default function ThemePreview() {
  useEffect(() => {
    const l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Roboto:wght@300;400;500&display=swap";
    document.head.appendChild(l);
    return () => { document.head.removeChild(l); };
  }, []);
  const H = { fontFamily: "Poppins, sans-serif" };
  const B = { fontFamily: "Roboto, sans-serif" };

  return (
    <div style={{ ...B, color: C.ink }} className="min-h-screen bg-white" data-testid="theme-preview">
      <div className="bg-black text-white text-center text-xs tracking-widest uppercase py-2" style={H}>
        Preview · Alive &amp; Free theme applied to CK Studio · not live
      </div>

      {/* NAV */}
      <nav className="flex items-center justify-between px-8 h-16" style={{ background: C.cream }}>
        <span style={H} className="text-2xl font-bold">C<span style={{ color: C.clayDeep }}>K</span> Studio</span>
        <div className="hidden md:flex gap-8 text-sm font-medium" style={H}>
          <span>About</span><span>Programs</span><span>Results</span><span>Contact</span>
        </div>
        <Btn dark>Start Here</Btn>
      </nav>

      {/* HERO */}
      <section style={{ background: C.cream }} className="px-8 pt-16 pb-4 text-center">
        <p style={H} className="uppercase tracking-[0.2em] text-sm mb-3" >Strength for women · by a woman</p>
        <h1 style={H} className="font-bold leading-[1.05] text-5xl sm:text-6xl">Come Alive.</h1>
        <h1 style={H} className="font-bold leading-[1.05] text-5xl sm:text-6xl mt-1">
          Be <span style={{ borderBottom: `4px solid ${C.clayDeep}` }}>Strong</span>. Lead Others.
        </h1>
        <p className="max-w-xl mx-auto text-lg mt-6" style={B}>
          KP — CK Studio helps women heal, build real strength, and step into confident, capable bodies with Kendra Albritton.
        </p>
        <div className="flex gap-4 justify-center mt-8 mb-4"><Btn>Heal &amp; Transform</Btn><Btn dark>Become Strong</Btn></div>
      </section>
      <Wave color="#FFFFFF" />

      {/* FEATURES */}
      <section className="max-w-6xl mx-auto px-8 py-14 text-center">
        <p style={H} className="uppercase tracking-[0.2em] text-sm mb-2" style={{ ...H, color: C.clayDeep }}>Meet the founder</p>
        <h2 style={H} className="font-semibold text-4xl sm:text-5xl mb-12">Our Beautiful Messy Journey</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f) => (
            <div key={f.t} className="group">
              <div className="mx-auto inline-flex p-5 rounded-full transition-transform group-hover:-translate-y-1" style={{ background: C.sand }}>
                <f.icon className="h-8 w-8" style={{ color: C.clayDeep }} />
              </div>
              <h3 style={H} className="font-semibold text-xl mt-5 mb-2">{f.t}</h3>
              <p className="leading-relaxed text-[15px]" style={B}>{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SAND STATS BAND */}
      <Wave color={C.sand} flip />
      <section style={{ background: C.sand }} className="px-8 py-14">
        <div className="max-w-5xl mx-auto grid sm:grid-cols-3 gap-8 text-center">
          {[["10+", "Years coaching"], ["350+", "Women trained"], ["100%", "Personalized"]].map(([n, l]) => (
            <div key={l}><div style={H} className="font-bold text-5xl" >{n}</div><p style={H} className="mt-1 uppercase tracking-wide text-sm">{l}</p></div>
          ))}
        </div>
      </section>
      <Wave color={C.sand} />

      {/* PROGRAM CARDS */}
      <section className="max-w-6xl mx-auto px-8 py-14 text-center">
        <h2 style={H} className="font-semibold text-4xl sm:text-5xl mb-10">Your Journey to Strength</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {["1:1 Personal Training", "Small Group Strength", "Online Coaching"].map((p) => (
            <div key={p} className="rounded-2xl p-8 text-left shadow-[0_8px_30px_rgba(54,54,54,0.06)]" style={{ background: C.cream, border: `1px solid ${C.clay}` }}>
              <div className="inline-flex p-3 rounded-xl mb-5" style={{ background: C.clay }}><Flower2 className="h-6 w-6 text-white" /></div>
              <h3 style={H} className="font-semibold text-2xl mb-2">{p}</h3>
              <p style={B} className="text-[15px] mb-5">Expert programming that evolves with your progress and life.</p>
              <span style={{ ...H, color: C.clayDeep }} className="inline-flex items-center gap-1 font-medium text-sm">Enquire <ArrowRight className="h-4 w-4" /></span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <Wave color={C.clay} flip />
      <section style={{ background: C.clay }} className="px-8 py-16 text-center text-white">
        <h2 style={H} className="font-bold text-4xl sm:text-5xl">You Were Made to Live Fully Alive</h2>
        <p className="max-w-xl mx-auto mt-4 text-white/90" style={B}>Whether you're ready to start or to go further, your journey to strength starts now.</p>
        <div className="mt-8 flex justify-center"><Btn dark>Start My Journey</Btn></div>
      </section>

      {/* SWATCHES */}
      <section className="max-w-6xl mx-auto px-8 py-14">
        <h3 style={H} className="font-semibold text-2xl mb-6">Palette &amp; type reference</h3>
        <div className="flex flex-wrap gap-4 mb-8">
          {[["Cream", C.cream], ["Sand", C.sand], ["Clay", C.clay], ["Clay Deep", C.clayDeep], ["Charcoal", C.ink], ["Black", C.black]].map(([n, hex]) => (
            <div key={n} className="w-36"><div className="h-16 rounded-xl border border-gray-200" style={{ background: hex }} /><p style={H} className="text-xs font-semibold mt-2">{n}</p><p className="text-xs text-gray-500">{hex}</p></div>
          ))}
        </div>
        <p style={H} className="font-bold text-4xl">Poppins — Headings</p>
        <p className="text-lg mt-2" style={B}>Roboto — body copy. The quick brown fox jumps over the lazy dog.</p>
      </section>
    </div>
  );
}
