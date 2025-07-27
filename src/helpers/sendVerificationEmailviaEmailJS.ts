import { ApiResponse } from "@/types/ApiResponse";
import emailjs from "@emailjs/browser";

emailjs.init({
  publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!,
  blockHeadless: true,
  blockList: {
    list: ["foo@emailjs.com", "bar@emailjs.com"],
    watchVariable: "to_email",
  },
  limitRate: {
    id: "app",
    throttle: 10000,
  },
});

export async function sendVerificationEmailviaEmailJS(
  email: string,
  username: string,
  verifyCode: string
): Promise<ApiResponse> {
  const templateParams = {
    email: email,
    user: username,
    passcode: verifyCode,
  };

  try {
    await emailjs.send(
      process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID ?? "",
      process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID ?? "",
      templateParams
    );

    return {
      success: true,
      message: "Verification email sent successfully",
    };
  } catch (error) {
    let errorMessage = "Failed to send verification email";

    if (typeof error === "object" && error !== null) {
      const err = error as { status?: number; text?: string };

      if (err.status === 429) {
        errorMessage = "EmailJS: Rate limit exceeded";
      } else if (err.text) {
        errorMessage = `EmailJS Error: ${err.text}`;
      }
    }

    return {
      success: false,
      message: errorMessage,
    };
  }
}
