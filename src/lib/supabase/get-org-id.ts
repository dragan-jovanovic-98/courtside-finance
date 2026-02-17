import { redirect } from "next/navigation";
import { createClient } from "./server";

export async function getAuthContext() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single();

  if (!profile?.organization_id) {
    redirect("/onboarding");
  }

  return {
    supabase,
    userId: user.id,
    organizationId: profile.organization_id,
  };
}
