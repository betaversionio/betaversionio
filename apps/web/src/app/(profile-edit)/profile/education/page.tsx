'use client';

import { useMyFullProfile } from '@/hooks/queries';
import { EducationSection } from '@/features/profile';
import { Loader2 } from 'lucide-react';

export default function EducationPage() {
  const { data: profile, isLoading } = useMyFullProfile();

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <EducationSection items={profile?.education ?? []} />;
}
