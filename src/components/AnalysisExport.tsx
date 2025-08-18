import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { generateTxtReport, downloadTxtFile } from '@/lib/export';
import { formatFilename } from '@/lib/date-utils';
import type { AnalyzeTweetResponse } from '@/types/api';

interface AnalysisExportProps {
  data: AnalyzeTweetResponse;
}

export function AnalysisExport({ data }: AnalysisExportProps) {
  const handleDownloadTxt = () => {
    const content = generateTxtReport(data);
    const filename = formatFilename(data.id);
    downloadTxtFile(content, filename);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Download className="w-5 h-5" />
          Export Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Download a comprehensive report including tweet data, sentiment analysis, fact-check results, and evidence.
          </p>
          <Button 
            onClick={handleDownloadTxt}
            variant="outline" 
            className="w-full"
          >
            <Download className="w-4 h-4 mr-2" />
            Download as TXT Report
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}