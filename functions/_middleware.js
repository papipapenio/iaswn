export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);
  const userAgent = request.headers.get('User-Agent') || '';
  const cookies = request.headers.get('Cookie') || '';
  
  // 1. Logic Flags
  const isMobile = /Android|iPhone|iPad|iPod/i.test(userAgent);
  const wantsDesktop = url.searchParams.get('platform') === 'desktop';
  const hasOverrideCookie = cookies.includes('skip_mobile=true');

  // DEBUG: If you want to see if the cookie exists, you can check headers in DevTools
  
  // 2. THE REDIRECT GATE
  // If they are on mobile AND they don't have the cookie AND they aren't currently asking for desktop...
  if (isMobile && !hasOverrideCookie && !wantsDesktop) {
    const mobileUrl = `https://m-iaswn.pages.dev${url.pathname}${url.search}`;
    return Response.redirect(mobileUrl, 302);
  }

  // 3. THE COOKIE SETTER
  // If they clicked the link (?platform=desktop), we must set the cookie
  if (wantsDesktop) {
    // Get the actual page content
    const response = await next();
    
    // Create a new response so we can modify headers
    const newResponse = new Response(response.body, response);
    
    // Set cookie to expire in 1 day. 
    // IMPORTANT: Path=/ makes it work for the whole site.
    newResponse.headers.append('Set-Cookie', 'skip_mobile=true; Path=/; Max-Age=86400; SameSite=Lax');
    
    return newResponse;
  }

  // Otherwise, just serve the page normally
  return next();
}