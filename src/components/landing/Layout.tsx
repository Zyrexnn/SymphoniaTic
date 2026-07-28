import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { NAV_PAGES } from './data';
import type { EventItem } from './data';

interface HeaderProps {
  isScrolled: boolean;
  isMenuOpen: boolean;
  ordersCount: number;
  onToggleMenu: () => void;
  onOpenAdmin: () => void;
  onOpenOrders: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isScrolled, isMenuOpen, ordersCount, onToggleMenu, onOpenAdmin, onOpenOrders,
}) => (
  <header
    className="fixed top-0 left-0 right-0 z-40 transition-colors duration-300"
    style={{ background: isScrolled ? 'rgba(23,23,23,0.95)' : 'transparent' }}
  >
    <div
      className="flex items-center justify-between mx-auto"
      style={{ maxWidth: 1400, padding: '5px 40px 10px' }}
    >
      <nav className="hidden md:flex items-center gap-8">
        {NAV_PAGES.map((p, i) => (
          <a
            key={p.label}
            href={p.href}
            style={{
              fontSize: 16,
              fontWeight: 300,
              letterSpacing: '-0.05px',
              color: '#ffffff',
              paddingBottom: 10,
              borderBottom: i === 0 ? '1px solid #ffffff' : '1px solid transparent',
            }}
            className="hover:opacity-60 transition-opacity"
          >
            {p.label}
          </a>
        ))}
      </nav>

      <div className="flex items-center gap-8">
        <button
          onClick={onOpenOrders}
          style={{ fontSize: 16, fontWeight: 300, letterSpacing: '-0.05px', color: '#9a9a9a' }}
          className="hover:opacity-60 transition-opacity cursor-pointer bg-transparent border-none"
        >
          {ordersCount > 0 ? `Tiket (${ordersCount})` : 'Tiket'}
        </button>
        <a
          href="/admin"
          className="hidden sm:block hover:opacity-60 transition-opacity"
          style={{ fontSize: 16, fontWeight: 300, letterSpacing: '-0.05px', color: '#9a9a9a' }}
        >
          Admin
        </a>
        <button
          onClick={onToggleMenu}
          className="md:hidden cursor-pointer bg-transparent border-none"
          style={{ color: '#ffffff' }}
        >
          {isMenuOpen ? <X size={18} strokeWidth={1} /> : <Menu size={18} strokeWidth={1} />}
        </button>
      </div>
    </div>

    <AnimatePresence>
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="md:hidden"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex flex-col" style={{ padding: '16px 40px' }}>
            {NAV_PAGES.map((p) => (
              <a
                key={p.label}
                href={p.href}
                onClick={onToggleMenu}
                className="py-3 hover:opacity-60 transition-opacity"
                style={{ fontSize: 16, fontWeight: 300, letterSpacing: '-0.05px', color: '#ffffff' }}
              >
                {p.label}
              </a>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </header>
);

export const Hero: React.FC = () => (
  <main
    className="relative z-10 flex flex-col justify-end mx-auto"
    style={{ maxWidth: 1400, minHeight: '100dvh', padding: '0 40px 120px' }}
  >
    <p
      style={{
        fontSize: 16,
        fontWeight: 300,
        letterSpacing: '-0.05px',
        color: '#9a9a9a',
        marginBottom: 20,
      }}
    >
      Musim Semi 2026
    </p>

    <h1
      style={{
        fontSize: 'clamp(36px, 7vw, 56px)',
        lineHeight: 1.0,
        letterSpacing: '-0.056em',
        fontWeight: 300,
        color: '#ffffff',
      }}
    >
      Nikmati Harmoni<br />
      Orkestra &amp; Simfoni<br />
      Terbaik.
    </h1>

    <div className="mt-12">
      <a
        href="#bento"
        className="hover:opacity-60 transition-opacity inline-flex items-center gap-2"
        style={{ fontSize: 16, fontWeight: 300, letterSpacing: '-0.05px', color: '#9a9a9a' }}
      >
        <span>↓</span>
        <span>Jelajahi Konser</span>
      </a>
    </div>
  </main>
);

export const Footer: React.FC = () => (
  <footer
    className="mx-auto"
    style={{ maxWidth: 1400, padding: '120px 40px 80px' }}
  >
    <div
      style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        paddingTop: 40,
      }}
      className="flex flex-col sm:flex-row items-start justify-between gap-8"
    >
      <div style={{ fontSize: 16, fontWeight: 300, letterSpacing: '-0.05px', color: '#9a9a9a' }}>
        &copy; 2026 SymphoniaTic
      </div>
      <div className="flex flex-wrap items-center gap-8">
        {NAV_PAGES.map((p) => (
          <a
            key={p.label}
            href={p.href}
            className="hover:opacity-60 transition-opacity"
            style={{ fontSize: 16, fontWeight: 300, letterSpacing: '-0.05px', color: '#9a9a9a' }}
          >
            {p.label}
          </a>
        ))}
      </div>
    </div>
  </footer>
);
