"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, Filter, Play, Trash2, Download, Music, Clock, FileAudio } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useChordCraftStore } from '../store/useChordCraftStore';
import { HapticButton } from '../components/HapticButton';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';

interface LibraryItem {
  id: string;
  name: string;
  size: number;
  duration: number;
  bpm: number;
  key: string;
  strategy: 'lossless' | 'neural' | 'synthetic';
  createdAt: Date;
  code: string;
}

export default function LibraryPage() {
  const navigate = useNavigate();
  const { setCode, setSong, setPlaybackStrategy } = useChordCraftStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStrategy, setFilterStrategy] = useState<'all' | 'lossless' | 'neural' | 'synthetic'>('all');
  
  // Mock data - in real app, this would come from Supabase
  const [libraryItems] = useState<LibraryItem[]>([
    {
      id: '1',
      name: 'Sample Track 1',
      size: 3.2,
      duration: 180,
      bpm: 120,
      key: 'C Major',
      strategy: 'lossless',
      createdAt: new Date('2024-01-15'),
      code: 'Song { meta: { bpm: 120, key: "C Major", time: "4/4" } }'
    },
    {
      id: '2',
      name: 'Jazz Improv',
      size: 2.8,
      duration: 240,
      bpm: 140,
      key: 'F# Minor',
      strategy: 'neural',
      createdAt: new Date('2024-01-14'),
      code: 'Song { meta: { bpm: 140, key: "F# Minor", time: "4/4" } }'
    },
    {
      id: '3',
      name: 'Ambient Soundscape',
      size: 4.1,
      duration: 300,
      bpm: 80,
      key: 'A Major',
      strategy: 'synthetic',
      createdAt: new Date('2024-01-13'),
      code: 'Song { meta: { bpm: 80, key: "A Major", time: "4/4" } }'
    }
  ]);

  const filteredItems = libraryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStrategy === 'all' || item.strategy === filterStrategy;
    return matchesSearch && matchesFilter;
  });

  const handlePlayItem = async (item: LibraryItem) => {
    // In a real app, you'd load the full song data from storage
    // For now, we'll just set the code and navigate
    setCode(item.code);
    // setSong(parsedSong); // Would parse the code here
    setPlaybackStrategy(item.strategy);
    navigate('/studio');
  };

  const handleDeleteItem = (id: string) => {
    // In a real app, you'd delete from Supabase
    console.log('Delete item:', id);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (mb: number) => {
    return `${mb.toFixed(1)} MB`;
  };

  const getStrategyColor = (strategy: string) => {
    switch (strategy) {
      case 'lossless': return 'bg-green-500';
      case 'neural': return 'bg-blue-500';
      case 'synthetic': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStrategyLabel = (strategy: string) => {
    switch (strategy) {
      case 'lossless': return 'Lossless';
      case 'neural': return 'Neural';
      case 'synthetic': return 'Synthetic';
      default: return 'Unknown';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <HapticButton
                onClick={() => navigate('/')}
                variant="outline"
                hapticType="light"
                className="w-10 h-10 rounded-full"
              >
                <ArrowLeft className="w-4 h-4" />
              </HapticButton>
              <h1 className="text-2xl font-bold text-white">Library</h1>
              <Badge variant="outline">{libraryItems.length} tracks</Badge>
            </div>
            
            <div className="flex items-center space-x-2">
              <HapticButton
                onClick={() => navigate('/settings')}
                variant="outline"
                hapticType="light"
              >
                <Filter className="w-4 h-4 mr-2" />
                Settings
              </HapticButton>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search tracks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  variant={filterStrategy === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilterStrategy('all')}
                  className="text-sm"
                >
                  All
                </Button>
                <Button
                  variant={filterStrategy === 'lossless' ? 'default' : 'outline'}
                  onClick={() => setFilterStrategy('lossless')}
                  className="text-sm"
                >
                  Lossless
                </Button>
                <Button
                  variant={filterStrategy === 'neural' ? 'default' : 'outline'}
                  onClick={() => setFilterStrategy('neural')}
                  className="text-sm"
                >
                  Neural
                </Button>
                <Button
                  variant={filterStrategy === 'synthetic' ? 'default' : 'outline'}
                  onClick={() => setFilterStrategy('synthetic')}
                  className="text-sm"
                >
                  Synthetic
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Library Grid */}
        {filteredItems.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileAudio className="w-16 h-16 mx-auto text-slate-400 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No tracks found</h3>
              <p className="text-slate-400 mb-4">
                {searchQuery ? 'Try adjusting your search terms' : 'Upload your first audio file to get started'}
              </p>
              <HapticButton
                onClick={() => navigate('/')}
                hapticType="medium"
              >
                <Music className="w-4 h-4 mr-2" />
                Upload Audio
              </HapticButton>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">{item.name}</CardTitle>
                        <p className="text-sm text-slate-400">
                          {formatFileSize(item.size)} • {formatDuration(item.duration)}
                        </p>
                      </div>
                      <Badge className={getStrategyColor(item.strategy)}>
                        {getStrategyLabel(item.strategy)}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-slate-400">BPM</div>
                          <div className="font-medium">{item.bpm}</div>
                        </div>
                        <div>
                          <div className="text-slate-400">Key</div>
                          <div className="font-medium">{item.key}</div>
                        </div>
                      </div>
                      
                      <div className="text-xs text-slate-400">
                        Created {item.createdAt.toLocaleDateString()}
                      </div>
                      
                      <div className="flex space-x-2">
                        <HapticButton
                          onClick={() => handlePlayItem(item)}
                          hapticType="medium"
                          className="flex-1"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Play
                        </HapticButton>
                        
                        <HapticButton
                          onClick={() => handleDeleteItem(item.id)}
                          variant="outline"
                          hapticType="light"
                          className="px-3"
                        >
                          <Trash2 className="w-4 h-4" />
                        </HapticButton>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
