'use client';

import { useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { useMyFullProfile } from '@/hooks/queries';
import { SidebarProvider } from '@/components/layout/sidebar/sidebar-context';
import { DashboardHeader } from '@/components/layout/dashboard-header';
import {
  ProfileEditSidebar,
  ProfileForm,
  ProfileAvatarUpload,
  AboutSection,
  SocialLinksForm,
  TechStackForm,
  ExperienceSection,
  EducationSection,
  ServicesSection,
  type ProfileEditTab,
} from '@/features/profile';
import { Loader2 } from 'lucide-react';

const tabMeta: Record<ProfileEditTab, { title: string; description: string }> = {
  profile: {
    title: 'Profile',
    description: 'Basic information about you that will be visible on your public profile',
  },
  about: {
    title: 'About',
    description: 'Write a detailed bio using markdown',
  },
  'social-links': {
    title: 'Social Links',
    description: 'Add links to your social media profiles',
  },
  'tech-stack': {
    title: 'Tech Stack',
    description: 'List the technologies you work with',
  },
  experience: {
    title: 'Experience',
    description: 'Add your work experience',
  },
  education: {
    title: 'Education',
    description: 'Add your educational background',
  },
  services: {
    title: 'Services',
    description: 'List the services you offer as a developer',
  },
};

export default function ProfileEditPage() {
  const { user } = useAuth();
  const { data: profile, isLoading } = useMyFullProfile();
  const [activeTab, setActiveTab] = useState<ProfileEditTab>('profile');

  const meta = tabMeta[activeTab];

  return (
    <SidebarProvider>
      <div className="fixed inset-0 flex bg-background">
        <ProfileEditSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
          <DashboardHeader />
          <main className="flex-1 overflow-y-auto px-4 pb-10 pt-20 md:px-6 md:pb-12 md:pt-20 lg:px-8 lg:pb-16 lg:pt-22">
            <div className="mx-auto max-w-3xl">
              <div className="mb-8">
                <h1 className="text-2xl font-semibold tracking-tight">
                  {meta.title}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {meta.description}
                </p>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  {activeTab === 'profile' && (
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
                  )}

                  {activeTab === 'about' && (
                    <AboutSection initialBio={profile?.profile?.bio} />
                  )}

                  {activeTab === 'social-links' && (
                    <SocialLinksForm initialData={profile?.socialLinks} />
                  )}

                  {activeTab === 'tech-stack' && (
                    <TechStackForm initialData={profile?.techStack} />
                  )}

                  {activeTab === 'experience' && (
                    <ExperienceSection items={profile?.experiences ?? []} />
                  )}

                  {activeTab === 'education' && (
                    <EducationSection items={profile?.education ?? []} />
                  )}

                  {activeTab === 'services' && (
                    <ServicesSection items={profile?.services ?? []} />
                  )}
                </>
              )}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
