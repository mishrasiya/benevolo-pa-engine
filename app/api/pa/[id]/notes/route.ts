import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { content } = await request.json();
  if (!content?.trim()) {
    return NextResponse.json({ error: 'Note content required' }, { status: 400 });
  }

  const note = await prisma.providerNote.create({
    data: {
      paRequestId: params.id,
      authorId: session.user.id,
      content: content.trim(),
    },
    include: { author: { select: { name: true } } },
  });

  return NextResponse.json(note, { status: 201 });
}
