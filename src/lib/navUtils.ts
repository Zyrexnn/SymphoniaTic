const SUBROUTE_PARENT_MAP: Array<{ prefix: string; parentHref: string }> = [
  { prefix: '/concert/', parentHref: '/events' },
  { prefix: '/ticket/', parentHref: '/redeem' },
];

/**
 * Determine whether a primary navigation link should appear active for the current path,
 * mapping detail sub-routes (/concert/*, /ticket/*) back to their parent section.
 */
export function isNavItemActive(currentPath: string, itemHref: string): boolean {
  if (!currentPath) return false;
  if (itemHref === '/') return currentPath === '/';

  if (currentPath === itemHref || currentPath.startsWith(`${itemHref}/`) || currentPath.startsWith(itemHref)) {
    return true;
  }

  return SUBROUTE_PARENT_MAP.some(
    (entry) => entry.parentHref === itemHref && currentPath.startsWith(entry.prefix)
  );
}
