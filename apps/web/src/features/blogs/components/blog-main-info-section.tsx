'use client';

import { useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { CreateBlogInput } from '@betaversionio/shared';
import { BlogStatus } from '@betaversionio/shared';
import { AvatarUpload } from '@/components/patterns/p-file-upload-2';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { slugify } from '@/lib/utils';
import { X } from 'lucide-react';

interface BlogMainInfoSectionProps {
  form: UseFormReturn<CreateBlogInput>;
}

export function BlogMainInfoSection({ form }: BlogMainInfoSectionProps) {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const [tagInput, setTagInput] = useState('');

  const title = watch('title');
  const tags = watch('tags') ?? [];
  const status = watch('status');
  const coverImage = watch('coverImage');
  const content = watch('content') ?? '';
  const excerpt = watch('excerpt') ?? '';

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

  return (
    <div className="space-y-8">
      {/* Cover Image */}
      <FieldGroup>
        <Field data-invalid={!!errors.coverImage}>
          <AvatarUpload
            maxSize={5 * 1024 * 1024}
            rounded="md"
            defaultAvatar={coverImage}
            uploadFolder="blogs/covers"
            onUpload={(url) => setValue('coverImage', url)}
          />
          <FieldError>{errors.coverImage?.message}</FieldError>
        </Field>

        {/* Title */}
        <Field data-invalid={!!errors.title}>
          <FieldLabel htmlFor="title">Title</FieldLabel>
          <Input
            id="title"
            placeholder="My Awesome Blog Post"
            value={title}
            onChange={handleTitleChange}
          />
          <FieldError>{errors.title?.message}</FieldError>
        </Field>

        {/* Slug */}
        <Field data-invalid={!!errors.slug}>
          <FieldLabel htmlFor="slug">Slug</FieldLabel>
          <Input
            id="slug"
            placeholder="my-awesome-blog-post"
            {...register('slug')}
          />
          <FieldDescription>
            Auto-generated from title. Used in the blog URL.
          </FieldDescription>
          <FieldError>{errors.slug?.message}</FieldError>
        </Field>

        {/* Excerpt */}
        <Field data-invalid={!!errors.excerpt}>
          <FieldLabel htmlFor="excerpt">Excerpt</FieldLabel>
          <Textarea
            id="excerpt"
            placeholder="A short summary of your blog post..."
            value={excerpt}
            onChange={(e) => setValue('excerpt', e.target.value)}
            rows={3}
          />
          <FieldDescription>
            Brief summary shown in blog listings (max 500 characters).
          </FieldDescription>
          <FieldError>{errors.excerpt?.message}</FieldError>
        </Field>
      </FieldGroup>

      <Separator />

      {/* Content */}
      <FieldGroup>
        <Field data-invalid={!!errors.content}>
          <FieldTitle>Content</FieldTitle>
          <FieldDescription>
            Write your blog post content using Markdown.
          </FieldDescription>
          <MarkdownEditor
            value={content}
            onChange={(val) => setValue('content', val)}
            placeholder="Start writing your blog post..."
            outputFormat="markdown"
            height={400}
            maxHeight={600}
          />
          <FieldError>{errors.content?.message}</FieldError>
        </Field>
      </FieldGroup>

      <Separator />

      {/* Tags & Status */}
      <FieldGroup>
        <Field>
          <FieldTitle>Tags</FieldTitle>
          <FieldDescription>
            Categorize your blog post so others can discover it.
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

        <Field>
          <FieldLabel>Status</FieldLabel>
          <Select
            value={status}
            onValueChange={(value) => setValue('status', value as BlogStatus)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.values(BlogStatus).map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </FieldGroup>
    </div>
  );
}
