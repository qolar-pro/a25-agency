// A25 minimal Resend email sender — standalone from lib/submission.ts on
// purpose. submission.ts has its own working retry/fallback-domain logic for
// the two main forms; duplicating that complexity here isn't worth the risk
// of touching already-verified code for what's just a simple reply
// notification email.

export async function sendEmailViaResend(params: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<{ sent: boolean; error?: string }> {
  const { to, subject, html, text } = params;
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const EMAIL_FROM = process.env.EMAIL_FROM || "A25 Workforce <onboarding@resend.dev>";

  if (!RESEND_API_KEY) {
    console.log("[A25 EMAIL] RESEND_API_KEY missing — simulating locally:");
    console.log(`To: ${to}\nSubject: ${subject}\n\n${text}`);
    return { sent: false, error: "RESEND_API_KEY not configured" };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: [to],
        subject,
        html,
        text
      }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    const data: any = await response.json();

    if (response.ok && data.id) {
      console.log(`[A25 EMAIL] Sent to ${to}. ID: ${data.id}`);
      return { sent: true };
    }

    console.error("[A25 EMAIL] Resend API error:", data);
    return { sent: false, error: data.message || "Resend API error" };
  } catch (err: any) {
    console.error("[A25 EMAIL] Dispatch failed:", err.message);
    return { sent: false, error: err.message };
  }
}
