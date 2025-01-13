import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { createEvent, EVENT_TAGS } from '../../../lib/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function CreateEvent() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [eventType, setEventType] = useState<'one_time' | 'ongoing'>('one_time');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      // Only create a date object for one-time events
      let eventDate = null;
      if (eventType === 'one_time' && date) {
        eventDate = new Date(date);
        if (time) {
          const [hours, minutes] = time.split(':');
          eventDate.setHours(parseInt(hours, 10), parseInt(minutes, 10));
        }
      }

      const eventId = await createEvent({
        title,
        description,
        date: eventDate,
        location: location || null,
        status: 'idea',
        tags: selectedTags,
        collaborators: [user.uid],
        coordinationNotes: '',
        volunteerRoles: [],
        createdBy: user.uid,
        eventType,
      });

      navigate(`/dashboard/events/${eventId}`);
    } catch (error) {
      console.error('Error creating event:', error);
      setError('Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="md:flex md:items-center md:justify-between md:space-x-4 xl:border-b xl:pb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Event</h1>
          <p className="mt-2 text-sm text-gray-500">
            Get started by filling in the information below to create your new event.
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-8 divide-y divide-gray-200">
        <div className="space-y-6">
          <div>
            <label htmlFor="eventType" className="block text-sm font-medium text-gray-700">
              Event Type
            </label>
            <div className="mt-1">
              <Select
                value={eventType}
                onValueChange={(value: 'one_time' | 'ongoing') => setEventType(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="one_time">One Time Event</SelectItem>
                  <SelectItem value="ongoing">Ongoing Program</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              {eventType === 'one_time' ? 'Event Title' : 'Program Title'}
            </label>
            <div className="mt-1">
              <Input
                type="text"
                name="title"
                id="title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={eventType === 'one_time' ? 'Enter event title' : 'Enter program title'}
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <div className="mt-1">
              <Textarea
                id="description"
                name="description"
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={eventType === 'one_time' ? 'Describe the event' : 'Describe the program'}
              />
            </div>
          </div>

          {eventType === 'one_time' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                    Date (Can be changed later)
                  </label>
                  <div className="mt-1">
                    <Input
                      type="date"
                      name="date"
                      id="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="time" className="block text-sm font-medium text-gray-700">
                    Time (Can be changed later)
                  </label>
                  <div className="mt-1">
                    <Input
                      type="time"
                      name="time"
                      id="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  Location
                </label>
                <div className="mt-1">
                  <Input
                    type="text"
                    name="location"
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Enter event location"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tags
            </label>
            <div className="mt-2">
              <div className="flex flex-wrap gap-2">
                {EVENT_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`
                      inline-flex items-center rounded-full px-3 py-1 text-sm
                      ${
                        selectedTags.includes(tag)
                          ? 'bg-black text-white'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }
                    `}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6">
          <div className="flex justify-end gap-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/dashboard/events')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Event'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
} 