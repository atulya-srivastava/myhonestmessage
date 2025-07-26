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
import { JSX } from "react";

function FloatingParticles() {
  const [particles, setParticles] = useState<JSX.Element[]>([]);

  useEffect(() => {
    const newParticles = [...Array(15)].map((_, i) => (
      <div
        key={i}
        className="absolute w-2 h-2 bg-primary/40 rounded-full animate-bounce"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 3}s`,
          animationDuration: `${3 + Math.random() * 2}s`,
        }}
      />
    ));
    setParticles(newParticles);
  }, []);

  return <div className="absolute inset-0">{particles}</div>;
}

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
      <div className="min-h-screen relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          {/* Multiple Gradient Layers */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-primary/10" />
          <div className="absolute inset-0 bg-gradient-to-tl from-primary/15 via-transparent to-accent/10" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-pulse" />
          
          {/* Geometric Pattern Background */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, hsl(var(--primary)) 2px, transparent 2px),
                               radial-gradient(circle at 75% 75%, hsl(var(--accent)) 1px, transparent 1px)`,
              backgroundSize: '50px 50px'
            }} />
          </div>
          
          {/* Animated Mesh Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 animate-pulse" style={{ animationDuration: '4s' }} />
          
          {/* Large Floating Particles */}
          <FloatingParticles />
          
          {/* Glowing Orbs */}
          <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-primary/15 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-2/3 left-1/2 w-64 h-64 bg-primary/8 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
        
        <div className="relative z-10">
          <Navbar/>
          <div className="flex items-center justify-center min-h-[80vh]">
            <div className="text-center p-8 bg-white/5 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl shadow-primary/10">
              <h2 className="text-2xl font-semibold text-white/90 mb-4">Authentication Required</h2>
              <p className="text-white/70">Please log in to view your dashboard.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Multiple Gradient Layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-primary/10" />
        <div className="absolute inset-0 bg-gradient-to-tl from-primary/15 via-transparent to-accent/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-pulse" />
        
        {/* Geometric Pattern Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, hsl(var(--primary)) 2px, transparent 2px),
                             radial-gradient(circle at 75% 75%, hsl(var(--accent)) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }} />
        </div>
        
        {/* Animated Mesh Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 animate-pulse" style={{ animationDuration: '4s' }} />
        
        {/* Large Floating Particles */}
        <FloatingParticles />
        
        {/* Glowing Orbs */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-primary/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-2/3 left-1/2 w-64 h-64 bg-primary/8 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <Navbar />
        <div className="my-2 mx-auto p-6 w-full max-w-6xl">
          <div className="p-8">
            
            <div className="relative">
              <h1 className="text-4xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
                User Dashboard
              </h1>

              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-3 text-white/90">Copy Your Unique Link</h2>
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    value={profileUrl}
                    disabled
                    className="bg-white/10 border-white/30 text-white placeholder:text-white/50 disabled:text-white/70 disabled:bg-white/5"
                  />
                  <Button 
                    onClick={copyToClipboard} 
                    disabled={!profileUrl}
                    className="bg-gradient-primary hover:opacity-90 text-primary-foreground font-medium shadow-glow hover:shadow-glow/80 transition-all duration-300"
                  >
                    Copy
                  </Button>
                </div>
              </div>

              <div className="mb-6 flex items-center gap-3 p-4 border border-white/20 rounded-xl">
                <Switch
                  {...register("acceptMessages")}
                  checked={acceptMessages}
                  onCheckedChange={handleSwitchChange}
                  disabled={isSwitchLoading}
                />
                <span className="text-white/90 font-medium">
                  Accept Messages: <span className={acceptMessages ? "text-green-400" : "text-red-400"}>{acceptMessages ? "On" : "Off"}</span>
                </span>
              </div>
              
              <Separator className="border-white/20 mb-6" />

              <Button
                className="mb-6 bg-white/10 hover:bg-white/20 border border-white/30 text-white/90 hover:text-white transition-all duration-200"
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
                Refresh Messages
              </Button>
              
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
                  <div className="col-span-full text-center py-12">
                    <div className="bg-white/5 border border-white/20 rounded-xl p-8">
                      <p className="text-white/70 text-lg">No messages to display.</p>
                      <p className="text-white/50 text-sm mt-2">Share your unique link to start receiving anonymous messages!</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;