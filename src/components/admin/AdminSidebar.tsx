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

export type TabId = 'METRICS' | 'EVENTS' | 'ORDERS' | 'REFUNDS' | 'SCANNER';

interface AdminSidebarProps {
  activeTab: TabId;
  role?: AdminRole;
  onTabChange: (tab: TabId) => void;
  onLogout: () => void;
  eventsCount: number;
  ordersCount: number;
  refundsCount?: number;
  totalRevenue: number;
}

const ALL_NAV_ITEMS: {
  id: TabId;
  label: string;
  shortLabel: string;
  icon: typeof BarChart3;
  roles: AdminRole[];
  group: 'GATE' | 'OPERASI';
}[] = [
  { id: 'SCANNER', label: 'Scanner Gate Masuk', shortLabel: 'Scan Gate', icon: QrCode, roles: ['ADMIN', 'PETUGAS'], group: 'GATE' },
  { id: 'ORDERS', label: 'Manajemen Pesanan', shortLabel: 'Pesanan', icon: Layers, roles: ['ADMIN', 'PETUGAS'], group: 'GATE' },
  { id: 'METRICS', label: 'Metrik & Finansial', shortLabel: 'Metrik', icon: BarChart3, roles: ['ADMIN'], group: 'OPERASI' },
  { id: 'EVENTS', label: 'Postingan Konser', shortLabel: 'Konser', icon: Ticket, roles: ['ADMIN'], group: 'OPERASI' },
  { id: 'REFUNDS', label: 'Permohonan Refund', shortLabel: 'Refund', icon: RotateCcw, roles: ['ADMIN'], group: 'OPERASI' },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  role = 'ADMIN',
  onTabChange,
  onLogout,
  eventsCount,
  ordersCount,
  refundsCount,
  totalRevenue,
}) => {
  const { open, isMobile, setOpenMobile } = useSidebar();
  const showExpanded = open || isMobile;

  const visibleNavItems = ALL_NAV_ITEMS.filter((item) => item.roles.includes(role));
  const gateItems = visibleNavItems.filter((i) => i.group === 'GATE');
  const opsItems = visibleNavItems.filter((i) => i.group === 'OPERASI');

  const getBadgeText = (id: TabId): string => {
    if (id === 'EVENTS') return `${eventsCount}`;
    if (id === 'ORDERS') return `${ordersCount}`;
    if (id === 'REFUNDS') return `${refundsCount || 0}`;
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
                  ? 'text-[#C93018] dark:text-[#F2644E] shrink-0'
                  : 'text-muted-foreground shrink-0'
              }
              aria-hidden="true"
            />
            {showExpanded && <span className="truncate">{item.label}</span>}
          </span>
          {showExpanded && badge && (
            <Badge
              variant={isActive ? 'dark' : 'secondary'}
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
          className="flex items-center gap-3 no-underline group rounded-lg p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div className="w-10 h-10 rounded-lg border border-border-strong bg-background flex items-center justify-center shrink-0 group-hover:border-[#C93018] transition-colors">
            <span className="font-display text-xl font-semibold text-foreground">S</span>
          </div>
          {showExpanded && (
            <div className="min-w-0">
              <span className="text-sm font-semibold text-sidebar-foreground tracking-tight block truncate">
                SymphoniaTic
              </span>
              <span className="text-[11px] font-semibold text-[#C93018] dark:text-[#F2644E] tracking-wider uppercase block truncate">
                {role === 'PETUGAS' ? 'Gate Officer' : 'Admin Portal'}
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
      </SidebarContent>

      <SidebarFooter>
        {showExpanded && (
          <div className="px-2.5 py-2 mb-1 rounded-lg border border-border bg-background flex items-center gap-2.5">
            <ShieldCheck
              size={15}
              className="text-[#C93018] dark:text-[#F2644E] shrink-0"
              aria-hidden="true"
            />
            <div className="min-w-0">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
                Peran Aktif
              </span>
              <span className="text-xs font-semibold text-foreground block truncate">
                {role === 'PETUGAS' ? 'Petugas Gate Scanner' : 'Administrator Penuh'}
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
              className={`text-[#B91C1C] dark:text-rose-300 hover:bg-[#B91C1C]/10 hover:text-[#B91C1C] dark:hover:text-rose-200 ${
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
          <span className="text-xs font-semibold uppercase tracking-wider text-[#C93018] dark:text-[#F2644E] block truncate">
            {role === 'PETUGAS' ? 'Gate Officer' : 'Admin'}
          </span>
          <span className="text-sm font-semibold text-foreground tracking-tight block truncate">
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
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border flex items-center justify-around py-1 px-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))]"
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
            className={`relative min-h-[48px] min-w-[52px] flex flex-col items-center justify-center py-1.5 px-2 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              isActive
                ? 'text-foreground bg-secondary font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {isActive && (
              <span
                aria-hidden="true"
                className="absolute top-0 left-3 right-3 h-0.5 rounded-b-full bg-[#C93018]"
              />
            )}
            <Icon
              size={18}
              strokeWidth={isActive ? 2 : 1.6}
              className={isActive ? 'text-[#C93018] dark:text-[#F2644E]' : undefined}
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
