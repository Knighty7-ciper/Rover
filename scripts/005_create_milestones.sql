-- ROVER Platform - Milestones & Project Tracking
-- Run this AFTER 004_create_messaging.sql

-- Projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  department TEXT NOT NULL,
  lead_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'in_progress', 'on_hold', 'completed', 'cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  budget_allocated NUMERIC(15,2) DEFAULT 0,
  budget_spent NUMERIC(15,2) DEFAULT 0,
  start_date DATE,
  target_end_date DATE,
  actual_end_date DATE,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Milestones table
CREATE TABLE IF NOT EXISTS public.milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'delayed')),
  target_date DATE,
  completed_date DATE,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project updates / progress reports
CREATE TABLE IF NOT EXISTS public.project_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  milestone_id UUID REFERENCES public.milestones(id) ON DELETE SET NULL,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  update_type TEXT DEFAULT 'progress' CHECK (update_type IN ('progress', 'blocker', 'achievement', 'budget', 'delay')),
  media_urls TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project team members
CREATE TABLE IF NOT EXISTS public.project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('lead', 'member', 'stakeholder', 'observer')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- Budget transactions
CREATE TABLE IF NOT EXISTS public.budget_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  amount NUMERIC(15,2) NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('allocation', 'expense', 'refund')),
  description TEXT NOT NULL,
  receipt_url TEXT,
  recorded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_transactions ENABLE ROW LEVEL SECURITY;

-- Projects RLS - all authenticated can view, members can update
CREATE POLICY "projects_select_authenticated" ON public.projects 
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "projects_insert_authenticated" ON public.projects 
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "projects_update_member" ON public.projects 
  FOR UPDATE USING (
    lead_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.project_members 
      WHERE project_id = projects.id AND user_id = auth.uid() AND role IN ('lead', 'member')
    )
  );

-- Milestones RLS
CREATE POLICY "milestones_select_authenticated" ON public.milestones 
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "milestones_insert_member" ON public.milestones 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects p
      LEFT JOIN public.project_members pm ON pm.project_id = p.id
      WHERE p.id = milestones.project_id 
      AND (p.lead_id = auth.uid() OR (pm.user_id = auth.uid() AND pm.role IN ('lead', 'member')))
    )
  );

CREATE POLICY "milestones_update_member" ON public.milestones 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      LEFT JOIN public.project_members pm ON pm.project_id = p.id
      WHERE p.id = milestones.project_id 
      AND (p.lead_id = auth.uid() OR (pm.user_id = auth.uid() AND pm.role IN ('lead', 'member')))
    )
  );

-- Project updates RLS
CREATE POLICY "updates_select_authenticated" ON public.project_updates 
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "updates_insert_member" ON public.project_updates 
  FOR INSERT WITH CHECK (
    author_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.projects p
      LEFT JOIN public.project_members pm ON pm.project_id = p.id
      WHERE p.id = project_updates.project_id 
      AND (p.lead_id = auth.uid() OR pm.user_id = auth.uid())
    )
  );

CREATE POLICY "updates_delete_own" ON public.project_updates 
  FOR DELETE USING (author_id = auth.uid());

-- Project members RLS
CREATE POLICY "members_select_authenticated" ON public.project_members 
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "members_insert_lead" ON public.project_members 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE id = project_members.project_id AND lead_id = auth.uid()
    )
  );

CREATE POLICY "members_delete_lead" ON public.project_members 
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE id = project_members.project_id AND lead_id = auth.uid()
    )
  );

-- Budget transactions RLS
CREATE POLICY "budget_select_authenticated" ON public.budget_transactions 
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "budget_insert_member" ON public.budget_transactions 
  FOR INSERT WITH CHECK (
    recorded_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.projects p
      LEFT JOIN public.project_members pm ON pm.project_id = p.id
      WHERE p.id = budget_transactions.project_id 
      AND (p.lead_id = auth.uid() OR (pm.user_id = auth.uid() AND pm.role IN ('lead', 'member')))
    )
  );

-- Function to update project budget_spent
CREATE OR REPLACE FUNCTION update_project_budget()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.projects 
  SET budget_spent = (
    SELECT COALESCE(SUM(
      CASE 
        WHEN transaction_type = 'expense' THEN amount 
        WHEN transaction_type = 'refund' THEN -amount 
        ELSE 0 
      END
    ), 0)
    FROM public.budget_transactions 
    WHERE project_id = NEW.project_id
  ),
  updated_at = NOW()
  WHERE id = NEW.project_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_budget_change ON public.budget_transactions;
CREATE TRIGGER on_budget_change
  AFTER INSERT OR UPDATE OR DELETE ON public.budget_transactions
  FOR EACH ROW EXECUTE FUNCTION update_project_budget();

-- Function to update project progress based on milestones
CREATE OR REPLACE FUNCTION update_project_progress()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.projects 
  SET progress_percentage = (
    SELECT COALESCE(AVG(progress_percentage), 0)::INTEGER
    FROM public.milestones 
    WHERE project_id = COALESCE(NEW.project_id, OLD.project_id)
  ),
  updated_at = NOW()
  WHERE id = COALESCE(NEW.project_id, OLD.project_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_milestone_progress ON public.milestones;
CREATE TRIGGER on_milestone_progress
  AFTER INSERT OR UPDATE OR DELETE ON public.milestones
  FOR EACH ROW EXECUTE FUNCTION update_project_progress();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_projects_lead ON public.projects(lead_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_department ON public.projects(department);
CREATE INDEX IF NOT EXISTS idx_milestones_project ON public.milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_milestones_status ON public.milestones(status);
CREATE INDEX IF NOT EXISTS idx_updates_project ON public.project_updates(project_id);
CREATE INDEX IF NOT EXISTS idx_updates_author ON public.project_updates(author_id);
CREATE INDEX IF NOT EXISTS idx_members_project ON public.project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_members_user ON public.project_members(user_id);
CREATE INDEX IF NOT EXISTS idx_budget_project ON public.budget_transactions(project_id);
