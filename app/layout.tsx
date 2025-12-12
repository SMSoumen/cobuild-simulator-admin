// app/layout.tsx
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#1a1a1a] antialiased">
        {children}
      </body>
    </html>
  );
}
