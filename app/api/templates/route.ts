import { NextResponse } from 'next/server';
import { getStudioTemplate, saveStudioTemplate } from '@/lib/storage';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const studioId = searchParams.get('studioId') || searchParams.get('studio_id') || 'trpworld';
    const data = await getStudioTemplate(studioId);
    return NextResponse.json({ success: true, data }, { headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch studio template' },
      { status: 500, headers: corsHeaders }
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
        { status: 400, headers: corsHeaders }
      );
    }

    const saved = await saveStudioTemplate(targetStudioId, rituals);
    return NextResponse.json({ success: true, data: saved }, { headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save studio template' },
      { status: 500, headers: corsHeaders }
    );
  }
}
