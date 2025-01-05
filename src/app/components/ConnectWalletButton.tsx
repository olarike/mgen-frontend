"use client";

import { FC, useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import "./wallet-adapter.css"; // Using the same CSS file we created earlier

const ConnectWalletButton: FC = () => {
  const { publicKey, connecting, connected, disconnecting } = useWallet();
  const [error, setError] = useState<string | null>(null);
  const [addressCopied, setAddressCopied] = useState(false);

  useEffect(() => {
    setError(null);
  }, [connected, connecting]);

  const copyAddress = async () => {
    if (publicKey) {
      try {
        await navigator.clipboard.writeText(publicKey.toBase58());
        setAddressCopied(true);
        setTimeout(() => setAddressCopied(false), 2000);
      } catch (err) {
        setError("Failed to copy address");
      }
    }
  };

  const formatAddress = (address: string): string => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <div className="flex flex-col gap-2">
      {error && (
        <Alert variant="destructive" className="mb-2">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center gap-4">
        {connecting ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Connecting...</span>
          </div>
        ) : disconnecting ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Disconnecting...</span>
          </div>
        ) : publicKey ? (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {formatAddress(publicKey.toBase58())}
            </span>
            <button
              onClick={copyAddress}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {addressCopied ? "Copied!" : "Copy"}
            </button>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">Not connected</span>
        )}

        <WalletMultiButton className="!bg-primary hover:!bg-primary/90 !rounded-md !h-10 !py-2 !px-4 !text-sm !font-medium" />
      </div>
    </div>
  );
};

// Export as a dynamic component with ssr disabled
export default dynamic(() => Promise.resolve(ConnectWalletButton), {
  ssr: false,
});