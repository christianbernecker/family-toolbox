'use client';

import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  ExternalLink,
  Info
} from 'lucide-react';
import { type ToolStatus } from '@/lib/tools/manager';
import { cn } from '@/lib/utils';

interface ToolToggleProps {
  toolStatus: ToolStatus;
  onToggle?: (toolId: string) => Promise<void>;
  onOpenDetails?: (toolId: string) => void;
  compact?: boolean;
  showDescription?: boolean;
  className?: string;
}

export function ToolToggle({ 
  toolStatus, 
  onToggle, 
  onOpenDetails,
  compact = false,
  showDescription = true,
  className
}: ToolToggleProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { tool, isActive, hasErrors, errorMessage } = toolStatus;
  const IconComponent = tool.icon;

  const handleToggle = async () => {
    if (!onToggle) return;
    
    setIsLoading(true);
    try {
      await onToggle(tool.id);
    } catch (error) {
      console.error('Failed to toggle tool:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (compact) {
    return (
      <div className={cn(
        "flex items-center justify-between p-3 border rounded-lg",
        isActive ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-200",
        hasErrors && "border-red-500 bg-red-50",
        className
      )}>
        <div className="flex items-center space-x-3">
          <div className={cn(
            "flex items-center justify-center w-8 h-8 rounded-md",
            isActive ? "bg-red-500 text-white" : "bg-gray-400 text-white"
          )}>
            <IconComponent className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-medium">{tool.name}</span>
              <Badge variant={getStatusBadgeVariant(tool.status)} className="text-xs">
                {tool.status}
              </Badge>
            </div>
            {showDescription && (
              <p className="text-sm text-gray-600 mt-1">{tool.description}</p>
            )}
            {hasErrors && (
              <div className="flex items-center space-x-1 mt-1">
                <AlertCircle className="w-3 h-3 text-red-500" />
                <span className="text-xs text-red-600">{errorMessage}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {onOpenDetails && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenDetails(tool.id)}
              disabled={isLoading}
            >
              <Info className="w-4 h-4" />
            </Button>
          )}
          
          <div className="flex items-center space-x-2">
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
            ) : (
              <Switch
                checked={isActive}
                onCheckedChange={handleToggle}
                disabled={isLoading}
              />
            )}
            {isActive && !isLoading && (
              <CheckCircle className="w-4 h-4 text-green-500" />
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className={cn(
      "transition-all duration-200",
      isActive ? "ring-2 ring-red-500/20 bg-red-50/50" : "hover:shadow-md",
      hasErrors && "ring-2 ring-red-500",
      className
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
              {showDescription && (
                <CardDescription className="text-sm">
                  {tool.description}
                </CardDescription>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            ) : (
              <Switch
                checked={isActive}
                onCheckedChange={handleToggle}
                disabled={isLoading}
              />
            )}
            {isActive && !isLoading && (
              <CheckCircle className="w-5 h-5 text-green-500" />
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {hasErrors && (
          <div className="flex items-center space-x-2 p-2 bg-red-50 border border-red-200 rounded-md mb-4">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span className="text-sm text-red-700">{errorMessage}</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            {tool.features.slice(0, 2).map((feature, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {feature}
              </Badge>
            ))}
            {tool.features.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{tool.features.length - 2} mehr
              </Badge>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {onOpenDetails && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenDetails(tool.id)}
                disabled={isLoading}
              >
                <Info className="w-4 h-4 mr-1" />
                Details
              </Button>
            )}
            
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