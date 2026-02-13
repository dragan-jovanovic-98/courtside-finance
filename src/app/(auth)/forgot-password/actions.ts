"use server";

import { createClient } from "@/lib/supabase/server";

export async function resetPassword(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/confirm`,
  });

  if (error) {
    return { error: error.message };
  }

  return {
    message: "Check your email for a password reset link.",
  };
}
