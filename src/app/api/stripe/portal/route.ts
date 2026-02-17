import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe/server";

export async function POST() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("email, full_name, organization_id")
    .eq("id", user.id)
    .single();

  if (!profile?.organization_id) {
    return NextResponse.json({ error: "Organization required" }, { status: 400 });
  }

  const { data: org } = await supabase
    .from("organizations")
    .select("stripe_customer_id, name")
    .eq("id", profile.organization_id)
    .single();

  let customerId = org?.stripe_customer_id ?? null;

  if (!customerId && org) {
    const customer = await getStripe().customers.create({
      name: org.name,
      email: profile.email ?? user.email,
      metadata: { organization_id: profile.organization_id },
    });

    customerId = customer.id;

    await supabase
      .from("organizations")
      .update({ stripe_customer_id: customerId })
      .eq("id", profile.organization_id);
  }

  if (!customerId) {
    return NextResponse.json({ error: "Could not resolve billing account" }, { status: 500 });
  }

  const session = await getStripe().billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/settings`,
  });

  return NextResponse.json({ url: session.url });
}
