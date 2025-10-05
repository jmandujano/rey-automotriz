import { prisma } from '@/lib/db';
import Link from 'next/link';

export default async function DevolucionesPage() {
  const devoluciones = await prisma.devolucion.findMany({
    include: {
      cliente: true,
      vendedor: true,
      pedido: true,
    },
    orderBy: { id_devolucion: 'desc' },
  });
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-primary">Devoluciones</h2>
        <Link
          href="/dashboard/devoluciones/nuevo"
          className="px-4 py-2 rounded-md bg-primary text-white hover:bg-primary-dark"
        >
          Nueva devolución
        </Link>
      </div>
      <div className="overflow-auto bg-white shadow rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-neutral-100">
            <tr>
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">Pedido</th>
              <th className="px-4 py-2 text-left">Cliente</th>
              <th className="px-4 py-2 text-left">Vendedor</th>
              <th className="px-4 py-2 text-left">Estado</th>
            </tr>
          </thead>
          <tbody>
            {devoluciones.map((d) => (
              <tr key={d.id_devolucion} className="border-t">
                <td className="px-4 py-2">{d.id_devolucion}</td>
                <td className="px-4 py-2">{d.pedido.id_pedido}</td>
                <td className="px-4 py-2">{d.cliente.razon_social}</td>
                <td className="px-4 py-2">{d.vendedor.nombre_completo}</td>
                <td className="px-4 py-2">{d.estado_actual}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}