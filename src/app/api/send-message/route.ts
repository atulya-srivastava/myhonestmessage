import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/UserModel";
import { Message } from "@/models/UserModel";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const requestBody = await request.json();
    // Message is already encrypted client-side
    const { username, encryptedContent, encryptedAESKey, iv } = requestBody;

    // Validate required fields
    if (!username || !encryptedContent || !encryptedAESKey || !iv) {
      return Response.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const user = await UserModel.findOne({ username });

    if (!user) {
      return Response.json(
        { success: false, message: "User not found, please check the username" },
        { status: 404 }
      );
    }
    //is user accepting messages
    if (!user.isAcceptingMessages) {
      return Response.json(
        { success: false, message: "User is not accepting messages" },
        { status: 403 }
      );
    }

    // Store the pre-encrypted message (server never sees plaintext)
    const newMessage = {
      content: encryptedContent,
      encryptedAESKey: encryptedAESKey,
      iv: iv,
      createdAt: new Date(),
    };

    user.messages.push(newMessage as Message);
    await user.save();

    return Response.json(
      { success: true, message: "Message sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("An unexpected error occurred Failed to send message", error);
    return Response.json(
      { success: false, message: "Failed to send message" },
      { status: 500 }
    );
  }
}
