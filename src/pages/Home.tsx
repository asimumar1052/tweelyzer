import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { TweetUrlForm } from '@/components/TweetUrlForm';
import { analyzeTweet } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const analysisMutation = useMutation({
    mutationFn: analyzeTweet,
    onSuccess: (data) => {
      navigate(`/analyze?id=${data.id}`, { state: { data } });
    },
    onError: (error) => {
      toast({
        title: 'Analysis Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleAnalyze = async (url: string) => {
    analysisMutation.mutate({ url });
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Analyze Any Tweet
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get instant AI-powered sentiment analysis and comprehensive fact-checking for any Twitter/X post.
            </p>
          </div>

          <TweetUrlForm 
            onSubmit={handleAnalyze}
            isLoading={analysisMutation.isPending}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 text-left">
            <div className="space-y-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="font-semibold">Deep Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Advanced AI analyzes tweet content, engagement metrics, and author credibility.
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
              <h3 className="font-semibold">Fact Checking</h3>
              <p className="text-sm text-muted-foreground">
                Comprehensive fact-checking with evidence from multiple verified sources.
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="font-semibold">Detailed Reports</h3>
              <p className="text-sm text-muted-foreground">
                Export comprehensive analysis reports with all findings and evidence.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}