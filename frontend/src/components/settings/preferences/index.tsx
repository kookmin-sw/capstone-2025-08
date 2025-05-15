'use client';

import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface FormValues {
  file_upload_completed?: boolean;
  model_analysis_completed?: boolean;
  new_comments?: boolean;
}

interface PreferencesProps {
  defaultValues: FormValues;
}
export default function Preferences({ defaultValues }: PreferencesProps) {
  const form = useForm<FormValues>({
    defaultValues,
  });

  const formItems = [
    {
      name: 'file_upload_completed' as const,
      label: 'File Upload Completed',
      description: 'Notify when a file upload is done.',
    },
    {
      name: 'model_analysis_completed' as const,
      label: 'Model Analysis Completed',
      description: 'Notify when model analysis is complete.',
    },
    {
      name: 'new_comments' as const,
      label: 'New Comments',
      description: 'Notify when someone comments on my shared model.',
    },
  ];

  function onSubmit(data: FormValues) {
    toast('Your preferences have been updated.');
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
        <div>
          <div className="space-y-4">
            {formItems.map((item) => (
              <FormField
                key={item.name}
                control={form.control}
                name={item.name}
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">{item.label}</FormLabel>
                      <FormDescription>{item.description}</FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange}
                        className="cursor-pointer"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            ))}
          </div>
        </div>
        <div className="flex justify-end">
          <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </Form>
  );
}
