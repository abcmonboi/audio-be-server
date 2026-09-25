import SMTPConnection from "nodemailer/lib/smtp-connection/index.js";
import MailComposer from "nodemailer/lib/mail-composer/index.js";
import { getEmailConfig, type EmailConfig } from "@/config/email";

export type VerificationMail = { to: string; firstname: string; verificationUrl: string };
export class MailDeliveryError extends Error {
  constructor(
    public code: string,
    public retryable: boolean,
  ) {
    super(code);
  }
}
const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!,
  );

export function buildVerificationMessage(input: VerificationMail, from: string) {
  return new MailComposer({
    from,
    to: input.to,
    subject: "Xác thực email AudioBay",
    text: `Xin chào ${input.firstname},\nMở liên kết để xác thực email: ${input.verificationUrl}\nLiên kết có hạn 30 phút từ lúc tạo.`,
    html: `<p>Xin chào ${escapeHtml(input.firstname)},</p><p><a href="${escapeHtml(input.verificationUrl)}">Xác thực email</a></p><p>Liên kết có hạn 30 phút từ lúc tạo.</p>`,
    disableFileAccess: true,
    disableUrlAccess: true,
  })
    .compile()
    .build();
}

// Dùng SMTPConnection thuộc Nodemailer để close() thực sự hủy lượt SMTP đang chạy.
export async function sendVerificationEmail(
  input: VerificationMail,
  config: EmailConfig = getEmailConfig(),
  options: { deadlineMs?: number; connectionOptions?: SMTPConnection.Options } = {},
) {
  const message = await buildVerificationMessage(input, config.SMTP_FROM);
  const connection = new SMTPConnection({
    host: config.SMTP_HOST,
    port: config.SMTP_PORT,
    secure: config.SMTP_PORT === 465,
    requireTLS: config.SMTP_PORT !== 465,
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
    logger: false,
    debug: false,
    ...options.connectionOptions,
  });
  await new Promise<void>((resolve, reject) => {
    let finished = false;
    const finish = (error?: MailDeliveryError) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      connection.close();
      if (error) reject(error);
      else resolve();
    };
    const fail = (error: Error & { code?: string; responseCode?: number }) => {
      const permanent =
        error.code === "EAUTH" || (error.responseCode !== undefined && error.responseCode >= 500);
      finish(new MailDeliveryError(permanent ? "SMTP_REJECTED" : "SMTP_UNAVAILABLE", !permanent));
    };
    const timer = setTimeout(
      () => finish(new MailDeliveryError("SMTP_TIMEOUT", true)),
      options.deadlineMs ?? 20_000,
    );
    connection.on("error", fail);
    connection.on("end", () => {
      if (!finished) finish(new MailDeliveryError("SMTP_DISCONNECTED", true));
    });
    connection.connect(() => {
      if (finished) return;
      connection.login({ user: config.SMTP_USER, pass: config.SMTP_PASSWORD }, (error) => {
        if (finished) return;
        if (error) return fail(error);
        connection.send({ from: config.SMTP_FROM, to: [input.to] }, message, (error, info) => {
          if (finished) return;
          if (error) return fail(error);
          if (!info?.accepted.includes(input.to))
            return finish(new MailDeliveryError("SMTP_REJECTED", false));
          finish();
        });
      });
    });
  });
}
