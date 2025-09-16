import React, { useState, useRef } from 'react';
import {
  Layout,
  Button,
  Card,
  Badge,
  Divider,
  Slider,
  Input,
  Progress,
  Tabs,
  Space,
  Row,
  Col,
  Typography,
  Tooltip,
  Upload,
  message,
  Modal,
  Form,
  Select,
  Switch,
  Table,
  Tag,
  Avatar,
  Dropdown,
  Menu,
  Drawer,
  Affix,
  FloatButton,
  ConfigProvider,
  theme
} from 'antd';
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  StepBackwardOutlined,
  StepForwardOutlined,
  VolumeUpOutlined,
  VolumeOffOutlined,
  SettingOutlined,
  UploadOutlined,
  DownloadOutlined,
  ShareAltOutlined,
  CopyOutlined,
  DeleteOutlined,
  PlusOutlined,
  MusicOutlined,
  HeadphonesOutlined,
  MicrophoneOutlined,
  RobotOutlined,
  CodeOutlined,
  BarChartOutlined,
  PianoOutlined,
  ThunderboltOutlined,
  StarOutlined,
  HeartOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  LockOutlined,
  UnlockOutlined,
  ShieldOutlined,
  CrownOutlined,
  TargetOutlined,
  MessageOutlined,
  FileTextOutlined,
  LayersOutlined,
  ClockCircleOutlined,
  UserOutlined,
  FolderOpenOutlined,
  SearchOutlined,
  FilterOutlined,
  MoreOutlined,
  EditOutlined,
  SaveOutlined,
  ReloadOutlined,
  ExternalLinkOutlined,
  ArrowRightOutlined,
  ArrowLeftOutlined,
  WandOutlined
} from '@ant-design/icons';
import { AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useProjectStore } from '../../stores/useProjectStore';
import { useUIStore } from '../../stores/useUIStore';
import { usePlaybackStore } from '../../stores/usePlaybackStore';
import { generateMusic } from '../../services/musicApiService';
import { analyzeAudio } from '../../services/audioAnalysisService';

const { Header, Content, Sider } = Layout;
const { TextArea } = Input;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

// Form validation schema
const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  tempo: z.number().min(60).max(200),
  timeSignature: z.string(),
  description: z.string().optional()
});

// Asset constants
const ASSETS = {
  aiPowered: '/assets/ai-powered-icon.png',
  daw: '/assets/daw-icon.png',
  musicToCode: '/assets/music-to-code-icon.png',
  realTimeAnalysis: '/assets/real-time-analysis-icon.png'
};

// Transport controls configuration
const TRANSPORT_CONTROLS = [
  { key: 'skipBack', icon: StepBackwardOutlined, action: 'skipBack', tooltip: 'Skip Backward' },
  { key: 'play', icon: PlayCircleOutlined, action: 'play', tooltip: 'Play', type: 'primary' },
  { key: 'pause', icon: PauseCircleOutlined, action: 'pause', tooltip: 'Pause' },
  { key: 'stop', icon: StopOutlined, action: 'stop', tooltip: 'Stop' },
  { key: 'skipForward', icon: StepForwardOutlined, action: 'skipForward', tooltip: 'Skip Forward' }
];

// Track types configuration
const TRACK_TYPES = [
  { key: 'audio', label: 'Audio', icon: MusicOutlined, color: 'blue' },
  { key: 'midi', label: 'MIDI', icon: PianoOutlined, color: 'green' },
  { key: 'drum', label: 'Drums', icon: HeadphonesOutlined, color: 'purple' },
  { key: 'vocal', label: 'Vocals', icon: MicrophoneOutlined, color: 'pink' }
];

