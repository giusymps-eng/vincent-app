import type { Order } from "../types/order";

export async function sendOrderToPrinter(order: Order) {
  const text = generateReceiptText(order);

  // Doppia copia
  const finalText = text + "\n\n\n" + text + "{cut}";

  const encoded = encodeURIComponent(finalText);
  const url = `rawbt:print?data=${encoded}`;

  // Workaround Chrome: iframe invisibile
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
// 80mm LAYOUT + LOGO TESTUALE + TAGLIO CARTA + DOPPIA COPIA
// ------------------------------------------------------------

function generateReceiptText(order: Order) {
  let text = "";

  // LOGO TESTUALE (centrato)
  text += "================================================\n";
  text += center("VINCENT'S PUB");
  text += "================================================\n\n";

  // Titolo comanda
  text += center(`COMANDA #${order.progressiveNumber}`);
  text += "------------------------------------------------\n";

  // Info ordine
  if (order.type === "tavolo") {
    text += `TAVOLO ${order.tableNumber || ""}   Coperti: ${order.coperti || 1}\n`;
  } else {
    text += `Asporto - Orario: ${order.scheduledTime}\n`;
  }

  if (order.name) {
    text += `Nome: ${order.name}\n`;
  }

  text += "------------------------------------------------\n";

  // Funzione per allineare quantità, nome e prezzo
  const addLines = (title: string, items: any[]) => {
    if (!items || items.length === 0) return;

    text += `\n${title}\n`;

    items.forEach((l) => {
      const qty = `${l.quantity}×`.padEnd(4);
      const name = l.name.padEnd(30);
      const price = l.price ? `€${l.price.toFixed(2)}` : "";

      const line = `${qty}${name}${price.padStart(10)}`;
      text += line + "\n";

      if (l.note) text += `  Note: ${l.note}\n`;
    });
  };

  addLines("PIZZE", order.pizzas);
  addLines("PANINI", order.panini);
  addLines("STUZZICHERIE", order.contorni);
  addLines("BEVANDE", order.bevande);

  // Note generali
  if (order.notes) {
    text += `\nNOTE:\n${order.notes}\n`;
  }

  // Coperto
  if (order.coperti) {
    text += `\nCoperto €${(order.coperti * 1).toFixed(2)}\n`;
  }

  text += "------------------------------------------------\n";

  // Totale centrato
  const totalStr = `TOTALE €${order.total.toFixed(2)}`;
  text += center(totalStr);

  text += "\n\n\n";

  return text;
}

// Funzione per centrare testo su 48 caratteri
function center(str: string) {
  const totalWidth = 48;
  const padding = Math.floor((totalWidth - str.length) / 2);
  return " ".repeat(padding) + str + "\n";
}
