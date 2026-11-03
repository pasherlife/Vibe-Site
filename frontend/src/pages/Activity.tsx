import { useRecentActivity } from '@/hooks/useActivity';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Loader2, Activity, Clock, User, FileText, RefreshCw } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

const activityIcons: Record<string, React.ReactNode> = {
  user_registered: <User className="h-5 w-5" />,
  user_login: <User className="h-5 w-5" />,
  user_logout: <User className="h-5 w-5" />,
  project_created: <FileText className="h-5 w-5" />,
  project_updated: <FileText className="h-5 w-5" />,
  project_deleted: <FileText className="h-5 w-5" />,
  file_uploaded: <FileText className="h-5 w-5" />,
  file_deleted: <FileText className="h-5 w-5" />,
  translation_added: <Activity className="h-5 w-5" />,
  translation_updated: <Activity className="h-5 w-5" />,
  translation_status_changed: <Activity className="h-5 w-5" />,
  translation_suggestion_added: <Activity className="h-5 w-5" />,
  translation_suggestion_accepted: <Activity className="h-5 w-5" />,
  translation_comment_added: <Activity className="h-5 w-5" />,
};

const activityLabels: Record<string, string> = {
  user_registered: 'Реєстрація користувача',
  user_login: 'Вхід користувача',
  user_logout: 'Вихід користувача',
  project_created: 'Створення проєкту',
  project_updated: 'Оновлення проєкту',
  project_deleted: 'Видалення проєкту',
  file_uploaded: 'Завантаження файлу',
  file_deleted: 'Видалення файлу',
  translation_added: 'Додано переклад',
  translation_updated: 'Оновлено переклад',
  translation_status_changed: 'Зміна статусу перекладу',
  translation_suggestion_added: 'Додано пропозицію',
  translation_suggestion_accepted: 'Прийнято пропозицію',
  translation_comment_added: 'Додано коментар',
};

export function ActivityPage() {
  const { data: activity, isLoading, refetch } = useRecentActivity(50);

  return (
    <div className="container py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Активність</h1>
            <p className="text-muted-foreground">
              Останні дії в системі
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Оновити
          </Button>
        </div>

        {/* Activity feed */}
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : activity && activity.length > 0 ? (
          <div className="space-y-4">
            {activity.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        {activityIcons[item.activity_type] || <Activity className="h-5 w-5" />}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            {activityLabels[item.activity_type] || item.activity_type}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {item.description || 'Опис відсутній'}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDateTime(item.created_at)}
                        </span>
                      </div>
                      {item.username && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Користувач: {item.username}
                        </p>
                      )}
                      {item.project_name && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Проєкт: {item.project_name}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center p-8">
            <CardContent>
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">Немає останньої активності</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
