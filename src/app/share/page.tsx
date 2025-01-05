"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Share2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const MAX_TWEET_LENGTH = 280;
const REQUIRED_TAGS = ["@MGEN", "#MGENMeme"];

export default function SharePage() {
  const [tweetText, setTweetText] = useState(
    "Check out my meme submission at MGEN Meme Competition! @MGEN #MGENMeme"
  );

  const validateTweet = () => {
    if (tweetText.length > MAX_TWEET_LENGTH) {
      return "Tweet is too long";
    }
    
    for (const tag of REQUIRED_TAGS) {
      if (!tweetText.includes(tag)) {
        return `Tweet must include ${tag}`;
      }
    }
    
    return null;
  };

  const remainingChars = MAX_TWEET_LENGTH - tweetText.length;
  const error = validateTweet();

  const handleShare = () => {
    if (error) return;

    const twitterShareURL = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      tweetText
    )}`;
    
    // Open in new window with specific dimensions
    const width = 550;
    const height = 420;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    
    window.open(
      twitterShareURL,
      "share_twitter",
      `width=${width},height=${height},left=${left},top=${top},scrollbars=no`
    );
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl">Share Your Meme on Twitter</CardTitle>
          <CardDescription className="text-lg">
            Share your meme for a chance to win MGEN tokens! A random participant 
            will be selected every hour.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Requirements to qualify:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Tag <span className="font-mono">@MGEN</span></li>
              <li>Use hashtag <span className="font-mono">#MGENMeme</span></li>
            </ul>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <label htmlFor="tweet" className="text-sm font-medium">
                Your Tweet
              </label>
              <span 
                className={`text-sm ${
                  remainingChars < 20 
                    ? "text-red-500" 
                    : "text-muted-foreground"
                }`}
              >
                {remainingChars} characters remaining
              </span>
            </div>
            
            <Textarea
              id="tweet"
              rows={3}
              value={tweetText}
              onChange={(e) => setTweetText(e.target.value)}
              className={`resize-none ${error ? "border-red-500" : ""}`}
              placeholder="Write your tweet here..."
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            size="lg"
            className="w-full"
            onClick={handleShare}
            disabled={!!error}
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share on Twitter
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}