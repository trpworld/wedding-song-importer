import { NextResponse } from 'next/server';
import { getStudioTemplate, saveStudioTemplate } from '@/lib/storage';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const studioId = searchParams.get('studioId') || searchParams.get('studio_id') || 'trpworld';
    const data = await getStudioTemplate(studioId);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch studio template' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { studio_id, studioId, rituals } = body;
    const targetStudioId = studio_id || studioId || 'trpworld';

    if (!rituals || !Array.isArray(rituals)) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: rituals (must be an array)' },
        { status: 400 }
      );
    }

    const saved = await saveStudioTemplate(targetStudioId, rituals);
    return NextResponse.json({ success: true, data: saved });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save studio template' },
      { status: 500 }
    );
  }
}
