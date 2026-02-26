'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateEducationSchema } from '@betaversionio/shared';
import type { UpdateEducationInput } from '@betaversionio/shared';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Field, FieldLabel } from '@/components/ui/field';
import { Plus, Trash2 } from 'lucide-react';

export function EducationForm() {
  const { toast } = useToast();

  const form = useForm<UpdateEducationInput>({
    resolver: zodResolver(updateEducationSchema),
    defaultValues: {
      items: [
        {
          institution: '',
          degree: '',
          fieldOfStudy: '',
          startDate: '',
          current: false,
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
    mutationFn: (data: UpdateEducationInput) =>
      apiClient.patch('/users/me/education', data),
    onSuccess: () => {
      toast({ title: 'Education updated' });
    },
    onError: (error) => {
      toast({
        title: 'Update failed',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to update education.',
        variant: 'destructive',
      });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Education</CardTitle>
        <CardDescription>Add your educational background</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
          className="space-y-6"
        >
          {fields.map((field, index) => (
            <div key={field.id} className="space-y-4 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Education #{index + 1}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel>Institution</FieldLabel>
                  <Input
                    placeholder="MIT"
                    {...form.register(`items.${index}.institution`)}
                  />
                </Field>
                <Field>
                  <FieldLabel>Degree</FieldLabel>
                  <Input
                    placeholder="B.S. Computer Science"
                    {...form.register(`items.${index}.degree`)}
                  />
                </Field>
              </div>

              <Field>
                <FieldLabel>Field of Study</FieldLabel>
                <Input
                  placeholder="Computer Science"
                  {...form.register(`items.${index}.fieldOfStudy`)}
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel>Start Date</FieldLabel>
                  <DatePicker
                    value={form.watch(`items.${index}.startDate`)}
                    onChange={(val) =>
                      form.setValue(`items.${index}.startDate`, val)
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel>End Date</FieldLabel>
                  <DatePicker
                    value={form.watch(`items.${index}.endDate`)}
                    onChange={(val) =>
                      form.setValue(`items.${index}.endDate`, val)
                    }
                    disabled={form.watch(`items.${index}.current`)}
                  />
                </Field>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id={`edu-current-${index}`}
                  checked={form.watch(`items.${index}.current`)}
                  onCheckedChange={(checked) =>
                    form.setValue(`items.${index}.current`, !!checked)
                  }
                />
                <label htmlFor={`edu-current-${index}`} className="text-sm">
                  Currently studying here
                </label>
              </div>

              <Field>
                <FieldLabel>Description</FieldLabel>
                <Textarea
                  placeholder="Activities, achievements, etc."
                  rows={3}
                  {...form.register(`items.${index}.description`)}
                />
              </Field>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              append({
                institution: '',
                degree: '',
                fieldOfStudy: '',
                startDate: '',
                current: false,
                description: '',
              })
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Education
          </Button>

          <div className="pt-2">
            <Button type="submit" isLoading={mutation.isPending}>
              Save Education
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
