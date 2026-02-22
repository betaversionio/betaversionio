'use client';

import { useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { CreateProjectInput } from '@devcom/shared';
import { ProjectStatus, ProjectPhase, ProductionType } from '@devcom/shared';
import { AvatarUpload } from '@/components/patterns/p-file-upload-2';
import { useUploadToR2 } from '@/hooks/use-upload-to-r2';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldTitle,
} from '@/components/ui/field';
import { Separator } from '@/components/ui/separator';
import { MarkdownEditor } from '@/components/ui/markdown-editor';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { X, Plus } from 'lucide-react';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);
}

interface MainInfoSectionProps {
  form: UseFormReturn<CreateProjectInput>;
}

export function MainInfoSection({ form }: MainInfoSectionProps) {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const { toast } = useToast();
  const logoUpload = useUploadToR2({ folder: 'projects/logos' });

  const [tagInput, setTagInput] = useState('');
  const [techInput, setTechInput] = useState('');
  const [linkInput, setLinkInput] = useState('');

  const title = watch('title');
  const tags = watch('tags') ?? [];
  const techStack = watch('techStack') ?? [];
  const links = watch('links') ?? [];
  const status = watch('status');
  const phase = watch('phase');
  const productionType = watch('productionType');
  const isOpenSource = watch('isOpenSource');
  const description = watch('description') ?? '';

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setValue('title', value);
    setValue('slug', slugify(value));
  }

  function addTag(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const value = tagInput.trim();
      if (value && !tags.includes(value)) {
        setValue('tags', [...tags, value]);
      }
      setTagInput('');
    }
  }

  function removeTag(tag: string) {
    setValue(
      'tags',
      tags.filter((t) => t !== tag),
    );
  }

  function addTech(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const value = techInput.trim();
      if (value && !techStack.includes(value)) {
        setValue('techStack', [...techStack, value]);
      }
      setTechInput('');
    }
  }

  function removeTech(tech: string) {
    setValue(
      'techStack',
      techStack.filter((t) => t !== tech),
    );
  }

  function addLink() {
    const value = linkInput.trim();
    if (value && !links.includes(value)) {
      setValue('links', [...links, value]);
    }
    setLinkInput('');
  }

  function removeLink(link: string) {
    setValue(
      'links',
      links.filter((l) => l !== link),
    );
  }

  return (
    <div className="space-y-8">
      {/* ── Identity ────────────────────────────────── */}
      <FieldGroup>
        {/* Logo */}
        <Field data-invalid={!!errors.logo}>
          <AvatarUpload
            maxSize={2 * 1024 * 1024}
            rounded="md"
            onFileChange={async (file) => {
              if (!file || !(file.file instanceof File)) {
                setValue('logo', undefined);
                return;
              }
              try {
                const publicUrl = await logoUpload.upload(file.file);
                setValue('logo', publicUrl);
              } catch {
                toast({
                  title: 'Logo upload failed',
                  description: 'Could not upload your logo. Please try again.',
                  variant: 'destructive',
                });
              }
            }}
          />
          {logoUpload.isUploading && (
            <p className="text-xs text-muted-foreground">Uploading logo...</p>
          )}
          {errors.logo && <FieldError>{errors.logo.message}</FieldError>}
        </Field>

        {/* Title */}
        <Field data-invalid={!!errors.title}>
          <FieldLabel htmlFor="title">Title</FieldLabel>
          <Input
            id="title"
            placeholder="My Awesome Project"
            value={title}
            onChange={handleTitleChange}
          />
          {errors.title && <FieldError>{errors.title.message}</FieldError>}
        </Field>

        {/* Slug */}
        <Field data-invalid={!!errors.slug}>
          <FieldLabel htmlFor="slug">Slug</FieldLabel>
          <Input
            id="slug"
            placeholder="my-awesome-project"
            {...register('slug')}
          />
          <FieldDescription>
            Auto-generated from title. Used in the project URL.
          </FieldDescription>
          {errors.slug && <FieldError>{errors.slug.message}</FieldError>}
        </Field>

        {/* Tagline */}
        <Field data-invalid={!!errors.tagline}>
          <FieldLabel htmlFor="tagline">Tagline</FieldLabel>
          <Input
            id="tagline"
            placeholder="A short, catchy summary of your project"
            {...register('tagline')}
          />
          {errors.tagline && <FieldError>{errors.tagline.message}</FieldError>}
        </Field>
      </FieldGroup>

      <Separator />

      {/* ── Description ─────────────────────────────── */}
      <FieldGroup>
        <Field data-invalid={!!errors.description}>
          <FieldTitle>Description</FieldTitle>
          <FieldDescription>
            Tell people what your project does, why it exists, and what makes it
            special.
          </FieldDescription>
          <MarkdownEditor
            value={description}
            onChange={(val) => setValue('description', val)}
            placeholder="Describe your project in detail..."
            outputFormat="markdown"
            height={240}
            maxHeight={480}
          />
          {errors.description && (
            <FieldError>{errors.description.message}</FieldError>
          )}
        </Field>
      </FieldGroup>

      <Separator />

      {/* ── Details ──────────────────────────────────── */}
      <FieldGroup>
        {/* Tech Stack */}
        <Field>
          <FieldTitle>Tech Stack</FieldTitle>
          <FieldDescription>
            Technologies and frameworks used in your project.
          </FieldDescription>
          {techStack.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {techStack.map((tech) => (
                <Badge key={tech} variant="secondary" className="gap-1">
                  {tech}
                  <button
                    type="button"
                    onClick={() => removeTech(tech)}
                    className="ml-1 rounded-full hover:bg-muted-foreground/20"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
          <Input
            placeholder="Type a technology and press Enter"
            value={techInput}
            onChange={(e) => setTechInput(e.target.value)}
            onKeyDown={addTech}
          />
        </Field>

        {/* Tags */}
        <Field>
          <FieldTitle>Tags</FieldTitle>
          <FieldDescription>
            Categorize your project so others can discover it.
          </FieldDescription>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <Badge key={tag} variant="outline" className="gap-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 rounded-full hover:bg-muted-foreground/20"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
          <Input
            placeholder="Type a tag and press Enter"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={addTag}
          />
        </Field>

        {/* Links */}
        <Field data-invalid={!!errors.links}>
          <FieldTitle>Links</FieldTitle>
          <FieldDescription>
            Add your project website, repo, or social links.
          </FieldDescription>
          {links.length > 0 && (
            <ul className="space-y-1.5">
              {links.map((link) => (
                <li
                  key={link}
                  className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2 text-sm"
                >
                  <span className="truncate font-mono text-xs">{link}</span>
                  <button
                    type="button"
                    onClick={() => removeLink(link)}
                    className="ml-2 shrink-0 text-muted-foreground transition-colors hover:text-destructive"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="flex gap-2">
            <Input
              placeholder="https://example.com"
              value={linkInput}
              onChange={(e) => setLinkInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addLink();
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={addLink}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {errors.links && <FieldError>{errors.links.message}</FieldError>}
        </Field>
      </FieldGroup>

      <Separator />

      {/* ── Settings ─────────────────────────────────── */}
      <FieldGroup>
        <Field orientation="horizontal">
          <Checkbox
            id="isOpenSource"
            checked={isOpenSource ?? false}
            onCheckedChange={(checked) =>
              setValue('isOpenSource', checked === true)
            }
          />
          <FieldLabel htmlFor="isOpenSource" className="cursor-pointer">
            This project is open source
          </FieldLabel>
        </Field>

        <div className="grid gap-4 md:grid-cols-3">
          <Field>
            <FieldLabel>Status</FieldLabel>
            <Select
              value={status}
              onValueChange={(value) =>
                setValue('status', value as ProjectStatus)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(ProjectStatus).map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel>Phase</FieldLabel>
            <Select
              value={phase}
              onValueChange={(value) =>
                setValue('phase', value as ProjectPhase)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(ProjectPhase).map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel>Type</FieldLabel>
            <Select
              value={productionType}
              onValueChange={(value) =>
                setValue('productionType', value as ProductionType)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(ProductionType).map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
      </FieldGroup>
    </div>
  );
}
