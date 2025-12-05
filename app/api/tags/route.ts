import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const trending = searchParams.get('trending') === 'true';

    if (trending) {
      // Get trending tags using the database function
      const { data, error } = await supabase.rpc('get_trending_tags', {
        limit_count: limit
      });

      if (error) throw error;

      return NextResponse.json({ data, success: true });
    }

    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('posts_count', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return NextResponse.json({ data, success: true });
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tags', success: false },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();
    const { name } = body;

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', success: false },
        { status: 401 }
      );
    }

    // Validate tag name
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Tag name is required', success: false },
        { status: 400 }
      );
    }

    // Clean and format tag name
    const cleanName = name.trim().toLowerCase().replace(/\s+/g, '_');

    // Check if tag already exists
    const { data: existingTag, error: checkError } = await supabase
      .from('tags')
      .select('id')
      .eq('name', cleanName)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (existingTag) {
      return NextResponse.json(
        { error: 'Tag already exists', success: false },
        { status: 400 }
      );
    }

    // Create new tag
    const { data, error } = await supabase
      .from('tags')
      .insert({
        name: cleanName,
        posts_count: 0
      })
      .select('*')
      .single();

    if (error) throw error;

    return NextResponse.json({ data, success: true });
  } catch (error) {
    console.error('Error creating tag:', error);
    return NextResponse.json(
      { error: 'Failed to create tag', success: false },
      { status: 500 }
    );
  }
}