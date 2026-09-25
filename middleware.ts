import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const protectedAdminPaths = [
    "/admin/dashboard",
    "/admin/messages",
    "/admin/knowledge",
    "/admin/projects",
    "/admin/love",
  ];
  const isProtectedPath = protectedAdminPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path),
  );

  if (!supabaseUrl || !supabaseAnonKey) {
    if (isProtectedPath) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/admin";
      loginUrl.searchParams.set("error", "auth-config");
      return NextResponse.redirect(loginUrl);
    }
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookieOptions: {
      secure: false,
    },
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  let user = null;
  try {
    const result = await supabase.auth.getUser();
    user = result.data.user;
  } catch (error) {
    console.error("Middleware auth check failed:", error);
    if (isProtectedPath) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/admin";
      loginUrl.searchParams.set("error", "auth-unavailable");
      return NextResponse.redirect(loginUrl);
    }
  }

  if (!user && isProtectedPath) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin";
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/dashboard/:path*",
    "/admin/messages/:path*",
    "/admin/knowledge/:path*",
    "/admin/projects/:path*",
    "/admin/love/:path*",
  ],
};
