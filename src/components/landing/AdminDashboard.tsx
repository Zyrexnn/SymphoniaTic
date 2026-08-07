import React from 'react';
import { AdminApp } from '../admin/AdminApp';
import type { EventItem } from './data';

interface AdminDashboardProps {
  onClose: () => void;
  onEventsUpdated?: () => void;
  allEvents?: EventItem[];
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose, onEventsUpdated }) => {
  return (
    <div className="fixed inset-0 z-50 flex bg-[#171717]">
      <AdminApp onClose={onClose} onEventsUpdated={onEventsUpdated} />
    </div>
  );
};
