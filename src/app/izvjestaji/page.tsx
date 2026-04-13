"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { 
  FileDown, 
  FileSpreadsheet, 
  Table as TableIcon, 
  TrendingUp, 
  Activity, 
  Calendar as CalendarIcon,
  RefreshCw,
  Box,
  Layers,
  ArrowUpRight,
  Loader2
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from "recharts";
import { 
  Truck, 
  MapPin, 
  Clock, 
  CheckCircle2 
} from "lucide-react";
import { exportToExcel, generateProductionPDF, generateShiftSummaryPDF } from "@/lib/exportUtils";
import { Badge } from "@/components/ui/badge";
import BatchDetailsModal from "@/components/BatchDetailsModal";

export default function IzvjestajiPage() {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [reportData, setReportData] = useState<any>(null);
  const [logisticsData, setLogisticsData] = useState<any>(null);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const [resDaily, resTrends, resLogistics] = await Promise.all([
        fetch(`/api/reports/daily?date=${date}`).then(r => r.json()),
        fetch(`/api/reports/trends?id=mixer_temp&hours=24`).then(r => r.json()),
        fetch(`/api/logistics`).then(r => r.json())
      ]);

      if (resDaily.success) setReportData(resDaily);
      if (resTrends.success) setTrendData(resTrends.data);
      if (resLogistics.success) setLogisticsData(resLogistics);
    } catch (error) {
      console.error("Failed to load reports:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [date]);

  const consumptionData = useMemo(() => {
    if (!reportData) return [];
    const c = reportData.summary.consumption;
    return [
      { name: "Cement", value: c.cement, unit: "kg", color: "#3b82f6" },
      { name: "Pesak", value: c.sand, unit: "kg", color: "#f59e0b" },
      { name: "Šljunak", value: c.gravel, unit: "kg", color: "#6b7280" },
      { name: "Voda", value: c.water, unit: "L", color: "#0ea5e9" },
    ];
  }, [reportData]);

  const fleetStats = useMemo(() => {
    if (!logisticsData) return [];
    const statusCounts: Record<string, number> = {};
    logisticsData.vehicles.forEach((v: any) => {
      statusCounts[v.status] = (statusCounts[v.status] || 0) + 1;
    });
    return Object.entries(statusCounts).map(([name, value]) => ({
      name,
      value,
      color: name === 'IN_TRANSIT' ? '#3b82f6' : name === 'LOADING' ? '#f59e0b' : '#6b7280'
    }));
  }, [logisticsData]);

  const handlePdfExport = async () => {
    if (!reportData) return;
    setExporting(true);
    try {
      await generateProductionPDF(reportData);
    } finally {
      setExporting(false);
    }
  };

  const handleExcelExport = () => {
    if (!reportData) return;
    const excelData = reportData.details.map((o: any) => ({
      ID: o.id,
      Recept: o.recipe.name,
      Kolicina: o.quantity,
      Datum: new Date(o.createdAt).toLocaleString(),
      Status: o.status
    }));
    exportToExcel(excelData, `Proizvodnja_${date}`);
  };

  if (loading && !reportData) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card/50 p-6 rounded-2xl border border-border shadow-sm">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analitika & Izvještaji</h1>
          <p className="text-muted-foreground mt-1">Sveobuhvatan pregled proizvodnih parametara i utroška sirovina.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-background border border-border px-3 py-1.5 rounded-lg">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent border-none text-sm focus:ring-0 outline-none"
            />
          </div>
          
          <button 
            onClick={fetchReport}
            className="p-2 hover:bg-muted rounded-lg transition-colors border border-border"
            title="Osveži"
          >
            <RefreshCw className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
          </button>
          
          <div className="h-8 w-px bg-border mx-1" />
          
          <button 
            onClick={handlePdfExport}
            disabled={exporting || !reportData}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium shadow-sm hover:opacity-90 transition-all disabled:opacity-50"
          >
            {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
            Izvezi PDF
          </button>
          
          <button 
            onClick={handleExcelExport}
            disabled={!reportData}
            className="flex items-center gap-2 bg-green-600/10 text-green-600 hover:bg-green-600/20 px-4 py-2 rounded-lg font-medium border border-green-600/20 transition-all"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Excel / CSV
          </button>

          <button 
            onClick={() => reportData && generateShiftSummaryPDF(reportData)}
            disabled={!reportData}
            className="flex items-center gap-2 bg-slate-800 text-white hover:bg-slate-700 px-4 py-2 rounded-lg font-medium transition-all"
          >
            <Activity className="h-4 w-4" />
            Izveštaj Smene
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard 
          title="Ukupno Proizvedeno" 
          value={`${reportData?.summary.totalVolume.toFixed(1)} m³`}
          description="Ukupna zapremina betona za dan"
          icon={<Box className="h-5 w-5 text-blue-500" />}
          trend="+12% vs prosek"
        />
        <KpiCard 
          title="Broj Naloga" 
          value={reportData?.summary.orderCount}
          description="Završenih proizvodnih serija"
          icon={<Activity className="h-5 w-5 text-emerald-500" />}
        />
        <KpiCard 
          title="Utrošak Cementa" 
          value={`${(reportData?.summary.consumption.cement / 1000).toFixed(1)} t`}
          description="Ukupna masa vezivnog materijala"
          icon={<Layers className="h-5 w-5 text-amber-500" />}
        />
        <KpiCard 
          title="Logistika: Aktivni" 
          value={logisticsData?.vehicles.filter((v:any) => v.status === 'IN_TRANSIT').length || 0}
          description="Kamiona trenutno na putu"
          icon={<Truck className="h-5 w-5 text-blue-500" />}
          trend="Real-time"
          trendColor="text-blue-500"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Chart */}
        <Card className="lg:col-span-2 border-primary/10 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" /> Radni Parametri (Mixer Temp)
            </CardTitle>
            <CardDescription>Fluktuacije temperature mešalice u poslednjih 24 časa</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.3} />
                <XAxis 
                  dataKey="time" 
                  tickFormatter={(t) => new Date(t).getHours() + ":00"} 
                  tick={{fontSize: 10}}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis unit="°C" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }}
                  labelFormatter={(t) => new Date(t).toLocaleString()}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3b82f6" 
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                  strokeWidth={2}
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Consumption Breakdown */}
        <Card className="border-primary/10 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Box className="h-5 w-5 text-amber-500" /> Utrošak po Sirovini
            </CardTitle>
            <CardDescription>Distribucija materijala u kg</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={consumptionData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#374151" opacity={0.3} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                   {consumptionData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={entry.color} />
                   ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Fleet Distribution */}
        <Card className="lg:col-span-3 border-primary/10 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Truck className="h-5 w-5 text-blue-500" /> Status Voznog Parka
              </CardTitle>
              <CardDescription>Trenutna raspodela mešalica po statusu</CardDescription>
            </div>
            <div className="flex gap-4">
               {fleetStats.map((s:any) => (
                 <div key={s.name} className="flex items-center gap-1.5 text-xs font-bold">
                   <div className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                   <span className="opacity-70">{s.name}: {s.value}</span>
                 </div>
               ))}
            </div>
          </CardHeader>
          <CardContent className="h-[250px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={fleetStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  animationDuration={1500}
                >
                  {fleetStats.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 flex-1 ml-8">
               <div className="p-4 bg-muted/30 rounded-xl border border-border/50">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Refill Orders</p>
                  <p className="text-2xl font-bold">{logisticsData?.refillOrders.length || 0}</p>
               </div>
               <div className="p-4 bg-muted/30 rounded-xl border border-border/50">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Total Vehicles</p>
                  <p className="text-2xl font-bold">{logisticsData?.vehicles.length || 0}</p>
               </div>
               <div className="p-4 bg-muted/30 rounded-xl border border-border/50">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">In Transit</p>
                  <p className="text-2xl font-bold text-blue-500">
                    {logisticsData?.vehicles.filter((v:any) => v.status === 'IN_TRANSIT').length || 0}
                  </p>
               </div>
               <div className="p-4 bg-muted/30 rounded-xl border border-border/50">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Pending Refills</p>
                  <p className="text-2xl font-bold text-amber-500">
                    {logisticsData?.refillOrders.filter((o:any) => o.status === 'PENDING').length || 0}
                  </p>
               </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Production Log Table */}
      <Card className="border-primary/10 shadow-lg overflow-hidden">
        <CardHeader className="bg-muted/30 border-b border-border/50">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <TableIcon className="h-5 w-5 text-primary" /> Dnevnik Izdavanja
              </CardTitle>
              <CardDescription>Detaljan popis svih isporučenih serija za odabrani datum</CardDescription>
            </div>
            <Badge variant="outline" className="font-mono">{reportData?.details.length} JEDINICA</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-bold border-b border-border">
                  <th className="px-6 py-4">Ref. Nalog</th>
                  <th className="px-6 py-4">Receptura / Marka Betona</th>
                  <th className="px-4 py-4 text-right">Količina (m³)</th>
                  <th className="px-6 py-4">Vrijeme Završetka</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-center">Akcije</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {reportData?.details.map((order: any) => (
                  <tr key={order.id} className="hover:bg-primary/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-primary group-hover:translate-x-1 transition-transform inline-block">
                        OPT-{order.id.toString().padStart(5, '0')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{order.recipe.name}</div>
                      <div className="text-[10px] text-muted-foreground">ID Recepta: #{order.recipe.id}</div>
                    </td>
                    <td className="px-4 py-4 text-right font-mono font-bold">
                       {order.quantity.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-xs">
                      {new Date(order.createdAt).toLocaleTimeString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20">
                        ZAVRŠENO
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => {
                          setSelectedOrder(order);
                          setIsModalOpen(true);
                        }}
                        className="bg-primary/10 text-primary px-3 py-1 rounded-md font-bold text-xs hover:bg-primary hover:text-white transition-all border border-primary/20"
                      >
                         DETALJI
                      </button>
                    </td>
                  </tr>
                ))}
                {reportData?.details.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Box className="h-10 w-10 opacity-20" />
                        <p className="italic">Nema zabeleženih proizvodnih naloga za ovaj datum.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <BatchDetailsModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        order={selectedOrder}
      />
    </div>
  );
}

function KpiCard({ title, value, description, icon, trend, trendColor = "text-primary" }: any) {
  return (
    <Card className="hover:shadow-lg transition-all border-primary/10 group">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          {title}
        </CardTitle>
        <div className="p-2 bg-muted rounded-lg group-hover:bg-primary/10 transition-colors">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tracking-tighter">{value}</div>
        <div className="flex justify-between items-center mt-1">
          <p className="text-[10px] text-muted-foreground">{description}</p>
          {trend && (
            <span className={`text-[10px] font-bold flex items-center gap-1 ${trendColor}`}>
              <ArrowUpRight className="h-3 w-3" /> {trend}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
