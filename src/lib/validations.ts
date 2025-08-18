import { z } from 'zod';

export const tweetUrlSchema = z.object({
  url: z.string()
    .min(1, 'Tweet URL is required')
    .regex(
      /^https?:\/\/(twitter\.com|x\.com)\/[A-Za-z0-9_]{1,15}\/status\/\d+/,
      'Please enter a valid Twitter/X URL'
    ),
});

export type TweetUrlSchema = z.infer<typeof tweetUrlSchema>;