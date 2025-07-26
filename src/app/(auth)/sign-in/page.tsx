"use client";
import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
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
import { signInSchema } from "@/schemas/signInSchema";
import { signIn } from "next-auth/react";
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

const SignInPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  //zod implementation
  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
    setIsSubmitting(true);
    const result = await signIn("credentials", {
      redirect: false,
      identifier: data.identifier,
      password: data.password,
    });
    if (result?.error) {
      toast.error("Login Failed", {
        description: `Incorrect username or password ${result.error}`,
      });
    }

    if (result?.url) {
      router.replace("/dashboard");
    }
    setIsSubmitting(false);
  };

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
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, hsl(var(--primary)) 2px, transparent 2px),
                             radial-gradient(circle at 75% 75%, hsl(var(--accent)) 1px, transparent 1px)`,
              backgroundSize: "50px 50px",
            }}
          />
        </div>

        {/* Animated Mesh Gradient */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 animate-pulse"
          style={{ animationDuration: "4s" }}
        />

        {/* Large Floating Particles */}
        <FloatingParticles />

        {/* Glowing Orbs */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-primary/15 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute top-2/3 left-1/2 w-64 h-64 bg-primary/8 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex justify-center items-center min-h-screen p-4">
        <div className="w-full max-w-md p-8 space-y-8 bg-white/5 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl shadow-primary/10 overflow-hidden">
          {/* Card Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/5" />
          <div className="absolute inset-0 bg-gradient-to-tl from-transparent via-primary/5 to-transparent" />

          <div className="relative z-10">
            <div className="text-center">
              <h1 className="text-3xl font-extrabold tracking-tight lg:text-4xl mb-4 bg-gradient-primary bg-clip-text text-transparent">
                MySecretMessage
              </h1>
              <p className="mb-4 text-white/80">
                Log in to start your anonymous adventure
              </p>
            </div>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  name="identifier"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/90">
                        Email or Username
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="email or username"
                          className="bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:border-primary/50 focus:bg-white/15"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/90">Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="password"
                          className="bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:border-primary/50 focus:bg-white/15"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                {isSubmitting ? (
                  <Button
                    disabled
                    className="w-full bg-gradient-primary/50 text-primary-foreground"
                  >
                    <Loader2 className="animate-spin mr-2" />
                    Logging in...
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="w-full bg-gradient-primary hover:opacity-90 text-primary-foreground font-medium shadow-glow hover:shadow-glow/80 transition-all duration-300"
                  >
                    Log In
                  </Button>
                )}
              </form>
            </Form>
            <div className="text-center mt-4">
              <p className="text-white/80">
                New User?{" "}
                <Link
                  href={"/sign-up"}
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SignInPage;
