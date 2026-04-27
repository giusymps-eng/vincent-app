import { Clock } from "lucide-react";
import { useEffect, useState } from "react";
import LogoURL from "../assets/favicon.jpg";

export function Navbar() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="w-full flex items-center justify-between px-6 py-4 border-b border-border bg-background">
      <div className="flex items-center gap-3">
        <img src={LogoURL} className="w-10 h-10 rounded-md" />
        <h1 className="text-xl font-semibold text-foreground">Vincent Pub</h1>
      </div>

      <div className="flex items-center gap-2 text-mutedlight">
        <Clock className="w-5 h-5 text-primary" />
        <span className="text-lg">{time}</span>
      </div>
    </nav>
  );
}
