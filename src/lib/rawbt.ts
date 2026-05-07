import type { Order } from "../types";

export async function sendOrderToPrinter(order: Order) {
  // --- COPIA SALA ---
  const salaText = generateReceiptText(order);

  // --- COPIA CUCINA ---
  const cucinaOrder = structuredClone(order);

  // Flag per dire alla stampa che è copia cucina
  (cucinaOrder as any).isKitchenCopy = true;

  // Azzeriamo i prezzi (non verranno comunque mostrati)
  const zeroPrice = (items?: any[]) => {
    if (!items) return;
    items.forEach(i => i.price = 0);
  };

  zeroPrice(cucinaOrder.pizzas);
  zeroPrice(cucinaOrder.panini);
  zeroPrice(cucinaOrder.contorni);
  zeroPrice(cucinaOrder.bevande);

  cucinaOrder.coperto = 0;
  cucinaOrder.deliveryFee = 0;
  cucinaOrder.total = 0;

  const cucinaText = generateReceiptText(cucinaOrder);

  // --- STAMPA FINALE ---
  const finalText =
    salaText + "\n\n\n" +
    cucinaText + "\n\n\n\n{cut:full}";

  const encoded = encodeURIComponent(finalText);
  const url = `rawbt:print?data=${encoded}`;

  const iframe = document.createElement("iframe");
  iframe.style.display = "none";
  iframe.src = url;
  document.body.appendChild(iframe);

  setTimeout(() => {
    document.body.removeChild(iframe);
  }, 1000);

  return true;
}


// ------------------------------------------------------------
// STAMPA COMPLETA — RIPRODUCE LA SCHEDA DELL’ORDINE
// ------------------------------------------------------------
function generateReceiptText(order: Order) {
  let text = "";

  // LOGO TESTUALE
  text += "================================================\n";
  text += center("VINCENT'S PUB");
  text += "================================================\n\n";

  // TITOLO COMANDA
  text += center(`COMANDA #${order.progressiveNumber}`);
  text += "------------------------------------------------\n";

  // TIPO ORDINE + ORARIO
 const tipo = order.type?.toUpperCase() || "ORDINE";
const orario = order.scheduledTime ? `Orario: ${order.scheduledTime}` : "";

if ((order as any).isKitchenCopy === true) {
  text += "\x1B!\x38"; // testo grande
}

text += `${tipo} ${orario}\n`;

if ((order as any).isKitchenCopy === true) {
  text += "\x1B!\x00"; // torna normale
}

  const legacyOrder = order as any;
  const customerName = order.customerName || legacyOrder.name;
  const customerPhone = order.customerPhone || legacyOrder.phone;
  const customerAddress = order.customerAddress || legacyOrder.address;

  // CLIENTE, TELEFONO, INDIRIZZO
  if (customerName) text += `Nome: ${customerName}\n`;
  if (customerPhone) text += `Tel: ${customerPhone}\n`;
  if (customerAddress) text += `Indirizzo: ${customerAddress}\n`;

  // TAVOLO / ORARIO / COPERTI
  if (order.type === "tavolo") {
    if (order.tableNumber) {
      text += `Tavolo: ${order.tableNumber}    Coperti: ${order.coperti || 1}\n`;
    } else {
      text += `Coperti: ${order.coperti || 1}\n`;
    }
  } else if (order.scheduledTime) {
    text += `Orario: ${order.scheduledTime}\n`;
  }

  if (order.status) {
    text += `Stato: ${order.status}\n`;
  }

  text += "------------------------------------------------\n";
// SEZIONI
const addLines = (title: string, items: any[]) => {
  if (!items || items.length === 0) return;

  const isKitchen = (order as any).isKitchenCopy === true;
  // Testo grande per la cucina
if (isKitchen) {
  text += "\x1B!\x38"; // doppia altezza + doppia larghezza
}

  text += `\n${title}\n`;

  items.forEach((l) => {
    const qty = `${l.quantity}×`.padEnd(4);
    const name = l.name.padEnd(28);

    // 👉 NIENTE PREZZI SE È COPIA CUCINA
    const price = isKitchen
      ? ""
      : (l.price ? `€${(l.price * l.quantity).toFixed(2)}` : "");

    text += `${qty}${name}${price.padStart(10)}\n`;

    if (l.note) text += `  Note: ${l.note}\n`;
  });
};


  addLines("PIZZE", order.pizzas);
  addLines("PANINI", order.panini);
  addLines("STUZZICHERIE", order.contorni);
  addLines("BEVANDE", order.bevande);

  const hasPizzas = order.pizzas.length > 0;
  const hasNotes = !!order.notes?.trim();
  const hasLineNotes = [...order.pizzas, ...order.panini, ...order.contorni, ...order.bevande].some(
    (line) => (line.note || "").trim().length > 0,
  );

  if (hasPizzas) {
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

  text += "\n";
  if ((order as any).isKitchenCopy === true) {
  text += "ATTENZIONE RICALCOLA\n";
} else {
  text += center("ATTENZIONE RICALCOLA");
}

  if (order.coperto !== undefined) {
    text += `\nCoperto €${order.coperto.toFixed(2)}\n`;
  }

  if (order.deliveryFee !== undefined) {
    text += `Consegna €${order.deliveryFee.toFixed(2)}\n`;
  } else if ((order as any).deliveryCost !== undefined) {
    text += `Consegna €${((order as any).deliveryCost as number).toFixed(2)}\n`;
  }


  text += "================================================\n";

  // RICALCOLA IL TOTALE
  const totalStr = `Ricalcola il TOTALE €${order.total.toFixed(2)}`;
  if ((order as any).isKitchenCopy === true) {
  text += totalStr + "\n";
} else {
  text += center(totalStr);
}

  // SPAZIO EXTRA PER STRAPPO
  text += "\n\n\n\n";
  // 🔥 TORNA AL TESTO NORMALE SE È COPIA CUCINA
  if ((order as any).isKitchenCopy === true) {
    text += "\x1B!\x00";
}
  return text;
}

// CENTRATURA TESTO
function center(str: string) {
  const totalWidth = 48;
  const padding = Math.floor((totalWidth - str.length) / 2);
  return " ".repeat(padding) + str + "\n";
}
