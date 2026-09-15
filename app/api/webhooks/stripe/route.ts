import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  const bodyText = await request.text();
  const signature = request.headers.get("stripe-signature");

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2025-02-24.acacia" as Stripe.LatestApiVersion,
  });

  let event: Stripe.Event;

  try {
    if (webhookSecret && signature) {
      event = stripe.webhooks.constructEvent(bodyText, signature, webhookSecret);
    } else {
      // Si le webhook secret n'est pas encore configuré (ex: mode test dev sans CLI), parser l'événement directement
      event = JSON.parse(bodyText) as Stripe.Event;
    }
  } catch (err: unknown) {
    console.error("❌ Erreur validation Webhook Stripe :", err);
    return NextResponse.json(
      { error: `Webhook Error: ${err instanceof Error ? err.message : "Invalid signature"}` },
      { status: 400 }
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("❌ Key Configuration Supabase manquante dans /api/webhooks/stripe");
    return NextResponse.json(
      { error: "Configuration serveur incomplète" },
      { status: 500 }
    );
  }

  const adminSupabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id;
        const customerEmail =
          session.customer_details?.email?.toLowerCase() ||
          session.customer_email?.toLowerCase();

        console.log(`💳 Paiement Stripe réussi pour session ${session.id}, User ID: ${userId}, Email: ${customerEmail}`);

        let targetUserId: string | null = userId || null;

        // Si client_reference_id n'a pas été fourni, rechercher l'utilisateur par email dans Supabase
        if (!targetUserId && customerEmail) {
          const { data: listData } = await adminSupabase.auth.admin.listUsers();
          const match = listData?.users?.find((u) => u.email?.toLowerCase() === customerEmail);
          if (match) {
            targetUserId = match.id;
          }
        }

        if (targetUserId) {
          const { data: userObj } = await adminSupabase.auth.admin.getUserById(targetUserId);
          const existingMeta = userObj?.user?.user_metadata || {};

          await adminSupabase.auth.admin.updateUserById(targetUserId, {
            user_metadata: {
              ...existingMeta,
              is_pro: true,
              plan: "fondateur",
              pro_unlocked_at: new Date().toISOString(),
              stripe_customer_id: typeof session.customer === "string" ? session.customer : undefined,
              stripe_session_id: session.id,
            },
          });

          console.log(`✅ Statut Pro activé avec succès en BDD Supabase pour l'utilisateur ${targetUserId}`);
        } else {
          console.warn(`⚠️ Paiement reçu sans utilisateur correspondant (Email: ${customerEmail})`);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        if (customerId) {
          const { data: listData } = await adminSupabase.auth.admin.listUsers();
          const match = listData?.users?.find(
            (u) => u.user_metadata?.stripe_customer_id === customerId
          );

          if (match) {
            await adminSupabase.auth.admin.updateUserById(match.id, {
              user_metadata: {
                ...match.user_metadata,
                is_pro: false,
                plan: "free",
                pro_cancelled_at: new Date().toISOString(),
              },
            });
            console.log(`🔴 Abonnement résilié, statut Pro désactivé pour l'utilisateur ${match.id}`);
          }
        }
        break;
      }

      default:
        console.log(`ℹ️ Événement Stripe ignoré : ${event.type}`);
    }

    return NextResponse.json({ received: true, type: event.type });
  } catch (err: unknown) {
    console.error("❌ Erreur traitement Webhook Stripe :", err);
    return NextResponse.json(
      { error: "Erreur interne lors du traitement du webhook" },
      { status: 500 }
    );
  }
}
