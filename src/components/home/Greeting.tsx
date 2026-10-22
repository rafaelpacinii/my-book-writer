"use client";

import { useProfile } from "@/hooks/useProfile";
import { LoadingRegion } from "@/components/ui/LoadingRegion";
import { Skeleton } from "@/components/ui/Skeleton";
import { PageHeader } from "@/components/shared/PageHeader";

export function Greeting() {
  const { profile, isLoading } = useProfile();
  const name = profile?.display_name.trim().split(/\s+/)[0];

  return (
    <LoadingRegion isLoading={isLoading} label="Carregando seu espaço"
      skeleton={<Skeleton className="h-[98px] w-full max-w-md" />}
    >
      <PageHeader title={name ? `Bom te ver, ${name}.` : "Seu estúdio de escrita."}
        description="A próxima página começa no seu tempo."
      />
    </LoadingRegion>
  );
}
