import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, FolderOpen, Music, Calendar, MoreHorizontal, Play, Download, Trash2, Lock, Star } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function ProjectManager({ isPro }) {
  const [projects, setProjects] = useState([
    {
      id: "1",
      name: "Jazz Fusion Experiment",
      description: "Exploring complex chord progressions with AI-generated harmonies",
      createdAt: new Date("2024-01-15"),
      lastModified: new Date("2024-01-20"),
      tracks: 8,
      duration: "3:45",
      isPro: true,
      isStarred: true,
    },
    {
      id: "2",
      name: "Ambient Soundscape",
      description: "Atmospheric composition using generative techniques",
      createdAt: new Date("2024-01-10"),
      lastModified: new Date("2024-01-18"),
      tracks: 5,
      duration: "7:22",
      isPro: true,
      isStarred: false,
    },
    {
      id: "3",
      name: "Basic Demo Track",
      description: "Simple melody for testing",
      createdAt: new Date("2024-01-05"),
      lastModified: new Date("2024-01-05"),
      tracks: 2,
      duration: "1:30",
      isPro: false,
      isStarred: false,
    },
  ]);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
  });

  const freeProjectLimit = 3;
  const freeProjects = projects.filter((p) => !p.isPro);
  const canCreateProject = isPro || freeProjects.length < freeProjectLimit;

  const handleCreateProject = () => {
    if (!canCreateProject || !newProject.name.trim()) return;

    const project = {
      id: Date.now().toString(),
      name: newProject.name,
      description: newProject.description,
      createdAt: new Date(),
      lastModified: new Date(),
      tracks: 0,
      duration: "0:00",
      isPro: isPro,
      isStarred: false,
    };

    setProjects((prev) => [project, ...prev]);
    setNewProject({ name: "", description: "" });
    setIsCreateDialogOpen(false);
  };

  const toggleStar = (id) => {
    setProjects((prev) =>
      prev.map((project) => (project.id === id ? { ...project, isStarred: !project.isStarred } : project))
    );
  };

  const deleteProject = (id) => {
    setProjects((prev) => prev.filter((project) => project.id !== id));
  };

  const loadProject = (project) => {
    console.log('[ProjectManager] Loading project:', project.name);
    // This would load the project into the studio
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Projects</h2>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" disabled={!canCreateProject} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="project-name">Project Name</Label>
                  <Input
                    id="project-name"
                    value={newProject.name}
                    onChange={(e) => setNewProject((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter project name..."
                  />
                </div>
                <div>
                  <Label htmlFor="project-description">Description (Optional)</Label>
                  <Textarea
                    id="project-description"
                    value={newProject.description}
                    onChange={(e) => setNewProject((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your project..."
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateProject} disabled={!newProject.name.trim()}>
                    Create Project
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Project Limits Info */}
        {!isPro && (
          <div className="bg-muted rounded-lg p-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                Free Projects: {freeProjects.length}/{freeProjectLimit}
              </span>
              {freeProjects.length >= freeProjectLimit && (
                <Badge variant="outline" className="text-xs">
                  Limit Reached
                </Badge>
              )}
            </div>
            {freeProjects.length >= freeProjectLimit && (
              <p className="text-muted-foreground mt-2">Upgrade to PRO for unlimited projects</p>
            )}
          </div>
        )}
      </div>

      {/* Projects List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {projects.length === 0 ? (
            <div className="text-center py-12">
              <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No projects yet</p>
              <p className="text-sm text-muted-foreground">Create your first project to get started</p>
            </div>
          ) : (
            projects.map((project) => (
              <Card
                key={project.id}
                className="cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => loadProject(project)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-foreground">{project.name}</h3>
                      {project.isPro && (
                        <Badge variant="secondary" className="text-xs">
                          PRO
                        </Badge>
                      )}
                      {!isPro && project.isPro && <Lock className="h-3 w-3 text-muted-foreground" />}
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStar(project.id);
                        }}
                      >
                        <Star
                          className={`h-3 w-3 ${
                            project.isStarred ? "fill-primary text-primary" : "text-muted-foreground"
                          }`}
                        />
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => e.stopPropagation()}>
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              loadProject(project);
                            }}
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Open Project
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                            <Download className="h-4 w-4 mr-2" />
                            Export
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteProject(project.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {project.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{project.description}</p>
                  )}

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Music className="h-3 w-3" />
                        <span>{project.tracks} tracks</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{project.duration}</span>
                      </div>
                    </div>
                    <span>{project.lastModified.toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
