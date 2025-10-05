import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';

/**
 * Root page.
 *
 * Redirects authenticated users to the dashboard. Unauthenticated users are
 * directed to the login page. This minimal component runs on the
 * server and performs no rendering itself.
 */
export default async function HomePage() {
  const session = await getServerSession(authOptions);
  if (session) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
}