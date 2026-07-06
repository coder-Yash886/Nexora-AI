import "server-only";

type SendEmailInput = {
  to: string;
  subject: string;
  text: string;
};

export async function sendEmail({ to, subject, text }: SendEmailInput) {
  const resendKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "onboarding@resend.dev";

  if (resendKey) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, text }),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error("Failed to send email:", body);
    }

    return;
  }

  console.log(`[EMAIL] To: ${to}\nSubject: ${subject}\n${text}`);
}
