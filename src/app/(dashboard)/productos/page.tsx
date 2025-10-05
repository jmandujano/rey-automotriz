import { prisma } from '@/lib/db';
import Link from 'next/link';

/**
 * Listado de productos.
 *
 * Consulta todos los productos y muestra una tabla sencilla con su
 * descripción y categoría. Incluye un enlace para crear un nuevo
 * producto.
 */
export default async function ProductosPage() {
  const products = await prisma.producto.findMany({
    include: { categoria: true },
    orderBy: { id_producto: 'asc' },
  });
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-primary">Productos</h2>
        <Link
          href="/dashboard/productos/nuevo"
          className="px-4 py-2 rounded-md bg-primary text-white hover:bg-primary-dark"
        >
          Nuevo producto
        </Link>
      </div>
      <div className="overflow-auto bg-white shadow rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-neutral-100">
            <tr>
              <th className="px-4 py-2 text-left">Código</th>
              <th className="px-4 py-2 text-left">Descripción</th>
              <th className="px-4 py-2 text-left">Categoría</th>
              <th className="px-4 py-2 text-left">Estado</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id_producto} className="border-t">
                <td className="px-4 py-2 font-mono text-xs">{p.codigo_producto}</td>
                <td className="px-4 py-2">{p.descripcion}</td>
                <td className="px-4 py-2">{p.categoria?.nombre_categoria}</td>
                <td className="px-4 py-2">{p.estado}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}