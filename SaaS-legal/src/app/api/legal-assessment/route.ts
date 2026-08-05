import { NextResponse } from 'next/server';
import { analyzeLegalRisk } from '@/features/legal-shield/lib/legal-shield-engine';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validar token de API (placeholder para multi-tenancy)
    const apiKey = request.headers.get('x-api-key');
    if (!apiKey) {
      return NextResponse.json({ error: 'API Key missing' }, { status: 401 });
    }

    const assessment = analyzeLegalRisk(body);
    
    return NextResponse.json({
      success: true,
      assessment,
      disclaimer: 'No somos abogados. Esto es orientación automatizada basada en normativa pública mexicana 2026.'
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
