-- Database utility functions for ROVER Platform
-- Add these to your Supabase database

-- Function to increment tag posts_count
CREATE OR REPLACE FUNCTION increment_tag_posts_count(tag_id uuid)
RETURNS void AS $$
BEGIN
    UPDATE tags 
    SET posts_count = posts_count + 1 
    WHERE id = tag_id;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement tag posts_count
CREATE OR REPLACE FUNCTION decrement_tag_posts_count(tag_id uuid)
RETURNS void AS $$
BEGIN
    UPDATE tags 
    SET posts_count = GREATEST(0, posts_count - 1) 
    WHERE id = tag_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get trending tags
CREATE OR REPLACE FUNCTION get_trending_tags(limit_count integer DEFAULT 10)
RETURNS TABLE(
    id uuid,
    name varchar,
    posts_count integer,
    created_at timestamp with time zone
) AS $$
BEGIN
    RETURN QUERY
    SELECT t.id, t.name, t.posts_count, t.created_at
    FROM tags t
    WHERE t.posts_count > 0
    ORDER BY t.posts_count DESC, t.created_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get suggested connections for a user
CREATE OR REPLACE FUNCTION get_suggested_connections(user_id uuid, limit_count integer DEFAULT 5)
RETURNS TABLE(
    id uuid,
    full_name varchar,
    title varchar,
    department varchar,
    avatar_url varchar,
    followers_count integer
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.full_name,
        p.title,
        p.department,
        p.avatar_url,
        p.followers_count
    FROM profiles p
    WHERE p.id != user_id
    AND p.id NOT IN (
        SELECT following_id 
        FROM follows 
        WHERE follower_id = user_id
    )
    AND p.department = (
        SELECT department 
        FROM profiles 
        WHERE id = user_id
    )
    ORDER BY p.followers_count DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to increment follower count
CREATE OR REPLACE FUNCTION increment_follower_count(user_id uuid)
RETURNS void AS $$
BEGIN
    UPDATE profiles 
    SET followers_count = followers_count + 1 
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement follower count
CREATE OR REPLACE FUNCTION decrement_follower_count(user_id uuid)
RETURNS void AS $$
BEGIN
    UPDATE profiles 
    SET followers_count = GREATEST(0, followers_count - 1) 
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to increment following count
CREATE OR REPLACE FUNCTION increment_following_count(user_id uuid)
RETURNS void AS $$
BEGIN
    UPDATE profiles 
    SET following_count = following_count + 1 
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement following count
CREATE OR REPLACE FUNCTION decrement_following_count(user_id uuid)
RETURNS void AS $$
BEGIN
    UPDATE profiles 
    SET following_count = GREATEST(0, following_count - 1) 
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get user's unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count(user_id uuid)
RETURNS integer AS $$
DECLARE
    unread_count integer;
BEGIN
    SELECT COUNT(*) INTO unread_count
    FROM notifications 
    WHERE user_id = p_user_id 
    AND is_read = false;
    
    RETURN unread_count;
END;
$$ LANGUAGE plpgsql;

-- Function to mark all notifications as read for a user
CREATE OR REPLACE FUNCTION mark_all_notifications_read(user_id uuid)
RETURNS integer AS $$
DECLARE
    updated_count integer;
BEGIN
    UPDATE notifications 
    SET is_read = true 
    WHERE user_id = user_id 
    AND is_read = false;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get user notifications with pagination
CREATE OR REPLACE FUNCTION get_user_notifications(
    user_id uuid,
    page_limit integer DEFAULT 20,
    page_offset integer DEFAULT 0
)
RETURNS TABLE(
    id uuid,
    type varchar,
    title varchar,
    message text,
    entity_type varchar,
    entity_id uuid,
    is_read boolean,
    created_at timestamp with time zone,
    actor_id uuid,
    actor_name varchar,
    actor_avatar varchar
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        n.id,
        n.type,
        n.title,
        n.message,
        n.entity_type,
        n.entity_id,
        n.is_read,
        n.created_at,
        n.actor_id,
        COALESCE(p.full_name, 'System') as actor_name,
        p.avatar_url as actor_avatar
    FROM notifications n
    LEFT JOIN profiles p ON n.actor_id = p.id
    WHERE n.user_id = user_id
    ORDER BY n.created_at DESC
    LIMIT page_limit 
    OFFSET page_offset;
END;
$$ LANGUAGE plpgsql;

-- Function to create notification and return ID
CREATE OR REPLACE FUNCTION create_notification_with_id(
    p_user_id uuid,
    p_actor_id uuid DEFAULT NULL,
    p_type varchar(50),
    p_title varchar(255),
    p_message text,
    p_entity_type varchar(50) DEFAULT NULL,
    p_entity_id uuid DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
    notification_id uuid;
BEGIN
    INSERT INTO notifications (
        user_id, actor_id, type, title, message, entity_type, entity_id
    ) VALUES (
        p_user_id, p_actor_id, p_type, p_title, p_message, p_entity_type, p_entity_id
    ) RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get notifications summary for user
CREATE OR REPLACE FUNCTION get_notifications_summary(user_id uuid)
RETURNS TABLE(
    total_count bigint,
    unread_count bigint,
    likes_count bigint,
    comments_count bigint,
    mentions_count bigint,
    follows_count bigint,
    messages_count bigint,
    other_count bigint
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_count,
        COUNT(*) FILTER (WHERE is_read = false) as unread_count,
        COUNT(*) FILTER (WHERE type = 'like' AND is_read = false) as likes_count,
        COUNT(*) FILTER (WHERE type = 'comment' AND is_read = false) as comments_count,
        COUNT(*) FILTER (WHERE type = 'mention' AND is_read = false) as mentions_count,
        COUNT(*) FILTER (WHERE type = 'follow' AND is_read = false) as follows_count,
        COUNT(*) FILTER (WHERE type = 'message' AND is_read = false) as messages_count,
        COUNT(*) FILTER (WHERE type NOT IN ('like', 'comment', 'mention', 'follow', 'message') AND is_read = false) as other_count
    FROM notifications 
    WHERE user_id = user_id;
END;
$$ LANGUAGE plpgsql;
