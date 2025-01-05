"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, ThumbsUp, Trophy, AlertCircle } from "lucide-react";

interface Meme {
  id: string;
  url: string;
  description: string;
}

export default function VotingPage() {
  const { publicKey } = useWallet();
  const [memes, setMemes] = useState<Meme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [votingInProgress, setVotingInProgress] = useState<string | null>(null);
  const [aiSelectionInProgress, setAiSelectionInProgress] = useState(false);

  useEffect(() => {
    fetchMemes();
  }, []);

  const fetchMemes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/memes-for-voting");
      if (!response.ok) {
        throw new Error(`Failed to fetch memes: ${response.statusText}`);
      }
      const data = await response.json();
      setMemes(data.memes);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load memes");
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (memeId: string) => {
    if (!publicKey) {
      setError("Please connect your wallet to vote.");
      return;
    }

    try {
      setVotingInProgress(memeId);
      setError(null);
      
      const response = await fetch("/api/vote-meme", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          publicKey: publicKey.toBase58(),
          memeId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to vote on meme");
      }

      // Remove the voted meme from the list
      setMemes((prevMemes) => prevMemes.filter((meme) => meme.id !== memeId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error voting on meme");
    } finally {
      setVotingInProgress(null);
    }
  };

  const handleAISelection = async () => {
    try {
      setAiSelectionInProgress(true);
      setError(null);
      
      const response = await fetch("/api/ai-select-winner", { 
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "AI failed to select a winner");
      }

      // Refresh memes list after AI selection
      await fetchMemes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error in AI selection");
    } finally {
      setAiSelectionInProgress(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8 space-y-4">
        <h1 className="text-4xl font-bold">Vote for Your Favorite Meme</h1>
        <p className="text-lg text-muted-foreground">
          Help choose the best memes by casting your vote!
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {memes.length === 0 && !loading && !error ? (
        <Alert className="mb-6">
          <AlertTitle>No memes available</AlertTitle>
          <AlertDescription>
            All memes have been voted on. Check back later for new submissions!
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {memes.map((meme) => (
            <Card key={meme.id} className="overflow-hidden">
              <CardHeader>
                <CardTitle className="line-clamp-1">Meme #{meme.id}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {meme.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <img
                  src={meme.url}
                  alt={meme.description}
                  className="aspect-square w-full object-cover"
                  loading="lazy"
                />
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={() => handleVote(meme.id)}
                  disabled={!publicKey || votingInProgress === meme.id}
                >
                  {votingInProgress === meme.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Voting...
                    </>
                  ) : (
                    <>
                      <ThumbsUp className="mr-2 h-4 w-4" />
                      Vote
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {memes.length > 0 && (
        <div className="mt-8 flex justify-center">
          <Button
            size="lg"
            onClick={handleAISelection}
            disabled={aiSelectionInProgress}
          >
            {aiSelectionInProgress ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                AI Selecting...
              </>
            ) : (
              <>
                <Trophy className="mr-2 h-4 w-4" />
                Let AI Pick a Winner
              </>
            )}
          </Button>
        </div>
      )}
    </main>
  );
}