import React from "react";

export interface WorkOrderData {
  id: number;
  recipeName: string;
  quantity: number;
  createdAt: string;
  status: string;
  recipeDetails: {
    cementAmount: number;
    waterAmount: number;
    sandAmount: number;
    gravelAmount: number;
    admixtureAmount: number | null;
  };
}

export function WorkOrderPrint({ data, forwardRef }: { data: WorkOrderData, forwardRef?: React.Ref<HTMLDivElement> }) {
  return (
    <div ref={forwardRef} className="bg-white text-black p-8 max-w-[210mm] min-h-[297mm] mx-auto hidden print:block shadow-lg print:shadow-none font-sans">
      <div className="border-b-4 border-black pb-4 mb-8">
        <h1 className="text-4xl font-black uppercase tracking-tighter">NEXUSCORE</h1>
        <h2 className="text-xl font-bold uppercase text-gray-500 tracking-widest mt-1">Radni Nalog - Proizvodnja</h2>
      </div>

      <div className="flex justify-between items-end mb-12">
        <div>
          <p className="text-sm text-gray-500 uppercase font-bold mb-1">Broj Naloga</p>
          <p className="text-5xl font-black font-mono">#{data.id}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500 uppercase font-bold mb-1">Datum i Vreme Kreiranja</p>
          <p className="text-lg font-bold">{new Date(data.createdAt).toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-gray-100 p-6 rounded-lg mb-12 border-2 border-black">
        <h3 className="font-bold border-b border-black pb-2 mb-4 uppercase">Zahtevani Parametri (Target)</h3>
        <div className="grid grid-cols-2 gap-8 text-2xl">
          <div>
            <span className="text-gray-500 block text-sm uppercase font-bold mb-1">Receptura / Marka Betona</span>
            <span className="font-black">{data.recipeName}</span>
          </div>
          <div>
            <span className="text-gray-500 block text-sm uppercase font-bold mb-1">Količina</span>
            <span className="font-black text-blue-600">{data.quantity.toFixed(2)} m³</span>
          </div>
        </div>
      </div>

      {data.recipeDetails && (
        <div className="mb-12">
          <h3 className="font-bold border-b-2 border-black pb-2 mb-4 uppercase">Specifikacija Mešavine (po 1 m³)</h3>
          <table className="w-full text-left border-collapse border border-black text-lg">
            <thead className="bg-gray-100 font-bold uppercase text-sm">
              <tr>
                <th className="border border-black p-3">Materijal</th>
                <th className="border border-black p-3 text-right">Količina</th>
                <th className="border border-black p-3 text-right">Ukupno za {data.quantity}m³</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              <tr>
                <td className="border border-black p-3 font-bold">Cement</td>
                <td className="border border-black p-3 text-right">{data.recipeDetails.cementAmount} kg</td>
                <td className="border border-black p-3 text-right">{(data.recipeDetails.cementAmount * data.quantity).toFixed(0)} kg</td>
              </tr>
               <tr>
                <td className="border border-black p-3 font-bold">Voda</td>
                <td className="border border-black p-3 text-right">{data.recipeDetails.waterAmount} L</td>
                <td className="border border-black p-3 text-right">{(data.recipeDetails.waterAmount * data.quantity).toFixed(0)} L</td>
              </tr>
               <tr>
                <td className="border border-black p-3 font-bold">Pesak (0-4mm)</td>
                <td className="border border-black p-3 text-right">{data.recipeDetails.sandAmount} kg</td>
                <td className="border border-black p-3 text-right">{(data.recipeDetails.sandAmount * data.quantity).toFixed(0)} kg</td>
              </tr>
               <tr>
                <td className="border border-black p-3 font-bold">Šljunak (4-32mm)</td>
                <td className="border border-black p-3 text-right">{data.recipeDetails.gravelAmount} kg</td>
                <td className="border border-black p-3 text-right">{(data.recipeDetails.gravelAmount * data.quantity).toFixed(0)} kg</td>
              </tr>
               <tr>
                <td className="border border-black p-3 font-bold">Aditiv (Sika/Ading)</td>
                <td className="border border-black p-3 text-right">{data.recipeDetails.admixtureAmount || 0} kg</td>
                <td className="border border-black p-3 text-right">{((data.recipeDetails.admixtureAmount || 0) * data.quantity).toFixed(2)} kg</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <div className="grid grid-cols-2 gap-16 text-center pt-16 mt-auto">
        <div>
          <div className="border-b-2 border-dashed border-black mb-2"></div>
          <div className="text-sm uppercase font-bold">Dispečer</div>
        </div>
        <div>
          <div className="border-b-2 border-dashed border-black mb-2"></div>
          <div className="text-sm uppercase font-bold">Operater na Mešalici</div>
        </div>
      </div>
    </div>
  );
}
