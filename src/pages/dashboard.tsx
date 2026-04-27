import { Link } from "wouter";
import {
  ClipboardList,
  Pizza,
  Sandwich,
  Beer,
  Truck,
  Clock,
  Users,
  Store,
  ChevronRight,
  Plus,
  TrendingUp,
  Euro,
} from "lucide-react";
import { useTodayOrders, useDeliverySlots } from "@/lib/storage";
import type { Order, OrderStatus } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const StatusBadge = ({ status }: { status: OrderStatus }) => {
  const map: Record<OrderStatus, { label: string; color: string }> = {
    in_preparazione: {
      label: "In Prep",
      color: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    },
    pronto: {
      label: "Pronto",
      color: "bg-green-500/20 text-green-400 border-green-500/30",
    },
    consegnato: {
      label: "Consegnato",
      color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    },
    annullato: {
      label: "Annullato",
      color: "bg-red-500/20 text-red-400 border-red-500/30",
    },
  };
  const m = map[status];
  return (
    <Badge variant="outline" className={`${m.color} ml-auto font-medium`}>
      {m.label}
    </Badge>
  );
};

const OrderCard = ({ order }: { order: Order }) => {
  const totalItems =
    order.pizzas.reduce((acc, i) => acc + i.quantity, 0) +
    order.panini.reduce((acc, i) => acc + i.quantity, 0) +
    order.contorni.reduce((acc, i) => acc + i.quantity, 0) +
    order.bevande.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <Link href={`/ordine/${order.id}`}>
      <Card className="hover-elevate cursor-pointer transition-all border-border hover:border-primary/50 group">
        <CardContent className="p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-muted h-12 w-12 rounded-lg flex items-center justify-center font-bold text-xl text-primary font-serif">
              #{order.progressiveNumber}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                {order.type === "domicilio" && (
                  <Truck className="h-4 w-4 text-muted-foreground" />
                )}
                {order.type === "asporto" && (
                  <Store className="h-4 w-4 text-muted-foreground" />
                )}
                {order.type === "tavolo" && (
                  <Users className="h-4 w-4 text-muted-foreground" />
                )}

                <span className="font-bold text-foreground">
                  {order.type === "tavolo"
                    ? `Tavolo ${order.tableNumber}`
                    : order.scheduledTime || "--:--"}
                </span>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-1">
                {order.customerName || "Nessun nome"} • {totalItems} pz
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <StatusBadge status={order.status} />
            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default function Dashboard() {
  const orders = useTodayOrders();
  const deliverySlots = useDeliverySlots();

  const activeOrders = orders.filter((o) => o.status !== "annullato");

  const domicilio = activeOrders
    .filter((o) => o.type === "domicilio")
    .sort((a, b) =>
      (a.scheduledTime || "").localeCompare(b.scheduledTime || "")
    );
  const asporto = activeOrders
    .filter((o) => o.type === "asporto")
    .sort((a, b) =>
      (a.scheduledTime || "").localeCompare(b.scheduledTime || "")
    );
  const tavolo = activeOrders
    .filter((o) => o.type === "tavolo")
    .sort((a, b) => b.progressiveNumber - a.progressiveNumber);

  const sumRevenue = (list: Order[]) =>
    list.reduce((a, o) => a + (o.total || 0), 0);
  const sumPizzas = (list: Order[]) =>
    list.reduce((a, o) => a + o.pizzas.reduce((p, l) => p + l.quantity, 0), 0);
  const sumPanini = (list: Order[]) =>
    list.reduce((a, o) => a + o.panini.reduce((p, l) => p + l.quantity, 0), 0);

  const revDomicilio = sumRevenue(domicilio);
  const revAsporto = sumRevenue(asporto);
  const revTavolo = sumRevenue(tavolo);
  const revTotal = revDomicilio + revAsporto + revTavolo;
  const totalPizzas = sumPizzas(activeOrders);
  const totalPanini = sumPanini(activeOrders);
  const totalOrders = activeOrders.length;
  const cancelledCount = orders.length - activeOrders.length;

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight">
            Oggi
          </h2>
          <p className="text-sm text-muted-foreground">
            Panoramica ordini del giorno
          </p>
        </div>
        <Link
          href="/nuovo"
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 sm:px-6 py-2.5 sm:py-3 rounded-md font-bold transition-all shadow-lg shadow-primary/20 flex items-center gap-2 hover-elevate text-sm sm:text-base"
        >
          <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
          NUOVO ORDINE
        </Link>
      </div>

      {/* Heatmap */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary" />
            Capacità Domicilio (Pizze)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {deliverySlots.map((slot) => {
              const perc = slot.pizzaCount / 9;
              let color = "bg-muted text-muted-foreground";
              if (slot.pizzaCount > 0) {
                if (perc < 0.5)
                  color = "bg-green-500/20 text-green-400 border-green-500/30";
                else if (perc < 0.9)
                  color =
                    "bg-orange-500/20 text-orange-400 border-orange-500/30";
                else
                  color = "bg-red-500/20 text-red-400 border-red-500/30";
              }

              return (
         <div
  key={slot.time}
  className={`flex-shrink-0 flex flex-col items-center justify-center w-16 h-16 rounded-md border ${color} bg-[#0f0f0f]`}
>


                  <span className="text-sm font-bold">{slot.time}</span>
                  <span className="text-xs">{slot.pizzaCount}/9</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {totalOrders > 0 && (
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Riepilogo Giornata
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <Truck className="h-3 w-3" /> Domicilio
                </div>
                <div className="font-serif text-xl sm:text-2xl font-bold">
                  €{revDomicilio.toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {domicilio.length} ordini
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <Store className="h-3 w-3" /> Asporto
                </div>
                <div className="font-serif text-xl sm:text-2xl font-bold">
                  €{revAsporto.toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {asporto.length} ordini
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <Users className="h-3 w-3" /> Tavolo
                </div>
                <div className="font-serif text-xl sm:text-2xl font-bold">
                  €{revTavolo.toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {tavolo.length} ordini
                </div>
              </div>

              <div className="space-y-1 border-l border-primary/20 pl-4">
                <div className="text-xs text-primary uppercase tracking-wider flex items-center gap-1">
                  <Euro className="h-3 w-3" /> Totale
                </div>
                <div className="font-serif text-xl sm:text-2xl font-bold text-primary">
                  €{revTotal.toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {totalOrders} ordini
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-3 border-t border-border/50 text-sm">
              <Badge variant="outline" className="gap-1.5 py-1 px-3">
                <Pizza className="h-3.5 w-3.5 text-primary" />
                <span className="font-bold">{totalPizzas}</span> pizze
              </Badge>

              <Badge variant="outline" className="gap-1.5 py-1 px-3">
                <Sandwich className="h-3.5 w-3.5 text-primary" />
                <span className="font-bold">{totalPanini}</span> panini /
                stuzzicherie
              </Badge>

              {cancelledCount > 0 && (
                <Badge
                  variant="outline"
                  className="gap-1.5 py-1 px-3 text-muted-foreground"
                >
                  <span className="font-bold">{cancelledCount}</span> annullati
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Domicilio */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-serif text-xl font-bold flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              Domicilio
            </h3>
            <Badge
              variant="secondary"
              className="bg-primary/10 text-primary"
            >
              {domicilio.length}
            </Badge>
          </div>
          <Separator />
          <div className="space-y-3">
            {domicilio.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">
                Nessun ordine a domicilio
              </p>
            ) : (
              domicilio.map((o) => <OrderCard key={o.id} order={o} />)
            )}
          </div>
        </div>

        {/* Asporto */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-serif text-xl font-bold flex items-center gap-2">
              <Store className="h-5 w-5 text-primary" />
              Asporto
            </h3>
            <Badge
              variant="secondary"
              className="bg-primary/10 text-primary"
            >
              {asporto.length}
            </Badge>
          </div>
          <Separator />
          <div className="space-y-3">
            {asporto.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">
                Nessun ordine da asporto
              </p>
            ) : (
              asporto.map((o) => <OrderCard key={o.id} order={o} />)
            )}
          </div>
        </div>

        {/* Tavolo */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-serif text-xl font-bold flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Tavolo
            </h3>
            <Badge
              variant="secondary"
              className="bg-primary/10 text-primary"
            >
              {tavolo.length}
            </Badge>
          </div>
          <Separator />
          <div className="space-y-3">
            {tavolo.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">
                Nessun ordine al tavolo
              </p>
            ) : (
              tavolo.map((o) => <OrderCard key={o.id} order={o} />)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
