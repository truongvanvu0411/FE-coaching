import { redirect } from "@/i18n/navigation";
import { getLocale } from "next-intl/server";
import { registrationOpen } from "@/lib/env";
import { RegisterForm } from "@/components/auth/register-form";

// Server component wrapper: the form itself is a client component, so the check
// lives here. /api/auth/register enforces the same rule — this only avoids
// showing a form that could never succeed.
export default async function RegisterPage() {
  if (!registrationOpen()) {
    redirect({ href: "/login", locale: await getLocale() });
  }
  return <RegisterForm />;
}
