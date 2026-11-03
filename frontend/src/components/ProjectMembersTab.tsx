import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Plus, Users, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { formatDate, getInitials, getAvatarColor } from '@/lib/utils';
import type { Project, ProjectMember } from '@/types';

interface ProjectMembersTabProps {
  project: Project;
  members: ProjectMember[];
}

const roleColors: Record<string, string> = {
  owner: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  admin: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  translator: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  reviewer: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  viewer: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
};

const roleLabels: Record<string, string> = {
  owner: 'Власник',
  admin: 'Адміністратор',
  translator: 'Перекладач',
  reviewer: 'Рецензент',
  viewer: 'Спостерігач',
};

export function ProjectMembersTab({ project, members }: ProjectMembersTabProps) {
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const toggleSelect = (memberId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Учасники проєкту</CardTitle>
            <CardDescription>
              Усі учасники цього проєкту
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button asChild size="sm">
              <Link to={`/projects/${project.id}/members/new`}>
                <Plus className="h-4 w-4 mr-2" />
                Додати
              </Link>
            </Button>
            {selectedMembers.length > 0 && (
              <Button variant="outline" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Видалити ({selectedMembers.length})
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {members.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedMembers(members.map((m) => m.id));
                        } else {
                          setSelectedMembers([]);
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>Учасник</TableHead>
                  <TableHead>Роль</TableHead>
                  <TableHead>Приєднався</TableHead>
                  <TableHead className="text-right">Дії</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedMembers.includes(member.id)}
                        onChange={() => toggleSelect(member.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-10 w-10 rounded-full flex items-center justify-center ${getAvatarColor(member.username || '')}`}
                        >
                          {getInitials(member.full_name || member.username || '')}
                        </div>
                        <div>
                          <div className="font-medium">{member.full_name || member.username}</div>
                          <div className="text-sm text-muted-foreground">{member.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={roleColors[member.role] || ''}>
                        {roleLabels[member.role] || member.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(member.joined_at)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button variant="ghost" size="icon">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {member.role !== 'owner' && (
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>У цьому проєкті ще немає учасників</p>
            <Button asChild className="mt-4">
              <Link to={`/projects/${project.id}/members/new`}>
                <Plus className="h-4 w-4 mr-2" />
                Додати першого учасника
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
