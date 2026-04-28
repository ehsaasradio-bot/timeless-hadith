'use client';
// app/shop/admin/analytics/page.tsx
// WooCommerce-style revenue analytics with SVG line chart

import { useEffect, useState, useCallback, useRef } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Period {
  gross_revenue: number;
  refunds: number;
  coupons: number;
  taxes: number;
  shipping: number;
  net_revenue: number;
  order_count: number;
}

interface DailyStat {
  date: string;
  orders: number;
  gross_revenue: number;
  refunds: number;
  coupons: number;
  taxes: number;
  shipping: number;
  net_revenue: number;
}

interface AnalyticsData {
  current: Period;
  previous: Period;
  daily: DailyStat[];
  range: { from: string; to: string; prevFrom: string; prevTo: string };
}

// ─── Date range presets ───────────────────────────────────────────────────────

type RangeKey = 'last7' | 'last30' | 'last_month' | 'last90' | 'this_year';

function getRangeDates(key: RangeKey): { from: Date; to: Date; label: string } {
  const now   = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  switch (key) {
    case 'last7': {
      const f = new Date(today); f.setDate(f.getDate() - 6); f.setHours(0,0,0,0);
      return { from: f, to: today, label: 'Last 7 Days' };
    }
    case 'last30': {
      const f = new Date(today); f.setDate(f.getDate() - 29); f.setHours(0,0,0,0);
      return { from: f, to: today, label: 'Last 30 Days' };
    }
    case 'last_month': {
      const f = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const t = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
      return { from: f, to: t, label: `Last Month (${f.toLocaleDateString('en-US',{month:'short',day:'numeric'})} - ${t.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})})` };
    }
    case 'last90': {
      const f = new Date(today); f.setDate(f.getDate() - 89); f.setHours(0,0,0,0);
      return { from: f, to: today, label: 'Last 90 Days' };
    }
    case 'this_year': {
      const f = new Date(now.getFullYear(), 0, 1);
      return { from: f, to: today, label: `This Year (${now.getFullYear()})` };
    }
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt$ = (n: number) =>
  '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtDate = (iso: string) =>
  new Date(iso + 'T12:00:00').toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });

function pctChange(curr: number, prev: number): { pct: number | null; up: boolean } {
  if (prev === 0) return { pct: null, up: true };
  const pct = ((curr - prev) / prev) * 100;
  return { pct, up: pct >= 0 };
}

// ─── SVG Line Chart ───────────────────────────────────────────────────────────

