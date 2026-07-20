import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X } from 'lucide-react';
import { LogoMark, AppleButton } from './Shared';

interface NavbarProps {
  onNavigate?: () => void;
}

export function Navbar({ onNavigate }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const links = [
    { label: 'نحوه کار', id: 'how-it-works' },
    { label: 'تعرفه‌ها', id: 'pricing' },
    { label: 'سوالات متداول', id: 'faq' },
    { label: 'تماس با ما', id: 'contact' }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      const scrollPosition = window.scrollY + window.innerHeight / 3;
      let currentSection = '';

      for (const link of links) {
        const section = document.getElementById(link.id);
        if (section && section.offsetTop <= scrollPosition) {
          currentSection = link.id;
        }
      }

      if (window.scrollY < 100) {
        currentSection = '';
      }

      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const section = document.getElementById(id);
    if (section) {
      const top = section.offsetTop - 100;
      window.scrollTo({ top, behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  return (
    <>
      <div className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${scrolled ? 'py-2 px-4' : 'py-3 px-4'}`}>
          <nav
              className="max-w-6xl mx-auto px-5 md:px-8 h-14 flex items-center justify-between rounded-2xl transition-all duration-300"
          style={{
            background: 'var(--nav-bg)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid var(--nav-border)',
            boxShadow: scrolled ? 'var(--nav-shadow)' : 'none'
          }}
        >
          <div>
            <img src="/final-fr.png" alt="ZivAI Logo" className="w-8 h-8 object-contain" />
          </div>
          <div className="hidden md:flex items-center gap-6">
            {links.map((link, i) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={(e) => scrollToSection(e, link.id)}
                className={`text-sm font-medium transition-colors relative ${activeSection === link.id ? 'text-[#285BE8]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:block">
              <AppleButton onNavigate={onNavigate} />
            </div>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-10 h-10 rounded-full border border-[var(--border-color)] bg-[var(--icon-bg)] flex items-center justify-center text-[var(--text-primary)] cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
          </nav>
        </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-24 left-4 right-4 z-[90] p-4 rounded-2xl md:hidden"
            style={{
              background: 'var(--nav-bg)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid var(--nav-border)',
              boxShadow: 'var(--nav-shadow)'
            }}
          >
            <div className="flex flex-col gap-4">
              {links.map((link) => (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  onClick={(e) => scrollToSection(e, link.id)}
                  className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${activeSection === link.id ? 'bg-[#285BE8]/10 text-[#285BE8]' : 'text-[var(--text-secondary)] hover:bg-[var(--icon-hover)]'}`}
                >
                  {link.label}
                </a>
              ))}

              <div className="pt-2 border-t border-[var(--border-color)] mt-2">
                <AppleButton full onNavigate={onNavigate} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
