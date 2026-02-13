import { createClient } from "@/lib/supabase/server";
import { LeadsClient } from "./leads-client";

export default async function LeadsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: contacts } = await supabase
    .from("contacts")
    .select("id, first_name, last_name, phone, email, company, tags, created_at")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  return <LeadsClient contacts={contacts ?? []} />;
}
