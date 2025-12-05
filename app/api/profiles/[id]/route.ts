import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    
    // Get profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select(`
        *,
        followers:follows!follower_id(
          profiles!following_id(
            id,
            full_name,
            title,
            avatar_url
          )
        ),
        following:follows!following_id(
          profiles!follower_id(
            id,
            full_name,
            title,
            avatar_url
          )
        ),
        posts(count),
        projects(count)
      `)
      .eq('id', params.id)
      .single();

    if (profileError) throw profileError;

    // Get recent posts
    const { data: recentPosts } = await supabase
      .from('posts')
      .select(`
        id,
        content,
        content_type,
        created_at
      `)
      .eq('user_id', params.id)
      .order('created_at', { ascending: false })
      .limit(10);

    // Get recent projects
    const { data: recentProjects } = await supabase
      .from('projects')
      .select(`
        id,
        name,
        description,
        status,
        progress_percentage,
        created_at
      `)
      .eq('user_id', params.id)
      .order('created_at', { ascending: false })
      .limit(10);

    const result = {
      ...profile,
      recent_posts: recentPosts || [],
      recent_projects: recentProjects || []
    };

    return NextResponse.json({ data: result, success: true });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile', success: false },
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

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', success: false },
        { status: 401 }
      );
    }

    // Check permissions (user can edit own profile, admin can edit any)
    if (user.id !== params.id) {
      // Check if user is admin (this would need to be implemented based on your role system)
      const { data: currentUser } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!currentUser || currentUser.role !== 'admin') {
        return NextResponse.json(
          { error: 'Not authorized to edit this profile', success: false },
          { status: 403 }
        );
      }
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select('*')
      .single();

    if (error) throw error;

    return NextResponse.json({ data, success: true });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile', success: false },
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

    // Check permissions (only admin can delete profiles)
    const { data: currentUser } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Not authorized to delete profiles', success: false },
        { status: 403 }
      );
    }

    // Check if trying to delete own account
    if (user.id === params.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account', success: false },
        { status: 400 }
      );
    }

    // Delete profile (cascade will handle related data)
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', params.id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Profile deleted successfully' });
  } catch (error) {
    console.error('Error deleting profile:', error);
    return NextResponse.json(
      { error: 'Failed to delete profile', success: false },
      { status: 500 }
    );
  }
}