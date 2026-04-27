import { Order } from "@/types";

type Props = {
  order: Order;
};

export function OrderCard({ order }: Props) {
  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <div className="font-bold text-lg">{order.name}</div>
      <div className="text-sm text-gray-600">{order.time}</div>

      <div className="mt-2">
        {order.items.map((item, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span>{item.name}</span>
            <span>x{item.qty}</span>
          </div>
        ))}
      </div>

      <div className="mt-3 font-semibold">
        Totale: € {order.total.toFixed(2)}
      </div>
    </div>
  );
}
