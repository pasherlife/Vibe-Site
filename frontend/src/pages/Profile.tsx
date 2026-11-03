import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCurrentUser } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { Loader2, Camera, Save, User, Mail, Calendar, Clock } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { toast } from 'react-hot-toast';

export function ProfilePage() {
  const { user, isLoading, isError } = useCurrentUser();
  const { updateMyProfile, logout } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Initialize form with user data
  React.useEffect(() => {
    if (user) {
      setUsername(user.username);
      setEmail(user.email);
      setFullName(user.full_name || '');
      setBio(user.bio || '');
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      await updateMyProfile({
        username,
        email,
        full_name: fullName,
        bio,
      });
      toast.success('Профіль успішно оновлено');
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Помилка при оновленні профілю');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="container py-8">
        <Card className="text-center p-8">
          <CardContent>
            <p className="text-muted-foreground">Помилка завантаження профілю</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Спробувати знову
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Мій профіль</h1>
          <p className="text-muted-foreground">
            Керуйте своїм профілем
          </p>
        </div>

        {/* Profile card */}
        <Card>
          <CardHeader>
            <CardTitle>Основна інформація</CardTitle>
            <CardDescription>
              Ваші особисті дані
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  {user.avatar_url ? (
                    <AvatarImage src={user.avatar_url} alt={user.username} />
                  ) : (
                    <AvatarFallback className="text-2xl">
                      {user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
                {isEditing && (
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-semibold">{user.username}</h2>
                <p className="text-muted-foreground">{user.role}</p>
              </div>
            </div>

            {/* Profile form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="username">Логін</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fullName">Повне ім'я</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio">Біографія</Label>
                <Input
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </div>

            {/* Edit/Save buttons */}
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Збереження...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Зберегти
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Скасувати
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)}>
                  Редагувати профіль
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Additional info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Інформація про обліковий запис</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Роль</p>
                  <p className="text-sm text-muted-foreground">{user.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Створено</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(user.created_at)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Останній вхід</p>
                  <p className="text-sm text-muted-foreground">
                    {user.last_login ? formatDate(user.last_login) : 'Ніколи'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Налаштування</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Мова інтерфейсу</p>
                  <p className="text-sm text-muted-foreground">{user.language}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 rounded-full bg-muted-foreground" />
                <div>
                  <p className="font-medium">Тема</p>
                  <p className="text-sm text-muted-foreground">{user.theme}</p>
                </div>
              </div>
              <Button variant="outline" asChild>
                <Link to="/settings">
                  Змінити налаштування
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Logout */}
        <Card>
          <CardHeader>
            <CardTitle>Безпека</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={() => logout()}>
              Вийти з облікового запису
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
