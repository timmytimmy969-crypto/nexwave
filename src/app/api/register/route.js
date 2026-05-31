import { NextResponse } from "next/server";
import { z } from "zod";
import { addResendContact, canRequestOtp, normalizeEmail, sendWelcomeEmail } from "@/lib/otp";
import { findMemberByEmail, savePendingMember, verifyMember } from "@/lib/store";

const schema = z.object({
  fullName: z.string().min(2).max(120),
  email: z.string().email().refine((value) => value.toLowerCase().endsWith("@gmail.com"), "Use a Gmail address"),
  instagram: z.string().min(2).max(60),
  field: z.string().min(2).max(80)
});

export async function POST(request) {
  try {
    const payload = schema.parse(await request.json());
    const email = normalizeEmail(payload.email);
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "local";

    if (!canRequestOtp(email, ip)) {
      return NextResponse.json({ message: "Too many signups from this email. Try again in a few minutes." }, { status: 429 });
    }

    let existing = null;
    try {
      existing = await findMemberByEmail(email);
    } catch (error) {
      console.error("Supabase registration lookup failed:", error);
      return NextResponse.json({ message: "Database could not check this email." }, { status: 500 });
    }

    if (existing?.verified) {
      return NextResponse.json({ message: "This email is already part of the first wave." }, { status: 409 });
    }

    try {
      await savePendingMember({
        full_name: payload.fullName.trim(),
        email,
        instagram: payload.instagram.trim().replace(/^@/, ""),
        creative_field: payload.field
      });
    } catch (error) {
      console.error("Supabase registration save failed:", error);
      return NextResponse.json({ message: "Database could not save this registration." }, { status: 500 });
    }

    const member = await verifyMember(email);

    const welcome = await sendWelcomeEmail(member.email, member.full_name);
    if (welcome?.error) console.error("Welcome email failed:", welcome.error);

    const contact = await addResendContact(member);
    if (contact?.error) console.error("Resend contact sync failed:", contact.error);

    return NextResponse.json({
      ok: true,
      message: "Welcome to Nexwave.",
      whatsapp: "https://chat.whatsapp.com/FZSJW6vCjr48HhYmbkRFNr"
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.issues[0]?.message || "Invalid registration details." }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ message: "Registration could not be completed." }, { status: 500 });
  }
}
