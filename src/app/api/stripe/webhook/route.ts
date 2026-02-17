import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/server";
import { createServiceClient } from "@/lib/supabase/admin";
import type Stripe from "stripe";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Update subscription_status on organizations table by Stripe customer ID.
 */
async function updateSubscriptionStatus(
  supabase: SupabaseClient<Database>,
  customerId: string,
  status: string
) {
  await supabase
    .from("organizations")
    .update({ subscription_status: status })
    .eq("stripe_customer_id", customerId);
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createServiceClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const customerId = session.customer as string;

      if (customerId && session.metadata?.organization_id) {
        await supabase
          .from("organizations")
          .update({
            stripe_customer_id: customerId,
            subscription_status: "active",
          })
          .eq("id", session.metadata.organization_id);
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      await updateSubscriptionStatus(
        supabase,
        subscription.customer as string,
        subscription.status
      );
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await updateSubscriptionStatus(
        supabase,
        subscription.customer as string,
        "canceled"
      );
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      await updateSubscriptionStatus(
        supabase,
        invoice.customer as string,
        "past_due"
      );
      break;
    }
  }

  return NextResponse.json({ received: true });
}
