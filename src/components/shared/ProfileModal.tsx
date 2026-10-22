"use client";

import { Modal } from "@/components/ui/Modal";
import { LoadingRegion } from "@/components/ui/LoadingRegion";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/shared/ErrorState";
import { ProfileForm } from "@/components/shared/ProfileForm";
import { useProfile } from "@/hooks/useProfile";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: Props) {
  const profile = useProfile();
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Configurações do autor">
      {profile.error && <ErrorState message={profile.error} onRetry={() => { void profile.refreshProfile(); }} />}
      <LoadingRegion isLoading={profile.isLoading} label="Carregando perfil" skeleton={<Skeleton className="h-48 w-full" />}>
        {profile.profile && <ProfileForm initialName={profile.profile.display_name} onClose={onClose} />}
      </LoadingRegion>
    </Modal>
  );
}
