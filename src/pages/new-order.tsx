import { useState, useMemo, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import {
  Truck, Store, Users, Check, ChevronLeft, ChevronRight, Pizza, Sandwich, Beer, UtensilsCrossed
} from "lucide-react";
import {
  ALL_MENU, AGGIUNTE_PIZZA, DELIVERY_FEE_PER_PIZZA,
  DELIVERY_FEE_FIXED_THRESHOLD, DELIVERY_FEE_FIXED, COPERTO, getAllPizzas,
  CATEGORY_LABELS,
  SUPPLEMENTO_PANINO,
} from "@/data/menu";
import {
  saveOrder, useDeliverySlots, useCanFitInSlot, generateAsportoSlots,
  getOrderById, replaceOrder,
} from "@/lib/storage";
import type { OrderType, MenuItem, OrderLine } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

type Step = 1 | 2 | 3;

interface OrderState {
  type?: OrderType;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  scheduledTime?: string;
  tableNumber?: number;
  coperti?: number;
  pizzas: OrderLine[];
  panini: OrderLine[];
  contorni: OrderLine[];
  bevande: OrderLine[];
  notes?: string;
  cutPizzas?: boolean;
}

export default function NewOrder() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const { toast } = useToast();

  const editId = useMemo(() => {
    const params = new URLSearchParams(search);
    return params.get("edit");
  }, [search]);

  const [step, setStep] = useState<Step>(1);
  const [order, setOrder] = useState<OrderState>({
    pizzas: [], panini: [], contorni: [], bevande: [], coperti: 1,
  });

  useEffect(() => {
    if (!editId) return;
    const existing = getOrderById(editId);
    if (!existing) {
      toast({ title: "Ordine non trovato", variant: "destructive" });
      setLocation("/");
      return;
    }
    if (existing.printed) {
      toast({ title: "Ordine bloccato", description: "L'ordine è già stato stampato e non è modificabile.", variant: "destructive" });
      setLocation(`/ordine/${existing.id}`);
      return;
    }
    setOrder({
      type: existing.type,
      customerName: existing.customerName,
      customerPhone: existing.customerPhone,
      customerAddress: existing.customerAddress,
      scheduledTime: existing.scheduledTime,
      tableNumber: existing.tableNumber,
      coperti: existing.coperti ?? 1,
      pizzas: existing.pizzas,
      panini: existing.panini,
      contorni: existing.contorni,
      bevande: existing.bevande,
      notes: existing.notes,
      cutPizzas: existing.cutPizzas,
    });
    setStep(2);
  }, [editId]);

  const deliverySlots = useDeliverySlots();
  const asportoSlots = useMemo(() => generateAsportoSlots(), []);
  const canFit = useCanFitInSlot();

  const handleTypeSelect = (type: OrderType) => {
    setOrder(prev => ({ ...prev, type }));
    setStep(2);
  };

  const handleNextStep2 = () => {
    if (order.type === 'domicilio') {
      if (!order.customerName || !order.scheduledTime || !order.customerAddress) {
        toast({ title: "Dati mancanti", description: "Nome, indirizzo e orario sono obbligatori per il domicilio.", variant: "destructive" });
        return;
      }
    } else if (order.type === 'asporto') {
      if (!order.customerName || !order.scheduledTime) {
        toast({ title: "Dati mancanti", description: "Nome e orario sono obbligatori per l'asporto.", variant: "destructive" });
        return;
      }
    } else if (order.type === 'tavolo') {
      if (!order.coperti || order.coperti < 1) {
        toast({ title: "Dati mancanti", description: "Numero coperti obbligatorio (almeno 1).", variant: "destructive" });
        return;
      }
      if (!order.customerName || !order.customerName.trim()) {
        toast({ title: "Dati mancanti", description: "Il nome cliente è obbligatorio per il tavolo.", variant: "destructive" });
        return;
      }
    }
    setStep(3);
  };

  const addLine = (item: MenuItem, group: 'pizzas' | 'panini' | 'contorni' | 'bevande') => {
    if (group === 'pizzas' && order.scheduledTime) {
      const currentPizzas = order.pizzas.reduce((a, l) => a + l.quantity, 0);
      const { remaining } = canFit(order.scheduledTime, 0, editId);
      if (remaining < currentPizzas + 1) {
        alert("LIMITE PIZZE RAGGIUNTO");
        return;
      }
    }
    const newLine: OrderLine = {
      id: Math.random().toString(36).slice(2),
      itemId: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      category: item.category
    };
    setOrder(prev => ({ ...prev, [group]: [...prev[group], newLine] }));
  };

  const updateLine = (group: 'pizzas' | 'panini' | 'contorni' | 'bevande', id: string, changes: Partial<OrderLine>) => {
    if (group === 'pizzas' && 'quantity' in changes && order.scheduledTime) {
      const line = order[group].find(l => l.id === id);
      if (line) {
        const newQuantity = changes.quantity!;
        const delta = newQuantity - line.quantity;
        if (delta > 0) {
          const currentPizzas = order.pizzas.reduce((a, l) => a + l.quantity, 0);
          const { remaining } = canFit(order.scheduledTime, 0, editId);
          if (remaining < currentPizzas + delta) {
            alert("LIMITE PIZZE RAGGIUNTO");
            return;
          }
        }
      }
    }
    setOrder(prev => ({
      ...prev,
      [group]: prev[group].map(line => line.id === id ? { ...line, ...changes } : line)
    }));
  };

  const removeLine = (group: 'pizzas' | 'panini' | 'contorni' | 'bevande', id: string) => {
    setOrder(prev => ({
      ...prev,
      [group]: prev[group].filter(line => line.id !== id)
    }));
  };

  const toggleAggiunta = (lineId: string, aggiuntaName: string, aggiuntaPrice: number) => {
    setOrder(prev => {
      const line = prev.pizzas.find(l => l.id === lineId);
      if (!line) return prev;

      const noteStr = line.note || "";
      const isAdded = noteStr.includes(`+ ${aggiuntaName}`);

      let newNote = noteStr;
      let newPrice = line.price;

      if (isAdded) {
        newNote = noteStr.replace(new RegExp(`(?:,\\s*)?\\+\\s*${aggiuntaName}`), '').replace(/^\s*,\s*/, '');
        const originalItem = getAllPizzas().find(p => p.id === line.itemId);
        const addedCount = newNote.split("+").length - 1;
        newPrice = (originalItem?.price || 0) + (addedCount * 1.5);
      } else {
        newNote = noteStr ? `${noteStr}, + ${aggiuntaName}` : `+ ${aggiuntaName}`;
        newPrice += aggiuntaPrice;
      }

      return {
        ...prev,
        pizzas: prev.pizzas.map(l => l.id === lineId ? { ...l, note: newNote, price: newPrice } : l)
      };
    });
  };

  // Conteggi
const pizzeCount = order.pizzas.reduce((a, l) => a + l.quantity, 0);
const paniniCount = order.panini?.reduce((a, l) => a + l.quantity, 0) || 0;
const paninazziCount = order.paninazzi?.reduce((a, l) => a + l.quantity, 0) || 0;

let deliveryFee = 0;

// Calcolo supplementi SOLO per domicilio
if (order.type === "domicilio") {

  // Supplemento pizze (già esistente)
  if (pizzeCount > 0) {
    if (pizzeCount >= DELIVERY_FEE_FIXED_THRESHOLD) {
      deliveryFee = DELIVERY_FEE_FIXED;
    } else {
      deliveryFee = pizzeCount * DELIVERY_FEE_PER_PIZZA;
    }
  }

  // Supplemento panini
  if (paniniCount > 0) {
    deliveryFee += paniniCount * SUPPLEMENTO_PANINO;
  }

  // Supplemento paninazzi
  if (paninazziCount > 0) {
    deliveryFee += paninazziCount * SUPPLEMENTO_PANINO;
  }
}

  let copertoTotal = 0;
  if (order.type === 'tavolo') {
    copertoTotal = (order.coperti || 1) * COPERTO;
  }

  const subtotal =
    order.pizzas.reduce((a, l) => a + l.price * l.quantity, 0) +
    order.panini.reduce((a, l) => a + l.price * l.quantity, 0) +
    order.contorni.reduce((a, l) => a + l.price * l.quantity, 0) +
    order.bevande.reduce((a, l) => a + l.price * l.quantity, 0);

  const total = subtotal + deliveryFee + copertoTotal;

  const handleSubmit = () => {
    if (order.type === 'domicilio' && order.scheduledTime) {
      const { ok } = canFit(order.scheduledTime, pizzeCount, editId || undefined);
      if (!ok) {
        toast({ title: "Slot pieno", description: `Limite pizze superato per le ${order.scheduledTime}`, variant: "destructive" });
        return;
      }
    }

    if (total === 0 && order.type !== 'tavolo') {
      toast({ title: "Ordine vuoto", description: "Aggiungi almeno un articolo", variant: "destructive" });
      return;
    }

    const payload = {
      type: order.type!,
      scheduledTime: order.scheduledTime,
      tableNumber: order.tableNumber,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerAddress: order.customerAddress,
      pizzas: order.pizzas,
      panini: order.panini,
      contorni: order.contorni,
      bevande: order.bevande,
      notes: order.notes,
      total,
      deliveryFee,
      coperto: copertoTotal,
      coperti: order.coperti,
      cutPizzas: order.cutPizzas,
    };

    if (editId) {
      replaceOrder(editId, payload);
      toast({ title: "Ordine aggiornato" });
      setLocation(`/ordine/${editId}`);
      return;
    }

    const newOrder = saveOrder(payload);
    toast({ title: "Ordine creato", description: `Progressivo #${newOrder.progressiveNumber}` });
    setLocation(`/ordine/${newOrder.id}`);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center gap-4 border-b pb-4">
        <Button variant="ghost" size="icon" onClick={() => {
          if (editId) {
            setLocation(`/ordine/${editId}`);
            return;
          }
          step > 1 ? setStep(s => (s - 1) as Step) : setLocation('/');
        }}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-2xl font-serif font-bold">
          {editId ? "Modifica Ordine" : (
            <>
              {step === 1 && "Nuovo Ordine - Tipo"}
              {step === 2 && "Dettagli Ordine"}
              {step === 3 && "Componi Ordine"}
            </>
          )}
        </h2>
      </div>

      {step === 1 && !editId && (
        <div className="grid md:grid-cols-3 gap-6 pt-8">
          <Card className="hover-elevate cursor-pointer border-border hover:border-primary/50 transition-all text-center p-8 group" onClick={() => handleTypeSelect('domicilio')}>
            <CardContent className="space-y-4">
              <div className="mx-auto bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Truck className="h-10 w-10 text-primary" />
              </div>
              <h3 className="font-serif text-2xl font-bold">Domicilio</h3>
            </CardContent>
          </Card>
          <Card className="hover-elevate cursor-pointer border-border hover:border-primary/50 transition-all text-center p-8 group" onClick={() => handleTypeSelect('asporto')}>
            <CardContent className="space-y-4">
              <div className="mx-auto bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Store className="h-10 w-10 text-primary" />
              </div>
              <h3 className="font-serif text-2xl font-bold">Asporto</h3>
            </CardContent>
          </Card>
          <Card className="hover-elevate cursor-pointer border-border hover:border-primary/50 transition-all text-center p-8 group" onClick={() => handleTypeSelect('tavolo')}>
            <CardContent className="space-y-4">
              <div className="mx-auto bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Users className="h-10 w-10 text-primary" />
              </div>
              <h3 className="font-serif text-2xl font-bold">Tavolo</h3>
            </CardContent>
          </Card>
        </div>
      )}

      {step === 2 && (
        <div className="max-w-xl mx-auto space-y-6 pt-8">
          {order.type === 'domicilio' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nome Cliente *</Label>
                <Input value={order.customerName || ''} onChange={e => setOrder(prev => ({ ...prev, customerName: e.target.value }))} className="h-12" />
              </div>
              <div className="space-y-2">
                <Label>Telefono</Label>
                <Input value={order.customerPhone || ''} onChange={e => setOrder(prev => ({ ...prev, customerPhone: e.target.value }))} className="h-12" type="tel" />
              </div>
              <div className="space-y-2">
                <Label>Indirizzo *</Label>
                <Input value={order.customerAddress || ''} onChange={e => setOrder(prev => ({ ...prev, customerAddress: e.target.value }))} className="h-12" />
              </div>
              <div className="space-y-2">
                <Label>Orario *</Label>
                <Select
                  value={order.scheduledTime}
                  onValueChange={v => setOrder(prev => ({ ...prev, scheduledTime: v }))}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Seleziona orario" />
                  </SelectTrigger>
                  <SelectContent>
                    {deliverySlots.map(slot => (
                      <SelectItem
                        key={slot.time}
                        value={slot.time}
                        disabled={slot.full}
                        className="flex justify-between w-full bg-[#0f0f0f] hover:bg-[#1a1a1a]"
                      >
                        <span>{slot.time}</span>
                        <span
                          className={`text-xs ml-4 ${
                            slot.full ? "text-red-500 font-bold" : "text-muted-foreground"
                          }`}
                        >
                          ({slot.pizzaCount}/9 pizze)
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {order.type === 'asporto' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nome Cliente *</Label>
                <Input value={order.customerName || ''} onChange={e => setOrder(prev => ({ ...prev, customerName: e.target.value }))} className="h-12" />
              </div>
              <div className="space-y-2">
                <Label>Telefono</Label>
                <Input value={order.customerPhone || ''} onChange={e => setOrder(prev => ({ ...prev, customerPhone: e.target.value }))} className="h-12" type="tel" />
              </div>
              <div className="space-y-2">
                <Label>Orario *</Label>
                <Select
                  value={order.scheduledTime}
                  onValueChange={v => setOrder(prev => ({ ...prev, scheduledTime: v }))}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Seleziona orario" />
                  </SelectTrigger>
                  <SelectContent>
                    {deliverySlots.map(slot => (
                      <SelectItem
                        key={slot.time}
                        value={slot.time}
                        disabled={slot.full}
                        className="flex justify-between w-full bg-[#0f0f0f] hover:bg-[#1a1a1a]"
                      >
                        <span>{slot.time}</span>
                        <span
                          className={`text-xs ml-4 ${
                            slot.full ? "text-red-500 font-bold" : "text-muted-foreground"
                          }`}
                        >
                          ({slot.pizzaCount}/9 pizze)
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {order.type === 'tavolo' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Numero Coperti *</Label>
                <Input
                  type="number"
                  min={1}
                  value={order.coperti ?? ''}
                  onChange={e => setOrder(prev => ({ ...prev, coperti: e.target.value === '' ? undefined : Number(e.target.value) }))}
                  className="h-12 text-xl font-bold"
                />
                <p className="text-xs text-muted-foreground">Usato per il calcolo del coperto (€{COPERTO.toFixed(2)} a persona)</p>
              </div>
              <div className="space-y-2">
                <Label>Numero Tavolo (Opzionale)</Label>
                <Input
                  type="number"
                  value={order.tableNumber ?? ''}
                  onChange={e => setOrder(prev => ({ ...prev, tableNumber: e.target.value === '' ? undefined : Number(e.target.value) }))}
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label>Nome Cliente *</Label>
                <Input value={order.customerName || ''} onChange={e => setOrder(prev => ({ ...prev, customerName: e.target.value }))} className="h-12" />
              </div>
            </div>
          )}

          <div className="pt-4">
            <Button onClick={handleNextStep2} className="w-full h-12 text-lg font-bold">
              Continua <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <div className="flex-1 w-full bg-card border rounded-lg overflow-hidden">
            <Tabs defaultValue="pizze" className="w-full">
              <TabsList className="w-full justify-start h-14 sm:h-16 rounded-none border-b bg-muted/50 p-0 overflow-x-auto flex-nowrap">
                <TabsTrigger value="pizze" className="h-full px-3 sm:px-6 text-xs sm:text-sm data-[state=active]:bg-background rounded-none border-r whitespace-nowrap"><Pizza className="mr-1.5 sm:mr-2 h-4 w-4" /> Pizze</TabsTrigger>
                <TabsTrigger value="panini" className="h-full px-3 sm:px-6 text-xs sm:text-sm data-[state=active]:bg-background rounded-none border-r whitespace-nowrap"><Sandwich className="mr-1.5 sm:mr-2 h-4 w-4" /> Panini</TabsTrigger>
                <TabsTrigger value="contorni" className="h-full px-3 sm:px-6 text-xs sm:text-sm data-[state=active]:bg-background rounded-none border-r whitespace-nowrap"><UtensilsCrossed className="mr-1.5 sm:mr-2 h-4 w-4" /> Stuzzicherie</TabsTrigger>
                <TabsTrigger value="bevande" className="h-full px-3 sm:px-6 text-xs sm:text-sm data-[state=active]:bg-background rounded-none whitespace-nowrap"><Beer className="mr-1.5 sm:mr-2 h-4 w-4" /> Bevande</TabsTrigger>
              </TabsList>

              <div className="p-3 sm:p-4 h-[55vh] lg:h-[60vh] overflow-y-auto">
                <TabsContent value="pizze" className="m-0 space-y-6">
                  {(['tradizionali', 'speciali', 'dicasa', 'focaccia_calzone'] as const).map(cat => {
                    const items = ALL_MENU[cat] || [];
                    if (!items.length) return null;
                    return (
                      <div key={cat}>
                        <h4 className="font-serif text-lg font-bold text-primary mb-3">{CATEGORY_LABELS[cat]}</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {items.map((item: MenuItem) => (
                            <Button key={item.id} variant="outline" className="h-auto py-3 justify-start flex-col items-start gap-1" onClick={() => addLine(item, 'pizzas')}>
                              <span className="font-bold">{item.name}</span>
                              <span className="text-xs text-muted-foreground">€{item.price.toFixed(2)}</span>
                            </Button>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </TabsContent>

                <TabsContent value="panini" className="m-0 space-y-6">
                  {(['panini', 'paninazzi'] as const).map(cat => {
                    const items = ALL_MENU[cat] || [];
                    if (!items.length) return null;
                    return (
                      <div key={cat}>
                        <h4 className="font-serif text-lg font-bold text-primary mb-3">{CATEGORY_LABELS[cat]}</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {items.map((item: MenuItem) => (
                            <Button key={item.id} variant="outline" className="h-auto py-3 justify-start flex-col items-start gap-1 text-left whitespace-normal" onClick={() => addLine(item, 'panini')}>
                              <span className="font-bold">{item.name}</span>
                              <span className="text-xs text-muted-foreground">€{item.price.toFixed(2)}</span>
                            </Button>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </TabsContent>

                <TabsContent value="contorni" className="m-0 space-y-6">
                  {(['contorni', 'stuzzicherie', 'bruschette', 'piattiunici'] as const).map(cat => {
                    const items = ALL_MENU[cat] || [];
                    if (!items.length) return null;
                    return (
                      <div key={cat}>
                        <h4 className="font-serif text-lg font-bold text-primary mb-3">{CATEGORY_LABELS[cat]}</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {items.map((item: MenuItem) => (
                            <Button key={item.id} variant="outline" className="h-auto py-3 justify-start flex-col items-start gap-1 text-left whitespace-normal" onClick={() => addLine(item, 'contorni')}>
                              <span className="font-bold">{item.name}</span>
                              <span className="text-xs text-muted-foreground">€{item.price.toFixed(2)}</span>
                            </Button>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </TabsContent>

                <TabsContent value="bevande" className="m-0 space-y-6">
                  {(['bevande', 'birre'] as const).map(cat => {
                    const items = ALL_MENU[cat] || [];
                    if (!items.length) return null;
                    return (
                      <div key={cat}>
                        <h4 className="font-serif text-lg font-bold text-primary mb-3">{CATEGORY_LABELS[cat]}</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {items.map((item: MenuItem) => (
                            <Button key={item.id} variant="outline" className="h-auto py-3 justify-start flex-col items-start gap-1" onClick={() => addLine(item, 'bevande')}>
                              <span className="font-bold">{item.name}</span>
                              <span className="text-xs text-muted-foreground">€{item.price.toFixed(2)}</span>
                            </Button>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </TabsContent>
              </div>
            </Tabs>
          </div>

          <div className="w-full lg:w-96 bg-card border rounded-lg p-4 lg:sticky lg:top-24 flex flex-col lg:h-[calc(100vh-8rem)]">
            <h3 className="font-serif text-xl font-bold mb-4 flex justify-between items-center">
              <span>Riepilogo</span>
              <Badge variant="outline" className="text-primary border-primary/30 bg-primary/10">
                {order.type?.toUpperCase()}
              </Badge>
            </h3>

            <div className="flex-1 lg:overflow-y-auto space-y-4 pr-1 sm:pr-2 scrollbar-thin">
              {(['pizzas', 'panini', 'contorni', 'bevande'] as const).map(group => {
                const lines = order[group] as OrderLine[];
                if (!Array.isArray(lines) || !lines.length) return null;

                const groupLabels: Record<string, string> = {
                  pizzas: "Pizze", panini: "Panini", contorni: "Stuzzicherie", bevande: "Bevande"
                };

                return (
                  <div key={group} className="space-y-2">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{groupLabels[group]}</h4>
                    {lines.map(line => (
                      <div key={line.id} className="bg-muted/30 p-2 rounded border border-border/50">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <div className="flex flex-col items-center bg-background rounded border">
                              <button className="px-2 py-0.5 text-muted-foreground hover:text-foreground" onClick={() => updateLine(group, line.id, { quantity: line.quantity + 1 })}>+</button>
                              <span className="font-bold text-sm leading-none py-1">{line.quantity}</span>
                              <button className="px-2 py-0.5 text-muted-foreground hover:text-foreground" onClick={() => line.quantity > 1 ? updateLine(group, line.id, { quantity: line.quantity - 1 }) : removeLine(group, line.id)}>-</button>
                            </div>
                            <div>
                              <span className="font-bold text-sm flex items-center gap-1">
                                {line.name}
                                {line.note && line.note.trim() && <span className="text-destructive">⚠</span>}
                              </span>
                              <div className="text-xs text-muted-foreground">€{(line.price * line.quantity).toFixed(2)}</div>
                            </div>
                          </div>
                          <button className="text-muted-foreground hover:text-destructive text-xs" onClick={() => removeLine(group, line.id)}>✕</button>
                        </div>

                        {(group === 'pizzas' || group === 'panini') && (
                          <Input
                            placeholder={line.category === 'paninazzi' ? "Note (es. senza cipolla, aggiunte...)" : "Note"}
                            className="h-8 text-xs bg-background"
                            value={line.note || ''}
                            onChange={e => updateLine(group, line.id, { note: e.target.value })}
                          />
                        )}

                        {group === 'pizzas' && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {AGGIUNTE_PIZZA.map(agg => {
                              const isAdded = (line.note || "").includes(`+ ${agg.name}`);
                              return (
                                <Badge
                                  key={agg.name}
                                  variant={isAdded ? "default" : "outline"}
                                  className="text-[10px] cursor-pointer px-1.5 py-0"
                                  onClick={() => toggleAggiunta(line.id, agg.name, agg.price)}
                                >
                                  {isAdded && <Check className="h-3 w-3 mr-1" />}
                                  {agg.name} (+€{agg.price.toFixed(2)})
                                </Badge>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )
              })}

              <div className="space-y-2 pt-2">
                <div className="mb-4">
                  <label className="flex items-center justify-between p-4 rounded-lg border border-border bg-[#0f0f0f] cursor-pointer hover:border-primary transition">
                    <span className="text-lg font-semibold text-primary">Pizze tagliate</span>
                    <input
                      type="checkbox"
                      checked={order.cutPizzas || false}
                      onChange={(e) => setOrder(prev => ({ ...prev, cutPizzas: e.target.checked }))}
                      className="h-6 w-6 accent-primary cursor-pointer"
                    />
                  </label>
                </div>

                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Note Aggiuntive (Opzionale)</Label>
                <Textarea
                  placeholder="Note generali sull'ordine"
                  className="text-sm bg-background min-h-20"
                  value={order.notes || ''}
                  onChange={e => setOrder(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>
            </div>

            <div className="pt-4 mt-4 border-t space-y-2">
              {(() => {
                const hasGeneralNote = (order.notes || '').trim().length > 0;
                const hasLineNote = [...order.pizzas, ...order.panini].some(l => (l.note || '').trim().length > 0);
                return (hasGeneralNote || hasLineNote) ? (
                  <div className="bg-destructive/10 border-2 border-destructive rounded-md p-2 text-center font-bold text-destructive uppercase tracking-wider text-sm animate-pulse">
                    ⚠ Attenzione Ricalcola ⚠
                  </div>
                ) : null;
              })()}
              {deliveryFee > 0 && (
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Consegna ({pizzeCount} pizze)</span>
                  <span>€{deliveryFee.toFixed(2)}</span>
                </div>
              )}
              {copertoTotal > 0 && (
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Coperto ({order.coperti} pers.)</span>
                  <span>€{copertoTotal.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-serif text-2xl font-bold text-primary">
                <span>Totale</span>
                <span>€{total.toFixed(2)}</span>
              </div>
              <Button onClick={handleSubmit} className="w-full h-12 text-lg font-bold mt-2 shadow-lg shadow-primary/20">
                {editId ? "Salva Modifiche" : "Conferma Ordine"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
