'use client';

import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateSocialLinksSchema, SocialPlatform } from '@devcom/shared';
import type { UpdateSocialLinksInput } from '@devcom/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';
import { profileKeys } from '@/hooks/queries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Field } from '@/components/ui/field';
import { Link, Plus, Trash2 } from 'lucide-react';

const platformPatterns: { platform: SocialPlatform; pattern: RegExp }[] = [
  { platform: SocialPlatform.Github, pattern: /github\.com/i },
  { platform: SocialPlatform.Linkedin, pattern: /linkedin\.com/i },
  { platform: SocialPlatform.Twitter, pattern: /twitter\.com|x\.com/i },
  { platform: SocialPlatform.Youtube, pattern: /youtube\.com|youtu\.be/i },
  { platform: SocialPlatform.Devto, pattern: /dev\.to/i },
  { platform: SocialPlatform.Dribbble, pattern: /dribbble\.com/i },
  { platform: SocialPlatform.Behance, pattern: /behance\.net/i },
];

function detectPlatform(url: string): SocialPlatform {
  for (const { platform, pattern } of platformPatterns) {
    if (pattern.test(url)) return platform;
  }
  return SocialPlatform.Website;
}

function PlatformIcon({
  platform,
  className = 'size-4',
}: {
  platform: SocialPlatform;
  className?: string;
}) {
  const svgProps = {
    className,
    fill: 'currentColor',
    viewBox: '0 0 24 24',
    xmlns: 'http://www.w3.org/2000/svg',
  };

  switch (platform) {
    case SocialPlatform.Github:
      return (
        <svg {...svgProps}>
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
        </svg>
      );
    case SocialPlatform.Linkedin:
      return (
        <svg {...svgProps}>
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      );
    case SocialPlatform.Twitter:
      return (
        <svg {...svgProps}>
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    case SocialPlatform.Youtube:
      return (
        <svg {...svgProps}>
          <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      );
    case SocialPlatform.Devto:
      return (
        <svg {...svgProps}>
          <path d="M7.42 10.05c-.18-.16-.46-.23-.84-.23H6.14v4.41h.44c.38 0 .66-.08.84-.23.21-.18.32-.52.32-1.06V11.1c0-.55-.11-.89-.32-1.05zM0 0v24h24V0H0zm8.1 15.13c-.29.41-.71.76-1.26.95-.36.13-.76.18-1.13.18H3.96V7.74h1.99c.35 0 .7.05 1.03.17.55.19.96.54 1.25.95.26.38.4.9.4 1.55v3.16c0 .66-.14 1.18-.43 1.56zm6.19-5.59h-2.53v2.48h1.54v1.74h-1.54v2.53h2.53v1.84h-3.24c-.54 0-1.03-.42-1.06-.96V8.56c-.03-.53.42-.99.96-.99h3.34v1.97zm5.18 6.42c-.3.67-.97 1.15-1.69 1.14-.42 0-.86-.14-1.18-.42-.33-.28-.55-.68-.73-1.09l-.2-.54V8.2l.16-.44c.17-.41.38-.8.71-1.09.66-.59 1.68-.65 2.39-.13.37.27.62.67.81 1.1l-1.44.87c-.08-.28-.17-.55-.34-.76-.17-.19-.48-.26-.72-.1-.26.17-.37.52-.41.84-.02.26-.02.53-.02.79v3.42c0 .33.02.67.08.99.08.42.31.77.72.81.36.04.63-.16.79-.45.1-.18.15-.38.2-.58l1.45.75c-.12.38-.28.73-.52 1.03z" />
        </svg>
      );
    case SocialPlatform.Dribbble:
      return (
        <svg {...svgProps}>
          <path d="M12 24C5.385 24 0 18.615 0 12S5.385 0 12 0s12 5.385 12 12-5.385 12-12 12zm10.12-10.358c-.35-.11-3.17-.953-6.384-.438 1.34 3.684 1.887 6.684 1.992 7.308a10.174 10.174 0 004.392-6.87zm-6.115 7.808c-.153-.9-.75-4.032-2.19-7.77l-.066.02c-5.79 2.015-7.86 6.025-8.04 6.4a10.143 10.143 0 006.29 2.166c1.42 0 2.77-.29 4.006-.816zm-11.62-2.58c.232-.4 3.045-5.055 8.332-6.765.135-.045.27-.084.405-.12-.26-.585-.54-1.167-.832-1.74C7.17 11.775 2.206 11.71 1.756 11.7l-.004.312c0 2.633.998 5.037 2.634 6.855zm-2.42-8.955c.46.008 4.683.026 9.477-1.248-1.698-3.018-3.53-5.558-3.8-5.928-2.868 1.35-5.01 3.99-5.676 7.17zM9.6 2.052c.282.38 2.145 2.914 3.822 6 3.645-1.365 5.19-3.44 5.373-3.702A10.146 10.146 0 0012 1.822c-.83 0-1.632.1-2.4.23zm10.335 3.483c-.218.29-1.91 2.47-5.724 4.005.24.49.47.985.68 1.486.075.18.15.36.22.53 3.41-.43 6.8.26 7.14.33-.02-2.42-.88-4.64-2.31-6.35z" />
        </svg>
      );
    case SocialPlatform.Behance:
      return (
        <svg {...svgProps}>
          <path d="M6.938 4.503c.702 0 1.34.06 1.92.188.577.13 1.07.33 1.485.61.41.28.733.65.96 1.12.225.47.34 1.05.34 1.73 0 .74-.17 1.36-.507 1.86-.338.5-.837.9-1.502 1.22.906.26 1.576.72 2.022 1.37.448.66.665 1.45.665 2.36 0 .75-.13 1.39-.41 1.93-.28.55-.67 1-1.16 1.35-.48.348-1.05.6-1.67.767-.63.165-1.27.25-1.95.25H0V4.51h6.938v-.007zM6.545 10.16c.6 0 1.096-.16 1.486-.48.39-.32.59-.79.59-1.42 0-.36-.06-.66-.18-.89-.12-.23-.28-.41-.49-.55-.21-.13-.46-.22-.74-.27-.28-.05-.58-.08-.9-.08H3.38v3.7h3.165v-.01zm.2 5.59c.34 0 .66-.04.96-.12.3-.08.56-.2.79-.35.225-.15.4-.36.53-.62.13-.26.19-.58.19-.96 0-.75-.22-1.29-.66-1.63-.44-.33-1.01-.49-1.72-.49H3.38v4.17h3.365zm9.578-2.2c.21.56.56.96 1.06 1.21.49.25 1.03.37 1.62.37.51 0 .96-.1 1.35-.28.39-.19.67-.47.86-.84h2.86c-.44 1.35-1.14 2.3-2.1 2.87-.96.57-2.1.85-3.43.85-.87 0-1.67-.14-2.39-.42-.72-.28-1.34-.68-1.86-1.21-.52-.53-.92-1.17-1.21-1.92-.29-.75-.43-1.58-.43-2.5 0-.88.15-1.7.44-2.45.29-.75.7-1.4 1.22-1.94.52-.54 1.14-.96 1.86-1.26.72-.3 1.52-.45 2.38-.45.95 0 1.79.19 2.5.56.72.37 1.31.87 1.78 1.5.47.63.82 1.36 1.04 2.18.22.82.31 1.68.28 2.58h-8.55c-.02.74.18 1.41.52 2.02v.01zm3.52-4.59c-.31-.44-.78-.69-1.41-.73-.4 0-.74.07-1.03.2-.28.14-.52.3-.7.51-.19.2-.33.43-.42.68-.09.25-.15.48-.18.72h4.87c-.13-.67-.38-1.14-.68-1.57l-.45.19zm-1.56-4.46h5.3v1.32h-5.3V4.5z" />
        </svg>
      );
    default:
      return <Link className={className} />;
  }
}

interface SocialLinksFormProps {
  initialData?: Array<{ platform: string; url: string }>;
}

export function SocialLinksForm({ initialData }: SocialLinksFormProps = {}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<UpdateSocialLinksInput>({
    resolver: zodResolver(updateSocialLinksSchema),
    defaultValues: {
      links: [{ platform: SocialPlatform.Github, url: '' }],
    },
  });

  useEffect(() => {
    if (initialData && initialData.length > 0) {
      form.reset({
        links: initialData.map((l) => ({
          platform: l.platform as SocialPlatform,
          url: l.url,
        })),
      });
    }
  }, [initialData, form]);

  const {
    fields: socialFields,
    append,
    remove,
  } = useFieldArray({
    control: form.control,
    name: 'links',
  });

  const watchedLinks = form.watch('links');

  // Auto-detect platform when URL changes
  useEffect(() => {
    watchedLinks?.forEach((link: { url: string; platform: SocialPlatform }, index: number) => {
      if (link.url) {
        const detected = detectPlatform(link.url);
        if (detected !== link.platform) {
          form.setValue(`links.${index}.platform`, detected);
        }
      }
    });
  }, [watchedLinks, form]);

  const mutation = useMutation({
    mutationFn: (data: UpdateSocialLinksInput) =>
      apiClient.patch('/users/me/social-links', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.me() });
      toast({ title: 'Social links updated' });
    },
    onError: (error) => {
      toast({
        title: 'Update failed',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to update social links.',
        variant: 'destructive',
      });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Social Links</CardTitle>
        <CardDescription>
          Add links to your social media profiles
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
          className="space-y-4"
        >
          {socialFields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-3">
              <Field className="flex-1">
                <div className="relative">
                  <div className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                    <PlatformIcon
                      platform={
                        watchedLinks?.[index]?.platform ??
                        SocialPlatform.Website
                      }
                    />
                  </div>
                  <Input
                    placeholder="https://..."
                    className="pl-10"
                    {...form.register(`links.${index}.url`)}
                  />
                </div>
              </Field>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              append({ platform: SocialPlatform.Website, url: '' })
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Link
          </Button>

          <div className="pt-2">
            <Button type="submit" isLoading={mutation.isPending}>
              Save Social Links
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
