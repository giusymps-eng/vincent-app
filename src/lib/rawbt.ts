import type { Order } from "../types";

/* ------------------------------------------------------------
   RAWBT FALSO → serve solo per abilitare il pulsante STAMPA
------------------------------------------------------------ */
// @ts-ignore
window.RawBT = {
  print: (data: string) => wifiPrint(data),
  ready: true
};

/* ------------------------------------------------------------
   ESC/POS CONSTANTS
------------------------------------------------------------ */
const ESC = "\x1B";
const INIT = ESC + "@";
const FONT_LARGE = ESC + "!\x38";
const FONT_NORMAL = ESC + "!\x00";
const ALIGN_LEFT = ESC + "a" + "\x00";
const FEED = ESC + "d" + "\x05";

/* ------------------------------------------------------------
   STAMPA COMANDA UNICA (CUCINA)
------------------------------------------------------------ */
export async function sendOrderToPrinter(order: Order) {
  const text = generateKitchenOnly(order);

  const job =
    INIT +
    ALIGN_LEFT +
    FONT_LARGE +
    "VINCENT'S PUB\n" +
    FONT_NORMAL +
    text +
    FEED +
    "\x1D\x56\x00"; // CUT

  await window.RawBT.print(job);
  return true;
}

/* ------------------------------------------------------------
   STAMPA DIRETTA VIA TCP/IP (MUNBYN)
------------------------------------------------------------ */
async function wifiPrint(data: string) {
  const ip = "192.168.1.130"; // <-- IL TUO IP
  const port = 9100;

  return new Promise((resolve, reject) => {
    try {
      // @ts-ignore (plugin Android WebView TCP)
      const socket = new window.Socket();

      socket.connect(
        port,
        ip,
        () => {
          socket.write(data);
          socket.close();
          resolve(true);
        }
      );

      socket.onError((err: any) => reject(err));
    } catch (e) {
      reject(e);
    }
  });
}

/* ------------------------------------------------------------
   GENERA COMANDA UNICA
------------------------------------------------------------ */
function generateKitchenOnly(order: Order) {
  let text = "";

  text += "========================================\n";
  text += `COMANDA #${order.progressiveNumber}\n`;
  text += `${order.type?.toUpperCase() || "ORDINE"}\n`;

  if (order.scheduledTime) {
    text += `ORARIO: ${order.scheduledTime}\n`;
  }

  text += "----------------------------------------\n";

  const legacy = order as any;
  const customerName = order.customerName || legacy.name;
  const customerPhone = order.customerPhone || legacy.phone;
  const customerAddress = order.customerAddress || legacy.address;

  if (customerName) text += `Nome: ${customerName}\n`;
  if (customerPhone) text += `Tel: ${customerPhone}\n`;
  if (customerAddress) text += `Indirizzo: ${customerAddress}\n`;

  text += "----------------------------------------\n";

  text += buildSections(order);

  if (order.pizzas?.length > 0) {
    text += "\n";
    text += order.cutPizzas || (order as any).pizzeTagliate
      ? "✓ PIZZE TAGLIATE\n"
      : "□ Pizze NON tagliate\n";
  }

  if (order.notes) {
    text += "\nNOTE AGGIUNTIVE:\n";
    text += `${order.notes}\n`;
  }

  text += "\n";
  return text;
}

/* ------------------------------------------------------------
   SEZIONI
------------------------------------------------------------ */
function buildSections(order: Order) {
  let text = "";

  const addSection = (
    title: string,
    items: Array<{ name: string; quantity: number; note?: string }>
  ) => {
    if (!items || items.length === 0) return;

    text += `\n${title}\n`;

    items.forEach(item => {
      text += `${item.quantity}× ${item.name}\n`;
      if (item.note) text += `  Note: ${item.note}\n`;
    });
  };

  addSection("PIZZE", order.pizzas);
  addSection("PANINI", order.panini);
  addSection("STUZZICHERIE", order.contorni);
  addSection("BEVANDE", order.bevande);

  return text;
}
