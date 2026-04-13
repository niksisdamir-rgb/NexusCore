import React from "react";

export interface DeliveryNoteData {
  id: number;
  deliveryNoteNo: string;
  clientName: string;
  siteName: string;
  recipeName: string;
  volumeM3: number;
  orderNumber: string;
  productionNumber: string;
  mixingTime: number;
  driverName: string;
  vehiclePlate: string;
  productionStartTime: string;
  productionEndTime: string;
  materialStats?: {
    required: Record<string, number>;
    given: Record<string, number>;
    difference: Record<string, number>;
    percentage: Record<string, number>;
  };
}

export function DeliveryNotePrint({ data, forwardRef }: { data: DeliveryNoteData, forwardRef?: React.Ref<HTMLDivElement> }) {
  const materials = [
    "16-32", "8-16", "0-4", "4-8", "CEMENT 1", "CEMENT 2", 
    "SIKA", "ADING", "WATER"
  ];

  const defaultStats = {
    required: materials.reduce((acc, m) => ({ ...acc, [m]: 0 }), {}),
    given: materials.reduce((acc, m) => ({ ...acc, [m]: 0 }), {}),
    difference: materials.reduce((acc, m) => ({ ...acc, [m]: 0 }), {}),
    percentage: materials.reduce((acc, m) => ({ ...acc, [m]: 0 }), {})
  };

  const stats = data.materialStats || defaultStats;

  const renderHalf = (title: string, copyType: string) => (
    <div className="border-b-2 border-dashed border-gray-400 pb-8 mb-8 last:border-0 last:pb-0 last:mb-0 text-black">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-bold uppercase tracking-wider">NEXUSCORE CONCRETE</h2>
          <p className="text-xs text-gray-500">Concrete batching plant data</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold mb-1">DELIVERY NOTE / OTPREMNICA</div>
          <div className="text-lg font-mono font-bold text-red-600">No. {data.deliveryNoteNo}</div>
          <p className="text-xs text-gray-500 font-bold mt-1 uppercase">{copyType}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-6 text-sm">
        <div className="space-y-4">
          <div>
            <h3 className="font-bold border-b border-black pb-1 mb-2 uppercase text-xs">Customer Data</h3>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-gray-600">Company Name</span>
              <span className="col-span-2 font-bold">{data.clientName}</span>
              
              <span className="text-gray-600">Site Name</span>
              <span className="col-span-2 font-bold">{data.siteName || "---"}</span>
            </div>
          </div>
          <div>
            <h3 className="font-bold border-b border-black pb-1 mb-2 uppercase text-xs">Order Information</h3>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-gray-600">Order No</span>
              <span className="col-span-2 font-bold">{data.orderNumber || "---"}</span>
              
              <span className="text-gray-600">Production No</span>
              <span className="col-span-2 font-bold">{data.productionNumber || "---"}</span>
              
              <span className="text-gray-600">Mixing Time (s)</span>
              <span className="col-span-2 font-bold">{data.mixingTime || 60}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-bold border-b border-black pb-1 mb-2 uppercase text-xs">Concrete Details</h3>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-gray-600">Recipe Name</span>
              <span className="col-span-2 font-bold">{data.recipeName}</span>
              
              <span className="text-gray-600">Volume (m³)</span>
              <span className="col-span-2 font-bold text-lg">{data.volumeM3.toFixed(2)}</span>
            </div>
          </div>
          <div>
             <h3 className="font-bold border-b border-black pb-1 mb-2 uppercase text-xs">Delivery & Logistics</h3>
             <div className="grid grid-cols-3 gap-2">
              <span className="text-gray-600">Driver Name</span>
              <span className="col-span-2 font-bold">{data.driverName || "---"}</span>
              
              <span className="text-gray-600">Vehicle Plate</span>
              <span className="col-span-2 font-bold">{data.vehiclePlate || "---"}</span>

              <span className="text-gray-600">Start Time</span>
              <span className="col-span-2 font-mono text-xs">{data.productionStartTime}</span>

              <span className="text-gray-600">End Time</span>
              <span className="col-span-2 font-mono text-xs">{data.productionEndTime}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="font-bold border-b border-black pb-1 mb-2 uppercase text-xs">Material Log</h3>
        <table className="w-full text-[10px] text-right border-collapse border border-black">
          <thead className="bg-gray-100 font-bold">
            <tr>
              <th className="border border-black p-1 text-left">Metric</th>
              {materials.map(m => (
                <th key={m} className="border border-black p-1">{m}</th>
              ))}
            </tr>
          </thead>
          <tbody className="font-mono">
            <tr>
              <td className="border border-black p-1 text-left font-bold bg-gray-50">Required</td>
              {materials.map(m => (
                <td key={m} className="border border-black p-1">{stats.required[m] || 0}</td>
              ))}
            </tr>
            <tr>
              <td className="border border-black p-1 text-left font-bold bg-gray-50">Given</td>
              {materials.map(m => (
                <td key={m} className="border border-black p-1">{stats.given[m] || 0}</td>
              ))}
            </tr>
             <tr>
              <td className="border border-black p-1 text-left font-bold bg-gray-50">Difference</td>
              {materials.map(m => (
                <td key={m} className="border border-black p-1">{stats.difference[m] || 0}</td>
              ))}
            </tr>
             <tr>
              <td className="border border-black p-1 text-left font-bold bg-gray-50">%</td>
              {materials.map(m => (
                <td key={m} className="border border-black p-1">{(stats.percentage[m] || 0).toFixed(2)}%</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-3 gap-8 text-center pt-8">
        <div>
          <div className="border-b border-black mb-2 mx-8"></div>
          <div className="text-xs uppercase font-bold">Operator</div>
        </div>
        <div>
          <div className="border-b border-black mb-2 mx-8"></div>
          <div className="text-xs uppercase font-bold">Driver / Shipper</div>
        </div>
        <div>
          <div className="border-b border-black mb-2 mx-8"></div>
          <div className="text-xs uppercase font-bold">Recipient</div>
        </div>
      </div>
    </div>
  );

  return (
    <div ref={forwardRef} className="bg-white text-black p-8 max-w-[210mm] min-h-[297mm] mx-auto hidden print:block shadow-lg print:shadow-none">
       {/* Top Half: Customer Copy */}
       {renderHalf("Customer Copy", "KOPIJA ZA KUPCA")}
       {/* Bottom Half: Company Copy */}
       {renderHalf("Company Copy", "KOPIJA ZA BETONJERKU")}
    </div>
  );
}
