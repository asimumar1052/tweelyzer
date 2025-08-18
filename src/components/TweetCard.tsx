import { ExternalLink, Heart, MessageCircle, Repeat2, Bookmark, Quote, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { XIcon } from './icons/XIcon';
import { formatRelativeTime, formatExactTime, parseTwitterDate } from '@/lib/date-utils';
import type { AnalyzeTweetResponse } from '@/types/api';

interface TweetCardProps {
  data: AnalyzeTweetResponse;
}

export function TweetCard({ data }: TweetCardProps) {
  const createdAt = parseTwitterDate(data.created_at);
  const tweetUrl = `https://x.com/${data.author.screen_name}/status/${data.id}`;

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <Card className="tweet-card h-fit">
      <CardHeader className="pb-2">
        <div className="flex items-start gap-3">
          <Avatar className="w-10 h-10 flex-shrink-0">
            <AvatarImage src={data.author.image} alt={data.author.name} />
            <AvatarFallback>{data.author.name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-foreground truncate text-sm">{data.author.name}</h3>
              {data.author.blue_verified && (
                <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
              )}
              <span className="text-muted-foreground text-sm">@{data.author.screen_name}</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-xs text-muted-foreground cursor-help">
                      {formatRelativeTime(createdAt)}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{formatExactTime(createdAt)}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                {data.lang.toUpperCase()}
              </Badge>
            </div>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <a href={tweetUrl} target="_blank" rel="noopener noreferrer">
              <XIcon className="w-4 h-4" size={16} />
            </a>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap line-clamp-4">
            {data.text}
          </p>
          
          {/* {data.media && (
            <div className="rounded-lg overflow-hidden border border-border">
              <img
                src={data.media}
                alt="Tweet media"
                className="w-full h-auto max-h-96 object-cover"
                loading="lazy"
              />
            </div>
          )} */}

          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="flex items-center gap-4 text-muted-foreground text-xs">
              <div className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                <span className="font-medium">{formatNumber(data.replies)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Repeat2 className="w-4 h-4" />
                <span className="font-medium">{formatNumber(data.retweets)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                <span className="font-medium">{formatNumber(data.likes)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Bookmark className="w-4 h-4" />
                <span className="font-medium">{formatNumber(data.bookmarks)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Quote className="w-4 h-4" />
                <span className="font-medium">{formatNumber(data.quotes)}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}