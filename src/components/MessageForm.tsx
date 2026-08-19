import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { UserPlus, MessageCircle, Loader2, LogIn } from "lucide-react";
import axios from "axios";
import { useDebounceValue } from "usehooks-ts";
import { useRouter } from "next/navigation";

export const MessageForm = () => {
  const [isCheckingUsername, setIsCheckingUsername] = useState<boolean>(false);
  const [usernameMessage, setUsernameMessage] = useState<string>("");
  const [username, setUsername] = useState<string>("");

  const [debouncedUsername] = useDebounceValue(username, 800);
  const router = useRouter();

  useEffect(() => {
    const checkUsername = async () => {
      if (debouncedUsername) {
        setIsCheckingUsername(true);
        try {
          const response = await axios.get(`/api/check-username-unique?username=${debouncedUsername}`);
          if (!response.data.success) {
            setUsernameMessage(`Send message to @${debouncedUsername}`);
          } else {
            setUsernameMessage(`User does not exist`);
          }
        } catch (error) {
          console.error("Error checking username:", error);
        } finally {
          setIsCheckingUsername(false);
        }
      }
    };

    checkUsername();
  }, [debouncedUsername]);

  const handleJoin = () => {
   router.push('/sign-up')
  };

  const handleLogin = () => {
    router.push('/sign-in')
  }

  const handleSend = () => {
    router.replace(`/user/${debouncedUsername}`)
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1 text-center">
        <div className="mx-auto mb-2 p-3 bg-secondary rounded-full w-fit">
          <MessageCircle className="w-6 h-6 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold">Enter Username</CardTitle>
        <CardDescription>
          Just enter someones username to get started.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="username"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Username
          </label>

          <Input
            id="username"
            placeholder="Enter a unique username..."
            value={username}
            onChange={(e) => {
              setUsername(e.target.value.trim());
            }}
            className="text-center text-lg h-12"
          />
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <Button
            disabled={
              usernameMessage !== `Send message to @${debouncedUsername}`
            }
            onClick={handleSend}
            className="w-full"
            size="lg"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            {isCheckingUsername ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              usernameMessage ? usernameMessage : "Send message"
            )}
          </Button>

          <div className="flex flex-row gap-1">


          <Button
            variant="outline"
            onClick={handleJoin}
            className="w-1/2"
            size="lg"
            >
            <UserPlus className="w-4 h-4 mr-2" />
            Join
          </Button>
          <Button
            variant="outline"
            onClick={handleLogin}
            className="w-1/2"
            size="lg"
            >
            <LogIn className="w-4 h-4 mr-2" />
             Login
          </Button>
          </div>
        </div>

        <div className="text-center pt-2">
          <p className="text-xs text-muted-foreground">
            No registration required • Start messaging instantly
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
