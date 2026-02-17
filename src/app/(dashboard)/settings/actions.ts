"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated." };
  }

  const fullName = formData.get("full_name") as string;

  if (!fullName?.trim()) {
    return { error: "Full name is required." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName.trim() })
    .eq("id", user.id);

  if (error) {
    return { error: "Failed to update profile." };
  }

  revalidatePath("/settings");
  return {};
}

export async function updateOrganization(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated." };
  }

  const orgName = formData.get("organization_name") as string;

  if (!orgName?.trim()) {
    return { error: "Organization name is required." };
  }

  const orgData = {
    name: orgName.trim(),
    phone: (formData.get("org_phone") as string)?.trim() || null,
    email: (formData.get("org_email") as string)?.trim() || null,
    website: (formData.get("org_website") as string)?.trim() || null,
    address: (formData.get("org_address") as string)?.trim() || null,
    timezone: (formData.get("org_timezone") as string) || "America/New_York",
    business_hours_start: (formData.get("org_hours_start") as string) || "09:00",
    business_hours_end: (formData.get("org_hours_end") as string) || "17:00",
    business_days: JSON.parse((formData.get("business_days") as string) || "[1,2,3,4,5]"),
  };

  // Check if user already has an organization
  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single();

  if (profile?.organization_id) {
    const { error } = await supabase
      .from("organizations")
      .update(orgData)
      .eq("id", profile.organization_id);

    if (error) {
      return { error: "Failed to update organization." };
    }
  } else {
    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .insert(orgData)
      .select("id")
      .single();

    if (orgError) {
      return { error: "Failed to create organization." };
    }

    const { error: linkError } = await supabase
      .from("profiles")
      .update({ organization_id: org.id })
      .eq("id", user.id);

    if (linkError) {
      return { error: "Failed to link organization to profile." };
    }
  }

  revalidatePath("/settings");
  return {};
}

export async function changePassword(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated." };
  }

  const newPassword = formData.get("new_password") as string;
  const confirmPassword = formData.get("confirm_password") as string;

  if (!newPassword || newPassword.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  if (newPassword !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) {
    return { error: "Failed to update password." };
  }

  return {};
}

export async function updateVerification(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single();

  if (!profile?.organization_id) {
    return { error: "No organization found. Please set up your organization first." };
  }

  const verificationData = {
    country: (formData.get("country") as string) || "US",
    legal_name: (formData.get("legal_name") as string)?.trim() || null,
    dba_name: (formData.get("dba_name") as string)?.trim() || null,
    ein: (formData.get("ein") as string)?.trim() || null,
    business_type: (formData.get("business_type") as string) || null,
    registration_number: (formData.get("registration_number") as string)?.trim() || null,
    business_industry: (formData.get("business_industry") as string) || null,
    address: (formData.get("v_address") as string)?.trim() || null,
    website: (formData.get("v_website") as string)?.trim() || null,
    rep_full_name: (formData.get("rep_full_name") as string)?.trim() || null,
    rep_title: (formData.get("rep_title") as string)?.trim() || null,
    rep_email: (formData.get("rep_email") as string)?.trim() || null,
    rep_phone: (formData.get("rep_phone") as string)?.trim() || null,
    rep_date_of_birth: (formData.get("rep_dob") as string) || null,
  };

  // Auto-determine verification status based on required field completeness
  const requiredFields = [
    verificationData.legal_name,
    verificationData.ein,
    verificationData.business_type,
    verificationData.address,
    verificationData.website,
    verificationData.rep_full_name,
    verificationData.rep_email,
    verificationData.rep_phone,
  ];
  const allFilled = requiredFields.every((f) => f && f.trim().length > 0);

  // Fetch current status — only auto-upgrade, never downgrade from verified
  const { data: currentOrg } = await supabase
    .from("organizations")
    .select("verification_status")
    .eq("id", profile.organization_id)
    .single();

  const currentStatus = currentOrg?.verification_status;
  let newStatus = currentStatus;
  if (currentStatus !== "verified") {
    newStatus = allFilled ? "pending_review" : "incomplete";
  }

  const { error } = await supabase
    .from("organizations")
    .update({ ...verificationData, verification_status: newStatus })
    .eq("id", profile.organization_id);

  if (error) {
    return { error: "Failed to save verification details." };
  }

  revalidatePath("/settings");
  revalidatePath("/campaigns");
  return {};
}
