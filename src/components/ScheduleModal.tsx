import React, { useState } from 'react';
import { blink } from '../lib/blink';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Trash2, UserPlus, AlertCircle, Sparkles, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { startOfMonth, addDays } from 'date-fns';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  slot: { date: Date; hour: number } | null;
  instanceId: string;
  entries: any[];
  user: any;
  onUpdate: () => void;
}

export function ScheduleModal({ isOpen, onClose, slot, instanceId, entries, user, onUpdate }: ScheduleModalProps) {
  const [name, setName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  if (!slot) return null;

  const dateStr = format(slot.date, 'yyyy-MM-dd');
  const isAdmin = user?.role === 'admin';
  const isReviewer = user?.role === 'reviewer';

  const isArchived = () => {
    if (isAdmin) return false;
    const entryDate = new Date(dateStr);
    const today = new Date();
    const currentMonthStart = startOfMonth(today);
    const archiveCutoff = addDays(currentMonthStart, 3);
    return new Date() > archiveCutoff && entryDate < currentMonthStart;
  };

  const handleAdd = async () => {
    if (isArchived()) {
      toast.error('This slot is archived and cannot be modified');
      return;
    }
    const finalName = name.trim() || user?.name;
    if (!finalName) return;

    if (entries.some(e => e.userName === finalName)) {
      toast.error('Name already in this slot');
      return;
    }

    setIsAdding(true);
    try {
      await blink.db.entries.create({
        instance_id: instanceId,
        user_id: user.id,
        user_name: finalName,
        date: dateStr,
        hour: slot.hour,
        is_suggested: 0,
      });
      setName('');
      onUpdate();
      toast.success('Added to schedule');
    } catch (e) {
      toast.error('Failed to add');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (entryId: string, entryName: string) => {
    if (isArchived()) {
      toast.error('This slot is archived and cannot be modified');
      return;
    }
    const entry = entries.find(e => e.id === entryId);
    const isOwner = entry?.userId === user.id;

    if (!isOwner && !isAdmin && !isReviewer) {
      toast.error('Permissions required');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${entryName}?`)) return;

    try {
      await blink.db.entries.delete(entryId);
      onUpdate();
      toast.success('Removed');
    } catch (e) {
      toast.error('Failed to remove');
    }
  };

  const toggleSuggest = async () => {
    if (!isAdmin) return;
    const isSuggested = entries.some(e => Number(e.isSuggested) > 0);
    try {
      if (isSuggested) {
        const suggestEntry = entries.find(e => Number(e.isSuggested) > 0);
        if (suggestEntry) await blink.db.entries.delete(suggestEntry.id);
      } else {
        await blink.db.entries.create({
          instance_id: instanceId,
          user_id: user.id,
          user_name: 'System',
          date: dateStr,
          hour: slot.hour,
          is_suggested: 1,
        });
      }
      onUpdate();
      toast.success(isSuggested ? 'Slot unsuggested' : 'Slot suggested');
    } catch (e) {
      toast.error('Failed to update');
    }
  };

  const normalEntries = entries.filter(e => Number(e.isSuggested) === 0);
  const isSuggested = entries.some(e => Number(e.isSuggested) > 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <span>{format(slot.date, 'EEEE')} at {format(slot.date, 'HH:00')}</span>
            </div>
            {isSuggested && <span className="text-xs font-bold bg-accent/20 text-accent px-2 py-1 rounded-full border border-accent/30 flex items-center gap-1"><Sparkles className="h-3 w-3" /> SUGGESTED</span>}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-muted-foreground">Scheduled for this hour</h4>
            {normalEntries.length > 0 ? (
              <div className="grid gap-2">
                {normalEntries.map(entry => (
                  <div key={entry.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border group">
                    <span className="font-medium">{entry.userName}</span>
                    {(entry.userId === user.id || isAdmin || isReviewer) && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDelete(entry.id, entry.userName)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-muted/10 border border-dashed rounded-lg text-center text-sm text-muted-foreground italic">
                Empty slot.
              </div>
            )}
          </div>

          <div className="space-y-2 pt-2">
            <label className="text-sm font-bold text-muted-foreground">Add to schedule</label>
            <div className="flex gap-2">
              <Input 
                placeholder={user?.name || "Name..."} 
                value={name} 
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
                disabled={isArchived()}
              />
              <Button onClick={handleAdd} disabled={isAdding || isArchived()}>
                {isAdding ? 'Adding...' : 'Schedule'}
              </Button>
            </div>
            {isArchived() && <p className="text-[10px] text-destructive flex items-center gap-1 mt-1"><AlertCircle className="h-3 w-3" /> This slot is archived</p>}
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 sm:justify-between">
          {isAdmin && (
            <Button variant="ghost" className="text-accent gap-2" onClick={toggleSuggest}>
              <Sparkles className="h-4 w-4" />
              {isSuggested ? 'Unsuggest' : 'Suggest'}
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
