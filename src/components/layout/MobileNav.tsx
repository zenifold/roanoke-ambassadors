import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Calendar, ClipboardList, Settings, BarChart } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard
    },
    {
      title: "Events",
      href: "/dashboard/events",
      icon: ClipboardList
    },
    {
      title: "Calendar",
      href: "/dashboard/calendar",
      icon: Calendar
    },
    {
      title: "Reports",
      href: "/dashboard/reports",
      icon: BarChart
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: Settings
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-white md:hidden">
      <nav className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full px-2 gap-1",
              isActive(item.href)
                ? "text-black"
                : "text-gray-500 hover:text-gray-900"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-xs font-medium">{item.title}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
} 