import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/UserModel";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import { User } from "@/models/UserModel";

interface Context {
  params: Promise<{
    messageid: string;
  }>;
}

export async function DELETE(
  request: NextRequest,
  { params }: Context
) {
  await dbConnect();
  const { messageid } = await params;
  const session = await getServerSession(authOptions);
  const user = session?.user as User | undefined;
  if (!session || !user) {
    return NextResponse.json(
      { success: false, message: "Not authenticated" },
      { status: 401 }
    );
  }

  try {
    const updateResult = await UserModel.updateOne(
      { _id: user._id },
      { $pull: { messages: { _id: messageid } } }
    );

    if (updateResult.modifiedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Message not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { success: true, message: "Message deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting message:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
