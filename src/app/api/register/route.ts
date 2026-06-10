import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function makeReference(): string {
  const n = Math.floor(1000 + Math.random() * 9000);
  return `YDEE-2026-${n}`;
}

const REQUIRED = [
  "firstName",
  "surname",
  "email",
  "phone",
  "city",
  "occupation",
  "status",
  "referral",
  "hasBusiness",
] as const;

export async function POST(req: Request) {
  try {
    const d = await req.json();

    // Honeypot: silently accept and discard bot submissions.
    if (d.company_url) {
      return NextResponse.json({ ok: true, reference: "IGNORED" });
    }

    for (const key of REQUIRED) {
      if (!d[key]) {
        return NextResponse.json(
          { ok: false, error: `Missing required field: ${key}` },
          { status: 400 }
        );
      }
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) {
      return NextResponse.json(
        { ok: false, error: "Invalid email address." },
        { status: 400 }
      );
    }

    const hasBusiness = d.hasBusiness === "Yes";
    const reference = makeReference();

    await prisma.registration.create({
      data: {
        reference,
        firstName: String(d.firstName).trim(),
        surname: String(d.surname).trim(),
        email: String(d.email).trim(),
        phone: String(d.phone).trim(),
        city: String(d.city).trim(),
        occupation: String(d.occupation).trim(),
        status: String(d.status),
        institution: d.institution || null,
        hasBusiness,
        businessName: hasBusiness ? d.businessName || null : null,
        sector: hasBusiness ? d.sector || null : null,
        stage: hasBusiness ? d.stage || null : null,
        businessDesc: hasBusiness ? d.businessDesc || null : null,
        hasWebsite: hasBusiness ? d.hasWebsite === "Yes" : null,
        domain: hasBusiness && d.hasWebsite === "Yes" ? d.domain || null : null,
        socials: Array.isArray(d.socials) ? d.socials : [],
        referral: d.referral || null,
        goals: d.goals || null,
        marketingOptIn: Boolean(d.marketingOptIn),
      },
    });

    return NextResponse.json({ ok: true, reference });
  } catch (err) {
    console.error("Registration error:", err);
    return NextResponse.json(
      { ok: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
