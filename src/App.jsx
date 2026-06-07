import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';

// --- CONFIGURACIÓN DE FIREBASE ---
let app, auth, db, appId;

try {
  // Soporte dual: Entorno de Canvas o Entorno Vercel (con variables .env)
  if (typeof __firebase_config !== 'undefined') {
    app = initializeApp(JSON.parse(__firebase_config));
    appId = typeof __app_id !== 'undefined' ? __app_id : 'joyapanel-app';
  } else {
    app = initializeApp({
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID
    });
    appId = 'joyapanel-app';
  }
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.error("Error inicializando Firebase:", error);
}

// --- ICONOS SVG ---
const IconDiamond = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h12l4 6-10 13L2 9Z"/><path d="M11 3 8 9l4 13 4-13-3-6"/><path d="M2 9h20"/></svg>;
const IconList = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>;
const IconTag = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/></svg>;
const IconHistory = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>;
const IconWallet = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>;
const IconImage = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>;
const IconEdit = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>;
const IconTrash = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>;
const IconCart = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>;
const IconClose = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>;
const IconInfo = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>;

// --- COMPONENTES SECUNDARIOS ---

// Tarjeta de Ventas
const SalesCard = ({ item, onAddToCart, cartQty }) => {
  const suggestedPrice = item.weight * 80;
  const [currentPrice, setCurrentPrice] = useState(suggestedPrice);
  const [sellQuantity, setSellQuantity] = useState(1);
  const [errorMsg, setErrorMsg] = useState('');

  const availableQty = item.quantity - cartQty;
  const difference = currentPrice - suggestedPrice;
  
  let priceMessage = "Precio sugerido (Normal)";
  let messageColor = "text-gray-500 bg-gray-100";

  if (difference < -0.01) {
    priceMessage = `Descuento: Q${Math.abs(difference).toFixed(2)}`;
    messageColor = "text-red-700 bg-red-100 border border-red-200";
  } else if (difference > 0.01) {
    priceMessage = `Ganancia extra: Q${difference.toFixed(2)}`;
    messageColor = "text-emerald-700 bg-emerald-100 border border-emerald-200";
  }

  const handleAdd = () => {
    if (sellQuantity > availableQty || sellQuantity <= 0) {
      setErrorMsg("Cantidad inválida");
      setTimeout(() => setErrorMsg(''), 2000);
      return;
    }
    
    onAddToCart({
      inventoryId: item.id,
      description: item.description,
      quantity: sellQuantity,
      salePrice: currentPrice,
      baseCostTotal: (item.weight * 40) * sellQuantity,
      saleTotal: currentPrice * sellQuantity,
      profit: (currentPrice * sellQuantity) - ((item.weight * 40) * sellQuantity),
      priceMessage
    });

    setSellQuantity(1);
    setCurrentPrice(suggestedPrice);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
      <div className="h-40 w-full bg-gray-50 relative">
        {item.image ? (
          <img src={item.image} alt={item.description} className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400"><IconImage /></div>
        )}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-semibold text-gray-700 shadow-sm">
          Stock: {availableQty}
        </div>
      </div>
      
      <div className="p-4 flex-grow flex flex-col">
        <h3 className="font-bold text-gray-800 text-base mb-1 truncate">{item.description}</h3>
        <p className="text-gray-500 text-xs mb-3">Peso: {item.weight}g | Costo: Q{(item.weight*40).toFixed(2)}</p>

        <div className="mt-auto space-y-3">
          <div>
            <label className="block text-[10px] font-medium text-gray-500 uppercase mb-1">Precio Unitario (Q)</label>
            <input 
              type="number" 
              value={currentPrice}
              onChange={(e) => setCurrentPrice(Number(e.target.value))}
              className="w-full px-3 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
              step="0.01"
            />
          </div>

          <div className={`px-2 py-1.5 rounded text-[10px] font-medium text-center ${messageColor}`}>
            {priceMessage}
          </div>

          <div className="flex gap-2 items-end">
            <div className="w-1/3">
              <label className="block text-[10px] font-medium text-gray-500 uppercase mb-1">Cant.</label>
              <input 
                type="number" 
                min="1" 
                max={availableQty}
                value={sellQuantity}
                onChange={(e) => setSellQuantity(Number(e.target.value))}
                className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
            <button 
              onClick={handleAdd}
              disabled={availableQty === 0}
              className={`w-2/3 py-1.5 px-2 rounded-lg font-semibold text-sm transition-all shadow-sm ${
                availableQty === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-600 text-white'
              }`}
            >
              {availableQty === 0 ? 'Agotado' : 'Añadir'}
            </button>
          </div>
          {errorMsg && <div className="text-center text-xs text-red-600 font-medium animate-pulse">{errorMsg}</div>}
        </div>
      </div>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---
export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('inventory');
  
  // Datos Globales
  const [inventory, setInventory] = useState([]);
  const [salesHistory, setSalesHistory] = useState([]);
  const [providerPayments, setProviderPayments] = useState([]);

  // Estados Inventario
  const [newDesc, setNewDesc] = useState('');
  const [newWeight, setNewWeight] = useState('');
  const [newQty, setNewQty] = useState('');
  const [newImage, setNewImage] = useState('');
  const [formError, setFormError] = useState('');
  const [editingItem, setEditingItem] = useState(null);

  // Estados Ventas y Carrito
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Efectivo');
  const [initialPayment, setInitialPayment] = useState('');

  // Estados Historial
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [abonoModalOpen, setAbonoModalOpen] = useState(false);
  const [abonoOrder, setAbonoOrder] = useState(null);
  const [abonoAmount, setAbonoAmount] = useState('');
  const [abonoMethod, setAbonoMethod] = useState('Efectivo');

  // Estados Finanzas
  const [providerModalOpen, setProviderModalOpen] = useState(false);
  const [providerPaymentAmount, setProviderPaymentAmount] = useState('');
  const [providerPaymentMethod, setProviderPaymentMethod] = useState('Transferencia');

  // Inicializar Autenticación
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Auth error:", err);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // Escuchar Datos de Firestore
  useEffect(() => {
    if (!user) return;

    // Rutas seguras de usuario (Funciona en Canvas y Vercel)
    const getPath = (colName) => collection(db, 'artifacts', appId, 'users', user.uid, colName);

    const unsubInv = onSnapshot(getPath('inventory'), (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setInventory(data.sort((a, b) => b.timestamp - a.timestamp));
    }, console.error);

    const unsubSales = onSnapshot(getPath('sales'), (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setSalesHistory(data.sort((a, b) => b.timestamp - a.timestamp));
    }, console.error);

    const unsubProv = onSnapshot(getPath('providerPayments'), (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setProviderPayments(data.sort((a, b) => b.timestamp - a.timestamp));
    }, console.error);

    return () => { unsubInv(); unsubSales(); unsubProv(); };
  }, [user]);

  // Funciones de Ayuda Firebase
  const getColRef = (colName) => collection(db, 'artifacts', appId, 'users', user.uid, colName);
  const getDocRef = (colName, docId) => doc(db, 'artifacts', appId, 'users', user.uid, colName, docId);

  // --- LÓGICA INVENTARIO ---
  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newDesc || !newWeight || !newQty) {
      setFormError("Llena descripción, peso y cantidad.");
      setTimeout(() => setFormError(''), 3000);
      return;
    }
    await addDoc(getColRef('inventory'), {
      description: newDesc,
      weight: Number(newWeight),
      quantity: Number(newQty),
      image: newImage.trim(),
      cost: Number(newWeight) * 40,
      timestamp: Date.now()
    });
    setNewDesc(''); setNewWeight(''); setNewQty(''); setNewImage('');
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    await updateDoc(getDocRef('inventory', editingItem.id), {
      description: editingItem.description,
      weight: Number(editingItem.weight),
      quantity: Number(editingItem.quantity),
      image: editingItem.image,
      cost: Number(editingItem.weight) * 40
    });
    setEditingItem(null);
  };

  const deleteItem = async (id) => await deleteDoc(getDocRef('inventory', id));

  // --- LÓGICA CARRITO Y VENTAS ---
  const handleAddToCart = (item) => {
    const newCartItem = { ...item, cartId: Date.now() + Math.random() };
    setCart([...cart, newCartItem]);
  };
  
  const removeFromCart = (cartId) => setCart(cart.filter(c => c.cartId !== cartId));
  const cartTotal = cart.reduce((sum, item) => sum + item.saleTotal, 0);

  const processCheckout = async (e) => {
    e.preventDefault();
    if (!customerName || cart.length === 0) return;

    const paymentAmount = Number(initialPayment);
    if (paymentAmount > cartTotal) return;

    const baseCostTotal = cart.reduce((sum, item) => sum + item.baseCostTotal, 0);
    const balance = cartTotal - paymentAmount;
    
    const newOrder = {
      orderNumber: `JOY-${Math.floor(10000 + Math.random() * 90000)}`,
      customerName,
      customerPhone,
      items: cart,
      saleTotal: cartTotal,
      baseCostTotal,
      profit: cartTotal - baseCostTotal,
      paidAmount: paymentAmount,
      balance,
      status: balance <= 0 ? 'Pagada' : 'Pendiente',
      date: new Date().toLocaleString(),
      timestamp: Date.now(),
      payments: paymentAmount > 0 ? [{ id: Date.now(), date: new Date().toLocaleString(), amount: paymentAmount, method: paymentMethod, type: 'Inicial' }] : []
    };

    await addDoc(getColRef('sales'), newOrder);

    // Descontar Inventario
    for (const cItem of cart) {
      const invItem = inventory.find(i => i.id === cItem.inventoryId);
      if (invItem) {
        await updateDoc(getDocRef('inventory', invItem.id), { quantity: invItem.quantity - cItem.quantity });
      }
    }

    setCart([]); setCheckoutModalOpen(false); setIsCartOpen(false);
    setCustomerName(''); setCustomerPhone(''); setInitialPayment('');
    setActiveTab('history');
  };

  // --- LÓGICA ABONOS ---
  const processAbonoCliente = async (e) => {
    e.preventDefault();
    const amount = Number(abonoAmount);
    if (amount <= 0 || amount > abonoOrder.balance) return;

    const newPaidAmount = abonoOrder.paidAmount + amount;
    const newBalance = abonoOrder.saleTotal - newPaidAmount;
    
    await updateDoc(getDocRef('sales', abonoOrder.id), {
      paidAmount: newPaidAmount,
      balance: newBalance,
      status: newBalance <= 0 ? 'Pagada' : 'Pendiente',
      payments: [...abonoOrder.payments, { id: Date.now(), date: new Date().toLocaleString(), amount, method: abonoMethod, type: 'Abono' }]
    });

    setAbonoModalOpen(false); setAbonoAmount(''); setAbonoOrder(null);
  };

  const processAbonoProveedor = async (e) => {
    e.preventDefault();
    const amount = Number(providerPaymentAmount);
    if (amount <= 0 || amount > currentProviderDebt) return;
    
    await addDoc(getColRef('providerPayments'), {
      date: new Date().toLocaleString(),
      amount,
      method: providerPaymentMethod,
      timestamp: Date.now()
    });

    setProviderModalOpen(false); setProviderPaymentAmount('');
  };

  // --- CÁLCULOS FINANZAS ---
  const totalBaseCostOwed = salesHistory.reduce((acc, s) => acc + s.baseCostTotal, 0);
  const totalProviderPaid = providerPayments.reduce((acc, p) => acc + p.amount, 0);
  const currentProviderDebt = totalBaseCostOwed - totalProviderPaid;
  const totalSalesRevenue = salesHistory.reduce((acc, s) => acc + s.saleTotal, 0);
  const totalNetProfit = salesHistory.reduce((acc, s) => acc + s.profit, 0);

  if (!user) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-amber-600 font-bold">Cargando Sistema...</div>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 pb-20 md:pb-0">
      {/* HEADER MÓVIL Y WEB */}
      <header className="bg-white shadow-sm sticky top-0 z-30 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-600">
            <IconDiamond />
            <h1 className="text-xl font-bold tracking-tight text-gray-900 hidden sm:block">Joya<span className="text-amber-500">Panel</span></h1>
          </div>
          
          <div className="flex space-x-1 sm:space-x-2 overflow-x-auto no-scrollbar">
            <button onClick={() => setActiveTab('inventory')} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeTab === 'inventory' ? 'bg-amber-50 text-amber-700' : 'text-gray-500 hover:bg-gray-100'}`}>
              <IconList /> <span className="hidden md:inline">Inventario</span>
            </button>
            <button onClick={() => setActiveTab('sales')} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeTab === 'sales' ? 'bg-amber-50 text-amber-700' : 'text-gray-500 hover:bg-gray-100'}`}>
              <IconTag /> <span className="hidden md:inline">Ventas</span>
            </button>
            <button onClick={() => setActiveTab('history')} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeTab === 'history' ? 'bg-amber-50 text-amber-700' : 'text-gray-500 hover:bg-gray-100'}`}>
              <IconHistory /> <span className="hidden md:inline">Historial</span>
            </button>
            <button onClick={() => setActiveTab('finance')} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeTab === 'finance' ? 'bg-amber-50 text-amber-700' : 'text-gray-500 hover:bg-gray-100'}`}>
              <IconWallet /> <span className="hidden md:inline">Finanzas</span>
            </button>
          </div>

          {/* Botón Carrito Flotante Cabecera (Móvil) */}
          {activeTab === 'sales' && (
            <button onClick={() => setIsCartOpen(true)} className="relative p-2 text-gray-600 hover:text-amber-600 md:hidden">
              <IconCart />
              {cart.length > 0 && <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">{cart.length}</span>}
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
        
        {/* CONTENIDO PRINCIPAL */}
        <div className={`flex-1 ${activeTab === 'sales' && isCartOpen ? 'hidden md:block' : 'block'}`}>
          
          {/* TAB: INVENTARIO */}
          {activeTab === 'inventory' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 md:p-6">
                <h2 className="text-lg font-bold mb-4 text-gray-800">Registrar Joya</h2>
                <form onSubmit={handleAddItem} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="sm:col-span-2">
                    <input type="text" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Descripción (Ej. Pulsera Oro)" className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" required />
                  </div>
                  <div>
                    <input type="number" step="0.01" value={newWeight} onChange={(e) => setNewWeight(e.target.value)} placeholder="Peso (g)" className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" required />
                  </div>
                  <div>
                    <input type="number" value={newQty} onChange={(e) => setNewQty(e.target.value)} placeholder="Cantidad" className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" required />
                  </div>
                  <div className="sm:col-span-2 md:col-span-3">
                    <input type="url" value={newImage} onChange={(e) => setNewImage(e.target.value)} placeholder="URL de Imagen (Opcional)" className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
                  </div>
                  <button type="submit" className="w-full py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">Guardar</button>
                </form>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse whitespace-nowrap">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                        <th className="p-4 font-medium border-b">Joya</th>
                        <th className="p-4 font-medium border-b">Peso</th>
                        <th className="p-4 font-medium border-b">Stock</th>
                        <th className="p-4 font-medium border-b">Costo</th>
                        <th className="p-4 font-medium border-b">Precio Sug.</th>
                        <th className="p-4 font-medium border-b text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                      {inventory.map(item => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="p-4 font-medium text-gray-800 flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-gray-100 overflow-hidden shrink-0">{item.image ? <img src={item.image} className="w-full h-full object-cover"/> : <IconImage/>}</div>
                            <span className="truncate max-w-[150px] sm:max-w-xs">{item.description}</span>
                          </td>
                          <td className="p-4">{item.weight}g</td>
                          <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-semibold ${item.quantity>0?'bg-emerald-100 text-emerald-700':'bg-red-100 text-red-700'}`}>{item.quantity}</span></td>
                          <td className="p-4">Q{item.cost.toFixed(2)}</td>
                          <td className="p-4 font-semibold">Q{(item.weight*80).toFixed(2)}</td>
                          <td className="p-4 flex justify-end gap-2">
                            <button onClick={() => setEditingItem(item)} className="p-1.5 text-blue-600 bg-blue-50 rounded"><IconEdit /></button>
                            <button onClick={() => deleteItem(item.id)} className="p-1.5 text-red-600 bg-red-50 rounded"><IconTrash /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: VENTAS */}
          {activeTab === 'sales' && (
            <div>
              <div className="mb-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Catálogo de Venta</h2>
                <button onClick={() => setIsCartOpen(!isCartOpen)} className="hidden md:flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-600">
                  <IconCart /> {isCartOpen ? 'Ocultar Carrito' : 'Ver Carrito'} {cart.length > 0 && `(${cart.length})`}
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {inventory.map(item => (
                  <SalesCard 
                    key={item.id} 
                    item={item} 
                    onAddToCart={handleAddToCart}
                    cartQty={cart.filter(c => c.inventoryId === item.id).reduce((a,b)=>a+b.quantity, 0)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* TAB: HISTORIAL */}
          {activeTab === 'history' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-100"><h2 className="text-lg font-bold text-gray-800">Órdenes de Venta</h2></div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                      <th className="p-4 font-medium border-b">Orden / Cliente</th>
                      <th className="p-4 font-medium border-b">Total</th>
                      <th className="p-4 font-medium border-b">Pagado</th>
                      <th className="p-4 font-medium border-b">Saldo</th>
                      <th className="p-4 font-medium border-b">Estado</th>
                      <th className="p-4 font-medium border-b text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {salesHistory.map(order => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="p-4">
                          <div className="font-bold text-gray-800">{order.orderNumber}</div>
                          <div className="text-xs text-gray-500">{order.customerName} - {order.date.split(',')[0]}</div>
                        </td>
                        <td className="p-4 font-bold text-gray-900">Q{order.saleTotal.toFixed(2)}</td>
                        <td className="p-4 text-emerald-600">Q{order.paidAmount.toFixed(2)}</td>
                        <td className="p-4 text-red-600 font-semibold">Q{order.balance.toFixed(2)}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${order.status==='Pagada'?'bg-emerald-100 text-emerald-700':'bg-amber-100 text-amber-700'}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="p-4 flex items-center justify-end gap-2">
                          {order.status === 'Pendiente' && (
                            <button onClick={() => {setAbonoOrder(order); setAbonoModalOpen(true);}} className="text-xs bg-amber-500 text-white px-2 py-1 rounded hover:bg-amber-600">Abonar</button>
                          )}
                          <button onClick={() => setSelectedOrderDetails(order)} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200">Ver Detalles</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: FINANZAS (PROVEEDOR) */}
          {activeTab === 'finance' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                  <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Ventas Históricas</div>
                  <div className="text-2xl font-bold text-gray-900">Q{totalSalesRevenue.toFixed(2)}</div>
                </div>
                <div className="bg-amber-50 p-5 rounded-xl shadow-sm border border-amber-200 relative overflow-hidden">
                  <div className="text-xs font-semibold text-amber-700 uppercase mb-1">Deuda Proveedor (Costo Base)</div>
                  <div className="text-2xl font-bold text-amber-600">Q{currentProviderDebt.toFixed(2)}</div>
                  <button onClick={() => setProviderModalOpen(true)} className="absolute right-4 top-1/2 -translate-y-1/2 bg-amber-500 text-white text-xs px-3 py-1.5 rounded-lg font-bold shadow-sm hover:bg-amber-600">Pagar</button>
                </div>
                <div className="bg-emerald-50 p-5 rounded-xl shadow-sm border border-emerald-200">
                  <div className="text-xs font-semibold text-emerald-700 uppercase mb-1">Ganancia Neta</div>
                  <div className="text-2xl font-bold text-emerald-600">Q{totalNetProfit.toFixed(2)}</div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-100"><h2 className="text-lg font-bold text-gray-800">Historial de Pagos al Proveedor</h2></div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                        <th className="p-4 font-medium border-b">Fecha</th>
                        <th className="p-4 font-medium border-b">Monto Pagado</th>
                        <th className="p-4 font-medium border-b">Método</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                      {providerPayments.map(pay => (
                        <tr key={pay.id}>
                          <td className="p-4 text-gray-600">{pay.date}</td>
                          <td className="p-4 font-bold text-gray-900">Q{pay.amount.toFixed(2)}</td>
                          <td className="p-4 text-gray-600">{pay.method}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* PANEL LATERAL: CARRITO DE COMPRAS (Visible en Ventas) */}
        {activeTab === 'sales' && isCartOpen && (
          <div className="fixed inset-0 z-40 flex md:relative md:w-80 md:flex-shrink-0">
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm md:hidden" onClick={() => setIsCartOpen(false)}></div>
            <div className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-2xl flex flex-col md:relative md:rounded-xl md:shadow-sm md:border md:border-gray-200 md:h-[calc(100vh-100px)]">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
                <h3 className="font-bold text-gray-800 flex items-center gap-2"><IconCart /> Carrito</h3>
                <button onClick={() => setIsCartOpen(false)} className="md:hidden text-gray-500"><IconClose /></button>
              </div>
              
              <div className="flex-grow overflow-y-auto p-4 space-y-3 bg-gray-50/50">
                {cart.length === 0 ? (
                  <div className="text-center text-gray-400 mt-10 text-sm">Tu carrito está vacío</div>
                ) : (
                  cart.map(c => (
                    <div key={c.cartId} className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm relative pr-8">
                      <div className="text-sm font-bold text-gray-800 truncate">{c.description}</div>
                      <div className="text-xs text-gray-500 flex justify-between mt-1">
                        <span>{c.quantity} un. x Q{c.salePrice}</span>
                        <span className="font-bold text-gray-900">Q{c.saleTotal.toFixed(2)}</span>
                      </div>
                      <button onClick={() => removeFromCart(c.cartId)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 hover:text-red-500"><IconClose /></button>
                    </div>
                  ))
                )}
              </div>

              <div className="p-4 border-t border-gray-100 bg-white rounded-b-xl">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-bold text-gray-600">Total:</span>
                  <span className="text-xl font-black text-gray-900">Q{cartTotal.toFixed(2)}</span>
                </div>
                <button 
                  onClick={() => setCheckoutModalOpen(true)}
                  disabled={cart.length === 0}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold shadow-sm disabled:bg-gray-200 disabled:text-gray-400 transition-colors"
                >
                  Cobrar Orden
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL: COBRAR ORDEN */}
      {checkoutModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-900">Completar Venta</h3>
              <button onClick={() => setCheckoutModalOpen(false)}><IconClose /></button>
            </div>
            <form onSubmit={processCheckout} className="p-5 space-y-4">
              <div className="bg-amber-50 p-3 rounded-lg flex justify-between items-center mb-4">
                <span className="font-bold text-amber-800">Total a Pagar:</span>
                <span className="text-2xl font-black text-amber-600">Q{cartTotal.toFixed(2)}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Cliente</label>
                  <input type="text" value={customerName} onChange={e=>setCustomerName(e.target.value)} required className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Teléfono (Opcional)</label>
                  <input type="text" value={customerPhone} onChange={e=>setCustomerPhone(e.target.value)} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Monto que Paga Hoy</label>
                  <input type="number" step="0.01" max={cartTotal} value={initialPayment} onChange={e=>setInitialPayment(e.target.value)} required placeholder="0.00" className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Método</label>
                  <select value={paymentMethod} onChange={e=>setPaymentMethod(e.target.value)} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-amber-500 bg-white">
                    <option>Efectivo</option>
                    <option>Transferencia</option>
                  </select>
                </div>
              </div>

              {Number(initialPayment) < cartTotal && Number(initialPayment) >= 0 && (
                <div className="text-xs text-red-600 flex items-center gap-1 mt-2">
                  <IconInfo /> Queda un saldo de Q{(cartTotal - Number(initialPayment)).toFixed(2)}
                </div>
              )}

              <button type="submit" className="w-full mt-2 py-3 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-800">Confirmar Venta</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ABONO CLIENTE */}
      {abonoModalOpen && abonoOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
              <h3 className="font-bold text-gray-900">Registrar Abono</h3>
              <button onClick={() => setAbonoModalOpen(false)}><IconClose /></button>
            </div>
            <form onSubmit={processAbonoCliente} className="p-5 space-y-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Saldo Pendiente:</span>
                <span className="font-bold text-red-600">Q{abonoOrder.balance.toFixed(2)}</span>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Monto del Abono</label>
                <input type="number" step="0.01" max={abonoOrder.balance} value={abonoAmount} onChange={e=>setAbonoAmount(e.target.value)} required className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-amber-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Método</label>
                <select value={abonoMethod} onChange={e=>setAbonoMethod(e.target.value)} className="w-full px-3 py-2 border rounded-lg outline-none bg-white">
                  <option>Efectivo</option>
                  <option>Transferencia</option>
                </select>
              </div>
              <button type="submit" className="w-full py-2 bg-amber-500 text-white font-bold rounded-lg hover:bg-amber-600">Guardar Abono</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PAGO AL PROVEEDOR */}
      {providerModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
              <h3 className="font-bold text-gray-900">Pagar al Proveedor</h3>
              <button onClick={() => setProviderModalOpen(false)}><IconClose /></button>
            </div>
            <form onSubmit={processAbonoProveedor} className="p-5 space-y-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Deuda Actual:</span>
                <span className="font-bold text-amber-600">Q{currentProviderDebt.toFixed(2)}</span>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Monto a Pagar</label>
                <input type="number" step="0.01" max={currentProviderDebt} value={providerPaymentAmount} onChange={e=>setProviderPaymentAmount(e.target.value)} required className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-amber-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Método</label>
                <select value={providerPaymentMethod} onChange={e=>setProviderPaymentMethod(e.target.value)} className="w-full px-3 py-2 border rounded-lg outline-none bg-white">
                  <option>Transferencia</option>
                  <option>Efectivo</option>
                </select>
              </div>
              <button type="submit" className="w-full py-2 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-800">Registrar Pago</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DETALLES DE ORDEN */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
              <h3 className="font-bold text-gray-900">Detalles: {selectedOrderDetails.orderNumber}</h3>
              <button onClick={() => setSelectedOrderDetails(null)}><IconClose /></button>
            </div>
            <div className="p-5 overflow-y-auto text-sm space-y-4">
              
              <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-lg">
                <div><span className="text-gray-500 text-xs">Cliente:</span> <div className="font-semibold">{selectedOrderDetails.customerName}</div></div>
                <div><span className="text-gray-500 text-xs">Teléfono:</span> <div>{selectedOrderDetails.customerPhone || 'N/A'}</div></div>
                <div><span className="text-gray-500 text-xs">Fecha:</span> <div>{selectedOrderDetails.date}</div></div>
                <div><span className="text-gray-500 text-xs">Estado:</span> <div className={selectedOrderDetails.status==='Pagada'?'text-emerald-600 font-bold':'text-amber-600 font-bold'}>{selectedOrderDetails.status}</div></div>
              </div>

              <div>
                <h4 className="font-bold text-gray-800 border-b pb-1 mb-2">Artículos Vendidos</h4>
                <div className="space-y-3">
                  {selectedOrderDetails.items.map((it, idx) => (
                    <div key={idx} className="bg-white border rounded-lg p-3 shadow-sm">
                      <div className="font-bold text-gray-800 flex justify-between">
                        <span>{it.quantity}x {it.description}</span>
                        <span>Q{it.saleTotal.toFixed(2)}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1 flex justify-between">
                        <span>Costo: Q{it.baseCostTotal.toFixed(2)}</span>
                        <span className="text-emerald-600">Ganancia: Q{it.profit.toFixed(2)}</span>
                      </div>
                      <div className="text-[10px] mt-1 italic text-gray-400">{it.priceMessage}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-800 border-b pb-1 mb-2">Registro de Pagos</h4>
                {selectedOrderDetails.payments?.map(p => (
                  <div key={p.id} className="flex justify-between text-xs py-1 border-b border-dashed">
                    <span className="text-gray-500">{p.date.split(',')[0]} - {p.type} ({p.method})</span>
                    <span className="font-semibold">Q{p.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* MODAL EDITAR INVENTARIO */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-5">
            <h3 className="font-bold text-lg mb-4">Editar Joya</h3>
            <form onSubmit={handleEditSave} className="space-y-3">
              <input type="text" value={editingItem.description} onChange={e=>setEditingItem({...editingItem, description: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm outline-none" required />
              <div className="flex gap-2">
                <input type="number" step="0.01" value={editingItem.weight} onChange={e=>setEditingItem({...editingItem, weight: e.target.value})} className="w-1/2 px-3 py-2 border rounded-lg text-sm outline-none" required />
                <input type="number" value={editingItem.quantity} onChange={e=>setEditingItem({...editingItem, quantity: e.target.value})} className="w-1/2 px-3 py-2 border rounded-lg text-sm outline-none" required />
              </div>
              <input type="url" value={editingItem.image} onChange={e=>setEditingItem({...editingItem, image: e.target.value})} placeholder="URL Imagen" className="w-full px-3 py-2 border rounded-lg text-sm outline-none" />
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={()=>setEditingItem(null)} className="w-1/2 py-2 bg-gray-100 rounded-lg font-medium">Cancelar</button>
                <button type="submit" className="w-1/2 py-2 bg-amber-500 text-white rounded-lg font-medium">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}