import React, { useState, useEffect } from 'react';
import { blink } from '../lib/blink';
import { format, addHours, startOfHour, eachHourOfInterval, addDays, nextDay, Day, setHours, setMinutes, isSameDay, startOfMonth } from 'date-fns';
import { ChevronLeft, ChevronRight, UserPlus, Info, Settings, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '../lib/utils';
import { ScheduleModal } from './ScheduleModal';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { toast } from 'sonner';

interface ScheduleViewProps {
  instanceId: string;
  user: any;
}

export function ScheduleView({ instanceId, user }: ScheduleViewProps) {
  const [entries, setEntries] = useState<any[]>([]);
  const [instance, setInstance] = useState<any>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ date: Date; hour: number } | null>(null);

  const fetchInstance = async () => {
    const data = await blink.db.instances.get(instanceId);
    setInstance(data);
  };

  const fetchEntries = async () => {
    const list = await blink.db.entries.list({
      where: { instance_id: instanceId }
    });

    // Hide archived entries for non-admins
    const filtered = list.filter((e: any) => {
      if (user?.role === 'admin') return true;
      const entryDate = new Date(e.date);
      const today = new Date();
      const currentMonthStart = startOfMonth(today);
      const archiveCutoff = addDays(currentMonthStart, 3);
      
      if (new Date() > archiveCutoff && entryDate < currentMonthStart) {
        return false;
      }
      return true;
    });

    setEntries(filtered);
  };

  useEffect(() => {
    fetchInstance();
    fetchEntries();
  }, [instanceId]);

  // Thursday 18:00 to Sunday 19:00
  // Default config if not set
  const config = instance?.config ? JSON.parse(instance.config) : { 
    startDay: 4, // Thu
    startHour: 18, 
    endDay: 0, // Sun
    endHour: 19 
  };

  // Find the most recent Thursday
  const today = new Date();
  const getRecentThursday = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = (day + 7 - 4) % 7;
    d.setDate(d.getDate() - diff);
    return setMinutes(setHours(d, config.startHour), 0);
  };

  const startTime = getRecentThursday(today);
  const endTime = addDays(nextDay(startTime, 0 as Day), 0); // Sunday
  endTime.setHours(config.endHour);

  const slots = eachHourOfInterval({
    start: startTime,
    end: endTime
  });

  // Group slots by day
  const groupedSlots: { [key: string]: Date[] } = {};
  slots.forEach(slot => {
    const dayStr = format(slot, 'yyyy-MM-dd');
    if (!groupedSlots[dayStr]) groupedSlots[dayStr] = [];
    groupedSlots[dayStr].push(slot);
  });

  const isAdmin = user?.role === 'admin';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clock className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Shift Schedule</h2>
        </div>
        <div className="flex gap-2 text-xs text-muted-foreground font-medium">
          <div className="flex items-center gap-1"><div className="h-3 w-3 bg-day-filled/40 border rounded" /> Occupied</div>
          <div className="flex items-center gap-1"><div className="h-3 w-3 bg-day-empty border rounded" /> Empty</div>
          <div className="flex items-center gap-1"><div className="h-3 w-3 border-2 border-dashed border-day-suggested bg-day-filled/10 rounded" /> Suggested</div>
        </div>
      </div>

      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-[800px]">
          {Object.entries(groupedSlots).map(([dayStr, daySlots]) => (
            <div key={dayStr} className="flex-1 space-y-2">
              <div className="bg-primary text-primary-foreground p-3 rounded-t-xl text-center shadow-sm">
                <p className="text-sm font-bold uppercase tracking-widest">{format(daySlots[0], 'EEEE')}</p>
                <p className="text-xs opacity-80">{format(daySlots[0], 'MMM do')}</p>
              </div>
              <div className="space-y-1">
                {daySlots.map((slot, idx) => {
                  const hour = slot.getHours();
                  const slotEntries = entries.filter(e => e.date === dayStr && e.hour === hour);
                  const hasEntries = slotEntries.length > 0;
                  const isSuggested = slotEntries.some(e => Number(e.isSuggested) > 0);

                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedSlot({ date: slot, hour })}
                      className={cn(
                        "p-3 rounded-lg border transition-all cursor-pointer flex flex-col gap-1 group relative",
                        !hasEntries ? "bg-day-empty hover:bg-muted/50" : "bg-day-filled/40 hover:bg-day-filled/60",
                        isSuggested && "border-2 border-dashed border-day-suggested bg-day-filled/10"
                      )}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-bold text-muted-foreground bg-background/50 px-1.5 py-0.5 rounded uppercase tracking-tighter">
                          {format(slot, 'HH:00')}
                        </span>
                        {isSuggested && <SparkleIcon className="h-3 w-3 text-accent animate-pulse" />}
                      </div>
                      
                      <div className="min-h-[20px] flex flex-wrap gap-1">
                        {slotEntries.filter(e => Number(e.isSuggested) === 0).map(entry => (
                          <div key={entry.id} className="text-[9px] bg-background border px-1.5 py-0.5 rounded-full shadow-sm">
                            {entry.userName}
                          </div>
                        ))}
                      </div>

                      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <UserPlus className="h-3 w-3 text-primary" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <ScheduleModal 
        isOpen={!!selectedSlot}
        onClose={() => setSelectedSlot(null)}
        slot={selectedSlot}
        instanceId={instanceId}
        entries={entries.filter(e => selectedSlot && e.date === format(selectedSlot.date, 'yyyy-MM-dd') && e.hour === selectedSlot.hour)}
        user={user}
        onUpdate={fetchEntries}
      />
    </div>
  );
}

function SparkleIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
      <path d="M5 3v4"/><path d="M3 5h4"/><path d="M21 17v4"/><path d="M19 19h4"/>
    </svg>
  );
}