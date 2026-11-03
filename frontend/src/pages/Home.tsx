import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { FileText, Users, Globe, Translation } from 'lucide-react';

const features = [
  {
    title: 'Завантаження файлів',
    description: 'Завантажуйте файли локалізації у форматах locres, CSV, JSON, TXT',
    icon: <FileText className="h-8 w-8 text-primary" />,
  },
  {
    title: 'Командна робота',
    description: 'Працюйте разом з командою над спільними проєктами',
    icon: <Users className="h-8 w-8 text-primary" />,
  },
  {
    title: 'Переклад',
    description: 'Зручний інтерфейс для перекладу текстових рядків',
    icon: <Translation className="h-8 w-8 text-primary" />,
  },
  {
    title: 'Мultilingual',
    description: 'Підтримка багатьох мов для локалізації',
    icon: <Globe className="h-8 w-8 text-primary" />,
  },
];

export function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero section */}
      <section className="container py-16 text-center">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Game Localization Portal
          </h1>
          <p className="mt-6 text-xl text-muted-foreground">
            Портал для локалізації ігор. Завантажуйте, перекладайте та керуйте файлами локалізації разом з командою.
          </p>
          
          <div className="mt-8 flex gap-4 justify-center">
            {isAuthenticated ? (
              <Button asChild>
                <Link to="/dashboard">Перейти до дашборду</Link>
              </Button>
            ) : (
              <>
                <Button asChild>
                  <Link to="/login">Увійти</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/register">Зареєструватися</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="container py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Можливості</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-col items-center text-center">
                <div className="mb-4">{feature.icon}</div>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works section */}
      <section className="container py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Як це працює</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>1. Створіть проєкт</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Створіть новий проєкт для вашої гри та запросіть членів команди.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>2. Завантажте файли</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Завантажте файли локалізації у підтримуваних форматах.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>3. Перекладайте</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Працюйте над перекладом разом з командою в зручному інтерфейсі.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA section */}
      <section className="bg-muted py-16">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-6">Готові розпочати?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Приєднуйтесь до нас сьогодні та почніть локалізувати свої ігри!
          </p>
          
          {isAuthenticated ? (
            <Button asChild size="lg">
              <Link to="/dashboard">Перейти до дашборду</Link>
            </Button>
          ) : (
            <div className="flex gap-4 justify-center">
              <Button asChild size="lg">
                <Link to="/login">Увійти</Link>
              </Button>
              <Button variant="outline" asChild size="lg">
                <Link to="/register">Зареєструватися</Link>
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
