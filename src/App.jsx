import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, where, getDocs, increment } from 'firebase/firestore';

// --- CONFIGURACIÓN DE FIREBASE ---
let app, auth, db;

try {
  app = initializeApp({
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
  });
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.error("Error inicializando Firebase:", error);
}

// --- ICONOS SVG ---
const IconDiamond = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h12l4 6-10 13L2 9Z"/><path d="M11 3 8 9l4 13 4-13-3-6"/><path d="M2 9h20"/></svg>;
const IconUser = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconLock = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const IconLogout = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>;
const IconCart = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>;
const IconClose = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>;
const IconBox = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>;
const IconCash = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>;
const IconList = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>;
const IconTrash = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>;

// --- COMPONENTE PRINCIPAL ---
export default function App() {
  const [appState, setAppState] = useState('login'); // 'login', 'admin', 'seller'
  const [adminUser, setAdminUser] = useState(null);
  const [currentSeller, setCurrentSeller] = useState(null);

  // --- VISTAS ---
  if (appState === 'login') {
    return <LoginView setAppState={setAppState} setAdminUser={setAdminUser} setCurrentSeller={setCurrentSeller} />;
  }
  
  if (appState === 'admin') {
    return <AdminDashboard onLogout={() => { signOut(auth); setAdminUser(null); setAppState('login'); }} />;
  }

  if (appState === 'seller') {
    return <SellerDashboard seller={currentSeller} onLogout={() => { setCurrentSeller(null); setAppState('login'); }} />;
  }
}

