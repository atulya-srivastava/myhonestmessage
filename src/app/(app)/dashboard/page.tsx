"use client";
import MessageCard from "@/components/MessageCard";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Message, User } from "@/models/UserModel";
import { acceptMessagesSchema } from "@/schemas/acceptMessageSchema";
import { ApiResponse } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import axios, { AxiosError } from "axios";
import { Loader2, RefreshCcw } from "lucide-react";
import { useSession } from "next-auth/react";
import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";

const Dashboard = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState<boolean>(false);
  const [profileUrl, setProfileUrl] = useState<string>('');

  const handleDeleteMessage = (messageId: string) => {
    setMessages(messages.filter((message) => message._id !== messageId));
  };

  const { data: session } = useSession();

  const form = useForm({
    resolver: zodResolver(acceptMessagesSchema),
  });

  const { register, watch, setValue } = form;

  const acceptMessages = watch("acceptMessages");

  const fetchAcceptedMessages = useCallback(async () => {
    setIsSwitchLoading(true);
    try {
      const response = await axios.get("/api/accept-messages");
      setValue("acceptMessages", response.data.isAcceptingMessages);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      console.error("Error fetching accepted messages:", error);
      toast.error(
        `Failed to fetch accepted messages: ${axiosError.response?.data.message}`
      );
    } finally {
      setIsSwitchLoading(false);
    }
  }, [setValue]);

  const fetchMessages = useCallback(
    async (refresh: boolean = false) => {
      setIsLoading(true);
      setIsSwitchLoading(false);
      try {
        const response = await axios.get<ApiResponse>("/api/get-messages");
        setMessages(response.data.messages || []);
        if (refresh) {
          toast.success("Messages refreshed successfully");
        }
      } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;
        console.error("Error fetching messages:", error);
        toast.error(
          `Failed to fetch messages: ${axiosError.response?.data.message}`
        );
      } finally {
        setIsLoading(false);
        setIsSwitchLoading(false);
      }
    },
    [setIsLoading, setMessages]
  );

  useEffect(() => {
    if (!session || !session.user) return;
    fetchMessages();
    fetchAcceptedMessages();
  }, [session, setValue, fetchAcceptedMessages, fetchMessages]);

  //handle switch change
  const handleSwitchChange = async () => {
    try {
      const response = await axios.post<ApiResponse>("/api/accept-messages", {
        acceptMessages: !acceptMessages,
      });

      setValue("acceptMessages", !acceptMessages);
      toast(response.data.message);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      console.error("Error toggling accept messages:", error);
      toast.error(
        `Failed to toggle accept messages: ${axiosError.response?.data.message}`
      );
    }
  };
  
   useEffect(() => {
      const { username } = session?.user as User || '';
      const baseUrl = `${window.location.protocol}//${window.location.host}`;
      setProfileUrl(`${baseUrl}/user/${username}`);
    
  }, [session]);
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl); //youre in client component therefore you can access this
    toast.success("URL Copied!", {
      description: "Profile URL has been copied to clipboard.",
    });
  };

  if (!session || !session.user) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
        <Navbar/>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center p-8 bg-card border border-border rounded-2xl shadow-sm max-w-md w-full">
            <h2 className="text-2xl font-semibold mb-4">Authentication Required</h2>
            <p className="text-muted-foreground mb-6">Please log in to view your dashboard.</p>
            <Button variant="default" asChild>
                 <a href="/sign-in">Login</a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
      <Navbar />
      
      {/* Content */}
      <div className="flex-1 max-w-6xl mx-auto w-full p-6">
        <div className="p-8 bg-card rounded-xl border border-border shadow-sm">
          
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-6">
              User Dashboard
            </h1>

            <div className="mb-6 space-y-3">
              <h2 className="text-lg font-medium text-foreground">Copy Your Unique Link</h2>
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  value={profileUrl}
                  disabled
                  className="bg-muted text-foreground opacity-100 !border-2 !border-dashed !border-white/20"
                />
                <Button 
                  onClick={copyToClipboard} 
                  disabled={!profileUrl}
                  className="font-medium"
                >
                  Copy
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-muted/30 border border-border/50 rounded-xl">
              <Switch
                {...register("acceptMessages")}
                checked={acceptMessages}
                onCheckedChange={handleSwitchChange}
                disabled={isSwitchLoading}
              />
              <span className="font-medium">
                Accept Messages: <span className={acceptMessages ? "text-green-600" : "text-destructive"}>{acceptMessages ? "On" : "Off"}</span>
              </span>
            </div>
          </div>
            
          <Separator className="my-6" />

          <div className="flex justify-between items-center mb-6">
             <h2 className="text-xl font-semibold">Your Messages</h2>
              <Button
                variant="outline"
                onClick={(e) => {
                  e.preventDefault();
                  fetchMessages(true);
                }}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <RefreshCcw className="h-4 w-4 mr-2" />
                )}
                Refresh
              </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {messages.length > 0 ? (
              messages.map((message) => (
                <MessageCard
                  key={message._id as string}
                  message={message}
                  onMessageDelete={handleDeleteMessage}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-16 bg-muted/10 rounded-xl border border-border/50 border-dashed">
                <p className="text-muted-foreground text-lg">No messages to display.</p>
                <p className="text-muted-foreground/60 text-sm mt-2">Share your unique link to start receiving anonymous messages!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;