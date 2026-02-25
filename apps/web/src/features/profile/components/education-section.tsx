'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { EducationItemInput } from '@devcom/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';
import { profileKeys } from '@/hooks/queries';
import type { FullProfile } from '@/hooks/queries';
import { formatDateRange } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldLabel } from '@/components/ui/field';
import { FormDialog } from '@/components/ui/form-dialog';
import { ItemCard } from './item-card';
import { Teacher, Add } from 'iconsax-react';
import { z } from 'zod/v4';

const educationItemSchema = z.object({
  institution: z.string().min(1).max(200),
  degree: z.string().min(1).max(200),
  fieldOfStudy: z.string().max(200).optional(),
  startDate: z.string().min(1),
  endDate: z.string().optional(),
  current: z.boolean(),
  description: z.string().max(2000).optional(),
});

type EducationItem = FullProfile['education'][number];

interface EducationSectionProps {
  items: EducationItem[];
}

export function EducationSection({ items: initialItems }: EducationSectionProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [items, setItems] = useState<EducationItem[]>(initialItems);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const form = useForm<EducationItemInput>({
    resolver: zodResolver(educationItemSchema),
    defaultValues: {
      institution: '',
      degree: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
    },
  });

  const mutation = useMutation({
    mutationFn: (data: { items: EducationItemInput[] }) =>
      apiClient.patch('/users/me/education', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.me() });
      toast({ title: 'Education updated' });
    },
    onError: (error) => {
      toast({
        title: 'Update failed',
        description:
          error instanceof Error ? error.message : 'Failed to update education.',
        variant: 'destructive',
      });
    },
  });

  function openAdd() {
    setEditingIndex(null);
    form.reset({
      institution: '',
      degree: '',
      fieldOfStudy: '',
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
      institution: item.institution,
      degree: item.degree,
      fieldOfStudy: item.fieldOfStudy ?? '',
      startDate: item.startDate,
      endDate: item.endDate ?? '',
      current: item.current,
      description: item.description ?? '',
    });
    setDialogOpen(true);
  }

  function handleSave(data: EducationItemInput) {
    const newItem: EducationItem = {
      id: editingIndex !== null ? items[editingIndex]!.id : crypto.randomUUID(),
      institution: data.institution,
      degree: data.degree,
      fieldOfStudy: data.fieldOfStudy ?? null,
      startDate: data.startDate,
      endDate: data.endDate ?? null,
      current: data.current,
      description: data.description ?? null,
    };

    let newItems: EducationItem[];
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
        fieldOfStudy: rest.fieldOfStudy ?? undefined,
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
        fieldOfStudy: rest.fieldOfStudy ?? undefined,
        description: rest.description ?? undefined,
        endDate: rest.endDate ?? undefined,
      })),
    });
  }

  return (
    <div className="space-y-4">
      {items.length === 0 && (
        <p className="text-sm text-muted-foreground">No education added yet.</p>
      )}

      {items.map((item, index) => (
        <ItemCard
          key={item.id}
          icon={<Teacher size={20} color="currentColor" variant="Bulk" />}
          title={item.degree}
          subtitle={item.institution}
          meta={item.fieldOfStudy ?? undefined}
          dateRange={formatDateRange(item.startDate, item.endDate, item.current)}
          description={item.description}
          onEdit={() => openEdit(index)}
          onDelete={() => handleDelete(index)}
        />
      ))}

      <Button type="button" variant="outline" size="sm" onClick={openAdd}>
        <Add size={16} color="currentColor" className="mr-2" />
        Add Education
      </Button>

      <FormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editingIndex !== null ? 'Edit Education' : 'Add Education'}
        submitLabel={editingIndex !== null ? 'Save Changes' : 'Add'}
        isPending={mutation.isPending}
        onSubmit={form.handleSubmit(handleSave)}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel>Institution</FieldLabel>
            <Input placeholder="MIT" {...form.register('institution')} />
          </Field>
          <Field>
            <FieldLabel>Degree</FieldLabel>
            <Input placeholder="B.S. Computer Science" {...form.register('degree')} />
          </Field>
        </div>

        <Field>
          <FieldLabel>Field of Study</FieldLabel>
          <Input
            placeholder="Computer Science"
            {...form.register('fieldOfStudy')}
          />
        </Field>

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
            id="edu-current"
            checked={form.watch('current')}
            onCheckedChange={(checked) => form.setValue('current', !!checked)}
          />
          <label htmlFor="edu-current" className="text-sm">
            Currently studying here
          </label>
        </div>

        <Field>
          <FieldLabel>Description</FieldLabel>
          <Textarea
            placeholder="Activities, achievements, etc."
            rows={3}
            {...form.register('description')}
          />
        </Field>
      </FormDialog>
    </div>
  );
}
