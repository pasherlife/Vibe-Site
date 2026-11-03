import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Loader2, Save, User, Mail, Globe, Moon, Sun, Lock } from 'lucide-react';
import { toast } from 'react-hot-toast';

export function SettingsPage() {
  const { user, updateMyProfile } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [language, setLanguage] = useState(user?.language || 'uk');
  const [theme, setTheme] = useState(user?.theme || 'light');

  const handleSave = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      await updateMyProfile({
        language,
        theme,
      });
      toast.success('Налаштування успішно оновлено');
    } catch (error) {
      console.error('Failed to update settings:', error);
      toast.error('Помилка при оновленні налаштувань');
    } finally {
      setIsSaving(false);
    }
  };

  const handleThemeChange = (value: string) => {
    setTheme(value);
    // Apply theme immediately
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(value);
    localStorage.setItem('theme', value);
  };

  return (
    <div className="container py-8">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Налаштування</h1>
          <p className="text-muted-foreground">
            Керуйте своїми налаштуваннями
          </p>
        </div>

        {/* General settings */}
        <Card>
          <CardHeader>
            <CardTitle>Загальні налаштування</CardTitle>
            <CardDescription>
              Основні налаштування облікового запису
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="language">Мова інтерфейсу</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger id="language" className="w-full">
                  <SelectValue placeholder="Оберіть мову" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="uk">Українська</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ru">Русский</SelectItem>
                  <SelectItem value="pl">Polski</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="theme">Тема</Label>
              <Select value={theme} onValueChange={handleThemeChange}>
                <SelectTrigger id="theme" className="w-full">
                  <SelectValue placeholder="Оберіть тему" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Світла</SelectItem>
                  <SelectItem value="dark">Темна</SelectItem>
                  <SelectItem value="system">Системна</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Збереження...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Зберегти налаштування
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Profile settings */}
        <Card>
          <CardHeader>
            <CardTitle>Профіль</CardTitle>
            <CardDescription>
              Налаштування профілю
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Логін</Label>
              <Input
                id="username"
                value={user?.username || ''}
                disabled
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ''}
                disabled
                className="bg-muted"
              />
            </div>

            <p className="text-sm text-muted-foreground">
              Для зміни логіну або email зверніться до адміністратора
            </p>
          </CardContent>
        </Card>

        {/* Security settings */}
        <Card>
          <CardHeader>
            <CardTitle>Безпека</CardTitle>
            <CardDescription>
              Налаштування безпеки
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Змінити пароль</h3>
                <p className="text-sm text-muted-foreground">
                  Рекомендується змінювати пароль регулярно
                </p>
              </div>
              <Button variant="outline" asChild>
                <Link to="/settings/password">
                  <Lock className="h-4 w-4 mr-2" />
                  Змінити пароль
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
