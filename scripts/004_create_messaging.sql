-- ROVER Platform - Messaging System
-- Run this AFTER 003_create_social_features.sql

-- Conversations table (supports both direct and group chats)
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT, -- NULL for direct messages, set for group chats
  is_group BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversation participants
CREATE TABLE IF NOT EXISTS public.conversation_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_read_at TIMESTAMPTZ DEFAULT NOW(),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(conversation_id, user_id)
);

-- Messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Conversations RLS - only participants can see
CREATE POLICY "conversations_select_participant" ON public.conversations 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversation_participants 
      WHERE conversation_id = conversations.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "conversations_insert_authenticated" ON public.conversations 
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "conversations_update_participant" ON public.conversations 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.conversation_participants 
      WHERE conversation_id = conversations.id AND user_id = auth.uid()
    )
  );

-- Participants RLS
CREATE POLICY "participants_select_own_convos" ON public.conversation_participants 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversation_participants cp 
      WHERE cp.conversation_id = conversation_participants.conversation_id 
      AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "participants_insert_authenticated" ON public.conversation_participants 
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "participants_update_own" ON public.conversation_participants 
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "participants_delete_own" ON public.conversation_participants 
  FOR DELETE USING (user_id = auth.uid());

-- Messages RLS - only conversation participants can see/send
CREATE POLICY "messages_select_participant" ON public.messages 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversation_participants 
      WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "messages_insert_participant" ON public.messages 
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.conversation_participants 
      WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "messages_update_own" ON public.messages 
  FOR UPDATE USING (sender_id = auth.uid());

CREATE POLICY "messages_delete_own" ON public.messages 
  FOR DELETE USING (sender_id = auth.uid());

-- Function to update conversation last_message_at
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.conversations 
  SET last_message_at = NOW(), updated_at = NOW() 
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_new_message ON public.messages;
CREATE TRIGGER on_new_message
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION update_conversation_timestamp();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_conv_participants_user ON public.conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_conv_participants_conv ON public.conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_last_msg ON public.conversations(last_message_at DESC);
