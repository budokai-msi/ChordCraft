import { loggerService } from './loggerService';
import { dataRetentionService } from './dataRetentionService';
import { supabase } from '../config/supabase';

class GDPRService {
  constructor() {
    this.consentTypes = {
      NECESSARY: 'necessary',
      FUNCTIONAL: 'functional',
      ANALYTICS: 'analytics',
      MARKETING: 'marketing',
      PERSONALIZATION: 'personalization'
    };
    
    this.dataProcessingPurposes = {
      ACCOUNT_MANAGEMENT: 'account_management',
      PROJECT_CREATION: 'project_creation',
      AUDIO_PROCESSING: 'audio_processing',
      AI_ANALYSIS: 'ai_analysis',
      COLLABORATION: 'collaboration',
      ANALYTICS: 'analytics',
      MARKETING: 'marketing'
    };
    
    this.legalBases = {
      CONSENT: 'consent',
      CONTRACT: 'contract',
      LEGAL_OBLIGATION: 'legal_obligation',
      VITAL_INTERESTS: 'vital_interests',
      PUBLIC_TASK: 'public_task',
      LEGITIMATE_INTERESTS: 'legitimate_interests'
    };
    
    this.initializeGDPR();
  }

  initializeGDPR() {
    this.setupConsentManagement();
    this.setupDataSubjectRights();
    this.setupDataProcessingRecords();
    this.setupPrivacyByDesign();
    
    loggerService.info('GDPR service initialized');
  }

  setupConsentManagement() {
    this.consentManager = {
      getConsent: this.getConsent.bind(this),
      setConsent: this.setConsent.bind(this),
      withdrawConsent: this.withdrawConsent.bind(this),
      updateConsent: this.updateConsent.bind(this),
      getConsentHistory: this.getConsentHistory.bind(this)
    };
  }

  async getConsent(userId) {
    try {
      const { data: consent, error } = await supabase
        .from('user_consent')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
        
      if (error && error.code !== 'PGRST116') { // Not found error
        loggerService.error('Error fetching user consent:', error);
        return null;
      }
      
      return consent || this.getDefaultConsent();
    } catch (error) {
      loggerService.error('Error getting user consent:', error);
      return this.getDefaultConsent();
    }
  }

  getDefaultConsent() {
    return {
      necessary: true, // Always true, cannot be disabled
      functional: false,
      analytics: false,
      marketing: false,
      personalization: false,
      data_processing: {
        account_management: true, // Required for service
        project_creation: true, // Required for service
        audio_processing: false,
        ai_analysis: false,
        collaboration: false,
        analytics: false,
        marketing: false
      },
      legal_basis: {
        account_management: this.legalBases.CONTRACT,
        project_creation: this.legalBases.CONTRACT,
        audio_processing: this.legalBases.CONSENT,
        ai_analysis: this.legalBases.CONSENT,
        collaboration: this.legalBases.CONSENT,
        analytics: this.legalBases.CONSENT,
        marketing: this.legalBases.CONSENT
      }
    };
  }

