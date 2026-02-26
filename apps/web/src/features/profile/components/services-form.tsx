'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateServicesSchema } from '@betaversionio/shared';
import type { UpdateServicesInput } from '@betaversionio/shared';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Field, FieldLabel } from '@/components/ui/field';
import { Plus, Trash2 } from 'lucide-react';

export function ServicesForm() {
  const { toast } = useToast();

  const form = useForm<UpdateServicesInput>({
    resolver: zodResolver(updateServicesSchema),
    defaultValues: {
      items: [
        {
          title: '',
          description: '',
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const mutation = useMutation({
    mutationFn: (data: UpdateServicesInput) =>
      apiClient.patch('/users/me/services', data),
    onSuccess: () => {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Services</CardTitle>
        <CardDescription>
          List the services you offer as a developer
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
          className="space-y-4"
        >
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-start gap-3">
              <div className="grid flex-1 gap-3 sm:grid-cols-2">
                <Field>
                  <FieldLabel>Title</FieldLabel>
                  <Input
                    placeholder="Full-Stack Development"
                    {...form.register(`items.${index}.title`)}
                  />
                </Field>
                <Field>
                  <FieldLabel>Description</FieldLabel>
                  <Textarea
                    placeholder="Building modern web applications..."
                    rows={1}
                    {...form.register(`items.${index}.description`)}
                  />
                </Field>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="mt-6"
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
              append({
                title: '',
                description: '',
              })
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Service
          </Button>

          <div className="pt-2">
            <Button type="submit" isLoading={mutation.isPending}>
              Save Services
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
