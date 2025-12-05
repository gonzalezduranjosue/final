import React, { useState, useMemo } from 'react';
import { Plus, Trash2, FileDown, Calculator, HardHat, Hammer, Utensils, ClipboardList, PenTool } from 'lucide-react';
import { ProjectInfo, MaterialItem, LaborItem, DietInfo, WorkerInfo, UNITS } from './types';
import { generateDocument } from './services/documentGenerator';

const App: React.FC = () => {
  // --- STATE ---
  const [project, setProject] = useState<ProjectInfo>({
    projectName: '',
    beneficiary: '',
    approverName: '',
    approvalDate: new Date().toISOString().split('T')[0],
    observations: ''
  });

  const [workers, setWorkers] = useState<WorkerInfo[]>([
    { id: '1', name: '', role: 'Principal' },
    { id: '2', name: '', role: 'Ayudante' }
  ]);

  const [materials, setMaterials] = useState<MaterialItem[]>([
    { id: Date.now().toString(), description: '', quantity: 0, unit: 'unidad', unitPrice: 0 }
  ]);

  const [labor, setLabor] = useState<LaborItem[]>([
    { id: Date.now().toString(), description: '', cost: 0 }
  ]);

  const [diet, setDiet] = useState<DietInfo>({
    workersCount: 0,
    days: 0,
    costPerDay: 0
  });

  const [isGenerating, setIsGenerating] = useState(false);

  // --- CALCULATIONS ---
  const totals = useMemo(() => {
    const materialsTotal = materials.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const laborTotal = labor.reduce((sum, item) => sum + item.cost, 0);
    const dietTotal = diet.workersCount * diet.days * diet.costPerDay;
    return {
      materials: materialsTotal,
      labor: laborTotal,
      diet: dietTotal,
      grand: materialsTotal + laborTotal + dietTotal
    };
  }, [materials, labor, diet]);

  // --- HANDLERS ---
  const addMaterial = () => {
    setMaterials([...materials, { id: Date.now().toString() + Math.random(), description: '', quantity: 0, unit: 'unidad', unitPrice: 0 }]);
  };

  const removeMaterial = (id: string) => {
    if (materials.length > 1) {
      setMaterials(materials.filter(m => m.id !== id));
    }
  };

  const updateMaterial = (id: string, field: keyof MaterialItem, value: any) => {
    setMaterials(materials.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const addLabor = () => {
    setLabor([...labor, { id: Date.now().toString() + Math.random(), description: '', cost: 0 }]);
  };

  const removeLabor = (id: string) => {
    if (labor.length > 1) {
      setLabor(labor.filter(l => l.id !== id));
    }
  };

  const updateLabor = (id: string, field: keyof LaborItem, value: any) => {
    setLabor(labor.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const addWorker = () => {
    setWorkers([...workers, { id: Date.now().toString() + Math.random(), name: '', role: 'Ayudante' }]);
  };

  const removeWorker = (id: string) => {
    setWorkers(workers.filter(w => w.id !== id));
  };

  const handleExport = async (lang: 'es' | 'en') => {
    setIsGenerating(true);
    try {
      await generateDocument(project, workers, materials, labor, diet, lang);
    } catch (error) {
      console.error(error);
      alert('Error al generar el documento. Por favor revise la consola.');
    } finally {
      setIsGenerating(false);
    }
  };

  // --- COMPONENTS ---
  const SectionTitle = ({ icon: Icon, title }: { icon: any, title: string }) => (
    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
      <Icon className="w-5 h-5 text-primary" />
      <h2 className="text-lg font-bold text-secondary uppercase tracking-wide">{title}</h2>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 pb-32">
      {/* HEADER */}
      <header className="text-center mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-3xl font-extrabold text-secondary mb-2">Presupuesto de Proyecto</h1>
        <p className="text-gray-500">Planificación y cálculo de costos de obra</p>
      </header>

      <div className="space-y-6">
        {/* GENERAL INFO */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <SectionTitle icon={ClipboardList} title="Información General" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Proyecto</label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                placeholder="Ej: Remodelación Cocina"
                value={project.projectName}
                onChange={(e) => setProject({ ...project, projectName: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Beneficiario Directo</label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                placeholder="Nombre del cliente"
                value={project.beneficiary}
                onChange={(e) => setProject({ ...project, beneficiary: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* WORKERS */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <SectionTitle icon={HardHat} title="Equipo de Trabajo" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {workers.map((worker, index) => (
              <div key={worker.id} className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    {index === 0 ? 'Maestro / Principal' : `Trabajador ${index + 1}`}
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary outline-none"
                    placeholder="Nombre completo"
                    value={worker.name}
                    onChange={(e) => {
                      const newWorkers = [...workers];
                      newWorkers[index].name = e.target.value;
                      setWorkers(newWorkers);
                    }}
                  />
                </div>
                {index > 0 && (
                  <button 
                    onClick={() => removeWorker(worker.id)}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded mb-0.5"
                    title="Eliminar trabajador"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={addWorker}
            className="flex items-center gap-1 text-sm text-primary font-medium hover:text-blue-700"
          >
            <Plus size={16} /> Agregar Trabajador
          </button>
        </div>

        {/* MATERIALS */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <SectionTitle icon={Hammer} title="Materiales" />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase">
                  <th className="p-3 w-8">#</th>
                  <th className="p-3">Descripción</th>
                  <th className="p-3 w-24">Cant.</th>
                  <th className="p-3 w-32">Unidad</th>
                  <th className="p-3 w-32">P. Unitario</th>
                  <th className="p-3 w-32 text-right">Total</th>
                  <th className="p-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {materials.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="p-3 text-gray-400">{idx + 1}</td>
                    <td className="p-3">
                      <input
                        type="text"
                        className="w-full bg-transparent border-b border-transparent focus:border-primary outline-none"
                        placeholder="Nombre del material"
                        value={item.description}
                        onChange={(e) => updateMaterial(item.id, 'description', e.target.value)}
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        min="0"
                        className="w-full bg-transparent border-b border-transparent focus:border-primary outline-none text-center"
                        value={item.quantity || ''}
                        onChange={(e) => updateMaterial(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                      />
                    </td>
                    <td className="p-3">
                      <select
                        className="w-full bg-transparent border-b border-transparent focus:border-primary outline-none text-sm"
                        value={item.unit}
                        onChange={(e) => updateMaterial(item.id, 'unit', e.target.value)}
                      >
                        {UNITS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                      </select>
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="w-full bg-transparent border-b border-transparent focus:border-primary outline-none text-right"
                        value={item.unitPrice || ''}
                        onChange={(e) => updateMaterial(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                      />
                    </td>
                    <td className="p-3 text-right font-medium text-gray-700">
                      ${(item.quantity * item.unitPrice).toFixed(2)}
                    </td>
                    <td className="p-3">
                      {materials.length > 1 && (
                        <button 
                          onClick={() => removeMaterial(item.id)}
                          className="text-gray-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-blue-50">
                  <td colSpan={5} className="p-3 text-right font-bold text-blue-900">SUBTOTAL MATERIALES:</td>
                  <td className="p-3 text-right font-bold text-blue-900">${totals.materials.toFixed(2)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
          <button
            onClick={addMaterial}
            className="mt-4 flex items-center gap-1 text-sm text-primary font-medium hover:text-blue-700"
          >
            <Plus size={16} /> Agregar Material
          </button>
        </div>

        {/* LABOR */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <SectionTitle icon={PenTool} title="Mano de Obra" />
          <div className="space-y-2">
            {labor.map((item, idx) => (
              <div key={item.id} className="flex gap-4 items-center p-2 hover:bg-gray-50 rounded group">
                <span className="text-gray-400 w-6">{idx + 1}.</span>
                <input
                  type="text"
                  className="flex-1 bg-transparent border-b border-gray-200 focus:border-primary outline-none py-1"
                  placeholder="Descripción del trabajo realizado"
                  value={item.description}
                  onChange={(e) => updateLabor(item.id, 'description', e.target.value)}
                />
                <div className="w-32 relative">
                  <span className="absolute left-0 top-1 text-gray-400">$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full bg-transparent border-b border-gray-200 focus:border-primary outline-none py-1 pl-4 text-right"
                    placeholder="0.00"
                    value={item.cost || ''}
                    onChange={(e) => updateLabor(item.id, 'cost', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <button 
                  onClick={() => removeLabor(item.id)}
                  className={`text-gray-300 hover:text-red-500 transition-all ${labor.length > 1 ? 'opacity-100' : 'opacity-0 cursor-default'}`}
                  disabled={labor.length <= 1}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center mt-4">
             <button
              onClick={addLabor}
              className="flex items-center gap-1 text-sm text-primary font-medium hover:text-blue-700"
            >
              <Plus size={16} /> Agregar Trabajo
            </button>
            <div className="text-right font-bold text-blue-900 bg-blue-50 px-4 py-2 rounded">
              Subtotal: ${totals.labor.toFixed(2)}
            </div>
          </div>
        </div>

        {/* DIETAS */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <SectionTitle icon={Utensils} title="Alimentación / Dietas" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Cant. Trabajadores</label>
              <input
                type="number"
                min="0"
                className="w-full p-2 bg-gray-50 border border-gray-200 rounded text-center font-medium"
                value={diet.workersCount || ''}
                onChange={(e) => setDiet({ ...diet, workersCount: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Días Trabajados</label>
              <input
                type="number"
                min="0"
                className="w-full p-2 bg-gray-50 border border-gray-200 rounded text-center font-medium"
                value={diet.days || ''}
                onChange={(e) => setDiet({ ...diet, days: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Costo por Dieta</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-400">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full p-2 pl-6 bg-gray-50 border border-gray-200 rounded text-right font-medium"
                  value={diet.costPerDay || ''}
                  onChange={(e) => setDiet({ ...diet, costPerDay: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
          </div>
          <div className="mt-4 text-right">
             <span className="text-sm text-gray-500 mr-2">Cálculo: {diet.workersCount} pers. x {diet.days} días x ${diet.costPerDay}</span>
             <span className="font-bold text-blue-900 text-lg">= ${totals.diet.toFixed(2)}</span>
          </div>
        </div>

        {/* SIGNATURES & OBSERVATIONS */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <SectionTitle icon={FileDown} title="Aprobación" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Aprobado por (Nombre)</label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded"
                value={project.approverName}
                onChange={(e) => setProject({ ...project, approverName: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
              <input
                type="date"
                className="w-full p-2 border border-gray-300 rounded"
                value={project.approvalDate}
                onChange={(e) => setProject({ ...project, approvalDate: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones Finales</label>
            <textarea
              className="w-full p-2 border border-gray-300 rounded h-24 resize-none"
              placeholder="Notas adicionales..."
              value={project.observations}
              onChange={(e) => setProject({ ...project, observations: e.target.value })}
            ></textarea>
          </div>
        </div>

        {/* GRAND TOTAL */}
        <div className="bg-secondary text-white p-8 rounded-xl shadow-lg flex flex-col md:flex-row justify-between items-center">
          <div>
            <h2 className="text-2xl font-light opacity-90">Presupuesto Total Estimado</h2>
            <p className="text-sm opacity-70 mt-1">Suma de Materiales + Mano de Obra + Dietas</p>
          </div>
          <div className="text-4xl md:text-5xl font-bold mt-4 md:mt-0 tracking-tight">
            ${totals.grand.toFixed(2)} <span className="text-xl font-normal opacity-60">MN</span>
          </div>
        </div>

        {/* EXPORT ACTIONS */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 py-8">
          <button
            onClick={() => handleExport('es')}
            disabled={isGenerating}
            className="flex items-center justify-center gap-2 bg-success hover:bg-green-600 text-white py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? 'Generando...' : (
              <>
                <FileDown size={20} /> Exportar a Word (Español)
              </>
            )}
          </button>
          
          <button
            onClick={() => handleExport('en')}
            disabled={isGenerating}
            className="flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 text-white py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? 'Generating...' : (
              <>
                <FileDown size={20} /> Export to Word (English)
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;