"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createContact(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated." };

  const firstName = (formData.get("first_name") as string)?.trim();
  if (!firstName) return { error: "First name is required." };

  const tagsRaw = (formData.get("tags") as string)?.trim();
  const tags = tagsRaw
    ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean)
    : null;

  const { data, error } = await supabase
    .from("contacts")
    .insert({
      user_id: user.id,
      first_name: firstName,
      last_name: (formData.get("last_name") as string)?.trim() || null,
      phone: (formData.get("phone") as string)?.trim() || null,
      email: (formData.get("email") as string)?.trim() || null,
      company: (formData.get("company") as string)?.trim() || null,
      notes: (formData.get("notes") as string)?.trim() || null,
      tags,
    })
    .select("id")
    .single();

  if (error) return { error: "Failed to create contact." };

  revalidatePath("/leads");
  return { id: data.id };
}

export async function updateContact(id: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated." };

  const firstName = (formData.get("first_name") as string)?.trim();
  if (!firstName) return { error: "First name is required." };

  const tagsRaw = (formData.get("tags") as string)?.trim();
  const tags = tagsRaw
    ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean)
    : null;

  const { error } = await supabase
    .from("contacts")
    .update({
      first_name: firstName,
      last_name: (formData.get("last_name") as string)?.trim() || null,
      phone: (formData.get("phone") as string)?.trim() || null,
      email: (formData.get("email") as string)?.trim() || null,
      company: (formData.get("company") as string)?.trim() || null,
      notes: (formData.get("notes") as string)?.trim() || null,
      tags,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: "Failed to update contact." };

  revalidatePath("/leads");
  revalidatePath(`/leads/${id}`);
  return {};
}

export async function deleteContact(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated." };

  const { error } = await supabase
    .from("contacts")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: "Failed to delete contact." };

  revalidatePath("/leads");
  return {};
}

export async function importContacts(rows: { first_name: string; last_name?: string; phone?: string; email?: string; company?: string; tags?: string }[]) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated.", count: 0 };

  const contacts = rows
    .filter((r) => r.first_name?.trim())
    .map((r) => ({
      user_id: user.id,
      first_name: r.first_name.trim(),
      last_name: r.last_name?.trim() || null,
      phone: r.phone?.trim() || null,
      email: r.email?.trim() || null,
      company: r.company?.trim() || null,
      tags: r.tags
        ? r.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : null,
    }));

  if (contacts.length === 0) return { error: "No valid contacts found in CSV.", count: 0 };

  const { error } = await supabase.from("contacts").insert(contacts);

  if (error) return { error: "Failed to import contacts.", count: 0 };

  revalidatePath("/leads");
  return { count: contacts.length };
}
