import React from 'react';
import {
  BarChart3,
  Ticket,
  Layers,
  ExternalLink,
  LogOut,
  RefreshCw,
  RotateCcw,
  QrCode,
  ShieldCheck,
  Tag,
  Users,
  History,
  Mail,
} from 'lucide-react';
import { formatIDR, type AdminRole } from '../landing/data';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AdminThemeToggle } from './AdminThemeContext';

export type TabId =
  | 'METRICS'
  | 'EVENTS'
  | 'PROMOS'
  | 'BROADCASTS'
  | 'ORDERS'
  | 'REFUNDS'
  | 'SCANNER'
  | 'STAFF'
  | 'AUDIT_LOGS';

interface AdminSidebarProps {
  activeTab: TabId;
  role?: AdminRole;
  onTabChange: (tab: TabId) => void;
  onLogout: () => void;
  eventsCount: number;
  promosCount?: number;
  ordersCount: number;
  refundsCount?: number;
  staffCount?: number;
  auditLogsCount?: number;
  totalRevenue: number;
}

const ALL_NAV_ITEMS: {
  id: TabId;
  label: string;
  shortLabel: string;
  icon: typeof BarChart3;
  roles: AdminRole[];
  group: 'GATE' | 'OPERASI' | 'SUPERVISI';
}[] = [
  { id: 'SCANNER', label: 'Scanner Gate Masuk', shortLabel: 'Scan Gate', icon: QrCode, roles: ['SUPER_ADMIN', 'ADMIN', 'PETUGAS'], group: 'GATE' },
  { id: 'ORDERS', label: 'Manajemen Pesanan', shortLabel: 'Pesanan', icon: Layers, roles: ['SUPER_ADMIN', 'ADMIN', 'PETUGAS'], group: 'GATE' },
  { id: 'METRICS', label: 'Metrik & Finansial', shortLabel: 'Metrik', icon: BarChart3, roles: ['SUPER_ADMIN', 'ADMIN'], group: 'OPERASI' },
  { id: 'EVENTS', label: 'Postingan Konser', shortLabel: 'Konser', icon: Ticket, roles: ['SUPER_ADMIN', 'ADMIN'], group: 'OPERASI' },
  { id: 'PROMOS', label: 'Kode Promo', shortLabel: 'Promo', icon: Tag, roles: ['SUPER_ADMIN', 'ADMIN'], group: 'OPERASI' },
  { id: 'BROADCASTS', label: 'Broadcast Email', shortLabel: 'Email', icon: Mail, roles: ['SUPER_ADMIN', 'ADMIN'], group: 'OPERASI' },
  { id: 'REFUNDS', label: 'Permohonan Refund', shortLabel: 'Refund', icon: RotateCcw, roles: ['SUPER_ADMIN', 'ADMIN'], group: 'OPERASI' },
  { id: 'STAFF', label: 'Manajemen Staf', shortLabel: 'Staf', icon: Users, roles: ['SUPER_ADMIN'], group: 'SUPERVISI' },
  { id: 'AUDIT_LOGS', label: 'Log Audit Sistem', shortLabel: 'Audit', icon: History, roles: ['SUPER_ADMIN'], group: 'SUPERVISI' },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  role = 'ADMIN',
  onTabChange,
  onLogout,
  eventsCount,
  promosCount,
  ordersCount,
  refundsCount,
  staffCount,
  auditLogsCount,
  totalRevenue,
}) => {
  const { open, isMobile, setOpenMobile } = useSidebar();
  const showExpanded = open || isMobile;

  const visibleNavItems = ALL_NAV_ITEMS.filter((item) => item.roles.includes(role));
  const gateItems = visibleNavItems.filter((i) => i.group === 'GATE');
  const opsItems = visibleNavItems.filter((i) => i.group === 'OPERASI');
  const supervisionItems = visibleNavItems.filter((i) => i.group === 'SUPERVISI');

  const getBadgeText = (id: TabId): string => {
    if (id === 'EVENTS') return `${eventsCount}`;
    if (id === 'PROMOS') return `${promosCount || 0}`;
    if (id === 'ORDERS') return `${ordersCount}`;
    if (id === 'REFUNDS') return `${refundsCount || 0}`;
    if (id === 'STAFF') return `${staffCount || 0}`;
    if (id === 'AUDIT_LOGS') return `${auditLogsCount || 0}`;
    if (id === 'METRICS' && totalRevenue) return formatIDR(totalRevenue);
    return '';
  };

  const handleSelectTab = (tab: TabId) => {
    onTabChange(tab);
    if (isMobile) setOpenMobile(false);
  };

  const renderNavItem = (item: (typeof ALL_NAV_ITEMS)[number]) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;
    const badge = getBadgeText(item.id);

    return (
      <SidebarMenuItem key={item.id}>
        <SidebarMenuButton
          type="button"
          isActive={isActive}
          tooltip={item.label}
          onClick={() => handleSelectTab(item.id)}
          className={showExpanded ? 'justify-between' : 'justify-center'}
        >
          <span className="flex items-center gap-3 min-w-0">
            <Icon
              size={17}
              strokeWidth={1.75}
              className={
                isActive
                  ? 'text-[#141413] dark:text-[#D4FF2A] shrink-0'
                  : 'text-muted-foreground shrink-0'
              }
              aria-hidden="true"
            />
            {showExpanded && <span className="truncate">{item.label}</span>}
          </span>
          {showExpanded && badge && (
            <Badge
              variant={isActive ? 'default' : 'secondary'}
              className="font-mono text-[11px] px-1.5 py-0.5 shrink-0"
            >
              {badge}
            </Badge>
          )}
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar>
      <SidebarHeader className={showExpanded ? 'p-4' : 'p-3 items-center'}>
        <a
          href="/"
          className="flex items-center gap-3 no-underline group rounded-none p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div className="w-10 h-10 rounded-none border border-border-strong bg-[#141413] text-[#D4FF2A] flex items-center justify-center shrink-0 transition-colors">
            <span className="font-display text-xl font-extrabold">S.</span>
          </div>
          {showExpanded && (
            <div className="min-w-0">
              <span className="text-sm font-bold text-sidebar-foreground tracking-tight block truncate">
                SymphoniaTic.
              </span>
              <span className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase block truncate">
                {role === 'SUPER_ADMIN'
                  ? 'Super Admin'
                  : role === 'PETUGAS'
                  ? 'Gate Officer'
                  : 'Admin Portal'}
              </span>
            </div>
          )}
        </a>
      </SidebarHeader>

      <SidebarContent>
        {gateItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>
              {role === 'PETUGAS' ? 'Menu Petugas Gate' : 'Operasional Gate & Order'}
            </SidebarGroupLabel>
            <SidebarMenu>{gateItems.map(renderNavItem)}</SidebarMenu>
          </SidebarGroup>
        )}

        {opsItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Manajemen &amp; Keuangan</SidebarGroupLabel>
            <SidebarMenu>{opsItems.map(renderNavItem)}</SidebarMenu>
          </SidebarGroup>
        )}

        {supervisionItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Supervisi &amp; Keamanan</SidebarGroupLabel>
            <SidebarMenu>{supervisionItems.map(renderNavItem)}</SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        {showExpanded && (
          <div className="px-2.5 py-2 mb-1 rounded-none border border-border bg-background flex items-center gap-2.5">
            <ShieldCheck
              size={15}
              className="text-foreground dark:text-[#D4FF2A] shrink-0"
              aria-hidden="true"
            />
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                Peran Aktif
              </span>
              <span className="text-xs font-bold text-foreground block truncate">
                {role === 'SUPER_ADMIN'
                  ? 'Super Administrator'
                  : role === 'PETUGAS'
                  ? 'Petugas Gate Scanner'
                  : 'Administrator Operasional'}
              </span>
            </div>
          </div>
        )}

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Web Utama">
              <a href="/" className={showExpanded ? 'justify-start' : 'justify-center'}>
                <ExternalLink size={16} strokeWidth={1.7} aria-hidden="true" />
                {showExpanded && <span>Web Utama</span>}
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              type="button"
              tooltip="Keluar Sesi"
              onClick={onLogout}
              className={`text-[#C81E1E] dark:text-rose-300 hover:bg-[#C81E1E]/10 hover:text-[#C81E1E] dark:hover:text-rose-200 ${
                showExpanded ? 'justify-start' : 'justify-center'
              }`}
            >
              <LogOut size={16} strokeWidth={1.7} aria-hidden="true" />
              {showExpanded && <span>Keluar Sesi</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

interface MobileHeaderProps {
  activeTab: TabId;
  role?: AdminRole;
  onRefresh: () => void;
  isLoading: boolean;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  activeTab,
  role = 'ADMIN',
  onRefresh,
  isLoading,
}) => {
  const visibleNavItems = ALL_NAV_ITEMS.filter((item) => item.roles.includes(role));
  const currentItem = visibleNavItems.find((n) => n.id === activeTab) || visibleNavItems[0];

  return (
    <div className="md:hidden flex items-center justify-between gap-2 px-3.5 py-2.5 bg-card border-b border-border sticky top-0 z-40">
      <div className="flex items-center gap-2.5 min-w-0">
        <SidebarTrigger showLabelOnMobile />
        <div className="min-w-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block truncate">
            {role === 'SUPER_ADMIN' ? 'Super Admin' : role === 'PETUGAS' ? 'Gate Officer' : 'Admin'}
          </span>
          <span className="text-sm font-bold text-foreground tracking-tight block truncate">
            {currentItem.label}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <AdminThemeToggle />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={onRefresh}
          disabled={isLoading}
          aria-label="Muat ulang data"
        >
          <RefreshCw
            size={16}
            strokeWidth={1.7}
            className={isLoading ? 'animate-spin' : ''}
            aria-hidden="true"
          />
        </Button>
      </div>
    </div>
  );
};

export const MobileBottomNav: React.FC<{
  activeTab: TabId;
  role?: AdminRole;
  onTabChange: (tab: TabId) => void;
}> = ({ activeTab, role = 'ADMIN', onTabChange }) => {
  const visibleNavItems = ALL_NAV_ITEMS.filter((item) => item.roles.includes(role));

  return (
    <nav
      aria-label="Navigasi cepat portal"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border flex items-center justify-start sm:justify-around overflow-x-auto no-scrollbar py-1 px-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))]"
    >
      {visibleNavItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            aria-current={isActive ? 'page' : undefined}
            onClick={() => onTabChange(item.id)}
            className={`relative shrink-0 min-h-[48px] min-w-[62px] flex flex-col items-center justify-center py-1.5 px-2.5 rounded-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              isActive
                ? 'text-foreground bg-secondary font-bold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {isActive && (
              <span
                aria-hidden="true"
                className="absolute top-0 left-2 right-2 h-0.5 bg-[#141413] dark:bg-[#D4FF2A]"
              />
            )}
            <Icon
              size={18}
              strokeWidth={isActive ? 2.2 : 1.6}
              className={isActive ? 'text-foreground dark:text-[#D4FF2A]' : undefined}
              aria-hidden="true"
            />
            <span className="text-[11px] tracking-tight mt-1 truncate max-w-[68px]">
              {item.shortLabel}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
