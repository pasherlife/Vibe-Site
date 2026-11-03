import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import {
  LayoutDashboard,
  Folder,
  FileText,
  Globe,
  Users,
  Settings,
  Activity,
  User,
  Translation,
} from 'lucide-react';

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const sidebarItems: SidebarItem[] = [
  { label: 'Дашборд', href: '/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Проєкти', href: '/projects', icon: <Folder className="h-5 w-5" /> },
  { label: 'Файли', href: '/files', icon: <FileText className="h-5 w-5" /> },
  { label: 'Переклади', href: '/translations', icon: <Translation className="h-5 w-5" /> },
  { label: 'Активність', href: '/activity', icon: <Activity className="h-5 w-5" /> },
];

const bottomItems: SidebarItem[] = [
  { label: 'Профіль', href: '/profile', icon: <User className="h-5 w-5" /> },
  { label: 'Налаштування', href: '/settings', icon: <Settings className="h-5 w-5" /> },
];

export function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <div className="hidden border-r bg-muted/40 md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {sidebarItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground",
                  location.pathname === item.href || location.pathname.startsWith(`${item.href}/`)
                    ? "bg-muted text-foreground"
                    : ""
                )}
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="p-4">
          <nav className="grid items-start text-sm font-medium">
            {bottomItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground",
                  location.pathname === item.href
                    ? "bg-muted text-foreground"
                    : ""
                )}
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
