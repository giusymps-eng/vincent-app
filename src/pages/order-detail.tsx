import { useParams, Link, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Printer, ChevronLeft, Edit, Ban, Lock } from "lucide-react";
import { useOrders, updateOrderStatus, markOrderPrinted } from "@/lib/storage";
import { sendOrderToPrinter } from "@/lib/rawbt";
import type { Order, OrderStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

export default function OrderDetail() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const orders = useOrders();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (id) {
      const found = orders.find((o) => o.id === id);
      setOrder(found || null);
    }
  }, [id, orders]);

  if (!order) {
    return <div className="p-8 text-center text-muted-foreground">Ordine non trovato</div>;
  }

  const isPrinted = !!order.printed;

  const handleStatusChange = (status: OrderStatus) => {
    updateOrderStatus(order.id, status);
    toast({ title: "Stato aggiornato" });
  };

  const handleCancel = () => {
    updateOrderStatus(order.id, "annullato");
    toast({ title: "Ordine annullato" });
    setLocation("/");
  };

  const handleEdit = () => {
    setLocation(`/nuovo?edit=${order.id}`);
  };

  const handlePrint = () => {
    // Controlla se siamo su mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      // Su mobile, mostra messaggio e non aprire print dialog
      toast({
        title: "Stampa non disponibile",
        description: "Usa un computer per stampare le comande. L'ordine è stato inviato alla stampante Bluetooth.",
        variant: "default",
      });
      
      // Marca come stampato e invia a RawBT
      if (!isPrinted) {
        markOrderPrinted(order.id);
      }
      
      sendOrderToPrinter(order).catch(() => {
        // Silenzioso
      });
      
      return;
    }
    
    // Su desktop, comportamento normale
    if (!isPrinted) {
      markOrderPrinted(order.id);
    }
    
    window.print();
    
    sendOrderToPrinter(order).catch(() => {
      // Silenzioso
    });
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 no-print gap-3">
        <Button variant="ghost" asChild className="pl-0 self-start">
          <Link href="/">
            <ChevronLeft className="mr-2 h-4 w-4" /> Torna a Dashboard
          </Link>
        </Button>
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {isPrinted && (
            <Badge variant="outline" className="bg-muted/50 border-muted-foreground/30 text-muted-foreground py-1 px-3">
              <Lock className="h-3 w-3 mr-1.5" /> Stampato — Bloccato
            </Badge>
          )}

          <Select value={order.status} onValueChange={(v: OrderStatus) => handleStatusChange(v)}>
            <SelectTrigger className="w-40 font-bold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="in_preparazione">In Preparazione</SelectItem>
              <SelectItem value="pronto">Pronto</SelectItem>
              <SelectItem value="consegnato">Consegnato</SelectItem>
              <SelectItem value="annullato">Annullato</SelectItem>
            </SelectContent>
          </Select>

        </div>
      </div>

      <ComandaBody order={order} />
      <div className="print-copy-2">
        <ComandaBody order={order} />
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3 mt-6 no-print">
        {!isPrinted && (
          <Button variant="outline" onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" /> Modifica
          </Button>
        )}

        <Button onClick={handlePrint} className="font-bold">
          <Printer className="mr-2 h-4 w-4" /> {isPrinted ? "Ristampa" : "Stampa"}
        </Button>

        {!isPrinted && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Ban className="mr-2 h-4 w-4" /> Annulla
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Annullare questo ordine?</AlertDialogTitle>
                <AlertDialogDescription>
                  L'ordine verrà contrassegnato come annullato.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>No, torna indietro</AlertDialogCancel>
                <AlertDialogAction onClick={handleCancel} className="bg-destructive text-destructive-foreground">
                  Sì, annulla ordine
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );
}

