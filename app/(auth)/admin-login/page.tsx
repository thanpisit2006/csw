import React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AdminLoginForm } from "@/components/auth/admin-login-form";
import { ShieldCheck } from "lucide-react";

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg)]">
      <div className="w-full max-w-[560px] grid gap-6">
        <div className="text-center grid gap-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mx-auto border border-[color-mix(in_oklab,var(--border)_55%,transparent)] shadow-lg bg-[radial-gradient(18px_18px_at_30%_30%,rgba(255,255,255,0.35),transparent_60%),linear-gradient(135deg,color-mix(in_oklab,#ff3b30_70%,#fff),color-mix(in_oklab,#ff3b30_10%,#000))]">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-[var(--text)]">
            Admin Access Portal
          </h1>
          <p className="text-xs text-[var(--muted)]">
            Role-Based Authorization Required (role=&quot;admin&quot;)
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Admin Credentials</CardTitle>
          </CardHeader>
          <CardContent>
            <AdminLoginForm />
          </CardContent>
        </Card>

        <div className="text-center text-xs text-[var(--muted)]">
          Need student access?{" "}
          <Link href="/login" className="text-[var(--accent)] hover:underline font-bold">
            Student Login
          </Link>
        </div>
      </div>
    </div>
  );
}
