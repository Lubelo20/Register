import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isValidSession, SESSION_COOKIE } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminTable from "@/components/AdminTable";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!isValidSession(token)) redirect("/admin/login");

  const registrations = await prisma.registration.findMany({
    orderBy: { createdAt: "desc" },
  });

  // Serialise Date objects for the client component.
  const rows = registrations.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
  }));

  return <AdminTable rows={rows} />;
}
