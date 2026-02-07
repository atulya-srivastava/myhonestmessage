import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/UserModel";
import { User } from "next-auth";

export async function GET() {
  await dbConnect();

  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return Response.json(
      { success: false, message: "Not authenticated" },
      { status: 401 }
    );
  }

  const user = session.user as User;

  try {
    const userData = await UserModel.findById(user._id).select('encryptedPrivateKey recoveryWrappedKey');

    if (!userData) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      encryptedPrivateKey: userData.encryptedPrivateKey,
      recoveryWrappedKey: userData.recoveryWrappedKey,
    });
  } catch (error) {
    console.error("Failed to fetch encrypted key:", error);
    return Response.json(
      { success: false, message: "Failed to fetch encrypted key" },
      { status: 500 }
    );
  }
}
