import { Link } from 'react-router-dom';
import { useMyProjects } from '@/hooks/useProjects';
import { useProjectFiles } from '@/hooks/useFiles';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Loader2, Plus, FileText, Folder, Search } from 'lucide-react';
import { formatDate, formatFileSize, truncate, getFileTypeIcon } from '@/lib/utils';

export function FilesPage() {
  const { data: projects, isLoading: projectsLoading } = useMyProjects();

  if (projectsLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Файли</h1>
            <p className="text-muted-foreground">
              Усі ваші файли локалізації
            </p>
          </div>
          <Button asChild>
            <Link to="/files/new">
              <Plus className="mr-2 h-4 w-4" />
              Завантажити файл
            </Link>
          </Button>
        </div>

        {/* Projects with files */}
        <div className="space-y-6">
          {projects && projects.length > 0 ? (
            projects.map((project) => {
              const { data: files, isLoading: filesLoading } = useProjectFiles(project.id);
              
              if (filesLoading) {
                return (
                  <Card key={project.id}>
                    <CardContent className="p-8">
                      <div className="flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin" />
                      </div>
                    </CardContent>
                  </Card>
                );
              }

              if (!files || files.length === 0) return null;

              return (
                <Card key={project.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{project.name}</CardTitle>
                        <CardDescription>
                          {truncate(project.description || 'Опис відсутній', 100)}
                        </CardDescription>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/projects/${project.id}/files/new`}>
                          <Plus className="h-4 w-4 mr-2" />
                          Додати файл
                        </Link>
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      {files.map((file) => (
                        <Link
                          key={file.id}
                          to={`/projects/${project.id}/files/${file.id}`}
                          className="block p-4 rounded-lg border hover:bg-muted transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="text-2xl">{getFileTypeIcon(file.file_type)}</div>
                              <div>
                                <h3 className="font-medium">{file.original_filename}</h3>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <span>{file.source_language} → {file.target_language}</span>
                                  <span>|</span>
                                  <span>{formatFileSize(file.file_size)}</span>
                                  <span>|</span>
                                  <span>Стан: {file.status}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {formatDate(file.created_at)}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card className="text-center p-8">
              <CardContent>
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground mb-4">У вас ще немає файлів</p>
                <Button asChild>
                  <Link to="/files/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Завантажити перший файл
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
