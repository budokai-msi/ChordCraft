import { loggerService } from './loggerService';
import { supabase } from '../config/supabase';

class DataRetentionService {
  constructor() {
    this.retentionPolicies = {
      userData: 365, // 1 year in days
      projectData: 1095, // 3 years in days
      audioFiles: 730, // 2 years in days
      analytics: 90, // 3 months in days
      logs: 30, // 30 days in days
      temporary: 7 // 7 days in days
    };
    
    this.dataTypes = {
      USER_PROFILE: 'userData',
      PROJECT: 'projectData',
      AUDIO_FILE: 'audioFiles',
      ANALYTICS: 'analytics',
      LOG: 'logs',
      TEMPORARY: 'temporary'
    };
    
    this.initializeDataRetention();
  }

  initializeDataRetention() {
    this.setupRetentionMonitoring();
    this.setupDataAnonymization();
    this.setupDataExport();
    this.setupDataDeletion();
    
    loggerService.info('Data retention service initialized');
  }

  setupRetentionMonitoring() {
    // Check for expired data daily
    setInterval(() => {
      this.processExpiredData();
    }, 24 * 60 * 60 * 1000); // 24 hours

    // Initial check
    this.processExpiredData();
    
    loggerService.debug('Data retention monitoring setup complete');
  }

  async processExpiredData() {
    try {
      loggerService.info('Processing expired data for retention policies');
      
      const now = new Date();
      const expiredData = [];
      
      // Check each data type for expired records
      for (const [dataType, retentionDays] of Object.entries(this.retentionPolicies)) {
        const cutoffDate = new Date(now.getTime() - (retentionDays * 24 * 60 * 60 * 1000));
        
        const expired = await this.findExpiredData(dataType, cutoffDate);
        if (expired.length > 0) {
          expiredData.push({ dataType, count: expired.length, records: expired });
        }
      }
      
      if (expiredData.length > 0) {
        await this.handleExpiredData(expiredData);
      }
      
      loggerService.info(`Processed ${expiredData.length} data types with expired records`);
    } catch (error) {
      loggerService.error('Error processing expired data:', error);
    }
  }

