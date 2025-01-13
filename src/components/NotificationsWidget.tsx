import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Bell, Calendar, CheckCircle2, MessageSquare, User } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { type Notification } from "@/lib/firestore";

interface NotificationsWidgetProps {
  notifications: Notification[];
  onNotificationClick?: (notification: Notification) => void;
}

export function NotificationsWidget({ notifications, onNotificationClick }: NotificationsWidgetProps) {
  const navigate = useNavigate();
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = (notification: Notification) => {
    if (onNotificationClick) {
      onNotificationClick(notification);
    }

    // Navigate to event details with the specific tab
    const baseUrl = `/dashboard/events/${notification.eventId}`;
    if (notification.tabId) {
      navigate(`${baseUrl}?tab=${notification.tabId}`);
    } else {
      navigate(baseUrl);
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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h2 className="text-lg font-semibold text-gray-900">Recent Notifications</h2>
        {unreadCount > 0 && (
          <span className="text-sm text-gray-500">
            {unreadCount} unread
          </span>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <Bell className="h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm font-medium text-gray-900">No notifications yet</p>
              <p className="text-sm text-gray-500 mt-1">
                You'll be notified when you're assigned tasks, receive comments, or have updates on your events.
              </p>
            </div>
          ) : (
            <>
              {notifications.slice(0, 3).map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start space-x-3 p-3 rounded-lg transition-colors cursor-pointer hover:bg-gray-50 ${
                    notification.read ? 'bg-gray-50' : 'bg-white'
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className={`p-1.5 rounded-full ${getNotificationColor(notification.type)} text-white`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium text-gray-900">
                      {notification.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}

              {notifications.length > 3 && (
                <Button
                  variant="ghost"
                  className="w-full text-sm text-gray-700 hover:text-gray-900"
                  onClick={() => navigate('/dashboard/notifications')}
                >
                  View All Notifications
                </Button>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 