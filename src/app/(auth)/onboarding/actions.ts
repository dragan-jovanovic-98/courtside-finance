"use server";

import { createClient } from "@/lib/supabase/server";

export async function completeOnboarding(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated." };
  }

  const fullName = formData.get("full_name") as string;
  const organizationName = formData.get("organization_name") as string;

  if (!fullName?.trim()) {
    return { error: "Full name is required." };
  }

  let organizationId: string | null = null;

  // Create organization if name provided
  if (organizationName?.trim()) {
    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .insert({ name: organizationName.trim() })
      .select("id")
      .single();

    if (orgError) {
      return { error: "Failed to create organization." };
    }

    organizationId = org.id;
  }

  // Update profile
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      full_name: fullName.trim(),
      ...(organizationId && { organization_id: organizationId }),
    })
    .eq("id", user.id);

  if (profileError) {
    return { error: "Failed to update profile." };
  }

  return {};
}
