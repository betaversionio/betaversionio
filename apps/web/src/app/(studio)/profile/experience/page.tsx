'use client';

import { useMyFullProfile } from '@/hooks/queries';
import { ExperienceSection } from '@/features/profile';
import { Loader2 } from 'lucide-react';

export default function ExperiencePage() {
  const { data: profile, isLoading } = useMyFullProfile();

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <ExperienceSection items={profile?.experiences ?? []} />;
}
