import { NextResponse } from "next/server";
import { z } from "zod";
import { canRequestOtp, createOtp, normalizeEmail, sendOtpEmail } from "@/lib/otp";
import { findMemberByEmail, savePendingMember } from "@/lib/store";

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
      return NextResponse.json({ message: "Too many code requests. Try again in a few minutes." }, { status: 429 });
    }

    const existing = await findMemberByEmail(email);
    if (existing?.verified) {
      return NextResponse.json({ message: "This email is already part of the first wave." }, { status: 409 });
    }

    await savePendingMember({
      full_name: payload.fullName.trim(),
      email,
      instagram: payload.instagram.trim().replace(/^@/, ""),
      creative_field: payload.field
    });

    const code = createOtp(email);
    const mail = await sendOtpEmail(email, code, payload.fullName.trim());

    return NextResponse.json({
      ok: true,
      message: "Verification code sent.",
      demoCode: mail?.demo ? code : undefined
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.issues[0]?.message || "Invalid registration details." }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ message: "Registration could not be completed." }, { status: 500 });
  }
}
