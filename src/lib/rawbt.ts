import type { Order } from "../types";

const ESC = "\x1B";
const INIT_PRINTER = ESC + "@";
const FONT_NORMAL = ESC + "!\x00";
const FONT_LARGE = ESC + "!\x38";

/* ------------------------------------------------------------
   STAMPA ORDINE: copia sala + copia cucina
------------------------------------------------------------ */
export async function sendOrderToPrinter(order: Order) {
  const salaText = generateReceiptText(order, false);

  const cucinaOrder = structuredClone(order);
  (cucinaOrder as any).isKitchenCopy = true;
  zeroPrices(cucinaOrder);
  cucinaOrder.coperto = 0;
  cucinaOrder.deliveryFee = 0;
  cucinaOrder.total = 0;

  const cucinaText = generateReceiptText(cucinaOrder, true);

  const job =
    INIT_PRINTER +
    salaText +
    "\n\n\n" +
    INIT_PRINTER +
    cucinaText +
    "\n{cut:full}";

  await rawbtPrint(job);
  return true;
}

function zeroPrices(order: Order) {
  const zero = (items?: Array<{ price: number }>) =>
    items?.forEach(item => item.price = 0);

  zero(order.pizzas);
  zero(order.panini);
  zero(order.contorni);
  zero(order.bevande);
}

/* ------------------------------------------------------------
   INVIO RAWBT
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
   GENERA TESTO COMANDA (SALA / CUCINA)
------------------------------------------------------------ */
function generateReceiptText(order: Order, isKitchen: boolean) {
  let text = "";

  text += "================================================\n";
  text += center("VINCENT'S PUB");
  text += "================================================\n\n";

  if (isKitchen) {
    text += FONT_LARGE;
    text += center(`COMANDA #${order.progressiveNumber}`);
    text += center("CUCINA");
    text += FONT_NORMAL;
  } else {
    text += center(`COMANDA #${order.progressiveNumber}`);
  }

  text += "------------------------------------------------\n";

  const tipo = order.type?.toUpperCase() || "ORDINE";
  const orario = order.scheduledTime ? `Orario: ${order.scheduledTime}` : "";
  text += `${tipo.padEnd(12)} ${orario}`.trim() + "\n";

  const legacy = order as any;
  const customerName = order.customerName || legacy.name;
  const customerPhone = order.customerPhone || legacy.phone;
  const customerAddress = order.customerAddress || legacy.address;

  if (customerName) text += `Nome: ${customerName}\n`;
  if (customerPhone) text += `Tel: ${customerPhone}\n`;
  if (customerAddress) text += `Indirizzo: ${customerAddress}\n`;
  if (order.status) text += `Stato: ${order.status}\n`;

  text += "------------------------------------------------\n";

  text += buildSections(order, isKitchen);

  if (!isKitchen) {
    text += "\n================================================\n";
    text += center("ATTENZIONE RICALCOLA");
    if (order.coperto !== undefined) {
      text += `Coperto €${order.coperto.toFixed(2)}\n`;
    }
    if (order.deliveryFee !== undefined) {
      text += `Consegna €${order.deliveryFee.toFixed(2)}\n`;
    }
    text += "================================================\n";
    text += center(`TOTALE €${order.total.toFixed(2)}`);
  }

  text += "\n";
  return text;
}

/* ------------------------------------------------------------
   SEZIONI COMANDA
------------------------------------------------------------ */
function buildSections(order: Order, isKitchen: boolean) {
  let text = "";

  const addSection = (title: string, items: Array<{ name: string; quantity: number; price: number; note?: string; }>) => {
    if (!items || items.length === 0) return;

    text += `\n${title}\n`;

    items.forEach(item => {
      const qty = `${item.quantity}×`.padEnd(4);
      const name = item.name.padEnd(28);
      const priceText = isKitchen ? "" : item.price ? `€${(item.price * item.quantity).toFixed(2)}` : "";
      text += `${qty}${name}${priceText.padStart(10)}\n`;
      if (item.note) text += `  Note: ${item.note}\n`;
    });
  };

  addSection("PIZZE", order.pizzas);
  addSection("PANINI", order.panini);
  addSection("STUZZICHERIE", order.contorni);
  addSection("BEVANDE", order.bevande);

  if (order.pizzas.length > 0) {
    text += "\n";
    text += order.cutPizzas || (order as any).pizzeTagliate ? "✓ PIZZE TAGLIATE\n" : "□ Pizze NON tagliate\n";
  }

  if (order.notes) {
    text += "\nNOTE AGGIUNTIVE:\n";
    text += `${order.notes}\n`;
  }

  return text;
}

/* ------------------------------------------------------------
   FUNZIONE DI CENTRATURA
------------------------------------------------------------ */
function center(value: string, width = 48) {
  const text = value || "";
  if (text.length >= width) return text + "\n";

  const padding = width - text.length;
  const left = Math.floor(padding / 2);
  const right = padding - left;

  return " ".repeat(left) + text + " ".repeat(right) + "\n";
}
