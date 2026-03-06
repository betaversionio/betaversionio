'use client';

import { useAuth } from '@/providers/auth-provider';
import { useMyFullProfile } from '@/hooks/queries';
import { ProfileForm, ProfileAvatarUpload } from '@/features/profile';
import { Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  const { data: profile, isLoading } = useMyFullProfile();

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col-reverse gap-12 md:flex-row">
      <div className="flex-1">
        <ProfileForm
          initialData={{
            name: profile?.name,
            headline: profile?.profile?.headline,
            location: profile?.profile?.location,
            website: profile?.profile?.website,
          }}
        />
      </div>
      <div className="flex shrink-0 justify-center md:justify-start">
        <ProfileAvatarUpload avatarUrl={user?.avatarUrl} />
      </div>
    </div>
  );
}
