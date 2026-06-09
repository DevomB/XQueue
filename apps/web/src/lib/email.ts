import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function sendFailedPostEmail(params: {
  to: string;
  postText: string;
  reason: string;
  postId: string;
}) {
  if (!resend) {
    console.warn("RESEND_API_KEY not set; skipping email to", params.to);
    return;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  await resend.emails.send({
    from: process.env.EMAIL_FROM ?? "PostWave <Devom.b@yahoo.com>",
    to: params.to,
    subject: "PostWave: Scheduled post failed to publish",
    html: `
      <h2>Your scheduled post failed</h2>
      <p><strong>Post:</strong> ${escapeHtml(params.postText.slice(0, 200))}</p>
      <p><strong>Reason:</strong> ${escapeHtml(params.reason)}</p>
      <p><a href="${appUrl}/dashboard/queue?retry=${params.postId}">Retry in dashboard</a></p>
    `,
  });
}

export async function sendPasswordResetEmail(params: {
  to: string;
  resetUrl: string;
}) {
  if (!resend) {
    console.warn("RESEND_API_KEY not set; skipping reset email to", params.to);
    return;
  }

  await resend.emails.send({
    from: process.env.EMAIL_FROM ?? "PostWave <Devom.b@yahoo.com>",
    to: params.to,
    subject: "PostWave: Reset your password",
    html: `
      <h2>Reset your password</h2>
      <p><a href="${params.resetUrl}">Click here to reset your password</a></p>
      <p>This link expires in 1 hour. If you did not request this, ignore this email.</p>
    `,
  });
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
