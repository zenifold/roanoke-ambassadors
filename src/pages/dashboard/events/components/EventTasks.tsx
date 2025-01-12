import { type Task, createTask, updateTask, getUserProfiles } from '../../../../lib/firestore';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { TaskDialog } from './TaskDialog';
import { Pencil, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';
import { Timestamp } from 'firebase/firestore';

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

  const getAssigneeName = (userId: string) => {
    const profile = userProfiles[userId];
    return profile?.displayName || profile?.email || userId;
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-md border-gray-300 text-sm"
          >
            <option value="all">All Status</option>
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="rounded-md border-gray-300 text-sm"
          >
            <option value="all">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'dueDate' | 'priority' | 'status')}
            className="rounded-md border-gray-300 text-sm"
          >
            <option value="dueDate">Sort by Due Date</option>
            <option value="priority">Sort by Priority</option>
            <option value="status">Sort by Status</option>
          </select>
        </div>
        <Button onClick={() => {
          setCurrentTask(null);
          setIsDialogOpen(true);
        }}>
          Create Task
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {sortedTasks.map(task => (
          <div key={task.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-medium text-gray-900">{task.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[task.status]}`}>
                    {statusOptions.find(option => option.value === task.status)?.label}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-600">{task.description}</p>
                <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                  {task.dueDate && (
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>Due {formatDueDate(task.dueDate)}</span>
                    </div>
                  )}
                  {task.assignees && task.assignees.length > 0 && (
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      <span>
                        {task.assignees.map(userId => getAssigneeName(userId)).join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCurrentTask(task);
                  setIsDialogOpen(true);
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        {sortedTasks.length === 0 && (
          <div className="text-center py-8 bg-white rounded-lg">
            <p className="text-gray-500">No tasks found</p>
          </div>
        )}
      </div>

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
