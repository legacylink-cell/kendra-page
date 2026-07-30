import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X, ArrowUpRight, Facebook, Instagram } from "lucide-react";

const links = [
  { href: "#about", label: "About" },
  { href: "#method", label: "Approach" },
  { href: "#programs", label: "Programs" },
  { href: "#results", label: "Results" },
  { href: "#contact", label: "Contact" },
];

export const MarketingNav = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header data-testid="marketing-nav" className="fixed top-0 inset-x-0 z-50">
      {/* Announcement bar */}
      <div className="bg-[#0FB6C4] text-white text-center text-[11px] sm:text-xs tracking-[0.15em] uppercase py-2.5 px-4" data-testid="announcement-bar">
        Now coaching women in Argyle, TX — virtual &amp; in-person
      </div>
      <div className={`transition-colors duration-300 ${scrolled ? "bg-[#FFFFFF]/95 backdrop-blur-md border-b border-[#D6EEF1]" : "bg-transparent"}`}>
        <nav className="max-w-7xl mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
          <a href="#top" className="flex flex-col leading-none" data-testid="nav-logo">
            <span className="font-display text-3xl md:text-[34px] tracking-[-0.02em] text-[#0B3B4A]">K<span className="italic text-[#0FB6C4]">P</span> <span className="tracking-tight">Studio</span></span>
            <span className="text-[9px] tracking-[0.4em] text-[#0FB6C4] uppercase mt-1">Kendra Page</span>
          </a>
          <div className="hidden lg:flex items-center gap-9">
            {links.map((l) => (
              <a key={l.href} href={l.href} data-testid={`nav-${l.label.toLowerCase()}`}
                 className="text-sm text-[#4A5B60] hover:text-[#0FB6C4] transition-colors tracking-wide">
                {l.label}
              </a>
            ))}
          </div>
          <div className="hidden lg:flex items-center gap-5">
            <Link to="/admin/login" data-testid="nav-login-link" className="text-xs text-[#4A5B60] hover:text-[#0FB6C4] transition-colors tracking-wide uppercase">
              Trainer Login
            </Link>
            <a href="#contact" data-testid="nav-cta"
               className="group inline-flex items-center gap-2 bg-[#0FB6C4] text-white px-6 py-3 rounded-full text-xs uppercase tracking-[0.15em] hover:bg-[#0C97A3] transition-colors">
              Start Here
              <ArrowUpRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </div>
          <button className="lg:hidden text-[#0B3B4A]" onClick={() => setOpen(!open)} data-testid="nav-toggle">
            {open ? <X /> : <Menu />}
          </button>
        </nav>
        {open && (
          <div className="lg:hidden bg-[#FFFFFF] border-t border-[#D6EEF1] px-6 py-6 flex flex-col gap-5" data-testid="nav-mobile-menu">
            {links.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-[#0B3B4A] text-lg font-display">{l.label}</a>
            ))}
            <Link to="/admin/login" onClick={() => setOpen(false)} className="text-[#0FB6C4] text-sm uppercase tracking-[0.15em]">Trainer Login</Link>
          </div>
        )}
      </div>
    </header>
  );
};

export const MarketingFooter = () => (
  <footer className="bg-[#0B3B4A] text-[#FFFFFF] py-20 px-6 md:px-12" data-testid="marketing-footer">
    <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12">
      <div>
        <div className="font-display text-5xl md:text-6xl tracking-[-0.02em]">K<span className="italic text-[#0FB6C4]">P</span> <span className="tracking-tight">Studio</span></div>
        <p className="text-[#FFFFFF]/60 mt-4 max-w-xs text-sm leading-relaxed">
          Strength coaching for women, by Kendra Page. Build the body — and the belief — to match.
        </p>
        <div className="flex items-center gap-3 mt-6" data-testid="footer-socials">
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" data-testid="footer-instagram"
             className="h-9 w-9 rounded-full border border-white/20 flex items-center justify-center hover:bg-[#0FB6C4] hover:border-[#0FB6C4] transition-colors">
            <Instagram className="h-4 w-4" />
          </a>
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" data-testid="footer-facebook"
             className="h-9 w-9 rounded-full border border-white/20 flex items-center justify-center hover:bg-[#0FB6C4] hover:border-[#0FB6C4] transition-colors">
            <Facebook className="h-4 w-4" />
          </a>
        </div>
      </div>
      <div className="text-sm text-[#FFFFFF]/70 space-y-3">
        <p className="text-[#0FB6C4] uppercase tracking-[0.25em] text-xs mb-4">Explore</p>
        <a href="#about" className="block hover:text-white transition-colors">About Kendra</a>
        <a href="#programs" className="block hover:text-white transition-colors">Programs</a>
        <a href="#results" className="block hover:text-white transition-colors">Results</a>
        <a href="#contact" className="block hover:text-white transition-colors">Work with Kendra</a>
      </div>
      <div className="text-sm text-[#FFFFFF]/70 space-y-3">
        <p className="text-[#0FB6C4] uppercase tracking-[0.25em] text-xs mb-4">Studio</p>
        <a href="mailto:kalbritton13@gmail.com" className="block hover:text-white transition-colors" data-testid="footer-email">kalbritton13@gmail.com</a>
        <p>Argyle, TX · By appointment only</p>
        <p>Payments accepted: PayPal · Venmo · Zelle</p>
        <Link to="/admin/login" className="inline-block hover:text-white transition-colors mt-2" data-testid="footer-login-link">Trainer Login</Link>
      </div>
    </div>
    <div className="max-w-7xl mx-auto mt-14 pt-6 border-t border-white/10 text-xs text-[#FFFFFF]/50 flex flex-col sm:flex-row justify-between gap-2">
      <span>© {new Date().getFullYear()} KP Studio. All rights reserved.</span>
      <span>
        Designed by{" "}
        <a href="https://mozeid.com/" target="_blank" rel="noopener noreferrer"
           className="text-[#0FB6C4] hover:text-white transition-colors" data-testid="footer-mostudio">
          Mo Studio
        </a>
      </span>
    </div>
  </footer>
);
