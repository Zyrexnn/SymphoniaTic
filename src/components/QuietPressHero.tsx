import React, { useState } from 'react';
import { ShoppingCart, Menu, X, BarChart3, Heart } from 'lucide-react';
import { BoomerangVideoBg } from './BoomerangVideoBg';

export const QuietPressHero: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const navLinks = ['Anthology', 'Talents', 'Sound diary', 'Playback salon'];

  return (
    <div className="relative h-screen w-full overflow-hidden flex flex-col justify-between select-none">
      {/* Background Boomerang Video */}
      <BoomerangVideoBg />

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-20 p-4 sm:p-6 md:p-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2.5 group">
            <svg
              viewBox="0 0 256 256"
              className="w-5 h-5 fill-white transition-transform duration-200 group-hover:scale-105"
            >
              <path d="M 256 256 L 128 256 C 198.692 256 256 198.692 256 128 C 256 57.308 198.692 0 128 0 C 57.308 0 0 57.308 0 128 C 0 198.692 57.308 256 128 256 L 0 256 L 0 0 L 256 0 Z M 128 104 C 141.255 104 152 114.745 152 128 C 152 141.255 141.255 152 128 152 C 114.745 152 104 141.255 104 128 C 104 114.745 114.745 104 128 104 Z" />
            </svg>
            <span className="text-base tracking-tight text-white font-normal">
              quietpress
            </span>
          </a>

          {/* Desktop Nav links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link}
                href="#"
                className="text-sm text-white/90 hover:text-white transition-colors duration-200"
              >
                {link}
              </a>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Cart Button */}
            <button className="rounded-xl bg-white p-1 pr-3 sm:pr-4 flex items-center gap-2.5 hover:scale-105 active:scale-95 transition-transform duration-200 cursor-pointer">
              <div className="h-7 w-7 rounded-lg bg-blue-700 flex items-center justify-center shrink-0">
                <ShoppingCart className="w-3.5 h-3.5 text-white" strokeWidth={2} />
              </div>
              <span className="text-xs sm:text-sm font-medium text-gray-900">
                <span className="hidden sm:inline">Cart </span>(0)
              </span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="liquid-glass h-9 w-9 rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform duration-200 cursor-pointer md:hidden"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="w-4.5 h-4.5 text-white" />
              ) : (
                <Menu className="w-4.5 h-4.5 text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Nav Dropdown */}
        {isMenuOpen && (
          <div className="mt-3 md:hidden liquid-glass mx-4 rounded-2xl p-2 flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link}
                href="#"
                className="rounded-xl px-4 py-3 text-sm text-white/90 hover:bg-white/10 transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                {link}
              </a>
            ))}
          </div>
        )}
      </header>

      {/* Hero Content */}
      <main className="relative z-10 flex flex-col items-center text-center pt-28 sm:pt-36 md:pt-44 px-4 sm:px-6 max-w-4xl mx-auto">
        {/* Tag Badge */}
        <div
          className="liquid-glass rounded-lg px-4 py-1.5 text-xs sm:text-sm text-white mb-5 sm:mb-6 animate-fade-up delay-1"
          style={{ background: 'rgba(255, 255, 255, 0.16)' }}
        >
          Press 04 . Vernal woods
        </div>

        {/* Headline */}
        <h1 className="max-w-3xl text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.1] text-white tracking-tight animate-fade-up delay-2 font-normal">
          records cut for the
          <br />
          calm listener.
        </h1>

        {/* Subtext */}
        <p className="mt-5 sm:mt-6 max-w-md text-sm sm:text-base md:text-lg leading-relaxed text-white/90 animate-fade-up delay-3 font-normal">
          Drone, roots, and nature-captured sound on wax LPs. Every disc cut just once, snag it or miss.
        </p>

        {/* Two Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto animate-fade-up delay-4">
          <button className="rounded-xl bg-white px-7 py-2.5 text-sm text-gray-900 font-medium hover:scale-105 active:scale-95 transition-transform duration-200 w-full sm:w-auto text-center cursor-pointer">
            Browse the shelves
          </button>
          <button className="liquid-glass rounded-xl px-7 py-2.5 text-sm text-white font-medium hover:scale-105 active:scale-95 transition-transform duration-200 w-full sm:w-auto text-center cursor-pointer">
            Newest arrivals
          </button>
        </div>
      </main>

      {/* Now Playing Widget */}
      <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-10 z-20 w-[270px] sm:w-72 animate-fade-up delay-5">
        {/* Track Card */}
        <div className="rounded-2xl bg-white p-2.5 pr-4 shadow-lg flex items-center gap-3">
          <div className="h-11 w-11 shrink-0 rounded-xl bg-blue-700 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <p className="text-sm font-medium text-gray-900 truncate">
              Helia Marsh -- Fern Light
            </p>
            <div className="mt-1.5 h-1 w-full rounded-full bg-gray-200 overflow-hidden">
              <div className="h-full w-[30%] bg-blue-700 rounded-full" />
            </div>
            <div className="mt-1 flex items-center justify-between text-[10px] text-gray-500 font-normal">
              <span>0:33</span>
              <span>-1:21</span>
            </div>
          </div>
        </div>

        {/* Controls Row */}
        <div className="mt-2 flex items-center gap-2">
          <button className="flex-1 rounded-2xl bg-white py-2 text-sm text-gray-900 font-medium shadow-lg hover:scale-105 active:scale-95 transition-transform duration-200 text-center cursor-pointer">
            Prev
          </button>
          <button
            onClick={() => setIsLiked(!isLiked)}
            className="h-10 w-10 shrink-0 rounded-full bg-white shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-transform duration-200 cursor-pointer"
            aria-label="Like track"
          >
            <Heart
              className={`w-4 h-4 text-blue-700 transition-colors ${
                isLiked ? 'fill-blue-700' : ''
              }`}
            />
          </button>
          <button className="flex-1 rounded-2xl bg-white py-2 text-sm text-gray-900 font-medium shadow-lg hover:scale-105 active:scale-95 transition-transform duration-200 text-center cursor-pointer">
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
