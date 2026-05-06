import type { Order } from "../types/order";

export async function sendOrderToPrinter(order: Order) {
  const text = generateReceiptText(order);
  const finalText = text + "\n\n\n" + text + "\n\n\n\n{cut:full}";

  const encoded = encodeURIComponent(finalText);
  const url = `rawbt:print?data=${encoded}`;

  const iframe = document.createElement("iframe");
  iframe.style.display = "none";
  iframe.src = url;
  document.body.appendChild(iframe);

  setTimeout(() => document.body.removeChild(iframe), 1000);
  return true;
}

// ------------------------------------------------------------
// STAMPA COMPLETA — TUTTI I DATI VISIBILI NELLA SCHEDA
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

  // NOME E INDIRIZZO
  if (order.name) text += `Nome: ${order.name}\n`;
  if (order.address) text += `Indirizzo: ${order.address}\n`;

  // TAVOLO E COPERTI
  if (order.table) text += `Tavolo: ${order.table}    Coperti: ${order.coperti || 1}\n`;

  text += "------------------------------------------------\n";

  // SEZIONI
  const addLines = (title: string, items: any[]) => {
    if (!items || items.length === 0) return;
    text += `\n${title}\n`;
    items.forEach((l) => {
      const qty = `${l.quantity}×`.padEnd(4);
      const name = l.name.padEnd(28);
      const price = l.price ? `€${l.price.toFixed(2)}` : "";
      text += `${qty}${name}${price.padStart(10)}\n`;
      if (l.note) text += `  Note: ${l.note}\n`;
    });
  };

  addLines("PIZZE", order.pizzas);
  addLines("PANINI", order.panini);
  addLines("STUZZICHERIE", order.contorni);
  addLines("BEVANDE", order.bevande);

  // ALERT RICALCOLA
  const mustRecalc =
    order.showRecalcAlert === true ||
    order.recalc === true ||
    order.alert === true ||
    (order.notes && order.notes.toLowerCase().includes("ricalcola"));

  if (mustRecalc) {
    text += "\n";
    text += "⚠⚠⚠ ATTENZIONE RICALCOLA ⚠⚠⚠\n";
    text += "------------------------------------------------\n";
  }

  // NOTE AGGIUNTIVE
  if (order.notes) {
    text += "\nNOTE AGGIUNTIVE:\n";
    text += `${order.notes}\n`;
  }

  // COPERTO E CONSEGNA
  if (order.coperti) text += `\nCoperto €${(order.coperti * 1).toFixed(2)}\n`;
  if (order.deliveryCost) text += `Consegna €${order.deliveryCost.toFixed(2)}\n`;

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
