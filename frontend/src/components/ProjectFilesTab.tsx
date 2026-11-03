import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Plus, FileText, Download, Eye, Trash2, Upload } from 'lucide-react';
import { formatDate, formatFileSize, getFileTypeIcon, getStatusColor } from '@/lib/utils';
import type { Project, TranslationFile } from '@/types';

interface ProjectFilesTabProps {
  project: Project;
  files: TranslationFile[];
}

export function ProjectFilesTab({ project, files }: ProjectFilesTabProps) {
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  const toggleSelect = (fileId: string) => {
    setSelectedFiles((prev) =>
      prev.includes(fileId) ? prev.filter((id) => id !== fileId) : [...prev, fileId]
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Файли проєкту</CardTitle>
            <CardDescription>
              Усі файли локалізації для цього проєкту
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button asChild size="sm">
              <Link to={`/projects/${project.id}/files/new`}>
                <Upload className="h-4 w-4 mr-2" />
                Завантажити
              </Link>
            </Button>
            {selectedFiles.length > 0 && (
              <Button variant="outline" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Видалити ({selectedFiles.length})
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {files.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedFiles(files.map((f) => f.id));
                        } else {
                          setSelectedFiles([]);
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>Назва</TableHead>
                  <TableHead>Тип</TableHead>
                  <TableHead>Розмір</TableHead>
                  <TableHead>Стан</TableHead>
                  <TableHead>Додано</TableHead>
                  <TableHead className="text-right">Дії</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {files.map((file) => (
                  <TableRow key={file.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedFiles.includes(file.id)}
                        onChange={() => toggleSelect(file.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{file.original_filename}</div>
                      <div className="text-sm text-muted-foreground">
                        {file.source_language} → {file.target_language}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {getFileTypeIcon(file.file_type)} {file.file_type}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatFileSize(file.file_size)}</TableCell>
                    <TableCell>
                      <Badge variant={file.status === 'ready' ? 'default' : 'secondary'}>
                        {file.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(file.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button variant="ghost" size="icon" asChild>
                          <Link to={`/projects/${project.id}/files/${file.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                          <Link to={`/files/${file.id}/download`} download>
                            <Download className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>У цьому проєкті ще немає файлів</p>
            <Button asChild className="mt-4">
              <Link to={`/projects/${project.id}/files/new`}>
                <Upload className="h-4 w-4 mr-2" />
                Завантажити перший файл
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
