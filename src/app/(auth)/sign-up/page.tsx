"use client";
import React, { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useDebounceCallback } from "usehooks-ts";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { signUPSchema } from "@/schemas/signUpSchema";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Shield } from "lucide-react";
import Link from "next/link";
import { sendVerificationEmailviaEmailJS } from "@/helpers/sendVerificationEmailviaEmailJS";
import { RecoveryCodeModal } from "@/components/RecoveryCodeModal";
import {
  generateKeyPair,
  exportPublicKey,
  wrapPrivateKey,
  generateRecoveryCode,
} from "@/lib/crypto";

const SignUpPage = () => {
  const [username, setUsername] = useState("");
  const [usernameMessage, setUsernameMessage] = useState("");
  const [ischeckingUsername, setIsCheckingUsername] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingKeys, setIsGeneratingKeys] = useState(false);
  
  // Recovery code modal state
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState("");
  const [pendingFormData, setPendingFormData] = useState<z.infer<typeof signUPSchema> | null>(null);
  const [encryptionKeys, setEncryptionKeys] = useState<{
    publicKey: string;
    encryptedPrivateKey: string;
    recoveryWrappedKey: string;
  } | null>(null);

  const debounced = useDebounceCallback(setUsername, 800);
  const router = useRouter();

  const form = useForm<z.infer<typeof signUPSchema>>({
    resolver: zodResolver(signUPSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    const checkUsernameUnique = async () => {
      if (username) {
        setIsCheckingUsername(true);
        setUsernameMessage("");
        try {
          const response = await axios.get(
            `/api/check-username-unique?username=${username}`
          );
          setUsernameMessage(response.data.message);
        } catch (error) {
          const axiosError = error as AxiosError<ApiResponse>;
          setUsernameMessage(
            axiosError.response?.data.message ?? "error checking username"
          );
        } finally {
          setIsCheckingUsername(false);
        }
      }
    };
    checkUsernameUnique();
  }, [username]);

  // Step 1: Generate encryption keys when form is submitted
  const onSubmit = async (data: z.infer<typeof signUPSchema>) => {
    setIsGeneratingKeys(true);
    
    try {
      // Generate RSA key pair
      const keyPair = await generateKeyPair();
      
      // Export public key
      const publicKey = await exportPublicKey(keyPair.publicKey);
      
      // Generate recovery code
      const newRecoveryCode = generateRecoveryCode();
      
      // Wrap private key with password
      const encryptedPrivateKey = await wrapPrivateKey(keyPair.privateKey, data.password);
      
      // Wrap private key with recovery code (backup)
      const recoveryWrappedKey = await wrapPrivateKey(keyPair.privateKey, newRecoveryCode);
      
      // Store everything for after modal confirmation
      setPendingFormData(data);
      setRecoveryCode(newRecoveryCode);
      setEncryptionKeys({
        publicKey,
        encryptedPrivateKey,
        recoveryWrappedKey,
      });
      
      // Show recovery code modal
      setShowRecoveryModal(true);
      
    } catch (error) {
      console.error("Error generating encryption keys:", error);
      toast.error("Failed to generate encryption keys. Please try again.");
    } finally {
      setIsGeneratingKeys(false);
    }
  };

  // Step 2: Complete signup after user confirms recovery code
  const handleRecoveryConfirm = async () => {
    if (!pendingFormData || !encryptionKeys) return;
    
    setShowRecoveryModal(false);
    setIsSubmitting(true);
    
    try {
      // Send signup request with encryption keys
      const response = await axios.post<ApiResponse>("/api/sign-up", {
        ...pendingFormData,
        publicKey: encryptionKeys.publicKey,
        encryptedPrivateKey: encryptionKeys.encryptedPrivateKey,
        recoveryWrappedKey: encryptionKeys.recoveryWrappedKey,
      });

      if (response.data.success) {
        // Send verification email
        const emailResponse = await sendVerificationEmailviaEmailJS(
          response.data.email ?? "",
          response.data.username ?? "",
          response.data.verifyCode ?? ""
        );

        // Also send recovery code email
        try {
          await sendRecoveryCodeEmail(
            response.data.email ?? "",
            response.data.username ?? "",
            recoveryCode
          );
        } catch (emailError) {
          console.error("Failed to send recovery code email:", emailError);
          // Don't block signup if recovery email fails
        }

        if (emailResponse.success) {
          toast("Success", {
            description: "Registration successful! Please check your email for verification code and recovery code.",
          });
          router.replace(`/verify/${username}`);
        } else {
          toast("Registration Successful", {
            description: "Account created but failed to send verification email. You can request a new verification code.",
          });
          router.replace(`/verify/${username}`);
        }
      }
    } catch (error) {
      console.error("error in sign up of user", error);
      const axiosError = error as AxiosError<ApiResponse>;
      const errorMessage = axiosError.response?.data.message;
      toast("signup failed", { description: errorMessage });
    } finally {
      setIsSubmitting(false);
      setPendingFormData(null);
      setEncryptionKeys(null);
    }
  };

  // Helper function to send recovery code email
  const sendRecoveryCodeEmail = async (email: string, username: string, code: string) => {
    // Using the same EmailJS service for recovery code
    // You may want to create a separate template for this
    try {
      await sendVerificationEmailviaEmailJS(
        email,
        username,
        `Your Recovery Code: ${code} - SAVE THIS SECURELY! This is the only way to recover your encrypted messages if you forget your password.`
      );
    } catch (error) {
      console.error("Failed to send recovery code email:", error);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-card border border-border rounded-xl shadow-sm">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Join MyHonestMessage
          </h1>
          <p className="text-muted-foreground">
            Sign up to start your anonymous adventure
          </p>
          <div className="flex items-center justify-center gap-2 mt-2 text-xs text-muted-foreground">
            <Shield className="h-3 w-3" />
            <span>End-to-end encrypted</span>
          </div>
        </div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="username"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        debounced(e.target.value);
                      }}
                    />
                  </FormControl>
                  {ischeckingUsername && (
                    <Loader2 className="animate-spin h-4 w-4" />
                  )}
                  <p
                    className={`ml-2 text-sm ${usernameMessage === "Username is available" ? "text-green-600" : "text-destructive"}`}
                  >{`${usernameMessage}`}</p>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="password"
                      {...field}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your password encrypts your messages. Choose a strong one!
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={isSubmitting || isGeneratingKeys}
              className="w-full font-medium"
            >
              {isGeneratingKeys ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Generating encryption keys...
                </>
              ) : isSubmitting ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Creating account...
                </>
              ) : (
                "Continue"
              )}
            </Button>
          </form>
        </Form>
        <div className="text-center mt-4">
          <p className="text-sm text-muted-foreground">
            Already a member?{" "}
            <Link
              href={"/sign-in"}
              className="text-primary hover:underline font-medium"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>

      {/* Recovery Code Modal */}
      <RecoveryCodeModal
        recoveryCode={recoveryCode}
        isOpen={showRecoveryModal}
        onConfirm={handleRecoveryConfirm}
      />
    </div>
  );
};

export default SignUpPage;
