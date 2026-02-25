'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  useMyFollowers,
  useMyFollowing,
  useMyMutuals,
  useSuggestedUsers,
} from '@/hooks/queries';
import { PageHeader } from '@/components/shared/page-header';
import { UserAvatar } from '@/components/shared/user-avatar';
import { FollowButton } from '@/components/shared/follow-button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { People } from 'iconsax-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// ─── Shared sub-components ──────────────────────────────────────────────────

interface FollowUser {
  id: string;
  username: string;
  name: string | null;
  avatarUrl: string | null;
  profile: { headline: string | null } | null;
}

function UserRow({ user }: { user: FollowUser }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <Link href={`/profile/${user.username}`}>
        <UserAvatar
          src={user.avatarUrl}
          name={user.name}
          className="h-10 w-10"
        />
      </Link>
      <div className="min-w-0 flex-1">
        <Link
          href={`/profile/${user.username}`}
          className="block truncate text-sm font-medium hover:underline"
        >
          {user.name ?? user.username}
        </Link>
        <p className="truncate text-xs text-muted-foreground">
          @{user.username}
          {user.profile?.headline && ` · ${user.profile.headline}`}
        </p>
      </div>
      <FollowButton targetUserId={user.id} />
    </div>
  );
}

function UserList({
  users,
  isLoading,
  emptyText,
  page,
  totalPages,
  onPageChange,
}: {
  users: FollowUser[];
  isLoading: boolean;
  emptyText: string;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-foreground" />
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
        <People
          size={40}
          className="text-muted-foreground"
          color="currentColor"
        />
        <p className="mt-4 text-sm text-muted-foreground">{emptyText}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {users.map((user) => (
          <UserRow key={user.id} user={user} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function NetworkPage() {
  const [followersPage, setFollowersPage] = useState(1);
  const [followingPage, setFollowingPage] = useState(1);
  const [mutualsPage, setMutualsPage] = useState(1);

  const { data: followersData, isLoading: followersLoading } =
    useMyFollowers(followersPage);
  const { data: followingData, isLoading: followingLoading } =
    useMyFollowing(followingPage);
  const { data: mutualsData, isLoading: mutualsLoading } =
    useMyMutuals(mutualsPage);
  const { data: suggested, isLoading: suggestedLoading } =
    useSuggestedUsers(10);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Network"
        description="Manage your connections and discover developers."
      />

      <Tabs defaultValue="followers">
        <TabsList>
          <TabsTrigger value="followers">
            Followers
            {followersData?.meta.total ? (
              <span className="ml-1.5 rounded-full bg-background px-1.5 py-0.5 text-[10px]">
                {followersData.meta.total}
              </span>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="following">
            Following
            {followingData?.meta.total ? (
              <span className="ml-1.5 rounded-full bg-background px-1.5 py-0.5 text-[10px]">
                {followingData.meta.total}
              </span>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="mutuals">
            Mutual
            {mutualsData?.meta.total ? (
              <span className="ml-1.5 rounded-full bg-background px-1.5 py-0.5 text-[10px]">
                {mutualsData.meta.total}
              </span>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="suggested">Suggested</TabsTrigger>
        </TabsList>

        <TabsContent value="followers">
          <UserList
            users={followersData?.items ?? []}
            isLoading={followersLoading}
            emptyText="No followers yet. Share your profile to grow your network!"
            page={followersPage}
            totalPages={followersData?.meta.totalPages ?? 1}
            onPageChange={setFollowersPage}
          />
        </TabsContent>

        <TabsContent value="following">
          <UserList
            users={followingData?.items ?? []}
            isLoading={followingLoading}
            emptyText="You're not following anyone yet. Explore developers to follow!"
            page={followingPage}
            totalPages={followingData?.meta.totalPages ?? 1}
            onPageChange={setFollowingPage}
          />
        </TabsContent>

        <TabsContent value="mutuals">
          <UserList
            users={mutualsData?.items ?? []}
            isLoading={mutualsLoading}
            emptyText="No mutual connections yet."
            page={mutualsPage}
            totalPages={mutualsData?.meta.totalPages ?? 1}
            onPageChange={setMutualsPage}
          />
        </TabsContent>

        <TabsContent value="suggested">
          {suggestedLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-foreground" />
            </div>
          ) : !suggested?.length ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
              <People
                size={40}
                className="text-muted-foreground"
                color="currentColor"
              />
              <p className="mt-4 text-sm text-muted-foreground">
                No suggestions right now. Add tech stack items to get
                personalized recommendations!
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {suggested.map((user) => (
                <UserRow key={user.id} user={user} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
