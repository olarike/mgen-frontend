"use client";

import { FC, ReactNode, useMemo, useState, useEffect } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { clusterApiUrl, Connection } from "@solana/web3.js";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Loader2 } from "lucide-react";

// Import styles in a way that works with Next.js
import dynamic from "next/dynamic";
import "./wallet-adapter.css"; // You'll need to create this file

interface WalletContextProviderProps {
  children: ReactNode;
  network?: WalletAdapterNetwork;
  endpoint?: string;
  autoConnect?: boolean;
}

const WalletContextProvider: FC<WalletContextProviderProps> = ({
  children,
  network = WalletAdapterNetwork.Devnet,
  endpoint: customEndpoint,
  autoConnect = true,
}) => {
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const endpoint = useMemo(
    () => customEndpoint || clusterApiUrl(network),
    [customEndpoint, network]
  );

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter({ network }),
      new TorusWalletAdapter(),
    ],
    [network]
  );

  useEffect(() => {
    const verifyConnection = async () => {
      try {
        const connection = new Connection(endpoint);
        await connection.getVersion();
        setConnectionError(null);
      } catch (err) {
        console.error("Failed to connect to Solana network:", err);
        setConnectionError(
          `Failed to connect to ${network} network. Please try again later.`
        );
      } finally {
        setIsInitializing(false);
      }
    };

    verifyConnection();
  }, [endpoint, network]);

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (connectionError) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertDescription>{connectionError}</AlertDescription>
      </Alert>
    );
  }

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={autoConnect}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

// Export as a dynamic component with ssr disabled
export default dynamic(() => Promise.resolve(WalletContextProvider), {
  ssr: false,
});