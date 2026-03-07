'use client';

import StackIcon from 'tech-stack-icons';
import { useTheme } from 'next-themes';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import { getTechIconName } from '@/lib/tech-icons';

interface TechBadgeProps extends Omit<BadgeProps, 'children'> {
  name: string;
}

export function TechBadge({ name, className, ...props }: TechBadgeProps) {
  const { resolvedTheme } = useTheme();
  const iconName = getTechIconName(name);

  return (
    <Badge className={className} {...props}>
      {iconName && (
        <span className="mr-1 inline-flex h-3.5 w-3.5 shrink-0">
          <StackIcon
            name={iconName}
            variant={resolvedTheme === 'dark' ? 'dark' : 'light'}
          />
        </span>
      )}
      {name}
    </Badge>
  );
}
