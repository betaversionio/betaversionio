'use client';

import { useAuth } from '@/providers/auth-provider';
import { Separator } from '@/components/ui/separator';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ProfileAvatarUpload,
  ProfileForm,
  SocialLinksForm,
  TechStackForm,
} from '@/features/profile';

export default function EditProfilePage() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Edit Profile</h1>
        <p className="text-muted-foreground">
          Manage your public developer profile
        </p>
      </div>

      {/* Profile Information + Avatar */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Basic information about you that will be visible on your public
            profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col-reverse gap-12 md:flex-row">
            {/* Left: Basic Info */}
            <div className="flex-1">
              <ProfileForm />
            </div>

            {/* Right: Avatar Upload */}
            <div className="flex shrink-0 justify-center md:justify-start">
              <ProfileAvatarUpload avatarUrl={user?.avatarUrl} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Social Links */}
      <SocialLinksForm />

      <Separator />

      {/* Tech Stack */}
      <TechStackForm />
    </div>
  );
}
