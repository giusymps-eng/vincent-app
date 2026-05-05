import type { Order } from "@/types";

export async function sendOrderToPrinter(order: Order) {
  return new Promise((resolve, reject) => {
    try {
      const ws = new WebSocket("ws://192.168.1.55:40213");

      ws.onopen = () => {
        const text = generateReceiptText(order);

        const payload = {
          type: "text",
          data: text
        };

        ws.send(JSON.stringify(payload));
        ws.close();
        resolve(true);
      };

      ws.onerror = (err) => {
        console.error("Errore WebSocket:", err);
        reject(err);
      };
    } catch (error) {
      reject(error);
    }
  });
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
