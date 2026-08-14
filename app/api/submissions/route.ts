import { NextResponse } from 'next/server';
import { getSubmissions, createSubmission, updateSubmissionStatus } from '@/lib/storage';

export async function GET() {
  try {
    const data = await getSubmissions();
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { client_name, event_date, phone, general_notes, songs } = body;

    if (!client_name || !event_date || !songs || !Array.isArray(songs)) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: client_name, event_date, songs' },
        { status: 400 }
      );
    }

    const created = await createSubmission({
      client_name,
      event_date,
      phone: phone || '',
      general_notes: general_notes || '',
      songs,
    });

    return NextResponse.json({ success: true, data: created });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save submission' },
      { status: 500 }
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
        { status: 400 }
      );
    }

    const updated = await updateSubmissionStatus(id, status, Boolean(is_downloaded));
    return NextResponse.json({ success: true, updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update submission' },
      { status: 500 }
    );
  }
}
