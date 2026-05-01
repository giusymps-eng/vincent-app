export type OrderType = "domicilio" | "asporto" | "tavolo";

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: MenuCategory;
  glutenFree?: boolean;
  frozen?: boolean;
}

export type MenuCategory =
  | "tradizionali"
  | "speciali"
  | "dicasa"
  | "focaccia_calzone"
  | "panini"
  | "paninazzi"
  | "stuzzicherie"
  | "bruschette"
  | "piattiunici"
  | "contorni"
  | "bevande"
  | "birre";

export interface OrderLine {
  id: string;
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  note?: string;
  category: MenuCategory;
}

export type OrderStatus = "in_preparazione" | "pronto" | "consegnato" | "annullato";

export interface Order {
  id: string;
  type: OrderType;
  createdAt: string;
  /** For domicilio and asporto: ISO time in HH:mm */
  scheduledTime?: string;
  /** For tavolo */
  tableNumber?: number;
  /** Progressive number per service day (used for tavolo display) */
  progressiveNumber: number;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  pizzas: OrderLine[];
  panini: OrderLine[];
  contorni: OrderLine[];
  bevande: OrderLine[];
  notes?: string;
  status: OrderStatus;
  total: number;
  deliveryFee?: number;
  coperto?: number;
  coperti?: number;
  printed?: boolean;
  printedAt?: string;
  cutPizzas?: boolean;
}

export interface DeliverySlot {
  /** HH:mm */
  time: string;
  pizzaCount: number;
  remaining: number;
  orderIds: string[];
}

export const MAX_PIZZAS_PER_SLOT = 10;
export const DELIVERY_START_HOUR = 19;
export const DELIVERY_END_HOUR = 23;
