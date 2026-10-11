'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Save, Trash2, Key, Music, Settings, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { getCredentials, setCredentials, removeCredentials, hasCredentials, CREDENTIAL_HELP_TEXT, SUPPORTED_SOURCES, type SupportedSource } from '@/lib/credentials';
import { scraperRegistry } from '@/lib/scrapers/registry';
import { getGlobalQuality, setGlobalQuality, getSourceQuality, setSourceQuality, removeSourceQuality, getEffectiveQuality, getAvailableQualities, QUALITY_OPTIONS, getQualityLabel, getKindColor, type GlobalQualityId } from '@/lib/quality';
const SOURCE_LABELS: Record<string, string> = {
  qobuz: 'Qobuz',
  tidal: 'Tidal',
  amazon: 'Amazon Music',
  ytmusic: 'YouTube Music',
};

const SOURCE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  qobuz: Music,
  tidal: Music,
  amazon: Music,
  ytmusic: Music,
};

export function SettingsPanel() {
  const [activeTab, setActiveTab] = useState('credentials');
  const [credentials, setCredentialsState] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [testing, setTesting] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, boolean | null>>({});

  // Initialize credentials from localStorage
  const refreshCredentials = () => {
    const creds: Record<string, string> = {};
    SUPPORTED_SOURCES.forEach(source => {
      const cred = getCredentials(source);
      creds[source] = cred ? JSON.stringify(cred, null, 2) : '';
    });
    setCredentialsState(creds);
  };

  // Initialize quality settings
  const [globalQualityState, setGlobalQualityState] = useState<GlobalQualityId>(() => getGlobalQuality());
  const [sourceQualities, setSourceQualitiesState] = useState<Record<string, string>>(() => {
    const qualities: Record<string, string> = {};
    SUPPORTED_SOURCES.forEach(source => {
      const q = getSourceQuality(source);
      qualities[source] = q || '';
    });
    return qualities;
  });

  const handleSaveCredentials = async (source: SupportedSource) => {
    setSaving(source);
    try {
      const value = credentials[source].trim();
      if (value) {
        const parsed = JSON.parse(value);
        setCredentials(source, parsed);
        setTestResults(prev => ({ ...prev, [source]: false }));
      } else {
        removeCredentials(source);
      }
      refreshCredentials();
    } catch {
      alert('Invalid JSON format. Please check your input.');
    } finally {
      setSaving(null);
    }
  };

  const handleRemoveCredentials = (source: SupportedSource) => {
    removeCredentials(source);
    refreshCredentials();
  };

  const handleTestCredentials = async (source: SupportedSource) => {
    setTesting(source);
    setTestResults(prev => ({ ...prev, [source]: null }));
    try {
      const cred = getCredentials(source);
      if (!cred) {
        setTestResults(prev => ({ ...prev, [source]: false }));
        return;
      }
      
      const provider = scraperRegistry.getDownloadProvider(source);
      
      if (provider) {
        const result = await provider.validateCredentials(cred as Record<string, string>);
        setTestResults(prev => ({ ...prev, [source]: result }));
      } else {
        setTestResults(prev => ({ ...prev, [source]: false }));
      }
    } catch {
      setTestResults(prev => ({ ...prev, [source]: false }));
    } finally {
      setTesting(null);
    }
  };

  const handleGlobalQualityChange = (quality: GlobalQualityId | null) => {
    if (quality === null) return;
    setGlobalQualityState(quality);
    setGlobalQuality(quality);
  };
    setGlobalQualityState(quality);
    setGlobalQuality(quality);
  };

  const handleSourceQualityChange = (source: SupportedSource, quality: string) => {
    setSourceQualitiesState(prev => ({ ...prev, [source]: quality }));
    if (quality) {
      setSourceQuality(source, quality);
    } else {
      removeSourceQuality(source);
    }
  };

  return (
    <Dialog>
      <DialogTrigger>
        <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Settings">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="credentials">Credentials</TabsTrigger>
            <TabsTrigger value="quality">Quality</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>

          {/* Credentials Tab */}
          <TabsContent value="credentials" className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="space-y-4">
              {SUPPORTED_SOURCES.map(source => {
                const Icon = SOURCE_ICONS[source];
                const hasCreds = hasCredentials(source);
                const testResult = testResults[source];
                
                return (
                  <Card key={source} className="overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <CardTitle className="text-base font-medium">{SOURCE_LABELS[source]}</CardTitle>
                          <CardDescription className="text-xs">
                            {CREDENTIAL_HELP_TEXT[source]}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={hasCreds ? 'default' : 'secondary'}>
                          {hasCreds ? 'Connected' : 'Not Connected'}
                        </Badge>
                        {testResult !== undefined && (
                          <Badge variant={testResult ? 'default' : 'destructive'}>
                            {testResult ? <CheckCircle className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                            {testResult ? 'Valid' : 'Invalid'}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor={`creds-${source}`} className="text-sm">
                          Credentials (JSON)
                        </Label>
                        <Textarea
                          id={`creds-${source}`}
                          value={credentials[source] || ''}
                          onChange={e => setCredentialsState(prev => ({ ...prev, [source]: e.target.value }))}
                          placeholder={CREDENTIAL_HELP_TEXT[source]}
                          rows={4}
                          className="font-mono text-sm"
                          disabled={saving === source || testing === source}
                        />
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveCredentials(source)}
                          disabled={!hasCreds || saving === source}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Remove
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTestCredentials(source)}
                          disabled={!hasCreds || testing === source || saving === source}
                        >
                          {testing === source ? (
                            <>
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              Testing...
                            </>
                          ) : (
                            <>
                              <Key className="h-3 w-3 mr-1" />
                              Test
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleSaveCredentials(source)}
                          disabled={saving === source || testing === source}
                        >
                          {saving === source ? (
                            <>
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="h-3 w-3 mr-1" />
                              Save
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Quality Tab */}
          <TabsContent value="quality" className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Global Quality Preference</CardTitle>
                  <CardDescription>
                    Default quality for all sources. Can be overridden per-source below.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="global-quality" className="text-sm">
                      Global Quality
                    </Label>
                    <Select value={globalQualityState} onValueChange={handleGlobalQualityChange}>
                      <SelectTrigger id="global-quality">
                        <SelectValue placeholder="Select quality" />
                      </SelectTrigger>
                      <SelectContent>
                        {QUALITY_OPTIONS.map(option => (
                          <SelectItem key={option.id} value={option.id}>
                            <div className="flex items-center justify-between w-full">
                              <span>{option.label}</span>
                              <Badge variant="outline" className={cn(getKindColor(option.kind), 'text-xs')}>
                                {option.kind}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-3">
                {SUPPORTED_SOURCES.map(source => {
                  const Icon = SOURCE_ICONS[source];
                  const availableQualities = getAvailableQualities(source);
                  const currentQuality = getEffectiveQuality(source);
                  const isOverridden = !!sourceQualities[source];
                  
                  return (
                    <Card key={source}>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <CardTitle className="text-base font-medium">{SOURCE_LABELS[source]}</CardTitle>
                            <CardDescription className="text-xs">
                              Current: {getQualityLabel(currentQuality, source)}
                              {isOverridden && <span className="ml-2 text-primary">(overridden)</span>}
                            </CardDescription>
                          </div>
                        </div>
                        {isOverridden && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              handleSourceQualityChange(source, '');
                              setSourceQualitiesState(prev => ({ ...prev, [source]: '' }));
                            }}
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Reset
                          </Button>
                        )}
                      </CardHeader>
                      <CardContent>
                        <Select
                          value={sourceQualities[source] || ''}
                          onValueChange={q => handleSourceQualityChange(source, q)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Use global default" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">
                              <div className="flex items-center justify-between w-full">
                                <span>Use global default ({getQualityLabel(globalQuality)})</span>
                              </div>
                            </SelectItem>
                            {availableQualities.map(option => (
                              <SelectItem key={option.id} value={option.id}>
                                <div className="flex items-center justify-between w-full">
                                  <span>{option.label}</span>
                                  <Badge variant="outline" className={cn(getKindColor(option.kind), 'text-xs')}>
                                    {option.kind}
                                  </Badge>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          {/* About Tab */}
          <TabsContent value="about" className="flex-1 overflow-y-auto p-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
                <CardDescription>Cassette Web - Music Search & Download</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <p className="font-medium">Version 0.1.0</p>
                  <p className="text-muted-foreground">
                    A music search and download utility built with Next.js 15, React 19, and TypeScript.
                  </p>
                </div>
                <Separator />
                <div className="space-y-2 text-sm">
                  <p className="font-medium">Legal Notice</p>
                  <p className="text-muted-foreground text-xs">
                    Downloads are for personal archival use only. Respect copyright and terms of service
                    of each source. This tool does not circumvent DRM or provide unauthorized access
                    to copyrighted content. Users are responsible for complying with applicable laws
                    and the terms of service of each music provider.
                  </p>
                </div>
                <Separator />
                <div className="space-y-2 text-sm">
                  <p className="font-medium">Links</p>
                  <div className="flex flex-wrap gap-4">
                    <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">
                      GitHub Repository
                    </a>
                    <a href="https://github.com/issues" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">
                      Report Issue
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}