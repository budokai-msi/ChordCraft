-- ChordCraft Database Schema
-- This file contains all the SQL commands needed to set up the ChordCraft database

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE,
    display_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table
CREATE TABLE IF NOT EXISTS public.chordcraft_projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    chordcraft_code TEXT DEFAULT '// Your music code will appear here\n// Try: PLAY C4 FOR 1s AT 0s',
    music_analysis JSONB,
    settings JSONB DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    is_public BOOLEAN DEFAULT FALSE,
    is_template BOOLEAN DEFAULT FALSE,
    template_category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_played_at TIMESTAMP WITH TIME ZONE
);

-- Tracks table
CREATE TABLE IF NOT EXISTS public.project_tracks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES public.chordcraft_projects(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'synthesizer', -- synthesizer, drum, sample, etc.
    color TEXT DEFAULT '#3b82f6',
    volume REAL DEFAULT 0.8,
    muted BOOLEAN DEFAULT FALSE,
    solo BOOLEAN DEFAULT FALSE,
    settings JSONB DEFAULT '{}',
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notes table
CREATE TABLE IF NOT EXISTS public.project_notes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES public.chordcraft_projects(id) ON DELETE CASCADE NOT NULL,
    track_id UUID REFERENCES public.project_tracks(id) ON DELETE CASCADE,
    pitch TEXT NOT NULL,
    start_time REAL NOT NULL,
    duration REAL NOT NULL,
    velocity REAL DEFAULT 0.8,
    properties JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project versions table (for version control)
CREATE TABLE IF NOT EXISTS public.project_versions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES public.chordcraft_projects(id) ON DELETE CASCADE NOT NULL,
    version_number INTEGER NOT NULL,
    chordcraft_code TEXT NOT NULL,
    music_analysis JSONB,
    change_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Collaborations table
CREATE TABLE IF NOT EXISTS public.project_collaborations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES public.chordcraft_projects(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL DEFAULT 'viewer', -- owner, editor, viewer
    invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accepted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(project_id, user_id)
);

-- AI Companion conversations
CREATE TABLE IF NOT EXISTS public.ai_conversations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    project_id UUID REFERENCES public.chordcraft_projects(id) ON DELETE CASCADE,
    title TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI messages
CREATE TABLE IF NOT EXISTS public.ai_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    conversation_id UUID REFERENCES public.ai_conversations(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL, -- user, assistant, system
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audio files table
CREATE TABLE IF NOT EXISTS public.audio_files (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    project_id UUID REFERENCES public.chordcraft_projects(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    duration REAL,
    sample_rate INTEGER,
    channels INTEGER,
    analysis_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Templates table
CREATE TABLE IF NOT EXISTS public.project_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL, -- electronic, jazz, classical, etc.
    chordcraft_code TEXT NOT NULL,
    preview_image_url TEXT,
    tags TEXT[] DEFAULT '{}',
    is_official BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.chordcraft_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_public ON public.chordcraft_projects(is_public) WHERE is_public = TRUE;
CREATE INDEX IF NOT EXISTS idx_projects_templates ON public.chordcraft_projects(is_template) WHERE is_template = TRUE;
CREATE INDEX IF NOT EXISTS idx_tracks_project_id ON public.project_tracks(project_id);
CREATE INDEX IF NOT EXISTS idx_notes_project_id ON public.project_notes(project_id);
CREATE INDEX IF NOT EXISTS idx_notes_track_id ON public.project_notes(track_id);
CREATE INDEX IF NOT EXISTS idx_collaborations_project_id ON public.project_collaborations(project_id);
CREATE INDEX IF NOT EXISTS idx_collaborations_user_id ON public.project_collaborations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON public.ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation_id ON public.ai_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_audio_files_user_id ON public.audio_files(user_id);
CREATE INDEX IF NOT EXISTS idx_audio_files_project_id ON public.audio_files(project_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.chordcraft_projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tracks_updated_at BEFORE UPDATE ON public.project_tracks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON public.project_notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_conversations_updated_at BEFORE UPDATE ON public.ai_conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chordcraft_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_collaborations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audio_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_templates ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can view their own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Projects policies
CREATE POLICY "Users can view their own projects" ON public.chordcraft_projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view public projects" ON public.chordcraft_projects FOR SELECT USING (is_public = TRUE);
CREATE POLICY "Users can view projects they collaborate on" ON public.chordcraft_projects FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.project_collaborations 
        WHERE project_id = chordcraft_projects.id AND user_id = auth.uid()
    )
);
CREATE POLICY "Users can create projects" ON public.chordcraft_projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own projects" ON public.chordcraft_projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own projects" ON public.chordcraft_projects FOR DELETE USING (auth.uid() = user_id);

-- Tracks policies
CREATE POLICY "Users can manage tracks for their projects" ON public.project_tracks FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.chordcraft_projects 
        WHERE id = project_tracks.project_id AND user_id = auth.uid()
    )
);

-- Notes policies
CREATE POLICY "Users can manage notes for their projects" ON public.project_notes FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.chordcraft_projects 
        WHERE id = project_notes.project_id AND user_id = auth.uid()
    )
);

