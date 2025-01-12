import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { updateEvent, type Event, EVENT_TAGS } from '@/lib/firestore';
import { Timestamp } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { getEventsByUser } from '@/lib/firestore';

interface EventEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: Event;
  onEventUpdated: () => void;
}

type EventStatus = 'idea' | 'planning' | 'published' | 'complete';

const EVENT_STATUSES: { value: EventStatus; label: string }[] = [
  { value: 'idea', label: 'Idea' },
  { value: 'planning', label: 'Planning' },
  { value: 'published', label: 'Published' },
  { value: 'complete', label: 'Complete' }
];

export function EventEditDialog({ open, onOpenChange, event, onEventUpdated }: EventEditDialogProps) {
  type FormData = {
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    tags: string[];
    status: EventStatus;
    eventType: 'one_time' | 'ongoing';
    linkedProgramId?: string;
  };

  const [formData, setFormData] = useState<FormData>({
    title: event.title,
    description: event.description,
    date: event.date instanceof Timestamp ? event.date.toDate().toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    time: '',
    location: event.location || '',
    tags: event.tags || [],
    status: event.status as EventStatus,
    eventType: event.eventType,
    linkedProgramId: event.linkedProgramId
  });

  const [ongoingPrograms, setOngoingPrograms] = useState<Event[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const loadPrograms = async () => {
      if (!user) return;
      try {
        const events = await getEventsByUser(user.uid);
        setOngoingPrograms(events.filter(e => 
          e.eventType === 'ongoing' && e.id !== event.id
        ));
      } catch (error) {
        console.error('Error loading programs:', error);
      }
    };
    loadPrograms();
  }, [user, event.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dateTime = new Date(formData.date);
      if (formData.time) {
        const [hours, minutes] = formData.time.split(':');
        dateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10));
      }

      await updateEvent(event.id, {
        title: formData.title,
        description: formData.description,
        date: dateTime,
        location: formData.location,
        tags: formData.tags,
        status: formData.status,
        eventType: formData.eventType,
        linkedProgramId: formData.linkedProgramId
      });

      onEventUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating event:', error);
      alert('Failed to update event');
    }
  };

  const toggleTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Update Event Information</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="p-6 pt-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-sm font-medium">Event Type</label>
              <Select
                value={formData.eventType}
                onValueChange={(value: 'one_time' | 'ongoing') => 
                  setFormData({ ...formData, eventType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="one_time">One Time Event</SelectItem>
                  <SelectItem value="ongoing">Ongoing Program</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.eventType === 'one_time' && (
              <div>
                <label className="text-sm font-medium">Link to Program (Optional)</label>
                <Select
                  value={formData.linkedProgramId || ''}
                  onValueChange={(value) => 
                    setFormData({ ...formData, linkedProgramId: value || undefined })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a program" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No Program</SelectItem>
                    {ongoingPrograms.map((program) => (
                      <SelectItem key={program.id} value={program.id}>
                        {program.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Event title"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Event description"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Date</label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Time</label>
                <Input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Location</label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Event location"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Status</label>
              <Select
                value={formData.status}
                onValueChange={(value: EventStatus) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_STATUSES.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Tags</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {EVENT_TAGS.map((tag) => (
                  <Badge
                    key={tag}
                    variant={formData.tags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                    {formData.tags.includes(tag) && (
                      <X className="w-3 h-3 ml-1" onClick={(e) => {
                        e.stopPropagation();
                        toggleTag(tag);
                      }} />
                    )}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Save Changes
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
} 