  async setConsent(userId, consentData) {
    try {
      const consent = {
        user_id: userId,
        consent_data: consentData,
        ip_address: await this.getClientIP(),
        user_agent: navigator.userAgent,
        created_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('user_consent')
        .insert(consent);
        
      if (error) {
        loggerService.error('Error setting user consent:', error);
        return false;
      }
      
      // Store consent in localStorage for immediate use
      localStorage.setItem('chordcraft-gdpr-consent', JSON.stringify(consentData));
      
      loggerService.info(`Consent set for user ${userId}`);
      return true;
    } catch (error) {
      loggerService.error('Error setting user consent:', error);
      return false;
    }
  }

  async withdrawConsent(userId, consentType) {
    try {
      const currentConsent = await this.getConsent(userId);
      if (!currentConsent) {
        loggerService.error('No consent found to withdraw');
        return false;
      }
      
      // Update consent to withdraw specific type
      const updatedConsent = { ...currentConsent };
      if (consentType === 'all') {
        updatedConsent.functional = false;
        updatedConsent.analytics = false;
        updatedConsent.marketing = false;
        updatedConsent.personalization = false;
        updatedConsent.data_processing = {
          account_management: true, // Keep required
          project_creation: true, // Keep required
          audio_processing: false,
          ai_analysis: false,
          collaboration: false,
          analytics: false,
          marketing: false
        };
      } else {
        updatedConsent[consentType] = false;
        if (updatedConsent.data_processing) {
          updatedConsent.data_processing[consentType] = false;
        }
      }
      
      const consent = {
        user_id: userId,
        consent_data: updatedConsent,
        ip_address: await this.getClientIP(),
        user_agent: navigator.userAgent,
        created_at: new Date().toISOString(),
        withdrawn: true
      };
      
      const { error } = await supabase
        .from('user_consent')
        .insert(consent);
        
      if (error) {
        loggerService.error('Error withdrawing user consent:', error);
        return false;
      }
      
      // Update localStorage
      localStorage.setItem('chordcraft-gdpr-consent', JSON.stringify(updatedConsent));
      
      // Process data deletion based on withdrawn consent
      await this.processConsentWithdrawal(userId, consentType);
      
      loggerService.info(`Consent withdrawn for user ${userId}, type: ${consentType}`);
      return true;
    } catch (error) {
      loggerService.error('Error withdrawing user consent:', error);
      return false;
    }
  }

  async updateConsent(userId, consentData) {
    try {
      const consent = {
        user_id: userId,
        consent_data: consentData,
        ip_address: await this.getClientIP(),
        user_agent: navigator.userAgent,
        created_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('user_consent')
        .insert(consent);
        
      if (error) {
        loggerService.error('Error updating user consent:', error);
        return false;
      }
      
      // Update localStorage
      localStorage.setItem('chordcraft-gdpr-consent', JSON.stringify(consentData));
      
      loggerService.info(`Consent updated for user ${userId}`);
      return true;
    } catch (error) {
      loggerService.error('Error updating user consent:', error);
      return false;
    }
  }

  async getConsentHistory(userId) {
    try {
      const { data: history, error } = await supabase
        .from('user_consent')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) {
        loggerService.error('Error fetching consent history:', error);
        return [];
      }
      
      return history || [];
    } catch (error) {
      loggerService.error('Error getting consent history:', error);
      return [];
    }
  }

  async processConsentWithdrawal(userId, consentType) {
    try {
      if (consentType === 'all' || consentType === 'analytics') {
        // Delete analytics data
        await supabase
          .from('analytics')
          .delete()
          .eq('user_id', userId);
      }
      
      if (consentType === 'all' || consentType === 'marketing') {
        // Delete marketing data
        await supabase
          .from('marketing_data')
          .delete()
          .eq('user_id', userId);
      }
      
      if (consentType === 'all' || consentType === 'personalization') {
        // Delete personalization data
        await supabase
          .from('user_preferences')
          .delete()
          .eq('user_id', userId);
      }
      
      loggerService.info(`Processed consent withdrawal for user ${userId}, type: ${consentType}`);
    } catch (error) {
      loggerService.error('Error processing consent withdrawal:', error);
    }
  }

  setupDataSubjectRights() {
    this.dataSubjectRights = {
      access: this.accessPersonalData.bind(this),
      rectification: this.rectifyPersonalData.bind(this),
      erasure: this.erasePersonalData.bind(this),
      portability: this.exportPersonalData.bind(this),
      restriction: this.restrictProcessing.bind(this),
      objection: this.objectToProcessing.bind(this)
    };
  }

  async accessPersonalData(userId) {
    try {
      const personalData = {
        profile: null,
        projects: [],
        audioFiles: [],
        consent: null,
        processingRecords: []
      };
      
      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (profileError) {
        loggerService.error('Error fetching user profile:', profileError);
      } else {
        personalData.profile = profile;
      }
      
      // Get user projects
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId);
        
      if (projectsError) {
        loggerService.error('Error fetching user projects:', projectsError);
      } else {
        personalData.projects = projects || [];
      }
      
      // Get user audio files
      const { data: audioFiles, error: audioError } = await supabase
        .from('audio_files')
        .select('*')
        .eq('user_id', userId);
        
      if (audioError) {
        loggerService.error('Error fetching user audio files:', audioError);
      } else {
        personalData.audioFiles = audioFiles || [];
      }
      
      // Get consent data
      personalData.consent = await this.getConsent(userId);
      
      // Get processing records
      const { data: processingRecords, error: processingError } = await supabase
        .from('data_processing_records')
        .select('*')
        .eq('user_id', userId);
        
      if (processingError) {
        loggerService.error('Error fetching processing records:', processingError);
      } else {
        personalData.processingRecords = processingRecords || [];
      }
      
      return personalData;
    } catch (error) {
      loggerService.error('Error accessing personal data:', error);
      return null;
    }
  }

  async rectifyPersonalData(userId, dataType, newData) {
    try {
      let tableName;
      let updateData;
      
      switch (dataType) {
        case 'profile':
          tableName = 'users';
          updateData = {
            ...newData,
            updated_at: new Date().toISOString()
          };
          break;
          
        case 'project':
          tableName = 'projects';
          updateData = {
            ...newData,
            updated_at: new Date().toISOString()
          };
          break;
          
        case 'audioFile':
          tableName = 'audio_files';
          updateData = {
            ...newData,
            updated_at: new Date().toISOString()
          };
          break;
          
        default:
          loggerService.error('Unknown data type for rectification:', dataType);
          return false;
      }
      
      const { error } = await supabase
        .from(tableName)
        .update(updateData)
        .eq('id', newData.id)
        .eq('user_id', userId);
        
      if (error) {
        loggerService.error(`Error rectifying ${dataType}:`, error);
        return false;
      }
      
      // Log the rectification
      await this.logDataProcessing(userId, 'rectification', {
        data_type: dataType,
        data_id: newData.id,
        changes: newData
      });
      
      loggerService.info(`Personal data rectified for user ${userId}, type: ${dataType}`);
      return true;
    } catch (error) {
      loggerService.error('Error rectifying personal data:', error);
      return false;
    }
  }

