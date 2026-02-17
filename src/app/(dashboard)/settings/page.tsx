import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe/server";
import { SettingsClient } from "./settings-client";

export interface SerializedInvoice {
  number: string | null;
  date: number;
  amount_due: number;
  currency: string;
  status: string | null;
  hosted_invoice_url: string | null;
}

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, organization_id, role")
    .eq("id", user.id)
    .single();

  if (!profile || !profile.organization_id) {
    redirect("/onboarding");
  }

  const { data: organization } = await supabase
    .from("organizations")
    .select("name, phone, email, website, address, timezone, business_hours_start, business_hours_end, business_days, country, legal_name, dba_name, ein, business_type, registration_number, business_industry, rep_full_name, rep_title, rep_email, rep_phone, rep_date_of_birth, stripe_customer_id, subscription_status")
    .eq("id", profile.organization_id)
    .single();

  const stripeCustomerId = organization?.stripe_customer_id ?? null;
  const subscriptionStatus = organization?.subscription_status ?? null;

  let invoices: SerializedInvoice[] = [];

  if (stripeCustomerId) {
    try {
      const stripeInvoices = await getStripe().invoices.list({
        customer: stripeCustomerId,
        limit: 24,
      });

      invoices = stripeInvoices.data.map((inv) => ({
        number: inv.number,
        date: inv.created,
        amount_due: inv.amount_due,
        currency: inv.currency,
        status: inv.status,
        hosted_invoice_url: inv.hosted_invoice_url ?? null,
      }));
    } catch {
      // Stripe customer may not exist anymore — show empty state
    }
  }

  return (
    <div className="space-y-8">
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-semibold tracking-tight font-[family-name:var(--font-display)]">
          Settings
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your account and preferences.
        </p>
      </div>
      <div
        className="max-w-3xl animate-fade-in-up"
        style={{ animationDelay: "100ms" }}
      >
        <SettingsClient
          defaultTab={tab}
          profile={{
            full_name: profile.full_name,
            email: profile.email,
            organization_id: profile.organization_id,
          }}
          organization={organization ? {
            name: organization.name,
            phone: organization.phone,
            email: organization.email,
            website: organization.website,
            address: organization.address,
            timezone: organization.timezone,
            business_hours_start: organization.business_hours_start,
            business_hours_end: organization.business_hours_end,
            business_days: organization.business_days,
            country: organization.country,
            legal_name: organization.legal_name,
            dba_name: organization.dba_name,
            ein: organization.ein,
            business_type: organization.business_type,
            registration_number: organization.registration_number,
            business_industry: organization.business_industry,
            rep_full_name: organization.rep_full_name,
            rep_title: organization.rep_title,
            rep_email: organization.rep_email,
            rep_phone: organization.rep_phone,
            rep_date_of_birth: organization.rep_date_of_birth,
          } : null}
          billing={{
            stripe_customer_id: stripeCustomerId,
            subscription_status: subscriptionStatus,
            invoices,
          }}
        />
      </div>
    </div>
  );
}
