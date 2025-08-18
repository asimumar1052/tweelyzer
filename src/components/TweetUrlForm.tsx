import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { tweetUrlSchema, type TweetUrlSchema } from '@/lib/validations';

interface TweetUrlFormProps {
  onSubmit: (url: string) => Promise<void>;
  isLoading?: boolean;
}

export function TweetUrlForm({ onSubmit, isLoading = false }: TweetUrlFormProps) {
  const form = useForm<TweetUrlSchema>({
    resolver: zodResolver(tweetUrlSchema),
    defaultValues: {
      url: '',
    },
  });

  const handleSubmit = async (data: TweetUrlSchema) => {
    await onSubmit(data.url);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      placeholder="Paste a Twitter/X URL (e.g., https://x.com/username/status/123...)"
                      className="pr-12 h-12 text-base"
                      disabled={isLoading}
                    />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 text-base font-medium"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Analyzing Tweet...
              </>
            ) : (
              <>
                <Search className="mr-2 h-5 w-5" />
                Analyze Tweet
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}