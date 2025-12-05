-- Create notifications table for real-time updates and alerts
-- ROVER Platform - Phase 1 Implementation

CREATE TABLE notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    actor_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    type varchar(50) NOT NULL CHECK (type IN (
        'like', 'comment', 'mention', 'follow', 'message', 'project_update', 'milestone_complete'
    )),
    title varchar(255) NOT NULL,
    message text NOT NULL,
    entity_type varchar(50),
    entity_id uuid,
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for performance
CREATE INDEX idx_notifications_user_id_created_at ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_user_id_is_read ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_actor_id ON notifications(actor_id);

-- Updated trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_notifications_updated_at 
    BEFORE UPDATE ON notifications 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own notifications" 
    ON notifications FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
    ON notifications FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" 
    ON notifications FOR INSERT 
    WITH CHECK (true);

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
    p_user_id uuid,
    p_actor_id uuid,
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