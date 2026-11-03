import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { UserAvatar } from '@/components/UserAvatar';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';
import { SearchBar } from '@/components/SearchBar';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export function Header() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground font-bold text-xl">
            GL
          </div>
          <span className="font-semibold text-xl hidden sm:inline">Game Localization</span>
        </Link>

        {/* Search bar (desktop) */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <SearchBar />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LanguageSwitcher />
          
          {isAuthenticated ? (
            <>
              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                <Menu className="h-5 w-5" />
              </Button>
              <UserAvatar user={user} onLogout={handleLogout} />
            </>
          ) : (
            <>
              <Button variant="ghost" asChild className="hidden sm:inline-flex">
                <Link to="/login">Увійти</Link>
              </Button>
              <Button asChild className="hidden sm:inline-flex">
                <Link to="/register">Зареєструватися</Link>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && isAuthenticated && (
        <div className="md:hidden border-t bg-background">
          <div className="container py-4">
            <SearchBar />
            <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => setMobileMenuOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
