'use client';

import { useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { CreateProjectInput } from '@devcom/shared';
import { useSearchUsers } from '@/hooks/queries';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldTitle,
} from '@/components/ui/field';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Search, Users } from 'lucide-react';

interface MakersSectionProps {
  form: UseFormReturn<CreateProjectInput>;
}

function getInitials(name: string | null | undefined): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

interface FoundUser {
  id: string;
  username: string;
  name: string | null;
  avatarUrl: string | null;
  headline: string | null;
}

export function MakersSection({ form }: MakersSectionProps) {
  const { setValue, watch } = form;
  const makers = watch('makers') ?? [];

  const [searchQuery, setSearchQuery] = useState('');
  const [roleInput, setRoleInput] = useState('');
  const [selectedUser, setSelectedUser] = useState<FoundUser | null>(null);

  const { data: usersData } = useSearchUsers(searchQuery);

  function addMaker() {
    if (!selectedUser || !roleInput.trim()) return;

    const alreadyAdded = makers.some((m) => m.userId === selectedUser.id);
    if (alreadyAdded) return;

    setValue('makers', [
      ...makers,
      { userId: selectedUser.id, role: roleInput.trim() },
    ]);

    setSelectedUser(null);
    setSearchQuery('');
    setRoleInput('');
  }

  function removeMaker(userId: string) {
    setValue(
      'makers',
      makers.filter((m) => m.userId !== userId),
    );
  }

  const [makerDisplayMap, setMakerDisplayMap] = useState<
    Record<string, FoundUser>
  >({});

  function selectUser(user: FoundUser) {
    setSelectedUser(user);
    setSearchQuery('');
    setMakerDisplayMap((prev) => ({ ...prev, [user.id]: user }));
  }

  return (
    <FieldGroup>
      {/* Search + Add maker */}
      <Field>
        <FieldTitle>Find a user</FieldTitle>
        <FieldDescription>
          Search by name or username to add a team member.
        </FieldDescription>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or username..."
            value={selectedUser ? `@${selectedUser.username}` : searchQuery}
            onChange={(e) => {
              if (selectedUser) {
                setSelectedUser(null);
              }
              setSearchQuery(e.target.value);
            }}
            className="pl-9"
          />
        </div>

        {/* Search results dropdown */}
        {searchQuery.length >= 2 && !selectedUser && usersData?.items && (
          <div className="max-h-52 overflow-y-auto rounded-lg border bg-popover shadow-md">
            {usersData.items.length === 0 ? (
              <p className="px-4 py-4 text-center text-sm text-muted-foreground">
                No users found
              </p>
            ) : (
              usersData.items.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors first:rounded-t-lg last:rounded-b-lg hover:bg-muted"
                  onClick={() => selectUser(user)}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatarUrl ?? undefined} />
                    <AvatarFallback className="text-[10px]">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">
                      {user.name ?? user.username}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      @{user.username}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        )}

        {/* Role input + add button */}
        {selectedUser && (
          <div className="flex gap-2">
            <Input
              placeholder="Role (e.g. Designer, Backend Lead)"
              value={roleInput}
              onChange={(e) => setRoleInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addMaker();
                }
              }}
              autoFocus
            />
            <Button
              type="button"
              onClick={addMaker}
              disabled={!roleInput.trim()}
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Add
            </Button>
          </div>
        )}
      </Field>

      {/* Makers list */}
      {makers.length > 0 ? (
        <Field>
          <FieldTitle>
            Team ({makers.length})
          </FieldTitle>
          <div className="space-y-2">
            {makers.map((maker) => {
              const display = makerDisplayMap[maker.userId];
              return (
                <div
                  key={maker.userId}
                  className="flex items-center justify-between rounded-lg border bg-card px-4 py-3 transition-colors hover:bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={display?.avatarUrl ?? undefined} />
                      <AvatarFallback className="text-xs">
                        {getInitials(display?.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {display?.name ?? display?.username ?? maker.userId}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        @{display?.username ?? maker.userId}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {maker.role}
                    </Badge>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => removeMaker(maker.userId)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Field>
      ) : (
        /* Empty state */
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Users className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="mt-4 text-sm font-medium">No makers yet</p>
          <p className="mt-1 max-w-[240px] text-xs text-muted-foreground">
            Search for users above to add them as collaborators on your project.
          </p>
        </div>
      )}
    </FieldGroup>
  );
}
