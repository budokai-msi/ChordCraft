# ChordCraft Database Setup

This directory contains the database schema and setup scripts for ChordCraft.

## Quick Setup

1. **Set up your Supabase project:**
   - Go to [Supabase](https://supabase.com)
   - Create a new project
   - Get your project URL and anon key
   - Update `frontend/src/supabaseClient.js` with your credentials

2. **Set up the database schema:**
   ```bash
   # From the project root
   cd frontend
   npm run setup-db
   ```

3. **Verify the setup:**
   - Check your Supabase dashboard
   - Verify all tables were created
   - Test the application

## Manual Setup

If the automated setup doesn't work, you can manually run the SQL:

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `schema.sql`
4. Run the SQL script

## Database Schema

The database includes the following tables:

### Core Tables
- `user_profiles` - Extended user information
- `chordcraft_projects` - Music projects
- `project_tracks` - Audio tracks within projects
- `project_notes` - Musical notes/events
- `project_versions` - Version control for projects

### Collaboration
- `project_collaborations` - Project sharing and permissions

### AI Features
- `ai_conversations` - AI chat conversations
- `ai_messages` - Individual AI messages

### Media
- `audio_files` - Uploaded audio files
- `project_templates` - Project templates

## Environment Variables

Make sure you have these environment variables set:

```bash
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # For database setup only
```

## Troubleshooting

### Common Issues

1. **Permission denied errors:**
   - Make sure you're using the service role key for setup
   - Check that RLS policies are correctly configured

2. **Tables not created:**
   - Check the Supabase logs for SQL errors
   - Verify your service role key has the correct permissions

3. **RLS policy issues:**
   - Ensure all policies are properly defined
   - Test with different user roles

### Getting Help

If you encounter issues:
1. Check the Supabase dashboard logs
2. Verify your environment variables
3. Test individual SQL statements
4. Check the application console for errors

## Security Notes

- The database uses Row Level Security (RLS)
- Users can only access their own data
- Public projects are readable by all users
- Service role key should only be used for setup, not in production
