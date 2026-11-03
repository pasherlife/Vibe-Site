import { useProjectActivity } from '@/hooks/useActivity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Loader2, Activity, Clock, User, FileText } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

interface ProjectActivityTabProps {
  projectId: string;
}

const activityIcons: Record<string, React.ReactNode> = {
  user_registered: <User className="h-5 w-5" />,
  user_login: <User className="h-5 w-5" />,
  project_created: <FileText className="h-5 w-5" />,
  project_updated: <FileText className="h-5 w-5" />,
  file_uploaded: <FileText className="h-5 w-5" />,
  file_deleted: <FileText className="h-5 w-5" />,
  translation_added: <Activity className="h-5 w-5" />,
  translation_updated: <Activity className="h-5 w-5" />,
  translation_suggestion_added: <Activity className="h-5 w-5" />,
  translation_comment_added: <Activity className="h-5 w-5" />,
};

const activityLabels: Record<string, string> = {
  user_registered: 'Реєстрація користувача',
  user_login: 'Вхід користувача',
  project_created: 'Створення проєкту',
  project_updated: 'Оновлення проєкту',
  file_uploaded: 'Завантаження файлу',
  file_deleted: 'Видалення файлу',
  translation_added: 'Додано переклад',
  translation_updated: 'Оновлено переклад',
  translation_suggestion_added: 'Додано пропозицію',
  translation_comment_added: 'Додано коментар',
};

export function ProjectActivityTab({ projectId }: ProjectActivityTabProps) {
  const { data: activity, isLoading } = useProjectActivity(projectId, 0, 50);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Активність проєкту</CardTitle>
        <CardDescription>
          Останні дії в цьому проєкті
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {activity && activity.length > 0 ? (
          <div className="space-y-4">
            {activity.map((item) => (
              <div key={item.id} className="flex items-start gap-4 p-4 rounded-lg border">
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
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>У цьому проєкті ще немає активності</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
