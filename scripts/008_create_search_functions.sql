-- Search functionality for ROVER Platform
-- Add these to your Supabase database

-- Create search vector columns for full-text search
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS search_vector tsvector;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS search_vector tsvector;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS search_vector tsvector;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Update search vectors with content
CREATE OR REPLACE FUNCTION update_profiles_search_vector()
RETURNS trigger AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', 
    COALESCE(NEW.full_name, '') || ' ' ||
    COALESCE(NEW.title, '') || ' ' ||
    COALESCE(NEW.department, '') || ' ' ||
    COALESCE(NEW.email, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_posts_search_vector()
RETURNS trigger AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', COALESCE(NEW.content, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_projects_search_vector()
RETURNS trigger AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', 
    COALESCE(NEW.name, '') || ' ' ||
    COALESCE(NEW.description, '') || ' ' ||
    COALESCE(NEW.department, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_messages_search_vector()
RETURNS trigger AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', COALESCE(NEW.content, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update search vectors
DROP TRIGGER IF EXISTS profiles_search_vector_trigger ON profiles;
CREATE TRIGGER profiles_search_vector_trigger
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_profiles_search_vector();

DROP TRIGGER IF EXISTS posts_search_vector_trigger ON posts;
CREATE TRIGGER posts_search_vector_trigger
  BEFORE INSERT OR UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_posts_search_vector();

DROP TRIGGER IF EXISTS projects_search_vector_trigger ON projects;
CREATE TRIGGER projects_search_vector_trigger
  BEFORE INSERT OR UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_projects_search_vector();

DROP TRIGGER IF EXISTS messages_search_vector_trigger ON messages;
CREATE TRIGGER messages_search_vector_trigger
  BEFORE INSERT OR UPDATE ON messages
  FOR EACH ROW EXECUTE FUNCTION update_messages_search_vector();

-- Create indexes for search performance
CREATE INDEX IF NOT EXISTS profiles_search_idx ON profiles USING gin(search_vector);
CREATE INDEX IF NOT EXISTS posts_search_idx ON posts USING gin(search_vector);
CREATE INDEX IF NOT EXISTS projects_search_idx ON projects USING gin(search_vector);
CREATE INDEX IF NOT EXISTS messages_search_idx ON messages USING gin(search_vector);

-- Trigram indexes for fuzzy search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS profiles_name_trgm_idx ON profiles USING gin(full_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS posts_content_trgm_idx ON posts USING gin(content gin_trgm_ops);
CREATE INDEX IF NOT EXISTS projects_name_trgm_idx ON projects USING gin(name gin_trgm_ops);

-- Search function for people
CREATE OR REPLACE FUNCTION search_profiles(
  search_term text,
  limit_count integer DEFAULT 20
)
RETURNS TABLE(
  id uuid,
  full_name text,
  title text,
  department text,
  avatar_url text,
  followers_count integer,
  similarity real
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.full_name,
    p.title,
    p.department,
    p.avatar_url,
    p.followers_count,
    similarity(p.search_vector, plainto_tsquery('english', search_term)) as similarity
  FROM profiles p
  WHERE 
    p.search_vector @@ plainto_tsquery('english', search_term)
    OR p.full_name ILIKE '%' || search_term || '%'
    OR p.title ILIKE '%' || search_term || '%'
    OR p.department ILIKE '%' || search_term || '%'
  ORDER BY similarity DESC, p.followers_count DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Search function for posts
CREATE OR REPLACE FUNCTION search_posts(
  search_term text,
  user_id_filter uuid DEFAULT NULL,
  limit_count integer DEFAULT 20
)
RETURNS TABLE(
  id uuid,
  content text,
  content_type text,
  created_at timestamp with time zone,
  user_id uuid,
  profiles jsonb,
  similarity real
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.content,
    p.content_type,
    p.created_at,
    p.user_id,
    jsonb_build_object(
      'id', pr.id,
      'full_name', pr.full_name,
      'title', pr.title,
      'avatar_url', pr.avatar_url
    ) as profiles,
    similarity(p.search_vector, plainto_tsquery('english', search_term)) as similarity
  FROM posts p
  LEFT JOIN profiles pr ON p.user_id = pr.id
  WHERE 
    (p.search_vector @@ plainto_tsquery('english', search_term)
     OR p.content ILIKE '%' || search_term || '%')
    AND (user_id_filter IS NULL OR p.user_id = user_id_filter)
  ORDER BY similarity DESC, p.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Search function for projects
CREATE OR REPLACE FUNCTION search_projects(
  search_term text,
  department_filter text DEFAULT NULL,
  limit_count integer DEFAULT 20
)
RETURNS TABLE(
  id uuid,
  name text,
  description text,
  department text,
  status text,
  progress_percentage integer,
  created_at timestamp with time zone,
  similarity real
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.description,
    p.department,
    p.status,
    p.progress_percentage,
    p.created_at,
    similarity(p.search_vector, plainto_tsquery('english', search_term)) as similarity
  FROM projects p
  WHERE 
    p.search_vector @@ plainto_tsquery('english', search_term)
    OR p.name ILIKE '%' || search_term || '%'
    OR p.description ILIKE '%' || search_term || '%'
    OR p.department ILIKE '%' || search_term || '%'
    AND (department_filter IS NULL OR p.department ILIKE '%' || department_filter || '%')
  ORDER BY similarity DESC, p.progress_percentage DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Search function for tags
CREATE OR REPLACE FUNCTION search_tags(
  search_term text,
  limit_count integer DEFAULT 20
)
RETURNS TABLE(
  id uuid,
  name text,
  posts_count integer,
  similarity real
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.name,
    t.posts_count,
    similarity(t.name, search_term) as similarity
  FROM tags t
  WHERE t.name ILIKE '%' || search_term || '%'
  ORDER BY similarity DESC, t.posts_count DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Global search function
CREATE OR REPLACE FUNCTION global_search(
  search_term text,
  user_id uuid,
  limit_count integer DEFAULT 20
)
RETURNS TABLE(
  entity_type text,
  entity_id uuid,
  title text,
  description text,
  metadata jsonb,
  similarity real
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    'profile' as entity_type,
    p.id as entity_id,
    p.full_name as title,
    COALESCE(p.title || ' - ' || p.department, '') as description,
    jsonb_build_object('avatar_url', p.avatar_url, 'followers_count', p.followers_count) as metadata,
    similarity(p.search_vector, plainto_tsquery('english', search_term)) as similarity
  FROM profiles p
  WHERE p.search_vector @@ plainto_tsquery('english', search_term)
    AND p.id != user_id
  
  UNION ALL
  
  SELECT 
    'post' as entity_type,
    p.id as entity_id,
    left(p.content, 50) || '...' as title,
    p.content as description,
    jsonb_build_object('content_type', p.content_type, 'created_at', p.created_at) as metadata,
    similarity(p.search_vector, plainto_tsquery('english', search_term)) as similarity
  FROM posts p
  WHERE p.search_vector @@ plainto_tsquery('english', search_term)
  
  UNION ALL
  
  SELECT 
    'project' as entity_type,
    p.id as entity_id,
    p.name as title,
    COALESCE(p.description, '') as description,
    jsonb_build_object('department', p.department, 'status', p.status, 'progress_percentage', p.progress_percentage) as metadata,
    similarity(p.search_vector, plainto_tsquery('english', search_term)) as similarity
  FROM projects p
  WHERE p.search_vector @@ plainto_tsquery('english', search_term)
  
  ORDER BY similarity DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;