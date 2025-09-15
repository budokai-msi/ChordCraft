import { supabase } from '../supabaseClient';

class DatabaseService {
  // User Profile Management
  async createUserProfile(userId, profileData) {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert([{
        id: userId,
        ...profileData
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getUserProfile(userId) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
    return data;
  }

  async updateUserProfile(userId, updates) {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Project Management
  async createProject(projectData) {
    const { data, error } = await supabase
      .from('chordcraft_projects')
      .insert([projectData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getProjects(userId, options = {}) {
    const { 
      limit = 50, 
      offset = 0, 
      search = '', 
      tags = [], 
      isPublic = false,
      isTemplate = false 
    } = options;

    let query = supabase
      .from('chordcraft_projects')
      .select(`
        *,
        project_tracks(*),
        project_notes(*)
      `)
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (isPublic) {
      query = query.eq('is_public', true);
    }

    if (isTemplate) {
      query = query.eq('is_template', true);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (tags.length > 0) {
      query = query.overlaps('tags', tags);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async getProject(projectId) {
    const { data, error } = await supabase
      .from('chordcraft_projects')
      .select(`
        *,
        project_tracks(*),
        project_notes(*),
        project_versions(*)
      `)
      .eq('id', projectId)
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateProject(projectId, updates) {
    const { data, error } = await supabase
      .from('chordcraft_projects')
      .update(updates)
      .eq('id', projectId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async deleteProject(projectId) {
    const { error } = await supabase
      .from('chordcraft_projects')
      .delete()
      .eq('id', projectId);
    
    if (error) throw error;
  }

  // Track Management
  async createTrack(projectId, trackData) {
    const { data, error } = await supabase
      .from('project_tracks')
      .insert([{ project_id: projectId, ...trackData }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateTrack(trackId, updates) {
    const { data, error } = await supabase
      .from('project_tracks')
      .update(updates)
      .eq('id', trackId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async deleteTrack(trackId) {
    const { error } = await supabase
      .from('project_tracks')
      .delete()
      .eq('id', trackId);
    
    if (error) throw error;
  }

  // Note Management
  async createNote(projectId, noteData) {
    const { data, error } = await supabase
      .from('project_notes')
      .insert([{ project_id: projectId, ...noteData }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateNote(noteId, updates) {
    const { data, error } = await supabase
      .from('project_notes')
      .update(updates)
      .eq('id', noteId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async deleteNote(noteId) {
    const { error } = await supabase
      .from('project_notes')
      .delete()
      .eq('id', noteId);
    
    if (error) throw error;
  }

  async bulkUpdateNotes(projectId, notes) {
    // Delete existing notes
    await supabase
      .from('project_notes')
      .delete()
      .eq('project_id', projectId);

    // Insert new notes
    if (notes.length > 0) {
      const notesWithProjectId = notes.map(note => ({
        ...note,
        project_id: projectId
      }));

      const { data, error } = await supabase
        .from('project_notes')
        .insert(notesWithProjectId)
        .select();
      
      if (error) throw error;
      return data;
    }
  }

  // Version Control
  async createProjectVersion(projectId, versionData) {
    const { data, error } = await supabase
      .from('project_versions')
      .insert([{ project_id: projectId, ...versionData }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getProjectVersions(projectId) {
    const { data, error } = await supabase
      .from('project_versions')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  // AI Conversations
  async createConversation(conversationData) {
    const { data, error } = await supabase
      .from('ai_conversations')
      .insert([conversationData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getConversations(userId, projectId = null) {
    let query = supabase
      .from('ai_conversations')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async createMessage(conversationId, messageData) {
    const { data, error } = await supabase
      .from('ai_messages')
      .insert([{ conversation_id: conversationId, ...messageData }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getMessages(conversationId) {
    const { data, error } = await supabase
      .from('ai_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data;
  }

  // Audio Files
  async uploadAudioFile(fileData) {
    const { data, error } = await supabase
      .from('audio_files')
      .insert([fileData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getAudioFiles(userId, projectId = null) {
    let query = supabase
      .from('audio_files')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  // Templates
  async getTemplates(category = null) {
    let query = supabase
      .from('project_templates')
      .select('*')
      .eq('is_official', true)
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  // Collaboration
  async inviteCollaborator(projectId, email, role = 'viewer') {
    // First, get the user by email
    const { data: user, error: userError } = await supabase.auth.admin.getUserByEmail(email);
    if (userError) throw userError;

    const { data, error } = await supabase
      .from('project_collaborations')
      .insert([{
        project_id: projectId,
        user_id: user.user.id,
        role: role
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getCollaborators(projectId) {
    const { data, error } = await supabase
      .from('project_collaborations')
      .select(`
        *,
        user_profiles!inner(username, display_name, avatar_url)
      `)
      .eq('project_id', projectId);
    
    if (error) throw error;
    return data;
  }

  async updateCollaboratorRole(collaborationId, role) {
    const { data, error } = await supabase
      .from('project_collaborations')
      .update({ role })
      .eq('id', collaborationId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async removeCollaborator(collaborationId) {
    const { error } = await supabase
      .from('project_collaborations')
      .delete()
      .eq('id', collaborationId);
    
    if (error) throw error;
  }

  // Real-time subscriptions
  subscribeToProject(projectId, callback) {
    return supabase
      .channel(`project:${projectId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'chordcraft_projects',
          filter: `id=eq.${projectId}`
        }, 
        callback
      )
      .subscribe();
  }

  subscribeToNotes(projectId, callback) {
    return supabase
      .channel(`notes:${projectId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'project_notes',
          filter: `project_id=eq.${projectId}`
        }, 
        callback
      )
      .subscribe();
  }

  subscribeToTracks(projectId, callback) {
    return supabase
      .channel(`tracks:${projectId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'project_tracks',
          filter: `project_id=eq.${projectId}`
        }, 
        callback
      )
      .subscribe();
  }
}

export const databaseService = new DatabaseService();
