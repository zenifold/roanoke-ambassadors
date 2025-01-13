import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Calendar, CheckCircle2, MessageSquare, User } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from 'react-router-dom';
import { getNotificationsByUser, markNotificationAsRead, type Notification } from '@/lib/firestore';

export function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadNotifications = async () => {
      if (!user) return;
      
      try {
        const userNotifications = await getNotificationsByUser(user.uid);
        setNotifications(userNotifications);
      } catch (err) {
        console.error('Error loading notifications:', err);
        setError('Failed to load notifications. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, [user]);

  const handleNotificationClick = async (notification: Notification) => {
    try {
      // Mark notification as read in Firestore
      await markNotificationAsRead(notification.id);
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
      );

      // Navigate to event details with the specific tab
      const baseUrl = `/dashboard/events/${notification.eventId}`;
      if (notification.tabId) {
        navigate(`${baseUrl}?tab=${notification.tabId}`);
      } else {
        navigate(baseUrl);
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
      // Still navigate even if marking as read fails
      navigate(`/dashboard/events/${notification.eventId}`);
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'task':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'checklist':
        return <Calendar className="h-4 w-4" />;
      case 'comment':
        return <MessageSquare className="h-4 w-4" />;
      case 'event':
        return <Calendar className="h-4 w-4" />;
      case 'role':
        return <User className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'task':
        return 'bg-blue-500';
      case 'checklist':
        return 'bg-green-500';
      case 'comment':
        return 'bg-purple-500';
      case 'event':
        return 'bg-yellow-500';
      case 'role':
        return 'bg-pink-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-[200px]" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Notifications</h2>
        <Badge variant="secondary" className="text-sm">
          {notifications.filter(n => !n.read).length} unread
        </Badge>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Bell className="h-12 w-12 text-gray-400 mb-3" />
                <h3 className="text-lg font-medium text-gray-900">No notifications yet</h3>
                <p className="text-sm text-gray-500 mt-2 max-w-sm">
                  You'll be notified when you're assigned tasks, receive comments, or have updates on your events.
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start space-x-4 p-4 rounded-lg transition-colors cursor-pointer hover:bg-gray-50 ${
                    notification.read ? 'bg-gray-50' : 'bg-white'
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className={`p-2 rounded-full ${getNotificationColor(notification.type)} text-white`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900">{notification.title}</p>
                      <span className="text-sm text-gray-500">
                        {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {notification.description}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 