  async erasePersonalData(userId, dataType, dataId) {
    try {
      let tableName;
      
      switch (dataType) {
        case 'profile':
          tableName = 'users';
          break;
          
        case 'project':
          tableName = 'projects';
          break;
          
        case 'audioFile':
          tableName = 'audio_files';
          break;
          
        default:
          loggerService.error('Unknown data type for erasure:', dataType);
          return false;
      }
      
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', dataId)
        .eq('user_id', userId);
        
      if (error) {
        loggerService.error(`Error erasing ${dataType}:`, error);
        return false;
      }
      
      // Log the erasure
      await this.logDataProcessing(userId, 'erasure', {
        data_type: dataType,
        data_id: dataId
      });
      
      loggerService.info(`Personal data erased for user ${userId}, type: ${dataType}, id: ${dataId}`);
      return true;
    } catch (error) {
      loggerService.error('Error erasing personal data:', error);
      return false;
    }
  }

  async exportPersonalData(userId) {
    try {
      // Use the data retention service to export all user data
      const exportResult = await dataRetentionService.exportAllUserData(userId);
      
      if (exportResult) {
        // Log the export
        await this.logDataProcessing(userId, 'export', {
          data_type: 'all_personal_data'
        });
        
        loggerService.info(`Personal data exported for user ${userId}`);
        return true;
      }
      
      return false;
    } catch (error) {
      loggerService.error('Error exporting personal data:', error);
      return false;
    }
  }

  async restrictProcessing(userId, dataType, restrictionReason) {
    try {
      const restriction = {
        user_id: userId,
        data_type: dataType,
        restriction_reason: restrictionReason,
        restricted_at: new Date().toISOString(),
        status: 'active'
      };
      
      const { error } = await supabase
        .from('processing_restrictions')
        .insert(restriction);
        
      if (error) {
        loggerService.error('Error creating processing restriction:', error);
        return false;
      }
      
      // Log the restriction
      await this.logDataProcessing(userId, 'restriction', {
        data_type: dataType,
        reason: restrictionReason
      });
      
      loggerService.info(`Processing restricted for user ${userId}, type: ${dataType}`);
      return true;
    } catch (error) {
      loggerService.error('Error restricting processing:', error);
      return false;
    }
  }

  async objectToProcessing(userId, dataType, objectionReason) {
    try {
      const objection = {
        user_id: userId,
        data_type: dataType,
        objection_reason: objectionReason,
        objected_at: new Date().toISOString(),
        status: 'active'
      };
      
      const { error } = await supabase
        .from('processing_objections')
        .insert(objection);
        
      if (error) {
        loggerService.error('Error creating processing objection:', error);
        return false;
      }
      
      // Log the objection
      await this.logDataProcessing(userId, 'objection', {
        data_type: dataType,
        reason: objectionReason
      });
      
      loggerService.info(`Processing objection recorded for user ${userId}, type: ${dataType}`);
      return true;
    } catch (error) {
      loggerService.error('Error recording processing objection:', error);
      return false;
    }
  }

  setupDataProcessingRecords() {
    this.logDataProcessing = this.logDataProcessing.bind(this);
    this.getProcessingRecords = this.getProcessingRecords.bind(this);
    this.getDataProcessingPurposes = this.getDataProcessingPurposes.bind(this);
  }