  async findExpiredData(dataType, cutoffDate) {
    try {
      let query;
      
      switch (dataType) {
        case 'userData':
          query = supabase
            .from('users')
            .select('*')
            .lt('last_activity', cutoffDate.toISOString())
            .eq('deleted_at', null);
          break;
          
        case 'projectData':
          query = supabase
            .from('projects')
            .select('*')
            .lt('updated_at', cutoffDate.toISOString())
            .eq('deleted_at', null);
          break;
          
        case 'audioFiles':
          query = supabase
            .from('audio_files')
            .select('*')
            .lt('created_at', cutoffDate.toISOString())
            .eq('deleted_at', null);
          break;
          
        case 'analytics':
          query = supabase
            .from('analytics')
            .select('*')
            .lt('created_at', cutoffDate.toISOString());
          break;
          
        case 'logs':
          query = supabase
            .from('audit_logs')
            .select('*')
            .lt('created_at', cutoffDate.toISOString());
          break;
          
        case 'temporary':
          query = supabase
            .from('temporary_data')
            .select('*')
            .lt('created_at', cutoffDate.toISOString());
          break;
          
        default:
          return [];
      }
      
      const { data, error } = await query;
      
      if (error) {
        loggerService.error(`Error finding expired ${dataType}:`, error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      loggerService.error(`Error finding expired ${dataType}:`, error);
      return [];
    }
  }

  async handleExpiredData(expiredData) {
    for (const { dataType, records } of expiredData) {
      try {
        // First, try to anonymize the data
        const anonymized = await this.anonymizeData(dataType, records);
        
        if (anonymized.length > 0) {
          await this.updateAnonymizedData(dataType, anonymized);
          loggerService.info(`Anonymized ${anonymized.length} ${dataType} records`);
        }
        
        // Then, delete the original records
        await this.deleteExpiredData(dataType, records);
        loggerService.info(`Deleted ${records.length} expired ${dataType} records`);
        
      } catch (error) {
        loggerService.error(`Error handling expired ${dataType}:`, error);
      }
    }
  }

  async anonymizeData(dataType, records) {
    const anonymized = [];
    
    for (const record of records) {
      try {
        const anonymizedRecord = { ...record };
        
        // Anonymize based on data type
        switch (dataType) {
          case 'userData':
            anonymizedRecord.email = `anonymized_${record.id}@deleted.local`;
            anonymizedRecord.name = 'Deleted User';
            anonymizedRecord.avatar_url = null;
            anonymizedRecord.anonymized_at = new Date().toISOString();
            break;
            
          case 'projectData':
            anonymizedRecord.name = `Deleted Project ${record.id}`;
            anonymizedRecord.description = 'This project has been anonymized';
            anonymizedRecord.anonymized_at = new Date().toISOString();
            break;
            
          case 'audioFiles':
            anonymizedRecord.filename = `deleted_${record.id}.audio`;
            anonymizedRecord.original_filename = 'Deleted Audio File';
            anonymizedRecord.anonymized_at = new Date().toISOString();
            break;
            
          case 'analytics':
            anonymizedRecord.user_id = null;
            anonymizedRecord.session_id = null;
            anonymizedRecord.anonymized_at = new Date().toISOString();
            break;
            
          case 'logs':
            anonymizedRecord.user_id = null;
            anonymizedRecord.session_id = null;
            anonymizedRecord.ip_address = '0.0.0.0';
            anonymizedRecord.anonymized_at = new Date().toISOString();
            break;
        }
        
        anonymized.push(anonymizedRecord);
      } catch (error) {
        loggerService.error(`Error anonymizing record ${record.id}:`, error);
      }
    }
    
    return anonymized;
  }

  async updateAnonymizedData(dataType, anonymizedRecords) {
    try {
      const tableName = this.getTableName(dataType);
      
      for (const record of anonymizedRecords) {
        const { error } = await supabase
          .from(tableName)
          .update(record)
          .eq('id', record.id);
          
        if (error) {
          loggerService.error(`Error updating anonymized ${dataType} record ${record.id}:`, error);
        }
      }
    } catch (error) {
      loggerService.error(`Error updating anonymized ${dataType} data:`, error);
    }
  }

  async deleteExpiredData(dataType, records) {
    try {
      const tableName = this.getTableName(dataType);
      const recordIds = records.map(record => record.id);
      
      const { error } = await supabase
        .from(tableName)
        .delete()
        .in('id', recordIds);
        
      if (error) {
        loggerService.error(`Error deleting expired ${dataType} records:`, error);
      }
    } catch (error) {
      loggerService.error(`Error deleting expired ${dataType} data:`, error);
    }
  }

  getTableName(dataType) {
    const tableMap = {
      'userData': 'users',
      'projectData': 'projects',
      'audioFiles': 'audio_files',
      'analytics': 'analytics',
      'logs': 'audit_logs',
      'temporary': 'temporary_data'
    };
    
    return tableMap[dataType] || 'unknown';
  }

  setupDataAnonymization() {
    // Setup data anonymization for user requests
    this.anonymizeUserData = this.anonymizeUserData.bind(this);
    this.anonymizeProjectData = this.anonymizeProjectData.bind(this);
    this.anonymizeAudioData = this.anonymizeAudioData.bind(this);
  }

  async anonymizeUserData(userId) {
    try {
      const { data: user, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (fetchError) {
        loggerService.error('Error fetching user for anonymization:', fetchError);
        return false;
      }
      
      const anonymizedUser = {
        ...user,
        email: `anonymized_${user.id}@deleted.local`,
        name: 'Deleted User',
        avatar_url: null,
        anonymized_at: new Date().toISOString(),
        deleted_at: new Date().toISOString()
      };
      
      const { error: updateError } = await supabase
        .from('users')
        .update(anonymizedUser)
        .eq('id', userId);
        
      if (updateError) {
        loggerService.error('Error anonymizing user:', updateError);
        return false;
      }
      
      loggerService.info(`User ${userId} anonymized successfully`);
      return true;
    } catch (error) {
      loggerService.error('Error anonymizing user data:', error);
      return false;
    }
  }

  async anonymizeProjectData(projectId) {
    try {
      const { data: project, error: fetchError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();
        
      if (fetchError) {
        loggerService.error('Error fetching project for anonymization:', fetchError);
        return false;
      }
      
      const anonymizedProject = {
        ...project,
        name: `Deleted Project ${project.id}`,
        description: 'This project has been anonymized',
        anonymized_at: new Date().toISOString(),
        deleted_at: new Date().toISOString()
      };
      
      const { error: updateError } = await supabase
        .from('projects')
        .update(anonymizedProject)
        .eq('id', projectId);
        
      if (updateError) {
        loggerService.error('Error anonymizing project:', updateError);
        return false;
      }
      
      loggerService.info(`Project ${projectId} anonymized successfully`);
      return true;
    } catch (error) {
      loggerService.error('Error anonymizing project data:', error);
      return false;
    }
  }

  async anonymizeAudioData(audioFileId) {
    try {
      const { data: audioFile, error: fetchError } = await supabase
        .from('audio_files')
        .select('*')
        .eq('id', audioFileId)
        .single();
        
      if (fetchError) {
        loggerService.error('Error fetching audio file for anonymization:', fetchError);
        return false;
      }
      
      const anonymizedAudioFile = {
        ...audioFile,
        filename: `deleted_${audioFile.id}.audio`,
        original_filename: 'Deleted Audio File',
        anonymized_at: new Date().toISOString(),
        deleted_at: new Date().toISOString()
      };
      
      const { error: updateError } = await supabase
        .from('audio_files')
        .update(anonymizedAudioFile)
        .eq('id', audioFileId);
        
      if (updateError) {
        loggerService.error('Error anonymizing audio file:', updateError);
        return false;
      }
      
      loggerService.info(`Audio file ${audioFileId} anonymized successfully`);
      return true;
    } catch (error) {
      loggerService.error('Error anonymizing audio data:', error);
      return false;
    }
  }

  setupDataExport() {
    this.exportUserData = this.exportUserData.bind(this);
    this.exportProjectData = this.exportProjectData.bind(this);
    this.exportAllUserData = this.exportAllUserData.bind(this);
  }

  async exportUserData(userId) {
    try {
      const userData = {
        profile: null,
        projects: [],
        audioFiles: [],
        analytics: [],
        logs: []
      };
      
      // Export user profile
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (userError) {
        loggerService.error('Error fetching user profile:', userError);
      } else {
        userData.profile = user;
      }
      
      // Export user projects
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId);
        
      if (projectsError) {
        loggerService.error('Error fetching user projects:', projectsError);
      } else {
        userData.projects = projects || [];
      }
      
      // Export user audio files
      const { data: audioFiles, error: audioError } = await supabase
        .from('audio_files')
        .select('*')
        .eq('user_id', userId);
        
      if (audioError) {
        loggerService.error('Error fetching user audio files:', audioError);
      } else {
        userData.audioFiles = audioFiles || [];
      }
      
      // Export user analytics
      const { data: analytics, error: analyticsError } = await supabase
        .from('analytics')
        .select('*')
        .eq('user_id', userId);
        
      if (analyticsError) {
        loggerService.error('Error fetching user analytics:', analyticsError);
      } else {
        userData.analytics = analytics || [];
      }
      
      // Export user logs
      const { data: logs, error: logsError } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('user_id', userId);
        
      if (logsError) {
        loggerService.error('Error fetching user logs:', logsError);
      } else {
        userData.logs = logs || [];
      }
      
      // Create downloadable file
      const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `chordcraft-user-data-${userId}-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      
      loggerService.info(`User data exported for user ${userId}`);
      return true;
    } catch (error) {
      loggerService.error('Error exporting user data:', error);
      return false;
    }
  }

  async exportProjectData(projectId) {
    try {
      const projectData = {
        project: null,
        tracks: [],
        notes: [],
        audioFiles: []
      };
      
      // Export project details
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();
        
      if (projectError) {
        loggerService.error('Error fetching project:', projectError);
        return false;
      }
      
      projectData.project = project;
      
      // Export project tracks
      const { data: tracks, error: tracksError } = await supabase
        .from('tracks')
        .select('*')
        .eq('project_id', projectId);
        
      if (tracksError) {
        loggerService.error('Error fetching project tracks:', tracksError);
      } else {
        projectData.tracks = tracks || [];
      }
      
      // Export project notes
      const { data: notes, error: notesError } = await supabase
        .from('notes')
        .select('*')
        .eq('project_id', projectId);
        
      if (notesError) {
        loggerService.error('Error fetching project notes:', notesError);
      } else {
        projectData.notes = notes || [];
      }
      
      // Export project audio files
      const { data: audioFiles, error: audioError } = await supabase
        .from('audio_files')
        .select('*')
        .eq('project_id', projectId);
        
      if (audioError) {
        loggerService.error('Error fetching project audio files:', audioError);
      } else {
        projectData.audioFiles = audioFiles || [];
      }
      
      // Create downloadable file
      const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `chordcraft-project-${projectId}-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      
      loggerService.info(`Project data exported for project ${projectId}`);
      return true;
    } catch (error) {
      loggerService.error('Error exporting project data:', error);
      return false;
    }
  }

  async exportAllUserData(userId) {
    try {
      const allData = await this.exportUserData(userId);
      return allData;
    } catch (error) {
      loggerService.error('Error exporting all user data:', error);
      return false;
    }
  }

  setupDataDeletion() {
    this.deleteUserData = this.deleteUserData.bind(this);
    this.deleteProjectData = this.deleteProjectData.bind(this);
    this.deleteAudioData = this.deleteAudioData.bind(this);
  }

  async deleteUserData(userId) {
    try {
      // First anonymize the data
      await this.anonymizeUserData(userId);
      
      // Then delete all related data
      const tables = ['projects', 'audio_files', 'analytics', 'audit_logs'];
      
      for (const table of tables) {
        const { error } = await supabase
          .from(table)
          .delete()
          .eq('user_id', userId);
          
        if (error) {
          loggerService.error(`Error deleting user data from ${table}:`, error);
        }
      }
      
      // Finally delete the user record
      const { error: userError } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);
        
      if (userError) {
        loggerService.error('Error deleting user record:', userError);
        return false;
      }
      
      loggerService.info(`User data deleted for user ${userId}`);
      return true;
    } catch (error) {
      loggerService.error('Error deleting user data:', error);
      return false;
    }
  }

  async deleteProjectData(projectId) {
    try {
      // First anonymize the data
      await this.anonymizeProjectData(projectId);
      
      // Then delete all related data
      const tables = ['tracks', 'notes', 'audio_files'];
      
      for (const table of tables) {
        const { error } = await supabase
          .from(table)
          .delete()
          .eq('project_id', projectId);
          
        if (error) {
          loggerService.error(`Error deleting project data from ${table}:`, error);
        }
      }
      
      // Finally delete the project record
      const { error: projectError } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);
        
      if (projectError) {
        loggerService.error('Error deleting project record:', projectError);
        return false;
      }
      
      loggerService.info(`Project data deleted for project ${projectId}`);
      return true;
    } catch (error) {
      loggerService.error('Error deleting project data:', error);
      return false;
    }
  }

  async deleteAudioData(audioFileId) {
    try {
      // First anonymize the data
      await this.anonymizeAudioData(audioFileId);
      
      // Then delete the audio file record
      const { error } = await supabase
        .from('audio_files')
        .delete()
        .eq('id', audioFileId);
        
      if (error) {
        loggerService.error('Error deleting audio file record:', error);
        return false;
      }
      
      loggerService.info(`Audio data deleted for file ${audioFileId}`);
      return true;
    } catch (error) {
      loggerService.error('Error deleting audio data:', error);
      return false;
    }
  }

  // Get retention policy for a data type
  getRetentionPolicy(dataType) {
    return this.retentionPolicies[dataType] || 30; // Default 30 days
  }

  // Update retention policy
  updateRetentionPolicy(dataType, days) {
    if (Object.hasOwn(this.retentionPolicies, dataType)) {
      this.retentionPolicies[dataType] = days;
      loggerService.info(`Retention policy updated for ${dataType}: ${days} days`);
      return true;
    }
    return false;
  }

  // Get data retention status
  getDataRetentionStatus() {
    return {
      policies: this.retentionPolicies,
      dataTypes: this.dataTypes,
      lastProcessed: new Date().toISOString()
    };
  }
}

// Create singleton instance
export const dataRetentionService = new DataRetentionService();

// Export for use in other modules
export default dataRetentionService;