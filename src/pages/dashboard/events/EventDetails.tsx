import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Event, Task, UserProfile, VolunteerRole, BudgetItem, FundingSource, canEditEvent, updateEvent, updateVolunteerRole, addVolunteerRole, deleteVolunteerRole, updateTask, deleteTask, getUserProfiles, getTasksByEvent, getBudgetItems, getFundingSources, DEFAULT_CHECKLIST, deleteEvent } from '@/lib/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import EventTasks from '@/pages/dashboard/events/components/EventTasks';
import { format } from 'date-fns';
import { Timestamp } from 'firebase/firestore';
import { CalendarDays, MapPin, Users, FileEdit, ClipboardList, CheckCircle2, Circle, Clock, Plus, Trash2, Clock4, MoreVertical, X, Edit, Archive, User } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { EventEditDialog } from '@/pages/dashboard/events/components/EventEditDialog';
import { EventReportDialog } from '@/pages/dashboard/events/components/EventReportDialog';
import { VolunteerRoleDialog } from '@/pages/dashboard/events/components/VolunteerRoleDialog';
import { CollaboratorDialog } from '@/pages/dashboard/events/components/CollaboratorDialog';
import { BudgetPanel } from '@/pages/dashboard/events/components/BudgetPanel';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { VolunteerFeedbackDialog } from './components/VolunteerFeedbackDialog';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from 'react-router-dom';

const AVAILABLE_METRICS = [
  {
    id: 'attendees',
    label: 'Number of Attendees',
    description: 'Total number of people who attended the event',
    type: 'number'
  },
  {
    id: 'satisfaction',
    label: 'Attendee Satisfaction',
    description: 'Average satisfaction rating from attendees',
    type: 'rating'
  },
  {
    id: 'revenue',
    label: 'Total Revenue',
    description: 'Total revenue generated from the event',
    type: 'currency'
  },
  {
    id: 'expenses',
    label: 'Total Expenses',
    description: 'Total expenses incurred for the event',
    type: 'currency'
  },
  {
    id: 'volunteers',
    label: 'Number of Volunteers',
    description: 'Total number of volunteers who helped with the event',
    type: 'number'
  },
  {
    id: 'impact_score',
    label: 'Impact Score',
    description: 'Overall impact rating of the event (1-5)',
    type: 'rating'
  }
];

interface EventDetailsProps {
  event: Event;
  onEventUpdated?: () => void;
}

function formatDate(date: Date | Timestamp | null | undefined): Date {
  if (!date) return new Date();
  if (date instanceof Timestamp) return date.toDate();
  return date;
}

