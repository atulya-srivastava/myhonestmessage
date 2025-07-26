'use client';
import { MessageForm } from '@/components/MessageForm';
import { MessageCircle, Shield, Zap } from "lucide-react";
import { JSX, useEffect, useState } from 'react';

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


export default function Home() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Multiple Gradient Layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-primary/10" />
        <div className="absolute inset-0 bg-gradient-to-tl from-primary/15 via-transparent to-accent/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-pulse" />
        
        {/* Geometric Pattern Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, hsl(var(--primary)) 2px, transparent 2px),
                             radial-gradient(circle at 75% 75%, hsl(var(--accent)) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }} />
        </div>
        
        {/* Animated Mesh Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 animate-pulse" style={{ animationDuration: '4s' }} />
        
        {/* Large Floating Particles */}
        <FloatingParticles />
        
        {/* Glowing Orbs */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-primary/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-2/3 left-1/2 w-64 h-64 bg-primary/8 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-6">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent animate-fade-in">
              MySecretMessage
            </h1>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-6xl mx-auto w-full">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Side - Hero Content */}
              <div className="space-y-8 text-center lg:text-left">
                <div className="space-y-4">
                  <h2 className="text-4xl md:text-6xl font-bold leading-tight animate-fade-in">
                    <span className="text-foreground">Anonymous</span>
                    <br />
                    <span className="bg-gradient-primary bg-clip-text text-transparent">
                      Messaging
                    </span>
                    <br />
                    <span className="text-foreground/80 text-3xl md:text-4xl">Made Simple</span>
                  </h2>
                  <p className="text-xl text-muted-foreground max-w-lg animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    Share your thoughts with complete anonymity. 
                    No registration, no tracking, just pure communication.
                  </p>
                </div>

                {/* Features */}
                <div className="grid grid-cols-3 gap-6">
                  <div className="flex flex-col items-center lg:items-start space-y-2 animate-fade-in hover:scale-105 transition-transform duration-300" style={{ animationDelay: '0.4s' }}>
                    <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 animate-glow-pulse">
                      <MessageCircle className="w-6 h-6 text-primary" />
                    </div>
                    <div className="text-center lg:text-left">
                      <h3 className="font-semibold text-foreground">Anonymous</h3>
                      <p className="text-sm text-muted-foreground">Complete privacy</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-center lg:items-start space-y-2 animate-fade-in hover:scale-105 transition-transform duration-300" style={{ animationDelay: '0.6s' }}>
                    <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 animate-glow-pulse">
                      <Shield className="w-6 h-6 text-primary" />
                    </div>
                    <div className="text-center lg:text-left">
                      <h3 className="font-semibold text-foreground">Secure</h3>
                      <p className="text-sm text-muted-foreground">Private messaging</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-center lg:items-start space-y-2 animate-fade-in hover:scale-105 transition-transform duration-300" style={{ animationDelay: '0.8s' }}>
                    <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 animate-glow-pulse">
                      <Zap className="w-6 h-6 text-primary" />
                    </div>
                    <div className="text-center lg:text-left">
                      <h3 className="font-semibold text-foreground">Instant</h3>
                      <p className="text-sm text-muted-foreground">Real-time delivery</p>
                    </div>
                  </div>
                </div>

                {/* Animated Text */}
                <div className="text-center lg:text-left animate-fade-in" style={{ animationDelay: '1s' }}>
                  <p className="text-lg text-primary/80 font-medium">
                    ✨ Enter someone&#39;s username and message anonymously!
                  </p>
                </div>
              </div>

              {/* Right Side - Message Form */}
              <div className="flex justify-center lg:justify-end animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <MessageForm />
              </div>
            </div>
          </div>
        </main>

        {/* Carousel for Messages - Moved inside main content */}
        {/* <section className="p-6">
          <div className="max-w-6xl mx-auto">
            <Carousel
              plugins={[Autoplay({ delay: 2000 })]}
              className="w-full max-w-lg md:max-w-xl mx-auto"
            >
              <CarouselContent>
                {messages.map((message, index) => (
                  <CarouselItem key={index} className="p-4">
                    <Card className="bg-card/80 backdrop-blur-sm border-border/50">
                      <CardHeader>
                        <CardTitle className="text-foreground">{message.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="flex flex-col md:flex-row items-start space-y-2 md:space-y-0 md:space-x-4">
                        <Mail className="flex-shrink-0 text-primary" />
                        <div>
                          <p className="text-foreground">{message.content}</p>
                          <p className="text-xs text-muted-foreground">
                            {message.received}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
        </section> */}

        {/* Footer - Updated to use theme colors */}
        <footer className="p-6 text-center animate-fade-in bg-transparent backdrop-blur-sm border-t border-border/50" style={{ animationDelay: '1.2s' }}>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Your privacy is our priority. Start messaging without any barriers.
            </p>
            <p className="text-xs text-muted-foreground/60">
              Made by @atulya.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}