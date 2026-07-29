import { useEffect } from "react";
import { UserCheck, Dumbbell, Apple, Users, ArrowUpRight, TrendingUp } from "lucide-react";

// VRTO palette
const C = {
  blue: "#00A3E0", pink: "#FF2E92", navy: "#003C5D", purple: "#7B7DE2",
  grey: "#4B4B4B", crystal: "#7FE3FF",
};
const heroGrad = `linear-gradient(135deg, ${C.pink} 0%, ${C.purple} 45%, ${C.blue} 100%)`;

const features = [
  { icon: UserCheck, t: "1:1 Coaching", d: "Real guidance from Kendra — from first-timers to seasoned lifters." },
  { icon: Dumbbell, t: "Intelligent Training", d: "Proven strength programs built to grow muscle and confidence." },
  { icon: Apple, t: "Smart Nutrition", d: "Flexible, sustainable nutrition that fits your real life." },
  { icon: Users, t: "Supportive Community", d: "Train alongside women committed to their goals." },
];

export default function ThemePreview() {
  useEffect(() => {
    const l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600&display=swap";
    document.head.appendChild(l);
    return () => { document.head.removeChild(l); };
  }, []);

  const H = { fontFamily: "Montserrat, sans-serif" };
  const B = { fontFamily: "Inter, sans-serif" };

  return (
    <div style={B} className="min-h-screen bg-white text-[#003C5D]" data-testid="theme-preview">
      {/* preview banner */}
      <div className="bg-black text-white text-center text-xs tracking-widest uppercase py-2" style={H}>
        Preview only · VRTO theme applied to CK Studio · not live
      </div>

      {/* NAV */}
      <nav className="flex items-center justify-between px-8 h-16 border-b border-gray-100">
        <span style={H} className="text-2xl font-extrabold uppercase tracking-tight">CK <span style={{ color: C.pink }}>Studio</span></span>
        <div className="hidden md:flex gap-8 text-sm font-semibold uppercase" style={H}>
          <span>About</span><span>Programs</span><span>Results</span><span>Contact</span>
        </div>
        <button style={{ ...H, background: C.blue }} className="text-white font-extrabold uppercase text-sm px-5 py-2.5 rounded-lg">Start Here</button>
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden" style={{ background: heroGrad }}>
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 items-end gap-8 px-8 pt-16 min-h-[520px]">
          <div className="pb-16 text-white">
            <p style={H} className="uppercase font-bold tracking-wide text-sm mb-2">Strength for women · by a woman</p>
            <h1 style={H} className="uppercase font-black leading-[0.95] text-5xl sm:text-6xl">Your transformation<br />starts here</h1>
            <p className="mt-4 text-white/90 text-lg max-w-md" style={B}>Unlock the training and coaching that's right for you, with Kendra Albritton.</p>
            <button style={{ ...H, background: C.blue }} className="mt-8 inline-flex items-center gap-2 text-white font-extrabold uppercase px-8 py-4 rounded-lg text-lg">
              Create your plan <ArrowUpRight className="h-5 w-5" />
            </button>
          </div>
          <div className="flex items-end justify-center">
            <img src="/kendra-white.jpg" alt="Kendra" className="max-h-[460px] object-contain mix-blend-luminosity opacity-95" />
          </div>
        </div>
      </section>

      {/* FEATURE CARDS (white) */}
      <section className="max-w-6xl mx-auto px-8 py-16">
        <h2 style={H} className="uppercase font-black leading-tight text-4xl sm:text-5xl mb-12">
          Built for women who <span style={{ color: C.pink }}>want real progress</span>
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f) => (
            <div key={f.t} className="group">
              <div className="inline-flex p-4 rounded-2xl border-2 transition-transform group-hover:scale-110" style={{ borderColor: C.pink }}>
                <f.icon className="h-8 w-8" style={{ color: C.pink }} />
              </div>
              <h3 style={H} className="uppercase font-bold text-xl mt-5 mb-3 tracking-tight">{f.t}</h3>
              <div className="w-12 h-px mb-3" style={{ background: `linear-gradient(90deg, ${C.blue}, transparent)` }} />
              <p className="text-[#4B4B4B] leading-relaxed" style={B}>{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* DARK NAVY SECTION */}
      <section className="relative overflow-hidden" style={{ background: C.navy }}>
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, #003C5D, #007BBF)`, opacity: 0.6 }} />
        <div className="relative max-w-6xl mx-auto px-8 py-16 text-white text-center">
          <h2 style={H} className="uppercase font-black text-4xl sm:text-6xl leading-tight">
            We do the thinking.<br /><span style={{ color: C.pink }}>You just have to show up</span>
          </h2>
          <div className="grid sm:grid-cols-3 gap-8 mt-12 text-left">
            {["1:1 Personal Training", "Small Group Strength", "Online Coaching"].map((p) => (
              <div key={p} className="p-6 rounded-2xl" style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${C.crystal}55` }}>
                <div className="inline-flex p-3 rounded-xl mb-4" style={{ border: `1px solid ${C.crystal}` }}>
                  <TrendingUp className="h-6 w-6" style={{ color: C.crystal }} />
                </div>
                <h3 style={H} className="uppercase font-bold text-2xl">{p}</h3>
                <p className="text-white/80 mt-2" style={B}>Programs that evolve with your progress, fatigue and schedule.</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA GRADIENT BANNER */}
      <section className="px-8 py-16">
        <div className="max-w-6xl mx-auto rounded-[28px] p-12 text-white" style={{ background: heroGrad }}>
          <h2 style={H} className="uppercase font-black text-4xl sm:text-5xl">Not sure where to start?</h2>
          <p className="mt-3 text-white/90 text-lg" style={B}>Just a clear plan built around you to get results.</p>
          <button style={{ ...H, background: C.pink }} className="mt-8 inline-flex items-center gap-2 font-extrabold uppercase px-8 py-4 rounded-lg text-lg text-white">
            Find your perfect program <ArrowUpRight className="h-5 w-5" />
          </button>
        </div>
      </section>

      {/* SWATCHES + TYPE */}
      <section className="max-w-6xl mx-auto px-8 pb-20">
        <h3 style={H} className="uppercase font-extrabold text-2xl mb-6">Palette &amp; type reference</h3>
        <div className="flex flex-wrap gap-4 mb-10">
          {[["Electric Blue", C.blue], ["Electric Pink", C.pink], ["Midnight Azure", C.navy], ["Purple", C.purple], ["Crystal Blue", C.crystal], ["Body Grey", C.grey]].map(([n, hex]) => (
            <div key={n} className="w-40">
              <div className="h-20 rounded-xl border border-gray-200" style={{ background: hex }} />
              <p style={H} className="text-xs uppercase font-bold mt-2">{n}</p>
              <p className="text-xs text-gray-500" style={B}>{hex}</p>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-100 pt-6">
          <p style={H} className="uppercase font-black text-5xl">Montserrat — Headings</p>
          <p className="text-lg text-[#4B4B4B] mt-2" style={B}>Inter — body copy. The quick brown fox jumps over the lazy dog. (Closest free match to VRTO's "Rflex".)</p>
        </div>
      </section>
    </div>
  );
}
