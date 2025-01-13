import { type Task, createTask, updateTask, getUserProfiles } from '../../../../lib/firestore';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { TaskDialog } from './TaskDialog';
import { Pencil, Calendar, User, ListFilter, ArrowUpDown, LayoutGrid, LayoutList, AlertTriangle, Clock, CheckCircle2, Circle } from 'lucide-react';
import { format } from 'date-fns';
import { Timestamp } from 'firebase/firestore';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface EventTasksProps {
  tasks: Task[];
  eventId: string;
  onTasksUpdated: () => void;
}

const statusOptions = [
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'waiting', label: 'Waiting' },
  { value: 'complete', label: 'Complete' }
];

const priorityColors = {
  low: 'bg-blue-100 text-blue-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800'
};

const statusColors = {
  todo: 'bg-gray-100 text-gray-800',
  in_progress: 'bg-blue-100 text-blue-800',
  waiting: 'bg-yellow-100 text-yellow-800',
  complete: 'bg-green-100 text-green-800'
};

const statusOrder = { todo: 0, in_progress: 1, waiting: 2, complete: 3 };
const priorityOrder = { low: 0, medium: 1, high: 2 };

function formatDate(date: Date | Timestamp | null | undefined): Date {
  if (!date) return new Date();
  if (date instanceof Date) return date;
  return date.toDate();
}

function isValidDate(date: any): date is Date {
  return date instanceof Date && !isNaN(date.getTime());
}

function formatDueDate(date: Date | Timestamp | string | number | null | undefined): string {
  if (!date) return 'No due date';
  
  let d: Date;
  if (date instanceof Date) {
    d = date;
  } else if (date instanceof Timestamp) {
    d = date.toDate();
  } else {
    d = new Date(date);
  }
  
  if (!isValidDate(d)) return 'Invalid date';
  return format(d, 'MMM d, yyyy');
}

const sortTasks = (tasks: Task[], sortBy: string) => {
  return [...tasks].sort((a, b) => {
    switch (sortBy) {
      case 'dueDate': {
        const dateA = formatDate(a.dueDate);
        const dateB = formatDate(b.dueDate);
        return dateA.getTime() - dateB.getTime();
      }
      case 'priority':
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      case 'status':
        return statusOrder[a.status] - statusOrder[b.status];
      default:
        return 0;
    }
  });
};

const filterTasks = (tasks: Task[], status: string, priority: string) => {
  return tasks.filter(task => {
    const statusMatch = status === 'all' || task.status === status;
    const priorityMatch = priority === 'all' || task.priority === priority;
    return statusMatch && priorityMatch;
  });
};

