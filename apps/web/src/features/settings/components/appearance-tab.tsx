'use client';

import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Monitor, Moon, Sun } from 'lucide-react';

export function AppearanceTab() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Theme</CardTitle>
          <CardDescription>
            Select your preferred color theme
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <Button
              variant={theme === 'light' ? 'default' : 'outline'}
              className="flex h-auto flex-col gap-2 py-4"
              onClick={() => setTheme('light')}
            >
              <Sun className="h-5 w-5" />
              <span className="text-xs">Light</span>
            </Button>
            <Button
              variant={theme === 'dark' ? 'default' : 'outline'}
              className="flex h-auto flex-col gap-2 py-4"
              onClick={() => setTheme('dark')}
            >
              <Moon className="h-5 w-5" />
              <span className="text-xs">Dark</span>
            </Button>
            <Button
              variant={theme === 'system' ? 'default' : 'outline'}
              className="flex h-auto flex-col gap-2 py-4"
              onClick={() => setTheme('system')}
            >
              <Monitor className="h-5 w-5" />
              <span className="text-xs">System</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
