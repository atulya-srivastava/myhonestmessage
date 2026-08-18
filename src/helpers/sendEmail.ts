import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Gmail App Password (not your regular password)
  },
});

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

async function sendEmail({ to, subject, html }: SendEmailOptions) {
  await transporter.sendMail({
    from: `"MyHonestMessage" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
}

/**
 * Send verification code email to user
 */
export async function sendVerificationEmail(
  email: string,
  username: string,
  verifyCode: string
) {
  await sendEmail({
    to: email,
    subject: "MyHonestMessage - Verify Your Account",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #fafafa; border-radius: 12px;">
        <h2 style="text-align: center; color: #111;">Verify Your Account</h2>
        <p style="color: #555; text-align: center;">Hi <strong>@${username}</strong>, welcome to MyHonestMessage!</p>
        <div style="text-align: center; margin: 24px 0;">
          <div style="display: inline-block; padding: 16px 32px; background: #111; color: #fff; font-size: 28px; font-family: monospace; letter-spacing: 6px; border-radius: 8px;">
            ${verifyCode}
          </div>
        </div>
        <p style="color: #888; text-align: center; font-size: 14px;">This code expires in 1 hour. If you didn't create an account, ignore this email.</p>
      </div>
    `,
  });
}

/**
 * Send recovery code email to user
 */
export async function sendRecoveryCodeEmail(
  email: string,
  username: string,
  recoveryCode: string
) {
  await sendEmail({
    to: email,
    subject: "MyHonestMessage - Your Recovery Code (SAVE THIS!)",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #fafafa; border-radius: 12px;">
        <h2 style="text-align: center; color: #c00;">⚠️ Save Your Recovery Code</h2>
        <p style="color: #555; text-align: center;">Hi <strong>@${username}</strong>, this is your encryption recovery code.</p>
        <div style="text-align: center; margin: 24px 0;">
          <div style="display: inline-block; padding: 16px 32px; background: #111; color: #fff; font-size: 24px; font-family: monospace; letter-spacing: 4px; border-radius: 8px;">
            ${recoveryCode}
          </div>
        </div>
        <div style="padding: 16px; background: #fff3f3; border: 1px solid #ffcccc; border-radius: 8px; margin: 16px 0;">
          <p style="color: #c00; font-size: 14px; margin: 0; text-align: center;">
            <strong>This is the ONLY way to recover your encrypted messages if you forget your password.</strong>
            <br/><br/>
            Store this code somewhere safe. We cannot recover it for you.
          </p>
        </div>
        <p style="color: #888; text-align: center; font-size: 13px;">Do not share this code with anyone.</p>
      </div>
    `,
  });
}
