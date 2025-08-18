import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function TweetCardSkeleton() {
  return (
    <Card className="tweet-card">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <Skeleton className="w-12 h-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
          <Skeleton className="w-8 h-8" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <div className="flex items-center gap-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <Skeleton className="w-5 h-5" />
                  <Skeleton className="h-3 w-8" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function SentimentSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Skeleton className="w-5 h-5" />
          <Skeleton className="h-5 w-32" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-8" />
          </div>
          <Skeleton className="h-2 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}

export function FactCheckSkeleton() {
  return (
    <Card className="border-2">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="w-5 h-5" />
            <Skeleton className="h-6 w-40" />
          </div>
          <Skeleton className="h-6 w-32" />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-16 w-full" />
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-2 w-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-36" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-20" />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <Skeleton className="h-4 w-40" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-48" />
            <div className="grid gap-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start gap-3 mb-3">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="w-8 h-8" />
                  </div>
                  <Skeleton className="h-12 w-full mb-3" />
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <Skeleton className="h-1.5 w-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function LoadingPage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <TweetCardSkeleton />
        <div className="grid gap-6 md:grid-cols-2">
          <SentimentSkeleton />
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Skeleton className="w-5 h-5" />
                <Skeleton className="h-5 w-32" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
        <FactCheckSkeleton />
      </div>
    </div>
  );
}