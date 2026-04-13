import { NextResponse } from 'next/server';
import { UnifiedSCADAWorker } from '@/ai/workers/UnifiedSCADAWorker';

export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    
    if (!text) {
      return NextResponse.json({ error: 'Missing text payload' }, { status: 400 });
    }

    const worker = new UnifiedSCADAWorker();
    const aiResponse = await worker.processRecipeFromText(text);

    return NextResponse.json({ success: true, aiResponse });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
