import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getMergedRecords, type PHQ9Record } from '@/utils/storage';
import { getMessages, type Locale } from '@/i18n/messages';
import { FileDown, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { PHQ9LineChart } from '@/components/charts/PHQ9LineChart';
import { ScoreSummaryCard } from '@/components/charts/ScoreSummary';
import { transformToChartData, calculateScoreSummary } from '@/utils/chartUtils';

interface HistoryProps {
  locale: Locale;
  onExportPDF?: () => void;
}

const RECORDS_PER_PAGE = 10;

export function History({ locale, onExportPDF }: HistoryProps) {
  const messages = getMessages(locale);
  const [records, setRecords] = useState<PHQ9Record[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    setIsLoading(true);
    try {
      const data = await getMergedRecords();
      // Already sorted by date descending in getMergedRecords
      setRecords(data);
    } catch (error) {
      console.error('Failed to load records:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleDateString(locale === 'mi' ? 'en-NZ' : 'en-NZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSeverityLabel = (severity: string): string => {
    switch (severity) {
      case 'Minimal': return messages.severityMinimal;
      case 'Mild': return messages.severityMild;
      case 'Moderate': return messages.severityModerate;
      case 'Moderately severe': return messages.severityModeratelySevere;
      case 'Severe': return messages.severitySevere;
      default: return severity;
    }
  };

  const getSeverityStyles = (severity: string): { backgroundColor: string; color: string } => {
    const severityLower = severity.toLowerCase();
    
    if (severityLower.includes('minimal')) {
      return { backgroundColor: '#f0fdf4', color: '#16a34a' }; // green-50, green-600
    } else if (severityLower.includes('mild')) {
      return { backgroundColor: '#fefce8', color: '#ca8a04' }; // yellow-50, yellow-600
    } else if (severityLower.includes('moderate') && !severityLower.includes('severe')) {
      return { backgroundColor: '#fff7ed', color: '#ea580c' }; // orange-50, orange-600
    } else if (severityLower.includes('moderately severe') || severityLower.includes('moderately-severe')) {
      return { backgroundColor: '#fef2f2', color: '#dc2626' }; // red-50, red-600
    } else if (severityLower.includes('severe')) {
      return { backgroundColor: '#fee2e2', color: '#b91c1c' }; // red-100, red-700
    }
    
    return { backgroundColor: '#f9fafb', color: '#4b5563' }; // gray-50, gray-600
  };

  const calculateTrend = (): { direction: 'up' | 'down' | 'stable'; change: number } | null => {
    if (records.length < 2) return null;
    
    const latest = records[0].total;
    const previous = records[1].total;
    const change = latest - previous;
    
    if (change > 0) return { direction: 'up', change };
    if (change < 0) return { direction: 'down', change: Math.abs(change) };
    return { direction: 'stable', change: 0 };
  };

  const trend = calculateTrend();

  // Pagination calculations
  const totalPages = Math.ceil(records.length / RECORDS_PER_PAGE);
  const startIndex = (currentPage - 1) * RECORDS_PER_PAGE;
  const endIndex = startIndex + RECORDS_PER_PAGE;
  const currentRecords = records.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl py-8 px-4">
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-gray-500">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="container mx-auto max-w-4xl py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{messages.historyTitle}</CardTitle>
            <CardDescription>{messages.historyEmpty}</CardDescription>
          </CardHeader>
          <CardContent className="py-12">
            <div className="text-center">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">{messages.historyEmpty}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <Card className="bg-white/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{messages.historyTitle}</CardTitle>
              <CardDescription>
                {records.length} {records.length === 1 ? 'assessment' : 'assessments'} recorded
              </CardDescription>
            </div>
            {onExportPDF && (
              <Button onClick={onExportPDF} variant="outline" className="bg-[#D1F08B] text-gray-900 shadow-sm hover:bg-[#b8d66a]">
                <FileDown className="h-4 w-4 mr-2" />
                {messages.historyExportPDF}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Charts Section - NEW */}
          {records.length >= 2 && (
            <div className="space-y-6">
              {/* Score Summary */}
              <ScoreSummaryCard 
                summary={calculateScoreSummary(records)}
                currentSeverity={records[0].severity}
                locale={locale}
                trend={trend}
              />

              {/* Line Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>{locale === 'en' ? 'Score Trend' : 'Ia Kaute'}</CardTitle>
                  <CardDescription>
                    {locale === 'en' 
                      ? 'Your PHQ-9 scores over time' 
                      : 'Ō kaute PHQ-9 i ngā wā katoa'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PHQ9LineChart 
                    data={transformToChartData(records)}
                    locale={locale}
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Records list */}
          <div className="space-y-4">
            {currentRecords.map((record) => (
              <Card key={record.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <p className="text-sm text-gray-600">
                          {formatDate(record.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span 
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                          style={{
                            ...getSeverityStyles(record.severity),
                            border: '1px solid rgba(0,0,0,0.1)'
                          }}
                        >
                          {getSeverityLabel(record.severity)}
                        </span>
                        <span className="text-2xl font-bold text-gray-900">
                          {record.total}
                          <span className="text-base font-normal text-gray-500"> / 27</span>
                        </span>
                      </div>
                    </div>
                    
                    {/* Question responses summary */}
                    <div className="flex gap-1">
                      {record.answers.map((answer, idx) => (
                        <div
                          key={idx}
                          className={`w-2 h-12 rounded ${
                            answer === 0 ? 'bg-green-200' :
                            answer === 1 ? 'bg-yellow-200' :
                            answer === 2 ? 'bg-orange-200' :
                            'bg-red-200'
                          }`}
                          title={`${locale === 'en' ? 'Question' : 'Pātai'} ${idx + 1}: ${answer}`}
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-gray-600">
                {locale === 'en' 
                  ? `Showing ${startIndex + 1}-${Math.min(endIndex, records.length)} of ${records.length} assessments`
                  : `E whakaatu ana ${startIndex + 1}-${Math.min(endIndex, records.length)} o ${records.length} aromatawai`
                }
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  {locale === 'en' ? 'Previous' : 'O Mua'}
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => goToPage(page)}
                      className="min-w-[2.5rem]"
                    >
                      {page}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  {locale === 'en' ? 'Next' : 'E Haere Ana'}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
