import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:user_id(
          id,
          full_name,
          title,
          avatar_url,
          department
        ),
        recipient:recipient_id(
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
    console.error('Error fetching message:', error);
    return NextResponse.json(
      { error: 'Failed to fetch message', success: false },
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
    const { content, is_read } = body;

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', success: false },
        { status: 401 }
      );
    }

    // Check if user has permission to edit message
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .select('user_id, recipient_id')
      .eq('id', params.id)
      .single();

    if (messageError) throw messageError;

    // Only sender can edit content, only recipient can mark as read
    if (content && message.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized to edit this message', success: false },
        { status: 403 }
      );
    }

    if (is_read !== undefined && message.recipient_id !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized to mark this message as read', success: false },
        { status: 403 }
      );
    }

    // Update message
    const updateData: any = {};
    if (content !== undefined) updateData.content = content;
    if (is_read !== undefined) updateData.is_read = is_read;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('messages')
      .update(updateData)
      .eq('id', params.id)
      .select(`
        *,
        sender:user_id(
          id,
          full_name,
          title,
          avatar_url
        ),
        recipient:recipient_id(
          id,
          full_name,
          title,
          avatar_url
        )
      `)
      .single();

    if (error) throw error;

    return NextResponse.json({ data, success: true });
  } catch (error) {
    console.error('Error updating message:', error);
    return NextResponse.json(
      { error: 'Failed to update message', success: false },
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

    // Check if user owns the message
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .select('user_id')
      .eq('id', params.id)
      .single();

    if (messageError) throw messageError;

    if (message.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized to delete this message', success: false },
        { status: 403 }
      );
    }

    // Delete message
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', params.id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    return NextResponse.json(
      { error: 'Failed to delete message', success: false },
      { status: 500 }
    );
  }
}
