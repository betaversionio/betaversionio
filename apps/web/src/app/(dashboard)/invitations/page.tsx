'use client';

import {
  useReceivedInvitations,
  useRespondToInvitation,
} from '@/hooks/queries/use-invitation-queries';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserAvatar } from '@/components/shared/user-avatar';
import { timeAgo } from '@/lib/format';
import { PageHeader } from '@/components/shared/page-header';
import { Loader2, Mail } from 'lucide-react';
import Link from 'next/link';

export default function InvitationsPage() {
  const { data: invitations, isLoading } = useReceivedInvitations();
  const respond = useRespondToInvitation();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invitations"
        description="Team invitations you've received."
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : !invitations?.length ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <Mail className="h-10 w-10 text-muted-foreground" />
          <h3 className="mt-4 font-semibold">No pending invitations</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            You&apos;ll see team invitations here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {invitations.map((inv) => (
            <div
              key={inv.id}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="flex items-center gap-3">
                {inv.project?.logo ? (
                  <img
                    src={inv.project.logo}
                    alt=""
                    className="h-10 w-10 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-sm font-bold text-muted-foreground">
                    {inv.project?.title?.charAt(0) ?? '?'}
                  </div>
                )}
                <div>
                  <Link
                    href={`/projects/${inv.project?.slug}`}
                    className="font-medium hover:underline"
                  >
                    {inv.project?.title}
                  </Link>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>
                      Invited by {inv.inviter?.name ?? inv.inviter?.username}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {inv.role}
                    </Badge>
                    <span className="text-xs">{timeAgo(inv.createdAt)}</span>
                  </div>
                  {inv.message && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      &ldquo;{inv.message}&rdquo;
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  isLoading={respond.isPending}
                  onClick={() =>
                    respond.mutate({ invitationId: inv.id, action: 'accept' })
                  }
                >
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  isLoading={respond.isPending}
                  onClick={() =>
                    respond.mutate({ invitationId: inv.id, action: 'reject' })
                  }
                >
                  Decline
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
