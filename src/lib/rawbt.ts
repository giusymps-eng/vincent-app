import type { Order } from "../types";

/* ------------------------------------------------------------
   STAMPA SALA + AVVIO STAMPA CUCINA
------------------------------------------------------------ */
export async function sendOrderToPrinter(order: Order) {
  const salaText = generateReceiptSala(order);

  // 1) STAMPA SALA
  await rawbtPrint(salaText);

  // 2) PAUSA per permettere alla stampante Wi‑Fi di chiudere il buffer
  await new Promise(r => setTimeout(r, 1200));

  // 3) RESET HARDWARE (importantissimo per Wi‑Fi)
  await rawbtPrint("\x1B@\n");

  // 4) PAUSA dopo reset
  await new Promise(r => setTimeout(r, 600));

  // 5) STAMPA CUCINA
  await sendKitchenCopy(order);

  return true;
}

/* ------------------------------------------------------------
   STAMPA CUCINA (SEPARATA)
------------------------------------------------------------ */
async function sendKitchenCopy(order: Order) {
  const cucinaOrder = structuredClone(order);
  (cucinaOrder as any).isKitchenCopy = true;

  // Rimuovi prezzi
  const zero = (arr?: any[]) => arr?.forEach(i => i.price = 0);
  zero(cucinaOrder.pizzas);
  zero(cucinaOrder.panini);
  zero(cucinaOrder.contorni);
  zero(cucinaOrder.bevande);

  cucinaOrder.coperto = 0;
  cucinaOrder.deliveryFee = 0;
  cucinaOrder.total = 0;

  const cucinaText = generateReceiptCucina(cucinaOrder);
  await rawbtPrint(cucinaText);
}

/* ------------------------------------------------------------
   FUNZIONE DI INVIO A RAWBT
------------------------------------------------------------ */
async function rawbtPrint(text: string) {
  const safeEncode = (str: string) =>
    encodeURIComponent(str)
      .replace(/%20/g, " ")
      .replace(/%0A/g, "\n")
      .replace(/%1B/g, "\x1B");

  const encoded = safeEncode(text);
  const url = `rawbt:print?data=${encoded}`;

  const iframe = document.createElement("iframe");
  iframe.style.display = "none";
  iframe.src = url;
  document.body.appendChild(iframe);

  return new Promise(resolve =>
    setTimeout(() => {
      iframe.remove();
      resolve(true);
    }, 800)
  );
}

/* ------------------------------------------------------------
   GENERAZIONE TESTO — SALA
------------------------------------------------------------ */
function generateReceiptSala(order: Order) {
  let text = "";

  text += "================================================\n";
  text += center("VINCENT'S PUB");
  text += "================================================\n\n";

  text += center(`COMANDA #${order.progressiveNumber}`);
  text += "------------------------------------------------\n";

  const tipo = order.type?.toUpperCase() || "ORDINE";
  const orario = order.scheduledTime ? `Orario: ${order.scheduledTime}` : "";
  text += `${tipo.padEnd(12)} ${orario}\n`;

  const legacy = order as any;
  const customerName = order.customerName || legacy.name;
  const customerPhone = order.customerPhone || legacy.phone;
  const customerAddress = order.customerAddress || legacy.address;

  if (customerName) text += `Nome: ${customerName}\n`;
  if (customerPhone) text += `Tel: ${customerPhone}\n`;
  if (customerAddress) text += `Indirizzo: ${customerAddress}\n`;
  if (order.status) text += `Stato: ${order.status}\n`;

  text += "------------------------------------------------\n";

  text += buildSections(order, false);

  text += "\n================================================\n";
  text += center("ATTENZIONE RICALCOLA");
  text += `Coperto €${order.coperto.toFixed(2)}\n`;

  if (order.deliveryFee !== undefined) {
    text += `Consegna €${order.deliveryFee.toFixed(2)}\n`;
  }

  text += "================================================\n";
  text += center(`TOTALE €${order.total.toFixed(2)}`);

  text += "\n\n{cut:full}\n";

  return text;
}

/* ------------------------------------------------------------
   GENERAZIONE TESTO — CUCINA
------------------------------------------------------------ */
function generateReceiptCucina(order: Order) {
  let text = "";

  text += "================================================\n";
  text += center("VINCENT'S PUB");
  text += "================================================\n\n";

  text += center(`COMANDA #${order.progressiveNumber}`);
  text += "------------------------------------------------\n";

  const tipo = order.type?.toUpperCase() || "ORDINE";
  const orario = order.scheduledTime ? `Orario: ${order.scheduledTime}` : "";

  text += "\n================================================\n";
  text += center(`${tipo} — ${orario}`);
  text += "================================================\n\n";

  const legacy = order as any;
  const customerName = order.customerName || legacy.name;
  const customerPhone = order.customerPhone || legacy.phone;
  const customerAddress = order.customerAddress || legacy.address;

  if (customerName) text += `Nome: ${customerName}\n`;
  if (customerPhone) text += `Tel: ${customerPhone}\n`;
  if (customerAddress) text += `Indirizzo: ${customerAddress}\n`;
  if (order.status) text += `Stato: ${order.status}\n`;

  text += "------------------------------------------------\n";

  text += buildSections(order, true);

  text += "\n\n{cut:full}\n";

  return text;
}

/* ------------------------------------------------------------
   SEZIONI
------------------------------------------------------------ */
function buildSections(order: Order, isKitchen: boolean) {
  let text = "";

  const add = (title: string, items: any[]) => {
    if (!items || items.length === 0) return;

    text += `\n${title}\n`;

    items.forEach((l) => {
      const qty = `${l.quantity}×`.padEnd(4);
      const name = l.name.padEnd(28);
      const price = isKitchen ? "" : (l.price ? `€${(l.price * l.quantity).toFixed(2)}` : "");

      text += `${qty}${name}${price}\n`;

      if (l.note) text += `  Note: ${l.note}\n`;
    });
  };

  add("PIZZE", order.pizzas);
  add("PANINI", order.panini);
  add("STUZZICHERIE", order.contorni);
  add("BEVANDE", order.bevande);

  if (order.pizzas.length > 0) {
    if (order.cutPizzas || (order as any).pizzeTagliate) {
      text += "\n✓ PIZZE TAGLIATE\n";
    } else {
      text += "\n□ Pizze NON tagliate\n";
    }
  }

  if (order.notes) {
    text += "\nNOTE AGGIUNTIVE:\n";
    text += `${order.notes}\n`;
  }

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
