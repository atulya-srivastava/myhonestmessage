import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/UserModel";
import { User } from "next-auth";
import mongoose from "mongoose";

export async function GET() {
  await dbConnect();

  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return Response.json(
      { success: false, message: "Not authenticated" },
      { status: 401 }
    );
  }
 
  const user = session.user as User; //might be issue
  const userId = new mongoose.Types.ObjectId(user._id);
  //issue occurs with id only in aggregation queries, so converting to ObjectId but findmyid etc handles it so it is not required there

//see 26:00 of #8/17 chai aur code message api with aggregation pipelines 
//https://youtu.be/MKNA_-wzxMk?si=dJ8ryJs0ABXfRVnW

  try {
    const user = await UserModel.aggregate([
        { $match: { _id: userId } },
        { $unwind: '$messages' },
        { $sort: { 'messages.createdAt': -1 } }, // descending order
        {$group:{_id: '$_id', messages: {$push: '$messages'}}},
    ]);

    if (!user || user.length === 0) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
   
    }
    
    console.log("the user looks like this", user); //TODO: remove this line in production

    return Response.json(
      { success: true, messages: user[0].messages },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to fetch messages", error);
    return Response.json(
      { success: false, message: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}