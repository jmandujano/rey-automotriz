import '@/app/globals.css';
import { Providers } from './providers';
import { Montserrat, Open_Sans } from 'next/font/google';

// Load brand fonts from Google. These fonts are specified in the
// manual de marca and are configured to expose CSS variables via
// the `variable` option. The resulting variables are used in
// tailwind.config.js to set font families.
const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-montserrat' });
const openSans = Open_Sans({ subsets: ['latin'], variable: '--font-open-sans' });

export const metadata = {
  title: 'Sistema Rey Automotriz',
  description: 'Plataforma de gestión empresarial integrada para Rey Automotriz',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${montserrat.variable} ${openSans.variable}`}>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}