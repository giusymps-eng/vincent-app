import { Link, useLocation } from "wouter";
import { Clock, Pizza, Sandwich, Beer, ClipboardList } from "lucide-react";
import { useEffect, useState } from "react";
import logoUrl from "@assets/favicon.jpg";


export function Navbar() {
  const [time, setTime] = useState(new Date());
  const [location] = useLocation();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const navLinks = [
    { href: "/", label: "Dashboard", icon: ClipboardList },
    { href: "/menu", label: "Menu", icon: Pizza },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 no-print">
      <div className="container flex h-16 sm:h-20 items-center justify-between gap-3">
        <div className="flex items-center gap-3 sm:gap-8 min-w-0">
          <Link href="/" className="flex items-center gap-2 sm:gap-3 min-w-0">
            <img src={logoUrl} alt="Vincent" className="h-9 w-9 sm:h-12 sm:w-12 rounded-full object-cover border-2 border-primary/20 flex-shrink-0" />
            <div className="min-w-0">
              <h1 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-primary truncate">Vincent</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">Pub Pizzeria Panineria</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${location === link.href ? "text-primary" : "text-muted-foreground"}`}>
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-6 flex-shrink-0">
          <nav className="flex md:hidden items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className={`flex items-center justify-center h-9 w-9 rounded-md transition-colors ${location === link.href ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-primary"}`} title={link.label}>
                <link.icon className="h-5 w-5" />
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2 text-muted-foreground bg-muted/50 px-2 sm:px-4 py-1.5 sm:py-2 rounded-full">
            <Clock className="h-4 w-4 text-primary" />
            <span className="font-mono text-xs sm:text-sm">{time.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 container py-4 sm:py-8 px-3 sm:px-6 pb-24">
        {children}
      </main>
    </div>
  );
}
