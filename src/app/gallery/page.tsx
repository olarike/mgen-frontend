"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "../components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, ThumbsUp, Star, Flame, SmileIcon, AlertCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface Meme {
  id: string;
  title: string;
  imageUrl: string;
  reactions: {
    [key: string]: {
      count: number;
      users: string[];
    };
  };
}

interface Reaction {
  icon: React.ReactNode;
  name: string;
  color: string;
}

const reactions: Reaction[] = [
  { icon: <Heart className="h-4 w-4" />, name: "love", color: "text-red-500" },
  { icon: <ThumbsUp className="h-4 w-4" />, name: "like", color: "text-blue-500" },
  { icon: <Star className="h-4 w-4" />, name: "star", color: "text-yellow-500" },
  { icon: <Flame className="h-4 w-4" />, name: "fire", color: "text-orange-500" },
  { icon: <SmileIcon className="h-4 w-4" />, name: "smile", color: "text-green-500" },
];

export default function GalleryPage() {
  const [memes, setMemes] = useState<Meme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchMemes();
  }, []);

  const fetchMemes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/memes");
      if (!response.ok) {
        throw new Error("Failed to fetch memes");
      }
      const data = await response.json();
      setMemes(data);
    } catch (err) {
      setError("Failed to load memes. Please try again later.");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load memes",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReaction = async (memeId: string, reactionType: string) => {
    try {
      const response = await fetch("/api/memes/react", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          memeId,
          reactionType,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add reaction");
      }

      // Optimistically update the UI
      setMemes((prevMemes) =>
        prevMemes.map((meme) => {
          if (meme.id === memeId) {
            const updatedReactions = { ...meme.reactions };
            if (!updatedReactions[reactionType]) {
              updatedReactions[reactionType] = { count: 0, users: [] };
            }
            updatedReactions[reactionType].count += 1;
            return { ...meme, reactions: updatedReactions };
          }
          return meme;
        })
      );

      toast({
        title: "Success",
        description: "Reaction added!",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add reaction",
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader>
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-48 w-full" />
                <div className="flex justify-center space-x-2">
                  {reactions.map((reaction, index) => (
                    <Skeleton key={index} className="h-8 w-8 rounded-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={fetchMemes} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Meme Gallery</h1>
        <p className="text-muted-foreground mt-2">
          Browse and react to the best memes from our community
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {memes.map((meme) => (
          <Card key={meme.id} className="overflow-hidden">
            <CardHeader>
              <CardTitle className="line-clamp-1">{meme.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <img
                src={meme.imageUrl}
                alt={meme.title}
                className="aspect-square w-full object-cover rounded-md"
                loading="lazy"
              />
              <TooltipProvider>
                <div className="flex justify-center space-x-2">
                  {reactions.map((reaction) => (
                    <Tooltip key={reaction.name}>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={cn(
                            "hover:bg-muted",
                            meme.reactions[reaction.name]?.users.includes("currentUser")
                              && reaction.color
                          )}
                          onClick={() => handleReaction(meme.id, reaction.name)}
                        >
                          {reaction.icon}
                          <span className="ml-1 text-xs">
                            {meme.reactions[reaction.name]?.count || 0}
                          </span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{reaction.name}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </TooltipProvider>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}