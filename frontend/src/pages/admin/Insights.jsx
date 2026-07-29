import { useEffect, useState } from "react";
import api from "@/lib/api";
import {
  Eye, MessageSquare, TrendingUp, Gauge, Smartphone, MousePointerClick,
  Facebook, Instagram, Plus,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, BarChart, Bar,
} from "recharts";

const PALETTE = ["#A9784E", "#1C1B1A", "#C9A27A", "#7A6A55", "#E5DCCF", "#D8B98C"];

const fmtMs = (n) => (!n ? "—" : n >= 1000 ? `${(n / 1000).toFixed(1)}s` : `${n} ms`);

const Card = ({ children, className = "", ...p }) => (
  <div className={`bg-white border border-border rounded-lg p-5 ${className}`} {...p}>{children}</div>
);

const Stat = ({ label, value, sub, icon: Icon }) => (
  <Card data-testid={`insight-stat-${label}`} className="hover:shadow-sm hover:-translate-y-[1px] transition-all">
    <div className="flex items-center justify-between">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
      <Icon className="h-4 w-4 text-primary" />
    </div>
    <div className="text-3xl font-bold mt-3">{value}</div>
    {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
  </Card>
);

const Panel = ({ title, note, children, testid }) => (
  <Card data-testid={testid}>
    <div className="flex items-center justify-between mb-4">
      <h2 className="font-semibold text-sm">{title}</h2>
      {note && <span className="text-xs text-muted-foreground">{note}</span>}
    </div>
    {children}
  </Card>
);

const EmptyHint = () => <p className="text-sm text-muted-foreground py-8 text-center">No data yet — insights fill in as visitors browse the site.</p>;

export default function Insights() {
  const [d, setD] = useState(null);

  useEffect(() => { api.get("/insights").then((r) => setD(r.data)).catch(() => setD(false)); }, []);

  if (d === null) return <div className="text-muted-foreground" data-testid="insights-loading">Loading insights…</div>;
  if (d === false) return <div className="text-muted-foreground">Could not load insights.</div>;

  const stats = [
    { label: "Total Views", value: (d.total_views || 0).toLocaleString(), sub: `${d.total_clicks || 0} clicks tracked`, icon: Eye },
    { label: "Inquiries", value: (d.total_inquiries || 0).toLocaleString(), sub: `${d.total_forms || 0} form submissions`, icon: MessageSquare },
    { label: "Conversion", value: `${d.conversion || 0}%`, sub: "views → inquiries", icon: TrendingUp },
    { label: "Avg Page Load", value: fmtMs(d.avg_load_ms), sub: `mobile ${fmtMs(d.mobile_load_ms)}`, icon: Gauge },
    { label: "Mobile Traffic", value: `${d.mobile_pct || 0}%`, sub: "of all page views", icon: Smartphone },
    { label: "Lead → Client", value: `${d.lead_to_client || 0}%`, sub: `${d.clients || 0} active clients`, icon: MousePointerClick },
  ];

  return (
    <div data-testid="insights-page">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Website Insights</h1>
        <p className="text-muted-foreground mt-1">How visitors find, browse, and convert on your site.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {stats.map((s) => <Stat key={s.label} {...s} />)}
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        <div className="lg:col-span-2">
          <Panel title="Page views" note="last 14 days" testid="panel-views-trend">
            {d.views_trend?.length ? (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={d.views_trend} margin={{ left: -18, right: 8, top: 6 }}>
                  <defs>
                    <linearGradient id="v" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#A9784E" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#A9784E" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v?.slice(5)} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={38} />
                  <Tooltip />
                  <Area type="monotone" dataKey="views" stroke="#A9784E" strokeWidth={2} fill="url(#v)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : <EmptyHint />}
          </Panel>
        </div>
        <Panel title="Device split" testid="panel-device">
          {d.device_split?.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={d.device_split} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3}>
                  {d.device_split.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <EmptyHint />}
          <div className="flex justify-center gap-4 mt-2">
            {d.device_split?.map((x, i) => (
              <span key={x.name} className="text-xs text-muted-foreground flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: PALETTE[i % PALETTE.length] }} />{x.name} · {x.value}
              </span>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        <Panel title="Top sources" note="where visitors come from" testid="panel-sources">
          {d.top_sources?.length ? (
            <div className="space-y-2">
              {d.top_sources.map((s) => {
                const max = d.top_sources[0].visits || 1;
                return (
                  <div key={s.source}>
                    <div className="flex justify-between text-sm mb-1"><span className="truncate">{s.source}</span><span className="text-muted-foreground">{s.visits}</span></div>
                    <div className="h-2 rounded-full bg-secondary overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: `${(s.visits / max) * 100}%` }} /></div>
                  </div>
                );
              })}
            </div>
          ) : <EmptyHint />}
        </Panel>

        <Panel title="Scroll depth" note="how far visitors read" testid="panel-scroll">
          {d.scroll_funnel?.some((x) => x.count) ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={d.scroll_funnel} margin={{ left: -20, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
                <XAxis dataKey="depth" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={38} />
                <Tooltip />
                <Bar dataKey="count" fill="#C9A27A" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyHint />}
        </Panel>

        <Panel title="Inquiry types" note="what people ask about" testid="panel-inquiry-types">
          {d.inquiry_types?.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={d.inquiry_types} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={85} label={(e) => e.type}>
                  {d.inquiry_types.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <EmptyHint />}
        </Panel>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        <Panel title="Most viewed pages" testid="panel-most-viewed">
          {d.most_viewed_pages?.length ? (
            <ul className="divide-y divide-border text-sm">
              {d.most_viewed_pages.map((p) => (
                <li key={p.page} className="flex justify-between py-2.5"><span className="truncate">{p.page}</span><span className="text-muted-foreground">{p.views} views</span></li>
              ))}
            </ul>
          ) : <EmptyHint />}
        </Panel>
        <Panel title="Top clicks" note="most-clicked buttons" testid="panel-top-clicks">
          {d.top_clicks?.length ? (
            <ul className="divide-y divide-border text-sm">
              {d.top_clicks.map((c) => (
                <li key={c.label} className="flex justify-between py-2.5"><span className="truncate">{c.label}</span><span className="text-muted-foreground">{c.count}</span></li>
              ))}
            </ul>
          ) : <EmptyHint />}
        </Panel>
      </div>

      {/* Social integrations — placeholders */}
      <h2 className="text-lg font-semibold mt-8 mb-3">Social insights</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {[
          { name: "Facebook", icon: Facebook, color: "#1877F2", copy: "Connect your Facebook Page to pull reach, followers, and post engagement here." },
          { name: "Instagram", icon: Instagram, color: "#E1306C", copy: "Connect Instagram to track followers, profile visits, and top-performing posts." },
        ].map((s) => (
          <Card key={s.name} data-testid={`social-${s.name.toLowerCase()}-card`} className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="h-12 w-12 rounded-full flex items-center justify-center text-white" style={{ background: s.color }}>
                <s.icon className="h-6 w-6" />
              </span>
              <div>
                <p className="font-semibold">{s.name}</p>
                <p className="text-xs text-muted-foreground max-w-xs mt-0.5">{s.copy}</p>
              </div>
            </div>
            <button disabled data-testid={`connect-${s.name.toLowerCase()}-btn`}
              className="inline-flex items-center gap-1.5 text-sm border border-border px-4 py-2 rounded-md text-muted-foreground opacity-70 cursor-not-allowed">
              <Plus className="h-4 w-4" /> Connect
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}
