import { MenuItem } from "@/types";

type Props = {
  item: MenuItem;
  onAdd: (item: MenuItem) => void;
};

export function MenuItemCard({ item, onAdd }: Props) {
  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <div className="font-bold text-lg">{item.name}</div>
      <div className="text-sm text-gray-600">{item.description}</div>
      <div className="mt-2 font-semibold">€ {item.price.toFixed(2)}</div>

      <button
        onClick={() => onAdd(item)}
        className="mt-3 bg-black text-white px-3 py-1 rounded"
      >
        Aggiungi
      </button>
    </div>
  );
}
