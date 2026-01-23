import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { sendWelcomeEmail } from "@/lib/email/send";

// Supabase Auth webhook payload types
interface AuthWebhookPayload {
  type: string;
  table: string;
  record: {
    id: string;
    email: string;
    created_at: string;
    raw_user_meta_data?: {
      name?: string;
      full_name?: string;
    };
  };
  schema: string;
  old_record: null;
}

// Verify webhook signature from Supabase
function verifyWebhookSignature(
  payload: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature || !secret) {
    return false;
  }

  const expectedSignature = createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  return signature === expectedSignature;
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = request.headers.get("x-supabase-signature");
    const webhookSecret = process.env.SUPABASE_WEBHOOK_SECRET;

    // Verify signature if secret is configured
    if (webhookSecret) {
      const isValid = verifyWebhookSignature(payload, signature, webhookSecret);
      if (!isValid) {
        console.error("Invalid webhook signature");
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 401 }
        );
      }
    }

    const data: AuthWebhookPayload = JSON.parse(payload);

    // Handle user creation event
    if (data.type === "INSERT" && data.table === "users") {
      const userEmail = data.record.email;
      const userName =
        data.record.raw_user_meta_data?.name ||
        data.record.raw_user_meta_data?.full_name;

      if (userEmail) {
        console.log(`Sending welcome email to ${userEmail}`);
        const result = await sendWelcomeEmail(userEmail, userName);

        if (!result.success) {
          console.error(`Failed to send welcome email: ${result.error}`);
        } else {
          console.log(`Welcome email sent successfully to ${userEmail}`);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

// Supabase webhooks only use POST
export async function GET() {
  return NextResponse.json({ status: "Webhook endpoint active" });
}
