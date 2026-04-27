export function CapacityCard() {
  const slots = ["19:00", "19:30", "20:00", "20:30", "21:00"];

  return (
    <div className="mx-6 p-5 rounded-xl border border-border bg-[#0f0f0f]">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Capacità Domicilio (Pizze)
      </h3>

      <div className="grid grid-cols-3 gap-3">
        {slots.map((slot) => (
          <div
            key={slot}
            className="flex flex-col items-center justify-center p-3 rounded-lg border border-border bg-background"
          >
            <span className="text-mutedlight">{slot}</span>
            <span className="text-secondary font-bold">0/9</span>
          </div>
        ))}
      </div>
    </div>
  );
}
