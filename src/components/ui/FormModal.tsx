import { Button, Select, SimpleGrid, Stack, Text, TextInput } from '@mantine/core';
import { modals } from '@mantine/modals';
import { useState, type ReactNode } from 'react';

export interface FormField {
  name: string;
  label: string;
  type?: 'text' | 'number' | 'select';
  defaultValue?: string | number;
  options?: (string | { value: string; label: string })[];
  placeholder?: string;
  required?: boolean;
  full?: boolean;
}

export type FormValues = Record<string, string>;

export interface FormOptions {
  title: ReactNode;
  intro?: ReactNode;
  fields: FormField[];
  submitLabel: string;
  /** Return an error message to keep the form open. */
  onSubmit: (values: FormValues) => string | void;
}

export function FormModal({ intro, fields, submitLabel, onSubmit, modalId }: FormOptions & { modalId: string }) {
  const [values, setValues] = useState<FormValues>(() =>
    Object.fromEntries(fields.map((f) => [f.name, String(f.defaultValue ?? '')])),
  );
  const [error, setError] = useState('');
  const set = (name: string, value: string) => setValues((v) => ({ ...v, [name]: value }));

  const submit = () => {
    const missing = fields.find((f) => f.required && !values[f.name].trim());
    if (missing) return setError(`${missing.label} is required`);
    const result = onSubmit(values);
    if (result) return setError(result);
    modals.close(modalId);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <Stack>
        {intro}
        <SimpleGrid cols={fields.length > 1 ? 2 : 1}>
          {fields.map((f, i) => {
            const common = {
              label: f.label,
              placeholder: f.placeholder,
              withAsterisk: f.required,
              style: f.full || (fields.length % 2 === 1 && i === fields.length - 1) ? { gridColumn: '1 / -1' } : undefined,
              'data-autofocus': i === 0 || undefined,
            };
            return f.type === 'select' ? (
              <Select key={f.name} {...common} data={f.options ?? []} value={values[f.name]} onChange={(v) => set(f.name, v ?? '')} allowDeselect={false} />
            ) : (
              <TextInput key={f.name} {...common} type={f.type === 'number' ? 'number' : 'text'} step="any" value={values[f.name]} onChange={(e) => set(f.name, e.currentTarget.value)} />
            );
          })}
        </SimpleGrid>
        {error && (
          <Text c="red" fz="sm">
            {error}
          </Text>
        )}
        <Button type="submit" size="md">
          {submitLabel}
        </Button>
      </Stack>
    </form>
  );
}
