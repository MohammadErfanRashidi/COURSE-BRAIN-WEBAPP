import React from 'react';
import { motion } from 'motion/react';
import Strands from './Strands';
import { Navbar } from './Navbar';
import { Hero } from './Hero';
import { InboxMockup } from './InboxMockup';
import { FeatureTriage } from './FeatureTriage';
import { LogoCloud } from './LogoCloud';
import { Testimonials } from './Testimonials';
import { Pricing } from './Pricing';
import { FAQ } from './FAQ';
import { FinalCTA } from './FinalCTA';

interface LandingPageProps {
  onNavigate?: () => void;
}

export function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-black z-[1]">
      <div
        className="fixed inset-0 w-full h-full pointer-events-none z-[-3]"
        style={{ background: 'var(--bg-primary)' }}
      />

      {/* Fixed Background Animation */}
      <div
        className="fixed top-0 left-0 w-full h-full pointer-events-none flex flex-col items-center z-[-2] bg-transparent"
      >
        <div className="relative w-[90vw] max-w-[900px] h-[300px] md:h-[420px] lg:h-[520px] mt-24">
          <Strands
            colors={["#285BE8","#313B59","#313B59"]}
            count={5}
            speed={0.2}
            amplitude={1}
            waviness={1.7}
            thickness={0.5}
            glow={1.8}
            taper={3}
            spread={1.5}
            intensity={0.55}
            saturation={1.5}
            opacity={1}
            scale={1.5}
            glass={false}
            refraction={1}
            dispersion={1}
            glassSize={1}
          />
        </div>
      </div>

      {/* SVG Filters */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }} aria-hidden="true">
        <filter id="c3-noise-root">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.35 0" />
          <feComposite in2="SourceGraphic" operator="in" result="noise" />
          <feBlend in="SourceGraphic" in2="noise" mode="multiply" />
        </filter>
        <filter id="c3-noise-pricing">
          <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="2" stitchTiles="stitch" />
          <feComponentTransfer><feFuncA type="linear" slope="0.075" /></feComponentTransfer>
          <feComposite in2="SourceGraphic" operator="in" result="noise" />
          <feBlend in="SourceGraphic" in2="noise" mode="overlay" />
        </filter>
      </svg>

      {/* Content */}
      <div className="min-h-[85vh] md:min-h-[90vh] w-full flex flex-col pt-28 md:pt-[112px] pb-8 md:pb-12">
        <Navbar onNavigate={onNavigate} />

        <div className="flex-1 flex flex-col items-center justify-center w-full">
          <Hero onNavigate={onNavigate} />

          <div id="how-it-works" className="mt-6 md:mt-10 flex flex-col items-center relative z-[1] w-full">
            <p
              className="text-[var(--text-muted)] max-w-sm mx-auto text-sm md:text-base leading-relaxed text-center mb-6 px-4"
            >
            زیوای (ZivAI) سامانه هوشمند کمک‌آموزشی ویژه دانشجویان است. این پلتفرم با بهره‌گیری از هوش مصنوعی قدرتمند، صدای کلاس‌ها را به متن تبدیل کرده و محتوای درسی را برای جستجو و پرسش‌وپاسخ آماده می‌کند.
          </p>
        </div>
      </div>
    </div>

    <div className="flex flex-col items-center relative z-[1] w-full">
      {/* Browser Window */}
        <div
          className="w-full mt-4 md:mt-8"
        >
          <InboxMockup />
        </div>
      </div>

      <div id="features"><FeatureTriage /></div>
      <LogoCloud />
      <Testimonials />
      <div id="pricing"><Pricing onNavigate={onNavigate} /></div>
      <div id="faq"><FAQ /></div>
      <div id="contact"><FinalCTA /></div>
    </div>
  );
}
