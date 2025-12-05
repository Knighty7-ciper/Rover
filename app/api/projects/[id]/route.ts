import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        creator:user_id(
          id,
          full_name,
          title,
          avatar_url,
          department
        ),
        milestones(
          *,
          creator:user_id(
            id,
            full_name,
            title,
            avatar_url
          )
        )
      `)
      .eq('id', params.id)
      .single();

    if (error) throw error;

    return NextResponse.json({ data, success: true });
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project', success: false },
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
    const { name, description, department, budget, status, estimated_completion_date } = body;

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', success: false },
        { status: 401 }
      );
    }

    // Check if user owns the project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('user_id')
      .eq('id', params.id)
      .single();

    if (projectError) throw projectError;

    if (project.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized to update this project', success: false },
        { status: 403 }
      );
    }

    // Update project
    const updateData: any = {
      name,
      description,
      department,
      budget,
      status,
      estimated_completion_date,
      updated_at: new Date().toISOString()
    };

    // Calculate progress percentage based on milestones
    if (status === 'completed') {
      updateData.progress_percentage = 100;
    }

    const { data, error } = await supabase
      .from('projects')
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
    console.error('Error updating project:', error);
    return NextResponse.json(
      { error: 'Failed to update project', success: false },
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

    // Check if user owns the project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('user_id')
      .eq('id', params.id)
      .single();

    if (projectError) throw projectError;

    if (project.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized to delete this project', success: false },
        { status: 403 }
      );
    }

    // Delete project (cascade will handle milestones)
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', params.id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { error: 'Failed to delete project', success: false },
      { status: 500 }
    );
  }
}
