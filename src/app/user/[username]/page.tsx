"use client";
import { useParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { JSX, useEffect, useState } from "react";
import { Loader2, Send, Sparkles } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import suggestedMessages from "@/suggestedMessages.json";

const FormSchema = z.object({
  message: z.string().min(10, {
    message: "Message must be at least 10 characters.",
  }),
});

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

const MessagePage = () => {
  const params = useParams();
  const username = params.username as string;
  const [isLoading, setIsLoading] = useState(false);
  const [isSuggestingMessages, setIsSuggestingMessages] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);

  useEffect(() => {
    setSuggestedQuestions(suggestedMessages as string[]);

    // Function to check screen size
    const checkScreenSize = () => {
      // You can define 'md' breakpoint here (e.g., 768px for Tailwind's md)
      setIsSmallScreen(window.innerWidth < 768);
    };

    // Initial check
    checkScreenSize();

    // Add event listener for window resize
    window.addEventListener("resize", checkScreenSize);

    // Clean up event listener on component unmount
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const questionsToDisplay = isSmallScreen
    ? suggestedQuestions.slice(0, 2) // Show only the first 2 on small screens
    : suggestedQuestions;

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      message: "",
    },
  });

  const { reset } = form;

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsLoading(true);
    try {
      await axios.post(`/api/send-message`, {
        username,
        content: data.message,
      });
      toast.success(`Message Sent successfully to @${username}`);
      reset();
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(axiosError.response?.data.message);
      console.log("Error sending message:", axiosError);
      // console.log(response)
    } finally {
      setIsLoading(false);
    }
  }
  const fetchSuggestedMessages = async () => {
    setIsSuggestingMessages(true);
    try {
      const response = await axios.post("/api/suggest-messages");

      console.log("this is the response = ", response);
      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      const data = response.data;
      console.log("this is the data", data);
      if (data.success) {
        console.log(data.text);
        const questions = data.text.split("||").map((q: string) => q.trim());
        setSuggestedQuestions(questions);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    } finally {
      setIsSuggestingMessages(false);
    }
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
      <div className="relative z-10">
        <div className="container max-w-4xl w-full mx-auto my-8 p-6">
          <h1 className="text-center text-4xl font-bold mb-4">
            Public Profile Page
          </h1>

          <div className="mt-14 md:mt-0">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className=" space-y-6"
              >
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Send message to @{username}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Your anonymous words here...."
                          className="resize-none h-32 md:h-22 border-accent-foreground/20"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-center">
                  {isLoading ? (
                    <Button disabled>
                      <Loader2 className="animate-spin" /> Please wait
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      className="w-2/6 md:w-auto bg-gradient-primary hover:opacity-90 text-primary-foreground font-medium shadow-glow hover:shadow-glow/80 transition-all duration-300"
                    >
                      <Send/>
                      Send
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </div>

          <div className="flex md:flex-col flex-col-reverse justify-center md:justify-start items-center md:items-start mt-4 md:mt-10 lg:mt-12 ">
            <div className="md:w-1/2 mt-4 md:mb-2">
              {isSuggestingMessages ? (
                <Button disabled>
                  <Loader2 className="animate-spin" /> Suggesting...
                </Button>
              ) : (
                <Button
                  onClick={fetchSuggestedMessages}
                  className="bg-gradient-primary hover:opacity-90 text-primary-foreground font-medium shadow-glow hover:shadow-glow/80 transition-all duration-300"
                >
                  <Sparkles />
                  Suggest New Messages
                </Button>
              )}
            </div>
<div className="flex justify-center w-full">
  <div className="mt-6 bg-transparent md:mt-6 mx-6">
    <div className="relative group w-full">
      {/* Subtle glow effect on hover */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 via-accent/20 to-primary/30 rounded-xl blur opacity-30 group-hover:opacity-60 transition-opacity duration-500" />

      <div className="relative bg-gradient-to-br from-white/8 to-white/3 backdrop-blur-md border border-white/15 rounded-xl overflow-hidden">
        {/* Top accent line */}
        <div className="h-0.5 bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

        <div className="p-3 flex justify-center">
          <div className="flex flex-col gap-3 w-full items-center">
            {questionsToDisplay.length > 0 &&
              questionsToDisplay.map((question, index) => (
                <button
                  onClick={() => form.setValue("message", question)}
                  className="group/btn relative bg-white/5 hover:bg-white/12 border border-white/20 hover:border-primary/40 rounded-lg px-2 py-2 text-white/85 hover:text-white transition-all duration-200 text-center overflow-hidden w-full md:min-h-12 flex items-center justify-center"
                  key={index}
                >
                  {question}
                </button>
              ))}
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
          </div>
          <Separator className="my-6 bg-white/20" />
          <div className="text-center">
            <div className="mb-4">Get Your Message Board</div>
            <Link href={"/sign-up"}>
              <Button className="bg-gradient-primary hover:opacity-90 text-primary-foreground font-medium shadow-glow hover:shadow-glow/80 transition-all duration-300">
                Create Your Account
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagePage;
