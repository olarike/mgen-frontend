"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { useToast } from "../components/ui/use-toast";
import { Loader2 } from "lucide-react";
import ConnectWalletButton from "../components/ConnectWalletButton";

export default function BestMemePage() {
  const { publicKey } = useWallet();
  const [tagline, setTagline] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleBestMemeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!publicKey) {
      toast({
        variant: "destructive",
        title: "Wallet Required",
        description: "Please connect your wallet to submit a tagline.",
      });
      return;
    }

    if (!tagline.trim()) {
      toast({
        variant: "destructive",
        title: "Invalid Input",
        description: "Please enter a tagline before submitting.",
      });
      return;
    }

    if (tagline.length > 100) {
      toast({
        variant: "destructive",
        title: "Tagline Too Long",
        description: "Tagline must be 100 characters or less.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/submit-best-meme", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          publicKey: publicKey.toBase58(),
          tagline: tagline.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      toast({
        title: "Success!",
        description: "Your meme tagline has been submitted successfully.",
      });
      
      setTagline("");
    } catch (err) {
      console.error("Error submitting tagline:", err);
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: err instanceof Error ? err.message : "Failed to submit tagline. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Best Meme Tagline</CardTitle>
          <CardDescription>
            Submit your clever tagline for the best meme. Connect your wallet to participate.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <ConnectWalletButton />
          </div>
          
          <form onSubmit={handleBestMemeSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Enter your clever tagline (max 100 characters)..."
                disabled={!publicKey || isSubmitting}
                maxLength={100}
                className="w-full"
              />
              <p className="text-sm text-muted-foreground text-right">
                {tagline.length}/100 characters
              </p>
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={!publicKey || isSubmitting || !tagline.trim()}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Tagline"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}