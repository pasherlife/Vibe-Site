import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useMyProjects } from '@/hooks/useProjects';
import { useRecentActivity } from '@/hooks/useActivity';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Loader2, Plus, FileText, Users, Activity, Clock } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export function DashboardPage() {
  const { user } = useAuth();
  const { data: projects, isLoading: projectsLoading } = useMyProjects();
  const { data: activity, isLoading: activityLoading } = useRecentActivity(10);

  return (
    <div className="container py-8">
      <div className="space-y-8">
        {/* Welcome section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Дашборд</h1>
            <p className="text-muted-foreground">
              Ласкаво просимо, {user?.username || 'користувач'}!
            </p>
          </div>
          <Button asChild>
            <Link to="/projects">
              <Plus className="mr-2 h-4 w-4" />
              Новий проєкт
            </Link>
          </Button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">Проєкти</CardTitle>
              <FileText className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projects?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                Кількість ваших проєктів
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">Команди</CardTitle>
              <Users className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Кількість команд
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">Активність</CardTitle>
              <Activity className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activity?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                Остання активність
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent projects */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Останні проєкти</CardTitle>
              <CardDescription>
                Ваші останні проєкти локалізації
              </CardDescription>
            </CardHeader>
            <CardContent>
              {projectsLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : projects && projects.length > 0 ? (
                <div className="space-y-4">
                  {projects.slice(0, 5).map((project) => (
                    <Link
                      key={project.id}
                      to={`/projects/${project.id}`}
                      className="block p-4 rounded-lg border hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{project.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {project.files_count || 0} файлів
                          </p>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(project.created_at)}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>У вас ще немає проєктів</p>
                  <Button asChild className="mt-4">
                    <Link to="/projects">Створити проєкт</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent activity */}
          <Card>
            <CardHeader>
              <CardTitle>Остання активність</CardTitle>
              <CardDescription>
                Останні дії в системі
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activityLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : activity && activity.length > 0 ? (
                <div className="space-y-4">
                  {activity.map((item) => (
                    <div key={item.id} className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                          <Clock className="h-4 w-4" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{item.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(item.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Немає останньої активності</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
