import React, { useState } from 'react';
import { Plus, Trash2, FileDown, Calculator } from 'lucide-react';
import { ProposalData, MaterialItem, DiscoveryItem, Signatory } from './types';
import { InputSection } from './components/InputSection';
import { generateProposalPDF } from './services/pdfService';

const initialMaterials: MaterialItem[] = [
  { id: '1', productCode: '71016906', description: 'FRÄNKISCHE ff-therm multi Oksijen Bariyerli PE-Xa Boru', dimensions: '16 x 2 mm, 600 m kangal', requestQty: 238, shipQty: 238, unit: 'm', unitPrice: 1.20 },
  { id: '2', productCode: '', description: 'Yerden ısıtma İzolasyon Plakası (450 gr Yerli)', dimensions: '', requestQty: 24, shipQty: 24, unit: 'm2', unitPrice: 5.50 },
  { id: '3', productCode: '71900111', description: 'FRÄNKISCHE profitherm Kenar İzolasyon Bandı', dimensions: '8x150 mm, Yapışkanlı', requestQty: 26, shipQty: 26, unit: 'm', unitPrice: 0.85 },
];

const initialDiscovery: DiscoveryItem[] = [
  { id: '1', floor: 'ZEMİN KAT', roomName: 'Kafeterya', area: 23.75, pipeDensity: 10, pipeLength: 238, circuits: 3, thermostat: 1, collector: '4' },
];

const initialSignatories: Signatory[] = [
  { id: '1', name: 'Olcay GÜLSOY', email: 'olcay@fankur.com' }
];

const initialNotes: string[] = [
  "Fiyatlarımız EUR para birimi üzerindendir.",
  "Fiyatlarımıza KDV dahil değildir.",
  "Ödeme tarihindeki T.C.M.B. efektif satış kuru esas alınacaktır.",
  "Teslimat: Stoktan hemen teslim / Antalya Depo.",
  "Bu teklif 7 gün süreyle geçerlidir."
];

