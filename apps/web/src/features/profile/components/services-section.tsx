'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ServiceItemInput } from '@betaversionio/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';
import { profileKeys } from '@/hooks/queries';
import type { FullProfile } from '@/hooks/queries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Field, FieldLabel } from '@/components/ui/field';
import { FormDialog } from '@/components/ui/form-dialog';
import { ItemCard } from './item-card';
import { Setting2, Add } from 'iconsax-react';
import { z } from 'zod/v4';

const serviceItemSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

type ServiceItem = FullProfile['services'][number];

interface ServicesSectionProps {
  items: ServiceItem[];
}

export function ServicesSection({ items: initialItems }: ServicesSectionProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [items, setItems] = useState<ServiceItem[]>(initialItems);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const form = useForm<ServiceItemInput>({
    resolver: zodResolver(serviceItemSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  });

  const mutation = useMutation({
    mutationFn: (data: { items: ServiceItemInput[] }) =>
      apiClient.patch('/users/me/services', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.me() });
      toast({ title: 'Services updated' });
    },
    onError: (error) => {
      toast({
        title: 'Update failed',
        description:
          error instanceof Error ? error.message : 'Failed to update services.',
        variant: 'destructive',
      });
    },
  });

  function openAdd() {
    setEditingIndex(null);
    form.reset({ title: '', description: '' });
    setDialogOpen(true);
  }

  function openEdit(index: number) {
    const item = items[index]!;
    setEditingIndex(index);
    form.reset({
      title: item.title,
      description: item.description ?? '',
    });
    setDialogOpen(true);
  }

  function handleSave(data: ServiceItemInput) {
    const newItem: ServiceItem = {
      id: editingIndex !== null ? items[editingIndex]!.id : crypto.randomUUID(),
      title: data.title,
      description: data.description ?? null,
    };

    let newItems: ServiceItem[];
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
        description: rest.description ?? undefined,
      })),
    });
  }

  function handleDelete(index: number) {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    mutation.mutate({
      items: newItems.map(({ id, ...rest }) => ({
        ...rest,
        description: rest.description ?? undefined,
      })),
    });
  }

  return (
    <div className="space-y-4">
      {items.length === 0 && (
        <p className="text-sm text-muted-foreground">No services added yet.</p>
      )}

      {items.map((item, index) => (
        <ItemCard
          key={item.id}
          icon={<Setting2 size={20} color="currentColor" variant="Bulk" />}
          title={item.title}
          description={item.description}
          onEdit={() => openEdit(index)}
          onDelete={() => handleDelete(index)}
        />
      ))}

      <Button type="button" variant="outline" size="sm" onClick={openAdd}>
        <Add size={16} color="currentColor" className="mr-2" />
        Add Service
      </Button>

      <FormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editingIndex !== null ? 'Edit Service' : 'Add Service'}
        submitLabel={editingIndex !== null ? 'Save Changes' : 'Add'}
        isPending={mutation.isPending}
        onSubmit={form.handleSubmit(handleSave)}
      >
        <Field>
          <FieldLabel>Title</FieldLabel>
          <Input
            placeholder="Full-Stack Development"
            {...form.register('title')}
          />
        </Field>
        <Field>
          <FieldLabel>Description</FieldLabel>
          <Textarea
            placeholder="Building modern web applications..."
            rows={3}
            {...form.register('description')}
          />
        </Field>
      </FormDialog>
    </div>
  );
}
