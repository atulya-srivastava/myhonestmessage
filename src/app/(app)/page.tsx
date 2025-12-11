'use client';
import { MessageForm } from '@/components/MessageForm';
import { MessageCircle, Shield, Zap } from "lucide-react";
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Header */}
        <header className="p-6 border-b border-border/40">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold">
              MyHonestMessage
            </h1>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center p-6 bg-background">
          <div className="max-w-6xl mx-auto w-full">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Side - Hero Content */}
              <div className="space-y-8 text-center lg:text-left">
                <div className="space-y-4">
                  <h2 className="text-4xl md:text-6xl font-bold leading-tight tracking-tight">
                    <span className="text-foreground">Anonymous</span>
                    <br />
                    <span className="text-primary">
                      Messaging
                    </span>
                    <br />
                    <span className="text-muted-foreground text-3xl md:text-4xl">Made Simple</span>
                  </h2>
                  <p className="text-xl text-muted-foreground max-w-lg mx-auto lg:mx-0">
                    Share your thoughts with complete anonymity. 
                    No registration, no tracking, just pure communication.
                  </p>
                </div>

                {/* Features */}
                <div className="grid grid-cols-3 gap-6">
                  <div className="flex flex-col items-center lg:items-start space-y-2">
                    <div className="p-3 rounded-lg bg-secondary">
                      <MessageCircle className="w-6 h-6 text-primary" />
                    </div>
                    <div className="text-center lg:text-left">
                      <h3 className="font-semibold text-foreground">Anonymous</h3>
                      <p className="text-sm text-muted-foreground">Complete privacy</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-center lg:items-start space-y-2">
                    <div className="p-3 rounded-lg bg-secondary">
                      <Shield className="w-6 h-6 text-primary" />
                    </div>
                    <div className="text-center lg:text-left">
                      <h3 className="font-semibold text-foreground">Secure</h3>
                      <p className="text-sm text-muted-foreground">Private messaging</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-center lg:items-start space-y-2">
                    <div className="p-3 rounded-lg bg-secondary">
                      <Zap className="w-6 h-6 text-primary" />
                    </div>
                    <div className="text-center lg:text-left">
                      <h3 className="font-semibold text-foreground">Instant</h3>
                      <p className="text-sm text-muted-foreground">Real-time delivery</p>
                    </div>
                  </div>
                </div>

                {/* Text */}
                <div className="text-center lg:text-left">
                  <p className="text-lg text-foreground/80 font-medium">
                    Enter someone&#39;s username and message anonymously!
                  </p>
                </div>
              </div>

              {/* Right Side - Message Form */}
              <div className="flex justify-center lg:justify-end">
                <MessageForm />
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="p-6 text-center border-t border-border/40 text-muted-foreground">
          <div className="space-y-2">
            <p className="text-sm">
              Your privacy is our priority. Start messaging without any barriers.
            </p>
            <p className="text-xs">
              Made by <Link href="https://x.com/atulyasriv" className="hover:underline text-foreground">@atulya.</Link>
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}