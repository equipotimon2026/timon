import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Timon - Orientacion Vocacional',
  description: 'Plataforma de orientacion vocacional con inteligencia artificial',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