-- Collaborations policies
CREATE POLICY "Users can view collaborations for their projects" ON public.project_collaborations FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.chordcraft_projects 
        WHERE id = project_collaborations.project_id AND user_id = auth.uid()
    )
);
CREATE POLICY "Project owners can manage collaborations" ON public.project_collaborations FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.chordcraft_projects 
        WHERE id = project_collaborations.project_id AND user_id = auth.uid()
    )
);

-- AI conversations policies
CREATE POLICY "Users can manage their own conversations" ON public.ai_conversations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own messages" ON public.ai_messages FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.ai_conversations 
        WHERE id = ai_messages.conversation_id AND user_id = auth.uid()
    )
);

-- Audio files policies
CREATE POLICY "Users can manage their own audio files" ON public.audio_files FOR ALL USING (auth.uid() = user_id);

-- Templates policies
CREATE POLICY "Anyone can view public templates" ON public.project_templates FOR SELECT USING (is_official = TRUE);
CREATE POLICY "Users can view their own templates" ON public.project_templates FOR SELECT USING (auth.uid() = created_by);

-- Insert some default templates
INSERT INTO public.project_templates (name, description, category, chordcraft_code, is_official) VALUES
('Basic Beat', 'A simple 4/4 drum pattern', 'electronic', '// Basic 4/4 Beat\nPLAY KICK FOR 0.5s AT 0s\nPLAY KICK FOR 0.5s AT 1s\nPLAY KICK FOR 0.5s AT 2s\nPLAY KICK FOR 0.5s AT 3s\nPLAY SNARE FOR 0.3s AT 0.5s\nPLAY SNARE FOR 0.3s AT 2.5s', TRUE),
('Jazz Progression', 'A classic ii-V-I jazz chord progression', 'jazz', '// Jazz ii-V-I Progression\nPLAY Dm7 FOR 2s AT 0s\nPLAY G7 FOR 2s AT 2s\nPLAY Cmaj7 FOR 2s AT 4s', TRUE),
('Ambient Pad', 'A peaceful ambient soundscape', 'ambient', '// Ambient Pad\nPLAY C4 FOR 4s AT 0s\nPLAY E4 FOR 4s AT 0.5s\nPLAY G4 FOR 4s AT 1s\nPLAY B4 FOR 4s AT 1.5s', TRUE),
('Trap Beat', 'A modern trap-style beat', 'hip-hop', '// Trap Beat\nPLAY KICK FOR 0.3s AT 0s\nPLAY KICK FOR 0.3s AT 0.75s\nPLAY KICK FOR 0.3s AT 1.5s\nPLAY KICK FOR 0.3s AT 2.25s\nPLAY SNARE FOR 0.2s AT 0.5s\nPLAY SNARE FOR 0.2s AT 1.75s\nPLAY HIHAT FOR 0.1s AT 0.25s\nPLAY HIHAT FOR 0.1s AT 0.5s\nPLAY HIHAT FOR 0.1s AT 0.75s\nPLAY HIHAT FOR 0.1s AT 1s\nPLAY HIHAT FOR 0.1s AT 1.25s\nPLAY HIHAT FOR 0.1s AT 1.5s\nPLAY HIHAT FOR 0.1s AT 1.75s\nPLAY HIHAT FOR 0.1s AT 2s', TRUE);
