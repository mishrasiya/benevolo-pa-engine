import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: Record<string, any> =
    session.user.role === 'PROVIDER' ? { providerId: session.user.id } : {};

  const allRequests = await prisma.pARequest.findMany({
    where,
    select: {
      id: true,
      status: true,
      aiVerdict: true,
      aiConfidence: true,
      procedureCode: true,
      procedureDescription: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  // Weekly volume
  const weekMap = new Map<string, number>();
  allRequests.forEach((r) => {
    const week = getWeekStart(new Date(r.createdAt));
    weekMap.set(week, (weekMap.get(week) || 0) + 1);
  });
  const weeklyVolume = Array.from(weekMap.entries())
    .map(([week, count]) => ({ week, count }))
    .sort((a, b) => a.week.localeCompare(b.week))
    .slice(-12);

  // Status breakdown
  const statusBreakdown = {
    APPROVED: allRequests.filter((r) => r.status === 'APPROVED').length,
    DENIED: allRequests.filter((r) => r.status === 'DENIED').length,
    PENDING: allRequests.filter((r) => ['PENDING', 'AI_REVIEW'].includes(r.status)).length,
    APPEALED: allRequests.filter((r) => r.status === 'APPEALED').length,
    DRAFT: allRequests.filter((r) => r.status === 'DRAFT').length,
  };

  // Top denied procedures
  const deniedMap = new Map<string, { code: string; desc: string; count: number }>();
  allRequests
    .filter((r) => r.status === 'DENIED' || r.aiVerdict === 'LIKELY_DENIED')
    .forEach((r) => {
      const existing = deniedMap.get(r.procedureCode);
      if (existing) {
        existing.count++;
      } else {
        deniedMap.set(r.procedureCode, {
          code: r.procedureCode,
          desc: r.procedureDescription,
          count: 1,
        });
      }
    });
  const topDenied = Array.from(deniedMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Confidence trend (weekly avg)
  const confWeekMap = new Map<string, { total: number; count: number }>();
  allRequests
    .filter((r) => r.aiConfidence !== null)
    .forEach((r) => {
      const week = getWeekStart(new Date(r.createdAt));
      const existing = confWeekMap.get(week) || { total: 0, count: 0 };
      existing.total += r.aiConfidence!;
      existing.count++;
      confWeekMap.set(week, existing);
    });
  const confidenceTrend = Array.from(confWeekMap.entries())
    .map(([week, { total, count }]) => ({
      week,
      avgConfidence: Math.round((total / count) * 100),
    }))
    .sort((a, b) => a.week.localeCompare(b.week))
    .slice(-12);

  const total = allRequests.length;
  const approved = allRequests.filter((r) => r.status === 'APPROVED').length;
  const denied = allRequests.filter((r) => r.status === 'DENIED').length;
  const pending = allRequests.filter((r) =>
    ['PENDING', 'AI_REVIEW', 'DRAFT'].includes(r.status)
  ).length;
  const withConf = allRequests.filter((r) => r.aiConfidence !== null);
  const avgConfidence =
    withConf.length > 0
      ? Math.round(
          (withConf.reduce((s, r) => s + r.aiConfidence!, 0) / withConf.length) * 100
        )
      : 0;

  return NextResponse.json({
    summary: {
      total,
      approved,
      denied,
      pending,
      approvalRate:
        approved + denied > 0 ? Math.round((approved / (approved + denied)) * 100) : 0,
      avgConfidence,
    },
    weeklyVolume,
    statusBreakdown,
    topDenied,
    confidenceTrend,
  });
}

function getWeekStart(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d.toISOString().split('T')[0];
}
