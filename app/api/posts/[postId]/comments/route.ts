import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        profiles:user_id(
          id,
          full_name,
          title,
          avatar_url,
          department
        )
      `)
      .eq('post_id', params.postId)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return NextResponse.json({ data, success: true });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments', success: false },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const supabase = createClient();
    const body = await request.json();
    const { content } = body;

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', success: false },
        { status: 401 }
      );
    }

    // Verify post exists
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('id, user_id')
      .eq('id', params.postId)
      .single();

    if (postError) throw postError;

    // Create comment
    const { data, error } = await supabase
      .from('comments')
      .insert({
        post_id: params.postId,
        user_id: user.id,
        content
      })
      .select(`
        *,
        profiles:user_id(
          id,
          full_name,
          title,
          avatar_url,
          department
        )
      `)
      .single();

    if (error) throw error;

    // Create notification for post author (if not commenting on own post)
    if (post.user_id !== user.id) {
      await supabase.rpc('create_notification', {
        p_user_id: post.user_id,
        p_actor_id: user.id,
        p_type: 'comment',
        p_title: 'New Comment',
        p_message: `${user.user_metadata.full_name || 'Someone'} commented on your post`,
        p_entity_type: 'post',
        p_entity_id: params.postId
      });
    }

    return NextResponse.json({ data, success: true });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment', success: false },
      { status: 500 }
    );
  }
}