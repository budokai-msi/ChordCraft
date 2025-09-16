import React, { useRef, useEffect, useState } from 'react';
import { Editor } from '@monaco-editor/react';
import { Card, Space, Button, Typography, Tooltip, Select, Switch, Divider } from 'antd';
import {
  CopyOutlined,
  SaveOutlined,
  UndoOutlined,
  RedoOutlined,
  FormatPainterOutlined,
  SearchOutlined,
  SwapOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  SettingOutlined,
  DownloadOutlined,
  UploadOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';

const { Title, Text } = Typography;

// ChordCraft language definition
const chordCraftLanguage = {
  id: 'chordcraft',
  extensions: ['.chordcraft', '.cc'],
  aliases: ['ChordCraft', 'chordcraft'],
  mimetypes: ['text/chordcraft'],
  configuration: {
    comments: {
      lineComment: '//',
      blockComment: ['/*', '*/']
    },
    brackets: [
      ['{', '}'],
      ['[', ']'],
      ['(', ')']
    ],
    autoClosingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '"', close: '"' },
      { open: "'", close: "'" }
    ],
    surroundingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '"', close: '"' },
      { open: "'", close: "'" }
    ]
  }
};

// ChordCraft syntax highlighting
const chordCraftTokensProvider = {
  tokenizer: {
    root: [
      [/\/\/.*$/, 'comment'],
      [/\/\*[\s\S]*?\*\//, 'comment'],
      [/\b(tempo|key|time_signature|section|chord_progression|rhythm|duration|melody|bass_line|scale|notes|pattern|phrasing|effects|reverb|delay)\b/, 'keyword'],
      [/\b(major|minor|maj7|m7|7|dim|aug|sus2|sus4|add9|maj9|m9|9|11|13|maj13|m13)\b/, 'type'],
      [/\b(quarter|eighth|sixteenth|whole|half|dotted|triplet|swing|straight|legato|staccato|accent)\b/, 'string'],
      [/\b(verse|chorus|bridge|intro|outro|solo|pad|lead|bass|drums|percussion)\b/, 'constant'],
      [/\b(4\/4|3\/4|2\/4|6\/8|12\/8|1\/4|2\/2)\b/, 'number'],
      [/\b(C|D|E|F|G|A|B|C#|D#|F#|G#|A#|Db|Eb|Gb|Ab|Bb)\b/, 'variable'],
      [/\b[0-9]+\b/, 'number'],
      [/\b[0-9]+\.[0-9]+\b/, 'number'],
      [/[{}()\[\]]/, 'delimiter'],
      [/[=+\-*/<>!&|]/, 'operator'],
      [/[;,.]/, 'delimiter']
    ]
  }
};

// ChordCraft autocomplete suggestions
const chordCraftSuggestions = [
  // Keywords
  { label: 'tempo', kind: 'keyword', insertText: 'tempo: ${1:120}', documentation: 'Set the tempo in BPM' },
  { label: 'key', kind: 'keyword', insertText: 'key: ${1:C_major}', documentation: 'Set the musical key' },
  { label: 'time_signature', kind: 'keyword', insertText: 'time_signature: ${1:4/4}', documentation: 'Set the time signature' },
  { label: 'section', kind: 'keyword', insertText: 'section ${1:main} {\n  $0\n}', documentation: 'Define a musical section' },
  { label: 'chord_progression', kind: 'keyword', insertText: 'chord_progression: [${1:C, Am, F, G}]', documentation: 'Define chord progression' },
  { label: 'rhythm', kind: 'keyword', insertText: 'rhythm: ${1:quarter_notes}', documentation: 'Set rhythm pattern' },
  { label: 'duration', kind: 'keyword', insertText: 'duration: ${1:8_bars}', documentation: 'Set duration' },
  { label: 'melody', kind: 'keyword', insertText: 'melody {\n  notes: [${1:C4, D4, E4, F4}]\n  rhythm: [${2:quarter, quarter, quarter, quarter}]\n}', documentation: 'Define melody' },
  { label: 'bass_line', kind: 'keyword', insertText: 'bass_line {\n  notes: [${1:C2, D2, E2, F2}]\n  rhythm: ${2:quarter_notes}\n}', documentation: 'Define bass line' },
  
  // Chords
  { label: 'C', kind: 'variable', insertText: 'C', documentation: 'C major chord' },
  { label: 'Cm', kind: 'variable', insertText: 'Cm', documentation: 'C minor chord' },
  { label: 'Cmaj7', kind: 'variable', insertText: 'Cmaj7', documentation: 'C major 7th chord' },
  { label: 'Cm7', kind: 'variable', insertText: 'Cm7', documentation: 'C minor 7th chord' },
  { label: 'C7', kind: 'variable', insertText: 'C7', documentation: 'C dominant 7th chord' },
  { label: 'Cdim', kind: 'variable', insertText: 'Cdim', documentation: 'C diminished chord' },
  { label: 'Caug', kind: 'variable', insertText: 'Caug', documentation: 'C augmented chord' },
  { label: 'Csus2', kind: 'variable', insertText: 'Csus2', documentation: 'C suspended 2nd chord' },
  { label: 'Csus4', kind: 'variable', insertText: 'Csus4', documentation: 'C suspended 4th chord' },
  
  // Rhythms
  { label: 'quarter_notes', kind: 'string', insertText: 'quarter_notes', documentation: 'Quarter note rhythm' },
  { label: 'eighth_notes', kind: 'string', insertText: 'eighth_notes', documentation: 'Eighth note rhythm' },
  { label: 'sixteenth_notes', kind: 'string', insertText: 'sixteenth_notes', documentation: 'Sixteenth note rhythm' },
  { label: 'swing_eighths', kind: 'string', insertText: 'swing_eighths', documentation: 'Swing eighth note rhythm' },
  { label: 'whole_notes', kind: 'string', insertText: 'whole_notes', documentation: 'Whole note rhythm' },
  { label: 'half_notes', kind: 'string', insertText: 'half_notes', documentation: 'Half note rhythm' },
  
  // Sections
  { label: 'verse', kind: 'constant', insertText: 'verse', documentation: 'Verse section' },
  { label: 'chorus', kind: 'constant', insertText: 'chorus', documentation: 'Chorus section' },
  { label: 'bridge', kind: 'constant', insertText: 'bridge', documentation: 'Bridge section' },
  { label: 'intro', kind: 'constant', insertText: 'intro', documentation: 'Introduction section' },
  { label: 'outro', kind: 'constant', insertText: 'outro', documentation: 'Outro section' }
];

export function CodeEditor({ 
  value, 
  onChange, 
  onPlay, 
  onPause, 
  onStop, 
  onSave, 
  onFormat,
  isPlaying = false,
  isPaused = false,
  height = '500px',
  showToolbar = true,
  showMinimap = true,
  showLineNumbers = true,
  theme = 'vs-dark',
  fontSize = 14,
  readOnly = false,
  placeholder = 'Enter your ChordCraft code here...'
}) {
  const editorRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editorTheme, setEditorTheme] = useState(theme);
  const [editorFontSize, setEditorFontSize] = useState(fontSize);
  const [editorMinimap, setEditorMinimap] = useState(showMinimap);
  const [editorLineNumbers, setEditorLineNumbers] = useState(showLineNumbers);

  // Register ChordCraft language
  useEffect(() => {
    if (window.monaco) {
      window.monaco.languages.register(chordCraftLanguage);
      window.monaco.languages.setMonarchTokensProvider('chordcraft', chordCraftTokensProvider);
      
      // Register autocomplete provider
      window.monaco.languages.registerCompletionItemProvider('chordcraft', {
        provideCompletionItems: (model, position) => {
          const suggestions = chordCraftSuggestions.map(suggestion => ({
            ...suggestion,
            range: {
              startLineNumber: position.lineNumber,
              endLineNumber: position.lineNumber,
              startColumn: position.column,
              endColumn: position.column
            }
          }));
          
          return { suggestions };
        }
      });
    }
  }, []);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    
    // Configure editor
    editor.updateOptions({
      minimap: { enabled: editorMinimap },
      lineNumbers: editorLineNumbers ? 'on' : 'off',
      fontSize: editorFontSize,
      fontFamily: 'Monaco, Consolas, "Courier New", monospace',
      wordWrap: 'on',
      automaticLayout: true,
      scrollBeyondLastLine: false,
      smoothScrolling: true,
      cursorBlinking: 'blink',
      cursorSmoothCaretAnimation: true,
      renderWhitespace: 'selection',
      renderControlCharacters: true,
      folding: true,
      foldingStrategy: 'indentation',
      showFoldingControls: 'always',
      bracketPairColorization: { enabled: true },
      guides: {
        bracketPairs: true,
        indentation: true
      }
    });

    // Add keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      onSave?.();
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF, () => {
      editor.getAction('actions.find').run();
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF, () => {
      editor.getAction('editor.action.startFindReplaceAction').run();
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyK, () => {
      editor.getAction('editor.action.formatDocument').run();
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
  };

  const handleFormat = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument').run();
    }
    onFormat?.();
  };

  const handleUndo = () => {
    if (editorRef.current) {
      editorRef.current.trigger('keyboard', 'undo', null);
    }
  };

  const handleRedo = () => {
    if (editorRef.current) {
      editorRef.current.trigger('keyboard', 'redo', null);
    }
  };

  const handleFind = () => {
    if (editorRef.current) {
      editorRef.current.getAction('actions.find').run();
    }
  };

  const handleReplace = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.startFindReplaceAction').run();
    }
  };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const toolbarItems = [
    {
      key: 'play',
      icon: isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />,
      tooltip: isPlaying ? 'Pause' : 'Play',
      onClick: isPlaying ? onPause : onPlay,
      type: isPlaying ? 'primary' : 'default'
    },
    {
      key: 'stop',
      icon: <StopOutlined />,
      tooltip: 'Stop',
      onClick: onStop
    },
    { type: 'divider' },
    {
      key: 'undo',
      icon: <UndoOutlined />,
      tooltip: 'Undo (Ctrl+Z)',
      onClick: handleUndo
    },
    {
      key: 'redo',
      icon: <RedoOutlined />,
      tooltip: 'Redo (Ctrl+Y)',
      onClick: handleRedo
    },
    { type: 'divider' },
    {
      key: 'format',
      icon: <FormatPainterOutlined />,
      tooltip: 'Format Code (Ctrl+K)',
      onClick: handleFormat
    },
    {
      key: 'copy',
      icon: <CopyOutlined />,
      tooltip: 'Copy (Ctrl+C)',
      onClick: handleCopy
    },
    {
      key: 'save',
      icon: <SaveOutlined />,
      tooltip: 'Save (Ctrl+S)',
      onClick: onSave
    },
    { type: 'divider' },
    {
      key: 'find',
      icon: <SearchOutlined />,
      tooltip: 'Find (Ctrl+F)',
      onClick: handleFind
    },
    {
      key: 'replace',
      icon: <SwapOutlined />,
      tooltip: 'Find & Replace (Ctrl+Shift+F)',
      onClick: handleReplace
    },
    { type: 'divider' },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      tooltip: 'Settings',
      onClick: () => setShowSettings(true)
    },
    {
      key: 'fullscreen',
      icon: isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />,
      tooltip: isFullscreen ? 'Exit Fullscreen' : 'Fullscreen (F11)',
      onClick: handleFullscreen
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`code-editor-container ${isFullscreen ? 'fullscreen' : ''}`}
      style={{
        position: isFullscreen ? 'fixed' : 'relative',
        top: isFullscreen ? 0 : 'auto',
        left: isFullscreen ? 0 : 'auto',
        right: isFullscreen ? 0 : 'auto',
        bottom: isFullscreen ? 0 : 'auto',
        zIndex: isFullscreen ? 9999 : 'auto',
        background: '#1a1a1a',
        height: isFullscreen ? '100vh' : height
      }}
    >
      <Card
        size="small"
        style={{
          height: '100%',
          background: '#1a1a1a',
          border: '1px solid #333'
        }}
        bodyStyle={{ padding: 0, height: '100%' }}
        title={
          showToolbar ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Space>
                <Title level={5} style={{ margin: 0, color: '#ffffff' }}>
                  ChordCraft Code Editor
                </Title>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {value.split('\n').length} lines
                </Text>
              </Space>
              <Space>
                {toolbarItems.map((item, index) => {
                  if (item.type === 'divider') {
                    return <Divider key={index} type="vertical" style={{ height: 20, margin: '0 4px' }} />;
                  }
                  return (
                    <Tooltip key={item.key} title={item.tooltip}>
                      <Button
                        type={item.type || 'text'}
                        size="small"
                        icon={item.icon}
                        onClick={item.onClick}
                        style={{ color: '#ffffff' }}
                      />
                    </Tooltip>
                  );
                })}
              </Space>
            </div>
          ) : null
        }
      >
        <div style={{ height: showToolbar ? 'calc(100% - 60px)' : '100%' }}>
          <Editor
            height="100%"
            language="chordcraft"
            value={value}
            onChange={onChange}
            onMount={handleEditorDidMount}
            theme={editorTheme}
            options={{
              minimap: { enabled: editorMinimap },
              lineNumbers: editorLineNumbers ? 'on' : 'off',
              fontSize: editorFontSize,
              fontFamily: 'Monaco, Consolas, "Courier New", monospace',
              wordWrap: 'on',
              automaticLayout: true,
              scrollBeyondLastLine: false,
              smoothScrolling: true,
              cursorBlinking: 'blink',
              cursorSmoothCaretAnimation: true,
              renderWhitespace: 'selection',
              renderControlCharacters: true,
              folding: true,
              foldingStrategy: 'indentation',
              showFoldingControls: 'always',
              bracketPairColorization: { enabled: true },
              guides: {
                bracketPairs: true,
                indentation: true
              },
              readOnly,
              placeholder: {
                value: placeholder,
                showLine: true
              }
            }}
          />
        </div>
      </Card>

      {/* Settings Modal */}
      <Modal
        title="Editor Settings"
        open={showSettings}
        onCancel={() => setShowSettings(false)}
        onOk={() => setShowSettings(false)}
        width={400}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text strong>Theme:</Text>
            <Select
              value={editorTheme}
              onChange={setEditorTheme}
              style={{ width: '100%', marginTop: 8 }}
              options={[
                { label: 'Dark', value: 'vs-dark' },
                { label: 'Light', value: 'vs-light' },
                { label: 'High Contrast Dark', value: 'hc-black' }
              ]}
            />
          </div>
          
          <div>
            <Text strong>Font Size:</Text>
            <Select
              value={editorFontSize}
              onChange={setEditorFontSize}
              style={{ width: '100%', marginTop: 8 }}
              options={[
                { label: '12px', value: 12 },
                { label: '14px', value: 14 },
                { label: '16px', value: 16 },
                { label: '18px', value: 18 },
                { label: '20px', value: 20 }
              ]}
            />
          </div>
          
          <div>
            <Text strong>Show Minimap:</Text>
            <Switch
              checked={editorMinimap}
              onChange={setEditorMinimap}
              style={{ marginLeft: 8 }}
            />
          </div>
          
          <div>
            <Text strong>Show Line Numbers:</Text>
            <Switch
              checked={editorLineNumbers}
              onChange={setEditorLineNumbers}
              style={{ marginLeft: 8 }}
            />
          </div>
        </Space>
      </Modal>

      <style jsx>{`
        .code-editor-container.fullscreen {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          z-index: 9999 !important;
        }
        
        .code-editor-container .monaco-editor {
          border-radius: 0 !important;
        }
        
        .code-editor-container .monaco-editor .margin {
          background-color: #1a1a1a !important;
        }
        
        .code-editor-container .monaco-editor .monaco-editor-background {
          background-color: #0a0a0a !important;
        }
      `}</style>
    </motion.div>
  );
}
