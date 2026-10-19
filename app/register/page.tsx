import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterContent } from "@/app/register/register-content";

export const metadata: Metadata = {
  title: "Create account",
};

export default function RegisterPage() {
  return (
    <AuthShell>
      <RegisterContent />
    </AuthShell>
  );
}
