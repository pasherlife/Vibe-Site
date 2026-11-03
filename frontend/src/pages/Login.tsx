import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, loginLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast.error('Будь ласка, заповніть усі поля');
      return;
    }

    try {
      await login({ username, password });
    } catch (error: any) {
      console.error('Login error:', error);
      const message = error.response?.data?.detail || 'Невірний логін або пароль';
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Ласкаво просимо</CardTitle>
          <CardDescription>
            Увійдіть у свій обліковий запис
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Логін або Email</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Введіть логін або email"
                disabled={loginLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введіть пароль"
                disabled={loginLoading}
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={loginLoading}>
              {loginLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Вхід...
                </>
              ) : (
                'Увійти'
              )}
            </Button>
          </form>
          
          <div className="mt-4 text-center text-sm">
            <p className="text-muted-foreground">
              Немає облікового запису?{' '}
              <Link to="/register" className="text-primary hover:underline">
                Зареєструватися
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
