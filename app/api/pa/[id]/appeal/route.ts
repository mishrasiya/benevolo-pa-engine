import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateAppealLetter } from '@/lib/anthropic';

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

  const { denialReason } = await request.json();
  if (!denialReason) {
    return NextResponse.json({ error: 'Denial reason required' }, { status: 400 });
  }

  try {
    const aiRationale: string[] = pa.aiRationale ? JSON.parse(pa.aiRationale) : [];
    const aiDocGaps: string[] = pa.aiDocGaps ? JSON.parse(pa.aiDocGaps) : [];

    const letter = await generateAppealLetter({
      patientName: pa.patientName,
      patientDOB: pa.patientDOB,
      patientMemberId: pa.patientMemberId,
      diagnosisCodes: pa.diagnosisCodes,
      procedureCode: pa.procedureCode,
      procedureDescription: pa.procedureDescription,
      payer: pa.payer,
      clinicalNotes: pa.clinicalNotes,
      denialReason,
      aiRationale,
      aiDocGaps,
    });

    await prisma.pARequest.update({
      where: { id: params.id },
      data: { status: 'APPEALED' },
    });

    await prisma.auditEntry.create({
      data: {
        paRequestId: params.id,
        action: 'APPEAL_INITIATED',
        performedBy: session.user.name || 'Provider',
        details: `Denial reason: ${denialReason}`,
      },
    });

    return NextResponse.json({ letter });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate appeal letter', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
