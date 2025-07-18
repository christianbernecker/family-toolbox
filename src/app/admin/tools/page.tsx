"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Loader2, Check, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ToolManagementService, Tool } from "@/lib/services/tool-management";
import { useToast } from "@/hooks/use-toast";

export default function AdminToolsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const toolManager = new ToolManagementService();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
      return;
    }

    if (status === 'authenticated') {
      const isAdmin = session?.user?.email === 'chr.bernecker@gmail.com' || 
                     session?.user?.email === 'amandabernecker@gmail.com';
      
      if (!isAdmin) {
        router.push('/tools');
        return;
      }
      loadAllTools();
    }
  }, [status, session, router]);

  const loadAllTools = async () => {
    setLoading(true);
    try {
      const allTools = await toolManager.getAllTools();
      setTools(allTools);
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Fehler beim Laden',
        description: 'Die Tool-Liste konnte nicht geladen werden.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToolToggle = async (toolId: string, isActive: boolean) => {
    setUpdating(toolId);
    try {
      await toolManager.toggleToolStatus(toolId, isActive);
      setTools(prevTools =>
        prevTools.map(tool =>
          tool.id === toolId ? { ...tool, isActive } : tool
        )
      );
      toast({
        title: 'Erfolg',
        description: `Tool wurde ${isActive ? 'aktiviert' : 'deaktiviert'}.`,
      });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Fehler beim Aktualisieren',
        description: 'Der Tool-Status konnte nicht geändert werden.',
      });
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Tool-Verwaltung</h1>
      <div className="space-y-4">
        {tools.map((tool) => (
          <div key={tool.id} className="p-4 border rounded-lg flex justify-between items-center bg-white dark:bg-gray-800">
            <div>
              <h3 className="font-semibold">{tool.name}</h3>
              <p className="text-sm text-gray-500">{tool.description}</p>
            </div>
            <div className="flex items-center space-x-2">
              {updating === tool.id ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Switch
                  checked={tool.isActive}
                  onCheckedChange={(checked) => handleToolToggle(tool.id, checked)}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 