function ComandaBody({ order }: { order: Order }) {
  return (
      <div className="bg-card border rounded-lg p-8 comanda-print-container shadow-xl print-copy">
        <div className="text-center mb-8 border-b pb-6 border-dashed">
          <h1 className="font-serif text-4xl font-bold mb-2">Comanda #{order.progressiveNumber}</h1>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Badge variant="outline" className="text-lg py-1 px-3 uppercase tracking-widest">
              {order.type}
            </Badge>
            <span className="font-bold text-xl">
              {order.type === "tavolo"
                ? order.tableNumber
                  ? `Tavolo ${order.tableNumber}`
                  : `${order.coperti || 1} coperti`
                : order.scheduledTime}
            </span>
          </div>

          {(order.customerName || order.customerPhone || order.customerAddress) && (
            <div className="text-left bg-muted/30 p-4 rounded-md mt-4 font-mono text-sm space-y-1 print-only:bg-transparent print-only:p-0 print-only:border-none border border-border/50">
              {order.customerName && (
                <div>
                  <strong>Nome:</strong> {order.customerName}
                </div>
              )}
              {order.customerPhone && (
                <div>
                  <strong>Tel:</strong> {order.customerPhone}
                </div>
              )}
              {order.customerAddress && (
                <div>
                  <strong>Indirizzo:</strong> {order.customerAddress}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-8 font-mono text-lg">
          {order.pizzas.length > 0 && (
            <section>
              <h2 className="font-bold border-b-2 border-primary/50 mb-3 pb-1">PIZZE</h2>
              <div className="space-y-3">
                {order.pizzas.map((line) => (
                  <div key={line.id} className="flex justify-between items-start">
                    <div className="flex-1">
                      <span className="font-bold">
                        {line.quantity} × {line.name}
                        {line.note && line.note.trim() && <span className="ml-2">⚠</span>}
                      </span>
                      {line.note && (
                        <div className="text-sm italic text-muted-foreground ml-6 print-only:text-black">
                          ⚠ Note: {line.note}
                        </div>
                      )}
                    </div>
                    <span>€{(line.price * line.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-2 border-t border-dashed font-bold text-base">
                {order.cutPizzas ? "✓ PIZZE TAGLIATE" : "□ Pizze NON tagliate"}
              </div>
            </section>
          )}

          {order.panini.length > 0 && (
            <section>
              <h2 className="font-bold border-b-2 border-primary/50 mb-3 pb-1">PANINI</h2>
              <div className="space-y-3">
                {order.panini.map((line) => (
                  <div key={line.id} className="flex justify-between items-start">
                    <div className="flex-1">
                      <span className="font-bold">
                        {line.quantity} × {line.name}
                        {line.note && line.note.trim() && <span className="ml-2">⚠</span>}
                      </span>
                      {line.note && (
                        <div className="text-sm italic text-muted-foreground ml-6 print-only:text-black">
                          ⚠ Note: {line.note}
                        </div>
                      )}
                    </div>
                    <span>€{(line.price * line.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {order.contorni.length > 0 && (
            <section>
              <h2 className="font-bold border-b-2 border-primary/50 mb-3 pb-1">STUZZICHERIE</h2>
              <div className="space-y-3">
                {order.contorni.map((line) => (
                  <div key={line.id} className="flex justify-between items-start">
                    <div className="flex-1">
                      <span className="font-bold">
                        {line.quantity} × {line.name}
                      </span>
                      {line.note && (
                        <div className="text-sm italic text-muted-foreground ml-6 print-only:text-black">
                          Note: {line.note}
                        </div>
                      )}
                    </div>
                    <span>€{(line.price * line.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {order.bevande.length > 0 && (
            <section>
              <h2 className="font-bold border-b-2 border-primary/50 mb-3 pb-1">BEVANDE</h2>
              <div className="space-y-3">
                {order.bevande.map((line) => (
                  <div key={line.id} className="flex justify-between items-start">
                    <div className="flex-1">
                      <span className="font-bold">
                        {line.quantity} × {line.name}
                      </span>
                      {line.note && (
                        <div className="text-sm italic text-muted-foreground ml-6 print-only:text-black">
                          Note: {line.note}
                        </div>
                      )}
                    </div>
                    <span>€{(line.price * line.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {order.notes && (
            <section className="bg-muted/30 p-4 rounded-md print-only:bg-transparent print-only:p-0">
              <h2 className="font-bold border-b border-primary/50 mb-2 pb-1 text-base">NOTE AGGIUNTIVE</h2>
              <p className="italic text-base whitespace-pre-wrap">{order.notes}</p>
            </section>
          )}

          {(() => {
            const hasGeneralNote = !!(order.notes && order.notes.trim());
            const hasLineNote = [...order.pizzas, ...order.panini].some(l => (l.note || '').trim().length > 0);
            return (hasGeneralNote || hasLineNote) ? (
              <div className="border-4 border-black p-3 text-center font-bold text-2xl uppercase tracking-widest mt-6">
                ⚠ Attenzione Ricalcola ⚠
              </div>
            ) : null;
          })()}

          <div className="pt-6 mt-6 border-t-4 border-double border-border print-only:border-black space-y-2">
            {!!order.deliveryFee && (
              <div className="flex justify-between text-base">
                <span>Consegna</span>
                <span>€{order.deliveryFee.toFixed(2)}</span>
              </div>
            )}
            {!!order.coperto && (
              <div className="flex justify-between text-base">
                <span>Coperto</span>
                <span>€{order.coperto.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-serif text-3xl font-bold mt-2">
              <span>TOTALE</span>
              <span>€{order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
  );
}