function LineChart({ daily, metric, prevDays }: {
  daily: DailyStat[];
  metric: keyof DailyStat;
  prevDays: number;
}) {
  const svgRef  = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; val: number; date: string } | null>(null);

  const W = 820, H = 220, PL = 60, PR = 16, PT = 16, PB = 40;
  const iW = W - PL - PR;
  const iH = H - PT - PB;

  const values = daily.map(d => Number(d[metric]));
  const maxV   = Math.max(...values, 1);
  const minV   = 0;

  const xScale = (i: number) => PL + (i / Math.max(daily.length - 1, 1)) * iW;
  const yScale = (v: number) => PT + iH - ((v - minV) / (maxV - minV)) * iH;

  const points = daily.map((d, i) => `${xScale(i)},${yScale(Number(d[metric]))}`).join(' ');

  // Y-axis ticks
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(t => minV + t * (maxV - minV));

  // X-axis ticks — show ~6 evenly spaced dates
  const xTickCount = Math.min(6, daily.length);
  const xTickIndices = daily.length <= 6
    ? daily.map((_, i) => i)
    : Array.from({ length: xTickCount }, (_, i) => Math.round((i / (xTickCount - 1)) * (daily.length - 1)));

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || daily.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mx   = ((e.clientX - rect.left) / rect.width) * W;
    const idx  = Math.round(((mx - PL) / iW) * (daily.length - 1));
    const clamped = Math.max(0, Math.min(daily.length - 1, idx));
    const d    = daily[clamped];
    setTooltip({ x: xScale(clamped), y: yScale(Number(d[metric])), val: Number(d[metric]), date: d.date });
  };

  return (
    <div className="relative w-full overflow-x-auto">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ minWidth: 340 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTooltip(null)}
      >
        {/* Grid lines */}
        {yTicks.map((v, i) => (
          <g key={i}>
            <line x1={PL} x2={W - PR} y1={yScale(v)} y2={yScale(v)} stroke="#F0E8DC" strokeWidth="1" />
            <text x={PL - 6} y={yScale(v) + 4} textAnchor="end" fontSize="10" fill="#AAA">
              {v >= 1000 ? `$${(v/1000).toFixed(0)}k` : `$${v.toFixed(0)}`}
            </text>
          </g>
        ))}

        {/* X-axis labels */}
        {xTickIndices.map((idx) => (
          <text key={idx} x={xScale(idx)} y={H - 8} textAnchor="middle" fontSize="10" fill="#AAA">
            {new Date(daily[idx].date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </text>
        ))}

        {/* Area fill */}
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0D4A3C" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#0D4A3C" stopOpacity="0" />
          </linearGradient>
        </defs>
        {daily.length > 1 && (
          <polygon
            points={`${PL},${PT + iH} ${points} ${xScale(daily.length - 1)},${PT + iH}`}
            fill="url(#areaGrad)"
          />
        )}

        {/* Main line */}
        {daily.length > 1 && (
          <polyline points={points} fill="none" stroke="#0D4A3C" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        )}

        {/* Tooltip dot */}
        {tooltip && (
          <>
            <line x1={tooltip.x} x2={tooltip.x} y1={PT} y2={PT + iH} stroke="#E8DDD0" strokeWidth="1" strokeDasharray="4 3" />
            <circle cx={tooltip.x} cy={tooltip.y} r="5" fill="#0D4A3C" />
            <circle cx={tooltip.x} cy={tooltip.y} r="3" fill="white" />
          </>
        )}
      </svg>

      {/* Tooltip box */}
      {tooltip && (
        <div
          className="absolute pointer-events-none bg-[#1C1C1E] text-white text-[11px] px-3 py-2 rounded-lg shadow-lg z-10"
          style={{ left: `calc(${(tooltip.x / W) * 100}% + 8px)`, top: `${(tooltip.y / H) * 100}%`, transform: 'translateY(-50%)' }}
        >
          <div className="font-semibold">{fmt$(tooltip.val)}</div>
          <div className="text-white/50">{fmtDate(tooltip.date)}</div>
        </div>
      )}
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({ label, value, prev, secondary }: {
  label: string;
  value: number;
  prev: number;
  secondary?: string;
}) {
  const { pct, up } = pctChange(value, prev);
  return (
    <div className="bg-white border border-[#E8DDD0] p-5">
      <div className="text-[10px] font-semibold tracking-[0.12em] text-[#888] uppercase mb-2">{label}</div>
      <div className="flex items-end justify-between gap-2">
        <div className="text-[1.6rem] font-bold text-[#1C1C1E] tracking-tight leading-none">{fmt$(value)}</div>
        {pct !== null && (
          <div className={`flex items-center gap-0.5 text-[12px] font-bold pb-0.5 ${up ? 'text-[#0D4A3C]' : 'text-red-500'}`}>
            {up ? (
              <svg viewBox="0 0 10 10" width="10" height="10" fill="none">
                <path d="M5 8V2M2 5l3-3 3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg viewBox="0 0 10 10" width="10" height="10" fill="none">
                <path d="M5 2v6M2 5l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
            {Math.abs(pct).toFixed(0)}%
          </div>
        )}
        {pct === null && <div className="text-[12px] text-[#888] pb-0.5">→ 0%</div>}
      </div>
      <div className="text-[11px] text-[#AAA] mt-1.5">
        Previous {secondary ?? 'Period'}: {fmt$(prev)}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const RANGE_OPTIONS: { key: RangeKey; label: string }[] = [
  { key: 'last7',      label: 'Last 7 Days' },
  { key: 'last30',     label: 'Last 30 Days' },
  { key: 'last_month', label: 'Last Month' },
  { key: 'last90',     label: 'Last 90 Days' },
  { key: 'this_year',  label: 'This Year' },
];

type ChartMetric = 'gross_revenue' | 'net_revenue' | 'orders';

const CHART_OPTIONS: { key: ChartMetric; label: string }[] = [
  { key: 'gross_revenue', label: 'Gross Revenue' },
  { key: 'net_revenue',   label: 'Net Revenue' },
  { key: 'orders',        label: 'Orders' },
];

export default function AdminAnalyticsPage() {
  const [rangeKey, setRangeKey]     = useState<RangeKey>('last30');
  const [data, setData]             = useState<AnalyticsData | null>(null);
  const [loading, setLoading]       = useState(true);
  const [chartMetric, setChartMetric] = useState<ChartMetric>('gross_revenue');
  const [sortCol, setSortCol]       = useState<keyof DailyStat>('date');
  const [sortAsc, setSortAsc]       = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { from, to } = getRangeDates(rangeKey);
    const url = `/api/admin/analytics?from=${from.toISOString()}&to=${to.toISOString()}`;
    const res = await fetch(url);
    if (res.ok) setData(await res.json());
    setLoading(false);
  }, [rangeKey]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const rangeLabel = getRangeDates(rangeKey).label;
  const { from: prevFrom, to: prevTo } = data?.range ?? {};
  const prevLabel = prevFrom && prevTo
    ? `vs. Previous Period (${fmtDate(prevFrom)} - ${fmtDate(prevTo)})`
    : '';

  const sorted = [...(data?.daily ?? [])].sort((a, b) => {
    const av = a[sortCol], bv = b[sortCol];
    if (av < bv) return sortAsc ? -1 : 1;
    if (av > bv) return sortAsc ? 1 : -1;
    return 0;
  });

  const toggleSort = (col: keyof DailyStat) => {
    if (sortCol === col) setSortAsc(a => !a);
    else { setSortCol(col); setSortAsc(false); }
  };

  const SortIcon = ({ col }: { col: keyof DailyStat }) => (
    <span className={`ml-1 ${sortCol === col ? 'text-[#0D4A3C]' : 'text-[#CCC]'}`}>
      {sortCol === col ? (sortAsc ? '↑' : '↓') : '↕'}
    </span>
  );

  const c = data?.current;
  const p = data?.previous;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-[1.6rem] font-bold text-[#1C1C1E] tracking-tight">Analytics</h1>
          <p className="text-[13px] text-[#888] mt-0.5">{prevLabel}</p>
        </div>

        {/* Date range picker */}
        <div className="relative">
          <select
            value={rangeKey}
            onChange={e => setRangeKey(e.target.value as RangeKey)}
            className="appearance-none pl-4 pr-9 py-2.5 bg-white border border-[#E8DDD0] rounded-xl text-[13px] text-[#1C1C1E] font-medium focus:outline-none focus:ring-2 focus:ring-[#0D4A3C]/20 focus:border-[#0D4A3C] cursor-pointer"
          >
            {RANGE_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
          </select>
          <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#888]" viewBox="0 0 10 6" width="10" height="6" fill="none">
            <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><div className="w-7 h-7 border-2 border-[#0D4A3C] border-t-transparent rounded-full animate-spin"/></div>
      ) : (
        <>
          {/* KPI Cards grid — 3 cols top, 3 cols bottom like WooCommerce */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-[#E8DDD0] rounded-2xl overflow-hidden mb-6">
            <KpiCard label="Gross Revenue"  value={c?.gross_revenue ?? 0} prev={p?.gross_revenue ?? 0} secondary={rangeLabel} />
            <KpiCard label="Refunds"        value={c?.refunds       ?? 0} prev={p?.refunds       ?? 0} secondary={rangeLabel} />
            <KpiCard label="Coupons"        value={c?.coupons        ?? 0} prev={p?.coupons        ?? 0} secondary={rangeLabel} />
            <KpiCard label="Taxes"          value={c?.taxes          ?? 0} prev={p?.taxes          ?? 0} secondary={rangeLabel} />
            <KpiCard label="Shipping"       value={c?.shipping        ?? 0} prev={p?.shipping        ?? 0} secondary={rangeLabel} />
            <KpiCard label="Net Revenue"    value={c?.net_revenue    ?? 0} prev={p?.net_revenue    ?? 0} secondary={rangeLabel} />
          </div>

          {/* Chart card */}
          <div className="bg-white rounded-2xl border border-[#E8DDD0] mb-6 overflow-hidden">
            {/* Chart header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#F0E8DC] flex-wrap gap-3">
              <div className="flex items-center gap-4">
                {CHART_OPTIONS.map(o => (
                  <button key={o.key} onClick={() => setChartMetric(o.key)}
                    className={`text-[12px] font-semibold pb-0.5 border-b-2 transition-colors ${chartMetric === o.key ? 'border-[#0D4A3C] text-[#0D4A3C]' : 'border-transparent text-[#888] hover:text-[#555]'}`}>
                    {o.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-4 text-[11px] text-[#888]">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-[#0D4A3C] inline-block rounded"/>
                  {rangeLabel}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-[#E8DDD0] inline-block rounded"/>
                  Previous Period
                </span>
              </div>
            </div>

            {/* Chart summary row */}
            <div className="flex items-center gap-6 px-5 py-3 bg-[#FAF7F2] border-b border-[#F0E8DC] text-[12px] flex-wrap">
              <span className="font-bold text-[#1C1C1E]">
                {chartMetric === 'orders'
                  ? `${c?.order_count ?? 0} Orders`
                  : chartMetric === 'gross_revenue'
                  ? fmt$(c?.gross_revenue ?? 0)
                  : fmt$(c?.net_revenue ?? 0)}
              </span>
              <span className="text-[#888]">
                vs {chartMetric === 'orders'
                  ? `${p?.order_count ?? 0} Previous Period`
                  : chartMetric === 'gross_revenue'
                  ? fmt$(p?.gross_revenue ?? 0)
                  : fmt$(p?.net_revenue ?? 0)} previous period
              </span>
            </div>

            <div className="px-4 py-4">
              {data && data.daily.length > 0 ? (
                <LineChart
                  daily={data.daily}
                  metric={chartMetric === 'orders' ? 'orders' : chartMetric}
                  prevDays={0}
                />
              ) : (
                <div className="h-40 flex items-center justify-center text-[13px] text-[#888]">No data for this period.</div>
              )}
            </div>
          </div>

          {/* Revenue table */}
          <div className="bg-white rounded-2xl border border-[#E8DDD0] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#F0E8DC]">
              <h2 className="text-[14px] font-bold text-[#1C1C1E]">Revenue</h2>
              <button
                onClick={() => {
                  const header = 'Date,Orders,Gross Revenue,Refunds,Coupons,Taxes,Shipping,Net Revenue';
                  const rows = sorted.map(d =>
                    [d.date, d.orders, d.gross_revenue.toFixed(2), d.refunds.toFixed(2),
                     d.coupons.toFixed(2), d.taxes.toFixed(2), d.shipping.toFixed(2), d.net_revenue.toFixed(2)].join(',')
                  );
                  const csv = [header, ...rows].join('\n');
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a'); a.href = url; a.download = 'revenue.csv'; a.click();
                }}
                className="flex items-center gap-1.5 text-[12px] text-[#0D4A3C] font-semibold hover:underline"
              >
                <svg viewBox="0 0 14 14" width="13" height="13" fill="none">
                  <path d="M7 2v7M4 7l3 3 3-3M2 12h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Download CSV
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-[#F0E8DC] bg-[#FAF7F2]">
                    {([
                      ['date',          'Date'],
                      ['orders',        'Orders'],
                      ['gross_revenue', 'Gross Revenue'],
                      ['refunds',       'Refunds'],
                      ['coupons',       'Coupons'],
                      ['taxes',         'Taxes'],
                      ['shipping',      'Shipping'],
                      ['net_revenue',   'Net Revenue'],
                    ] as [keyof DailyStat, string][]).map(([col, label]) => (
                      <th key={col}
                        onClick={() => toggleSort(col)}
                        className="text-left px-4 py-3 font-semibold text-[#888] text-[11px] uppercase tracking-wide cursor-pointer hover:text-[#555] whitespace-nowrap select-none">
                        {label}<SortIcon col={col} />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sorted.map(d => (
                    <tr key={d.date} className="border-b border-[#F0E8DC] last:border-0 hover:bg-[#FAF7F2] transition-colors">
                      <td className="px-4 py-2.5 font-medium text-[#1C1C1E]">{fmtDate(d.date)}</td>
                      <td className="px-4 py-2.5 text-[#1C1C1E]">
                        {d.orders > 0
                          ? <span className="font-semibold text-[#0D4A3C]">{d.orders}</span>
                          : <span className="text-[#AAA]">0</span>}
                      </td>
                      <td className="px-4 py-2.5 text-[#1C1C1E]">{fmt$(d.gross_revenue)}</td>
                      <td className="px-4 py-2.5 text-[#1C1C1E]">{fmt$(d.refunds)}</td>
                      <td className="px-4 py-2.5 text-[#1C1C1E]">{fmt$(d.coupons)}</td>
                      <td className="px-4 py-2.5 text-[#1C1C1E]">{fmt$(d.taxes)}</td>
                      <td className="px-4 py-2.5 text-[#1C1C1E]">{fmt$(d.shipping)}</td>
                      <td className="px-4 py-2.5 font-semibold text-[#1C1C1E]">{fmt$(d.net_revenue)}</td>
                    </tr>
                  ))}
                  {sorted.length === 0 && (
                    <tr><td colSpan={8} className="px-4 py-10 text-center text-[#888]">No data for this period.</td></tr>
                  )}
                  {/* Totals row */}
                  {sorted.length > 0 && (
                    <tr className="border-t-2 border-[#E8DDD0] bg-[#FAF7F2] font-bold">
                      <td className="px-4 py-3 text-[#1C1C1E]">Totals</td>
                      <td className="px-4 py-3 text-[#0D4A3C]">{c?.order_count ?? 0}</td>
                      <td className="px-4 py-3 text-[#1C1C1E]">{fmt$(c?.gross_revenue ?? 0)}</td>
                      <td className="px-4 py-3 text-[#1C1C1E]">{fmt$(c?.refunds ?? 0)}</td>
                      <td className="px-4 py-3 text-[#1C1C1E]">{fmt$(c?.coupons ?? 0)}</td>
                      <td className="px-4 py-3 text-[#1C1C1E]">{fmt$(c?.taxes ?? 0)}</td>
                      <td className="px-4 py-3 text-[#1C1C1E]">{fmt$(c?.shipping ?? 0)}</td>
                      <td className="px-4 py-3 text-[#1C1C1E]">{fmt$(c?.net_revenue ?? 0)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
