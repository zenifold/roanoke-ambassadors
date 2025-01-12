import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { LayoutDashboard, Calendar, PieChart, Settings, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getUserProfile, type UserProfile } from '../lib/firestore';
import { useEffect, useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Events', href: '/dashboard/events', icon: Calendar },
  { name: 'Calendar', href: '/dashboard/calendar', icon: Calendar },
  { name: 'Reports', href: '/dashboard/reports', icon: PieChart },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { user, logOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsExpanded(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        try {
          const userProfile = await getUserProfile(user.uid);
          setProfile(userProfile);
        } catch (error) {
          console.error('Error loading user profile:', error);
        }
      }
    };

    loadProfile();
  }, [user]);

  // Desktop Side Navigation
  function DesktopNav() {
    return (
      <div 
        className={cn(
          "fixed left-0 top-0 h-screen bg-white shadow-lg transition-all duration-300 z-50 hidden md:block",
          isExpanded ? "w-56" : "w-16"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Toggle Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="absolute -right-3 top-8 bg-white rounded-full p-1 shadow-md hover:bg-gray-50"
          >
            {isExpanded ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>

          {/* Navigation Items */}
          <div className="flex-1 py-8 px-3">
            <div className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href || 
                  (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 p-2 rounded-lg transition-all duration-200",
                      isActive 
                        ? "bg-black text-white hover:bg-black/90" 
                        : "text-gray-600 hover:bg-gray-100",
                      !isExpanded && "justify-center"
                    )}
                    title={!isExpanded ? item.name : undefined}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {isExpanded && <span className="text-sm font-medium">{item.name}</span>}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Profile Section */}
          {profile && (
            <div className="p-3 border-t">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className={cn(
                      "w-full p-2 h-auto hover:bg-gray-100 rounded-lg",
                      !isExpanded && "justify-center"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={profile.avatarUrl} alt={profile.displayName || 'User avatar'} />
                        <AvatarFallback>
                          {profile.firstName?.[0]}{profile.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      {isExpanded && (
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium truncate">
                            {profile.displayName || profile.email}
                          </p>
                          <p className="text-xs text-gray-500 capitalize">
                            {profile.role}
                          </p>
                        </div>
                      )}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center gap-2 p-2 border-b">
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{profile.displayName || profile.email}</p>
                      <p className="text-xs text-gray-500 capitalize">{profile.role}</p>
                    </div>
                  </div>
                  <DropdownMenuItem onClick={logOut} className="text-red-600 cursor-pointer">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Mobile Bottom Navigation
  function MobileNav() {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t md:hidden">
        <div className="flex justify-around items-center h-16 px-4">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href || 
              (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 p-2 rounded-lg transition-all duration-200",
                  isActive 
                    ? "text-black" 
                    : "text-gray-400 hover:text-gray-600"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  // Mobile Header with Profile
  function MobileHeader() {
    return (
      <div className="fixed top-0 left-0 right-0 bg-white border-b md:hidden">
        <div className="flex items-center justify-between px-4 h-16">
          <img
            className="h-8 w-auto"
            src="/logo.svg"
            alt="Roanoke Ambassadors"
          />
          {profile && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-1 h-auto rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile.avatarUrl} alt={profile.displayName || 'User avatar'} />
                    <AvatarFallback>
                      {profile.firstName?.[0]}{profile.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center gap-2 p-2 border-b">
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{profile.displayName || profile.email}</p>
                    <p className="text-xs text-gray-500 capitalize">{profile.role}</p>
                  </div>
                </div>
                <DropdownMenuItem onClick={logOut} className="text-red-600 cursor-pointer">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DesktopNav />
      <MobileHeader />
      <MobileNav />

      {/* Main Content */}
      <main className={cn(
        "transition-all duration-300",
        "px-4 py-8 md:p-8",
        "md:ml-16",
        isExpanded ? "md:ml-56" : "md:ml-16",
        "mt-16 mb-16 md:mt-0 md:mb-0" // Account for mobile header and bottom nav
      )}>
        {children}
      </main>
    </div>
  );
} 