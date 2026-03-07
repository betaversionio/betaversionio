'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  updateTechStackSchema,
  TechCategory,
  Proficiency,
} from '@betaversionio/shared';
import type { UpdateTechStackInput } from '@betaversionio/shared';
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
import { Field } from '@/components/ui/field';
import { Plus, Trash2 } from 'lucide-react';
import StackIcon from 'tech-stack-icons';
import { useTheme } from 'next-themes';
import { ALIASES, getTechIconName } from '@/lib/tech-icons';

const ALL_TECHS = Object.keys(ALIASES);

interface TechStackFormProps {
  initialData?: Array<{
    name: string;
    category: string;
    proficiency: string;
  }>;
}

function TechNameInput({
  value,
  onChange,
  onBlur,
  name,
}: {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  name: string;
}) {
  const { resolvedTheme } = useTheme();
  const variant = resolvedTheme === 'dark' ? 'dark' : 'light';
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  const suggestions = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return ALL_TECHS.filter((t) => t.includes(q)).slice(0, 6);
  }, [query]);

  function selectTech(tech: string) {
    setQuery(tech);
    onChange(tech);
    setOpen(false);
    inputRef.current?.focus();
  }

  const iconName = getTechIconName(value);

  return (
    <div className="relative">
      <div className="relative">
        {iconName && (
          <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 inline-flex h-4 w-4 shrink-0">
            <StackIcon name={iconName} variant={variant} />
          </span>
        )}
        <Input
          ref={inputRef}
          placeholder="React"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => query.trim() && setOpen(true)}
          onBlur={() => {
            setTimeout(() => setOpen(false), 200);
            onBlur();
          }}
          className={iconName ? 'pl-9' : undefined}
          name={name}
        />
      </div>

      {open && suggestions.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover p-1 shadow-md">
          {suggestions.map((tech) => {
            const icon = getTechIconName(tech);
            return (
              <button
                key={tech}
                type="button"
                className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                onMouseDown={(e) => {
                  e.preventDefault();
                  selectTech(tech);
                }}
              >
                {icon && (
                  <span className="inline-flex h-4 w-4 shrink-0">
                    <StackIcon name={icon} variant={variant} />
                  </span>
                )}
                {tech}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
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
                <TechNameInput
                  value={form.watch(`items.${index}.name`)}
                  onChange={(val) => form.setValue(`items.${index}.name`, val)}
                  onBlur={() => form.trigger(`items.${index}.name`)}
                  name={`items.${index}.name`}
                />
              </Field>
              <Field className="w-36">
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
