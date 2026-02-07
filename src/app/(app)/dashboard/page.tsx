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
import { Loader2, RefreshCcw, Shield, Lock, Unlock } from "lucide-react";
import { useSession } from "next-auth/react";
import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import { decryptMessage, unwrapPrivateKey, EncryptedMessage, getStoredPrivateKey, storePrivateKey, clearStoredPrivateKey } from "@/lib/crypto";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Extend Message type to include encrypted fields
interface EncryptedMessageData extends Message {
  encryptedAESKey: string;
  iv: string;
}

// Decrypted message for display
interface DecryptedMessageData {
  _id: string;
  content: string;
  createdAt: Date;
}

const Dashboard = () => {
  const [messages, setMessages] = useState<DecryptedMessageData[]>([]);
  const [encryptedMessages, setEncryptedMessages] = useState<EncryptedMessageData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState<boolean>(false);
  const [profileUrl, setProfileUrl] = useState<string>('');
  
  // Decryption state
  const [privateKey, setPrivateKey] = useState<CryptoKey | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [decryptionPassword, setDecryptionPassword] = useState("");
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptionError, setDecryptionError] = useState("");
  const [useRecoveryCode, setUseRecoveryCode] = useState(false);
  const [isLoadingStoredKey, setIsLoadingStoredKey] = useState(true);

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
        const rawMessages = response.data.messages || [];
        setEncryptedMessages(rawMessages as EncryptedMessageData[]);
        
        // If we have a private key, decrypt messages
        if (privateKey && rawMessages.length > 0) {
          await decryptMessages(rawMessages as EncryptedMessageData[], privateKey);
        } else if (rawMessages.length > 0 && !privateKey && !isLoadingStoredKey) {
          // Only show password modal after IndexedDB check is complete
          setShowPasswordModal(true);
        }
        
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
    [privateKey, isLoadingStoredKey]
  );

  const decryptMessages = async (msgs: EncryptedMessageData[], key: CryptoKey) => {
    const decrypted: DecryptedMessageData[] = [];
    
    for (const msg of msgs) {
      try {
        const encryptedData: EncryptedMessage = {
          encryptedContent: msg.content,
          encryptedAESKey: msg.encryptedAESKey,
          iv: msg.iv,
        };
        
        const plaintext = await decryptMessage(encryptedData, key);
        decrypted.push({
          _id: msg._id as string,
          content: plaintext,
          createdAt: msg.createdAt,
        });
      } catch (error) {
        console.error("Failed to decrypt message:", error);
        decrypted.push({
          _id: msg._id as string,
          content: "[Failed to decrypt this message]",
          createdAt: msg.createdAt,
        });
      }
    }
    
    setMessages(decrypted);
  };

  const handleUnlockMessages = async () => {
    if (!decryptionPassword.trim()) {
      setDecryptionError("Please enter your password");
      return;
    }

    setIsDecrypting(true);
    setDecryptionError("");

    try {
      // Fetch the user's encrypted private key
      const response = await axios.get("/api/get-encrypted-key");
      
      if (!response.data.success) {
        throw new Error("Failed to fetch encryption key");
      }

      const keyToUse = useRecoveryCode 
        ? response.data.recoveryWrappedKey 
        : response.data.encryptedPrivateKey;

      // Unwrap the private key with password/recovery code
      const unwrappedKey = await unwrapPrivateKey(keyToUse, decryptionPassword);
      setPrivateKey(unwrappedKey);
      
      // Store the key in IndexedDB for persistence (scoped by user)
      const userId = String((session?.user as User)?._id);
      if (userId) {
        await storePrivateKey(unwrappedKey, userId);
      }
      
      // Decrypt all messages
      await decryptMessages(encryptedMessages, unwrappedKey);
      
      setShowPasswordModal(false);
      setDecryptionPassword("");
      toast.success("Messages decrypted successfully!");
    } catch (error) {
      console.error("Decryption failed:", error);
      setDecryptionError(
        useRecoveryCode 
          ? "Invalid recovery code. Please check and try again." 
          : "Invalid password. Please try again or use your recovery code."
      );
    } finally {
      setIsDecrypting(false);
    }
  };

  // Load stored private key from IndexedDB on mount
  useEffect(() => {
    const loadStoredKey = async () => {
      const userId = String((session?.user as User)?._id);
      if (!userId) {
        setIsLoadingStoredKey(false);
        return;
      }
      
      try {
        const storedKey = await getStoredPrivateKey(userId);
        if (storedKey) {
          setPrivateKey(storedKey);
        }
      } catch (error) {
        console.error("Failed to load stored key:", error);
      } finally {
        setIsLoadingStoredKey(false);
      }
    };
    loadStoredKey();
  }, [session]);

  // Handle locking messages (clear stored key)
  const handleLockMessages = async () => {
    const userId = String((session?.user as User)?._id);
    if (userId) {
      await clearStoredPrivateKey(userId);
    }
    setPrivateKey(null);
    setMessages([]);
    toast.success("Messages locked");
  };

  useEffect(() => {
    if (!session || !session.user) return;
    if (isLoadingStoredKey) return; // Wait for IndexedDB check to complete
    
    fetchMessages();
    fetchAcceptedMessages();
  }, [session, setValue, fetchAcceptedMessages, fetchMessages, isLoadingStoredKey]);

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
    navigator.clipboard.writeText(profileUrl);
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
      
      {/* Password Modal for Decryption */}
      <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <Lock className="h-5 w-5 text-primary" />
              <DialogTitle>Unlock Your Messages</DialogTitle>
            </div>
            <DialogDescription>
              Your messages are end-to-end encrypted. Enter your password to decrypt them.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder={useRecoveryCode ? "Enter recovery code" : "Enter your password"}
                value={decryptionPassword}
                onChange={(e) => setDecryptionPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleUnlockMessages()}
              />
              {decryptionError && (
                <p className="text-sm text-destructive mt-2">{decryptionError}</p>
              )}
            </div>
            
            <Button 
              onClick={handleUnlockMessages} 
              disabled={isDecrypting}
              className="w-full"
            >
              {isDecrypting ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Decrypting...
                </>
              ) : (
                <>
                  <Unlock className="h-4 w-4 mr-2" />
                  Unlock Messages
                </>
              )}
            </Button>
            
            <div className="text-center">
              <button
                onClick={() => setUseRecoveryCode(!useRecoveryCode)}
                className="text-sm text-muted-foreground hover:text-primary underline"
              >
                {useRecoveryCode ? "Use password instead" : "Forgot password? Use recovery code"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Content */}
      <div className="flex-1 max-w-6xl mx-auto w-full p-6">
        <div className="p-8 bg-card rounded-xl border border-border shadow-sm">
          
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-6">
              <h1 className="text-3xl font-bold">User Dashboard</h1>
              {privateKey && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-green-500 text-sm">
                    <Shield className="h-4 w-4" />
                    <span>Decrypted</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLockMessages}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Lock className="h-4 w-4 mr-1" />
                    Lock
                  </Button>
                </div>
              )}
            </div>

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
              <div className="flex gap-2">
                {!privateKey && encryptedMessages.length > 0 && (
                  <Button
                    variant="default"
                    onClick={() => setShowPasswordModal(true)}
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Unlock
                  </Button>
                )}
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
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Show loading state */}
            {isLoading && (
              <div className="col-span-full flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            )}
            
            {/* Show locked message if not decrypted */}
            {!isLoading && !privateKey && encryptedMessages.length > 0 && (
              <div className="col-span-full text-center py-16 bg-muted/10 rounded-xl border border-border/50 border-dashed">
                <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-lg">You have {encryptedMessages.length} encrypted message(s)</p>
                <p className="text-muted-foreground/60 text-sm mt-2">Enter your password to decrypt and view them</p>
                <Button 
                  onClick={() => setShowPasswordModal(true)} 
                  className="mt-4"
                >
                  <Unlock className="h-4 w-4 mr-2" />
                  Unlock Messages
                </Button>
              </div>
            )}
            
            {/* Show decrypted messages */}
            {!isLoading && privateKey && messages.length > 0 ? (
              messages.map((message) => (
                <MessageCard
                  key={message._id as string}
                  message={message as unknown as Message}
                  onMessageDelete={handleDeleteMessage}
                />
              ))
            ) : !isLoading && privateKey && (
              <div className="col-span-full text-center py-16 bg-muted/10 rounded-xl border border-border/50 border-dashed">
                <p className="text-muted-foreground text-lg">No messages to display.</p>
                <p className="text-muted-foreground/60 text-sm mt-2">Share your unique link to start receiving anonymous messages!</p>
              </div>
            )}
            
            {/* No messages at all */}
            {!isLoading && encryptedMessages.length === 0 && (
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