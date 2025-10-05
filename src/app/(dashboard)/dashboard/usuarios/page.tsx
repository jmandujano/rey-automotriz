import { prisma } from '@/lib/db';
import Link from 'next/link';

/**
 * Listado de usuarios del sistema.
 */
export default async function UsuariosPage() {
  const users = await prisma.usuario.findMany({
    include: { rol: true },
    orderBy: { id_usuario: 'asc' },
  });
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-primary">Usuarios</h2>
        <div className="flex space-x-2">
          <Link href="/dashboard/usuarios/nuevo" className="px-4 py-2 rounded-md bg-primary text-white hover:bg-primary-dark">
            Nuevo usuario
          </Link>
          <Link href="/dashboard/clientes/nuevo" className="px-4 py-2 rounded-md bg-secondary text-white hover:bg-secondary-dark">
            Nuevo cliente
          </Link>
        </div>
      </div>
      <div className="overflow-auto bg-white shadow rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-neutral-100">
            <tr>
              <th className="px-4 py-2 text-left">Correo</th>
              <th className="px-4 py-2 text-left">Nombre</th>
              <th className="px-4 py-2 text-left">Rol</th>
              <th className="px-4 py-2 text-left">Estado</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id_usuario} className="border-t">
                <td className="px-4 py-2 font-mono text-xs">{u.correo_electronico}</td>
                <td className="px-4 py-2">{u.nombre_completo}</td>
                <td className="px-4 py-2">{u.rol?.nombre_rol}</td>
                <td className="px-4 py-2">{u.estado}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}