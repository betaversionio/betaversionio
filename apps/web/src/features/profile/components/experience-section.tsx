'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EmploymentType } from '@betaversionio/shared';
import type { ExperienceItemInput } from '@betaversionio/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';
import { profileKeys } from '@/hooks/queries';
import type { FullProfile } from '@/hooks/queries';
import { formatDateRange } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MarkdownEditor } from '@/components/ui/markdown-editor';
import { DatePicker } from '@/components/ui/date-picker';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Field, FieldLabel } from '@/components/ui/field';
import { FormDialog } from '@/components/ui/form-dialog';
import { ItemCard } from './item-card';
import { Briefcase, Add } from 'iconsax-react';
import { z } from 'zod/v4';

const employmentTypeLabels: Record<EmploymentType, string> = {
  [EmploymentType.FullTime]: 'Full-time',
  [EmploymentType.PartTime]: 'Part-time',
  [EmploymentType.Contract]: 'Contract',
  [EmploymentType.Freelance]: 'Freelance',
  [EmploymentType.Internship]: 'Internship',
};

const experienceItemSchema = z.object({
  company: z.string().min(1).max(200),
  position: z.string().min(1).max(200),
  location: z.string().max(200).optional(),
  employmentType: z.nativeEnum(EmploymentType),
  startDate: z.string().min(1),
  endDate: z.string().optional(),
  current: z.boolean(),
  description: z.string().max(2000).optional(),
});

type ExperienceItem = FullProfile['experiences'][number];

interface ExperienceSectionProps {
  items: ExperienceItem[];
}

export function ExperienceSection({
  items: initialItems,
}: ExperienceSectionProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [items, setItems] = useState<ExperienceItem[]>(initialItems);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const form = useForm<ExperienceItemInput>({
    resolver: zodResolver(experienceItemSchema),
    defaultValues: {
      company: '',
      position: '',
      location: '',
      employmentType: EmploymentType.FullTime,
      startDate: '',
      endDate: '',
      current: false,
      description: '',
    },
  });

  const mutation = useMutation({
    mutationFn: (data: { items: ExperienceItemInput[] }) =>
      apiClient.patch('/users/me/experience', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.me() });
      toast({ title: 'Experience updated' });
    },
    onError: (error) => {
      toast({
        title: 'Update failed',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to update experience.',
        variant: 'destructive',
      });
    },
  });

  function openAdd() {
    setEditingIndex(null);
    form.reset({
      company: '',
      position: '',
      location: '',
      employmentType: EmploymentType.FullTime,
      startDate: '',
      endDate: '',
      current: false,
      description: '',
    });
    setDialogOpen(true);
  }

  function openEdit(index: number) {
    const item = items[index]!;
    setEditingIndex(index);
    form.reset({
      company: item.company,
      position: item.position,
      location: item.location ?? '',
      employmentType: item.employmentType as EmploymentType,
      startDate: item.startDate,
      endDate: item.endDate ?? '',
      current: item.current,
      description: item.description ?? '',
    });
    setDialogOpen(true);
  }

  function handleSave(data: ExperienceItemInput) {
    const newItem: ExperienceItem = {
      id: editingIndex !== null ? items[editingIndex]!.id : crypto.randomUUID(),
      company: data.company,
      position: data.position,
      location: data.location ?? null,
      employmentType: data.employmentType,
      startDate: data.startDate,
      endDate: data.endDate ?? null,
      current: data.current,
      description: data.description ?? null,
    };

    let newItems: ExperienceItem[];
    if (editingIndex !== null) {
      newItems = items.map((item, i) => (i === editingIndex ? newItem : item));
    } else {
      newItems = [...items, newItem];
    }

    setItems(newItems);
    setDialogOpen(false);
    mutation.mutate({
      items: newItems.map(({ id, ...rest }) => ({
        ...rest,
        employmentType: rest.employmentType as EmploymentType,
        location: rest.location ?? undefined,
        description: rest.description ?? undefined,
        endDate: rest.endDate ?? undefined,
      })),
    });
  }

  function handleDelete(index: number) {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    mutation.mutate({
      items: newItems.map(({ id, ...rest }) => ({
        ...rest,
        employmentType: rest.employmentType as EmploymentType,
        location: rest.location ?? undefined,
        description: rest.description ?? undefined,
        endDate: rest.endDate ?? undefined,
      })),
    });
  }

  return (
    <div className="space-y-4">
      {items.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No experience added yet.
        </p>
      )}

      {items.map((item, index) => (
        <ItemCard
          key={item.id}
          icon={<Briefcase size={20} color="currentColor" variant="Bulk" />}
          title={item.position}
          subtitle={item.company}
          meta={
            employmentTypeLabels[item.employmentType as EmploymentType] ??
            item.employmentType
          }
          dateRange={formatDateRange(
            item.startDate,
            item.endDate,
            item.current,
          )}
          description={item.description}
          onEdit={() => openEdit(index)}
          onDelete={() => handleDelete(index)}
        />
      ))}

      <Button type="button" variant="outline" size="sm" onClick={openAdd}>
        <Add size={16} color="currentColor" className="mr-2" />
        Add Experience
      </Button>

      <FormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editingIndex !== null ? 'Edit Experience' : 'Add Experience'}
        submitLabel={editingIndex !== null ? 'Save Changes' : 'Add'}
        isPending={mutation.isPending}
        onSubmit={form.handleSubmit(handleSave)}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel>Company</FieldLabel>
            <Input placeholder="Acme Inc." {...form.register('company')} />
          </Field>
          <Field>
            <FieldLabel>Position</FieldLabel>
            <Input
              placeholder="Senior Developer"
              {...form.register('position')}
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel>Location</FieldLabel>
            <Input
              placeholder="San Francisco, CA"
              {...form.register('location')}
            />
          </Field>
          <Field>
            <FieldLabel>Employment Type</FieldLabel>
            <Select
              value={form.watch('employmentType')}
              onValueChange={(value) =>
                form.setValue('employmentType', value as EmploymentType)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(EmploymentType).map((type) => (
                  <SelectItem key={type} value={type}>
                    {employmentTypeLabels[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel>Start Date</FieldLabel>
            <DatePicker
              value={form.watch('startDate')}
              onChange={(val) => form.setValue('startDate', val)}
            />
          </Field>
          <Field>
            <FieldLabel>End Date</FieldLabel>
            <DatePicker
              value={form.watch('endDate')}
              onChange={(val) => form.setValue('endDate', val)}
              disabled={form.watch('current')}
            />
          </Field>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="exp-current"
            checked={form.watch('current')}
            onCheckedChange={(checked) => form.setValue('current', !!checked)}
          />
          <label htmlFor="exp-current" className="text-sm">
            Currently working here
          </label>
        </div>

        <Field>
          <FieldLabel>Description</FieldLabel>
          <MarkdownEditor
            value={form.watch('description') ?? ''}
            onChange={(val) => form.setValue('description', val, { shouldDirty: true })}
            placeholder="Key responsibilities and achievements..."
            height={150}
            outputFormat="markdown"
          />
        </Field>
      </FormDialog>
    </div>
  );
}
