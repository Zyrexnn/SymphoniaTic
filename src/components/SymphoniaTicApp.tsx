import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { BoomerangVideoBg } from './BoomerangVideoBg';
import { CONCERT_EVENTS, fetchEventsAPI, getUserOrdersAPI, getApiBaseUrl } from './landing/data';
import type { EventItem, TicketCategory, OrderRecord } from './landing/data';
import { AuthProvider, useAuth } from '@/context/AuthContext';

import { Header } from './landing/Navbar';
import { Hero } from './landing/Layout';
import { Footer } from './landing/Footer';
import { RecommendedSection } from './landing/RecommendedSection';
import { BentoSection } from './landing/Sections';
import FAQSection from './landing/FAQSection';
import { BookingModal, ETicketConfirmation, OrdersDrawer } from './landing/Modals';

const App: React.FC = () => {
  const { user, logout } = useAuth();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const [activeDrawer, setActiveDrawer] = useState<'ORDERS' | null>(null);
  const [bookingEvent, setBookingEvent] = useState<EventItem | null>(null);
  const [bookingCategory, setBookingCategory] = useState<TicketCategory | null>(null);
  const [activeSuccessOrder, setActiveSuccessOrder] = useState<OrderRecord | null>(null);
  const [orders, setOrders] = useState<OrderRecord[]>([]);

  const [liveEvents, setLiveEvents] = useState<EventItem[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [eventsError, setEventsError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      getUserOrdersAPI().then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setOrders(res.data);
        }
      }).catch(console.error);
    }
  }, [user]);

  const loadLiveEvents = useCallback(async () => {
    try {
      setIsLoadingEvents(true);
      const data = await fetchEventsAPI();
      if (Array.isArray(data) && data.length > 0) {
        setLiveEvents(data);
        setEventsError(null);
      } else {
        try {
          const res = await fetch(`${getApiBaseUrl()}/events`);
          if (!res.ok) {
            setEventsError('Layanan backend API sedang tidak dapat diakses.');
          }
        } catch {
          setEventsError('Tidak dapat terhubung ke server backend.');
        }
      }
    } catch (err) {
      console.error('Error fetching live events:', err);
      setEventsError('Gagal memuat jadwal konser dari server.');
    } finally {
      setIsLoadingEvents(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    setIsLoadingEvents(true);

    fetchEventsAPI()
      .then((data) => {
        if (!mounted) return;
        if (Array.isArray(data) && data.length > 0) {
          setLiveEvents(data);
          setEventsError(null);
        } else {
          fetch(`${getApiBaseUrl()}/events`).catch(() => {
            if (mounted) setEventsError('Tidak dapat terhubung ke server backend.');
          });
        }
      })
      .catch((err) => {
        console.error('Error fetching events:', err);
        if (mounted) setEventsError('Gagal memuat jadwal konser.');
      })
      .finally(() => {
        if (mounted) setIsLoadingEvents(false);
      });

    const interval = setInterval(() => {
      fetchEventsAPI()
        .then((data) => {
          if (mounted && Array.isArray(data) && data.length > 0) {
            setLiveEvents(data);
            setEventsError(null);
          }
        })
        .catch(console.error);
    }, 30000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const displayEvents = useMemo(() => {
    if (liveEvents.length > 0) return liveEvents;
    if (eventsError) return [];
    return CONCERT_EVENTS;
  }, [liveEvents, eventsError]);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
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
  const openOrders = useCallback(() => setActiveDrawer('ORDERS'), []);
  const closeDrawer = useCallback(() => setActiveDrawer(null), []);
  const closeBookingModal = useCallback(() => {
    setBookingEvent(null);
    setBookingCategory(null);
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-[#0C0D12] text-[#F4F4F6]">
      <Header
        isScrolled={isScrolled}
        isMenuOpen={isMenuOpen}
        ordersCount={orders.length}
        user={user}
        onToggleMenu={toggleMenu}
        onOpenOrders={openOrders}
        onLogout={logout}
      />

      <div className="relative overflow-hidden bg-[#0C0D12]">
        <BoomerangVideoBg />
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-[#0C0D12]/60 via-[#0C0D12]/30 to-[#0C0D12]" />
        <Hero />
      </div>

      <RecommendedSection
        events={displayEvents}
        onBuyTicket={openBooking}
        isLoading={isLoadingEvents}
        error={eventsError}
      />

      <BentoSection
        events={displayEvents}
        onBuyTicket={openBooking}
        isLoading={isLoadingEvents}
        error={eventsError}
      />

      <FAQSection />

      <Footer />

      <div className="h-16" />

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
    </div>
  );
};

export const SymphoniaTicApp: React.FC = () => (
  <AuthProvider>
    <App />
  </AuthProvider>
);
