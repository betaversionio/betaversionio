'use client';

import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  updateTechStackSchema,
  TechCategory,
  Proficiency,
} from '@devcom/shared';
import type { UpdateTechStackInput } from '@devcom/shared';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Field, FieldLabel } from '@/components/ui/field';
import { Plus, Trash2 } from 'lucide-react';

interface TechStackFormProps {
  initialData?: Array<{
    name: string;
    category: string;
    proficiency: string;
  }>;
}

export function TechStackForm({ initialData }: TechStackFormProps = {}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<UpdateTechStackInput>({
    resolver: zodResolver(updateTechStackSchema),
    defaultValues: {
      items: [
        {
          name: '',
          category: TechCategory.Language,
          proficiency: Proficiency.Intermediate,
        },
      ],
    },
  });

  useEffect(() => {
    if (initialData && initialData.length > 0) {
      form.reset({
        items: initialData.map((t) => ({
          name: t.name,
          category: t.category as TechCategory,
          proficiency: t.proficiency as Proficiency,
        })),
      });
    }
  }, [initialData, form]);

  const {
    fields: techFields,
    append,
    remove,
  } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const mutation = useMutation({
    mutationFn: (data: UpdateTechStackInput) =>
      apiClient.patch('/users/me/tech-stack', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.me() });
      toast({ title: 'Tech stack updated' });
    },
    onError: (error) => {
      toast({
        title: 'Update failed',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to update tech stack.',
        variant: 'destructive',
      });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tech Stack</CardTitle>
        <CardDescription>List the technologies you work with</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
          className="space-y-4"
        >
          {techFields.map((field, index) => (
            <div key={field.id} className="flex items-end gap-3">
              <Field className="flex-1">
                <FieldLabel>Name</FieldLabel>
                <Input
                  placeholder="React"
                  {...form.register(`items.${index}.name`)}
                />
              </Field>
              <Field className="w-36">
                <FieldLabel>Category</FieldLabel>
                <Select
                  value={form.watch(`items.${index}.category`)}
                  onValueChange={(value) =>
                    form.setValue(
                      `items.${index}.category`,
                      value as TechCategory,
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(TechCategory).map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field className="w-36">
                <FieldLabel>Proficiency</FieldLabel>
                <Select
                  value={form.watch(`items.${index}.proficiency`)}
                  onValueChange={(value) =>
                    form.setValue(
                      `items.${index}.proficiency`,
                      value as Proficiency,
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(Proficiency).map((prof) => (
                      <SelectItem key={prof} value={prof}>
                        {prof}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              append({
                name: '',
                category: TechCategory.Language,
                proficiency: Proficiency.Intermediate,
              })
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Technology
          </Button>

          <div className="pt-2">
            <Button type="submit" isLoading={mutation.isPending}>
              Save Tech Stack
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