export function EventDetails({ event, onEventUpdated }: EventDetailsProps) {
  const { user } = useAuth();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [collaboratorDialogOpen, setCollaboratorDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<VolunteerRole | null>(null);
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
  const [coordinationNotes, setCoordinationNotes] = useState(event.coordinationNotes || '');
  const [canEdit, setCanEdit] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [fundingSources, setFundingSources] = useState<FundingSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [checklist, setChecklist] = useState<Array<{ id: string; text: string; completed: boolean }>>(
    event.checklist || DEFAULT_CHECKLIST
  );
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [newChecklistItem, setNewChecklistItem] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const checkPermissions = async () => {
      if (user) {
        const hasEditPermission = await canEditEvent(event.id, user.uid);
        setCanEdit(hasEditPermission);
      }
    };
    checkPermissions();
  }, [event.id, user]);

  useEffect(() => {
    loadData();
  }, [event.id]);

  const loadData = async () => {
    try {
      const [profiles, eventTasks, budget, funding] = await Promise.all([
        getUserProfiles(),
        getTasksByEvent(event.id),
        getBudgetItems(event.id),
        getFundingSources(event.id)
      ]);
      setUserProfiles(profiles);
      setTasks(eventTasks);
      setBudgetItems(budget);
      setFundingSources(funding);
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      toast('Failed to load data', {
        description: 'There was an error loading the event data.',
        duration: 3000
      });
      setLoading(false);
    }
  };

  const handleEventUpdate = async (updatedEvent: Partial<Event>) => {
    try {
      await updateEvent(event.id, updatedEvent);
      onEventUpdated?.();
      toast('Event updated successfully', {
        description: 'The event has been updated.',
        duration: 3000
      });
    } catch (error) {
      console.error('Error updating event:', error);
      toast('Failed to update event', {
        description: 'There was an error updating the event.',
        duration: 3000
      });
    }
  };

  const handleNotesChange = async () => {
    try {
      await updateEvent(event.id, { coordinationNotes });
      onEventUpdated?.();
      toast('Notes updated successfully', {
        description: 'The coordination notes have been updated.',
        duration: 3000
      });
    } catch (error) {
      console.error('Error updating notes:', error);
      toast('Failed to update notes', {
        description: 'There was an error updating the coordination notes.',
        duration: 3000
      });
    }
  };

  const handleRoleSubmit = async (roleData: Omit<VolunteerRole, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (selectedRole) {
        await updateVolunteerRole(selectedRole.id, roleData, event.id);
      } else {
        await addVolunteerRole(roleData, event.id);
      }
      onEventUpdated?.();
      toast('Role saved successfully', {
        description: 'The volunteer role has been saved.',
        duration: 3000
      });
    } catch (error) {
      console.error('Error saving role:', error);
      toast('Failed to save role', {
        description: 'There was an error saving the volunteer role.',
        duration: 3000
      });
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    try {
      await deleteVolunteerRole(roleId, event.id);
      onEventUpdated?.();
      toast('Role deleted successfully', {
        description: 'The volunteer role has been deleted.',
        duration: 3000
      });
    } catch (error) {
      console.error('Error deleting role:', error);
      toast('Failed to delete role', {
        description: 'There was an error deleting the volunteer role.',
        duration: 3000
      });
    }
  };

  const handleTaskStatusChange = async (taskId: string, newStatus: Task['status']) => {
    try {
      await updateTask(taskId, { status: newStatus });
      const updatedTasks = await getTasksByEvent(event.id);
      setTasks(updatedTasks);
      toast('Task status updated', {
        description: 'The task status has been updated.',
        duration: 3000
      });
    } catch (error) {
      console.error('Error updating task status:', error);
      toast('Failed to update task status', {
        description: 'There was an error updating the task status.',
        duration: 3000
      });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      const updatedTasks = await getTasksByEvent(event.id);
      setTasks(updatedTasks);
      toast('Task deleted successfully', {
        description: 'The task has been deleted.',
        duration: 3000
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast('Failed to delete task', {
        description: 'There was an error deleting the task.',
        duration: 3000
      });
    }
  };

  const getTaskStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'complete':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'waiting':
        return <Clock4 className="w-4 h-4 text-yellow-500" />;
      default:
        return <Circle className="w-4 h-4 text-gray-400" />;
    }
  };

  const tasksByStatus = {
    complete: tasks.filter(task => task.status === 'complete').length,
    in_progress: tasks.filter(task => task.status === 'in_progress').length,
    waiting: tasks.filter(task => task.status === 'waiting').length,
    todo: tasks.filter(task => task.status === 'todo').length
  };

  const totalTasks = tasks.length;
  const completionPercentage = totalTasks > 0 
    ? Math.round((tasksByStatus.complete / totalTasks) * 100)
    : 0;

  const getCollaboratorName = (userId: string): string => {
    const profile = userProfiles.find(p => p.uid === userId);
    return profile ? profile.displayName || profile.email : 'Unknown User';
  };

  const handleChecklistItemToggle = async (itemId: string) => {
    try {
      const updatedChecklist = checklist.map(item =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      );
      setChecklist(updatedChecklist);
      await updateEvent(event.id, { checklist: updatedChecklist });
      toast('Checklist updated', {
        description: 'The checklist item has been updated.',
        duration: 3000
      });
    } catch (error) {
      console.error('Error updating checklist:', error);
      toast('Failed to update checklist', {
        description: 'There was an error updating the checklist item.',
        duration: 3000
      });
    }
  };

  const handleAddChecklistItem = async () => {
    if (!newChecklistItem.trim()) return;
    
    const updatedChecklist = [
      ...(event.checklist || []),
      {
        id: crypto.randomUUID(),
        text: newChecklistItem,
        completed: false
      }
    ];
    
    try {
      await updateEvent(event.id, { checklist: updatedChecklist });
      setNewChecklistItem("");
      toast('Checklist item added', { description: 'The new item has been added to the checklist.', duration: 3000 });
    } catch (error) {
      toast('Failed to add checklist item', { description: 'There was an error adding the item. Please try again.', duration: 3000 });
    }
  };

  const handleAssignChecklistItem = async (itemId: string, userId: string) => {
    const updatedChecklist = event.checklist?.map(item => 
      item.id === itemId ? { ...item, assignedTo: userId } : item
    );
    
    try {
      await updateEvent(event.id, { checklist: updatedChecklist });
      toast('Assignee updated', { description: 'The checklist item has been assigned successfully.', duration: 3000 });
    } catch (error) {
      toast('Failed to update assignee', { description: 'There was an error updating the assignee. Please try again.', duration: 3000 });
    }
  };

  const handleDeleteEvent = async () => {
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteEvent(event.id);
      toast('Event deleted successfully', {
        description: 'The event has been permanently deleted.',
        duration: 3000
      });
      navigate('/dashboard/events');
    } catch (error) {
      console.error('Error deleting event:', error);
      toast('Failed to delete event', {
        description: 'There was an error deleting the event. Please try again.',
        duration: 3000
      });
    }
  };

  const handleArchiveEvent = async () => {
    try {
      await updateEvent(event.id, { status: 'archived' });
      toast('Event archived successfully', {
        description: 'The event has been moved to the archive.',
        duration: 3000
      });
      if (onEventUpdated) {
        onEventUpdated();
      }
    } catch (error) {
      console.error('Error archiving event:', error);
      toast('Failed to archive event', {
        description: 'There was an error archiving the event. Please try again.',
        duration: 3000
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">{event.title}</h1>
            <p className="text-sm text-gray-500 mt-2">{event.description}</p>
          </div>
          {canEdit && (
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setEditDialogOpen(true)}
                className="bg-black text-white hover:bg-gray-800"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Event
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleArchiveEvent}>
                    <Archive className="mr-2 h-4 w-4" />
                    Archive Event
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleDeleteEvent} className="text-red-600">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Event
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center">
            <CalendarDays className="w-4 h-4 mr-1" />
            {format(formatDate(event.date), 'PPP')}
          </div>
          {event.location && (
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              {event.location}
            </div>
          )}
          <div className="flex items-center">
            <User className="w-4 h-4 mr-1" />
            Created by you
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            {format(formatDate(event.createdAt), 'PPP')}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{event.status}</Badge>
          {event.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="coordination">Event Day</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium">Description</h3>
                <p className="text-sm text-muted-foreground">{event.description}</p>
              </div>
              <div>
                <h3 className="font-medium">Date</h3>
                <p className="text-sm text-muted-foreground">{format(formatDate(event.date), 'PPP')}</p>
              </div>
              <div>
                <h3 className="font-medium">Location</h3>
                <p className="text-sm text-muted-foreground">{event.location}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Coordination Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  value={coordinationNotes}
                  onChange={(e) => setCoordinationNotes(e.target.value)}
                  onBlur={handleNotesChange}
                  placeholder="Add coordination notes here..."
                  className="min-h-[100px]"
                  disabled={!canEdit}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Collaborators</CardTitle>
              {canEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCollaboratorDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Collaborator
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {event.collaborators.map(userId => (
                  <div key={userId} className="flex items-center justify-between">
                    <span className="text-sm">{getCollaboratorName(userId)}</span>
                    {canEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEventUpdate({ collaborators: event.collaborators.filter(id => id !== userId) })}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                {event.collaborators.length === 0 && (
                  <p className="text-sm text-muted-foreground">No collaborators added</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4 pt-4">
          <EventTasks
            tasks={tasks}
            eventId={event.id}
            onTasksUpdated={loadData}
          />
        </TabsContent>

        <TabsContent value="coordination" className="pt-4">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Input 
                placeholder="Add new checklist item..."
                value={newChecklistItem}
                onChange={(e) => setNewChecklistItem(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleAddChecklistItem}>Add Item</Button>
            </div>
            
            <ScrollArea className="h-[400px] rounded-md border p-4">
              {event.checklist?.map((item) => (
                <div key={item.id} className="flex items-center space-x-2 py-2">
                  <Checkbox
                    checked={item.completed}
                    onCheckedChange={(checked) => {
                      const updatedChecklist = event.checklist?.map(i =>
                        i.id === item.id ? { ...i, completed: checked === true } : i
                      );
                      updateEvent(event.id, { checklist: updatedChecklist });
                    }}
                  />
                  <span className="flex-1">{item.text}</span>
                  <Select
                    value={item.assignedTo || ""}
                    onValueChange={(value) => handleAssignChecklistItem(item.id, value)}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Assign to..." />
                    </SelectTrigger>
                    <SelectContent>
                      {userProfiles.map((profile) => (
                        <SelectItem key={profile.uid} value={profile.uid}>
                          {profile.displayName || profile.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </ScrollArea>
          </div>
        </TabsContent>

        <TabsContent value="budget" className="space-y-4 pt-4">
          <BudgetPanel
            eventId={event.id}
            budgetItems={budgetItems}
            fundingSources={fundingSources}
            onBudgetUpdated={(newBudget, newFunding) => {
              setBudgetItems(newBudget);
              setFundingSources(newFunding);
            }}
          />
        </TabsContent>

        <TabsContent value="reports" className="space-y-4 pt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>Post-Event Report</CardTitle>
              {canEdit && (
                <Button
                  onClick={() => setReportDialogOpen(true)}
                  className="bg-black text-white hover:bg-gray-800"
                >
                  <FileEdit className="h-4 w-4 mr-2" />
                  {event.report ? 'Edit Report' : 'Add Report'}
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {event.report ? (
                <>
                  {/* Metrics Section */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-lg">Event Metrics</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {event.report.metrics.map((metric) => {
                        const definition = AVAILABLE_METRICS.find(
                          m => m.id === metric.definitionId
                        );
                        if (!definition) return null;
                        
                        return (
                          <div key={metric.definitionId} className="space-y-1">
                            <p className="text-sm font-medium text-gray-700">
                              {definition.label}
                            </p>
                            <p className="text-sm text-gray-600">
                              {typeof metric.value === 'boolean' 
                                ? metric.value ? 'Yes' : 'No'
                                : metric.value}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Feedback Section */}
                  <div className="space-y-2">
                    <h3 className="font-medium text-lg">General Feedback</h3>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">
                      {event.report.feedback}
                    </p>
                  </div>

                  {/* Notes Section */}
                  <div className="space-y-2">
                    <h3 className="font-medium text-lg">Additional Notes</h3>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">
                      {event.report.notes}
                    </p>
                  </div>

                  <div className="text-sm text-gray-500">
                    <p>Submitted by: {getCollaboratorName(event.report.submittedBy)}</p>
                    <p>Last updated: {format(formatDate(event.report.updatedAt), 'PPP')}</p>
                  </div>
                </>
              ) : (
                <div className="text-center py-6">
                  <h3 className="text-sm font-semibold text-gray-900">No report yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Add a report to track the event's impact and outcomes.
                  </p>
                  {canEdit && (
                    <Button
                      onClick={() => setReportDialogOpen(true)}
                      className="mt-4"
                      variant="outline"
                    >
                      <FileEdit className="h-4 w-4 mr-2" />
                      Create Report
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <EventEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        event={event}
        onEventUpdated={onEventUpdated}
      />

      <EventReportDialog
        open={reportDialogOpen}
        onOpenChange={setReportDialogOpen}
        event={event}
        onReportUpdated={onEventUpdated}
      />

      <VolunteerRoleDialog
        open={roleDialogOpen}
        onOpenChange={setRoleDialogOpen}
        role={selectedRole}
        eventId={event.id}
        onSubmit={handleRoleSubmit}
      />

      <CollaboratorDialog
        open={collaboratorDialogOpen}
        onOpenChange={setCollaboratorDialogOpen}
        collaborators={event.collaborators}
        onSubmit={(collaborators) => handleEventUpdate({ collaborators })}
      />

      {selectedRole && (
        <VolunteerFeedbackDialog
          open={feedbackDialogOpen}
          onOpenChange={setFeedbackDialogOpen}
          eventId={event.id}
          role={selectedRole}
        />
      )}
    </div>
  );
}
