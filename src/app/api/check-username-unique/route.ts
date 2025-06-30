import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/UserModel";
import { z } from "zod";
import { usernameValidation } from "@/schemas/signUpSchema";

const UsernameQuerySchema = z.object({
  username: usernameValidation,
});

export async function GET(request: Request) {
  //todo: use this in all other routes
 
//  this code is not requuired in the latest Next.js version

  // if (request.method !== "GET") {
  //   return Response.json(
  //     { success: false, message: "Only GET method is allowed" },
  //     { status: 405 }
  //   );
  // }
  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);
    const queryParam = { username: searchParams.get("username") };

    if (!queryParam.username) {
      return new Response("Username is required", { status: 400 });
    }

    const parsed = UsernameQuerySchema.safeParse(queryParam);

    console.log("Parsed value from the zod", parsed); //TODO: remove this line in production

    if (!parsed.success) {
      const usernameErrors = parsed.error.format().username?._errors || [];
      return Response.json(
        {
          success: false,
          message:
            usernameErrors.length > 0
              ? usernameErrors.join(", ")
              : "Invalid query parameters",
        },
        { status: 400 }
      );
    }

    const { username } = parsed.data;

    const existingVerifiedUser = await UserModel.findOne({
      username: username,
      isVerified: true,
    });

    console.log("Existing verified user", existingVerifiedUser); //TODO: remove this line in production
    if (existingVerifiedUser?.username) {
      return Response.json(
        {
          success: false,
          message: "Username is already taken",
        },
        { status: 400 }
      );
    }

    return Response.json(
      {
        success: true,
        message: "Username is available",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error checking username", error);
    return Response.json(
      {
        success: false,
        message: "Error checking username",
      },
      { status: 500 }
    );
  }
}
