import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { getEventsByUser, type Event, updateEvent, deleteEvent, getUserProfile, type UserProfile } from '../../../lib/firestore';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../../components/ui/select';
import { toast } from 'sonner';
import { CalendarDays, MapPin, User, Clock, MoreVertical, Edit, Archive, Trash2, ListFilter, Calendar, CalendarRange, ArrowUpDown, Layers, BookOpen } from 'lucide-react';
import { formatDate } from '../../../utils/formatDate';
import { Badge } from '../../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Button } from '../../../components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../../../components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';

export default function EventsList() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [events, setEvents] = useState<Event[]>([]);
  const [userProfiles, setUserProfiles] = useState<Record<string, UserProfile>>({});
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'all' | 'grouped'>('all');
  const [selectedEventType, setSelectedEventType] = useState<'all' | 'one_time' | 'ongoing'>('all');
  const [selectedProgram, setSelectedProgram] = useState<string>('none');
  const [ongoingPrograms, setOngoingPrograms] = useState<Event[]>([]);
  const [sortBy, setSortBy] = useState<'created' | 'date'>('created');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const loadEvents = async () => {
      if (!user) return;
      try {
        const events = await getEventsByUser(user.uid);
        setEvents(events);
        
        // Fetch creator profiles for all events
        const creatorIds = [...new Set(events.map(event => event.createdBy))];
        const profiles = await Promise.all(
          creatorIds.map(async (creatorId) => {
            const profile = await getUserProfile(creatorId);
            return [creatorId, profile];
          })
        );
        
        setUserProfiles(Object.fromEntries(profiles.filter(([_, profile]) => profile !== null)));
        setOngoingPrograms(events.filter(e => e.eventType === 'ongoing'));
      } catch (error) {
        console.error('Error loading events:', error);
        setError('Failed to load events');
      } finally {
        setLoading(false);
      }
    };
    loadEvents();
  }, [user]);

  const sortEvents = (events: Event[]) => {
    return [...events].sort((a, b) => {
      if (sortBy === 'created') {
        const aDate = a.createdAt instanceof Date ? a.createdAt : (a.createdAt as any).toDate();
        const bDate = b.createdAt instanceof Date ? b.createdAt : (b.createdAt as any).toDate();
        return sortOrder === 'desc' ? bDate.getTime() - aDate.getTime() : aDate.getTime() - bDate.getTime();
      } else {
        const aDate = a.date ? (a.date instanceof Date ? a.date : (a.date as any).toDate()) : new Date(0);
        const bDate = b.date ? (b.date instanceof Date ? b.date : (b.date as any).toDate()) : new Date(0);
        return sortOrder === 'desc' ? bDate.getTime() - aDate.getTime() : aDate.getTime() - bDate.getTime();
      }
    });
  };

  const filteredEvents = sortEvents(events.filter(event => {
    if (selectedStatus !== 'all' && event.status !== selectedStatus) return false;
    if (selectedEventType !== 'all' && event.eventType !== selectedEventType) return false;
    if (selectedProgram !== 'none' && event.linkedProgramId !== selectedProgram) return false;
    return true;
  }));

  const groupedEvents = {
    idea: filteredEvents.filter(event => event.status === 'idea'),
    planning: filteredEvents.filter(event => event.status === 'planning'),
    published: filteredEvents.filter(event => event.status === 'published'),
    complete: filteredEvents.filter(event => event.status === 'complete'),
  };

  const renderEventStatus = (status: Event['status']) => {
    switch (status) {
      case 'idea':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800 hover:bg-gray-100">Idea</Badge>;
      case 'planning':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Planning</Badge>;
      case 'published':
        return <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">Published</Badge>;
      case 'complete':
        return <Badge variant="secondary" className="bg-purple-100 text-purple-800 hover:bg-purple-100">Complete</Badge>;
      case 'archived':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-600 hover:bg-gray-100">Archived</Badge>;
      default:
        return null;
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteEvent(eventId);
      setEvents(events.filter(e => e.id !== eventId));
      toast('Event deleted successfully', {
        description: 'The event has been permanently deleted.',
        duration: 3000
      });
    } catch (error) {
      console.error('Error deleting event:', error);
      toast('Failed to delete event', {
        description: 'There was an error deleting the event. Please try again.',
        duration: 3000
      });
    }
  };

  const handleUpdateEventStatus = async (eventId: string, newStatus: Event['status']) => {
    try {
      await updateEvent(eventId, { status: newStatus });
      setEvents(events.map(e => e.id === eventId ? { ...e, status: newStatus } : e));
      toast('Event status updated', {
        description: 'The event status has been updated successfully.',
        duration: 3000
      });
    } catch (error) {
      console.error('Error updating event status:', error);
      toast('Failed to update event status', {
        description: 'There was an error updating the event status. Please try again.',
        duration: 3000
      });
    }
  };

  const renderEventCard = (event: Event) => {
    const creator = userProfiles[event.createdBy];
    const isCurrentUser = event.createdBy === user?.uid;
    const creatorName = isCurrentUser 
      ? 'you'
      : creator 
        ? `${creator.firstName} ${creator.lastName}` 
        : 'Unknown User';

    return (
      <div className="block bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <Link to={`/dashboard/events/${event.id}`} className="flex-1">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{event.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-3">{event.description}</p>
              </div>
            </Link>
            <div className="flex items-center gap-2">
              {renderEventStatus(event.status)}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to={`/dashboard/events/${event.id}`}>
                      <Edit className="mr-2 h-4 w-4" />
                      View Details
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => handleUpdateEventStatus(event.id, 'idea')}>
                    Set as Idea
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => handleUpdateEventStatus(event.id, 'planning')}>
                    Set as Planning
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => handleUpdateEventStatus(event.id, 'published')}>
                    Set as Published
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => handleUpdateEventStatus(event.id, 'complete')}>
                    Set as Complete
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => handleUpdateEventStatus(event.id, 'archived')}>
                    <Archive className="mr-2 h-4 w-4" />
                    Archive Event
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onSelect={() => handleDeleteEvent(event.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Event
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {event.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-500">
            <div className="flex items-center">
              <CalendarDays className="w-4 h-4 mr-1.5 flex-shrink-0" />
              <span>{formatDate(event.date)}</span>
            </div>
            {event.location && (
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1.5 flex-shrink-0" />
                <span className="truncate">{event.location}</span>
              </div>
            )}
            <div className="flex items-center">
              <User className="w-4 h-4 mr-1.5 flex-shrink-0" />
              <span>Created by {creatorName}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Events</h1>
          <p className="mt-2 text-sm text-gray-700">
            View and manage your events
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            to="/dashboard/events/new"
            className="inline-flex items-center rounded-md bg-black px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
          >
            Create Event
          </Link>
        </div>
      </div>

      <div className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
          <Card className="p-4 space-y-2">
            <Label className="flex items-center gap-2">
              <ListFilter className="w-4 h-4" />
              Status
            </Label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="idea">Idea</SelectItem>
                <SelectItem value="planning">Planning</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="complete">Complete</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </Card>

          <Card className="p-4 space-y-2">
            <Label className="flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Event Type
            </Label>
            <Select 
              value={selectedEventType} 
              onValueChange={(value) => setSelectedEventType(value as 'all' | 'one_time' | 'ongoing')}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="one_time">One Time Events</SelectItem>
                <SelectItem value="ongoing">Ongoing Programs</SelectItem>
              </SelectContent>
            </Select>
          </Card>

          <Card className="p-4 space-y-2">
            <Label className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Linked Program
            </Label>
            <Select value={selectedProgram} onValueChange={setSelectedProgram}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by program" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">All Events</SelectItem>
                {ongoingPrograms.map((program) => (
                  <SelectItem key={program.id} value={program.id}>
                    {program.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Card>

          <Card className="p-4 space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Sort By
            </Label>
            <Select 
              value={sortBy} 
              onValueChange={(value) => setSortBy(value as 'created' | 'date')}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created">Creation Date</SelectItem>
                <SelectItem value="date">Event Date</SelectItem>
              </SelectContent>
            </Select>
          </Card>

          <Card className="p-4 space-y-2">
            <Label className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4" />
              Sort Order
            </Label>
            <Select 
              value={sortOrder} 
              onValueChange={(value) => setSortOrder(value as 'asc' | 'desc')}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sort order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Newest First</SelectItem>
                <SelectItem value="asc">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </Card>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-sm font-semibold text-gray-900">No events found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new event.
            </p>
            <div className="mt-6">
              <Link
                to="/dashboard/events/new"
                className="inline-flex items-center rounded-md bg-black px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
              >
                Create Event
              </Link>
            </div>
          </div>
        ) : viewMode === 'all' ? (
          <div className="grid grid-cols-1 gap-4">
            {filteredEvents.map((event) => (
              <div key={event.id}>
                {renderEventCard(event)}
              </div>
            ))}
          </div>
        ) : (
          <Tabs defaultValue="idea" className="w-full">
            <TabsList>
              <TabsTrigger value="idea">Ideas ({groupedEvents.idea.length})</TabsTrigger>
              <TabsTrigger value="planning">Planning ({groupedEvents.planning.length})</TabsTrigger>
              <TabsTrigger value="published">Published ({groupedEvents.published.length})</TabsTrigger>
              <TabsTrigger value="complete">Complete ({groupedEvents.complete.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="idea" className="mt-6">
              <div className="grid grid-cols-1 gap-4">
                {groupedEvents.idea.map((event) => (
                  <div key={event.id}>
                    {renderEventCard(event)}
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="planning" className="mt-6">
              <div className="grid grid-cols-1 gap-4">
                {groupedEvents.planning.map((event) => (
                  <div key={event.id}>
                    {renderEventCard(event)}
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="published" className="mt-6">
              <div className="grid grid-cols-1 gap-4">
                {groupedEvents.published.map((event) => (
                  <div key={event.id}>
                    {renderEventCard(event)}
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="complete" className="mt-6">
              <div className="grid grid-cols-1 gap-4">
                {groupedEvents.complete.map((event) => (
                  <div key={event.id}>
                    {renderEventCard(event)}
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
} 