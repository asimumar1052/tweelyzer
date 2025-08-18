// Test utility to debug download functionality
import { generateTxtReport, downloadTxtFile } from '@/lib/export';
import { formatFilename } from '@/lib/date-utils';
import type { AnalyzeTweetResponse } from '@/types/api';

export function testDownloadFunctionality(data: AnalyzeTweetResponse) {
  console.log('Testing download functionality...');
  
  // Test 1: Check if data is valid
  console.log('Data check:', {
    hasData: !!data,
    hasId: !!data?.id,
    hasFactCheck: !!data?.fact_check,
    hasSentiment: !!data?.sentiment
  });
  
  if (!data) {
    console.error('No data provided for download test');
    return false;
  }
  
  // Test 2: Generate filename
  try {
    const filename = formatFilename(data.id);
    console.log('Generated filename:', filename);
  } catch (error) {
    console.error('Filename generation failed:', error);
    return false;
  }
  
  // Test 3: Generate report content
  try {
    const content = generateTxtReport(data);
    console.log('Report content length:', content.length);
    console.log('Report preview (first 200 chars):', content.substring(0, 200));
  } catch (error) {
    console.error('Report generation failed:', error);
    return false;
  }
  
  // Test 4: Check browser download capabilities
  const browserSupport = {
    createObjectURL: !!window.URL && !!window.URL.createObjectURL,
    revokeObjectURL: !!window.URL && !!window.URL.revokeObjectURL,
    Blob: !!window.Blob,
    createElement: !!document.createElement
  };
  
  console.log('Browser support:', browserSupport);
  
  const allSupported = Object.values(browserSupport).every(Boolean);
  if (!allSupported) {
    console.error('Browser missing required download APIs');
    return false;
  }
  
  console.log('All tests passed! Download should work.');
  return true;
}

export function forceDownloadTest(data: AnalyzeTweetResponse) {
  console.log('Forcing download test...');
  
  if (!testDownloadFunctionality(data)) {
    console.error('Pre-flight tests failed');
    return;
  }
  
  const content = generateTxtReport(data);
  const filename = formatFilename(data.id);
  
  console.log(`Attempting download: ${filename}.txt`);
  downloadTxtFile(content, filename);
}
