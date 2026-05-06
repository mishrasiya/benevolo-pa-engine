import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { analyzePA } from '@/lib/anthropic';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const pa = await prisma.pARequest.findUnique({ where: { id: params.id } });
  if (!pa) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  let pdfText: string | undefined;

  try {
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('pdf') as File | null;
      if (file) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const pdfParse = (await import('pdf-parse')).default;
        const parsed = await pdfParse(buffer);
        pdfText = parsed.text;
      }
    }
  } catch {
    // PDF parse failure is non-fatal — continue without it
  }

  await prisma.pARequest.update({
    where: { id: params.id },
    data: { status: 'AI_REVIEW' },
  });

  await prisma.auditEntry.create({
    data: {
      paRequestId: params.id,
      action: 'AI_ANALYSIS_STARTED',
      performedBy: 'AI System',
      details: 'Clinical review initiated',
    },
  });

  try {
    const result = await analyzePA({
      patientName: pa.patientName,
      patientDOB: pa.patientDOB,
      diagnosisCodes: pa.diagnosisCodes,
      procedureCode: pa.procedureCode,
      procedureDescription: pa.procedureDescription,
      payer: pa.payer,
      urgency: pa.urgency,
      clinicalNotes: pa.clinicalNotes,
      pdfText,
    });

    const updated = await prisma.pARequest.update({
      where: { id: params.id },
      data: {
        status: 'AI_REVIEW',
        aiVerdict: result.verdict,
        aiConfidence: result.confidence,
        aiRationale: JSON.stringify(result.rationale),
        aiDocGaps: JSON.stringify(result.documentationGaps),
        aiSuggestedCodes: JSON.stringify(result.suggestedCodes),
        turnaroundEstimate: result.turnaroundEstimate,
        appealStrength: result.appealStrength,
        aiSummary: result.summaryForProvider,
      },
    });

    await prisma.auditEntry.create({
      data: {
        paRequestId: params.id,
        action: 'AI_ANALYSIS_COMPLETE',
        performedBy: 'AI System',
        details: `Verdict: ${result.verdict}, Confidence: ${Math.round(result.confidence * 100)}%`,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    await prisma.pARequest.update({
      where: { id: params.id },
      data: { status: 'PENDING' },
    });

    await prisma.auditEntry.create({
      data: {
        paRequestId: params.id,
        action: 'AI_ANALYSIS_FAILED',
        performedBy: 'AI System',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    return NextResponse.json(
      { error: 'AI analysis failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
