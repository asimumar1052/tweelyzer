import { useEffect, useState } from 'react';
import { useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft, Download, ChevronDown, ChevronUp, ExternalLink, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TweetCard } from '@/components/TweetCard';
import { SentimentDisplay } from '@/components/SentimentDisplay';
import { FactCheckCompact } from '@/components/FactCheckCompact';
import { FactCheckPanel } from '@/components/FactCheckPanel';
import { LoadingPage } from '@/components/LoadingStates';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { analyzeTweet } from '@/lib/api';
import { generateTxtReport, downloadTxtFile } from '@/lib/export';
import { formatFilename, formatExactTime } from '@/lib/date-utils';
import { useToast } from '@/hooks/use-toast';
import type { AnalyzeTweetResponse } from '@/types/api';

export default function Analyze() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [data, setData] = useState<AnalyzeTweetResponse | null>(
    location.state?.data || null
  );
  const [showDetails, setShowDetails] = useState(false);

  const urlParam = searchParams.get('url');

  const analysisMutation = useMutation({
    mutationFn: analyzeTweet,
    onSuccess: (result) => {
      setData(result);
    },
    onError: (error) => {
      toast({
        title: 'Analysis Failed',
        description: error.message,
        variant: 'destructive',
      });
      navigate('/');
    },
  });

  useEffect(() => {
    // If we have URL param but no data, trigger analysis
    if (urlParam && !data && !analysisMutation.isPending) {
      analysisMutation.mutate({ url: urlParam });
    }
  }, [urlParam, data, analysisMutation]);

  const handleDownloadReport = () => {
    if (data) {
      try {
        const content = generateTxtReport(data);
        const filename = formatFilename(data.id);
        console.log('Initiating download:', filename);
        downloadTxtFile(content, filename);
        
        toast({
          title: 'Download Started',
          description: `Report saved as ${filename}.txt`,
        });
      } catch (error) {
        console.error('Download error:', error);
        toast({
          title: 'Download Failed',
          description: 'Unable to generate report. Please try again.',
          variant: 'destructive',
        });
      }
    } else {
      toast({
        title: 'No Data Available',
        description: 'Cannot generate report without analysis data.',
        variant: 'destructive',
      });
    }
  };

  if (analysisMutation.isPending || !data) {
    return <LoadingPage />;
  }

  const { fact_check } = data;
  const analysisTime = new Date(fact_check?.timestamp_utc || Date.now());

  return (
    <div className="container mx-auto px-4 py-4 min-h-screen">
      <div className="flex flex-col">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/')}
            className="gap-2 self-start"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden xs:inline">Back to Home</span>
            <span className="xs:hidden">Back</span>
          </Button>
          
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2 w-full">
                      <ExternalLink className="w-4 h-4 flex-shrink-0" />
                      <span className="hidden sm:inline">View Details</span>
                      <span className="sm:hidden">Details</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh]">
                    <DialogHeader>
                      <DialogTitle>Detailed Analysis</DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="h-[calc(80vh-8rem)] pr-4">
                      <FactCheckPanel data={data} />
                    </ScrollArea>
                  </DialogContent>
                </Dialog> */}
            <Button 
              onClick={handleDownloadReport}
              size="sm"
              className="gap-2 flex-1 sm:flex-none min-w-0"
            >
              <Download className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline">Download Report</span>
              <span className="sm:hidden">Download</span>
            </Button>
          </div>
        </div>

        {/* Dashboard Layout */}
        <div className="flex flex-col gap-4">
          {/* Top Section - Tweet */}
          <div className="flex-shrink-0">
            <TweetCard data={data} />
          </div>

          {/* Middle Section - Sentiment and Fact Check */}
          <div className="flex-shrink-0 flex flex-col md:grid md:grid-cols-2 gap-4">
            {/* Fact Check */}
            <div className="flex flex-col">
              <FactCheckCompact data={data} />
              {/* Details Button moved here */}
              <div className="mt-3">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2 w-full">
                      <ExternalLink className="w-4 h-4 flex-shrink-0" />
                      <span className="hidden sm:inline">View Details</span>
                      <span className="sm:hidden">Details</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh]">
                    <DialogHeader>
                      <DialogTitle>Detailed Analysis</DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="h-[calc(80vh-8rem)] pr-4">
                      <FactCheckPanel data={data} />
                    </ScrollArea>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            {/* Sentiment */}
            <div className="flex flex-col">
              <SentimentDisplay sentiment={data.sentiment} />
            </div>
          </div>

          {/* Analysis Notes and Timestamp */}
          <div className="flex-shrink-0 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-border">
              {/* Left Column - Notes */}
              <div className="space-y-2">
                {fact_check?.notes ? (
                  <>
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                      Analysis Notes
                    </h3>
                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                      {fact_check.notes}
                    </p>
                  </>
                ) : (
                  <div></div>
                )}
              </div>

              {/* Right Column - Timestamp */}
              <div className="flex flex-col justify-end">
                <div className="flex items-center gap-2 text-xs text-muted-foreground justify-end md:justify-end">
                  <Clock className="w-3 h-3" />
                  <span>Analysis generated on {formatExactTime(analysisTime)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}