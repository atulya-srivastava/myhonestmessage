import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { UserPlus, MessageCircle, Loader2 } from "lucide-react";
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

  const handleSend = () => {
    router.replace(`/user/${debouncedUsername}`)
  }

  return (
    <Card className="w-full max-w-md mx-auto p-8 bg-card/20 backdrop-blur-3xl border-border/50 shadow-subtle animate-fade-in hover:shadow-glow/50 transition-all duration-500">
      <div className="space-y-6">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto bg-gradient-primary rounded-full flex items-center justify-center animate-glow-pulse">
            <MessageCircle className="w-8 h-8 text-primary-foreground" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Enter Username
          </h2>
          <p className="text-muted-foreground text-sm">
            Just enter someones username to get started.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="text-sm font-medium text-foreground/80 block mb-2"
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
              className="bg-input/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all duration-300 text-center text-lg font-medium"
            />
          </div>

          <div className="flex flex-col gap-3">
            <Button
              disabled={
                usernameMessage !== `Send message to @${debouncedUsername}`
              }
              onClick={handleSend}
              variant="outline"
              className="bg-gradient-primary hover:opacity-90 text-primary-foreground font-medium shadow-glow hover:shadow-glow/80 transition-all duration-300 hover:scale-101"
            >
              <MessageCircle className="w-4 h-4 mr" />
              {isCheckingUsername ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                usernameMessage ? usernameMessage : "Send message"
              )}
            </Button>

            <Button
              onClick={handleJoin}
              className="border-primary/30 text-primary bg-primary/10 transition-all duration-300 hover:scale-101 hover:text-white"
            >
              <UserPlus className="w-4 h-4" />
              Join MySecretMessage
            </Button>
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            No registration required • Start messaging instantly
          </p>
        </div>
      </div>
    </Card>
  );
};
