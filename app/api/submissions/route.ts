import { NextResponse } from 'next/server';
import { getSubmissions, createSubmission, updateSubmissionStatus } from '@/lib/storage';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const studioId = searchParams.get('studioId') || searchParams.get('studio_id') || undefined;
    const data = await getSubmissions(studioId);
    return NextResponse.json({ success: true, data }, { headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch submissions' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { studio_id, studioId, client_name, event_date, phone, general_notes, songs } = body;

    if (!client_name || !event_date || !songs || !Array.isArray(songs)) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: client_name, event_date, songs' },
        { status: 400, headers: corsHeaders }
      );
    }

    const created = await createSubmission({
      studio_id: studio_id || studioId || 'default',
      client_name,
      event_date,
      phone: phone || '',
      general_notes: general_notes || '',
      songs,
    });

    return NextResponse.json({ success: true, data: created }, { headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save submission' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status, is_downloaded } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: id, status' },
        { status: 400, headers: corsHeaders }
      );
    }

    const updated = await updateSubmissionStatus(id, status, Boolean(is_downloaded));
    return NextResponse.json({ success: true, updated }, { headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update submission' },
      { status: 500, headers: corsHeaders }
    );
  }
}