export default function App() {
  const [data, setData] = useState<ProposalData>({
    date: new Date().toISOString().split('T')[0],
    projectName: 'MALATYA KAFETERYA',
    attentionTo: 'Olcay GÜRSOY',
    subject: 'YERDEN ISITMA TEKLİFİ',
    currency: 'EUR',
    page1Title: 'YERDEN ISITMA MALZEME LİSTESİ',
    page2Title: 'YERDEN ISITMA KEŞİF ÖZETİ',
    signatories: initialSignatories,
    materials: initialMaterials,
    discovery: initialDiscovery,
    notes: initialNotes,
    productTitle: 'FRÄNKISCHE',
    manualTotal: undefined
  });

  // --- Handlers for Materials ---
  const addMaterial = () => {
    const newItem: MaterialItem = {
      id: Date.now().toString(),
      productCode: '',
      description: '',
      dimensions: '',
      requestQty: 0,
      shipQty: 0,
      unit: 'Ad.',
      unitPrice: 0
    };
    setData(prev => ({ ...prev, materials: [...prev.materials, newItem] }));
  };

  const removeMaterial = (id: string) => {
    setData(prev => ({ ...prev, materials: prev.materials.filter(m => m.id !== id) }));
  };

  const updateMaterial = (id: string, field: keyof MaterialItem, value: any) => {
    setData(prev => ({
      ...prev,
      materials: prev.materials.map(m => m.id === id ? { ...m, [field]: value } : m)
    }));
  };

  // --- Handlers for Discovery ---
  const addDiscovery = () => {
    const newItem: DiscoveryItem = {
      id: Date.now().toString(),
      floor: 'ZEMİN KAT',
      roomName: '',
      area: 0,
      pipeDensity: 6.6, // Default per PDF
      pipeLength: 0,
      circuits: 0,
      thermostat: 0,
      collector: ''
    };
    setData(prev => ({ ...prev, discovery: [...prev.discovery, newItem] }));
  };

  const removeDiscovery = (id: string) => {
    setData(prev => ({ ...prev, discovery: prev.discovery.filter(d => d.id !== id) }));
  };

  const updateDiscovery = (id: string, field: keyof DiscoveryItem, value: any) => {
    setData(prev => {
      const updatedDiscovery = prev.discovery.map(d => {
        if (d.id !== id) return d;
        const updatedItem = { ...d, [field]: value };
        // Auto-calculate pipe length if area or density changes
        if (field === 'area' || field === 'pipeDensity') {
          updatedItem.pipeLength = Math.round(updatedItem.area * updatedItem.pipeDensity);
        }
        return updatedItem;
      });
      return { ...prev, discovery: updatedDiscovery };
    });
  };

  // --- Handlers for Signatories ---
  const addSignatory = () => {
    const newSig: Signatory = { id: Date.now().toString(), name: '', email: '' };
    setData(prev => ({ ...prev, signatories: [...prev.signatories, newSig] }));
  };

  const removeSignatory = (id: string) => {
    setData(prev => ({ ...prev, signatories: prev.signatories.filter(s => s.id !== id) }));
  };

  const updateSignatory = (id: string, field: keyof Signatory, value: string) => {
    setData(prev => ({
      ...prev,
      signatories: prev.signatories.map(s => s.id === id ? { ...s, [field]: value } : s)
    }));
  };

  // --- Handlers for Notes ---
  const addNote = () => {
    setData(prev => ({ ...prev, notes: [...prev.notes, ""] }));
  };

  const removeNote = (index: number) => {
    setData(prev => ({ ...prev, notes: prev.notes.filter((_, i) => i !== index) }));
  };

  const updateNote = (index: number, value: string) => {
    setData(prev => ({
      ...prev,
      notes: prev.notes.map((n, i) => i === index ? value : n)
    }));
  };

  const handleGeneratePDF = () => {
    generateProposalPDF(data);
  };

  // Calculate Running Total
  // Sum of (manualTotal if exists, else qty * price)
  const calculatedTotal = data.materials.reduce((sum, m) => {
    const lineTotal = m.manualTotal !== undefined ? m.manualTotal : (m.requestQty * m.unitPrice);
    return sum + lineTotal;
  }, 0);

  const displayTotal = data.manualTotal && data.manualTotal > 0 ? data.manualTotal : calculatedTotal;

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans text-gray-900">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">F</div>
            <h1 className="text-xl font-bold text-slate-800">Fankur Teklif Oluşturucu</h1>
          </div>
          <button 
            onClick={handleGeneratePDF}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors shadow-sm"
          >
            <FileDown className="w-5 h-5" />
            PDF İndir
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* CUSTOMER INFO */}
        <InputSection title="Müşteri & Proje Bilgileri">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Proje Adı</label>
              <input 
                type="text" 
                value={data.projectName}
                onChange={(e) => setData({...data, projectName: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sayın (İlgili Kişi)</label>
              <input 
                type="text" 
                value={data.attentionTo}
                onChange={(e) => setData({...data, attentionTo: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Konu</label>
              <input 
                type="text" 
                value={data.subject}
                onChange={(e) => setData({...data, subject: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tarih</label>
              <input 
                type="date" 
                value={data.date}
                onChange={(e) => setData({...data, date: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ürün Başlığı (Logo Yanı)</label>
              <input 
                type="text" 
                value={data.productTitle || ''}
                onChange={(e) => setData({...data, productTitle: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm" 
                placeholder="Örn: FRÄNKISCHE"
              />
            </div>
          </div>
        </InputSection>

        {/* MATERIAL LIST */}
        <InputSection title="Sayfa 1: Yerden Isıtma Malzeme Listesi">
          <div className="mb-4">
             <label className="block text-sm font-medium text-gray-700 mb-1">Sayfa Başlığı</label>
             <input 
                type="text" 
                value={data.page1Title} 
                onChange={(e) => setData({...data, page1Title: e.target.value})}
                className="w-full md:w-1/2 p-2 border border-gray-300 rounded bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
              />
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="text-xs text-gray-700 uppercase bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-3 w-32">Ürün No</th>
                  <th className="px-3 py-3 min-w-[200px]">Ürün Tanımı</th>
                  <th className="px-3 py-3 w-40">Ebat/Detay</th>
                  <th className="px-3 py-3 w-24">Miktar</th>
                  <th className="px-3 py-3 w-20">Birim</th>
                  <th className="px-3 py-3 w-32">Birim Fiyat</th>
                  <th className="px-3 py-3 w-32 text-right">Tutar</th>
                  <th className="px-3 py-3 w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.materials.map((item) => (
                  <tr key={item.id} className="bg-white hover:bg-gray-50">
                    <td className="px-2 py-2">
                      <input className="w-full p-1.5 border border-gray-300 rounded bg-white text-gray-900 text-sm" value={item.productCode} onChange={(e) => updateMaterial(item.id, 'productCode', e.target.value)} />
                    </td>
                    <td className="px-2 py-2">
                      <input className="w-full p-1.5 border border-gray-300 rounded bg-white text-gray-900 text-sm" value={item.description} onChange={(e) => updateMaterial(item.id, 'description', e.target.value)} />
                    </td>
                    <td className="px-2 py-2">
                      <input className="w-full p-1.5 border border-gray-300 rounded bg-white text-gray-900 text-sm" value={item.dimensions} onChange={(e) => updateMaterial(item.id, 'dimensions', e.target.value)} />
                    </td>
                    <td className="px-2 py-2">
                      <input type="number" className="w-full p-1.5 border border-gray-300 rounded bg-white text-gray-900 text-sm text-center" value={item.requestQty} onChange={(e) => updateMaterial(item.id, 'requestQty', Number(e.target.value))} />
                    </td>
                    <td className="px-2 py-2">
                      <input className="w-full p-1.5 border border-gray-300 rounded bg-white text-gray-900 text-sm text-center" value={item.unit} onChange={(e) => updateMaterial(item.id, 'unit', e.target.value)} />
                    </td>
                    <td className="px-2 py-2">
                      <input type="number" step="0.01" className="w-full p-1.5 border border-gray-300 rounded bg-white text-gray-900 text-sm text-right" value={item.unitPrice} onChange={(e) => updateMaterial(item.id, 'unitPrice', Number(e.target.value))} />
                    </td>
                    <td className="px-2 py-2 text-right">
                      {/* Tutar Input: Allows manual override */}
                      <input 
                        type="number"
                        step="0.01"
                        className={`w-full p-1.5 border rounded text-sm text-right outline-none focus:ring-2 focus:ring-blue-500 ${
                          item.manualTotal !== undefined 
                            ? 'border-blue-300 bg-blue-50 text-blue-900 font-semibold' 
                            : 'border-gray-300 bg-gray-50 text-gray-700'
                        }`}
                        placeholder={(item.requestQty * item.unitPrice).toFixed(2)}
                        value={item.manualTotal !== undefined ? item.manualTotal : (item.requestQty * item.unitPrice).toFixed(2)}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateMaterial(item.id, 'manualTotal', val === '' ? undefined : parseFloat(val));
                        }}
                      />
                    </td>
                    <td className="px-2 py-2 text-center">
                      <button onClick={() => removeMaterial(item.id)} className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex flex-col md:flex-row justify-between items-center bg-gray-50 p-4 rounded-lg border border-gray-200 gap-4">
            <button onClick={addMaterial} className="flex items-center gap-2 text-blue-600 font-medium hover:bg-blue-100 px-4 py-2 rounded transition-colors self-start md:self-center">
              <Plus className="w-4 h-4" /> Satır Ekle
            </button>
            
            <div className="flex flex-col md:flex-row items-end md:items-center gap-4">
              <div className="flex flex-col items-end">
                <span className="text-xs text-gray-500 mb-1">Hesaplanan (Satır Toplamı): {calculatedTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {data.currency}</span>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">Genel Manuel Toplam:</label>
                  <input 
                    type="number"
                    step="0.01"
                    placeholder="Otomatik"
                    value={data.manualTotal || ''}
                    onChange={(e) => setData({...data, manualTotal: e.target.value ? Number(e.target.value) : undefined})}
                    className="w-32 p-1.5 border border-gray-300 rounded bg-white text-right text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
              
              <div className="text-xl font-bold text-slate-800 bg-white px-4 py-2 rounded border border-gray-200 shadow-sm min-w-[200px] text-right">
                {displayTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {data.currency}
              </div>
            </div>
          </div>
        </InputSection>

        {/* NOTES SECTION */}
        <InputSection title="Notlar & Şartlar">
          <div className="space-y-2">
            {data.notes.map((note, index) => (
              <div key={index} className="flex gap-2 items-center">
                 <span className="text-gray-400 font-medium w-6 text-right">{index + 1}-</span>
                 <input 
                    value={note}
                    onChange={(e) => updateNote(index, e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                 />
                 <button onClick={() => removeNote(index)} className="text-gray-400 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                 </button>
              </div>
            ))}
            <button onClick={addNote} className="mt-2 text-sm text-blue-600 font-medium hover:underline flex items-center gap-1">
              <Plus className="w-3 h-3" /> Not Ekle
            </button>
          </div>
        </InputSection>

        {/* DISCOVERY LIST */}
        <InputSection title="Sayfa 2: Yerden Isıtma Keşfi">
          <div className="mb-4">
             <label className="block text-sm font-medium text-gray-700 mb-1">Sayfa Başlığı</label>
             <input 
                type="text" 
                value={data.page2Title} 
                onChange={(e) => setData({...data, page2Title: e.target.value})}
                className="w-full md:w-1/2 p-2 border border-gray-300 rounded bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
              />
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="text-xs text-gray-700 uppercase bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-3 w-32">Kat</th>
                  <th className="px-3 py-3">Mahal</th>
                  <th className="px-3 py-3 w-24">Alan (m²)</th>
                  <th className="px-3 py-3 w-24">Mt/m²</th>
                  <th className="px-3 py-3 w-24">Boru (Mt)</th>
                  <th className="px-3 py-3 w-20">Devre</th>
                  <th className="px-3 py-3 w-20">Term.</th>
                  <th className="px-3 py-3 w-24">Kollektör</th>
                  <th className="px-3 py-3 w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.discovery.map((item) => (
                  <tr key={item.id} className="bg-white hover:bg-gray-50">
                    <td className="px-2 py-2">
                      <input className="w-full p-1.5 border border-gray-300 rounded bg-white text-gray-900 text-sm" value={item.floor} onChange={(e) => updateDiscovery(item.id, 'floor', e.target.value)} />
                    </td>
                    <td className="px-2 py-2">
                      <input className="w-full p-1.5 border border-gray-300 rounded bg-white text-gray-900 text-sm" value={item.roomName} onChange={(e) => updateDiscovery(item.id, 'roomName', e.target.value)} />
                    </td>
                    <td className="px-2 py-2">
                      <input type="number" className="w-full p-1.5 border border-gray-300 rounded bg-white text-gray-900 text-sm text-center" value={item.area} onChange={(e) => updateDiscovery(item.id, 'area', Number(e.target.value))} />
                    </td>
                    <td className="px-2 py-2">
                      <input type="number" step="0.1" className="w-full p-1.5 border border-gray-300 rounded bg-white text-gray-900 text-sm text-center" value={item.pipeDensity} onChange={(e) => updateDiscovery(item.id, 'pipeDensity', Number(e.target.value))} />
                    </td>
                    <td className="px-2 py-2">
                       <div className="w-full p-1.5 bg-gray-50 text-gray-700 text-center rounded border border-gray-200 text-sm font-medium">
                         {item.pipeLength}
                       </div>
                    </td>
                    <td className="px-2 py-2">
                       <input type="number" className="w-full p-1.5 border border-gray-300 rounded bg-white text-gray-900 text-sm text-center" value={item.circuits} onChange={(e) => updateDiscovery(item.id, 'circuits', Number(e.target.value))} />
                    </td>
                    <td className="px-2 py-2">
                       <input type="number" className="w-full p-1.5 border border-gray-300 rounded bg-white text-gray-900 text-sm text-center" value={item.thermostat} onChange={(e) => updateDiscovery(item.id, 'thermostat', Number(e.target.value))} />
                    </td>
                    <td className="px-2 py-2">
                       <input className="w-full p-1.5 border border-gray-300 rounded bg-white text-gray-900 text-sm text-center" value={item.collector} onChange={(e) => updateDiscovery(item.id, 'collector', e.target.value)} />
                    </td>
                    <td className="px-2 py-2 text-center">
                      <button onClick={() => removeDiscovery(item.id)} className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4">
            <button onClick={addDiscovery} className="flex items-center gap-2 text-blue-600 font-medium hover:bg-blue-100 px-4 py-2 rounded transition-colors">
              <Plus className="w-4 h-4" /> Mahal Ekle
            </button>
          </div>
        </InputSection>

        {/* SIGNATORIES */}
        <InputSection title="İmza Yetkilileri">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.signatories.map((sig) => (
                <div key={sig.id} className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm relative group">
                   <button 
                      onClick={() => removeSignatory(sig.id)}
                      className="absolute top-2 right-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                   >
                     <Trash2 className="w-4 h-4" />
                   </button>
                   <h4 className="font-bold text-sm mb-3 text-gray-800 border-b pb-1">Yetkili</h4>
                   <div className="space-y-3">
                     <div>
                       <label className="block text-[10px] font-semibold text-gray-500 mb-1 uppercase">Ad Soyad</label>
                       <input 
                          placeholder="Ad Soyad"
                          className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                          value={sig.name}
                          onChange={(e) => updateSignatory(sig.id, 'name', e.target.value)}
                       />
                     </div>
                     <div>
                       <label className="block text-[10px] font-semibold text-gray-500 mb-1 uppercase">Email</label>
                       <input 
                          placeholder="Email"
                          className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                          value={sig.email}
                          onChange={(e) => updateSignatory(sig.id, 'email', e.target.value)}
                       />
                     </div>
                   </div>
                </div>
              ))}
              
              <button 
                onClick={addSignatory}
                className="border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center p-4 text-gray-400 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-all min-h-[180px]"
              >
                <Plus className="w-8 h-8 mb-2" />
                <span className="font-medium text-sm">Yetkili Ekle</span>
              </button>
           </div>
        </InputSection>

      </main>
    </div>
  );
}