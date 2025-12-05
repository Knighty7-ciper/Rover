import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const user_id = searchParams.get('user_id');
    const content_type = searchParams.get('content_type');

    let query = supabase
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
        comments(count),
        likes(count)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (user_id) {
      query = query.eq('user_id', user_id);
    }

    if (content_type) {
      query = query.eq('content_type', content_type);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ data, success: true });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts', success: false },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();
    const { user_id, content, content_type = 'text', milestone_id } = body;

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', success: false },
        { status: 401 }
      );
    }

    // Create post
    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id: user_id || user.id,
        content,
        content_type,
        milestone_id: milestone_id || null
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

    // Process mentions and trigger notifications
    const mentions = content.match(/@(\w+)/g);
    if (mentions) {
      // Process mention logic here
      // This would typically involve finding mentioned users and creating notifications
    }

    return NextResponse.json({ data, success: true });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Failed to create post', success: false },
      { status: 500 }
    );
  }
}
