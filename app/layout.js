import { Manrope } from 'next/font/google';
import './globals.css';

const font = Manrope({ subsets: ['latin'] });

export const metadata = { title: 'LocalImpact', description: 'Signalement et suivi des problèmes du quotidien' };

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className={font.className}>
        <a href="#main" className="skip">Aller au contenu</a>
        {children}
      </body>
    </html>
  );
}
