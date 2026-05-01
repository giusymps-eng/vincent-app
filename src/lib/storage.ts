import { useEffect, useState, useCallback } from "react";
import type { Order, OrderType, OrderStatus } from "@/types";
import {
  MAX_PIZZAS_PER_SLOT,
  DELIVERY_START_HOUR,
  DELIVERY_END_HOUR,
} from "@/types";

const ORDERS_KEY = "vincent.orders.v1";
const COUNTER_KEY = "vincent.counter.v1";

interface CounterState {
  date: string;
  next: number;
}

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function readOrders(): Order[] {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Order[];
  } catch {
    return [];
  }
}

function writeOrders(orders: Order[]) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  window.dispatchEvent(new Event("vincent:orders-changed"));
}

function getNextProgressive(): number {
  const today = todayKey();
  try {
    const raw = localStorage.getItem(COUNTER_KEY);
    const state: CounterState | null = raw ? JSON.parse(raw) : null;
    if (!state || state.date !== today) {
      const next: CounterState = { date: today, next: 2 };
      localStorage.setItem(COUNTER_KEY, JSON.stringify(next));
      return 1;
    }
    const current = state.next;
    state.next += 1;
    localStorage.setItem(COUNTER_KEY, JSON.stringify(state));
    return current;
  } catch {
    return 1;
  }
}

export function useOrders(): Order[] {
  const [orders, setOrders] = useState<Order[]>(() => readOrders());

  useEffect(() => {
    const refresh = () => setOrders(readOrders());
    window.addEventListener("vincent:orders-changed", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("vincent:orders-changed", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  return orders;
}

export function useTodayOrders(): Order[] {
  const all = useOrders();
  const today = todayKey();
  return all.filter((o) => o.createdAt.slice(0, 10) === today);
}

export function saveOrder(
  order: Omit<Order, "id" | "createdAt" | "progressiveNumber" | "status"> & {
    status?: OrderStatus;
  },
): Order {
  const now = new Date().toISOString();
  const newOrder: Order = {
    ...order,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: now,
    progressiveNumber: getNextProgressive(),
    status: order.status ?? "in_preparazione",
  };
  const all = readOrders();
  all.push(newOrder);
  writeOrders(all);
  return newOrder;
}

export function updateOrder(id: string, patch: Partial<Order>) {
  const all = readOrders();
  const idx = all.findIndex((o) => o.id === id);
  if (idx === -1) return;
  all[idx] = { ...all[idx], ...patch };
  writeOrders(all);
}

export function updateOrderStatus(id: string, status: OrderStatus) {
  updateOrder(id, { status });
}

export function markOrderPrinted(id: string) {
  updateOrder(id, { printed: true, printedAt: new Date().toISOString() });
}

export function getOrderById(id: string): Order | undefined {
  return readOrders().find((o) => o.id === id);
}

export function replaceOrder(
  id: string,
  data: Omit<Order, "id" | "createdAt" | "progressiveNumber" | "status" | "printed" | "printedAt">,
) {
  const all = readOrders();
  const idx = all.findIndex((o) => o.id === id);
  if (idx === -1) return;
  all[idx] = {
    ...all[idx],
    ...data,
  };
  writeOrders(all);
}

export function deleteOrder(id: string) {
  const all = readOrders().filter((o) => o.id !== id);
  writeOrders(all);
}

export function generateDeliverySlots(): string[] {
  const slots: string[] = [];
  for (let h = DELIVERY_START_HOUR; h < DELIVERY_END_HOUR; h++) {
    for (let m = 0; m < 60; m += 15) {
      slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  slots.push(`${DELIVERY_END_HOUR}:00`);
  return slots;
}

export function generateAsportoSlots(): string[] {
  const slots: string[] = [];
  for (let h = 18; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  return slots;
}

export interface SlotInfo {
  time: string;
  pizzaCount: number;
  remaining: number;
  full: boolean;
  orderIds: string[];
}

export function getDeliverySlotsInfo(orders: Order[]): SlotInfo[] {
  const today = todayKey();
  const slots = generateDeliverySlots();
  const todayOrders = orders.filter(
    (o) =>
      (o.type === "domicilio" || o.type === "asporto") &&
      o.createdAt.slice(0, 10) === today &&
      o.status !== "annullato",
  );
  return slots.map((time) => {
    const matching = todayOrders.filter((o) => o.scheduledTime === time);
    const pizzaCount = matching.reduce(
      (acc, o) => acc + o.pizzas.reduce((a, p) => a + p.quantity, 0),
      0,
    );
    return {
      time,
      pizzaCount,
      remaining: Math.max(0, MAX_PIZZAS_PER_SLOT - pizzaCount),
      full: pizzaCount >= MAX_PIZZAS_PER_SLOT,
      orderIds: matching.map((o) => o.id),
    };
  });
}

export function canFitInSlot(
  orders: Order[],
  time: string,
  newPizzas: number,
  excludeOrderId?: string,
): { ok: boolean; remaining: number } {
  const today = todayKey();
  const matching = orders.filter(
    (o) =>
      (o.type === "domicilio" || o.type === "asporto") &&
      o.createdAt.slice(0, 10) === today &&
      o.status !== "annullato" &&
      o.scheduledTime === time &&
      o.id !== excludeOrderId,
  );
  const used = matching.reduce(
    (acc, o) => acc + o.pizzas.reduce((a, p) => a + p.quantity, 0),
    0,
  );
  const remaining = MAX_PIZZAS_PER_SLOT - used;
  return { ok: newPizzas <= remaining, remaining };
}

export function useDeliverySlots(): SlotInfo[] {
  const orders = useOrders();
  return getDeliverySlotsInfo(orders);
}

export function useCanFitInSlot() {
  const orders = useOrders();
  return useCallback(
    (time: string, newPizzas: number, excludeOrderId?: string) =>
      canFitInSlot(orders, time, newPizzas, excludeOrderId),
    [orders],
  );
}

export function clearAllToday() {
  const today = todayKey();
  const all = readOrders().filter((o) => o.createdAt.slice(0, 10) !== today);
  writeOrders(all);
  localStorage.removeItem(COUNTER_KEY);
}

export type { OrderType };
