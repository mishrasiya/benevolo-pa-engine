import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const pa = await prisma.pARequest.findUnique({
    where: { id: params.id },
    include: {
      provider: { select: { name: true, email: true } },
      auditLog: { orderBy: { createdAt: 'asc' } },
      notes: {
        include: { author: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!pa) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  if (session.user.role === 'PROVIDER' && pa.providerId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.json(pa);
}

export async function PATCH(
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

  if (session.user.role === 'PROVIDER' && pa.providerId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const { status, action, details } = body;

  const updated = await prisma.pARequest.update({
    where: { id: params.id },
    data: { ...(status ? { status } : {}) },
  });

  if (action) {
    await prisma.auditEntry.create({
      data: {
        paRequestId: params.id,
        action,
        performedBy: session.user.name || 'User',
        details: details || null,
      },
    });
  }

  return NextResponse.json(updated);
}
