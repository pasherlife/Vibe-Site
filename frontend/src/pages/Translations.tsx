import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useMyProjects } from '@/hooks/useProjects';
import { useSearchTranslations } from '@/hooks/useTranslations';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Loader2, Search, FileText, Translation, Filter } from 'lucide-react';
import { formatDate, truncate, getStatusColor } from '@/lib/utils';

type TranslationStatus = 'untranslated' | 'translated' | 'reviewed' | 'approved' | 'rejected';

const statusOptions: { value: TranslationStatus; label: string; color: string }[] = [
  { value: 'untranslated', label: 'Не перекладено', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
  { value: 'translated', label: 'Перекладено', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  { value: 'reviewed', label: 'Перевірено', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
  { value: 'approved', label: 'Погоджено', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  { value: 'rejected', label: 'Відхилено', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' },
];

export function TranslationsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedStatus, setSelectedStatus] = useState<TranslationStatus | null>(
    (searchParams.get('status') as TranslationStatus) || null
  );
  const [selectedProject, setSelectedProject] = useState<string | null>(searchParams.get('project') || null);

  const { data: projects, isLoading: projectsLoading } = useMyProjects();

  const { data: translations, isLoading: translationsLoading } = useSearchTranslations({
    query: searchQuery,
    project_id: selectedProject || undefined,
    status: selectedStatus || undefined,
    limit: 50,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedStatus) params.set('status', selectedStatus);
    if (selectedProject) params.set('project', selectedProject);
    setSearchParams(params);
  };

  const handleStatusChange = (status: TranslationStatus | null) => {
    setSelectedStatus(status);
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (status) params.set('status', status);
    if (selectedProject) params.set('project', selectedProject);
    setSearchParams(params);
  };

  const handleProjectChange = (projectId: string | null) => {
    setSelectedProject(projectId);
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedStatus) params.set('status', selectedStatus);
    if (projectId) params.set('project', projectId);
    setSearchParams(params);
  };

  return (
    <div className="container py-8">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Переклади</h1>
          <p className="text-muted-foreground">
            Керуйте перекладами
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Фільтри</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Шукати переклади..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <select
                  value={selectedProject || ''}
                  onChange={(e) => handleProjectChange(e.target.value || null)}
                  className="border rounded-md px-3 py-2 text-sm bg-background"
                >
                  <option value="">Усі проєкти</option>
                  {projects?.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedStatus || ''}
                  onChange={(e) => handleStatusChange(e.target.value as TranslationStatus || null)}
                  className="border rounded-md px-3 py-2 text-sm bg-background"
                >
                  <option value="">Усі статуси</option>
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <Button type="submit" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Застосувати фільтри
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        {translationsLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : translations && translations.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Результати пошуку</CardTitle>
              <CardDescription>
                Знайдено {translations.length} перекладів
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ключ</TableHead>
                      <TableHead>Оригінал</TableHead>
                      <TableHead>Переклад</TableHead>
                      <TableHead>Стан</TableHead>
                      <TableHead>Файл</TableHead>
                      <TableHead>Оновлено</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {translations.map((translation) => (
                      <TableRow key={translation.id}>
                        <TableCell>
                          <code className="text-sm">{truncate(translation.key, 30)}</code>
                        </TableCell>
                        <TableCell>
                          {truncate(translation.source_text, 50)}
                        </TableCell>
                        <TableCell>
                          {translation.target_text ? truncate(translation.target_text, 50) : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(translation.status)}>
                            {translation.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {translation.filename || translation.file_type || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {formatDate(translation.updated_at)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="text-center p-8">
            <CardContent>
              <Translation className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground mb-4">
                {searchQuery || selectedStatus || selectedProject
                  ? 'Перекладів не знайдено'
                  : 'У вас ще немає перекладів'}
              </p>
              <Button asChild>
                <Link to="/files">
                  <FileText className="h-4 w-4 mr-2" />
                  Завантажити файли
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
