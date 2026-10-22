"use client";

import { updateProfile } from "@/lib/api/profile";
import { profileResource } from "@/lib/data/appResources";
import { useResource } from "@/hooks/useResource";

export function useProfile() {
  const profile = useResource(profileResource);
  return {
    profile: profile.data ?? null,
    isLoading: profile.isLoading,
    error: profile.error,
    refreshProfile: profile.refresh,
    async updateDisplayName(displayName: string) {
      const updated = await updateProfile(displayName);
      profileResource.set(updated);
      return updated;
    },
  };
}

export type UseProfileReturn = ReturnType<typeof useProfile>;
