import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/UserModel";
import bcrypt from "bcryptjs";
import { sendVerificationEmail, sendRecoveryCodeEmail } from "@/helpers/sendEmail";


export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username, email, password, publicKey, encryptedPrivateKey, recoveryWrappedKey, recoveryCode } = await request.json();
    
    // Validate encryption keys are provided
    if (!publicKey || !encryptedPrivateKey || !recoveryWrappedKey) {
      return Response.json(
        {
          success: false,
          message: "Encryption keys are required",
        },
        { status: 400 }
      );
    }

    const existingUserVerifiedByUsername = await UserModel.findOne({
      username,
      isVerified: true,
    });

    if (existingUserVerifiedByUsername) {
      return Response.json(
        {
          success: false,
          message: "Username already taken",
        },
        { status: 400 }
      );
    }

    const existingUserbyEmail = await UserModel.findOne({ email });

    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    if (existingUserbyEmail) {
      if (existingUserbyEmail.isVerified) {
        return Response.json(
          {
            success: false,
            message: "User already exist with this email",
          },
          { status: 400 }
        );
      } else {
        const hasedPassword = await bcrypt.hash(password, 10);
        existingUserbyEmail.password = hasedPassword;
        existingUserbyEmail.publicKey = publicKey;
        existingUserbyEmail.encryptedPrivateKey = encryptedPrivateKey;
        existingUserbyEmail.recoveryWrappedKey = recoveryWrappedKey;
        existingUserbyEmail.verifyCode = verifyCode;
        existingUserbyEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);
        await existingUserbyEmail.save();
      }
    } else {
      const hasedPassword = await bcrypt.hash(password, 10);
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);

      const newUser = new UserModel({
        username,
        email,
        password: hasedPassword,
        publicKey,
        encryptedPrivateKey,
        recoveryWrappedKey,
        verifyCode,
        verifyCodeExpiry: expiryDate,
        isVerified: false,
        isAcceptingMessages: true,
        messages: [],
      });

      await newUser.save();
    }

    // Send emails server-side
    try {
      await sendVerificationEmail(email, username, verifyCode);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // Don't block signup if email fails
    }

    if (recoveryCode) {
      try {
        await sendRecoveryCodeEmail(email, username, recoveryCode);
      } catch (emailError) {
        console.error("Failed to send recovery code email:", emailError);
      }
    }

    return Response.json(
      {
        success: true,
        message: "User registered successfully. Please check your email for verification code.",
        username,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("error registering user", error);
    return Response.json(
      {
        success: false,
        message: "Error registering user",
      },
      {
        status: 500,
      }
    );
  }
}

