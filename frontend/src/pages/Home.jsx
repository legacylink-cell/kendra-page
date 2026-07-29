import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Dumbbell, Users, Laptop, Check, Baby, Salad, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { MarketingNav, MarketingFooter } from "@/components/marketing/MarketingChrome";
import api, { apiErr } from "@/lib/api";

const IMG = {
  hero: "/kendra.jpg?v=2",
  about: "/kendra-selfie.jpg",
  g1: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=1000&q=80&auto=format&fit=crop",
  g2: "https://images.unsplash.com/photo-1708011108850-49646bd34503?w=1000&q=80&auto=format&fit=crop",
  g3: "https://images.pexels.com/photos/7900679/pexels-photo-7900679.jpeg?auto=compress&cs=tinysrgb&w=1000",
  g4: "https://images.pexels.com/photos/6739123/pexels-photo-6739123.jpeg?auto=compress&cs=tinysrgb&w=1000",
  barbell: "/kendra-barbell.jpg",
  selfie: "/kendra-selfie.jpg",
  cable: "/kendra-cable.jpg",
  community: "/kp-community.jpg",
  marathon: "/kendra-marathon.jpg",
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
  { icon: Baby, title: "Pre & Postnatal Training", desc: "Safe, expert strength coaching through every trimester and beyond — stay strong during pregnancy and rebuild with confidence after baby.", tag: "Mama Strong" },
  { icon: Salad, title: "Nutrition Programs", desc: "Personalized, sustainable nutrition coaching that fuels your training and fits your real life — no crash diets, no guilt.", tag: "Fuel" },
  { icon: Sparkles, title: "Mind · Body · Soul", desc: "A holistic program connecting movement, mindset, and recovery so you feel as strong on the inside as you look on the outside.", tag: "Holistic" },
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
      toast.success("Message sent — Kendra will reach out personally.");
      setForm({ name: "", email: "", phone: "", goal: "", message: "" });
    } catch (err) {
      toast.error(apiErr(err.response?.data?.detail));
    } finally {
      setSending(false);
    }
  };

  return (
    <div id="top" className="bg-[#B6E6E9] text-[#1E6E6F] font-sans selection:bg-brand-bronze">
      <MarketingNav />

      {/* HERO */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-[#B6E6E9]">
        <div className="absolute inset-0 lg:left-[46%]">
          <img src={IMG.hero} alt="Kendra Albritton" className="w-full h-full object-cover object-[50%_18%]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#B6E6E9] via-[#B6E6E9]/85 to-[#B6E6E9]/10 lg:hidden" />
          <div className="absolute inset-0 hidden lg:block bg-gradient-to-r from-[#B6E6E9] via-[#B6E6E9]/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#B6E6E9]/30 to-transparent" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 lg:px-10 w-full pt-28 lg:pt-0">
          <div className="lg:max-w-xl">
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="text-[#1E6E6F] uppercase tracking-[0.35em] text-xs mb-6">
            Strength for women · by a woman
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
            className="font-display font-light text-5xl sm:text-6xl lg:text-7xl leading-[0.95] tracking-tight text-[#1E6E6F]">
            Train like the woman you're <span className="italic text-[#4EC6D4]">becoming.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.35 }}
            className="text-[#1E6E6F] text-lg max-w-lg mt-8 leading-relaxed">
            KP Studio is the private strength practice of <span className="text-[#1E6E6F] font-semibold">Kendra Albritton</span> — where
            women build real power, unshakeable confidence, and results that outlast any trend.
          </motion.p>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-wrap gap-4 mt-10">
            <a href="#contact" data-testid="hero-cta-start"
              className="group inline-flex items-center gap-3 bg-brand-bronze text-[#1E6E6F] px-8 py-4 font-semibold hover:bg-[#1E6E6F] hover:text-[#B6E6E9] transition-colors">
              Start your transformation
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </a>
            <a href="#programs" data-testid="hero-cta-programs"
              className="inline-flex items-center gap-2 border border-[#1E6E6F] text-[#1E6E6F] px-8 py-4 hover:bg-[#1E6E6F] hover:text-[#B6E6E9] transition-colors">
              View programs
            </a>
          </motion.div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="bg-brand-bronze py-5 overflow-hidden">
        <div className="marquee-track">
          {[...marquee, ...marquee, ...marquee, ...marquee].map((w, i) => (
            <span key={i} className="font-display text-4xl md:text-5xl mx-8 text-[#1E6E6F] whitespace-nowrap flex items-center gap-16">
              {w} <span className="text-[#B6E6E9] text-2xl">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* ABOUT */}
      <section id="about" className="py-28 px-6 lg:px-10 bg-[#F2D9B7] text-[#1E6E6F]">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <Reveal>
            <div className="relative">
              <div className="relative overflow-hidden bg-[#1E6E6F]">
                <img src={IMG.about} alt="Kendra Albritton" className="w-full aspect-[4/5] object-cover object-top" />
              </div>
              <div className="absolute -bottom-6 -right-4 bg-brand-bronze text-[#1E6E6F] p-6 hidden sm:block shadow-xl">
                <p className="font-display text-5xl leading-none">10+</p>
                <p className="text-xs uppercase tracking-[0.2em] mt-1">Years coaching women</p>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="text-[#1E6E6F] uppercase tracking-[0.3em] text-xs mb-5">Meet Kendra</p>
            <h2 className="font-display text-5xl lg:text-6xl leading-none tracking-tight mb-8">
              Coaching that treats your goals like they're sacred.
            </h2>
            <p className="text-[#1E6E6F] leading-relaxed mb-5">
              Kendra Albritton is a personal trainer and group fitness coach at <span className="text-[#1E6E6F] font-medium">Shapes Fitness</span>,
              the boutique women's club in Flower Mound, TX. She built KP Studio for one reason: too many women were
              handed generic programs and told to shrink. She coaches the opposite — get <span className="text-[#1E6E6F] font-medium">stronger</span>,
              take up space, and train with intention.
            </p>
            <p className="text-[#1E6E6F] leading-relaxed mb-8">
              Every program is built around your body, your history, and your life. No guesswork, no fads —
              just expert programming and relentless accountability.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {["Women-only coaching", "Personalized programming", "Form-first strength", "Real accountability"].map((f) => (
                <div key={f} className="flex items-center gap-3 text-sm text-[#1E6E6F]">
                  <Check className="h-4 w-4 text-[#1E6E6F] shrink-0" /> {f}
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* PROGRAMS */}
      <section id="programs" className="py-28 px-6 lg:px-10 bg-[#B6E6E9] border-y border-[#7AC7BD]">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <p className="text-[#1E6E6F] uppercase tracking-[0.3em] text-xs mb-4">The Work</p>
            <h2 className="font-display text-5xl lg:text-6xl tracking-tight max-w-2xl leading-none text-[#1E6E6F]">
              Choose how you want to get strong.
            </h2>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-6 mt-16">
            {programs.map((p, i) => (
              <Reveal key={p.title} delay={i * 0.12}>
                <div data-testid={`program-${i}`} className="group h-full bg-[#F2D9B7] border border-[#7AC7BD] p-8 hover:border-brand-bronze hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between mb-8">
                    <p.icon className="h-8 w-8 text-[#1E6E6F]" />
                    <span className="text-[10px] uppercase tracking-[0.2em] text-[#1E6E6F] border border-[#7AC7BD] px-3 py-1">{p.tag}</span>
                  </div>
                  <h3 className="font-display text-3xl mb-4 text-[#1E6E6F]">{p.title}</h3>
                  <p className="text-[#1E6E6F] text-sm leading-relaxed">{p.desc}</p>
                  <a href="#contact" className="inline-flex items-center gap-2 text-[#1E6E6F] text-sm mt-8 group-hover:gap-3 transition-all font-medium">
                    Enquire <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* RESULTS / GALLERY */}
      <section id="results" className="py-28 px-6 lg:px-10 bg-[#F2D9B7] text-[#1E6E6F]">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
              <div>
                <p className="text-[#1E6E6F] uppercase tracking-[0.3em] text-xs mb-4">Proof, not promises</p>
                <h2 className="font-display text-5xl lg:text-6xl tracking-tight leading-none">Real women. Real strength.</h2>
              </div>
              <a href="#contact" className="text-[#1E6E6F] hover:text-[#1E6E6F] text-sm inline-flex items-center gap-2">
                Your story is next <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { src: IMG.barbell, cap: "Strength platform", pos: "object-center" },
              { src: IMG.cable, cap: "Every rep, coached", pos: "object-center" },
            ].map((g, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div className="relative overflow-hidden group">
                  <img src={g.src} alt={g.cap} className={`w-full aspect-[3/4] object-cover ${g.pos} group-hover:scale-105 transition-transform duration-700`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <span className="absolute bottom-4 left-4 text-xs uppercase tracking-[0.2em] text-white">{g.cap}</span>
                </div>
              </Reveal>
            ))}
          </div>

          {/* COMMUNITY */}
          <Reveal>
            <div className="relative overflow-hidden mt-4">
              <img src={IMG.community} alt="Women who've trained with Kendra" className="w-full aspect-[2/1] md:aspect-[21/9] object-cover object-top" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
              <div className="absolute bottom-6 left-6 lg:bottom-10 lg:left-10">
                <p className="font-display text-4xl lg:text-5xl text-white leading-none">Stronger together.</p>
                <p className="text-white/70 text-sm mt-2 uppercase tracking-[0.2em]">Women who've trained with Kendra</p>
              </div>
            </div>
          </Reveal>

          {/* INSPIRE — beyond the studio */}
          <Reveal>
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-14 items-center mt-24 bg-[#B6E6E9] border border-[#7AC7BD] p-6 lg:p-10 shadow-sm">
              <div className="relative overflow-hidden">
                <img src={IMG.marathon} alt="Kendra and her fiancé at the 2024 half marathon finish line" className="w-full aspect-[4/3] object-cover" />
                <div className="absolute bottom-4 left-4 bg-brand-bronze text-[#1E6E6F] px-4 py-2 text-xs uppercase tracking-[0.2em]">2024 · 13.1 finishers</div>
              </div>
              <div>
                <p className="text-[#1E6E6F] uppercase tracking-[0.3em] text-xs mb-5">Beyond the studio</p>
                <h3 className="font-display text-4xl lg:text-5xl leading-none tracking-tight mb-5">She lives it, too.</h3>
                <p className="text-[#1E6E6F] leading-relaxed mb-4">
                  Kendra doesn't just coach the work — she does it. Here she is with her fiancé crossing the finish line
                  of the 2024 Tour des Fleurs half marathon, medals earned.
                </p>
                <p className="text-[#1E6E6F] leading-relaxed">
                  Strength isn't a look — it's a life. Train with Kendra and you're learning from someone who shows up
                  for her own goals every single day.
                </p>
              </div>
            </div>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-6 mt-20">
            {testimonials.map((t, i) => (
              <Reveal key={i} delay={i * 0.12}>
                <div className="border border-[#7AC7BD] p-8 h-full bg-[#B6E6E9] shadow-sm">
                  <p className="text-brand-bronze text-4xl font-display leading-none mb-4">“</p>
                  <p className="text-[#1E6E6F] leading-relaxed mb-6">{t.q}</p>
                  <p className="text-sm text-[#1E6E6F] font-medium">{t.n}</p>
                  <p className="text-xs text-[#1E6E6F] uppercase tracking-[0.15em] mt-1">{t.r}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="py-28 px-6 lg:px-10 bg-[#B6E6E9] text-[#1E6E6F]">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16">
          <Reveal>
            <p className="text-[#1E6E6F] uppercase tracking-[0.3em] text-xs mb-5">Apply to train</p>
            <h2 className="font-display text-5xl lg:text-6xl tracking-tight leading-none mb-6">
              Let's build the strongest version of you.
            </h2>
            <p className="text-[#1E6E6F] leading-relaxed max-w-md">
              Spots are limited and every client is coached personally. Tell Kendra about your goals and she'll
              reach out to see if KP Studio is the right fit.
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <form onSubmit={submit} data-testid="lead-form" className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  data-testid="lead-name" placeholder="Full name"
                  className="w-full bg-[#F2D9B7] border border-[#7AC7BD] px-4 py-3.5 text-[#1E6E6F] placeholder:text-[#7AC7BD] focus:border-brand-bronze focus:outline-none" />
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  data-testid="lead-phone" placeholder="Phone"
                  className="w-full bg-[#F2D9B7] border border-[#7AC7BD] px-4 py-3.5 text-[#1E6E6F] placeholder:text-[#7AC7BD] focus:border-brand-bronze focus:outline-none" />
              </div>
              <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                data-testid="lead-email" placeholder="Email address"
                className="w-full bg-[#F2D9B7] border border-[#7AC7BD] px-4 py-3.5 text-[#1E6E6F] placeholder:text-[#7AC7BD] focus:border-brand-bronze focus:outline-none" />
              <input value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })}
                data-testid="lead-goal" placeholder="Your main goal (e.g. get stronger, lose fat, feel confident)"
                className="w-full bg-[#F2D9B7] border border-[#7AC7BD] px-4 py-3.5 text-[#1E6E6F] placeholder:text-[#7AC7BD] focus:border-brand-bronze focus:outline-none" />
              <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                data-testid="lead-message" placeholder="Anything else Kendra should know?" rows={4}
                className="w-full bg-[#F2D9B7] border border-[#7AC7BD] px-4 py-3.5 text-[#1E6E6F] placeholder:text-[#7AC7BD] focus:border-brand-bronze focus:outline-none resize-none" />
              <button type="submit" disabled={sending} data-testid="lead-submit"
                className="w-full bg-brand-bronze text-[#1E6E6F] py-4 font-semibold hover:bg-[#1E6E6F] hover:text-[#B6E6E9] transition-colors disabled:opacity-60">
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
