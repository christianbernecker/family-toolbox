'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Settings, 
  Info,
  ExternalLink
} from 'lucide-react';
import { type ToolStatus } from '@/lib/tools/manager';
import { cn } from '@/lib/utils';

interface ToolCardProps {
  toolStatus: ToolStatus;
  onToggle?: (toolId: string) => void;
  onOpenSettings?: (toolId: string) => void;
  onOpenInfo?: (toolId: string) => void;
  isLoading?: boolean;
}

export function ToolCard({ 
  toolStatus, 
  onToggle, 
  onOpenSettings, 
  onOpenInfo,
  isLoading = false 
}: ToolCardProps) {
  const { tool, isActive, hasErrors, errorMessage, lastUsed } = toolStatus;
  const IconComponent = tool.icon;

  return (
    <Card className={cn(
      "group relative transition-all duration-200",
      isActive ? "ring-2 ring-red-500/20 bg-red-50/50" : "hover:shadow-md",
      hasErrors && "ring-2 ring-red-500 bg-red-50"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={cn(
              "flex items-center justify-center w-10 h-10 rounded-lg",
              isActive ? "bg-red-500 text-white" : "bg-gray-100 text-gray-600"
            )}>
              <IconComponent className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                {tool.name}
                <Badge variant={getStatusBadgeVariant(tool.status)}>
                  {tool.status}
                </Badge>
              </CardTitle>
              <CardDescription className="text-sm">
                {tool.description}
              </CardDescription>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              checked={isActive}
              onCheckedChange={() => onToggle?.(tool.id)}
              disabled={isLoading}
            />
            {isActive ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <Clock className="w-4 h-4 text-gray-400" />
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Status Information */}
        <div className="space-y-3">
          {hasErrors && (
            <div className="flex items-center space-x-2 p-2 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span className="text-sm text-red-700">{errorMessage}</span>
            </div>
          )}

          {/* Tool Features */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Features:</h4>
            <div className="flex flex-wrap gap-1">
              {tool.features.slice(0, 3).map((feature, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {feature}
                </Badge>
              ))}
              {tool.features.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{tool.features.length - 3} mehr
                </Badge>
              )}
            </div>
          </div>

          {/* Tool Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Version:</span>
              <span className="ml-2 font-medium">{tool.version}</span>
            </div>
            <div>
              <span className="text-gray-500">Kategorie:</span>
              <span className="ml-2 font-medium capitalize">{tool.category}</span>
            </div>
          </div>

          {lastUsed && (
            <div className="text-sm text-gray-500">
              Zuletzt verwendet: {new Date(lastUsed).toLocaleDateString('de-DE')}
            </div>
          )}

          <Separator className="my-4" />

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              {tool.requiresConfig && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenSettings?.(tool.id)}
                  disabled={isLoading}
                >
                  <Settings className="w-4 h-4 mr-1" />
                  Einstellungen
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenInfo?.(tool.id)}
                disabled={isLoading}
              >
                <Info className="w-4 h-4 mr-1" />
                Details
              </Button>
            </div>

            {isActive && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // TODO: Navigate to tool-specific page
                  console.log(`Navigate to ${tool.id}`);
                }}
                disabled={isLoading}
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                Öffnen
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getStatusBadgeVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case 'stable':
      return 'default';
    case 'beta':
      return 'secondary';
    case 'experimental':
      return 'destructive';
    default:
      return 'outline';
  }
} 