// ==========================================
// 1. PANTALLA DE LOGIN (DOBLE PERFIL)
// ==========================================
function LoginView({ setAppState, setAdminUser, setCurrentSeller }) {
  const [loginMode, setLoginMode] = useState('seller'); // 'seller' o 'admin'
  const [isRegisteringAdmin, setIsRegisteringAdmin] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [sellerCode, setSellerCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Revisa si ya hay un admin logueado en la sesión
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAdminUser(user);
        setAppState('admin');
      }
    });
    return () => unsub();
  }, [setAdminUser, setAppState]);

  const handleAdminAuth = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      if (isRegisteringAdmin) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      // El useEffect de arriba detectará el cambio y redirigirá
    } catch (err) {
      setError("Error: Verifica tus credenciales (O habilita Email/Contraseña en Firebase).");
    }
    setLoading(false);
  };

  const handleSellerLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const q = query(collection(db, 'joya_sellers'), where('code', '==', sellerCode.trim()));
      const snap = await getDocs(q);
      if (snap.empty) {
        setError('Código de vendedor incorrecto o no existe.');
      } else {
        const sellerData = { id: snap.docs[0].id, ...snap.docs[0].data() };
        setCurrentSeller(sellerData);
        setAppState('seller');
      }
    } catch (err) {
      setError("Error conectando con la base de datos.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-gray-900 p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500 text-white mb-4 shadow-lg"><IconDiamond /></div>
          <h1 className="text-2xl font-black text-white tracking-tight">Joya<span className="text-amber-500">Panel</span></h1>
          <p className="text-gray-400 text-sm mt-1">Sistema Integrado de Ventas</p>
        </div>

        <div className="flex border-b border-gray-100">
          <button onClick={() => {setLoginMode('seller'); setError('');}} className={`flex-1 py-4 text-sm font-bold transition-colors ${loginMode === 'seller' ? 'text-amber-600 border-b-2 border-amber-500 bg-amber-50/30' : 'text-gray-500 hover:bg-gray-50'}`}>Soy Vendedor</button>
          <button onClick={() => {setLoginMode('admin'); setError('');}} className={`flex-1 py-4 text-sm font-bold transition-colors ${loginMode === 'admin' ? 'text-gray-900 border-b-2 border-gray-900 bg-gray-50/50' : 'text-gray-500 hover:bg-gray-50'}`}>Administrador</button>
        </div>

        <div className="p-8">
          {error && <div className="mb-4 p-3 bg-red-100 text-red-700 text-xs font-bold rounded-xl text-center animate-pulse">{error}</div>}

          {/* FORMULARIO VENDEDOR */}
          {loginMode === 'seller' && (
            <form onSubmit={handleSellerLogin} className="space-y-5 animate-in fade-in slide-in-from-left-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Código de Vendedor</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400"><IconLock /></div>
                  <input type="password" value={sellerCode} onChange={e=>setSellerCode(e.target.value)} required placeholder="Ej. 1234" className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-lg font-bold tracking-widest text-center" />
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full py-3.5 bg-amber-500 text-white font-black rounded-xl shadow-md hover:bg-amber-600 transition-all active:scale-[0.98]">{loading ? 'Verificando...' : 'Entrar a mi Tienda'}</button>
            </form>
          )}

          {/* FORMULARIO ADMIN */}
          {loginMode === 'admin' && (
            <form onSubmit={handleAdminAuth} className="space-y-5 animate-in fade-in slide-in-from-right-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Correo Electrónico</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400"><IconUser /></div>
                  <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 outline-none font-medium" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Contraseña</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400"><IconLock /></div>
                  <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 outline-none font-medium" />
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full py-3.5 bg-gray-900 text-white font-black rounded-xl shadow-md hover:bg-gray-800 transition-all active:scale-[0.98]">{loading ? 'Cargando...' : isRegisteringAdmin ? 'Crear mi Cuenta Admin' : 'Iniciar Sesión Admin'}</button>
              <div className="text-center">
                <button type="button" onClick={() => setIsRegisteringAdmin(!isRegisteringAdmin)} className="text-xs text-gray-500 hover:text-gray-900 font-medium underline">
                  {isRegisteringAdmin ? 'Ya tengo cuenta, iniciar sesión' : '¿Primera vez? Crear cuenta admin'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 2. PANEL DE ADMINISTRADOR
// ==========================================
function AdminDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('sellers');
  const [sellers, setSellers] = useState([]);
  
  // Forms
  const [newSellerName, setNewSellerName] = useState('');
  const [newSellerCode, setNewSellerCode] = useState('');
  const [newInvSeller, setNewInvSeller] = useState('');
  const [newInvDesc, setNewInvDesc] = useState('');
  const [newInvWeight, setNewInvWeight] = useState('');
  const [newInvQty, setNewInvQty] = useState('');
  const [newInvImage, setNewInvImage] = useState('');

  // Payment Modal
  const [payModal, setPayModal] = useState(null); // { sellerId, name, debt }
  const [payAmount, setPayAmount] = useState('');

  // Fetch Sellers Realtime
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'joya_sellers'), (snap) => {
      setSellers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const handleCreateSeller = async (e) => {
    e.preventDefault();
    if(!newSellerName || !newSellerCode) return;
    await addDoc(collection(db, 'joya_sellers'), {
      name: newSellerName,
      code: newSellerCode.trim(),
      totalDebt: 0,
      createdAt: Date.now()
    });
    setNewSellerName(''); setNewSellerCode('');
  };

  const handleAssignInventory = async (e) => {
    e.preventDefault();
    if(!newInvSeller || !newInvDesc || !newInvWeight || !newInvQty) return;
    
    // Agrega el inventario a la subcolección del vendedor seleccionado
    await addDoc(collection(db, 'joya_sellers', newInvSeller, 'inventory'), {
      description: newInvDesc,
      weight: Number(newInvWeight),
      quantity: Number(newInvQty),
      image: newInvImage.trim(),
      cost: Number(newInvWeight) * 40,
      timestamp: Date.now()
    });

    setNewInvDesc(''); setNewInvWeight(''); setNewInvQty(''); setNewInvImage('');
    alert("¡Inventario asignado al vendedor con éxito!");
  };

  const handleReceivePayment = async (e) => {
    e.preventDefault();
    const amount = Number(payAmount);
    if(amount <= 0 || amount > payModal.totalDebt) return;

    // Reducir la deuda del vendedor
    await updateDoc(doc(db, 'joya_sellers', payModal.id), {
      totalDebt: increment(-amount)
    });

    setPayModal(null); setPayAmount('');
  };

  const deleteSeller = async (id) => {
    if(confirm("¿Seguro que deseas eliminar este vendedor?")) {
      await deleteDoc(doc(db, 'joya_sellers', id));
    }
  }

  const globalDebt = sellers.reduce((acc, s) => acc + (s.totalDebt || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gray-900 text-white shadow-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-black text-xl"><IconDiamond /><span className="text-amber-500">ADMIN</span>PANEL</div>
          <button onClick={onLogout} className="flex items-center gap-2 text-xs font-bold bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg transition-colors"><IconLogout /> Salir</button>
        </div>
        <div className="bg-gray-800 overflow-x-auto">
          <div className="max-w-6xl mx-auto px-4 flex gap-1">
            <button onClick={()=>setActiveTab('sellers')} className={`py-3 px-4 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${activeTab==='sellers' ? 'border-amber-500 text-amber-400' : 'border-transparent text-gray-400 hover:text-white'}`}>Vendedores & Cuentas</button>
            <button onClick={()=>setActiveTab('inventory')} className={`py-3 px-4 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${activeTab==='inventory' ? 'border-amber-500 text-amber-400' : 'border-transparent text-gray-400 hover:text-white'}`}>Asignar Inventario</button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === 'sellers' && (
          <div className="space-y-6 animate-in fade-in">
            {/* KPI ADMIN */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Cuentas por Cobrar (Global)</p>
                <p className="text-3xl font-black text-gray-900">Q{globalDebt.toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-1">Suma del costo base de las joyas vendidas por tu equipo.</p>
              </div>
              <div className="hidden sm:flex h-16 w-16 bg-emerald-50 text-emerald-500 rounded-full items-center justify-center"><IconCash /></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* CREAR VENDEDOR */}
              <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-fit">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><IconUser/> Nuevo Vendedor</h2>
                <form onSubmit={handleCreateSeller} className="space-y-4">
                  <div><label className="block text-xs font-bold text-gray-700 mb-1">Nombre</label><input type="text" value={newSellerName} onChange={e=>setNewSellerName(e.target.value)} required className="w-full px-3 py-2 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-amber-500" /></div>
                  <div><label className="block text-xs font-bold text-gray-700 mb-1">Código de Acceso (PIN)</label><input type="text" value={newSellerCode} onChange={e=>setSellerCode(e.target.value)} required placeholder="Ej. 1234" className="w-full px-3 py-2 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-bold tracking-widest" /></div>
                  <button type="submit" className="w-full py-2.5 bg-gray-900 text-white font-bold rounded-xl shadow-sm hover:bg-gray-800">Crear Vendedor</button>
                </form>
              </div>

              {/* LISTA VENDEDORES */}
              <div className="lg:col-span-2 space-y-4">
                <h2 className="text-lg font-bold text-gray-900">Equipo y Cuentas</h2>
                {sellers.length === 0 ? <div className="bg-white p-8 rounded-2xl text-center text-gray-500 border border-gray-100">Aún no tienes vendedores.</div> : 
                  sellers.map(s => (
                    <div key={s.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center font-black text-xl">{s.name.charAt(0)}</div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg leading-tight">{s.name}</h3>
                          <p className="text-xs font-bold text-gray-400">PIN: <span className="text-gray-600">{s.code}</span></p>
                        </div>
                      </div>
                      <div className="flex flex-col sm:items-end w-full sm:w-auto">
                        <div className="bg-red-50 px-3 py-1.5 rounded-lg border border-red-100 mb-2">
                          <span className="text-[10px] uppercase font-bold text-red-800 block">Deuda Costo Base</span>
                          <span className="font-black text-red-600">Q{(s.totalDebt || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                          <button onClick={() => deleteSeller(s.id)} className="p-2 bg-gray-100 text-gray-500 rounded-lg hover:bg-red-100 hover:text-red-600"><IconTrash/></button>
                          <button onClick={() => setPayModal(s)} disabled={s.totalDebt <= 0} className={`flex-1 sm:flex-none px-4 py-2 font-bold text-xs rounded-lg ${s.totalDebt <= 0 ? 'bg-gray-100 text-gray-400' : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm'}`}>Recibir Abono</button>
                        </div>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 animate-in fade-in max-w-3xl mx-auto">
            <h2 className="text-xl font-bold mb-6 text-gray-900 flex items-center gap-2"><IconBox/> Enviar Mercadería a Vendedor</h2>
            
            {sellers.length === 0 ? (
              <div className="p-4 bg-amber-50 text-amber-800 rounded-xl font-medium text-sm">Primero debes crear un vendedor en la otra pestaña.</div>
            ) : (
              <form onSubmit={handleAssignInventory} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Seleccionar Vendedor</label>
                  <select value={newInvSeller} onChange={e=>setNewInvSeller(e.target.value)} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-bold">
                    <option value="">-- Elige a quién enviar --</option>
                    {sellers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                
                <div><label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Descripción de la Joya</label><input type="text" value={newInvDesc} onChange={e=>setNewInvDesc(e.target.value)} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500" /></div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Peso (g)</label><input type="number" step="0.01" value={newInvWeight} onChange={e=>setNewInvWeight(e.target.value)} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500" /></div>
                  <div><label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Cantidad a entregar</label><input type="number" value={newInvQty} onChange={e=>setNewInvQty(e.target.value)} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500" /></div>
                </div>

                <div><label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">URL Foto (Opcional)</label><input type="url" value={newInvImage} onChange={e=>setNewInvImage(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500" /></div>

                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex justify-between items-center">
                  <span className="text-xs font-bold text-amber-800 uppercase">Costo Base Generado:</span>
                  <span className="text-xl font-black text-amber-600">Q{(Number(newInvWeight||0)*40).toFixed(2)}</span>
                </div>
                <p className="text-[10px] text-gray-400 text-center uppercase font-bold">El vendedor no debe este dinero hasta que venda el producto.</p>

                <button type="submit" className="w-full py-4 bg-gray-900 text-white font-black rounded-xl shadow-md hover:bg-gray-800 transition-all">Asignar Inventario a Vendedor</button>
              </form>
            )}
          </div>
        )}
      </main>

      {/* MODAL COBRAR AL VENDEDOR */}
      {payModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="bg-gray-900 p-5 flex justify-between items-center text-white">
              <h3 className="font-black">Registrar Abono de Vendedor</h3>
              <button onClick={() => setPayModal(null)}><IconClose/></button>
            </div>
            <form onSubmit={handleReceivePayment} className="p-6 space-y-5">
              <div className="text-center mb-2">
                <p className="text-xs font-bold text-gray-400 uppercase">Vendedor</p>
                <p className="text-lg font-black text-gray-900">{payModal.name}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex justify-between items-center">
                <span className="text-xs font-bold text-red-800 uppercase">Deuda Actual:</span>
                <span className="text-2xl font-black text-red-600">Q{payModal.totalDebt.toFixed(2)}</span>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Monto Recibido (Q)</label>
                <input type="number" step="0.01" max={payModal.totalDebt} value={payAmount} onChange={e=>setPayAmount(e.target.value)} required className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-center font-black text-2xl text-emerald-600" />
              </div>
              <button type="submit" className="w-full py-4 bg-emerald-500 text-white font-black rounded-xl shadow-md hover:bg-emerald-600">Confirmar Abono</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 3. PANEL DE VENDEDOR (TIENDA / POS)
// ==========================================
function SellerDashboard({ seller, onLogout }) {
  const [activeTab, setActiveTab] = useState('pos');
  const [inventory, setInventory] = useState([]);
  const [salesHistory, setSalesHistory] = useState([]);
  
  // Cart & POS
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [initialPayment, setInitialPayment] = useState('');

  // Detalles Ordenes (Abonos de CLIENTES al vendedor)
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [abonoModalOpen, setAbonoModalOpen] = useState(false);
  const [abonoOrder, setAbonoOrder] = useState(null);
  const [abonoAmount, setAbonoAmount] = useState('');

  // Fetch Inventory and Sales scoped to THIS SELLER
  useEffect(() => {
    const invRef = collection(db, 'joya_sellers', seller.id, 'inventory');
    const salesRef = collection(db, 'joya_sellers', seller.id, 'sales');

    const unsubInv = onSnapshot(invRef, snap => setInventory(snap.docs.map(d => ({id: d.id, ...d.data()}))) );
    const unsubSales = onSnapshot(salesRef, snap => setSalesHistory(snap.docs.map(d => ({id: d.id, ...d.data()})).sort((a,b)=>b.timestamp - a.timestamp)) );
    
    return () => { unsubInv(); unsubSales(); };
  }, [seller.id]);

  const addToCart = (item) => setCart([...cart, { ...item, cartId: Date.now() + Math.random() }]);
  const removeFromCart = (cartId) => setCart(cart.filter(c => c.cartId !== cartId));
  const cartTotal = cart.reduce((sum, item) => sum + item.saleTotal, 0);

  const processCheckout = async (e) => {
    e.preventDefault();
    if (!customerName || cart.length === 0) return;
    const payAmt = Number(initialPayment);
    if (payAmt > cartTotal) return;

    const baseCostTotal = cart.reduce((sum, item) => sum + item.baseCostTotal, 0);
    const balance = cartTotal - payAmt;

    const orderData = {
      orderNumber: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName,
      items: cart,
      saleTotal: cartTotal,
      baseCostTotal,
      profit: cartTotal - baseCostTotal,
      paidAmount: payAmt,
      balance,
      status: balance <= 0 ? 'Pagada' : 'Pendiente',
      date: new Date().toLocaleString(),
      timestamp: Date.now()
    };

    // 1. Guardar Venta en el historial del vendedor
    await addDoc(collection(db, 'joya_sellers', seller.id, 'sales'), orderData);

    // 2. Descontar Inventario del Vendedor
    for (const cItem of cart) {
      const invItem = inventory.find(i => i.id === cItem.inventoryId);
      if (invItem) {
        await updateDoc(doc(db, 'joya_sellers', seller.id, 'inventory', invItem.id), { quantity: invItem.quantity - cItem.quantity });
      }
    }

    // 3. SUMAR LA DEUDA AL ADMINISTRADOR (El Vendedor le debe el costo base al Admin)
    await updateDoc(doc(db, 'joya_sellers', seller.id), {
      totalDebt: increment(baseCostTotal)
    });

    setCart([]); setCheckoutModalOpen(false); setIsCartOpen(false); setCustomerName(''); setInitialPayment('');
    setActiveTab('history');
  };

  const processAbonoCliente = async (e) => {
    e.preventDefault();
    const amount = Number(abonoAmount);
    if (amount <= 0 || amount > abonoOrder.balance) return;

    const newPaidAmount = abonoOrder.paidAmount + amount;
    const newBalance = abonoOrder.saleTotal - newPaidAmount;
    
    await updateDoc(doc(db, 'joya_sellers', seller.id, 'sales', abonoOrder.id), {
      paidAmount: newPaidAmount, balance: newBalance, status: newBalance <= 0 ? 'Pagada' : 'Pendiente'
    });

    setAbonoModalOpen(false); setAbonoAmount(''); setAbonoOrder(null);
  };

  // UI Components inside Seller Dashboard
  const SalesCard = ({ item }) => {
    const suggestedPrice = item.weight * 80;
    const [currentPrice, setCurrentPrice] = useState(suggestedPrice);
    const [sellQuantity, setSellQuantity] = useState(1);
    const cartQty = cart.filter(c => c.inventoryId === item.id).reduce((a,b)=>a+b.quantity, 0);
    const availableQty = item.quantity - cartQty;
    const difference = currentPrice - suggestedPrice;

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        <div className="h-40 w-full bg-gray-50 relative">
          {item.image ? <img src={item.image} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full text-gray-300"><IconDiamond/></div>}
          <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded-md text-xs font-bold text-gray-700 shadow-sm">Stock: {availableQty}</div>
        </div>
        <div className="p-4 flex-grow flex flex-col">
          <h3 className="font-bold text-gray-800 mb-1 leading-tight">{item.description}</h3>
          <p className="text-gray-500 text-xs mb-3">Peso: {item.weight}g</p>
          <div className="mt-auto space-y-2">
            <div><label className="text-[10px] font-bold text-gray-400 uppercase">Precio Unitario</label><input type="number" value={currentPrice} onChange={e=>setCurrentPrice(Number(e.target.value))} className="w-full px-2 py-1.5 bg-gray-50 border rounded-lg text-sm font-bold outline-none focus:ring-2 focus:ring-amber-500"/></div>
            <div className={`text-[10px] font-bold text-center py-1 rounded-md ${difference < -0.01 ? 'bg-red-50 text-red-600' : difference > 0.01 ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
              {difference < -0.01 ? `Descuento: Q${Math.abs(difference).toFixed(2)}` : difference > 0.01 ? `Ganancia extra: Q${difference.toFixed(2)}` : 'Precio Sugerido'}
            </div>
            <div className="flex gap-2">
              <input type="number" min="1" max={availableQty} value={sellQuantity} onChange={e=>setSellQuantity(Number(e.target.value))} className="w-1/3 px-2 py-1.5 border rounded-lg text-sm font-bold outline-none focus:ring-2 focus:ring-amber-500 text-center"/>
              <button onClick={() => addToCart({ inventoryId: item.id, description: item.description, quantity: sellQuantity, salePrice: currentPrice, saleTotal: currentPrice * sellQuantity, baseCostTotal: (item.weight * 40) * sellQuantity, priceMsg: difference < -0.01 ? `Desc Q${Math.abs(difference).toFixed(2)}` : '' })} disabled={availableQty <= 0} className={`w-2/3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider text-white ${availableQty <= 0 ? 'bg-gray-200 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-600 shadow-sm'}`}>Añadir</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-amber-100 text-amber-600 p-2 rounded-full"><IconUser /></div>
            <div><p className="text-[10px] uppercase font-black text-gray-400 leading-none">Vendedor</p><h1 className="font-black text-gray-900 leading-tight">{seller.name}</h1></div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setIsCartOpen(true)} className="md:hidden relative p-2 text-gray-600"><IconCart />{cart.length > 0 && <span className="absolute 0 right-0 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">{cart.length}</span>}</button>
            <button onClick={onLogout} className="text-gray-400 hover:text-gray-800"><IconLogout/></button>
          </div>
        </div>
        <div className="bg-gray-50 border-t border-gray-200 overflow-x-auto">
          <div className="max-w-7xl mx-auto px-4 flex gap-1">
            <button onClick={()=>setActiveTab('pos')} className={`py-3 px-4 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${activeTab==='pos' ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-900'}`}>Hacer Venta</button>
            <button onClick={()=>setActiveTab('history')} className={`py-3 px-4 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${activeTab==='history' ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-900'}`}>Mis Clientes / Historial</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
        <div className={`flex-1 ${activeTab === 'pos' && isCartOpen ? 'hidden md:block' : 'block'}`}>
          {activeTab === 'pos' && (
            <div className="animate-in fade-in">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black text-gray-900">Catálogo de Joyas</h2>
                <button onClick={()=>setIsCartOpen(!isCartOpen)} className="hidden md:flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-bold"><IconCart /> Carrito ({cart.length})</button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {inventory.map(item => <SalesCard key={item.id} item={item} />)}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="animate-in fade-in space-y-6">
              {/* Vendedor Info Resumen */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100"><p className="text-xs font-bold text-gray-400 uppercase">Mis Ventas Totales</p><p className="text-2xl font-black text-gray-900">Q{salesHistory.reduce((a,b)=>a+b.saleTotal, 0).toFixed(2)}</p></div>
                <div className="bg-red-50 p-5 rounded-2xl shadow-sm border border-red-100"><p className="text-xs font-bold text-red-800 uppercase">Debo a mi Proveedor (Costo)</p><p className="text-2xl font-black text-red-600">Q{seller.totalDebt ? seller.totalDebt.toFixed(2) : '0.00'}</p></div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead><tr className="bg-gray-50 text-gray-500 text-[10px] uppercase font-black"><th className="p-4">Orden / Cliente</th><th className="p-4">Venta</th><th className="p-4">Deuda Cliente</th><th className="p-4 text-right">Acción</th></tr></thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                      {salesHistory.map(sale => (
                        <tr key={sale.id}>
                          <td className="p-4"><div className="font-bold text-gray-900">{sale.orderNumber}</div><div className="text-xs text-gray-500">{sale.customerName}</div></td>
                          <td className="p-4 font-black">Q{sale.saleTotal.toFixed(2)}</td>
                          <td className="p-4"><div className={`text-xs font-bold ${sale.status==='Pagada'?'text-emerald-500':'text-red-500'}`}>{sale.status==='Pagada' ? 'Pagado' : `Debe Q${sale.balance.toFixed(2)}`}</div></td>
                          <td className="p-4 flex justify-end gap-2">
                            {sale.status === 'Pendiente' && <button onClick={()=>{setAbonoOrder(sale); setAbonoModalOpen(true);}} className="text-[10px] uppercase font-black bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg">Abonar</button>}
                            <button onClick={()=>setSelectedOrderDetails(sale)} className="text-[10px] uppercase font-black bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg">Detalle</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CARRITO LATERAL */}
        {activeTab === 'pos' && isCartOpen && (
          <div className="fixed inset-0 z-40 flex md:relative md:w-80 md:flex-shrink-0 animate-in slide-in-from-right">
            <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm md:hidden" onClick={()=>setIsCartOpen(false)}></div>
            <div className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-2xl flex flex-col md:relative md:rounded-2xl md:border md:h-[calc(100vh-160px)]">
              <div className="p-4 border-b bg-gray-50 flex justify-between items-center"><h3 className="font-black text-gray-900 flex items-center gap-2"><IconCart/> Carrito</h3><button onClick={()=>setIsCartOpen(false)} className="md:hidden"><IconClose/></button></div>
              <div className="flex-grow overflow-y-auto p-4 space-y-3">
                {cart.length===0 ? <div className="text-center text-gray-400 mt-10 text-xs font-bold uppercase">Vacío</div> : cart.map(c => (
                  <div key={c.cartId} className="bg-white border rounded-xl p-3 relative"><p className="text-sm font-bold truncate pr-6">{c.description}</p><div className="flex justify-between mt-2 text-xs"><span className="font-bold text-gray-500">{c.quantity} un.</span><span className="font-black">Q{c.saleTotal.toFixed(2)}</span></div><button onClick={()=>removeFromCart(c.cartId)} className="absolute right-2 top-2 text-gray-300 hover:text-red-500"><IconTrash/></button></div>
                ))}
              </div>
              <div className="p-4 border-t bg-gray-50">
                <div className="flex justify-between items-center mb-4"><span className="font-bold text-gray-500 text-sm">TOTAL:</span><span className="text-2xl font-black text-gray-900">Q{cartTotal.toFixed(2)}</span></div>
                <button onClick={()=>setCheckoutModalOpen(true)} disabled={cart.length===0} className="w-full py-3.5 bg-amber-500 text-white font-black rounded-xl shadow-md disabled:bg-gray-200">Cobrar al Cliente</button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODALES DEL VENDEDOR */}
      {checkoutModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="bg-gray-900 p-4 text-white flex justify-between items-center"><h3 className="font-black">Completar Venta</h3><button onClick={()=>setCheckoutModalOpen(false)}><IconClose/></button></div>
            <form onSubmit={processCheckout} className="p-6 space-y-4">
              <div className="bg-amber-50 p-4 rounded-xl text-center"><p className="text-xs font-bold text-amber-800 uppercase">Cobrar</p><p className="text-3xl font-black text-amber-600">Q{cartTotal.toFixed(2)}</p></div>
              <div><label className="block text-xs font-bold text-gray-700 mb-1">Nombre Cliente</label><input type="text" value={customerName} onChange={e=>setCustomerName(e.target.value)} required className="w-full px-4 py-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-amber-500" /></div>
              <div><label className="block text-xs font-bold text-gray-700 mb-1">Pago Inicial del Cliente</label><input type="number" step="0.01" max={cartTotal} value={initialPayment} onChange={e=>setInitialPayment(e.target.value)} required placeholder="0.00" className="w-full px-4 py-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-black text-lg" /></div>
              {cartTotal - Number(initialPayment) > 0 && <p className="text-xs text-red-500 font-bold text-center">Deuda generada para el cliente: Q{(cartTotal - Number(initialPayment)).toFixed(2)}</p>}
              <button type="submit" className="w-full py-4 bg-gray-900 text-white font-black rounded-xl shadow-md mt-2">Vender y Actualizar Stock</button>
            </form>
          </div>
        </div>
      )}

      {abonoModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="p-5 border-b flex justify-between"><h3 className="font-black">Abono de Cliente</h3><button onClick={()=>setAbonoModalOpen(false)}><IconClose/></button></div>
            <form onSubmit={processAbonoCliente} className="p-6 space-y-5">
              <div className="bg-red-50 p-3 rounded-xl flex justify-between items-center"><span className="text-xs font-bold text-red-800">Saldo del Cliente:</span><span className="font-black text-red-600 text-lg">Q{abonoOrder?.balance.toFixed(2)}</span></div>
              <div><label className="block text-xs font-bold text-gray-700 mb-1">Monto (Q)</label><input type="number" step="0.01" max={abonoOrder?.balance} value={abonoAmount} onChange={e=>setAbonoAmount(e.target.value)} required className="w-full px-4 py-3 bg-gray-50 border rounded-xl font-black text-emerald-600 text-xl outline-none focus:ring-2 focus:ring-emerald-500" /></div>
              <button type="submit" className="w-full py-3.5 bg-emerald-500 text-white font-black rounded-xl shadow-md">Guardar Abono</button>
            </form>
          </div>
        </div>
      )}

      {selectedOrderDetails && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b bg-gray-50 flex justify-between"><h3 className="font-black text-gray-900">Orden {selectedOrderDetails.orderNumber}</h3><button onClick={()=>setSelectedOrderDetails(null)}><IconClose/></button></div>
            <div className="p-5 overflow-y-auto space-y-4 text-sm">
              <div className="bg-gray-100 p-3 rounded-xl grid grid-cols-2 gap-2 text-xs font-bold text-gray-600"><p>Cliente: {selectedOrderDetails.customerName}</p><p>Estado: <span className={selectedOrderDetails.status==='Pagada'?'text-emerald-500':'text-red-500'}>{selectedOrderDetails.status}</span></p></div>
              <div>
                <h4 className="font-black text-gray-800 mb-2">Artículos Vendidos</h4>
                <div className="space-y-2">
                  {selectedOrderDetails.items.map((it, idx) => (
                    <div key={idx} className="border p-3 rounded-xl"><p className="font-bold flex justify-between"><span>{it.quantity}x {it.description}</span><span>Q{it.saleTotal.toFixed(2)}</span></p><p className="text-[10px] text-red-500 font-bold mt-1 uppercase">Costo Base que debes al admin: Q{it.baseCostTotal.toFixed(2)}</p></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}