export function ModernStudioAntd() {
  const { chordCraftCode, updateCode, currentProject } = useProjectStore();
  const { setAnalyzing, isAnalyzing } = useUIStore();
  const { currentTime, duration, volume, play, pause, stop, setVolume, setCurrentTime } = usePlaybackStore();
  
  const [state, setState] = useState({
    activeTab: 'timeline',
    selectedTrack: null,
    isRecording: false,
    isMuted: false,
    tempo: 120,
    timeSignature: '4/4',
    zoom: 1,
    showSettings: false,
    showProjectManager: false,
    showAICompanion: false,
    tracks: [],
    selectedTracks: [],
    isPro: false,
    dailyUsage: 0
  });

  const [maxDailyUsage] = useState(5);
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  // Form setup
  const { control } = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: currentProject?.name || '',
      tempo: state.tempo,
      timeSignature: state.timeSignature,
      description: currentProject?.description || ''
    }
  });

  // React Query for data fetching (commented out for now)
  // const { data: projects = [] } = useQuery({
  //   queryKey: ['projects'],
  //   queryFn: () => Promise.resolve([]), // Replace with actual API call
  //   staleTime: 5 * 60 * 1000
  // });

  // Mutations (commented out for now)
  // const createProjectMutation = useMutation({
  //   mutationFn: async (projectData) => {
  //     // Replace with actual API call
  //     return Promise.resolve({ id: Date.now(), ...projectData });
  //   },
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ['projects'] });
  //     message.success('Project created successfully!');
  //   },
  //   onError: () => {
  //     message.error('Failed to create project');
  //   }
  // });

  // const updateProjectMutation = useMutation({
  //   mutationFn: async (projectData) => {
  //     // Replace with actual API call
  //     return Promise.resolve(projectData);
  //   },
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ['projects'] });
  //     message.success('Project updated successfully!');
  //   },
  //   onError: () => {
  //     message.error('Failed to update project');
  //   }
  // });

  // Handlers
  const updateState = (updates) => setState(prev => ({ ...prev, ...updates }));

  const handleTransport = (action) => {
    switch (action) {
      case 'play':
        play();
        break;
      case 'pause':
        pause();
        break;
      case 'stop':
        stop();
        break;
      case 'skipBack':
        setCurrentTime(Math.max(0, currentTime - 10));
        break;
      case 'skipForward':
        setCurrentTime(Math.min(duration, currentTime + 10));
        break;
    }
  };

  const handleGenerateMusic = async (prompt) => {
    if (state.dailyUsage >= maxDailyUsage && !state.isPro) {
      message.warning('Daily usage limit reached. Upgrade to Pro for unlimited access.');
      return;
    }

    setAnalyzing(true);
    try {
      const response = await generateMusic({ prompt, userId: 'user' });
      if (response.success) {
        updateCode(chordCraftCode + '\n\n' + response.chordCraftCode);
        message.success('AI generated music successfully!');
        updateState({ dailyUsage: state.dailyUsage + 1 });
      } else {
        throw new Error(response.error || 'Generation failed');
      }
    } catch (error) {
      message.error(error.message);
    } finally {
      setAnalyzing(false);
    }
  };

  // const handleAnalyzeAudio = async (file) => {
    if (state.dailyUsage >= maxDailyUsage && !state.isPro) {
      message.warning('Daily usage limit reached. Upgrade to Pro for unlimited access.');
      return;
    }

    setAnalyzing(true);
    try {
      const result = await analyzeAudio(file);
      if (result.success) {
        message.success('Audio analyzed successfully!');
        return result;
      } else {
        throw new Error(result.error || 'Analysis failed');
      }
    } catch (error) {
      message.error(error.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleExportProject = () => {
    const projectData = {
      name: currentProject?.name || 'Untitled Project',
      code: chordCraftCode,
      tempo: state.tempo,
      timeSignature: state.timeSignature,
      tracks: state.tracks,
      timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectData.name}.chordcraft`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    message.success('Project exported successfully!');
  };

  const handleImportProject = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const projectData = JSON.parse(e.target.result);
        updateCode(projectData.code || '');
        updateState({
          tracks: projectData.tracks || [],
          tempo: projectData.tempo || 120,
          timeSignature: projectData.timeSignature || '4/4'
        });
        message.success('Project imported successfully!');
      } catch (error) {
        message.error('Failed to import project. Invalid file format.');
      }
    };
    reader.readAsText(file);
  };

  // Components
  const TransportControls = () => (
    <Space>
      {TRANSPORT_CONTROLS.map(({ key, icon: Icon, action, tooltip, type }) => (
        <Tooltip key={key} title={tooltip}>
          <Button
            type={type}
            shape="circle"
            icon={<Icon />}
            onClick={() => handleTransport(action)}
            size="large"
            aria-label={tooltip}
          />
        </Tooltip>
      ))}
    </Space>
  );

  const TrackList = () => (
    <Table
      dataSource={state.tracks}
      columns={[
        {
          title: 'Track',
          dataIndex: 'name',
          key: 'name',
          render: (text, record) => (
            <Space>
              <Avatar size="small" style={{ backgroundColor: record.color }}>
                {record.type.charAt(0).toUpperCase()}
              </Avatar>
              <div>
                <Text strong>{text}</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {record.type}
                </Text>
              </div>
            </Space>
          )
        },
        {
          title: 'Actions',
          key: 'actions',
          render: (_, record) => (
            <Space>
              <Tooltip title={record.mute ? 'Unmute' : 'Mute'}>
                <Button
                  type="text"
                  icon={record.mute ? <VolumeOffOutlined /> : <VolumeUpOutlined />}
                  onClick={() => {
                    const updatedTracks = state.tracks.map(track =>
                      track.id === record.id ? { ...track, mute: !track.mute } : track
                    );
                    updateState({ tracks: updatedTracks });
                  }}
                />
              </Tooltip>
              <Tooltip title="Delete">
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => {
                    const updatedTracks = state.tracks.filter(track => track.id !== record.id);
                    updateState({ tracks: updatedTracks });
                  }}
                />
              </Tooltip>
            </Space>
          )
        }
      ]}
      pagination={false}
      size="small"
    />
  );

  const AddTrackButton = () => (
    <Row gutter={[8, 8]}>
      {TRACK_TYPES.map(({ key, label, icon: Icon, color }) => (
        <Col span={12} key={key}>
          <Button
            block
            icon={<Icon />}
            onClick={() => {
              const newTrack = {
                id: Date.now(),
                name: `${label} Track ${state.tracks.length + 1}`,
                type: label,
                color: color,
                mute: false
              };
              updateState({ tracks: [...state.tracks, newTrack] });
            }}
            style={{ height: '40px' }}
          >
            {label}
          </Button>
        </Col>
      ))}
    </Row>
  );

  const menuItems = [
    {
      key: 'new',
      label: 'New Project',
      icon: <PlusOutlined />,
      onClick: () => updateState({ showProjectManager: true })
    },
    {
      key: 'export',
      label: 'Export Project',
      icon: <DownloadOutlined />,
      onClick: handleExportProject
    },
    {
      key: 'import',
      label: 'Import Project',
      icon: <UploadOutlined />,
      onClick: () => fileInputRef.current?.click()
    },
    {
      type: 'divider'
    },
    {
      key: 'settings',
      label: 'Settings',
      icon: <SettingOutlined />,
      onClick: () => updateState({ showSettings: true })
    }
  ];

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#8b5cf6',
          colorBgContainer: '#1a1a1a',
          colorBgElevated: '#2a2a2a',
          colorText: '#ffffff',
          colorTextSecondary: '#a0a0a0',
          borderRadius: 8
        }
      }}
    >
      <Layout style={{ minHeight: '100vh', background: '#0a0a0a' }}>
        {/* Header */}
        <Header style={{ 
          background: '#1a1a1a', 
          borderBottom: '1px solid #333',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Space size="large">
            <Space>
              <img src={ASSETS.daw} alt="DAW" style={{ width: 32, height: 32 }} />
              <Title level={3} style={{ margin: 0, color: '#8b5cf6' }}>
                ChordCraft Studio
              </Title>
            </Space>
            <Badge 
              count="AI Powered" 
              style={{ backgroundColor: '#8b5cf6' }}
              offset={[0, 0]}
            >
              <img src={ASSETS.aiPowered} alt="AI Powered" style={{ width: 24, height: 24 }} />
            </Badge>
          </Space>

          <Space size="large">
            <TransportControls />
            <Divider type="vertical" style={{ height: 40 }} />
            
            <Space>
              <Text type="secondary">Tempo:</Text>
              <Slider
                value={state.tempo}
                onChange={(value) => updateState({ tempo: value })}
                min={60}
                max={200}
                style={{ width: 120 }}
                tooltip={{ formatter: (value) => `${value} BPM` }}
              />
              <Text code style={{ minWidth: 50 }}>{state.tempo} BPM</Text>
            </Space>

            <Space>
              <Text type="secondary">Volume:</Text>
              <Slider
                value={volume}
                onChange={setVolume}
                min={0}
                max={1}
                step={0.01}
                style={{ width: 120 }}
                tooltip={{ formatter: (value) => `${Math.round(value * 100)}%` }}
              />
              <Text code style={{ minWidth: 50 }}>{Math.round(volume * 100)}%</Text>
            </Space>
          </Space>
        </Header>

        {/* Main Content */}
        <Layout>
          {/* Sidebar */}
          <Sider width={300} style={{ background: '#1a1a1a', borderRight: '1px solid #333' }}>
            <Tabs
              activeKey={state.activeTab}
              onChange={(key) => updateState({ activeTab: key })}
              items={[
                {
                  key: 'timeline',
                  label: 'Timeline',
                  children: (
                    <div style={{ padding: '16px' }}>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Text strong>Time: {Math.floor(currentTime / 60)}:{(currentTime % 60).toFixed(1).padStart(4, '0')}</Text>
                        <Progress 
                          percent={(currentTime / duration) * 100} 
                          showInfo={false}
                          strokeColor="#8b5cf6"
                        />
                        <Text type="secondary">Duration: {Math.floor(duration / 60)}:{(duration % 60).toFixed(1).padStart(4, '0')}</Text>
                      </Space>
                    </div>
                  )
                },
                {
                  key: 'tracks',
                  label: 'Tracks',
                  children: (
                    <div style={{ padding: '16px' }}>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <AddTrackButton />
                        <Divider />
                        <TrackList />
                      </Space>
                    </div>
                  )
                },
                {
                  key: 'ai',
                  label: 'AI',
                  children: (
                    <div style={{ padding: '16px' }}>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Button
                          type="primary"
                          icon={<RobotOutlined />}
                          block
                          onClick={() => updateState({ showAICompanion: !state.showAICompanion })}
                        >
                          AI Assistant
                        </Button>
                        <Button
                          icon={<ThunderboltOutlined />}
                          block
                          onClick={() => handleGenerateMusic('Generate a new composition')}
                          loading={isAnalyzing}
                        >
                          Generate Music
                        </Button>
                      </Space>
                    </div>
                  )
                }
              ]}
            />
          </Sider>

          {/* Main Workspace */}
          <Content style={{ background: '#0a0a0a' }}>
            <div style={{ padding: '24px' }}>
              {/* Toolbar */}
              <Card 
                size="small" 
                style={{ marginBottom: 16, background: '#1a1a1a' }}
                bodyStyle={{ padding: '12px 16px' }}
              >
                <Row justify="space-between" align="middle">
                  <Col>
                    <Space>
                      <Dropdown menu={{ items: menuItems }} trigger={['click']}>
                        <Button icon={<MoreOutlined />}>File</Button>
                      </Dropdown>
                      <Button 
                        icon={<UploadOutlined />}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Import
                      </Button>
                      <Button 
                        icon={<DownloadOutlined />}
                        onClick={handleExportProject}
                      >
                        Export
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".chordcraft,.json"
                        onChange={(e) => e.target.files[0] && handleImportProject(e.target.files[0])}
                        style={{ display: 'none' }}
                      />
                    </Space>
                  </Col>
                  <Col>
                    <Space>
                      <Text type="secondary">Daily Usage: {state.dailyUsage}/{maxDailyUsage}</Text>
                      {!state.isPro && (
                        <Button type="primary" size="small">
                          <CrownOutlined /> Upgrade to Pro
                        </Button>
                      )}
                    </Space>
                  </Col>
                </Row>
              </Card>

              {/* Code Editor */}
              <Card 
                title="ChordCraft Code Editor"
                extra={
                  <Space>
                    <Button icon={<CopyOutlined />} size="small">Copy</Button>
                    <Button icon={<SaveOutlined />} size="small">Save</Button>
                  </Space>
                }
                style={{ background: '#1a1a1a' }}
              >
                <TextArea
                  value={chordCraftCode}
                  onChange={(e) => updateCode(e.target.value)}
                  placeholder="Enter your ChordCraft code here..."
                  style={{ 
                    height: 400, 
                    fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                    fontSize: '14px',
                    background: '#0a0a0a',
                    color: '#ffffff',
                    border: '1px solid #333'
                  }}
                  aria-label="ChordCraft code editor"
                />
              </Card>
            </div>
          </Content>
        </Layout>

        {/* AI Companion Drawer */}
        <Drawer
          title="AI Music Companion"
          placement="right"
          open={state.showAICompanion}
          onClose={() => updateState({ showAICompanion: false })}
          width={400}
          style={{ background: '#1a1a1a' }}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <Card size="small" style={{ background: '#2a2a2a' }}>
              <Text>🎵 Hello! I'm your AI music companion. What would you like to create today?</Text>
            </Card>
            
            <Form layout="vertical">
              <Form.Item label="Style">
                <Select placeholder="Select style" size="large">
                  <Select.Option value="electronic">Electronic</Select.Option>
                  <Select.Option value="jazz">Jazz</Select.Option>
                  <Select.Option value="classical">Classical</Select.Option>
                  <Select.Option value="rock">Rock</Select.Option>
                  <Select.Option value="hip-hop">Hip-Hop</Select.Option>
                  <Select.Option value="ambient">Ambient</Select.Option>
                </Select>
              </Form.Item>
              
              <Form.Item label="Mood">
                <Select placeholder="Select mood" size="large">
                  <Select.Option value="energetic">Energetic</Select.Option>
                  <Select.Option value="calm">Calm</Select.Option>
                  <Select.Option value="dark">Dark</Select.Option>
                  <Select.Option value="bright">Bright</Select.Option>
                  <Select.Option value="melancholic">Melancholic</Select.Option>
                  <Select.Option value="uplifting">Uplifting</Select.Option>
                </Select>
              </Form.Item>
              
              <Form.Item label="Length">
                <Select placeholder="Select length" size="large">
                  <Select.Option value="8">8 bars</Select.Option>
                  <Select.Option value="16">16 bars</Select.Option>
                  <Select.Option value="32">32 bars</Select.Option>
                </Select>
              </Form.Item>
              
              <Button 
                type="primary" 
                block 
                size="large"
                icon={<WandOutlined />}
                onClick={() => handleGenerateMusic('Generate a new composition')}
                loading={isAnalyzing}
              >
                Generate Music
              </Button>
            </Form>
          </Space>
        </Drawer>

        {/* Float Button for Quick Actions */}
        <FloatButton.Group
          trigger="hover"
          type="primary"
          style={{ right: 24 }}
          icon={<PlusOutlined />}
        >
          <FloatButton 
            icon={<MusicOutlined />} 
            tooltip="Add Audio Track"
            onClick={() => {
              const newTrack = {
                id: Date.now(),
                name: `Audio Track ${state.tracks.length + 1}`,
                type: 'Audio',
                color: 'blue',
                mute: false
              };
              updateState({ tracks: [...state.tracks, newTrack] });
            }}
          />
          <FloatButton 
            icon={<RobotOutlined />} 
            tooltip="AI Assistant"
            onClick={() => updateState({ showAICompanion: !state.showAICompanion })}
          />
          <FloatButton 
            icon={<SettingOutlined />} 
            tooltip="Settings"
            onClick={() => updateState({ showSettings: true })}
          />
        </FloatButton.Group>
      </Layout>
    </ConfigProvider>
  );
}
