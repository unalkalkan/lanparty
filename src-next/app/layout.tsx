import "./globals.css"
import "../components/ui/sidebar-theme-overrides.css"
import AppLayout from 'components/AppLayout';
import { ThemeProvider } from 'next-themes';
import { ThemeEffect } from '../lib/theme-effect';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeEffect />
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AppLayout>
            {children}
          </AppLayout>
        </ThemeProvider>
      </body>
    </html>
  )
}
