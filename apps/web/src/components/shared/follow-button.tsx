'use client';

import { useRouter } from 'next/navigation';
import { UserAdd, UserMinus } from 'iconsax-react';
import { useAuth } from '@/providers/auth-provider';
import { useFollowStatus, useToggleFollow } from '@/hooks/queries';
import { Button } from '@/components/ui/button';

interface FollowButtonProps {
  targetUserId: string;
  className?: string;
}

export function FollowButton({ targetUserId, className }: FollowButtonProps) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const { data: status } = useFollowStatus(
    isAuthenticated ? targetUserId : undefined,
  );
  const { mutate: toggle, isPending } = useToggleFollow(targetUserId);

  // Hide on own profile
  if (user?.id === targetUserId) return null;

  const isFollowing = status?.following ?? false;

  const handleClick = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    toggle();
  };

  return (
    <Button
      variant={isFollowing ? 'outline' : 'default'}
      size="sm"
      onClick={handleClick}
      disabled={isPending}
      className={className}
    >
      {isFollowing ? (
        <>
          <UserMinus size={16} color="currentColor" />
          Following
        </>
      ) : (
        <>
          <UserAdd size={16} color="currentColor" />
          Follow
        </>
      )}
    </Button>
  );
}
