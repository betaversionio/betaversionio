import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

function getInitials(name: string | null | undefined): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

interface UserAvatarProps {
  src: string | null | undefined;
  name: string | null | undefined;
  className?: string;
  fallbackClassName?: string;
}

export function UserAvatar({
  src,
  name,
  className,
  fallbackClassName,
}: UserAvatarProps) {
  return (
    <Avatar className={cn('h-10 w-10', className)}>
      <AvatarImage src={src ?? undefined} />
      <AvatarFallback className={fallbackClassName}>
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
}
