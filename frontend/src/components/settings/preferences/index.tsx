'use client';

import { useEffect } from 'react';
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
import { useUserStore } from '@/stores/use-user-store';
import { ProfileAPIApi } from '@/generated-api';

interface FormValues {
  file_upload_completed?: boolean;
  model_train_completed?: boolean;
  model_run_completed?: boolean;
  new_comments?: boolean;
}

interface PreferencesProps {
  defaultValues: FormValues;
  api: ProfileAPIApi;
}
export default function Preferences({ defaultValues, api }: PreferencesProps) {
  const form = useForm<FormValues>({
    defaultValues,
  });

  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues]);

  const formItems = [
    {
      name: 'file_upload_completed' as const,
      label: 'File Upload Completed',
      description: 'Notify when a file upload is done.',
    },
    {
      name: 'model_train_completed' as const,
      label: 'Model Train Completed',
      description: 'Notify when model train is complete.',
    },
    {
      name: 'model_run_completed' as const,
      label: 'Model Run Completed',
      description: 'Notify when model run is complete.',
    },
    {
      name: 'new_comments' as const,
      label: 'New Comments',
      description: 'Notify when someone comments on my shared model.',
    },
  ];

  async function onSubmit(data: FormValues) {
    const payload = {
      settings: [
        {
          type: 'File Upload Completed',
          enabled: data.file_upload_completed ?? false,
        },
        {
          type: 'Model Train Completed',
          enabled: data.model_train_completed ?? false,
        },
        {
          type: 'Model Run Completed',
          enabled: data.model_run_completed ?? false,
        },
        {
          type: 'New Comments',
          enabled: data.new_comments ?? false,
        },
      ],
    };

    try {
      await api.updateNotificationSettings({
        updateNotificationSettingsRequestDto: payload,
      });

      const updatedUser = await api.getUserSettings();
      useUserStore.getState().setUser(updatedUser);
      toast.success('Preferences updated successfully!');
    } catch (err) {
      toast.error('Failed to update preferences. Please try again.');
    }
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
