import React, { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { blink } from './lib/blink';
import { Sidebar } from './components/Sidebar';
import { CalendarView } from './components/CalendarView';
import { ScheduleView } from './components/ScheduleView';
import { NoticeBoard } from './components/NoticeBoard';
import { getCookie, setCookie } from 'cookies-next';
import { Calendar, Clock, LogIn, LogOut, Loader2 } from 'lucide-react';
import { Button } from './components/ui/button';
import { Toaster } from './components/ui/sonner';

export default function App() {
  const { user, loading } = useAuth();
  const [instances, setInstances] = useState<any[]>([]);
  const [currentInstanceId, setCurrentInstanceId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'calendar' | 'schedule'>('calendar');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Load instances
  useEffect(() => {
    const fetchInstances = async () => {
      const list = await blink.db.instances.list({ orderBy: { createdAt: 'asc' } });
      setInstances(list);
      
      // Restore last viewed instance from cookie
      const lastId = getCookie('last_instance_id');
      const lastMode = getCookie('last_view_mode') as 'calendar' | 'schedule';
      
      if (lastId && list.find((i: any) => i.id === lastId)) {
        setCurrentInstanceId(lastId as string);
      } else if (list.length > 0) {
        setCurrentInstanceId(list[0].id);
      }

      if (lastMode) {
        setViewMode(lastMode);
      }
    };
    fetchInstances();
  }, []);

  // Update cookies on change
  useEffect(() => {
    if (currentInstanceId) {
      setCookie('last_instance_id', currentInstanceId);
    }
  }, [currentInstanceId]);

  useEffect(() => {
    setCookie('last_view_mode', viewMode);
  }, [viewMode]);

  const currentInstance = instances.find(i => i.id === currentInstanceId);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar 
        instances={instances} 
        currentId={currentInstanceId} 
        onSelect={setCurrentInstanceId}
        onInstancesChange={setInstances}
        user={user}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b flex items-center justify-between px-6 bg-card shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold truncate max-w-[200px] lg:max-w-md">
              {currentInstance?.name || 'Collaborative Calendar'}
            </h1>
            <div className="flex bg-muted p-1 rounded-lg">
              <Button
                variant={viewMode === 'calendar' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('calendar')}
                className="gap-2"
              >
                <Calendar className="h-4 w-4" />
                Calendar
              </Button>
              <Button
                variant={viewMode === 'schedule' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('schedule')}
                className="gap-2"
              >
                <Clock className="h-4 w-4" />
                Schedule
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user?.id.startsWith('anon_') ? (
              <Button variant="outline" size="sm" onClick={() => blink.auth.login()} className="gap-2">
                <LogIn className="h-4 w-4" />
                Login
              </Button>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium hidden sm:inline">{user?.name}</span>
                <Button variant="ghost" size="sm" onClick={() => blink.auth.logout()} className="gap-2">
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col lg:flex-row gap-6">
          <div className="flex-1 min-w-0">
            {currentInstanceId ? (
              viewMode === 'calendar' ? (
                <CalendarView instanceId={currentInstanceId} user={user} />
              ) : (
                <ScheduleView instanceId={currentInstanceId} user={user} />
              )
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                Select or create an instance to get started
              </div>
            )}
          </div>
          
          <div className="w-full lg:w-80 shrink-0">
            <NoticeBoard user={user} />
          </div>
        </div>
      </main>
      <Toaster />
    </div>
  );
}
