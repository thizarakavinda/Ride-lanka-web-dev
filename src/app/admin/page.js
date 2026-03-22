"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { isAdminEmail } from "@/lib/adminAuth";
import AdminShell from "@/components/admin/AdminShell";

export default function AdminPage() {
  const { user, loading, logOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (user && isAdminEmail(user.email)) return;
    router.replace("/");
  }, [user, loading, router]);

  async function handleLogout() {
    await logOut();
    router.replace("/");
  }

  if (loading) {
    return <div className="admin-loading-screen">Checking access…</div>;
  }

  if (!user || !isAdminEmail(user.email)) {
    return <div className="admin-loading-screen">Redirecting…</div>;
  }

  return <AdminShell user={user} onLogout={handleLogout} />;
}
