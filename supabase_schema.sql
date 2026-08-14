-- Supabase SQL Schema for Wedding Song Collector & Local Downloader Engine

-- Create song_submissions table
CREATE TABLE IF NOT EXISTS public.song_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_name TEXT NOT NULL,
    event_date DATE NOT NULL,
    songs JSONB NOT NULL, -- Format: [{"ritualName": "Bride Entry 👰", "url": "https://...", "notes": ""}]
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'New', 'Downloading', 'Completed', 'Error')),
    is_downloaded BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for fast queries
CREATE INDEX IF NOT EXISTS idx_song_submissions_status ON public.song_submissions(status);
CREATE INDEX IF NOT EXISTS idx_song_submissions_created_at ON public.song_submissions(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.song_submissions ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for client submission status and admin dashboard)
CREATE POLICY "Allow public select on song_submissions"
    ON public.song_submissions
    FOR SELECT
    USING (true);

-- Allow public insert (clients submitting wedding songs)
CREATE POLICY "Allow public insert on song_submissions"
    ON public.song_submissions
    FOR INSERT
    WITH CHECK (true);

-- Allow public update (admin dashboard & local agent updating status)
CREATE POLICY "Allow public update on song_submissions"
    ON public.song_submissions
    FOR UPDATE
    USING (true);

-- Allow public delete (admin cleanup)
CREATE POLICY "Allow public delete on song_submissions"
    ON public.song_submissions
    FOR DELETE
    USING (true);

-- Auto-update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS set_updated_at ON public.song_submissions;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.song_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
