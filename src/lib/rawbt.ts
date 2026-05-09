import type { Order } from "../types";

/* ------------------------------------------------------------
   FUNZIONE DI STAMPA — RAWBT-SAFE + GRAFICA STILE A
------------------------------------------------------------ */
export async function sendOrderToPrinter(order: Order) {
  const salaText = generateReceiptText(order);

  const cucinaOrder = structuredClone(order);
  (cucinaOrder as any).isKitchenCopy = true;

  const zero = (arr?: any[]) => arr?.forEach(i => i.price = 0);
  zero(cucinaOrder.pizzas);
  zero(cucinaOrder.panini);
  zero(cucinaOrder.contorni);
  zero(cucinaOrder.bevande);

  cucinaOrder.coperto = 0;
  cucinaOrder.deliveryFee = 0;
  cucinaOrder.total = 0;

  const cucinaText = generateReceiptText(cucinaOrder);

  const finalText =
    salaText +
    "\n\n\n" +
    cucinaText +
    "\n\n\n\n" +
    "\x1DVA0"; // TAGLIO CARTA ESC/POS

  // Codifica RAWBT-SAFE
  const safeEncode = (str: string) =>
    encodeURIComponent(str)
      .replace(/%20/g, " ")
      .replace(/%0A/g, "\n")
      .replace(/%1B/g, "\x1B");

  const encoded = safeEncode(finalText);
  const url = `rawbt:print?data=${encoded}`;

  const iframe = document.createElement("iframe");
  iframe.style.display = "none";
  iframe.src = url;
  document.body.appendChild(iframe);

  setTimeout(() => iframe.remove(), 1000);

  return true;
}

/* ------------------------------------------------------------
   GENERAZIONE TESTO — STILE A (PULITO, PROFESSIONALE)
------------------------------------------------------------ */
function generateReceiptText(order: Order) {
  let text = "";

  // HEADER
  text += "================================================\n";
  text += center("VINCENT'S PUB");
  text += "================================================\n\n";

  // TITOLO
  text += center(`COMANDA #${order.progressiveNumber}`);
  text += "------------------------------------------------\n";

  // TIPO + ORARIO
  const tipo = order.type?.toUpperCase() || "ORDINE";
  const orario = order.scheduledTime ? `Orario: ${order.scheduledTime}` : "";

  if ((order as any).isKitchenCopy) text += "\x1B!\x38";
  text += `${tipo.padEnd(12)} ${orario}\n`;
  if ((order as any).isKitchenCopy) text += "\x1B!\x00";

  // DATI CLIENTE
  const legacy = order as any;
  const customerName = order.customerName || legacy.name;
  const customerPhone = order.customerPhone || legacy.phone;
  const customerAddress = order.customerAddress || legacy.address;

  if (customerName) text += `Nome: ${customerName}\n`;
  if (customerPhone) text += `Tel: ${customerPhone}\n`;
  if (customerAddress) text += `Indirizzo: ${customerAddress}\n`;

  if (order.status) text += `Stato: ${order.status}\n`;

  text += "------------------------------------------------\n";

  // SEZIONI
  const addLines = (title: string, items: any[]) => {
    if (!items || items.length === 0) return;

    const isKitchen = (order as any).isKitchenCopy;

    if (isKitchen) text += "\x1B!\x38";
    text += `\n${title}\n`;
    if (isKitchen) text += "\x1B!\x00";

    items.forEach((l) => {
      const qty = `${l.quantity}×`.padEnd(4);
      const name = l.name.padEnd(28);
      const price = isKitchen ? "" : (l.price ? `€${(l.price * l.quantity).toFixed(2)}` : "");

      text += `${qty}${name}${price.padStart(10)}\n`;

      if (l.note) text += `  Note: ${l.note}\n`;
    });
  };

  addLines("PIZZE", order.pizzas);
  addLines("PANINI", order.panini);
  addLines("STUZZICHERIE", order.contorni);
  addLines("BEVANDE", order.bevande);

  // TAGLIO PIZZE
  if (order.pizzas.length > 0) {
    if (order.cutPizzas || (order as any).pizzeTagliate) {
      text += "\n✓ PIZZE TAGLIATE\n";
    } else {
      text += "\n□ Pizze NON tagliate\n";
    }
  }

  // NOTE AGGIUNTIVE
  if (order.notes) {
    text += "\nNOTE AGGIUNTIVE:\n";
    text += `${order.notes}\n`;
  }

  // SOLO SALA → totale
  if (!(order as any).isKitchenCopy) {
    text += "\n================================================\n";
    text += center("ATTENZIONE RICALCOLA");

    text += `Coperto €${order.coperto.toFixed(2)}\n`;

    if (order.deliveryFee !== undefined) {
      text += `Consegna €${order.deliveryFee.toFixed(2)}\n`;
    }

    text += "================================================\n";
    text += center(`TOTALE €${order.total.toFixed(2)}`);
  }

  text += "\n\n";

  return text;
}

/* ------------------------------------------------------------
   CENTRATURA
------------------------------------------------------------ */
function center(value: string, width = 48) {
  const text = value || "";
  if (text.length >= width) return text + "\n";

  const padding = width - text.length;
  const left = Math.floor(padding / 2);
  const right = padding - left;

  return " ".repeat(left) + text + " ".repeat(right) + "\n";
}
