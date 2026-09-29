"use client";

import React, { Suspense } from "react";
import { ResetPasswordForm } from "@/components/ui/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-xs text-slate-400">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
