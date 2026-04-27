export function OrderTypeCards() {
  const items = [
    { title: "Domicilio", count: 0, text: "Nessun ordine a domicilio" },
    { title: "Asporto", count: 0, text: "Nessun ordine da asporto" },
    { title: "Tavolo", count: 0, text: "Nessun ordine al tavolo" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-6 py-6">
      {items.map((item) => (
        <div
          key={item.title}
          className="p-5 rounded-xl border border-border bg-[#0f0f0f]"
        >
          <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
          <p className="text-secondary text-3xl font-bold mt-2">{item.count}</p>
          <p className="text-mutedlight mt-1">{item.text}</p>
        </div>
      ))}
    </div>
  );
}
