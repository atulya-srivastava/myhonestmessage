import { Message } from "@/models/UserModel";

export interface ApiResponse {
  success: boolean;
  message: string;
  messages?: Array<Message>; //may be a issue 
  isAcceptingMessages?: boolean;
  error?: string;
}