import React, { useState, useEffect } from 'react';
import { blink } from '../lib/blink';
import { Plus, Trash2, StickyNote, Calendar as CalendarIcon, Clock, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { format } from 'date-fns';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

interface NoticeBoardProps {
  user: any;
}

const COLORS = [
  { name: 'Yellow', bg: 'bg-yellow-100 dark:bg-yellow-900/30', border: 'border-yellow-200 dark:border-yellow-800' },
  { name: 'Blue', bg: 'bg-blue-100 dark:bg-blue-900/30', border: 'border-blue-200 dark:border-blue-800' },
  { name: 'Green', bg: 'bg-green-100 dark:bg-green-900/30', border: 'border-green-200 dark:border-green-800' },
  { name: 'Pink', bg: 'bg-pink-100 dark:bg-pink-900/30', border: 'border-pink-200 dark:border-pink-800' },
  { name: 'Purple', bg: 'bg-purple-100 dark:bg-purple-900/30', border: 'border-purple-200 dark:border-purple-800' },
];

export function NoticeBoard({ user }: NoticeBoardProps) {
  const [notices, setNotices] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [colorIdx, setColorIdx] = useState(0);

  const isAdmin = user?.role === 'admin';

  const fetchNotices = async () => {
    const list = await blink.db.notices.list({ orderBy: { createdAt: 'desc' } });
    setNotices(list);
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleCreate = async () => {
    if (!title.trim()) return;
    try {
      await blink.db.notices.create({
        user_id: user.id,
        title,
        description: desc,
        date: new Date().toISOString(),
        color: colorIdx.toString(),
      });
      setTitle('');
      setDesc('');
      setIsCreating(false);
      fetchNotices();
      toast.success('Notice posted');
    } catch (e) {
      toast.error('Failed to post notice');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this notice?')) return;
    try {
      await blink.db.notices.delete(id);
      fetchNotices();
      toast.success('Notice removed');
    } catch (e) {
      toast.error('Failed to remove');
    }
  };

  return (
    <div className="flex flex-col h-full bg-muted/30 border rounded-xl overflow-hidden shadow-sm animate-fade-in">
      <div className="p-4 border-b bg-card flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StickyNote className="h-5 w-5 text-primary" />
          <h3 className="font-bold">Notice Board</h3>
        </div>
        {isAdmin && (
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsCreating(true)}>
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isCreating && (
          <div className="p-4 bg-card border rounded-lg shadow-md space-y-3 relative animate-slide-up">
            <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => setIsCreating(false)}>
              <X className="h-3 w-3" />
            </Button>
            <Input 
              placeholder="Title..." 
              value={title} 
              onChange={e => setTitle(e.target.value)}
              className="font-bold border-none px-0 focus-visible:ring-0 text-base"
              autoFocus
            />
            <Textarea 
              placeholder="Description..." 
              value={desc} 
              onChange={e => setDesc(e.target.value)}
              className="resize-none border-none px-0 focus-visible:ring-0 min-h-[80px] text-sm"
            />
            <div className="flex items-center justify-between">
              <div className="flex gap-1.5">
                {COLORS.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => setColorIdx(i)}
                    className={cn(
                      "h-5 w-5 rounded-full border shadow-sm",
                      c.bg,
                      colorIdx === i ? "ring-2 ring-primary ring-offset-1" : ""
                    )}
                  />
                ))}
              </div>
              <Button size="sm" onClick={handleCreate}>Post</Button>
            </div>
          </div>
        )}

        {notices.length > 0 ? (
          notices.map(notice => {
            const color = COLORS[parseInt(notice.color) || 0];
            return (
              <div key={notice.id} className={cn("p-4 border rounded-lg shadow-sm relative group", color.bg, color.border)}>
                {isAdmin && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 absolute top-2 right-2 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDelete(notice.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
                <h4 className="font-bold mb-1 pr-6">{notice.title}</h4>
                <p className="text-sm opacity-90 mb-3 whitespace-pre-wrap">{notice.description}</p>
                <div className="flex items-center gap-3 text-[10px] font-medium opacity-60">
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="h-3 w-3" />
                    {format(new Date(notice.date), 'MMM do')}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {format(new Date(notice.date), 'HH:mm')}
                  </div>
                </div>
              </div>
            );
          })
        ) : !isCreating && (
          <div className="h-40 flex flex-col items-center justify-center text-muted-foreground opacity-50 space-y-2">
            <StickyNote className="h-8 w-8" />
            <p className="text-sm">No notices yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
