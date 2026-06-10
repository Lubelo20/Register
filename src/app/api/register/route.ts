import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// 6-digit code → 900k possibilities. Combined with the retry-on-collision
// loop below, this comfortably supports thousands of registrations without
// two people ever sharing a (unique) reference.
function makeReference(): string {
  const n = Math.floor(100000 + Math.random() * 900000);
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

    const data = {
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
    };

    // Retry on the (rare) chance the random reference is already taken, so a
    // collision never turns into a failed registration as numbers grow.
    let reference = "";
    for (let attempt = 0; attempt < 6; attempt++) {
      reference = makeReference();
      try {
        await prisma.registration.create({ data: { reference, ...data } });
        break;
      } catch (e) {
        const isDuplicateReference =
          e instanceof Prisma.PrismaClientKnownRequestError &&
          e.code === "P2002";
        if (isDuplicateReference && attempt < 5) continue;
        throw e;
      }
    }

    return NextResponse.json({ ok: true, reference });
  } catch (err) {
    console.error("Registration error:", err);
    return NextResponse.json(
      { ok: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
