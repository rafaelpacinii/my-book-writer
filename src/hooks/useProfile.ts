"use client";

import { useCallback, useEffect, useState } from "react";
import { getProfile, updateProfile } from "@/lib/api/profile";
import type { LocalProfile } from "@/types/profile";

export interface UseProfileReturn {
  profile: LocalProfile | null;
  isLoading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
  updateDisplayName: (displayName: string) => Promise<LocalProfile>;
}

export function useProfile(): UseProfileReturn {
  const [profile, setProfile] = useState<LocalProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refreshProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getProfile();
      setProfile(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleUpdateDisplayName = useCallback(
    async (displayName: string): Promise<LocalProfile> => {
      setError(null);
      try {
        const updated = await updateProfile(displayName);
        setProfile(updated);
        return updated;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
        throw err;
      }
    },
    [],
  );

  useEffect(() => {
    void refreshProfile();
  }, [refreshProfile]);

  return {
    profile,
    isLoading,
    error,
    refreshProfile,
    updateDisplayName: handleUpdateDisplayName,
  };
}
