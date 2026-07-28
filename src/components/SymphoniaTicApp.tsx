import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { BoomerangVideoBg } from './BoomerangVideoBg';
import { CONCERT_EVENTS, fetchEventsAPI } from './landing/data';
import type { EventItem, TicketCategory, OrderRecord } from './landing/data';

import { Header, Hero, Footer } from './landing/Layout';
import { AudioPlayer } from './landing/AudioPlayer';
import { BentoSection } from './landing/Sections';
import { BookingModal, ETicketConfirmation, OrdersDrawer, AdminDrawer } from './landing/Modals';

export const SymphoniaTicApp: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);

  const [activeDrawer, setActiveDrawer] = useState<'ORDERS' | 'ADMIN' | null>(null);
  const [bookingEvent, setBookingEvent] = useState<EventItem | null>(null);
  const [bookingCategory, setBookingCategory] = useState<TicketCategory | null>(null);
  const [activeSuccessOrder, setActiveSuccessOrder] = useState<OrderRecord | null>(null);
  const [orders, setOrders] = useState<OrderRecord[]>([]);

  const [liveEvents, setLiveEvents] = useState<EventItem[]>([]);

  const loadLiveEvents = async () => {
    try {
      const data = await fetchEventsAPI();
      setLiveEvents(data);
    } catch (err) {
      console.error('Error fetching live events:', err);
    }
  };

  useEffect(() => { loadLiveEvents(); }, []);
  useEffect(() => {
    const interval = setInterval(loadLiveEvents, 30000);
    return () => clearInterval(interval);
  }, []);

  const displayEvents = liveEvents.length > 0 ? liveEvents : CONCERT_EVENTS;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setCurrentTime(audio.currentTime);
    const onMeta = () => setDuration(audio.duration);
    const onEnd = () => setCurrentTrackIndex((prev) => (prev + 1) % displayEvents.length);
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onMeta);
    audio.addEventListener('ended', onEnd);
    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadedmetadata', onMeta);
      audio.removeEventListener('ended', onEnd);
    };
  }, [displayEvents.length]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const track = displayEvents[currentTrackIndex] || CONCERT_EVENTS[0];
    audio.src = track.audioUrl;
    audio.load();
    if (isPlayingAudio) audio.play().catch(() => setIsPlayingAudio(false));
  }, [currentTrackIndex, displayEvents, isPlayingAudio]);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSeek = (time: number) => {
    if (audioRef.current) { audioRef.current.currentTime = time; setCurrentTime(time); }
  };

  const handleBookingSubmit = (order: OrderRecord) => {
    setOrders((prev) => [order, ...prev]);
    setActiveSuccessOrder(order);
    setBookingEvent(null);
    setBookingCategory(null);
    loadLiveEvents();
  };

  const openBooking = (event: EventItem) => {
    setBookingEvent(event);
    setBookingCategory(event.categories[0]);
  };

  return (
    <div className="relative min-h-screen w-full" style={{ background: '#171717', color: '#ffffff' }}>
      <audio ref={audioRef} preload="metadata" />

      <Header
        isScrolled={isScrolled}
        isMenuOpen={isMenuOpen}
        ordersCount={orders.length}
        onToggleMenu={() => setIsMenuOpen(!isMenuOpen)}
        onOpenAdmin={() => setActiveDrawer('ADMIN')}
        onOpenOrders={() => setActiveDrawer('ORDERS')}
      />

      {/* Hero with video bg */}
      <div className="relative overflow-hidden">
        <BoomerangVideoBg />
        <div className="absolute inset-0 z-[1]" style={{ background: 'linear-gradient(to bottom, rgba(23,23,23,0.4) 0%, rgba(23,23,23,0.1) 40%, #171717 100%)' }} />
        <Hero />
      </div>

      {/* Content */}
      <BentoSection events={displayEvents} onBuyTicket={openBooking} />

      <Footer />

      {/* Bottom padding for fixed audio bar */}
      <div style={{ height: 64 }} />

      {/* Audio player */}
      <AudioPlayer
        audioRef={audioRef}
        currentTrackIndex={currentTrackIndex}
        isPlaying={isPlayingAudio}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        isMuted={isMuted}
        onSetCurrentTrackIndex={setCurrentTrackIndex}
        onSetIsPlaying={setIsPlayingAudio}
        onSetVolume={setVolume}
        onSetIsMuted={setIsMuted}
        onSeek={handleSeek}
      />

      {/* Modals */}
      <AnimatePresence>
        {bookingEvent && bookingCategory && (
          <BookingModal key={bookingEvent.id} event={bookingEvent} initialCategory={bookingCategory}
            onClose={() => { setBookingEvent(null); setBookingCategory(null); }} onSubmit={handleBookingSubmit} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {activeSuccessOrder && <ETicketConfirmation key={activeSuccessOrder.orderCode} order={activeSuccessOrder} onClose={() => setActiveSuccessOrder(null)} />}
      </AnimatePresence>
      <AnimatePresence>
        {activeDrawer === 'ORDERS' && <OrdersDrawer orders={orders} onClose={() => setActiveDrawer(null)} onShowTicket={setActiveSuccessOrder} />}
      </AnimatePresence>
      <AnimatePresence>
        {activeDrawer === 'ADMIN' && (
          <AdminDrawer onClose={() => setActiveDrawer(null)} onEventsUpdated={loadLiveEvents} allEvents={displayEvents} />
        )}
      </AnimatePresence>
    </div>
  );
};
