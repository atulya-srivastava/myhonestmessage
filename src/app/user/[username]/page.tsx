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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

const FormSchema = z.object({
  message: z.string().min(10, {
    message: "Message must be at least 10 characters.",
  }),
});

const messagepage = () => {
  const params = useParams();
  const username = params.username as string;
  const [isLoading, setIsLoading] = useState(false);
  const [isSuggestingMessages, setIsSuggestingMessages] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      message: "",
    },
  });

  const { reset } = form;

  function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsLoading(true);
    try {
      const response = fetch(`/api/send-message/${username}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: data.message }),
      });

    } catch (error) {
    } finally {
      setIsLoading(false);
      toast.success(`Sent successfully to @${username}`);
      reset();
    }
  }
  const fetchSuggestedMessages = async () => {
    setIsSuggestingMessages(true);
    try {
      const response = await fetch("/api/suggest-messages", {
        method: "POST",
      });

      console.log("this is the response = ", response);
      if (!response.ok) {
        throw new Error("Failed to fetch suggested messages");
      }

      const data = await response.json();
      console.log("this is the data", data);
      if (data.success) {
        console.log(data.text);
        const questions = data.text.split("||").map((q: string) => q.trim());
        setSuggestedQuestions(questions);
      }
    } catch (error) {
      toast.error("Failed to fetch suggested messages");
    } finally {
      setIsSuggestingMessages(false);
    }
  };

  return (
    <>
      <div className="container max-w-4xl w-full mx-auto my-8 p-6">
        <h1 className="text-center text-4xl font-bold mb-4">
          Public Profile Page
        </h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className=" space-y-6">
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Send message to @{username}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Your anonymous words here...."
                      className="resize-none"
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
                <Button type="submit">Send</Button>
              )}
            </div>
          </form>
        </Form>

        <div className="flex">
          {isSuggestingMessages ? (
            <Button disabled>
              <Loader2 className="animate-spin" /> Suggesting...
            </Button>
          ) : (
            <Button onClick={fetchSuggestedMessages}><Sparkles/>Suggest Messages</Button>
          )}
        </div>

        <div className="mt-6 mx-6">
          <Card>
            <CardContent>
              <div className="w-full flex flex-col gap-4">
                {suggestedQuestions.length > 0 &&
                  suggestedQuestions.map((question, index) => (
                    <Button
                      onClick={() => form.setValue("message", question)}
                      className="bg-transparent text-black hover:bg-gray-100 rounded-md border-1 border-gray-200"
                      key={index}
                    >
                      {question}
                    </Button>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
        <Separator className="my-6" />
        <div className="text-center">
          <div className="mb-4">Get Your Message Board</div>
          <Link href={"/sign-up"}>
            <Button>Create Your Account</Button>
          </Link>
        </div>
      </div>
    </>
  );
};

export default messagepage;
