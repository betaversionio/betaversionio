'use client';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Image,
  Link,
  Quote,
  Table,
  BookOpen,
} from 'lucide-react';

interface EditorFormatToolbarProps {
  onInsert: (before: string, after: string) => void;
}

const SNIPPETS = [
  {
    group: 'format',
    items: [
      {
        icon: Bold,
        label: 'Bold',
        before: '\\textbf{',
        after: '}',
        shortcut: 'Ctrl+B',
      },
      {
        icon: Italic,
        label: 'Italic',
        before: '\\textit{',
        after: '}',
        shortcut: 'Ctrl+I',
      },
      {
        icon: Underline,
        label: 'Underline',
        before: '\\underline{',
        after: '}',
      },
    ],
  },
  {
    group: 'structure',
    items: [
      { icon: Heading1, label: 'Section', before: '\\section{', after: '}' },
      {
        icon: Heading2,
        label: 'Subsection',
        before: '\\subsection{',
        after: '}',
      },
      {
        icon: Quote,
        label: 'Environment',
        before: '\\begin{center}\n',
        after: '\n\\end{center}',
      },
    ],
  },
  {
    group: 'lists',
    items: [
      {
        icon: List,
        label: 'Bullet list',
        before: '\\begin{itemize}\n  \\item ',
        after: '\n\\end{itemize}',
      },
      {
        icon: ListOrdered,
        label: 'Numbered list',
        before: '\\begin{enumerate}\n  \\item ',
        after: '\n\\end{enumerate}',
      },
    ],
  },
  {
    group: 'inserts',
    items: [
      {
        icon: Image,
        label: 'Figure',
        before:
          '\\begin{figure}[h]\n  \\centering\n  \\includegraphics[width=0.8\\textwidth]{',
        after: '}\n  \\caption{Caption}\n\\end{figure}',
      },
      {
        icon: Link,
        label: 'Hyperlink',
        before: '\\href{url}{',
        after: '}',
      },
      {
        icon: Table,
        label: 'Table',
        before:
          '\\begin{tabular}{|l|l|}\n  \\hline\n  Column 1 & Column 2 \\\\\n  \\hline\n  ',
        after: ' & \\\\\n  \\hline\n\\end{tabular}',
      },
      {
        icon: BookOpen,
        label: 'Citation',
        before: '\\cite{',
        after: '}',
      },
    ],
  },
] as const;

export function EditorFormatToolbar({ onInsert }: EditorFormatToolbarProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex items-center gap-0.5 border-b bg-muted/30 px-2 py-1">
        {SNIPPETS.map((group, gi) => (
          <div key={group.group} className="flex items-center">
            {gi > 0 && (
              <Separator orientation="vertical" className="mx-1 h-5" />
            )}
            {group.items.map((item) => (
              <Tooltip key={item.label}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => onInsert(item.before, item.after)}
                  >
                    <item.icon className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  {item.label}
                  {'shortcut' in item && (
                    <kbd className="ml-2 rounded bg-muted text-foreground px-1 py-0.5 font-mono text-[10px]">
                      {item.shortcut}
                    </kbd>
                  )}
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        ))}
      </div>
    </TooltipProvider>
  );
}
