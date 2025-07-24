import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/UserModel";
import { User as NextAuthUser } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        identifier: { label: "Email or Username", type: "text" },
        email: { label: "Email", type: "text" },
        password: {
          label: "Password",
          type: "password",
        },
      },
      async authorize(
        credentials: Record<"email" | "password" | "identifier", string> | undefined,
      ): Promise<NextAuthUser | null> {
        if (!credentials) return null;
        await dbConnect();
        try {
          const user = await UserModel.findOne({
            $or: [
              { email: credentials.identifier },
              { username: credentials.identifier },
            ],
          });
          if (!user) {
            throw new Error("No user found with this email");
          }
          if (!user.isVerified) {
            throw new Error("Please verify your account first before login");
          }
          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            user.password
          );
          if (isPasswordCorrect) {
            // Convert _id to string for NextAuth compatibility
            const userObj = user.toObject ? user.toObject() : { ...user };
            userObj._id = user._id?.toString();
            return userObj as NextAuthUser;
          } else {
            throw new Error("Incorrect Password");
          }
        } catch (err) {
          if (err instanceof Error) {
            throw err;
          }
          throw new Error("Authorization failed");
        }
      },
    }),
  ],
callbacks:{
    async jwt({ token,user})
    {   
        if(user){
            token._id= user._id?.toString()
            token.isVerified = user.isVerified;
            token.isAcceptingMessages=user.isAcceptingMessages;
            token.username = user.username
        }
        return token
    },
    async session ({session, token}){
        if(token){
            session.user._id= token._id
            session.user.isVerified = token.isVerified
            session.user.isAcceptingMessages = token.isAcceptingMessages
            session.user.username = token.username
        }
        return session
    },

},
  pages:{
    signIn:'/sing-in'
  },
  session:{
    strategy: "jwt"
  },
  secret: process.env.NEXTAUTH_SECRET,

};


//p-c-p-s-s , providers-callbacks-pages-session-secret

// NextAuth({          obj again main thing
//   providers: [...], array
//   callbacks: {...}, obj
//   pages: {...},     obj
//   session: {...},   obj
//   secret: "...",    srting
// });