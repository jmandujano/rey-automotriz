import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * Returns notifications for a specific user.  Each notification includes
 * information about the read state (`leida`) as well as the notification
 * metadata.  Only notifications associated to the given user will be
 * returned.  Used by the notifications dashboard to populate the table
 * described in FRD módulo 7【250385542692500†L1390-L1405】.
 */

// GET /api/notifications/users/[userId]
// Query parameters:
//   leida: 'true'|'false' optional filter to show read/unread only
export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } },
) {
  const id = parseInt(params.userId, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: 'ID de usuario inválido' }, { status: 400 });
  }
  const { searchParams } = new URL(req.url);
  const leidaParam = searchParams.get('leida');
  let leidaFilter: boolean | undefined;
  if (leidaParam === 'true') leidaFilter = true;
  if (leidaParam === 'false') leidaFilter = false;
  const notifications = await prisma.notificacionUsuario.findMany({
    where: {
      id_usuario: id,
      leida: leidaFilter,
    },
    include: {
      notificacion: true,
    },
    orderBy: { id_notificacion_usuario: 'desc' },
  });
  // Transform to include both notificacion and leida state at root level
  const result = notifications.map((nu) => ({
    ...nu.notificacion,
    leida: nu.leida,
    fecha_lectura: nu.fecha_lectura,
    id_notificacion_usuario: nu.id_notificacion_usuario,
  }));
  return NextResponse.json(result);
}
