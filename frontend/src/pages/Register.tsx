import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

export function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const { register, registerLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !email || !password) {
      toast.error('Будь ласка, заповніть усі обовязкові поля');
      return;
    }

    if (password.length < 8) {
      toast.error('Пароль повинен містити щонайменше 8 символів');
      return;
    }

    try {
      await register({ username, password, full_name: fullName });
    } catch (error: any) {
      console.error('Registration error:', error);
      const message = error.response?.data?.detail || 'Помилка реєстрації';
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Створити обліковий запис</CardTitle>
          <CardDescription>
            Зареєструйтеся, щоб розпочати роботу
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Логін *</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Введіть логін"
                disabled={registerLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Введіть email"
                disabled={registerLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fullName">Повне ім'я</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Введіть повне ім'я"
                disabled={registerLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Пароль *</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введіть пароль (мінімум 8 символів)"
                disabled={registerLoading}
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={registerLoading}>
              {registerLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Реєстрація...
                </>
              ) : (
                'Зареєструватися'
              )}
            </Button>
          </form>
          
          <div className="mt-4 text-center text-sm">
            <p className="text-muted-foreground">
              Вже є обліковий запис?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Увійти
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
