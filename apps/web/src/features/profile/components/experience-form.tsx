'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateExperienceSchema, EmploymentType } from '@betaversionio/shared';
import type { UpdateExperienceInput } from '@betaversionio/shared';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Field, FieldLabel } from '@/components/ui/field';
import { Plus, Trash2 } from 'lucide-react';

const employmentTypeLabels: Record<EmploymentType, string> = {
  [EmploymentType.FullTime]: 'Full-time',
  [EmploymentType.PartTime]: 'Part-time',
  [EmploymentType.Contract]: 'Contract',
  [EmploymentType.Freelance]: 'Freelance',
  [EmploymentType.Internship]: 'Internship',
};

export function ExperienceForm() {
  const { toast } = useToast();

  const form = useForm<UpdateExperienceInput>({
    resolver: zodResolver(updateExperienceSchema),
    defaultValues: {
      items: [
        {
          company: '',
          position: '',
          location: '',
          employmentType: EmploymentType.FullTime,
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
    mutationFn: (data: UpdateExperienceInput) =>
      apiClient.patch('/users/me/experience', data),
    onSuccess: () => {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Experience</CardTitle>
        <CardDescription>Add your work experience</CardDescription>
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
                  Experience #{index + 1}
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
                  <FieldLabel>Company</FieldLabel>
                  <Input
                    placeholder="Acme Inc."
                    {...form.register(`items.${index}.company`)}
                  />
                </Field>
                <Field>
                  <FieldLabel>Position</FieldLabel>
                  <Input
                    placeholder="Senior Developer"
                    {...form.register(`items.${index}.position`)}
                  />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel>Location</FieldLabel>
                  <Input
                    placeholder="San Francisco, CA"
                    {...form.register(`items.${index}.location`)}
                  />
                </Field>
                <Field>
                  <FieldLabel>Employment Type</FieldLabel>
                  <Select
                    value={form.watch(`items.${index}.employmentType`)}
                    onValueChange={(value) =>
                      form.setValue(
                        `items.${index}.employmentType`,
                        value as EmploymentType,
                      )
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
                  id={`exp-current-${index}`}
                  checked={form.watch(`items.${index}.current`)}
                  onCheckedChange={(checked) =>
                    form.setValue(`items.${index}.current`, !!checked)
                  }
                />
                <label htmlFor={`exp-current-${index}`} className="text-sm">
                  Currently working here
                </label>
              </div>

              <Field>
                <FieldLabel>Description</FieldLabel>
                <Textarea
                  placeholder="Key responsibilities and achievements..."
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
                company: '',
                position: '',
                location: '',
                employmentType: EmploymentType.FullTime,
                startDate: '',
                current: false,
                description: '',
              })
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Experience
          </Button>

          <div className="pt-2">
            <Button type="submit" isLoading={mutation.isPending}>
              Save Experience
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
