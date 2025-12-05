import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('milestones')
      .select(`
        *,
        creator:user_id(
          id,
          full_name,
          title,
          avatar_url,
          department
        )
      `)
      .eq('id', params.id)
      .single();

    if (error) throw error;

    return NextResponse.json({ data, success: true });
  } catch (error) {
    console.error('Error fetching milestone:', error);
    return NextResponse.json(
      { error: 'Failed to fetch milestone', success: false },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const body = await request.json();
    const { title, description, due_date, budget_allocated, status, completion_percentage, actual_budget } = body;

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', success: false },
        { status: 401 }
      );
    }

    // Check if user owns the milestone
    const { data: milestone, error: milestoneError } = await supabase
      .from('milestones')
      .select('user_id, project_id')
      .eq('id', params.id)
      .single();

    if (milestoneError) throw milestoneError;

    if (milestone.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized to update this milestone', success: false },
        { status: 403 }
      );
    }

    // Update milestone
    const updateData: any = {
      title,
      description,
      due_date,
      budget_allocated,
      status,
      completion_percentage,
      actual_budget,
      updated_at: new Date().toISOString()
    };

    // If milestone is completed, update project progress
    if (status === 'completed') {
      updateData.completion_percentage = 100;
      updateData.completed_at = new Date().toISOString();

      // Update project progress percentage
      const { data: projectMilestones } = await supabase
        .from('milestones')
        .select('completion_percentage')
        .eq('project_id', milestone.project_id);

      if (projectMilestones && projectMilestones.length > 0) {
        const avgProgress = projectMilestones.reduce((sum, m) => sum + m.completion_percentage, 0) / projectMilestones.length;
        await supabase
          .from('projects')
          .update({ progress_percentage: Math.round(avgProgress) })
          .eq('id', milestone.project_id);
      }
    }

    const { data, error } = await supabase
      .from('milestones')
      .update(updateData)
      .eq('id', params.id)
      .select(`
        *,
        creator:user_id(
          id,
          full_name,
          title,
          avatar_url,
          department
        )
      `)
      .single();

    if (error) throw error;

    return NextResponse.json({ data, success: true });
  } catch (error) {
    console.error('Error updating milestone:', error);
    return NextResponse.json(
      { error: 'Failed to update milestone', success: false },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', success: false },
        { status: 401 }
      );
    }

    // Check if user owns the milestone
    const { data: milestone, error: milestoneError } = await supabase
      .from('milestones')
      .select('user_id')
      .eq('id', params.id)
      .single();

    if (milestoneError) throw milestoneError;

    if (milestone.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized to delete this milestone', success: false },
        { status: 403 }
      );
    }

    // Delete milestone
    const { error } = await supabase
      .from('milestones')
      .delete()
      .eq('id', params.id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Milestone deleted successfully' });
  } catch (error) {
    console.error('Error deleting milestone:', error);
    return NextResponse.json(
      { error: 'Failed to delete milestone', success: false },
      { status: 500 }
    );
  }
}
