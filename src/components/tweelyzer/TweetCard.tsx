import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CalendarDays, Heart, Repeat2, MessageCircle, BadgeCheck, Link2 } from "lucide-react";

interface Author {
  image?: string;
  name?: string;
  screen_name?: string;
  blue_verified?: boolean;
}

interface TweetDataProps {
  text?: string;
  author?: Author;
  date?: string;
  likes?: number;
  retweets?: number;
  replies?: number;
}

interface Props {
  data: TweetDataProps;
  tweetUrl?: string;
}

export function TweetCard({ data, tweetUrl }: Props) {
  const author = data?.author ?? {};
  const initials = (author?.name || author?.screen_name || "?")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const metric = (n: number | undefined) =>
    typeof n === "number" ? n.toLocaleString() : "N/A";

  return (
    <Card className="border bg-card text-card-foreground shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={author?.image} alt={`${author?.name || author?.screen_name || "Author"} avatar`} loading="lazy" />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-semibold leading-none">{author?.name || author?.screen_name || "Unknown"}</span>
              {author?.blue_verified ? (
                <BadgeCheck className="h-4 w-4 text-primary" aria-label="Verified account" />
              ) : null}
            </div>
            {author?.screen_name && (
              <p className="text-sm text-muted-foreground">@{author.screen_name}</p>
            )}
          </div>
        </div>
        {tweetUrl ? (
          <Button variant="ghost" size="sm" asChild>
            <a href={tweetUrl} target="_blank" rel="noopener noreferrer" aria-label="Open original tweet">
              <Link2 className="h-4 w-4" />
            </a>
          </Button>
        ) : null}
      </CardHeader>

      <CardContent>
        <div className="rounded-lg border-l-4 border-primary bg-background p-4 shadow-sm">
          <p className="text-base leading-relaxed">{data?.text || "N/A"}</p>
        </div>
      </CardContent>

      <CardFooter className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4" />
          <span>{data?.date || "N/A"}</span>
        </div>
        <div className="flex items-center gap-2">
          <Heart className="h-4 w-4" />
          <span>{metric(data?.likes)} Likes</span>
        </div>
        <div className="flex items-center gap-2">
          <Repeat2 className="h-4 w-4" />
          <span>{metric(data?.retweets)} Retweets</span>
        </div>
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4" />
          <span>{metric(data?.replies)} Replies</span>
        </div>
      </CardFooter>
    </Card>
  );
}
