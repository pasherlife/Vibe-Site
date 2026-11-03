import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useProject, useProjectMembers, useProjectFiles } from '@/hooks/useProjects';
import { useFileStats } from '@/hooks/useFiles';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Loader2, Plus, Users, FileText, Activity, Settings, ArrowLeft } from 'lucide-react';
import { formatDate, formatFileSize } from '@/lib/utils';
import { Progress } from '@/components/ui/Progress';

// Import sub-components
import { ProjectFilesTab } from '@/components/ProjectFilesTab';
import { ProjectMembersTab } from '@/components/ProjectMembersTab';
import { ProjectActivityTab } from '@/components/ProjectActivityTab';

export function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  
  const { data: project, isLoading: projectLoading } = useProject(projectId || '');
  const { data: members, isLoading: membersLoading } = useProjectMembers(projectId || '');
  const { data: files, isLoading: filesLoading } = useProjectFiles(projectId || '');

  if (projectLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container py-8">
        <Card className="text-center p-8">
          <CardContent>
            <p className="text-muted-foreground">Проєкт не знайдено</p>
            <Button asChild className="mt-4">
              <Link to="/projects">Повернутися до проєктів</Link>
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
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/projects')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <p className="text-muted-foreground">{project.description || 'Опис відсутній'}</p>
          </div>
          <div className="ml-auto flex gap-2">
            <Button variant="outline" asChild>
              <Link to={`/projects/${project.id}/settings`}>
                <Settings className="h-4 w-4 mr-2" />
                Налаштування
              </Link>
            </Button>
            <Button asChild>
              <Link to={`/projects/${project.id}/files/new`}>
                <Plus className="h-4 w-4 mr-2" />
                Завантажити файл
              </Link>
            </Button>
          </div>
        </div>

        {/* Project stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">Файлів</CardTitle>
              <FileText className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{files?.length || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">Учасників</CardTitle>
              <Users className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{members?.length || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">Рядків</CardTitle>
              <Activity className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{project.strings_count || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">Прогрес</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round((project.progress || 0) * 100) / 100}%</div>
              <Progress value={project.progress || 0} className="mt-2 h-2" />
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="files" className="w-full">
          <TabsList className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 w-full max-w-2xl">
            <TabsTrigger value="files">
              <FileText className="h-4 w-4 mr-2" />
              Файли
            </TabsTrigger>
            <TabsTrigger value="members">
              <Users className="h-4 w-4 mr-2" />
              Учасники
            </TabsTrigger>
            <TabsTrigger value="activity">
              <Activity className="h-4 w-4 mr-2" />
              Активність
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="files">
            <ProjectFilesTab project={project} files={files || []} />
          </TabsContent>
          
          <TabsContent value="members">
            <ProjectMembersTab project={project} members={members || []} />
          </TabsContent>
          
          <TabsContent value="activity">
            <ProjectActivityTab projectId={project.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Progress component
export function Progress({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn('relative h-4 w-full overflow-hidden rounded-full bg-secondary', className)}>
      <div
        className="h-full w-full flex-1 bg-primary transition-all"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </div>
  );
}
