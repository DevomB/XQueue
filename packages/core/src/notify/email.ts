export type EmailNotifierConfig = {
  apiKey?: string;
  from?: string;
  appUrl?: string;
};

export type FailedPostEmailParams = {
  to: string;
  postText: string;
  reason: string;
  postId: string;
};

export type EmailNotifier = {
  sendFailedPostEmail: (params: FailedPostEmailParams) => Promise<void>;
};

export function createEmailNotifier(
  config: EmailNotifierConfig
): EmailNotifier {
  return {
    async sendFailedPostEmail(params) {
      if (!config.apiKey) {
        console.warn(
          JSON.stringify({
            level: "warn",
            message: "Resend API key not set; skipping email",
            ts: new Date().toISOString(),
          })
        );
        return;
      }

      const { Resend } = await import("resend");
      const resend = new Resend(config.apiKey);
      const appUrl = config.appUrl ?? "http://localhost:3000";

      await resend.emails.send({
        from: config.from ?? "PostWave <noreply@postwave.app>",
        to: params.to,
        subject: "PostWave: Scheduled post failed to publish",
        html: `
          <h2>Your scheduled post failed</h2>
          <p><strong>Post:</strong> ${params.postText.slice(0, 200)}</p>
          <p><strong>Reason:</strong> ${params.reason}</p>
          <p>Retry with: <code>postwave retry ${params.postId}</code></p>
        `,
      });
    },
  };
}
