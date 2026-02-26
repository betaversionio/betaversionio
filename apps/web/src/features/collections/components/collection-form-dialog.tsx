'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createCollectionSchema } from '@betaversionio/shared';
import { FormDialog } from '@/components/ui/form-dialog';
import { Input } from '@/components/ui/input';
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
  FieldDescription,
} from '@/components/ui/field';
import { MarkdownEditor } from '@/components/ui/markdown-editor';
import { Eye, EyeSlash } from 'iconsax-react';

const collectionFormSchema = createCollectionSchema.pick({
  title: true,
  description: true,
  isPublic: true,
});

export interface CollectionFormValues {
  title: string;
  description?: string;
  isPublic?: boolean;
}

interface CollectionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dialogTitle: string;
  submitLabel: string;
  defaultValues: CollectionFormValues;
  isPending: boolean;
  onSubmit: (data: CollectionFormValues) => Promise<void>;
}

export function CollectionFormDialog({
  open,
  onOpenChange,
  dialogTitle,
  submitLabel,
  defaultValues,
  isPending,
  onSubmit,
}: CollectionFormDialogProps) {
  const form = useForm<CollectionFormValues>({
    resolver: zodResolver(collectionFormSchema),
    defaultValues,
  });

  const isPublic = form.watch('isPublic');
  const description = form.watch('description');

  useEffect(() => {
    if (open) {
      form.reset(defaultValues);
    }
  }, [open, defaultValues, form]);

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={dialogTitle}
      submitLabel={submitLabel}
      isPending={isPending}
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <FieldGroup>
        <Field>
          <FieldLabel>Title</FieldLabel>
          <Input placeholder="Collection title" {...form.register('title')} />
          <FieldError errors={[form.formState.errors.title]} />
        </Field>
        <Field>
          <FieldLabel>Description</FieldLabel>
          <MarkdownEditor
            value={description ?? ''}
            onChange={(val) => form.setValue('description', val)}
            placeholder="Describe this collection..."
            height={160}
            maxHeight={300}
            outputFormat="html"
          />
          <FieldError errors={[form.formState.errors.description]} />
        </Field>
        <Field orientation="horizontal">
          <FieldLabel
            className="cursor-pointer"
            onClick={() => form.setValue('isPublic', !isPublic)}
          >
            <span className="flex items-center gap-1.5">
              {isPublic ? (
                <Eye size={14} color="currentColor" />
              ) : (
                <EyeSlash size={14} color="currentColor" />
              )}
              {isPublic ? 'Public' : 'Private'}
            </span>
            <FieldDescription>
              {isPublic
                ? 'Anyone can see this collection'
                : 'Only you can see this collection'}
            </FieldDescription>
          </FieldLabel>
          <button
            type="button"
            role="switch"
            aria-checked={isPublic}
            onClick={() => form.setValue('isPublic', !isPublic)}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
              isPublic ? 'bg-primary' : 'bg-muted'
            }`}
          >
            <span
              className={`pointer-events-none block h-4 w-4 rounded-full bg-background shadow-sm transition-transform ${
                isPublic ? 'translate-x-[18px]' : 'translate-x-0.5'
              }`}
            />
          </button>
        </Field>
      </FieldGroup>
    </FormDialog>
  );
}
