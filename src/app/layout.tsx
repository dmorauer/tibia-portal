import { AuthProvider } from '@/lib/auth-context'
import AuthStatus from './components/AuthStatus'
import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>
          <header className="p-4 border-b flex justify-end">
            <AuthStatus />
          </header>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}