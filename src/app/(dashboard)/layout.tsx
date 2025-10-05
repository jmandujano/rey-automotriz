import { ReactNode } from 'react';
import Link from 'next/link';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

/**
 * Dashboard layout.
 *
 * This component wraps all pages under the `(dashboard)` segment. It
 * renders a fixed sidebar with navigation links to each module and
 * exposes the user information from the session at the top of the
 * sidebar. Additional modules can be added by extending the
 * `navigation` array.
 */
export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getServerSession(authOptions);
// Lista de enlaces en el panel lateral. Si se añaden nuevos
// módulos (por ejemplo Clientes), basta con agregar una nueva
// entrada aquí. Las rutas deben coincidir con los segmentos
// definidos dentro del directorio `(dashboard)`.
const navigation = [
    { name: 'Inicio', href: '/dashboard' },
    { name: 'Productos', href: '/dashboard/productos' },
    { name: 'Usuarios', href: '/dashboard/usuarios' },
    // Enlace al módulo de clientes, que muestra el listado y permite
    { name: 'Clientes', href: '/dashboard/clientes' },
    { name: 'Pedidos', href: '/dashboard/pedidos' },
    { name: 'Devoluciones', href: '/dashboard/devoluciones' },
    { name: 'Finanzas', href: '/dashboard/finanzas' },
    { name: 'Reportes', href: '/dashboard/reportes' },
    { name: 'Notificaciones', href: '/dashboard/notificaciones' },
  ];
  return (
    <div className="flex min-h-screen bg-neutral-50">
      {/* Sidebar */}
      <aside className="w-64 bg-primary DEFAULT text-white flex flex-col px-4 py-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">SGE Rey</h1>
          {session?.user && (
            <p className="mt-2 text-sm text-primary-light/90">
              Bienvenido,
              <br />
              <span className="font-semibold">{session.user.name}</span>
            </p>
          )}
        </div>
        <nav className="flex-1 space-y-2">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-3 py-2 rounded-md hover:bg-primary-dark transition-colors"
            >
              {item.name}
            </Link>
          ))}
        </nav>
        <form action="/api/auth/signout" method="post" className="mt-auto">
          <button
            type="submit"
            className="w-full px-3 py-2 rounded-md bg-secondary hover:bg-secondary-dark text-white transition-colors"
          >
            Cerrar sesión
          </button>
        </form>
      </aside>
      {/* Main content */}
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}