export default function EventTasks({ tasks, eventId, onTasksUpdated }: EventTasksProps) {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'status'>('dueDate');
  const [userProfiles, setUserProfiles] = useState<Record<string, { email: string; displayName?: string }>>({});
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');

  useEffect(() => {
    const loadUserProfiles = async () => {
      try {
        const profiles = await getUserProfiles();
        const profileMap = profiles.reduce((acc, profile) => {
          acc[profile.uid] = {
            email: profile.email,
            displayName: profile.displayName
          };
          return acc;
        }, {} as Record<string, { email: string; displayName?: string }>);
        setUserProfiles(profileMap);
      } catch (error) {
        console.error('Error loading user profiles:', error);
      }
    };

    loadUserProfiles();
  }, []);

  const handleTaskSubmit = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (currentTask) {
        // Update existing task
        await updateTask(currentTask.id, {
          ...currentTask,
          ...taskData
        });
      } else {
        // Create new task
        await createTask({
          ...taskData,
          eventId,
          createdBy: user?.uid || '',
          assignees: taskData.assignees || [],
          groupId: 'default',
        });
      }
      setIsDialogOpen(false);
      onTasksUpdated();
    } catch (error) {
      console.error('Error saving task:', error);
      alert('Failed to save task');
    }
  };

  const filteredTasks = filterTasks(tasks, filterStatus, filterPriority);
  const sortedTasks = sortTasks(filteredTasks, sortBy);

  const tasksByStatus = {
    todo: sortedTasks.filter(task => task.status === 'todo'),
    in_progress: sortedTasks.filter(task => task.status === 'in_progress'),
    waiting: sortedTasks.filter(task => task.status === 'waiting'),
    complete: sortedTasks.filter(task => task.status === 'complete')
  };

  const getAssigneeName = (userId: string) => {
    const profile = userProfiles[userId];
    return profile?.displayName || profile?.email || userId;
  };

  const renderTaskCard = (task: Task) => (
    <div key={task.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="space-y-3">
        <div className="flex justify-between items-start gap-2">
          <h3 className="text-base sm:text-lg font-medium text-gray-900 line-clamp-2">{task.title}</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setCurrentTask(task);
              setIsDialogOpen(true);
            }}
            className="shrink-0"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </div>

        {task.description && (
          <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>
        )}

        <div className="flex flex-wrap gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[task.status]}`}>
            {statusOptions.find(option => option.value === task.status)?.label}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 pt-1">
          {task.dueDate && (
            <div className="flex items-center">
              <Calendar className="h-3.5 w-3.5 mr-1 shrink-0" />
              <span className="truncate">Due {formatDueDate(task.dueDate)}</span>
            </div>
          )}
          {task.assignees && task.assignees.length > 0 && (
            <div className="flex items-center">
              <User className="h-3.5 w-3.5 mr-1 shrink-0" />
              <span className="truncate">
                {task.assignees.map(userId => getAssigneeName(userId)).join(', ')}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 p-2 sm:p-4 rounded-lg">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'bg-gray-100' : ''}
            >
              <LayoutList className="h-4 w-4 mr-2" />
              List
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setViewMode('board')}
              className={viewMode === 'board' ? 'bg-gray-100' : ''}
            >
              <LayoutGrid className="h-4 w-4 mr-2" />
              Board
            </Button>
          </div>
          <Button onClick={() => {
            setCurrentTask(null);
            setIsDialogOpen(true);
          }}>
            Create Task
          </Button>
        </div>

        <Card className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2 min-w-[200px]">
              <ListFilter className="h-4 w-4 text-gray-500" />
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {statusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2 min-w-[200px]">
              <AlertTriangle className="h-4 w-4 text-gray-500" />
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2 min-w-[200px]">
              <ArrowUpDown className="h-4 w-4 text-gray-500" />
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'dueDate' | 'priority' | 'status')}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dueDate">Sort by Due Date</SelectItem>
                  <SelectItem value="priority">Sort by Priority</SelectItem>
                  <SelectItem value="status">Sort by Status</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>
      </div>

      {viewMode === 'list' ? (
        <div className="grid grid-cols-1 gap-3">
          {sortedTasks.map(renderTaskCard)}
          {sortedTasks.length === 0 && (
            <div className="text-center py-8 bg-white rounded-lg">
              <p className="text-gray-500">No tasks found</p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
            <div key={status} className="bg-gray-100 p-3 rounded-lg">
              <div className="flex items-center space-x-2 mb-3">
                {status === 'todo' && <Circle className="h-4 w-4 text-gray-500" />}
                {status === 'in_progress' && <Clock className="h-4 w-4 text-blue-500" />}
                {status === 'waiting' && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                {status === 'complete' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                <h3 className="font-medium text-sm">
                  {statusOptions.find(opt => opt.value === status)?.label} ({statusTasks.length})
                </h3>
              </div>
              <div className="space-y-3">
                {statusTasks.map(renderTaskCard)}
                {statusTasks.length === 0 && (
                  <div className="text-center py-4 bg-white rounded-lg border border-dashed border-gray-300">
                    <p className="text-sm text-gray-500">No tasks</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <TaskDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        task={currentTask}
        eventId={eventId}
        onSubmit={handleTaskSubmit}
      />
    </div>
  );
}
