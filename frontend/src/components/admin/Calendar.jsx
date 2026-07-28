import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MO = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const pad = (n) => String(n).padStart(2, "0");

export default function Calendar({ sessions = [] }) {
  const [cursor, setCursor] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const year = cursor.getFullYear(), month = cursor.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = new Date().toISOString().slice(0, 10);

  const byDate = {};
  sessions.forEach((s) => { (byDate[s.date] = byDate[s.date] || []).push(s); });
  Object.values(byDate).forEach((arr) => arr.sort((a, b) => (a.time || "").localeCompare(b.time || "")));

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  const move = (delta) => setCursor(new Date(year, month + delta, 1));

  return (
    <div data-testid="calendar">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => move(-1)} data-testid="cal-prev" className="p-2 rounded-md hover:bg-secondary"><ChevronLeft className="h-4 w-4" /></button>
        <div className="font-semibold" data-testid="cal-month">{MO[month]} {year}</div>
        <button onClick={() => move(1)} data-testid="cal-next" className="p-2 rounded-md hover:bg-secondary"><ChevronRight className="h-4 w-4" /></button>
      </div>
      <div className="grid grid-cols-7 gap-px bg-border border border-border rounded-lg overflow-hidden">
        {WD.map((w) => <div key={w} className="bg-secondary/70 text-center text-[11px] uppercase tracking-wide text-muted-foreground py-2">{w}</div>)}
        {cells.map((d, i) => {
          if (d === null) return <div key={i} className="bg-white min-h-[92px]" />;
          const ds = `${year}-${pad(month + 1)}-${pad(d)}`;
          const day = byDate[ds] || [];
          const isToday = ds === todayStr;
          return (
            <div key={i} className="bg-white min-h-[92px] p-1.5" data-testid={`cal-day-${ds}`}>
              <div className={`text-xs mb-1 inline-flex items-center justify-center h-6 w-6 rounded-full ${isToday ? "bg-primary text-primary-foreground font-semibold" : "text-muted-foreground"}`}>{d}</div>
              <div className="space-y-1">
                {day.slice(0, 3).map((s) => (
                  <div key={s.id} title={`${s.client_name} ${s.time || ""}`} className="text-[11px] leading-tight bg-primary/10 text-primary rounded px-1.5 py-0.5 truncate">
                    {s.time && <span className="font-medium">{s.time}</span>} {s.client_name}
                  </div>
                ))}
                {day.length > 3 && <div className="text-[10px] text-muted-foreground px-1">+{day.length - 3} more</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
