-- ROVER Platform - Social Features (Tags, Mentions, Follows)
-- Run this AFTER 002_create_posts_comments.sql

-- Tags table
CREATE TABLE IF NOT EXISTS public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  posts_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Post-Tags junction table
CREATE TABLE IF NOT EXISTS public.post_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, tag_id)
);

-- Mentions table (tracks @mentions in posts)
CREATE TABLE IF NOT EXISTS public.mentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  mentioned_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, mentioned_user_id)
);

-- Follows table (user connections)
CREATE TABLE IF NOT EXISTS public.follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Enable RLS
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- Tags RLS (everyone can read, only system can insert via triggers)
CREATE POLICY "tags_select_all" ON public.tags FOR SELECT USING (true);
CREATE POLICY "tags_insert_authenticated" ON public.tags FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Post-Tags RLS
CREATE POLICY "post_tags_select_all" ON public.post_tags FOR SELECT USING (true);
CREATE POLICY "post_tags_insert_authenticated" ON public.post_tags FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "post_tags_delete_own" ON public.post_tags FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.posts WHERE posts.id = post_tags.post_id AND posts.user_id = auth.uid())
);

-- Mentions RLS
CREATE POLICY "mentions_select_all" ON public.mentions FOR SELECT USING (true);
CREATE POLICY "mentions_insert_authenticated" ON public.mentions FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "mentions_delete_own" ON public.mentions FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.posts WHERE posts.id = mentions.post_id AND posts.user_id = auth.uid())
);

-- Follows RLS
CREATE POLICY "follows_select_all" ON public.follows FOR SELECT USING (true);
CREATE POLICY "follows_insert_own" ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "follows_delete_own" ON public.follows FOR DELETE USING (auth.uid() = follower_id);

-- Add follower counts to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0;

-- Function to update tag counts
CREATE OR REPLACE FUNCTION update_tag_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.tags SET posts_count = posts_count + 1 WHERE id = NEW.tag_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.tags SET posts_count = posts_count - 1 WHERE id = OLD.tag_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update follower counts
CREATE OR REPLACE FUNCTION update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles SET followers_count = followers_count + 1 WHERE id = NEW.following_id;
    UPDATE public.profiles SET following_count = following_count + 1 WHERE id = NEW.follower_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles SET followers_count = followers_count - 1 WHERE id = OLD.following_id;
    UPDATE public.profiles SET following_count = following_count - 1 WHERE id = OLD.follower_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers
DROP TRIGGER IF EXISTS on_post_tag_change ON public.post_tags;
CREATE TRIGGER on_post_tag_change
  AFTER INSERT OR DELETE ON public.post_tags
  FOR EACH ROW EXECUTE FUNCTION update_tag_count();

DROP TRIGGER IF EXISTS on_follow_change ON public.follows;
CREATE TRIGGER on_follow_change
  AFTER INSERT OR DELETE ON public.follows
  FOR EACH ROW EXECUTE FUNCTION update_follow_counts();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_post_tags_post_id ON public.post_tags(post_id);
CREATE INDEX IF NOT EXISTS idx_post_tags_tag_id ON public.post_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_mentions_post_id ON public.mentions(post_id);
CREATE INDEX IF NOT EXISTS idx_mentions_user_id ON public.mentions(mentioned_user_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON public.follows(following_id);
CREATE INDEX IF NOT EXISTS idx_tags_name ON public.tags(name);
