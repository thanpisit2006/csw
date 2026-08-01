import React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StudentOtpInput } from "@/components/auth/student-otp-input";
import { BrandLogo } from "@/components/ui/brand-logo";
import { ShieldCheck } from "lucide-react";

export default function StudentLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg)]">
      <div className="w-full max-w-[560px] grid gap-6">
        <div className="text-center grid gap-2">
          <BrandLogo className="w-14 h-14 mx-auto" />
          <h1 className="text-3xl font-black tracking-tight text-[var(--text)]">
            Class Schedule
          </h1>
          <p className="text-xs text-[var(--muted)]">
            Enter Student ID to Continue
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center text-sm">Student ID Verification</CardTitle>
          </CardHeader>
          <CardContent>
            <StudentOtpInput />
          </CardContent>
        </Card>

        {/* <div className="text-center text-xs text-[var(--muted)] flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-[var(--accent)]" /> System Administrator?{" "}
          <Link href="/admin-login" className="text-[var(--accent)] hover:underline font-bold">
            Admin Login
          </Link>
        </div> */}
      </div>
    </div>
  );
}
