import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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

    // Check if user owns the like
    const { data: like, error: likeError } = await supabase
      .from('likes')
      .select('user_id, post_id')
      .eq('id', params.id)
      .single();

    if (likeError) throw likeError;

    if (like.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized to remove this like', success: false },
        { status: 403 }
      );
    }

    // Delete like
    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('id', params.id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Like removed successfully' });
  } catch (error) {
    console.error('Error removing like:', error);
    return NextResponse.json(
      { error: 'Failed to remove like', success: false },
      { status: 500 }
    );
  }
}
