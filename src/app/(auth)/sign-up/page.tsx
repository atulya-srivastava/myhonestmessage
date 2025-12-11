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
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { sendVerificationEmailviaEmailJS } from "@/helpers/sendVerificationEmailviaEmailJS";

const SignUpPage = () => {
  const [username, setUsername] = useState("");
  const [usernameMessage, setUsernameMessage] = useState("");
  const [ischeckingUsername, setIsCheckingUsername] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const debounced = useDebounceCallback(setUsername, 800);
  const router = useRouter();

  //zod implementation
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

  const onSubmit = async (data: z.infer<typeof signUPSchema>) => {
    setIsSubmitting(true);
    try {
      const response = await axios.post<ApiResponse>("/api/sign-up", data);
 
      if (response.data.success) {
        const emailResponse = await sendVerificationEmailviaEmailJS(
          response.data.email ?? "",
          response.data.username ?? "",
          response.data.verifyCode ?? ""
        );

        if (emailResponse.success) {
          toast("Success", {
            description: "Registration successful! Please check your email for verification code.",
          });
          router.replace(`/verify/${username}`);
        } else {
          toast("Registration Successful", {
            description: "Account created but failed to send verification email. You can request a new verification code.",
          });
           router.replace(`/verify/${username}`);
        }}
    } catch (error) {
      console.error("error in sign up of user", error);
      const axiosError = error as AxiosError<ApiResponse>;
      const errorMessage = axiosError.response?.data.message;
      toast("signup failed", { description: errorMessage });

    }finally{
      setIsSubmitting(false);
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
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full font-medium"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Please wait{" "}
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
    </div>
  );
};
export default SignUpPage;
