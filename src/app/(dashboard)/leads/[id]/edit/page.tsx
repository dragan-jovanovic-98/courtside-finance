import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ContactForm } from "../../contact-form";

export default async function EditLeadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: contact } = await supabase
    .from("contacts")
    .select("id, first_name, last_name, phone, email, company, notes, tags")
    .eq("id", id)
    .single();

  if (!contact) notFound();

  return (
    <div className="max-w-2xl">
      <ContactForm contact={contact} mode="edit" />
    </div>
  );
}
