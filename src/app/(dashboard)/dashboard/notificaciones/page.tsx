"use client";

import { useState } from 'react';
import useSWR from 'swr';
import { useSession } from 'next-auth/react';
import { fetcher } from '@/lib/fetcher';

interface NotificationItem {
  id_notificacion: number;
  tipo_notificacion: string;
  detalle: string;
  fecha_generacion: string;
  leida: boolean;
  fecha_lectura?: string | null;
  id_notificacion_usuario: number;
}

/**
 * Página de notificaciones.  Muestra al usuario sus notificaciones
 * personales (stock, pagos, devoluciones, etc.) y permite marcarlas
 * como leídas.  Los datos se obtienen de la API `/api/notifications/users`.
 */
export default function NotificacionesPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  // Construir URL de usuario
  const notificationsUrl = userId
    ? `/api/notifications/users/${userId}`
    : null;
  const { data: notifications, mutate } = useSWR<NotificationItem[]>(
    notificationsUrl,
    fetcher,
  );
  const [error, setError] = useState<string | null>(null);

  async function markAsRead(item: NotificationItem) {
    try {
      await fetch(
        `/api/notifications/users/${userId}/${item.id_notificacion}`,
        {
          method: 'PATCH',
        },
      );
      mutate();
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold text-gray-800">Notificaciones</h2>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="bg-white rounded-lg shadow p-4">
        {notifications ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      ID
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Tipo
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Detalle
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Fecha
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Estado
                    </th>
                    <th className="px-4 py-2" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {notifications.map((n) => (
                    <tr key={n.id_notificacion_usuario} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm text-gray-700">{n.id_notificacion}</td>
                      <td className="px-4 py-2 text-sm text-gray-700 capitalize">
                        {n.tipo_notificacion.replace('_', ' ')}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700">{n.detalle}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">
                        {new Date(n.fecha_generacion).toLocaleString()}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700">
                        {n.leida ? 'Leída' : 'No leída'}
                      </td>
                      <td className="px-4 py-2 text-sm text-right">
                        {!n.leida && (
                          <button
                            className="text-primary hover:underline"
                            onClick={() => markAsRead(n)}
                          >
                            Marcar como leída
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {notifications.length === 0 && (
                <p className="text-sm text-gray-500 mt-4">No hay notificaciones.</p>
              )}
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-500">Cargando...</p>
        )}
      </div>
    </div>
  );
}