"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createCampaign(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated." };

  const name = (formData.get("name") as string)?.trim();
  if (!name) return { error: "Campaign name is required." };

  const agentId = (formData.get("agent_id") as string) || null;
  const description = (formData.get("description") as string)?.trim() || null;
  const scheduledAt = (formData.get("scheduled_at") as string) || null;
  const contactIds = formData.getAll("contact_ids") as string[];
  const timezone = (formData.get("timezone") as string) || "America/New_York";
  const callWindowStart = (formData.get("call_window_start") as string) || null;
  const callWindowEnd = (formData.get("call_window_end") as string) || null;
  const dailyCapStr = formData.get("daily_cap") as string;
  const dailyCap = dailyCapStr ? parseInt(dailyCapStr, 10) : null;
  const maxConcurrentStr = formData.get("max_concurrent_calls") as string;
  const maxConcurrentCalls = maxConcurrentStr ? parseInt(maxConcurrentStr, 10) : 5;

  // Create campaign
  const { data: campaign, error: campError } = await supabase
    .from("campaigns")
    .insert({
      user_id: user.id,
      name,
      description,
      agent_id: agentId,
      status: scheduledAt ? "scheduled" : "draft",
      scheduled_at: scheduledAt || null,
      total_contacts: contactIds.length,
      timezone,
      call_window_start: callWindowStart || null,
      call_window_end: callWindowEnd || null,
      daily_cap: dailyCap,
      max_concurrent_calls: maxConcurrentCalls,
    })
    .select("id")
    .single();

  if (campError) return { error: "Failed to create campaign." };

  // Add contacts to campaign
  if (contactIds.length > 0) {
    const campaignContacts = contactIds.map((contactId) => ({
      campaign_id: campaign.id,
      contact_id: contactId,
    }));

    const { error: ccError } = await supabase
      .from("campaign_contacts")
      .insert(campaignContacts);

    if (ccError) return { error: "Campaign created but failed to add contacts." };
  }

  revalidatePath("/campaigns");
  return { id: campaign.id };
}

export async function updateCampaignStatus(
  id: string,
  status: "draft" | "scheduled" | "in_progress" | "paused" | "completed"
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated." };

  const updates: Record<string, unknown> = { status };
  if (status === "in_progress") updates.started_at = new Date().toISOString();
  if (status === "completed") updates.completed_at = new Date().toISOString();

  const { error } = await supabase
    .from("campaigns")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: "Failed to update campaign status." };

  revalidatePath("/campaigns");
  revalidatePath(`/campaigns/${id}`);
  return {};
}
