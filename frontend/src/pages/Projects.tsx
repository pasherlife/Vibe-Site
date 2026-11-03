import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMyProjects, usePublicProjects, useDeleteProject } from '@/hooks/useProjects';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Loader2, Plus, Search, Folder, Globe, Eye, EyeOff, Trash2, Pencil } from 'lucide-react';
import { formatDate, truncate } from '@/lib/utils';
import { toast } from 'react-hot-toast';

export function ProjectsPage() {
  const [showOnlyMy, setShowOnlyMy] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: myProjects, isLoading: myProjectsLoading } = useMyProjects();
  const { data: publicProjects, isLoading: publicProjectsLoading } = usePublicProjects();
  const { mutate: deleteProject } = useDeleteProject();

  const projects = showOnlyMy ? myProjects : publicProjects;
  const isLoading = showOnlyMy ? myProjectsLoading : publicProjectsLoading;

  const filteredProjects = projects?.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (project.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (projectId: string, projectName: string) => {
    if (window.confirm(`Ви впевнені, що хочете видалити проєкт "${projectName}"?`)) {
      deleteProject(projectId, {
        onSuccess: () => {
          toast.success('Проєкт успішно видалено');
        },
        onError: (error) => {
          toast.error('Помилка при видаленні проєкту');
          console.error(error);
        },
      });
    }
  };

  return (
    <div className="container py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Проєкти</h1>
            <p className="text-muted-foreground">
              Керуйте своїми проєктами локалізації
            </p>
          </div>
          <Button asChild>
            <Link to="/projects/new">
              <Plus className="mr-2 h-4 w-4" />
              Новий проєкт
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant={showOnlyMy ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setShowOnlyMy(true)}
            >
              <Folder className="h-4 w-4 mr-1" />
              Мої проєкти
            </Button>
            <Button
              variant={!showOnlyMy ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setShowOnlyMy(false)}
            >
              <Globe className="h-4 w-4 mr-1" />
              Публічні проєкти
            </Button>
          </div>
          
          <div className="relative ml-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Шукати проєкти..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>

        {/* Projects list */}
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : filteredProjects && filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      project.is_public ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-muted'
                    }`}>
                      {project.is_public ? 'Публічний' : 'Приватний'}
                    </span>
                  </div>
                  <CardDescription>
                    {truncate(project.description || 'Опис відсутній', 100)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        {project.files_count || 0} файлів
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {project.members_count || 0} учасників
                      </span>
                    </div>
                    <span className="text-muted-foreground">
                      {formatDate(project.created_at)}
                    </span>
                  </div>
                  
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/projects/${project.id}`}>Відкрити</Link>
                    </Button>
                    {showOnlyMy && (
                      <>
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/projects/${project.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(project.id, project.name)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center p-8">
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? 'Проєктів не знайдено' : 'У вас ще немає проєктів'}
              </p>
              <Button asChild>
                <Link to="/projects/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Створити проєкт
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
