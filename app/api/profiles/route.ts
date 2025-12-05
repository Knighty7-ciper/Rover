import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const department = searchParams.get('department');
    const title = searchParams.get('title');

    let query = supabase
      .from('profiles')
      .select(`
        *,
        followers:follows!follower_id(count),
        following:follows!following_id(count)
      `)
      .order('full_name', { ascending: true })
      .range(offset, offset + limit - 1);

    if (department) {
      query = query.eq('department', department);
    }

    if (title) {
      query = query.ilike('title', `%${title}%`);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ data, success: true });
  } catch (error) {
    console.error('Error fetching profiles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profiles', success: false },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();
    const { 
      full_name, 
      title, 
      department, 
      bio, 
      avatar_url, 
      phone, 
      office_location,
      emergency_contact 
    } = body;

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', success: false },
        { status: 401 }
      );
    }

    // Update profile
    const updateData: any = {
      full_name,
      title,
      department,
      bio,
      avatar_url,
      phone,
      office_location,
      emergency_contact,
      updated_at: new Date().toISOString()
    };

    // Update in profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id)
      .select('*')
      .single();

    if (profileError) throw profileError;

    // Also update auth.users metadata if needed
    const { error: authError: updateAuthError } = await supabase.auth.admin.updateUserById(
      user.id,
      {
        data: {
          full_name,
          title,
          department
        }
      }
    );

    if (updateAuthError) {
      console.warn('Failed to update auth metadata:', updateAuthError);
    }

    return NextResponse.json({ data: profileData, success: true });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile', success: false },
      { status: 500 }
    );
  }
}
