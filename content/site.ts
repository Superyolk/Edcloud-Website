// Maps the reference prototype's file links to app routes. Everything else (external URLs,
// mailto:) passes through untouched.
const ROUTES: Record<string, string> = {
  'EdCloud Home.dc.html': '/',
  'EdCloud About.dc.html': '/about',
  'EdCloud Services.dc.html': '/services-and-results',
  // Legal pages now live in this site rather than on the old Wix domain.
  'https://www.edcloud.org/privacy-policy': '/privacy-policy',
  'https://www.edcloud.org/accessibility-statement': '/accessibility-statement',
};

export const route = (href: string): string => ROUTES[href] ?? href;
export const isRoute = (href: string): boolean => href in ROUTES;
