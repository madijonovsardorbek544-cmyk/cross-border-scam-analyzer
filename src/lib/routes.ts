export const validRoutes = ['home', 'checker', 'cases', 'report', 'dashboard', 'pilot', 'methodology', 'privacy', 'eval'] as const;
export type AppRoute = typeof validRoutes[number];

export function normalizeHashRoute(hash: string): AppRoute {
  const route = hash.replace(/^#/, '').trim().toLowerCase();
  return (validRoutes as readonly string[]).includes(route) ? (route as AppRoute) : 'home';
}

export function currentHashRoute(): AppRoute {
  if (typeof window === 'undefined') return 'home';
  return normalizeHashRoute(window.location.hash);
}

export function setHashRoute(route: AppRoute): void {
  if (typeof window === 'undefined') return;
  const nextHash = `#${route}`;
  if (window.location.hash !== nextHash) {
    window.location.hash = route;
  }
}
