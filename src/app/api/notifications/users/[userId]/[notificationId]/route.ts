import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// PATCH /api/notifications/users/[userId]/[notificationId]
// Marks a notification for a user as read.
export async function PATCH(
  _req: NextRequest,
  { params }: { params: { userId: string; notificationId: string } },
) {
  const userId = parseInt(params.userId, 10);
  const notificationId = parseInt(params.notificationId, 10);
  if (isNaN(userId) || isNaN(notificationId)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }
  try {
    // Update the notification-user relation by matching both IDs.  We use updateMany
    // because the primary key is id_notificacion_usuario, but we only have the
    // composite keys.  updateMany will affect a single row due to the unique
    // constraint on (id_notificacion, id_usuario).
    const updated = await prisma.notificacionUsuario.updateMany({
      where: {
        id_notificacion: notificationId,
        id_usuario: userId,
      },
      data: {
        leida: true,
        fecha_lectura: new Date(),
      },
    });
    // If no rows were updated, return not found
    if (updated.count === 0) {
      return NextResponse.json(
        { error: 'Notificación no asociada al usuario' },
        { status: 404 },
      );
    }
    return NextResponse.json({ message: 'Notificación marcada como leída' });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Error al marcar la notificación como leída' },
      { status: 500 },
    );
  }
}
