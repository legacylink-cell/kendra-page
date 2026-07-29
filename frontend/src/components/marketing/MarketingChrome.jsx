import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

const links = [
  { href: "#about", label: "About" },
  { href: "#programs", label: "Programs" },
  { href: "#results", label: "Results" },
  { href: "#contact", label: "Contact" },
];

export const MarketingNav = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      data-testid="marketing-nav"
      className={`fixed top-0 inset-x-0 z-50 transition-colors duration-300 ${
        scrolled ? "bg-[#1E6E6F]/80 backdrop-blur-xl border-b border-brand-line" : "border-b border-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">
        <a href="#top" className="flex flex-col leading-none" data-testid="nav-logo">
          <span className="font-display text-2xl tracking-tight text-brand-text">KP Studio</span>
          <span className="text-[10px] tracking-[0.3em] text-brand-bronze uppercase">Kendra Albritton</span>
        </a>
        <div className="hidden md:flex items-center gap-10">
          {links.map((l) => (
            <a key={l.href} href={l.href} data-testid={`nav-${l.label.toLowerCase()}`}
               className="text-sm text-brand-muted hover:text-brand-text transition-colors tracking-wide">
              {l.label}
            </a>
          ))}
        </div>
        <button className="md:hidden text-brand-text" onClick={() => setOpen(!open)} data-testid="nav-toggle">
          {open ? <X /> : <Menu />}
        </button>
      </nav>
      {open && (
        <div className="md:hidden bg-[#1E6E6F] border-t border-brand-line px-6 py-6 flex flex-col gap-5">
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-brand-muted text-lg">{l.label}</a>
          ))}
        </div>
      )}
    </header>
  );
};

export const MarketingFooter = () => (
  <footer className="bg-[#1E6E6F] border-t border-brand-line py-16 px-6 lg:px-10" data-testid="marketing-footer">
    <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-10">
      <div>
        <div className="font-display text-3xl text-brand-text">KP Studio</div>
        <p className="text-brand-muted mt-3 max-w-xs text-sm leading-relaxed">
          Strength coaching for women, by Kendra Albritton. Build the body — and the belief — to match.
        </p>
      </div>
      <div className="text-sm text-brand-muted space-y-2">
        <p className="text-brand-bronze uppercase tracking-[0.2em] text-xs mb-3">Explore</p>
        <a href="#about" className="block hover:text-brand-text">About</a>
        <a href="#programs" className="block hover:text-brand-text">Programs</a>
        <a href="#results" className="block hover:text-brand-text">Results</a>
        <a href="#contact" className="block hover:text-brand-text">Work with Kendra</a>
      </div>
      <div className="text-sm text-brand-muted space-y-2">
        <p className="text-brand-bronze uppercase tracking-[0.2em] text-xs mb-3">Studio</p>
        <p>hello@kpstudio.com</p>
        <p>By appointment only</p>
        <Link to="/admin/login" className="block hover:text-brand-text mt-2">Trainer Login</Link>
      </div>
    </div>
    <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-brand-line text-xs text-brand-muted flex flex-col sm:flex-row justify-between gap-2">
      <span>© {new Date().getFullYear()} KP Studio. All rights reserved.</span>
      <span>
        Designed by{" "}
        <a href="https://mozeid.com/" target="_blank" rel="noopener noreferrer"
           className="text-brand-bronze hover:text-brand-text transition-colors" data-testid="footer-mostudio">
          Mo Studio
        </a>
      </span>
    </div>
  </footer>
);
