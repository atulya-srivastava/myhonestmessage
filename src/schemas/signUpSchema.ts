import { z } from "zod";
export const usernameValidation = z
  .string()
  .min(3,  "Username must be at least 3 characters long" )
  .max(15,  "Username must be at most 15 characters long" )
  .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores",
  );


  export const signUPSchema = z.object({
  username: usernameValidation,
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6,{message: "Paswword must be of atleast 6 characters"})
  })