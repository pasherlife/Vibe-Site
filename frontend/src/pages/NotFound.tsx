import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { AlertTriangle } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4">
            <AlertTriangle className="h-16 w-16 text-destructive mx-auto" />
          </div>
          <CardTitle className="text-3xl">404</CardTitle>
        </CardHeader>
        
        <CardContent>
          <h2 className="text-xl font-semibold mb-4">Сторінку не знайдено</h2>
          <p className="text-muted-foreground mb-6">
            Вибачте, але сторінку, яку ви шукаєте, не існує.
          </p>
          
          <div className="space-y-4">
            <Button asChild className="w-full">
              <Link to="/">
                Повернутися на головну
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link to="/dashboard">
                Перейти до дашборду
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
