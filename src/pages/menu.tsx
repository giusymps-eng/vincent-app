import { 
  ALL_MENU, 
  CATEGORY_LABELS,
  COPERTO,
  DELIVERY_FEE_PER_PIZZA,
  DELIVERY_FEE_FIXED_THRESHOLD,
  DELIVERY_FEE_FIXED,
  SUPPLEMENTO_PANINO,
  AGGIUNTE_PIZZA
} from "@/data/menu";
import type { MenuItem } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function MenuPage() {
  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-300">
      <div className="text-center mb-12">
        <h1 className="font-serif text-5xl font-bold text-primary mb-4">Menu Vincent</h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Consultazione rapida. I prezzi e le descrizioni sono aggiornati al listino corrente.
        </p>
      </div>

      {/* Info Box */}
      <div className="grid md:grid-cols-2 gap-4 mb-12">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4 space-y-2 text-sm">
            <h4 className="font-bold text-primary uppercase">Regole Domicilio</h4>
            <div className="flex justify-between border-b border-primary/10 pb-1">
              <span>Consegna per pizza (fino a {DELIVERY_FEE_FIXED_THRESHOLD-1})</span>
              <span className="font-bold">€{DELIVERY_FEE_PER_PIZZA.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pb-1">
              <span>Consegna fissa ({DELIVERY_FEE_FIXED_THRESHOLD}+ pizze)</span>
              <span className="font-bold">€{DELIVERY_FEE_FIXED.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4 space-y-2 text-sm">
            <h4 className="font-bold text-primary uppercase">Tavolo & Supplementi</h4>
            <div className="flex justify-between border-b border-primary/10 pb-1">
              <span>Coperto</span>
              <span className="font-bold">€{COPERTO.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-b border-primary/10 pb-1">
              <span>Supplemento Panino al Piatto</span>
              <span className="font-bold">€{SUPPLEMENTO_PANINO.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pb-1">
              <span>Aggiunte Pizza (cadauna)</span>
              <span className="font-bold">€1.50</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Menu Categories */}
      <div className="space-y-16">
        {Object.entries(ALL_MENU).map(([key, items]) => {
          const categoryItems = items as MenuItem[];
          if (!categoryItems.length) return null;

          return (
            <section key={key}>
              <h2 className="font-serif text-3xl font-bold border-b border-primary/30 pb-2 mb-6 text-primary flex items-center gap-3">
                {CATEGORY_LABELS[key] || key}
              </h2>
              
              <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
                {categoryItems.map(item => (
                  <div key={item.id} className="group hover-elevate p-2 -m-2 rounded-lg transition-colors border border-transparent hover:border-border hover:bg-card">
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">{item.name}</h3>
                          {item.frozen && <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4 bg-blue-500/10 text-blue-400">Surgelato</Badge>}
                          {item.glutenFree && <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4 bg-green-500/10 text-green-400">GF</Badge>}
                        </div>
                        {item.description && (
                          <p className="text-sm text-muted-foreground leading-snug">{item.description}</p>
                        )}
                      </div>
                      <div className="font-mono font-bold text-lg whitespace-nowrap">
                        €{item.price.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}

        {/* Aggiunte List */}
        <section className="bg-card border rounded-lg p-6">
          <h2 className="font-serif text-xl font-bold mb-4 text-primary">Lista Aggiunte (€1.50)</h2>
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            {AGGIUNTE_PIZZA.map(a => <span key={a.name} className="bg-muted px-2 py-1 rounded">{a.name}</span>)}
          </div>
        </section>
      </div>
    </div>
  );
}