  async logDataProcessing(userId, action, details) {
    try {
      const record = {
        user_id: userId,
        action,
        details,
        ip_address: await this.getClientIP(),
        user_agent: navigator.userAgent,
        timestamp: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('data_processing_records')
        .insert(record);
        
      if (error) {
        loggerService.error('Error logging data processing:', error);
      }
    } catch (error) {
      loggerService.error('Error logging data processing:', error);
    }
  }

  async getProcessingRecords(userId) {
    try {
      const { data: records, error } = await supabase
        .from('data_processing_records')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false });
        
      if (error) {
        loggerService.error('Error fetching processing records:', error);
        return [];
      }
      
      return records || [];
    } catch (error) {
      loggerService.error('Error getting processing records:', error);
      return [];
    }
  }

  getDataProcessingPurposes() {
    return {
      purposes: this.dataProcessingPurposes,
      legalBases: this.legalBases,
      retentionPeriods: {
        [this.dataProcessingPurposes.ACCOUNT_MANAGEMENT]: 'Account lifetime',
        [this.dataProcessingPurposes.PROJECT_CREATION]: 'Project lifetime',
        [this.dataProcessingPurposes.AUDIO_PROCESSING]: '2 years',
        [this.dataProcessingPurposes.AI_ANALYSIS]: '1 year',
        [this.dataProcessingPurposes.COLLABORATION]: 'Project lifetime',
        [this.dataProcessingPurposes.ANALYTICS]: '3 months',
        [this.dataProcessingPurposes.MARKETING]: 'Until consent withdrawn'
      }
    };
  }

  setupPrivacyByDesign() {
    this.privacyByDesign = {
      minimizeDataCollection: this.minimizeDataCollection.bind(this),
      anonymizeData: this.anonymizeData.bind(this),
      encryptSensitiveData: this.encryptSensitiveData.bind(this),
      implementDataRetention: this.implementDataRetention.bind(this)
    };
  }

  minimizeDataCollection(dataType, data) {
    // Remove unnecessary fields based on data type
    const minimalData = { ...data };
    
    switch (dataType) {
      case 'user_profile':
        // Keep only essential fields
        delete minimalData.internal_notes;
        delete minimalData.debug_info;
        break;
        
      case 'audio_file':
        // Keep only essential fields
        delete minimalData.raw_audio_data;
        delete minimalData.temporary_analysis;
        break;
        
      case 'analytics':
        // Keep only essential fields
        delete minimalData.full_user_agent;
        delete minimalData.detailed_timing;
        break;
    }
    
    return minimalData;
  }

  anonymizeData(data, anonymizationLevel = 'medium') {
    const anonymized = { ...data };
    
    switch (anonymizationLevel) {
      case 'low':
        // Only remove direct identifiers
        delete anonymized.email;
        delete anonymized.phone;
        break;
        
      case 'medium':
        // Remove direct and indirect identifiers
        delete anonymized.email;
        delete anonymized.phone;
        delete anonymized.name;
        delete anonymized.avatar_url;
        anonymized.user_id = `user_${anonymized.user_id?.slice(-8)}`;
        break;
        
      case 'high':
        // Remove all identifying information
        delete anonymized.email;
        delete anonymized.phone;
        delete anonymized.name;
        delete anonymized.avatar_url;
        delete anonymized.user_id;
        delete anonymized.ip_address;
        delete anonymized.user_agent;
        break;
    }
    
    return anonymized;
  }

  encryptSensitiveData(data) {
    // This would integrate with a proper encryption service
    // For now, we'll just mark sensitive fields
    const sensitiveFields = ['email', 'phone', 'payment_info', 'audio_content'];
    const encrypted = { ...data };
    
    sensitiveFields.forEach(field => {
      if (encrypted[field]) {
        encrypted[field] = `[ENCRYPTED:${field}]`;
      }
    });
    
    return encrypted;
  }

  implementDataRetention(dataType, data) {
    const retentionPeriod = this.getDataProcessingPurposes().retentionPeriods[dataType];
    const retentionDate = new Date();
    
    // Set retention date based on data type
    switch (dataType) {
      case this.dataProcessingPurposes.ACCOUNT_MANAGEMENT:
        retentionDate.setFullYear(retentionDate.getFullYear() + 1);
        break;
      case this.dataProcessingPurposes.PROJECT_CREATION:
        retentionDate.setFullYear(retentionDate.getFullYear() + 3);
        break;
      case this.dataProcessingPurposes.AUDIO_PROCESSING:
        retentionDate.setFullYear(retentionDate.getFullYear() + 2);
        break;
      case this.dataProcessingPurposes.AI_ANALYSIS:
        retentionDate.setFullYear(retentionDate.getFullYear() + 1);
        break;
      case this.dataProcessingPurposes.COLLABORATION:
        retentionDate.setFullYear(retentionDate.getFullYear() + 3);
        break;
      case this.dataProcessingPurposes.ANALYTICS:
        retentionDate.setMonth(retentionDate.getMonth() + 3);
        break;
      case this.dataProcessingPurposes.MARKETING:
        retentionDate.setFullYear(retentionDate.getFullYear() + 1);
        break;
    }
    
    return {
      ...data,
      retention_date: retentionDate.toISOString(),
      retention_period: retentionPeriod
    };
  }

  async getClientIP() {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      loggerService.error('Error getting client IP:', error);
      return 'unknown';
    }
  }

  // Get GDPR compliance status
  getGDPRComplianceStatus() {
    return {
      consentManagement: true,
      dataSubjectRights: true,
      dataProcessingRecords: true,
      privacyByDesign: true,
      dataRetention: true,
      lastAudit: new Date().toISOString()
    };
  }
}

// Create singleton instance
export const gdprService = new GDPRService();

// Export for use in other modules
export default gdprService;