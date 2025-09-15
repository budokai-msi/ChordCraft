import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  FolderOpen, 
  Plus, 
  Search, 
  Filter, 
  Grid, 
  List, 
  Star, 
  Clock, 
  User, 
  MoreVertical,
  Download,
  Share2,
  Trash2,
  Edit,
  Copy,
  Archive,
  Music,
  FileText,
  Calendar,
  Tag,
  Folder,
  FolderPlus,
  Sparkles,
  Zap,
  Brain
} from 'lucide-react';
import { useProjectStore } from '../../../stores/useProjectStore';
import { useAuth } from '../../../Auth';
import { databaseService } from '../../../services/databaseService';

export function ProjectManager() {
  const { user } = useAuth();
  const { projectTitle, chordCraftCode, musicAnalysis, setProjectTitle, updateCode, setMusicAnalysis } = useProjectStore();
  
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('updated');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');

  const tags = ['All', 'Electronic', 'Jazz', 'Classical', 'Rock', 'Hip-Hop', 'Ambient', 'Experimental'];
  const sortOptions = [
    { value: 'updated', label: 'Last Modified' },
    { value: 'created', label: 'Date Created' },
    { value: 'name', label: 'Name' },
    { value: 'size', label: 'Project Size' }
  ];

  useEffect(() => {
    fetchProjects();
  }, [user]);

  useEffect(() => {
    filterProjects();
  }, [projects, searchQuery, filterTag, sortBy]);

  const fetchProjects = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const data = await databaseService.getProjects(user.id, {
        search: searchQuery,
        tags: filterTag !== 'all' ? [filterTag] : [],
        limit: 50
      });
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterProjects = () => {
    let filtered = [...projects];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(project => 
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Tag filter
    if (filterTag !== 'all') {
      filtered = filtered.filter(project => 
        project.tags && project.tags.includes(filterTag.toLowerCase())
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.title.localeCompare(b.title);
        case 'created':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'size':
          return (b.code_content?.length || 0) - (a.code_content?.length || 0);
        case 'updated':
        default:
          return new Date(b.updated_at) - new Date(a.created_at);
      }
    });

    setFilteredProjects(filtered);
  };

  const createProject = async () => {
    if (!user || !newProjectName.trim()) return;

    try {
      const newProject = await databaseService.createProject({
        user_id: user.id,
        title: newProjectName,
        description: newProjectDescription,
        chordcraft_code: chordCraftCode || '// New project\n// Start creating your music here...',
        music_analysis: musicAnalysis,
        tags: []
      });
      
      setProjects(prev => [newProject, ...prev]);
      setShowCreateDialog(false);
      setNewProjectName('');
      setNewProjectDescription('');
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const loadProject = async (project) => {
    try {
      // Load full project data
      const fullProject = await databaseService.getProject(project.id);
      
      setProjectTitle(fullProject.title);
      updateCode(fullProject.chordcraft_code || '');
      setMusicAnalysis(fullProject.music_analysis);
      setSelectedProject(fullProject);
    } catch (error) {
      console.error('Error loading project:', error);
    }
  };

  const deleteProject = async (projectId) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      await databaseService.deleteProject(projectId);
      
      setProjects(prev => prev.filter(p => p.id !== projectId));
      if (selectedProject?.id === projectId) {
        setSelectedProject(null);
      }
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const duplicateProject = async (project) => {
    try {
      const { data, error } = await supabase
        .from('chordcraft_projects')
        .insert({
          user_id: user.id,
          title: `${project.title} (Copy)`,
          description: project.description,
          code_content: project.code_content,
          music_analysis: project.music_analysis,
          tags: project.tags
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setProjects(prev => [data, ...prev]);
    } catch (error) {
      console.error('Error duplicating project:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const getProjectSize = (code) => {
    const lines = code ? code.split('\n').length : 0;
    if (lines < 10) return 'Small';
    if (lines < 50) return 'Medium';
    return 'Large';
  };

  return (
    <div className="h-full flex flex-col space-y-6 animated-bg">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center vibrant-gradient-text">
            <FolderOpen className="w-8 h-8 mr-3 text-blue-400 pulse-glow" />
            Project Manager
          </h2>
          <p className="text-slate-300 mt-2">Organize and manage your music projects</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30 neon-glow">
            <Music className="w-4 h-4 mr-2" />
            {projects.length} Projects
          </Badge>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-pane">
              <DialogHeader>
                <DialogTitle className="text-xl vibrant-gradient-text">Create New Project</DialogTitle>
                <DialogDescription>
                  Start a new music project with AI assistance
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Project Name</label>
                  <Input
                    placeholder="My Amazing Song"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    className="vibrant-input"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Description (Optional)</label>
                  <Input
                    placeholder="A description of your project..."
                    value={newProjectDescription}
                    onChange={(e) => setNewProjectDescription(e.target.value)}
                    className="vibrant-input"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="hover:bg-slate-700/50">
                    Cancel
                  </Button>
                  <Button onClick={createProject} disabled={!newProjectName.trim()} className="btn-primary">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Create Project
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="glass-pane">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 vibrant-input"
                />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={filterTag}
                onChange={(e) => setFilterTag(e.target.value)}
                className="vibrant-input"
              >
                {tags.map(tag => (
                  <option key={tag} value={tag.toLowerCase()}>{tag}</option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="vibrant-input"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <div className="flex border border-slate-600 rounded-lg overflow-hidden">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-none"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-none"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projects Grid/List */}
      <div className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="vibrant-spinner w-12 h-12 mx-auto mb-4"></div>
              <p className="text-slate-300">Loading projects...</p>
            </div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <Card className="glass-pane">
            <CardContent className="p-16 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 neon-glow">
                <FolderOpen className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 vibrant-gradient-text">No projects found</h3>
              <p className="text-slate-300 mb-6 max-w-md mx-auto">
                {searchQuery ? 'Try adjusting your search terms' : 'Create your first project to get started'}
              </p>
              <Button onClick={() => setShowCreateDialog(true)} className="btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                Create Project
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
            : 'space-y-3'
          }>
            {filteredProjects.map((project) => (
              <Card 
                key={project.id} 
                className={`cursor-pointer hover:scale-105 transition-all duration-300 glass-pane ${
                  selectedProject?.id === project.id ? 'ring-2 ring-primary neon-glow' : ''
                }`}
                onClick={() => loadProject(project)}
              >
                <CardContent className="p-6">
                  {viewMode === 'grid' ? (
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center neon-glow">
                            <Music className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg truncate">{project.title}</h3>
                            <p className="text-sm text-slate-400">{formatDate(project.updated_at)}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Show project menu
                          }}
                          className="hover:bg-slate-700/50"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      {project.description && (
                        <p className="text-sm text-slate-300 line-clamp-2">{project.description}</p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" className="vibrant-badge">
                            {getProjectSize(project.code_content)}
                          </Badge>
                          {project.tags && project.tags.length > 0 && (
                            <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                              {project.tags[0]}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              duplicateProject(project);
                            }}
                            className="hover:bg-primary/20"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteProject(project.id);
                            }}
                            className="hover:bg-destructive/20"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center neon-glow">
                          <Music className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{project.title}</h3>
                          <p className="text-sm text-slate-300">{project.description || 'No description'}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">{formatDate(project.updated_at)}</p>
                          <p className="text-xs text-slate-400">{getProjectSize(project.code_content)}</p>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button variant="ghost" size="sm" className="hover:bg-primary/20">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="hover:bg-primary/20">
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="hover:bg-destructive/20">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
