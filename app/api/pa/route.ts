import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const payer = searchParams.get('payer');
  const urgency = searchParams.get('urgency');
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: Record<string, any> = {};

  if (session.user.role === 'PROVIDER') {
    where.providerId = session.user.id;
  }
  if (status) where.status = status;
  if (payer) where.payer = payer;
  if (urgency) where.urgency = urgency;
  if (from || to) {
    where.createdAt = {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to ? { lte: new Date(to) } : {}),
    };
  }

  const requests = await prisma.pARequest.findMany({
    where,
    include: { provider: { select: { name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(requests);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const {
    patientName,
    patientDOB,
    patientMemberId,
    diagnosisCodes,
    procedureCode,
    procedureDescription,
    payer,
    urgency,
    clinicalNotes,
  } = body;

  if (!patientName || !diagnosisCodes || !procedureCode || !payer) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const paRequest = await prisma.pARequest.create({
    data: {
      patientName,
      patientDOB,
      patientMemberId,
      diagnosisCodes,
      procedureCode,
      procedureDescription,
      payer,
      urgency: urgency || 'ROUTINE',
      clinicalNotes,
      status: 'PENDING',
      providerId: session.user.id,
    },
  });

  await prisma.auditEntry.create({
    data: {
      paRequestId: paRequest.id,
      action: 'CREATED',
      performedBy: session.user.name || 'Provider',
      details: 'PA request submitted via intake form',
    },
  });

  return NextResponse.json(paRequest, { status: 201 });
}
