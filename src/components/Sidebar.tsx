import React, { useState } from 'react';
import { blink } from '../lib/blink';
import { Plus, Settings, ChevronLeft, ChevronRight, Edit2, Check, X, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

interface SidebarProps {
  instances: any[];
  currentId: string | null;
  onSelect: (id: string) => void;
  onInstancesChange: (instances: any[]) => void;
  user: any;
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ instances, currentId, onSelect, onInstancesChange, user, isOpen, onToggle }: SidebarProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [newName, setNewName] = useState('');

  const isAdmin = user?.role === 'admin';

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      const newInstance = await blink.db.instances.create({
        user_id: user.id,
        name: newName,
        type: 'calendar',
      });
      onInstancesChange([...instances, newInstance]);
      onSelect(newInstance.id);
      setNewName('');
      setIsCreating(false);
      toast.success('Instance created');
    } catch (e) {
      toast.error('Failed to create instance');
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return;
    try {
      await blink.db.instances.update(id, { name: editName });
      onInstancesChange(instances.map(i => i.id === id ? { ...i, name: editName } : i));
      setEditingId(null);
      toast.success('Updated');
    } catch (e) {
      toast.error('Failed to update');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this calendar instance? All data will be lost.')) return;
    try {
      await blink.db.instances.delete(id);
      const filtered = instances.filter(i => i.id !== id);
      onInstancesChange(filtered);
      if (currentId === id) {
        onSelect(filtered.length > 0 ? filtered[0].id : '');
      }
      toast.success('Deleted');
    } catch (e) {
      toast.error('Failed to delete');
    }
  };

  return (
    <aside className={cn(
      "bg-card border-r transition-all duration-300 flex flex-col h-full shrink-0",
      isOpen ? "w-64" : "w-16"
    )}>
      <div className="h-16 border-b flex items-center justify-between px-4">
        {isOpen && <span className="font-bold text-lg truncate">Calendars</span>}
        <Button variant="ghost" size="icon" onClick={onToggle}>
          {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {instances.map(instance => (
          <div key={instance.id} className="group relative">
            {editingId === instance.id ? (
              <div className="flex items-center gap-1">
                <Input 
                  size="sm" 
                  value={editName} 
                  onChange={e => setEditName(e.target.value)}
                  className="h-8"
                  autoFocus
                />
                <Button variant="ghost" size="icon" className="h-8 w-8 text-green-500" onClick={() => handleUpdate(instance.id)}>
                  <Check className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => setEditingId(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <Button
                  variant={currentId === instance.id ? "secondary" : "ghost"}
                  className={cn(
                    "flex-1 justify-start text-left truncate px-3 h-10",
                    !isOpen && "px-0 justify-center"
                  )}
                  onClick={() => onSelect(instance.id)}
                >
                  {isOpen ? instance.name : instance.name.charAt(0).toUpperCase()}
                </Button>
                
                {isOpen && isAdmin && (
                  <div className="hidden group-hover:flex absolute right-1 items-center bg-secondary rounded-md shadow-sm">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingId(instance.id); setEditName(instance.name); }}>
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(instance.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {isCreating && isOpen ? (
          <div className="space-y-2 p-2 bg-muted rounded-lg">
            <Input 
              placeholder="Calendar name..." 
              value={newName} 
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              className="h-8"
              autoFocus
            />
            <div className="flex gap-2">
              <Button size="sm" className="flex-1 h-8" onClick={handleCreate}>Create</Button>
              <Button size="sm" variant="ghost" className="h-8" onClick={() => setIsCreating(false)}>Cancel</Button>
            </div>
          </div>
        ) : isOpen && isAdmin ? (
          <Button variant="outline" className="w-full border-dashed gap-2" onClick={() => setIsCreating(true)}>
            <Plus className="h-4 w-4" />
            New Instance
          </Button>
        ) : !isOpen && isAdmin ? (
          <Button variant="outline" size="icon" className="w-full border-dashed" onClick={() => { onToggle(); setIsCreating(true); }}>
            <Plus className="h-4 w-4" />
          </Button>
        ) : null}
      </div>

      <div className="p-4 border-t">
        <div className={cn("flex items-center gap-3", !isOpen && "justify-center")}>
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold shrink-0">
            {user?.name.charAt(0).toUpperCase()}
          </div>
          {isOpen && (
            <div className="min-w-0">
              <p className="text-sm font-bold truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
