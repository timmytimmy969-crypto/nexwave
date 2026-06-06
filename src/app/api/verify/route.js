import { NextResponse } from "next/server";
import { z } from "zod";
import { addResendContact, normalizeEmail, sendWelcomeEmail } from "@/lib/otp";
import { consumeStoredOtp, verifyMember } from "@/lib/store";

const schema = z.object({
  email: z.string().email(),
  code: z.string().length(6)
});

export async function POST(request) {
  try {
    const payload = schema.parse(await request.json());
    const email = normalizeEmail(payload.email);

    if (!(await consumeStoredOtp(email, payload.code))) {
      return NextResponse.json({ message: "Invalid or expired verification code." }, { status: 400 });
    }

    const member = await verifyMember(email);
    if (!member) return NextResponse.json({ message: "Registration not found." }, { status: 404 });

    const welcome = await sendWelcomeEmail(member.email, member.full_name);
    if (welcome?.error) console.error("Welcome email failed:", welcome.error);

    const contact = await addResendContact(member);
    if (contact?.error) console.error("Resend contact sync failed:", contact.error);

    return NextResponse.json({
      ok: true,
      whatsapp: "https://chat.whatsapp.com/FZSJW6vCjr48HhYmbkRFNr"
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Enter the 6-digit code sent to your Gmail." }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ message: "Verification could not be completed." }, { status: 500 });
  }
}
