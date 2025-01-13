import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { updateEvent, type Event, EVENT_TAGS } from '@/lib/firestore';
import { Timestamp } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getEventsByUser } from '@/lib/firestore';
import { toast } from 'sonner';

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
    eventType: event.eventType || 'one_time',
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

      const updateData = {
        title: formData.title,
        description: formData.description,
        date: dateTime,
        location: formData.location,
        tags: formData.tags,
        status: formData.status,
        eventType: formData.eventType,
        linkedProgramId: formData.linkedProgramId === 'none' ? null : formData.linkedProgramId
      };

      // Remove undefined/null values
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined || updateData[key] === null) {
          delete updateData[key];
        }
      });

      await updateEvent(event.id, updateData);
      toast.success('Event updated successfully');
      
      // Close dialog first
      onOpenChange(false);
      
      // Then trigger parent update if callback exists
      if (typeof onEventUpdated === 'function') {
        onEventUpdated();
      }
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error('Failed to update event');
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
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Update Event Information</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <form 
            id="event-edit-form" 
            onSubmit={handleSubmit} 
            className="space-y-6"
          >
            <div className="space-y-2">
              <label className="text-sm font-medium">Event Type</label>
              <Select
                defaultValue={formData.eventType}
                onValueChange={(value: 'one_time' | 'ongoing') => 
                  setFormData(prev => ({ ...prev, eventType: value }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="one_time">One Time Event</SelectItem>
                  <SelectItem value="ongoing">Ongoing Program</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.eventType === 'one_time' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Link to Program (Optional)</label>
                <Select
                  defaultValue={formData.linkedProgramId || 'none'}
                  onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, linkedProgramId: value === 'none' ? undefined : value }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a program" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Program</SelectItem>
                    {ongoingPrograms.map((program) => (
                      <SelectItem key={program.id} value={program.id}>
                        {program.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Event title"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Event description"
                className="min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Date</label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Time</label>
                <Input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Location</label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Event location"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                defaultValue={formData.status}
                onValueChange={(value: EventStatus) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger className="w-full">
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

            <div className="space-y-2">
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
          </form>
        </div>

        <DialogFooter className="mt-auto px-6 py-4 border-t">
          <div className="flex gap-2 justify-end w-full">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" form="event-edit-form">
              Save Changes
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 