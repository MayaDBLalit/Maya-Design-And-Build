import nodemailer from "nodemailer";
import { AuthoritativeLineItem } from "./quotation";

export interface InquiryNotificationData {
  inquiryId: number;
  reference: string;
  fullName: string;
  phone: string;
  email?: string | null;
  interestedService?: string | null;
  message?: string | null;
  tentativeBudget?: string | number | null;
  formattedTotal?: string | null;
  quotationItems?: AuthoritativeLineItem[];
  createdAt: Date;
}

export interface EmailSendResult {
  success: boolean;
  configured: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Checks whether SMTP credentials are fully populated in the environment.
 */
export function isEmailConfigured(): boolean {
  if (process.env.TEST_SKIP_EMAIL === "true") {
    return false;
  }
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASSWORD?.trim();

  return Boolean(
    host &&
      user &&
      pass &&
      !host.includes("example") &&
      !host.includes("your_") &&
      !pass.includes("your_")
  );
}

/**
 * Sends an email notification for a newly stored inquiry.
 * Safe failure handling: Never throws an uncaught error and never deletes/cancels the inquiry.
 */
export async function sendInquiryNotification(
  data: InquiryNotificationData
): Promise<EmailSendResult> {
  const configured = isEmailConfigured();

  if (!configured) {
    console.warn(
      `[Email Notification] SMTP is not configured in .env. Notification for inquiry #${data.inquiryId} (${data.reference}) safely skipped.`
    );
    return {
      success: false,
      configured: false,
      error: "SMTP credentials not configured in environment (.env)",
    };
  }

  const host = process.env.SMTP_HOST!.trim();
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const secure = process.env.SMTP_SECURE === "true" || port === 465;
  const user = process.env.SMTP_USER!.trim();
  const pass = process.env.SMTP_PASSWORD!.trim();
  const recipient =
    process.env.ADMIN_NOTIFICATION_EMAIL?.trim() || "mayadb01@gmail.com";

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
      connectionTimeout: 8000,
      greetingTimeout: 5000,
      socketTimeout: 10000,
    });

    const quotationRowsHtml =
      data.quotationItems && data.quotationItems.length > 0
        ? `
        <div style="margin-top: 24px;">
          <h4 style="color: #C5A869; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
            Quotation Line-Item Breakdown
          </h4>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #E5E7EB; border: 1px solid #374151;">
            <thead>
              <tr style="background-color: #1F2937; text-align: left;">
                <th style="padding: 10px; border: 1px solid #374151;">Discipline</th>
                <th style="padding: 10px; border: 1px solid #374151;">Rate</th>
                <th style="padding: 10px; border: 1px solid #374151;">Qty</th>
                <th style="padding: 10px; border: 1px solid #374151; text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${data.quotationItems
                .map(
                  (item) => `
                <tr style="border-bottom: 1px solid #374151;">
                  <td style="padding: 8px 10px; border: 1px solid #374151;">${item.serviceName}</td>
                  <td style="padding: 8px 10px; border: 1px solid #374151; font-family: monospace;">₹${item.baseRate.toLocaleString("en-IN")} / ${item.unitSymbol}</td>
                  <td style="padding: 8px 10px; border: 1px solid #374151; font-family: monospace;">${item.quantity}</td>
                  <td style="padding: 8px 10px; border: 1px solid #374151; text-align: right; font-family: monospace; color: #C5A869; font-weight: bold;">${item.formattedLineTotal}</td>
                </tr>`
                )
                .join("")}
            </tbody>
            <tfoot>
              <tr style="background-color: #111827; font-weight: bold;">
                <td colspan="3" style="padding: 12px 10px; border: 1px solid #374151; text-transform: uppercase;">Total Estimate</td>
                <td style="padding: 12px 10px; border: 1px solid #374151; text-align: right; color: #F59E0B; font-size: 15px; font-family: monospace;">
                  ${data.formattedTotal || (data.tentativeBudget ? `₹${data.tentativeBudget}` : "N/A")}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>`
        : "";

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Inquiry — MAYA Design & Build</title>
      </head>
      <body style="margin: 0; padding: 24px; background-color: #0B0E14; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #D1D5DB;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #14171C; border: 1px solid #2B313D; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
          <!-- Header -->
          <div style="background-color: #0D0F12; padding: 24px; border-bottom: 2px solid #C5A869; text-align: center;">
            <h1 style="margin: 0; color: #FFFFFF; font-size: 20px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase;">
              MAYA DESIGN &amp; BUILD
            </h1>
            <p style="margin: 6px 0 0 0; color: #C5A869; font-size: 11px; text-transform: uppercase; letter-spacing: 2px;">
              New Customer Inquiry Notification
            </p>
          </div>

          <!-- Body -->
          <div style="padding: 28px;">
            <div style="margin-bottom: 20px; padding: 12px 16px; background-color: #1F242D; border-left: 4px solid #C5A869; border-radius: 4px;">
              <span style="font-size: 11px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 1px;">Reference ID:</span>
              <span style="font-size: 15px; font-weight: bold; color: #FFFFFF; margin-left: 8px; font-family: monospace;">${data.reference}</span>
            </div>

            <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">
              <tr>
                <td style="padding: 8px 0; color: #9CA3AF; width: 35%;">Customer Name:</td>
                <td style="padding: 8px 0; color: #FFFFFF; font-weight: 600;">${data.fullName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #9CA3AF;">Phone Number:</td>
                <td style="padding: 8px 0; color: #FFFFFF; font-weight: 600;">
                  <a href="tel:${data.phone}" style="color: #60A5FA; text-decoration: none;">${data.phone}</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #9CA3AF;">Email Address:</td>
                <td style="padding: 8px 0; color: #FFFFFF;">
                  ${data.email ? `<a href="mailto:${data.email}" style="color: #60A5FA; text-decoration: none;">${data.email}</a>` : '<span style="color: #6B7280;">Not provided</span>'}
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #9CA3AF;">Interested Service:</td>
                <td style="padding: 8px 0; color: #C5A869; font-weight: 600;">${data.interestedService || "General Consultation"}</td>
              </tr>
              ${
                data.formattedTotal
                  ? `<tr>
                      <td style="padding: 8px 0; color: #9CA3AF;">Quotation Estimate:</td>
                      <td style="padding: 8px 0; color: #10B981; font-weight: bold; font-family: monospace; font-size: 15px;">
                        ${data.formattedTotal}
                      </td>
                    </tr>`
                  : ""
              }
              <tr>
                <td style="padding: 8px 0; color: #9CA3AF;">Submission Time:</td>
                <td style="padding: 8px 0; color: #D1D5DB; font-size: 13px;">${data.createdAt.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</td>
              </tr>
            </table>

            ${
              data.message
                ? `
                <div style="margin-top: 16px; padding: 16px; background-color: #0D0F12; border: 1px solid #2B313D; border-radius: 8px;">
                  <span style="font-size: 11px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 6px;">Customer Message:</span>
                  <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #E5E7EB; white-space: pre-wrap;">${data.message}</p>
                </div>`
                : ""
            }

            ${quotationRowsHtml}
          </div>

          <!-- Footer -->
          <div style="background-color: #0D0F12; padding: 16px 24px; border-top: 1px solid #2B313D; text-align: center; font-size: 11px; color: #6B7280;">
            This is an automated notification from the MAYA Design &amp; Build system.
            Log in to the Admin Console to view full details and manage inquiry status.
          </div>
        </div>
      </body>
      </html>
    `;

    const plainText = `
MAYA DESIGN & BUILD — NEW INQUIRY NOTIFICATION
Reference ID: ${data.reference}
==================================================
Customer Name: ${data.fullName}
Phone Number:  ${data.phone}
Email:         ${data.email || "Not provided"}
Service:       ${data.interestedService || "General Consultation"}
${data.formattedTotal ? `Estimated Total: ${data.formattedTotal}` : ""}
Submitted At:  ${data.createdAt.toISOString()}

Message:
${data.message || "No custom message provided."}
==================================================
Manage inquiries in the MAYA Admin Console.
    `.trim();

    const info = await transporter.sendMail({
      from: `"MAYA Design & Build" <${user}>`,
      to: recipient,
      subject: `[MAYA Inquiry] ${data.reference} — ${data.fullName} (${data.interestedService || "Consultation"})`,
      text: plainText,
      html: htmlContent,
    });

    console.log(
      `[Email Notification] Notification sent for inquiry #${data.inquiryId}. MessageId: ${info.messageId}`
    );

    return {
      success: true,
      configured: true,
      messageId: info.messageId,
    };
  } catch (error: any) {
    // Safe error handling: Log error safely WITHOUT leaking password/auth secrets
    console.error(
      `[Email Notification] Failed to send email for inquiry #${data.inquiryId}:`,
      error.message || error
    );
    return {
      success: false,
      configured: true,
      error: error.message || "Failed to deliver email via SMTP",
    };
  }
}
