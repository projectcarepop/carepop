import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Path, FieldValues } from 'react-hook-form';
import * as z from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

type FieldConfig<T extends FieldValues> = {
  [K in keyof T]?: {
    label?: string;
    description?: string;
    fieldType?: 'textarea' | 'checkbox' | 'text' | 'email' | 'password' | 'number' | 'date';
    placeholder?: string;
  };
};

type AutoFormProps<S extends z.ZodRawShape> = {
  formSchema: z.ZodObject<S>;
  onSubmit: (values: z.infer<z.ZodObject<S>>) => void;
  fieldConfig?: FieldConfig<z.infer<z.ZodObject<S>>>;
  formTitle?: string;
  formDescription?: string;
  submitButtonText?: string;
  initialValues?: Partial<z.infer<z.ZodObject<S>>>;
};

export function AutoForm<S extends z.ZodRawShape>({
  formSchema,
  onSubmit,
  fieldConfig = {},
  formTitle,
  formDescription,
  submitButtonText = 'Submit',
  initialValues,
}: AutoFormProps<S>) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues ?? ({} as any),
  });

  const objectSchema = formSchema;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {formTitle && <h2 className="text-2xl font-semibold">{formTitle}</h2>}
        {formDescription && <p className="text-muted-foreground">{formDescription}</p>}

        {Object.keys(objectSchema.shape).map((key) => {
          const {
            label,
            description,
            fieldType: rawFieldType,
            placeholder,
          } = fieldConfig[key] || {};
          const fieldType = rawFieldType || 'text';

          return (
            <FormField
              control={form.control}
              name={key as Path<z.infer<z.ZodObject<S>>>}
              key={key}
              render={({ field }) => {
                const value = field.value;
                return (
                  <FormItem>
                    <FormLabel>{label || key.charAt(0).toUpperCase() + key.slice(1)}</FormLabel>
                    <FormControl>
                      {fieldType === 'textarea' ? (
                        <Textarea placeholder={placeholder} {...field} value={value as string} />
                      ) : fieldType === 'checkbox' ? (
                        <Checkbox checked={!!value} onCheckedChange={field.onChange} />
                      ) : (
                        <Input type={fieldType} placeholder={placeholder} {...field} value={value as string} />
                      )}
                    </FormControl>
                    {description && <FormDescription>{description}</FormDescription>}
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          );
        })}
        <Button type="submit">{submitButtonText}</Button>
      </form>
    </Form>
  );
}
