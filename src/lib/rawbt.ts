import type { Order } from "@/types";

export async function sendOrderToPrinter(order: Order) {
  const text = generateReceiptText(order);
  const encoded = encodeURIComponent(text);

  // RawBT protocol
  const url = `rawbt:print?data=${encoded}`;

  // Apertura compatibile con Android
  setTimeout(() => {
    window.open(url, "_self");
  }, 100);

  return true;
}

function generateReceiptText(order: Order) {
  let text = "";

  text += `COMANDA #${order.progressiveNumber}\n`;
  text += `Tipo: ${order.type}\n`;

  if (order.type === "tavolo") {
    text += order.tableNumber
      ? `Tavolo: ${order.tableNumber}\n`
      : `Coperti: ${order.coperti || 1}\n`;
  } else {
    text += `Orario: ${order.scheduledTime}\n`;
  }

  text += "-----------------------------\n";

  const addLines = (title: string, items: any[]) => {
    if (items.length === 0) return;
    text += `\n${title}\n`;
    items.forEach((l) => {
      text += `${l.quantity} × ${l.name}\n`;
      if (l.note) text += `  Note: ${l.note}\n`;
    });
  };

  addLines("PIZZE", order.pizzas);
  addLines("PANINI", order.panini);
  addLines("STUZZICHERIE", order.contorni);
  addLines("BEVANDE", order.bevande);

  if (order.notes) {
    text += `\nNOTE AGGIUNTIVE:\n${order.notes}\n`;
  }

  text += "\n-----------------------------\n";
  text += `TOTALE: €${order.total.toFixed(2)}\n`;

  text += "\n\n\n";

  return text;
}
