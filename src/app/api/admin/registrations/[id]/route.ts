import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isValidSession, SESSION_COOKIE } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Delete a single registration. Protected by the same admin session cookie
// as the dashboard, so it can't be called by an unauthenticated visitor.
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!isValidSession(token)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.registration.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    // P2025 = record to delete does not exist (already gone).
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return NextResponse.json({ ok: false, error: "Not found." }, { status: 404 });
    }
    console.error("Delete error:", e);
    return NextResponse.json(
      { ok: false, error: "Could not delete. Please try again." },
      { status: 500 }
    );
  }
}
