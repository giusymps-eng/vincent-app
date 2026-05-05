import type { Order } from "@/types";

const RAWBT_API = process.env.VITE_RAWBT_API || "http://localhost:3000/api";
const PRINTER_NAME = "lan_printer";
const PRINTER_DRIVER = "esc_general";

export async function sendOrderToPrinter(order: Order): Promise<void> {
  try {
    const response = await fetch(`${RAWBT_API}/print`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        printer: PRINTER_NAME,
        driver: PRINTER_DRIVER,
        order: {
          id: order.id,
          progressiveNumber: order.progressiveNumber,
          type: order.type,
          tableNumber: order.tableNumber,
          coperti: order.coperti,
          scheduledTime: order.scheduledTime,
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          customerAddress: order.customerAddress,
          pizzas: order.pizzas,
          panini: order.panini,
          contorni: order.contorni,
          bevande: order.bevande,
          notes: order.notes,
          cutPizzas: order.cutPizzas,
          deliveryFee: order.deliveryFee,
          coperto: order.coperto,
          total: order.total,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Errore stampa: ${response.statusText}`);
    }
  } catch (error) {
    console.error("RawBT Print Error:", error);
    throw error instanceof Error ? error : new Error("Errore di comunicazione con la stampante");
  }
}
