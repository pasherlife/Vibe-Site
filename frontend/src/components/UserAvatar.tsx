import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { getInitials, getAvatarColor } from '@/lib/utils';
import type { User } from '@/types';
import { ChevronDown, LogOut, Settings, User as UserIcon } from 'lucide-react';

interface UserAvatarProps {
  user: User | null;
  onLogout?: () => void;
  showDropdown?: boolean;
}

export function UserAvatar({ user, onLogout, showDropdown = true }: UserAvatarProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!user) {
    return (
      <Button variant="ghost" asChild>
        <Link to="/login">Увійти</Link>
      </Button>
    );
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        className="flex items-center gap-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Avatar className="h-8 w-8">
          {user.avatar_url ? (
            <AvatarImage src={user.avatar_url} alt={user.username} />
          ) : (
            <AvatarFallback className={getAvatarColor(user.username)}>
              {getInitials(user.full_name || user.username)}
            </AvatarFallback>
          )}
        </Avatar>
        <span className="hidden sm:inline">{user.username}</span>
        {showDropdown && <ChevronDown className="h-4 w-4 hidden sm:inline" />}
      </Button>

      {showDropdown && isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-background border z-50">
          <div className="p-2">
            <div className="flex items-center gap-2 p-2 rounded hover:bg-muted">
              <Avatar className="h-8 w-8">
                {user.avatar_url ? (
                  <AvatarImage src={user.avatar_url} alt={user.username} />
                ) : (
                  <AvatarFallback className={getAvatarColor(user.username)}>
                    {getInitials(user.full_name || user.username)}
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <p className="font-medium">{user.username}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
          </div>
          <div className="border-t">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
              asChild
            >
              <Link to="/profile" onClick={() => setIsOpen(false)}>
                <UserIcon className="h-4 w-4" />
                Профіль
              </Link>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
              asChild
            >
              <Link to="/settings" onClick={() => setIsOpen(false)}>
                <Settings className="h-4 w-4" />
                Налаштування
              </Link>
            </Button>
          </div>
          <div className="border-t p-2">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-destructive"
              onClick={() => {
                onLogout?.();
                setIsOpen(false);
              }}
            >
              <LogOut className="h-4 w-4" />
              Вийти
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
