import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { BoomerangVideoBg } from './BoomerangVideoBg';
import { CONCERT_EVENTS, fetchEventsAPI } from './landing/data';
import type { EventItem, TicketCategory, OrderRecord } from './landing/data';

import { Header, Hero, Footer } from './landing/Layout';
import { AudioPlayer } from './landing/AudioPlayer';
import { ConcertCatalog, ArtistLineup, SecurityMetrics, ETicketGuide, FAQSection } from './landing/Sections';
import { DetailConcertModal, BookingModal, ETicketConfirmation, OrdersDrawer, AdminDrawer } from './landing/Modals';

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
  const [detailEvent, setDetailEvent] = useState<EventItem | null>(null);
  const [bookingEvent, setBookingEvent] = useState<EventItem | null>(null);
  const [bookingCategory, setBookingCategory] = useState<TicketCategory | null>(null);
  const [activeSuccessOrder, setActiveSuccessOrder] = useState<OrderRecord | null>(null);
  const [orders, setOrders] = useState<OrderRecord[]>([]);

  const [liveEvents, setLiveEvents] = useState<EventItem[]>([]);

  const loadLiveEvents = async () => {
    try {
      const data = await fetchEventsAPI();
      if (data && data.length > 0) {
        setLiveEvents(data);
      }
    } catch (err) {
      console.error('Error fetching live events:', err);
    }
  };

  useEffect(() => {
    loadLiveEvents();
  }, []);

  const displayEvents = liveEvents.length > 0 ? liveEvents : CONCERT_EVENTS;
  const activeTrack = displayEvents[currentTrackIndex] || CONCERT_EVENTS[0];

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
    if (!audio || !activeTrack) return;
    audio.src = activeTrack.audioUrl;
    audio.load();
    if (isPlayingAudio) audio.play().catch(() => setIsPlayingAudio(false));
  }, [currentTrackIndex, activeTrack]);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
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
    <div className="relative min-h-screen w-full bg-[#07080c] text-white select-none">
      <audio ref={audioRef} preload="metadata" />

      <Header
        isScrolled={isScrolled}
        isMenuOpen={isMenuOpen}
        ordersCount={orders.length}
        onToggleMenu={() => setIsMenuOpen(!isMenuOpen)}
        onOpenAdmin={() => setActiveDrawer('ADMIN')}
        onOpenOrders={() => setActiveDrawer('ORDERS')}
      />

      <div className="relative min-h-screen w-full overflow-hidden flex flex-col justify-between pt-20">
        <BoomerangVideoBg />
        <div className="absolute inset-0 z-5 bg-gradient-to-b from-black/70 via-black/40 to-[#07080c]" />
        <Hero onShowDetail={setDetailEvent} />
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
      </div>

      <ConcertCatalog events={displayEvents} onShowDetail={setDetailEvent} onBuyTicket={openBooking} />
      <ArtistLineup />
      <SecurityMetrics />
      <ETicketGuide />
      <FAQSection />
      <Footer />

      <AnimatePresence>
        {detailEvent && <DetailConcertModal key={detailEvent.id} event={detailEvent} onClose={() => setDetailEvent(null)} onBuyTicket={openBooking} />}
      </AnimatePresence>
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
          <AdminDrawer
            onClose={() => setActiveDrawer(null)}
            onEventsUpdated={loadLiveEvents}
            allEvents={displayEvents}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

