import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('tags')
      .select(`
        *,
        posts:post_tags(
          posts(
            id,
            content,
            content_type,
            created_at,
            profiles:user_id(
              id,
              full_name,
              title,
              avatar_url,
              department
            )
          )
        )
      `)
      .eq('id', params.id)
      .single();

    if (error) throw error;

    return NextResponse.json({ data, success: true });
  } catch (error) {
    console.error('Error fetching tag:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tag', success: false },
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
    const { name } = body;

    // Verify user is authenticated (only admins should be able to edit tags)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', success: false },
        { status: 401 }
      );
    }

    // Clean and format tag name
    const cleanName = name.trim().toLowerCase().replace(/\s+/g, '_');

    // Check if new name already exists
    const { data: existingTag, error: checkError } = await supabase
      .from('tags')
      .select('id')
      .eq('name', cleanName)
      .neq('id', params.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (existingTag) {
      return NextResponse.json(
        { error: 'Tag name already exists', success: false },
        { status: 400 }
      );
    }

    // Update tag
    const { data, error } = await supabase
      .from('tags')
      .update({
        name: cleanName,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select('*')
      .single();

    if (error) throw error;

    return NextResponse.json({ data, success: true });
  } catch (error) {
    console.error('Error updating tag:', error);
    return NextResponse.json(
      { error: 'Failed to update tag', success: false },
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

    // Verify user is authenticated (only admins should be able to delete tags)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', success: false },
        { status: 401 }
      );
    }

    // Delete tag (cascade will handle post_tags relationships)
    const { error } = await supabase
      .from('tags')
      .delete()
      .eq('id', params.id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Tag deleted successfully' });
  } catch (error) {
    console.error('Error deleting tag:', error);
    return NextResponse.json(
      { error: 'Failed to delete tag', success: false },
      { status: 500 }
    );
  }
}
