import type { Order } from "../types";

export async function sendOrderToPrinter(order: Order) {
  const text = generateReceiptText(order);

  // Doppia copia + righe extra + taglio carta
  const finalText = text + "\n\n\n" + text + "\n\n\n\n{cut:full}";

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
  text += `${tipo} ${orario}\n`;

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
    text += `\n${title}\n`;
    items.forEach((l) => {
      const qty = `${l.quantity}×`.padEnd(4);
      const name = l.name.padEnd(28);
      const price = l.price ? `€${(l.price * l.quantity).toFixed(2)}` : "";
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

  const mustRecalc = hasNotes || hasLineNotes;

  if (mustRecalc) {
    text += "\n";
    text += "⚠⚠⚠ ATTENZIONE RICALCOLA ⚠⚠⚠\n";
    text += "------------------------------------------------\n";
  }

  if (order.notes) {
    text += "\nNOTE AGGIUNTIVE:\n";
    text += `${order.notes}\n`;
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

  // TOTALE
  const totalStr = `TOTALE €${order.total.toFixed(2)}`;
  text += center(totalStr);

  // SPAZIO EXTRA PER STRAPPO
  text += "\n\n\n\n";

  return text;
}

// CENTRATURA TESTO
function center(str: string) {
  const totalWidth = 48;
  const padding = Math.floor((totalWidth - str.length) / 2);
  return " ".repeat(padding) + str + "\n";
}
