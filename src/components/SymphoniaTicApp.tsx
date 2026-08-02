import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { BoomerangVideoBg } from './BoomerangVideoBg';
import { CONCERT_EVENTS, fetchEventsAPI } from './landing/data';
import type { EventItem, TicketCategory, OrderRecord } from './landing/data';

import { Header, Hero } from './landing/Layout';
import { Footer } from './landing/Footer';
import { AudioPlayer } from './landing/AudioPlayer';
import { BentoSection } from './landing/Sections';
import FAQSection from './landing/FAQSection';
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

  const loadLiveEvents = useCallback(async () => {
    try {
      const data = await fetchEventsAPI();
      setLiveEvents(data);
    } catch (err) {
      console.error('Error fetching live events:', err);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    fetchEventsAPI().then((data) => {
      if (mounted) setLiveEvents(data);
    }).catch(console.error);

    const interval = setInterval(() => {
      fetchEventsAPI().then((data) => {
        if (mounted) setLiveEvents(data);
      }).catch(console.error);
    }, 30000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const displayEvents = useMemo(
    () => (liveEvents.length > 0 ? liveEvents : CONCERT_EVENTS),
    [liveEvents]
  );
  const activeTrack = useMemo(
    () => CONCERT_EVENTS[currentTrackIndex] || CONCERT_EVENTS[0],
    [currentTrackIndex]
  );

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setCurrentTime(audio.currentTime);
    const onMeta = () => setDuration(audio.duration);
    const onEnd = () => setCurrentTrackIndex((prev) => (prev + 1) % CONCERT_EVENTS.length);
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onMeta);
    audio.addEventListener('ended', onEnd);
    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadedmetadata', onMeta);
      audio.removeEventListener('ended', onEnd);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !activeTrack) return;
    if (audio.src !== window.location.origin + activeTrack.audioUrl && audio.getAttribute('src') !== activeTrack.audioUrl) {
      audio.src = activeTrack.audioUrl;
      audio.load();
    }
    if (isPlayingAudio) {
      audio.play().catch(() => setIsPlayingAudio(false));
    }
  }, [activeTrack, isPlayingAudio]);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSeek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const handleBookingSubmit = useCallback((order: OrderRecord) => {
    setOrders((prev) => [order, ...prev]);
    setActiveSuccessOrder(order);
    setBookingEvent(null);
    setBookingCategory(null);
    loadLiveEvents();
  }, [loadLiveEvents]);

  const openBooking = useCallback((event: EventItem) => {
    setBookingEvent(event);
    setBookingCategory(event.categories[0] || null);
  }, []);

  const toggleMenu = useCallback(() => setIsMenuOpen((prev) => !prev), []);
  const openAdmin = useCallback(() => setActiveDrawer('ADMIN'), []);
  const openOrders = useCallback(() => setActiveDrawer('ORDERS'), []);
  const closeDrawer = useCallback(() => setActiveDrawer(null), []);
  const closeBookingModal = useCallback(() => {
    setBookingEvent(null);
    setBookingCategory(null);
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-[#171717] text-white">
      <audio ref={audioRef} preload="metadata" />

      <Header
        isScrolled={isScrolled}
        isMenuOpen={isMenuOpen}
        ordersCount={orders.length}
        onToggleMenu={toggleMenu}
        onOpenAdmin={openAdmin}
        onOpenOrders={openOrders}
      />

      {/* Hero with video bg */}
      <div className="relative overflow-hidden">
        <BoomerangVideoBg />
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-[#171717]/40 via-[#171717]/10 to-[#171717]" />
        <Hero />
      </div>

      {/* Content */}
      <BentoSection events={displayEvents} onBuyTicket={openBooking} />

      <FAQSection />

      <Footer />

      {/* Bottom padding for fixed audio bar */}
      <div className="h-16" />

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
          <BookingModal
            key={bookingEvent.id}
            event={bookingEvent}
            initialCategory={bookingCategory}
            onClose={closeBookingModal}
            onSubmit={handleBookingSubmit}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {activeSuccessOrder && (
          <ETicketConfirmation
            key={activeSuccessOrder.orderCode}
            order={activeSuccessOrder}
            onClose={() => setActiveSuccessOrder(null)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {activeDrawer === 'ORDERS' && (
          <OrdersDrawer
            orders={orders}
            onClose={closeDrawer}
            onShowTicket={setActiveSuccessOrder}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {activeDrawer === 'ADMIN' && (
          <AdminDrawer
            onClose={closeDrawer}
            onEventsUpdated={loadLiveEvents}
            allEvents={displayEvents}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
