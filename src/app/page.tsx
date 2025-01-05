// app/page.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { useWallet } from "@solana/wallet-adapter-react";
import Link from "next/link";
import { Image, Upload, Trophy } from "lucide-react";

export default function HomePage() {
  const { publicKey } = useWallet();

  const features = [
    {
      title: "Submit Memes",
      description: "Share your favorite memes with the community",
      icon: Upload,
      href: "/memes",
    },
    {
      title: "Best Meme Competition",
      description: "Submit your best meme and compete for prizes",
      icon: Trophy,
      href: "/best-meme",
    },
    {
      title: "Meme Gallery",
      description: "Browse and vote on community-submitted memes",
      icon: Image,
      href: "/gallery",
    },
  ];

  return (
    <main className="space-y-8 py-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">
          Welcome to MGEN Meme Competition
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Create, share, and vote on the best memes in the community. Powered by MGEN tokens on Solana.
        </p>
      </div>

      {!publicKey && (
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
            <CardDescription>
              Connect your wallet to participate in the meme competition
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <div className="grid md:grid-cols-3 gap-6 pt-8">
        {features.map((feature) => (
          <Card key={feature.title} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <feature.icon className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={feature.href}>
                <Button className="w-full">
                  {publicKey ? "Get Started" : "Connect Wallet to Start"}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}