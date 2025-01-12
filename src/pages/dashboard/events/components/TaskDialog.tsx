import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type Task, getUserProfiles } from '@/lib/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { Checkbox } from '@/components/ui/checkbox';
import { Timestamp } from 'firebase/firestore';

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  eventId: string;
  onSubmit: (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

const statusOptions = [
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'waiting', label: 'Waiting' },
  { value: 'complete', label: 'Complete' }
];

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' }
];

function formatDateForInput(date: Date | Timestamp | string | number | null | undefined): string {
  if (!date) return new Date().toISOString().split('T')[0];
  
  let d: Date;
  if (date instanceof Date) {
    d = date;
  } else if (typeof date === 'string' || typeof date === 'number') {
    d = new Date(date);
  } else {
    // Handle Timestamp
    d = date.toDate();
  }
  
  if (isNaN(d.getTime())) return new Date().toISOString().split('T')[0];
  return d.toISOString().split('T')[0];
}

export function TaskDialog({ open, onOpenChange, task, eventId, onSubmit }: TaskDialogProps) {
  const { user } = useAuth();
  const [userProfiles, setUserProfiles] = useState<Array<{ uid: string; email: string; displayName?: string }>>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as Task['priority'],
    status: 'todo' as Task['status'],
    dueDate: formatDateForInput(new Date()),
    assignees: [] as string[],
    groupId: 'default',
    eventId: '',
    createdBy: '',
  });

  useEffect(() => {
    const loadUserProfiles = async () => {
      try {
        const profiles = await getUserProfiles();
        setUserProfiles(profiles);
      } catch (error) {
        console.error('Error loading user profiles:', error);
      }
    };

    loadUserProfiles();
  }, []);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        dueDate: formatDateForInput(task.dueDate),
        assignees: task.assignees || [],
        groupId: task.groupId,
        eventId: task.eventId || '',
        createdBy: task.createdBy,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        status: 'todo',
        dueDate: formatDateForInput(new Date()),
        assignees: user ? [user.uid] : [],
        groupId: 'default',
        eventId: eventId,
        createdBy: user?.uid || '',
      });
    }
  }, [task, eventId, user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dueDate = new Date(formData.dueDate);
    if (isNaN(dueDate.getTime())) {
      alert('Please enter a valid due date');
      return;
    }
    onSubmit({
      ...formData,
      dueDate,
    });
  };

  const toggleAssignee = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      assignees: prev.assignees.includes(userId)
        ? prev.assignees.filter(id => id !== userId)
        : [...prev.assignees, userId]
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{task ? 'Edit Task' : 'Create Task'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Title</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Task title"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Task description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Priority</label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value as Task['priority'] })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as Task['status'] })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Due Date</label>
            <Input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Assignees</label>
            <div className="mt-2 space-y-2">
              {userProfiles.map(profile => (
                <div key={profile.uid} className="flex items-center space-x-2">
                  <Checkbox
                    id={`assignee-${profile.uid}`}
                    checked={formData.assignees.includes(profile.uid)}
                    onCheckedChange={() => toggleAssignee(profile.uid)}
                  />
                  <label
                    htmlFor={`assignee-${profile.uid}`}
                    className="text-sm text-gray-700"
                  >
                    {profile.displayName || profile.email}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {task ? 'Save Changes' : 'Create Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
