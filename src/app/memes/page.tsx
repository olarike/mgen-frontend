"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Upload, Loader2 } from "lucide-react";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

export default function MemesPage() {
  const { publicKey } = useWallet();
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return "Please upload a valid image file (JPEG, PNG, GIF, or WebP)";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "File size must be less than 5MB";
    }
    return null;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const selectedFile = e.target.files?.[0];
    
    if (selectedFile) {
      const validationError = validateFile(selectedFile);
      if (validationError) {
        setError(validationError);
        return;
      }

      setFile(selectedFile);
      // Create preview URL
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreview(objectUrl);

      return () => URL.revokeObjectURL(objectUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!publicKey) {
      setError("Please connect your wallet first");
      return;
    }

    if (!file) {
      setError("Please select a meme to upload");
      return;
    }

    setIsLoading(true);

    try {
      // Check token ownership
      const hasTokens = await checkTokenOwnership(publicKey.toBase58());
      if (!hasTokens) {
        setError("You need to own MGEN tokens to submit memes");
        return;
      }

      const formData = new FormData();
      formData.append("meme", file);
      formData.append("description", description);
      formData.append("publicKey", publicKey.toBase58());

      const response = await fetch("/api/submit-random-meme", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      // Reset form
      setFile(null);
      setDescription("");
      setPreview(null);
      
      // Show success message
      const successAlert = document.createElement("div");
      successAlert.className = "fixed top-4 right-4 z-50";
      successAlert.innerHTML = `
        <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          Meme submitted successfully!
        </div>
      `;
      document.body.appendChild(successAlert);
      setTimeout(() => document.body.removeChild(successAlert), 3000);

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to submit meme");
    } finally {
      setIsLoading(false);
    }
  };

  // Placeholder function - implement actual token checking logic
  const checkTokenOwnership = async (publicKey: string): Promise<boolean> => {
    // Implement your token checking logic here
    return true;
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Submit a Random Meme
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="meme-file">Select Meme</Label>
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="meme-file"
                  className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {preview ? (
                      <img
                        src={preview}
                        alt="Preview"
                        className="max-h-52 object-contain"
                      />
                    ) : (
                      <>
                        <Upload className="w-8 h-8 mb-4 text-gray-500" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span> or
                          drag and drop
                        </p>
                        <p className="text-xs text-gray-500">
                          JPEG, PNG, GIF or WebP (MAX. 5MB)
                        </p>
                      </>
                    )}
                  </div>
                  <Input
                    id="meme-file"
                    type="file"
                    accept={ALLOWED_FILE_TYPES.join(",")}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="meme-description">
                Meme Description (optional)
              </Label>
              <Textarea
                id="meme-description"
                placeholder="Add a description for your meme..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="h-24"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !publicKey}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Meme"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}