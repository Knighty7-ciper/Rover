import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles:user_id(
          id,
          full_name,
          title,
          avatar_url,
          department
        ),
        comments(
          *,
          profiles:user_id(
            id,
            full_name,
            title,
            avatar_url
          )
        ),
        likes(count)
      `)
      .eq('id', params.id)
      .single();

    if (error) throw error;

    return NextResponse.json({ data, success: true });
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch post', success: false },
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
    const { content, content_type } = body;

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', success: false },
        { status: 401 }
      );
    }

    // Check if user owns the post
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('user_id')
      .eq('id', params.id)
      .single();

    if (postError) throw postError;

    if (post.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized to edit this post', success: false },
        { status: 403 }
      );
    }

    // Update post
    const { data, error } = await supabase
      .from('posts')
      .update({
        content,
        content_type: content_type || 'text',
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
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

    return NextResponse.json({ data, success: true });
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json(
      { error: 'Failed to update post', success: false },
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

    // Check if user owns the post
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('user_id')
      .eq('id', params.id)
      .single();

    if (postError) throw postError;

    if (post.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized to delete this post', success: false },
        { status: 403 }
      );
    }

    // Delete post (cascade will handle comments, likes, etc.)
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', params.id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { error: 'Failed to delete post', success: false },
      { status: 500 }
    );
  }
}
