export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);
  const userAgent = request.headers.get('User-Agent') || '';
  
  // 1. Identify mobile users
  const isMobile = /Android|iPhone|iPad|iPod/i.test(userAgent);
  
  // 2. Check for override signals
  const wantsDesktop = url.searchParams.get('version') === 'desktop';
  const hasOverrideCookie = request.headers.get('Cookie')?.includes('force_desktop=true');

  // If they are on mobile and haven't asked for the desktop version...
  if (isMobile && !wantsDesktop && !hasOverrideCookie) {
    // Redirect to your m- URL
    const mobileUrl = `https://m-iaswn.pages.dev${url.pathname}${url.search}`;
    return Response.redirect(mobileUrl, 302);
  }

  // Otherwise, let the request continue to the desktop site
  let response = await next();

  // If they just arrived via the "View Desktop" link, set the cookie
  if (wantsDesktop) {
    // We have to clone the response to modify headers
    response = new Response(response.body, response);
    response.headers.set('Set-Cookie', 'force_desktop=true; Path=/; Max-Age=3600; SameSite=Lax');
  }

  return response;
}