// Maps the reference prototype's file links to app routes. Everything else (external URLs,
// mailto:) passes through untouched.
const ROUTES: Record<string, string> = {
  'EdCloud Home.dc.html': '/',
  'EdCloud About.dc.html': '/about',
  'EdCloud Services.dc.html': '/services-and-results',
};

export const route = (href: string): string => ROUTES[href] ?? href;
export const isRoute = (href: string): boolean => href in ROUTES;
