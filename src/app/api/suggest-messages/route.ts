import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

export async function POST(request: Request) {
  const prompt = `create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me,and should be suitable for a diverse audience. Ensure all the three messages written are unique and have been sent only after a good thought process from your side dont include any apostrophe & personal information or sensitive topics. The questions should be thought-provoking and encourage meaningful responses.`;

  try {
    const { text } = await generateText({
     model: google('models/gemini-2.5-flash'),
    prompt: prompt,
     temperature: 0.8, //randomness of response
    topP: 0.9,
    topK: 40
    });
    if (!text) {
      return Response.json(
        { success: false, message: "No text generated" },
        { status: 400 }
      );
    }
    return Response.json({ success: true, text }, { status: 200 });
  } catch (error) {
    console.error("An unexpected error occurred", error);
    return Response.json(
      { success: false, message: "Failed to generate text" },
      { status: 500 }
    );
  }
}
