'use client';

import { useState } from 'react';
import { DownloadResource, ScrapedResult } from '@/types/scraped';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { getCredentials, hasCredentials } from '@/lib/credentials';
import { getEffectiveQuality, getQualityLabel, getKindColor } from '@/lib/quality';
import { cn } from '@/lib/utils';
import { Download, Loader2, Lock, Unlock, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface DownloadResourcesTabProps {
  track: ScrapedResult;
  downloadResources?: DownloadResource[];
}

export function DownloadResourcesTab({ track, downloadResources }: DownloadResourcesTabProps) {
  const [downloading, setDownloading] = useState<string | null>(null);

  if (!downloadResources || downloadResources.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
        <AlertCircle className="h-8 w-8 mb-2" />
        <p className="text-sm">No download sources available for this result</p>
      </div>
    );
  }

  const handleDownload = async (sourceId: string, qualityId: string, resource: DownloadResource) => {
    const hasCreds = hasCredentials(sourceId);
    
    if (!hasCreds && resource.requiresAuth) {
      toast.error(`${resource.sourceDisplayName} requires credentials`, {
        description: 'Please add your credentials in Settings.',
        action: {
          label: 'Go to Settings',
          onClick: () => {
            window.dispatchEvent(new CustomEvent('open-settings'));
          },
        },
      });
      return;
    }

    setDownloading(sourceId);
    
    try {
      const credentials = getCredentials(sourceId);
      const response = await fetch(
        `/api/download/${sourceId}?trackId=${resource.trackId}&quality=${qualityId}`,
        {
          headers: {
            'x-source-credentials': JSON.stringify(credentials || {}),
          },
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || `Download failed (${response.status})`);
      }

      // Create blob URL and trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${track.title.replace(/[^a-zA-Z0-9]/g, '_')}_${sourceId}.mp3`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(`Downloaded ${resource.sourceDisplayName}`, {
        description: `${getQualityLabel(qualityId, sourceId)} quality`,
      });
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Download failed', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="space-y-3">
      {downloadResources.map((resource) => (
        <Card key={resource.sourceId}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h4 className="font-medium">{resource.sourceDisplayName}</h4>
                {resource.requiresAuth && (
                  hasCredentials(resource.sourceId) ? (
                    <Badge variant="outline" className="gap-1">
                      <Unlock className="h-3 w-3" />
                      Connected
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="gap-1">
                      <Lock className="h-3 w-3" />
                      Auth Required
                    </Badge>
                  )
                )}
              </div>
            </div>
            
            <Separator className="my-3" />
            
            <div className="space-y-2">
              {resource.qualityOptions.map((quality) => {
                const effectiveQuality = getEffectiveQuality(resource.sourceId);
                const isEffective = quality.id === effectiveQuality;
                const isDownloading = downloading === resource.sourceId;
                
                return (
                  <div key={quality.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className={cn(getKindColor(quality.kind), 'text-xs')}>
                        {quality.kind}
                      </Badge>
                      <span className="text-sm">{quality.label}</span>
                      {quality.description && (
                        <span className="text-xs text-muted-foreground">{quality.description}</span>
                      )}
                      {isEffective && (
                        <Badge variant="default" size="sm">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Your choice
                        </Badge>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isDownloading}
                      onClick={() => handleDownload(resource.sourceId, quality.id, resource)}
                    >
                      {isDownloading ? (
                        <>
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          Downloading...
                        </>
                      ) : (
                        <>
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
