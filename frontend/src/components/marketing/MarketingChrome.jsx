import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X, ArrowUpRight, Facebook, Instagram } from "lucide-react";

const links = [
  { href: "#about", label: "About" },
  { href: "#approach", label: "Approach" },
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
      <div className="bg-[#A9784E] text-white text-center text-[11px] sm:text-xs tracking-[0.15em] uppercase py-2.5 px-4" data-testid="announcement-bar">
        Now coaching women in Argyle, TX — virtual &amp; in-person
      </div>
      <div className={`transition-colors duration-300 ${scrolled ? "bg-[#EFE9E1]/95 backdrop-blur-md border-b border-[#DCD4C7]" : "bg-transparent"}`}>
        <nav className="max-w-7xl mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
          <a href="#top" className="flex flex-col leading-none" data-testid="nav-logo">
            <span className="font-display text-3xl md:text-[34px] tracking-[-0.02em] text-[#1C1B1A]">C<span className="italic text-[#A9784E]">K</span> <span className="tracking-tight">Studio</span></span>
            <span className="text-[9px] tracking-[0.4em] text-[#A9784E] uppercase mt-1">Kendra Albritton</span>
          </a>
          <div className="hidden lg:flex items-center gap-9">
            {links.map((l) => (
              <a key={l.href} href={l.href} data-testid={`nav-${l.label.toLowerCase()}`}
                 className="text-sm text-[#4A4744] hover:text-[#A9784E] transition-colors tracking-wide">
                {l.label}
              </a>
            ))}
          </div>
          <div className="hidden lg:flex items-center gap-5">
            <Link to="/admin/login" data-testid="nav-login-link" className="text-xs text-[#4A4744] hover:text-[#A9784E] transition-colors tracking-wide uppercase">
              Trainer Login
            </Link>
            <a href="#contact" data-testid="nav-cta"
               className="group inline-flex items-center gap-2 bg-[#A9784E] text-white px-6 py-3 rounded-full text-xs uppercase tracking-[0.15em] hover:bg-[#8C5F3F] transition-colors">
              Start Here
              <ArrowUpRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </div>
          <button className="lg:hidden text-[#1C1B1A]" onClick={() => setOpen(!open)} data-testid="nav-toggle">
            {open ? <X /> : <Menu />}
          </button>
        </nav>
        {open && (
          <div className="lg:hidden bg-[#EFE9E1] border-t border-[#DCD4C7] px-6 py-6 flex flex-col gap-5" data-testid="nav-mobile-menu">
            {links.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-[#1C1B1A] text-lg font-display">{l.label}</a>
            ))}
            <Link to="/admin/login" onClick={() => setOpen(false)} className="text-[#A9784E] text-sm uppercase tracking-[0.15em]">Trainer Login</Link>
          </div>
        )}
      </div>
    </header>
  );
};

export const MarketingFooter = () => (
  <footer className="bg-[#1C1B1A] text-[#EFE9E1] py-20 px-6 md:px-12" data-testid="marketing-footer">
    <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12">
      <div>
        <div className="font-display text-5xl md:text-6xl tracking-[-0.02em]">C<span className="italic text-[#A9784E]">K</span> <span className="tracking-tight">Studio</span></div>
        <p className="text-[#EFE9E1]/60 mt-4 max-w-xs text-sm leading-relaxed">
          Strength coaching for women, by Kendra Albritton. Build the body — and the belief — to match.
        </p>
        <div className="flex items-center gap-3 mt-6" data-testid="footer-socials">
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" data-testid="footer-instagram"
             className="h-9 w-9 rounded-full border border-white/20 flex items-center justify-center hover:bg-[#A9784E] hover:border-[#A9784E] transition-colors">
            <Instagram className="h-4 w-4" />
          </a>
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" data-testid="footer-facebook"
             className="h-9 w-9 rounded-full border border-white/20 flex items-center justify-center hover:bg-[#A9784E] hover:border-[#A9784E] transition-colors">
            <Facebook className="h-4 w-4" />
          </a>
        </div>
      </div>
      <div className="text-sm text-[#EFE9E1]/70 space-y-3">
        <p className="text-[#A9784E] uppercase tracking-[0.25em] text-xs mb-4">Explore</p>
        <a href="#about" className="block hover:text-white transition-colors">About Kendra</a>
        <a href="#programs" className="block hover:text-white transition-colors">Programs</a>
        <a href="#results" className="block hover:text-white transition-colors">Results</a>
        <a href="#contact" className="block hover:text-white transition-colors">Work with Kendra</a>
      </div>
      <div className="text-sm text-[#EFE9E1]/70 space-y-3">
        <p className="text-[#A9784E] uppercase tracking-[0.25em] text-xs mb-4">Studio</p>
        <a href="mailto:kalbritton13@gmail.com" className="block hover:text-white transition-colors" data-testid="footer-email">kalbritton13@gmail.com</a>
        <p>Argyle, TX · By appointment only</p>
        <p>Payments accepted: PayPal · Venmo · Zelle</p>
        <Link to="/admin/login" className="inline-block hover:text-white transition-colors mt-2" data-testid="footer-login-link">Trainer Login</Link>
      </div>
    </div>
    <div className="max-w-7xl mx-auto mt-14 pt-6 border-t border-white/10 text-xs text-[#EFE9E1]/50 flex flex-col sm:flex-row justify-between gap-2">
      <span>© {new Date().getFullYear()} CK Studio. All rights reserved.</span>
      <span>
        Designed by{" "}
        <a href="https://mozeid.com/" target="_blank" rel="noopener noreferrer"
           className="text-[#A9784E] hover:text-white transition-colors" data-testid="footer-mostudio">
          Mo Studio
        </a>
      </span>
    </div>
  </footer>
);
