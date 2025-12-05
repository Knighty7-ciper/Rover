import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const conversation_with = searchParams.get('conversation_with');

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', success: false },
        { status: 401 }
      );
    }

    let query = supabase
      .from('messages')
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
      .or(`user_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (conversation_with) {
      query = query.or(`user_id.eq.${user.id},recipient_id.eq.${conversation_with}`);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ data, success: true });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages', success: false },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();
    const { recipient_id, content, is_group_message = false, group_name } = body;

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', success: false },
        { status: 401 }
      );
    }

    // Validate recipient exists (if not group message)
    if (!is_group_message) {
      const { data: recipient, error: recipientError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', recipient_id)
        .single();

      if (recipientError || !recipient) {
        return NextResponse.json(
          { error: 'Recipient not found', success: false },
          { status: 404 }
        );
      }
    }

    // Create message
    const { data, error } = await supabase
      .from('messages')
      .insert({
        user_id: user.id,
        recipient_id: is_group_message ? null : recipient_id,
        content,
        is_group_message,
        group_name: is_group_message ? group_name : null
      })
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

    // Create notification for recipient (if not group message)
    if (!is_group_message && recipient_id !== user.id) {
      await supabase.rpc('create_notification', {
        p_user_id: recipient_id,
        p_actor_id: user.id,
        p_type: 'message',
        p_title: 'New Message',
        p_message: `${user.user_metadata.full_name || 'Someone'} sent you a message`,
        p_entity_type: 'message',
        p_entity_id: data.id
      });
    }

    return NextResponse.json({ data, success: true });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Failed to send message', success: false },
      { status: 500 }
    );
  }
}
