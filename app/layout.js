
import './globals.css'
import { Providers } from './providers'

export const metadata = {
  title: 'Zone Photo Tracker',
  description: 'Industrial zone before/after photo tracking with visual reporting',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <main>
            {children}
          </main>
        </Providers>
      </body>
    </html>
  )
}
