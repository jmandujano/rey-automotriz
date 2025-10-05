import { prisma } from '@/lib/db';
import Link from 'next/link';

/**
 * Página de listado de clientes.
 *
 * Esta página obtiene todos los clientes activos desde la base de datos
 * e incluye la información del vendedor asignado. Permite navegar a la
 * página de creación de nuevos clientes.
 */
export default async function ClientesPage() {
  // Obtener clientes con su vendedor asignado
  const clients = await prisma.cliente.findMany({
    where: { estado: 'activo' },
    include: {
      vendedor: {
        select: {
          id_usuario: true,
          nombre_completo: true,
        },
      },
    },
    orderBy: { razon_social: 'asc' },
  });
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-primary">Clientes</h2>
        <Link
          href="/dashboard/clientes/nuevo"
          className="px-4 py-2 rounded-md bg-primary text-white hover:bg-primary-dark"
        >
          Nuevo cliente
        </Link>
      </div>
      <div className="overflow-auto bg-white shadow rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-neutral-100">
            <tr>
              <th className="px-4 py-2 text-left">Razón social</th>
              <th className="px-4 py-2 text-left">RUC</th>
              <th className="px-4 py-2 text-left">Correo</th>
              <th className="px-4 py-2 text-left">Vendedor asignado</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c.id_cliente} className="border-t">
                <td className="px-4 py-2">{c.razon_social}</td>
                <td className="px-4 py-2">{c.ruc ?? '-'}</td>
                <td className="px-4 py-2">{c.correo_electronico}</td>
                <td className="px-4 py-2">
                  {c.vendedor ? c.vendedor.nombre_completo : 'Sin asignar'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}