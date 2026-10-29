"use client";

import { useEffect, useRef, useCallback } from "react";
import useSWR from "swr";
import { useSession } from "next-auth/react";

export interface TelegramStatusData {
  connected: boolean;
  chatId?: string | null;
  pairToken?: string | null;
  botUsername?: string | null;
}

interface UseTelegramStatusOptions {
  autoPollWhenUnpaired?: boolean;
  pollInterval?: number;
}

class TelegramFetchError extends Error {
  status?: number;
}

const fetcher = async (url: string): Promise<TelegramStatusData> => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = new TelegramFetchError("Failed to fetch telegram status");
    error.status = res.status;
    throw error;
  }
  return res.json();
};

export function useTelegramStatus(options: UseTelegramStatusOptions = {}) {
  const { autoPollWhenUnpaired = false, pollInterval = 3000 } = options;
  const { data: session, update: updateSession } = useSession();
  const prevConnectedRef = useRef<boolean | undefined>(undefined);

  const isSessionConnected = Boolean(session?.user?.telegramConnected);

  const { data, error, isLoading, mutate } = useSWR<TelegramStatusData>(
    session?.user?.id ? "/api/telegram/pair" : null,
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: false,
      dedupingInterval: 2500,
      shouldRetryOnError: false,
      refreshInterval: (latestData) => {
        const isConnected = latestData?.connected ?? isSessionConnected;
        if (!autoPollWhenUnpaired || isConnected || error) {
          return 0;
        }
        return pollInterval;
      },
      refreshWhenHidden: false,
    }
  );

  const isPaired = Boolean(data?.connected ?? isSessionConnected);

  useEffect(() => {
    if (data?.connected && prevConnectedRef.current === false) {
      void updateSession({ user: { telegramConnected: true } });
    }
    if (data?.connected !== undefined) {
      prevConnectedRef.current = data.connected;
    }
  }, [data?.connected, updateSession]);

  const verifyConnection = useCallback(async () => {
    try {
      const refreshed = await mutate();
      if (refreshed?.connected) {
        await updateSession({ user: { telegramConnected: true } });
      }
      return Boolean(refreshed?.connected);
    } catch {
      return false;
    }
  }, [mutate, updateSession]);

  return {
    isPaired,
    status: data,
    isLoading,
    error,
    mutate,
    verifyConnection,
  };
}
