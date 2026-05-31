import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    env: {
      SUPABASE_URL: Boolean(process.env.SUPABASE_URL),
      SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      RESEND_API_KEY: Boolean(process.env.RESEND_API_KEY),
      EMAIL_FROM: Boolean(process.env.EMAIL_FROM),
      ADMIN_EXPORT_TOKEN: Boolean(process.env.ADMIN_EXPORT_TOKEN),
      NEXT_PUBLIC_SITE_URL: Boolean(process.env.NEXT_PUBLIC_SITE_URL)
    }
  });
}
