import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/UserModel";

export async function GET(request: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) {
      return Response.json(
        { success: false, message: "Username is required" },
        { status: 400 }
      );
    }

    const user = await UserModel.findOne({ username, isVerified: true }).select('publicKey isAcceptingMessages');

    if (!user) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    if (!user.isAcceptingMessages) {
      return Response.json(
        { success: false, message: "User is not accepting messages" },
        { status: 403 }
      );
    }

    return Response.json(
      { 
        success: true, 
        publicKey: user.publicKey,
        isAcceptingMessages: user.isAcceptingMessages 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching public key:", error);
    return Response.json(
      { success: false, message: "Failed to fetch public key" },
      { status: 500 }
    );
  }
}
