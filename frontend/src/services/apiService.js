import axios from 'axios';
import { loggerService } from './loggerService';

class APIService {
  constructor() {
    // Use Vercel serverless functions in production, local backend in development
    this.baseURL = import.meta.env.PROD 
      ? '/api' 
      : 'http://localhost:5000';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000, // 30 seconds for audio processing
      headers: {
        'Content-Type': 'application/json',
      }
    });

    // Add request interceptor for auth
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = localStorage.getItem('supabase.auth.token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        loggerService.error('API Error:', error);
        return Promise.reject(error);
      }
    );
  }

  // Audio Analysis
  async analyzeAudio(audioFile, options = {}) {
    const formData = new FormData();
    formData.append('audio', audioFile);
    
    // Add options
    if (options.analysisType) {
      formData.append('analysisType', options.analysisType);
    }
    if (options.tempo) {
      formData.append('tempo', options.tempo);
    }
    if (options.key) {
      formData.append('key', options.key);
    }

    try {
      const response = await this.client.post('/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 60 seconds for audio analysis
      });
      
      return response.data;
    } catch (error) {
      loggerService.error('Audio analysis failed:', error);
      throw new Error(`Audio analysis failed: ${error.response?.data?.error || error.message}`);
    }
  }

  // Music Generation
  async generateMusic(code, options = {}) {
    try {
      const response = await this.client.post('/generate-music', {
        chordCraftCode: code,
        ...options
      });
      
      return response.data;
    } catch (error) {
      loggerService.error('Music generation failed:', error);
      throw new Error(`Music generation failed: ${error.response?.data?.error || error.message}`);
    }
  }

  // AI Companion
  async generateWithAI(prompt, context = {}) {
    try {
      const response = await this.client.post('/generative-companion', {
        prompt,
        context
      });
      
      return response.data;
    } catch (error) {
      loggerService.error('AI generation failed:', error);
      throw new Error(`AI generation failed: ${error.response?.data?.error || error.message}`);
    }
  }

  // Health Check
  async healthCheck() {
    try {
      const response = await this.client.get('/health');
      return response.data;
    } catch (error) {
      loggerService.error('Health check failed:', error);
      throw new Error('Backend service unavailable');
    }
  }

  // File Upload with Progress
  async uploadFile(file, onProgress = null) {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await this.client.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        },
      });
      
      return response.data;
    } catch (error) {
      loggerService.error('File upload failed:', error);
      throw new Error(`File upload failed: ${error.response?.data?.error || error.message}`);
    }
  }

  // Audio Processing
  async processAudio(audioFile, effects = []) {
    const formData = new FormData();
    formData.append('audio', audioFile);
    formData.append('effects', JSON.stringify(effects));

    try {
      const response = await this.client.post('/process-audio', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 120000, // 2 minutes for audio processing
      });
      
      return response.data;
    } catch (error) {
      loggerService.error('Audio processing failed:', error);
      throw new Error(`Audio processing failed: ${error.response?.data?.error || error.message}`);
    }
  }

  // Export Functions
  async exportToMIDI(projectData) {
    try {
      const response = await this.client.post('/export/midi', projectData);
      return response.data;
    } catch (error) {
      loggerService.error('MIDI export failed:', error);
      throw new Error(`MIDI export failed: ${error.response?.data?.error || error.message}`);
    }
  }

  async exportToWAV(projectData) {
    try {
      const response = await this.client.post('/export/wav', projectData);
      return response.data;
    } catch (error) {
      loggerService.error('WAV export failed:', error);
      throw new Error(`WAV export failed: ${error.response?.data?.error || error.message}`);
    }
  }

  async exportToMP3(projectData) {
    try {
      const response = await this.client.post('/export/mp3', projectData);
      return response.data;
    } catch (error) {
      loggerService.error('MP3 export failed:', error);
      throw new Error(`MP3 export failed: ${error.response?.data?.error || error.message}`);
    }
  }

  // Real-time Collaboration
  async joinProject(projectId) {
    try {
      const response = await this.client.post(`/collaborate/join/${projectId}`);
      return response.data;
    } catch (error) {
      loggerService.error('Failed to join project:', error);
      throw new Error(`Failed to join project: ${error.response?.data?.error || error.message}`);
    }
  }

  async leaveProject(projectId) {
    try {
      const response = await this.client.post(`/collaborate/leave/${projectId}`);
      return response.data;
    } catch (error) {
      loggerService.error('Failed to leave project:', error);
      throw new Error(`Failed to leave project: ${error.response?.data?.error || error.message}`);
    }
  }

  // WebSocket connection for real-time updates
  connectWebSocket(projectId, onMessage) {
    const wsUrl = import.meta.env.PROD 
      ? `wss://${window.location.host}/api/ws/${projectId}`
      : `ws://localhost:5000/ws/${projectId}`;
    
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      loggerService.info('WebSocket connected');
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (error) {
        loggerService.error('WebSocket message parse error:', error);
      }
    };
    
    ws.onclose = () => {
      loggerService.info('WebSocket disconnected');
    };
    
    ws.onerror = (error) => {
      loggerService.error('WebSocket error:', error);
    };
    
    return ws;
  }

  // Utility methods
  async testConnection() {
    try {
      const response = await this.healthCheck();
      return {
        connected: true,
        backend: response.message || 'Backend connected',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        connected: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Get available audio devices
  async getAudioDevices() {
    try {
      const response = await this.client.get('/audio/devices');
      return response.data;
    } catch (error) {
      loggerService.error('Failed to get audio devices:', error);
      throw new Error(`Failed to get audio devices: ${error.response?.data?.error || error.message}`);
    }
  }

  // Get supported file formats
  async getSupportedFormats() {
    try {
      const response = await this.client.get('/formats');
      return response.data;
    } catch (error) {
      loggerService.error('Failed to get supported formats:', error);
      throw new Error(`Failed to get supported formats: ${error.response?.data?.error || error.message}`);
    }
  }
}

export const apiService = new APIService();
