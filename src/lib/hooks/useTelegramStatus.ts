"use client";

import useSWR from "swr";
import { useSession } from "next-auth/react";

export interface TelegramStatusData {
  connected: boolean;
  chatId?: string | null;
  pairToken?: string | null;
  botUsername?: string | null;
}

const fetcher = async (url: string): Promise<TelegramStatusData> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch telegram status");
  return res.json();
};

export function useTelegramStatus() {
  const { data: session } = useSession();
  const { data, error, isLoading, mutate } = useSWR<TelegramStatusData>(
    session?.user?.id ? "/api/telegram/pair" : null,
    fetcher,
    {
      revalidateOnFocus: true,
      dedupingInterval: 3000,
    }
  );

  const isPaired = Boolean(data?.connected ?? session?.user?.telegramConnected);

  return {
    isPaired,
    status: data,
    isLoading,
    error,
    mutate,
  };
}
