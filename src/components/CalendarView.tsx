import React, { useState, useEffect } from 'react';
import { blink } from '../lib/blink';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, addMonths, subMonths, isSameDay, startOfWeek, endOfWeek, addDays } from 'date-fns';
import { ChevronLeft, ChevronRight, UserPlus, Info } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '../lib/utils';
import { DayModal } from './DayModal';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface CalendarViewProps {
  instanceId: string;
  user: any;
}

export function CalendarView({ instanceId, user }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [entries, setEntries] = useState<any[]>([]);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

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
    fetchEntries();
  }, [instanceId, currentDate]);

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentDate)),
    end: endOfWeek(endOfMonth(currentDate))
  });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const isNextMonthAvailable = () => {
    const today = new Date();
    const nextMonthDate = addMonths(today, 1);
    return isSameMonth(currentDate, today);
  };

  const isPrevMonthAvailable = () => {
    const today = new Date();
    const nextMonthDate = addMonths(today, 1);
    return isSameMonth(currentDate, nextMonthDate);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{format(currentDate, 'MMMM yyyy')}</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={prevMonth} disabled={!isPrevMonthAvailable()}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>Today</Button>
          <Button variant="outline" size="icon" onClick={nextMonth} disabled={!isNextMonthAvailable()}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-border border rounded-xl overflow-hidden shadow-sm">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="bg-muted p-3 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {day}
          </div>
        ))}
        {days.map((day, idx) => {
          const dayEntries = entries.filter(e => isSameDay(new Date(e.date), day));
          const hasEntries = dayEntries.length > 0;
          const isSuggested = dayEntries.some(e => Number(e.isSuggested) > 0);
          const isSelectedMonth = isSameMonth(day, currentDate);

          return (
            <div
              key={idx}
              onClick={() => isSelectedMonth && setSelectedDay(day)}
              className={cn(
                "min-h-[120px] p-3 bg-card transition-colors relative group",
                !isSelectedMonth ? "opacity-30 bg-muted/50 pointer-events-none" : "cursor-pointer hover:bg-muted/30",
                hasEntries && !isSuggested && "bg-day-filled/40",
                isSuggested && "border-2 border-dashed border-day-suggested bg-day-filled/10"
              )}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={cn(
                  "text-sm font-medium h-7 w-7 flex items-center justify-center rounded-full",
                  isSameDay(day, new Date()) && "bg-primary text-primary-foreground"
                )}>
                  {format(day, 'd')}
                </span>
                {isSuggested && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-accent" />
                      </TooltipTrigger>
                      <TooltipContent>Suggested for scheduling</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>

              <div className="space-y-1">
                {dayEntries.slice(0, 3).map(entry => (
                  <div key={entry.id} className="text-[10px] bg-background/80 px-1.5 py-0.5 rounded border truncate shadow-sm">
                    {entry.userName}
                  </div>
                ))}
                {dayEntries.length > 3 && (
                  <div className="text-[10px] text-muted-foreground font-medium pl-1">
                    + {dayEntries.length - 3} more
                  </div>
                )}
              </div>

              {isSelectedMonth && (
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <UserPlus className="h-4 w-4 text-primary" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <DayModal 
        isOpen={!!selectedDay} 
        onClose={() => setSelectedDay(null)} 
        day={selectedDay} 
        instanceId={instanceId}
        entries={entries.filter(e => selectedDay && isSameDay(new Date(e.date), selectedDay))}
        user={user}
        onUpdate={fetchEntries}
      />
    </div>
  );
}
