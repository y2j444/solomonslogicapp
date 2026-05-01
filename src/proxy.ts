import { clerkMiddleware } from "@clerk/nextjs/server";

// In Next.js 16, the middleware is renamed to proxy and must export a 'proxy' function.
const clerkHandler = clerkMiddleware();

export function proxy(request: any, event: any) {
  return clerkHandler(request, event);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpg|jpeg|gif|png|svg|ico|ttf|woff2?|json)).*)",
    "/(api|trpc)(.*)",
  ],
};
