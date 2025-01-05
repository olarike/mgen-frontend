"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { toast } from "../components/ui/use-toast";

const MAX_TAGLINE_LENGTH = 100;

export default function BestMemePage() {
  const { publicKey } = useWallet();
  const [tagline, setTagline] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateTagline = (text: string): string | null => {
    if (!text.trim()) {
      return "Tagline cannot be empty";
    }
    if (text.length > MAX_TAGLINE_LENGTH) {
      return `Tagline must be ${MAX_TAGLINE_LENGTH} characters or less`;
    }
    return null;
  };

  const handleBestMemeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!publicKey) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please connect your wallet first"
      });
      return;
    }

    const validationError = validateTagline(tagline);
    if (validationError) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: validationError
      });
      return;
    }

    setIsLoading(true);

    try {
      // Check token ownership
      const hasTokens = await checkTokenOwnership(publicKey.toBase58());
      if (!hasTokens) {
        toast({
          variant: "destructive",
          title: "Token Required",
          description: "You need to own MGEN tokens to submit taglines"
        });
        return;
      }

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
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to submit tagline");
      }

      // Reset form and show success message
      setTagline("");
      toast({
        title: "Success!",
        description: "Your tagline has been submitted successfully.",
        duration: 3000,
      });

    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to submit tagline"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Placeholder function - implement actual token checking logic
  const checkTokenOwnership = async (publicKey: string): Promise<boolean> => {
    // Implement your token checking logic here
    return true;
  };

  const remainingCharacters = MAX_TAGLINE_LENGTH - tagline.length;

  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Submit Your Best Meme Tagline
          </CardTitle>
          <CardDescription className="text-center">
            Create a clever tagline for your favorite meme. Be creative and keep it fun!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleBestMemeSubmit} className="space-y-6">
            <div className="space-y-2">
              <div className="relative">
                <Input
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="Enter a clever tagline..."
                  maxLength={MAX_TAGLINE_LENGTH}
                  className="pr-20"
                  disabled={isLoading}
                />
                <span 
                  className={`absolute right-2 top-1/2 -translate-y-1/2 text-sm ${
                    remainingCharacters < 20 ? 'text-red-500' : 'text-muted-foreground'
                  }`}
                >
                  {remainingCharacters}
                </span>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !publicKey || !tagline.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Tagline"
              )}
            </Button>

            {!publicKey && (
              <p className="text-sm text-center text-muted-foreground">
                Connect your wallet to submit a tagline
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </main>
  );
}