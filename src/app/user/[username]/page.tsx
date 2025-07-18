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
import { useEffect, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import suggestedMessages from '@/suggestedMessages.json'

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
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);

  useEffect(()=>{
      setSuggestedQuestions(suggestedMessages as string[]);

      // Function to check screen size
    const checkScreenSize = () => {
      // You can define 'md' breakpoint here (e.g., 768px for Tailwind's md)
      setIsSmallScreen(window.innerWidth < 768);
    };

    // Initial check
    checkScreenSize();

    // Add event listener for window resize
    window.addEventListener('resize', checkScreenSize);

    // Clean up event listener on component unmount
    return () => window.removeEventListener('resize', checkScreenSize);
  },[])

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

        <div className="mt-14 md:mt-0">
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
                        className="resize-none h-32 md:h-auto"
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
                  <Button type="submit" className="w-2/6 md:w-1/12">Send</Button>
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
              <Button onClick={fetchSuggestedMessages}><Sparkles/>Suggest New Messages</Button>
            )}
          </div>

        <div className="mt-14 md:mt-6 mx-6">
          <Card>
            <CardContent>
              <div className="w-full flex flex-col gap-4">
                {questionsToDisplay.length > 0 && 
                  questionsToDisplay.map((question, index) => (
                    <Button
                    onClick={() => form.setValue("message", question)}
                    className="bg-transparent text-black hover:bg-gray-100 rounded-md border border-gray-200 whitespace-normal break-words text-center w-full min-h-[90px] md:min-h-12"
                    key={index}
                    > {question}
                    </Button>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
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
