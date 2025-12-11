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
import { useEffect, useState } from "react";
import { Loader2, Send, Sparkles } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import suggestedMessages from "@/suggestedMessages.json";
import { Card, CardContent } from "@/components/ui/card";

const FormSchema = z.object({
  message: z.string().min(10, {
    message: "Message must be at least 10 characters.",
  }),
});

const MessagePage = () => {
  const params = useParams();
  const username = params.username as string;
  const [isLoading, setIsLoading] = useState(false);
  const [isSuggestingMessages, setIsSuggestingMessages] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [doesExist, setDoesExist] = useState<boolean | null>(null);

  useEffect(() => {
    const checkUserExists = async () => {
      try {
        const response = await axios.get(
          `/api/check-username-unique?username=${username}`
        );
        // If success is true, username is AVAILABLE (doesn't exist)
        // If success is false, username is TAKEN (exists)
        setDoesExist(!response.data.success);
      } catch (error) {
        console.error("Error checking username:", error);
        setDoesExist(false);
      }
    };

    if (username) {
      checkUserExists();
    }
  }, [username]);

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
        <div className="bg-background min-h-screen relative container max-w-4xl w-full mx-auto p-6">
          {doesExist === null ? (
            <div className="flex justify-center items-center absolute top-1/2 w-full">
              <Loader2 className="animate-spin h-8 w-8" />
            </div>
          ) : doesExist ? (
            <>
              <h1 className="text-center text-4xl font-bold mb-8">
                Public Profile Page
              </h1>

              <div className="mt-8">
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg">
                            Send message to @{username}
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Your anonymous words here...."
                              className="resize-none h-32 text-base p-4"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-center">
                      {isLoading ? (
                        <Button disabled className="w-full md:w-auto">
                          <Loader2 className="animate-spin mr-2" /> Please wait
                        </Button>
                      ) : (
                        <Button
                          type="submit"
                          className="w-full md:w-auto font-medium"
                        >
                          <Send className="mr-2 h-4 w-4" />
                          Send Message
                        </Button>
                      )}
                    </div>
                  </form>
                </Form>
              </div>

              <div className="mt-12 space-y-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <h3 className="text-xl font-semibold">Suggested Messages</h3>
                  {isSuggestingMessages ? (
                    <Button disabled variant="outline" size="sm">
                      <Loader2 className="animate-spin mr-2 h-4 w-4" />{" "}
                      Suggesting...
                    </Button>
                  ) : (
                    <Button
                      onClick={fetchSuggestedMessages}
                      variant="outline"
                      size="sm"
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      Suggest New Messages
                    </Button>
                  )}
                </div>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-3">
                      {questionsToDisplay.length > 0 ? (
                        questionsToDisplay.map((question, index) => (
                          <button
                            onClick={() => form.setValue("message", question)}
                            className="text-left p-4 rounded-lg border hover:bg-muted transition-colors text-foreground/90 text-sm md:text-base"
                            key={index}
                          >
                            {question}
                          </button>
                        ))
                      ) : (
                        <p className="text-center text-muted-foreground">
                          No suggestions available.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Separator className="my-8" />

              <div className="text-center space-y-4">
                <div className="text-lg font-medium">
                  Get Your Own Message Board
                </div>
                <Link href={"/sign-up"}>
                  <Button variant="default" className="font-medium">
                    Create Your Account
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            // user doesnot exist ui-->
            <div className="flex flex-col items-center justify-center gap-4 absolute w-full top-2/5">
              <h1 className="text-center text-4xl font-bold">
                Username Not Registered
              </h1>
              <p className="text-center text-lg text-muted-foreground">
                @{username} is not registered to receive messages
              </p>
              <Link href={"/sign-up"}>
                <Button
                  variant="default"
                  className="font-medium text-base px-6 py-2"
                >
                  Grab it Now - Create Account
                </Button>
              </Link>
            </div>
          )}
        </div>
  );
};
export default MessagePage;
