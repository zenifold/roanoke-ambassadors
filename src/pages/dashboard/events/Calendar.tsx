import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './Calendar.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getEventsByUser, Event } from '@/lib/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarIcon, ExternalLink, MapPin, Clock } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';

export default function CalendarView() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      if (user) {
        const fetchedEvents = await getEventsByUser(user.uid);
        // Only show published events
        const publishedEvents = fetchedEvents.filter(event => event.status === 'published');
        setEvents(publishedEvents);
      }
    };
    fetchEvents();
  }, [user]);

  const getEventDate = (date: Date | Timestamp | null): Date => {
    if (!date) return new Date();
    return date instanceof Timestamp ? date.toDate() : date;
  };

  const addToGoogleCalendar = (event: Event) => {
    const eventDate = getEventDate(event.date);
    const endDate = new Date(eventDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours duration
    
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${eventDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
    }/${endDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}&details=${encodeURIComponent(event.description || '')}&location=${encodeURIComponent(event.location || '')}`;
    
    window.open(googleCalendarUrl, '_blank');
  };

  const tileContent = ({ date }: { date: Date }) => {
    const eventsOnDate = events.filter(event => {
      const eventDate = getEventDate(event.date);
      return eventDate.toDateString() === date.toDateString();
    });

    if (eventsOnDate.length === 0) return null;

    return (
      <div className="flex flex-col gap-1 mt-1">
        {eventsOnDate.map(event => (
          <div 
            key={event.id}
            className="event-badge"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedEvent(event);
            }}
          >
            {event.title}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Event Calendar</h1>
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard/events')}
          >
            View All Events
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          This calendar displays published events only. Events in planning or other stages can be viewed in the Events list.
        </p>
      </div>
      
      <div className="grid lg:grid-cols-[3fr,1fr] gap-6">
        <Card className="p-6 shadow-lg">
          <Calendar
            className="w-full"
            tileContent={tileContent}
            prevLabel={<CalendarIcon className="h-5 w-5" />}
            nextLabel={<CalendarIcon className="h-5 w-5" />}
            view="month"
          />
        </Card>

        <div className="space-y-4">
          {selectedEvent ? (
            <Card>
              <CardContent className="p-6 space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold mb-2">{selectedEvent.title}</h2>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <p className="text-sm">
                      {getEventDate(selectedEvent.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  {selectedEvent.location && (
                    <div className="flex items-center gap-2 text-muted-foreground mt-2">
                      <MapPin className="h-4 w-4" />
                      <p className="text-sm">{selectedEvent.location}</p>
                    </div>
                  )}
                </div>

                {selectedEvent.description && (
                  <div className="prose prose-sm max-w-none">
                    <p className="text-muted-foreground line-clamp-3">
                      {selectedEvent.description}
                    </p>
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <Button
                    className="w-full"
                    onClick={() => navigate(`/dashboard/events/${selectedEvent.id}`)}
                  >
                    View Details
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => addToGoogleCalendar(selectedEvent)}
                  >
                    Add to Google Calendar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select an event to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 