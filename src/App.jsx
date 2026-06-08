import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, setDoc, getDoc } from 'firebase/firestore';

// --- CONFIGURACIÓN DE FIREBASE ---
let app, auth, db, appId;
try {
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
const IconUsers = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IconImage = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>;
const IconEdit = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>;
const IconTrash = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>;
const IconCart = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>;
const IconClose = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>;
const IconInfo = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>;
const IconLock = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const IconUnlock = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>;

// --- COMPONENTES SECUNDARIOS ---
const SalesCard = ({ item, onAddToCart, cartQty }) => {
  const suggestedPrice = item.weight * 80;
  const [currentPrice, setCurrentPrice] = useState(suggestedPrice);
  const [sellQuantity, setSellQuantity] = useState(1);
  const [errorMsg, setErrorMsg] = useState('');

  const availableQty = item.quantity - cartQty;
  const difference = currentPrice - suggestedPrice;
  
  let priceMessage = "Precio sugerido";
  let messageColor = "text-gray-500 bg-gray-100";

  if (difference < -0.01) {
    priceMessage = `Descuento: Q${Math.abs(difference).toFixed(2)}`;
    messageColor = "text-red-700 bg-red-100 border-red-200";
  } else if (difference > 0.01) {
    priceMessage = `Ganancia extra: Q${difference.toFixed(2)}`;
    messageColor = "text-emerald-700 bg-emerald-100 border-emerald-200";
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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      <div className="h-40 w-full bg-gray-50 relative">
        {item.image ? (
          <img src={item.image} alt={item.description} className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400"><IconImage /></div>
        )}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-bold text-gray-700 shadow-sm">
          Stock: {availableQty}
        </div>
      </div>
      
      <div className="p-4 flex-grow flex flex-col">
        <h3 className="font-bold text-gray-800 text-base mb-1 truncate">{item.description}</h3>
        <p className="text-gray-500 text-xs mb-3">Peso: {item.weight}g</p>

        <div className="mt-auto space-y-3">
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Precio Venta (Q)</label>
            <input 
              type="number" 
              value={currentPrice}
              onChange={(e) => setCurrentPrice(Number(e.target.value))}
              className="w-full px-3 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none font-bold"
              step="0.01"
            />
          </div>

          <div className={`px-2 py-1.5 rounded-lg border text-[10px] font-bold text-center ${messageColor}`}>
            {priceMessage}
          </div>

          <div className="flex gap-2 items-end">
            <div className="w-1/3">
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Cant.</label>
              <input 
                type="number" 
                min="1" 
                max={availableQty}
                value={sellQuantity}
                onChange={(e) => setSellQuantity(Number(e.target.value))}
                className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-center"
              />
            </div>
            <button 
              onClick={handleAdd}
              disabled={availableQty === 0}
              className={`w-2/3 py-1.5 px-2 rounded-lg font-bold text-sm transition-all shadow-sm ${
                availableQty === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-600 text-white'
              }`}
            >
              {availableQty === 0 ? 'Agotado' : 'Añadir'}
            </button>
          </div>
          {errorMsg && <div className="text-center text-xs text-red-600 font-bold animate-pulse">{errorMsg}</div>}
        </div>
      </div>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---
export default function App() {
  // Estados de Autenticación y Perfil
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [posProfile, setPosProfile] = useState(null); // null = bloqueado, {role: 'admin'}, {role: 'seller', id, nombre}
  
  // Estados de Pantalla de Login Principal
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [adminSetupPin, setAdminSetupPin] = useState('');
  const [authError, setAuthError] = useState('');

  // Estados de Pantalla de Bloqueo (POS)
  const [pinInput, setPinInput] = useState('');
  const [adminConfig, setAdminConfig] = useState(null);

  // Estados de Navegación
  const [activeTab, setActiveTab] = useState('sales');

  // Datos Globales de Firestore
  const [inventory, setInventory] = useState([]);
  const [salesHistory, setSalesHistory] = useState([]);
  const [providerPayments, setProviderPayments] = useState([]);
  const [sellers, setSellers] = useState([]);

  // Estados Inventario
  const [newDesc, setNewDesc] = useState('');
  const [newWeight, setNewWeight] = useState('');
  const [newQty, setNewQty] = useState('');
  const [newImage, setNewImage] = useState('');
  const [assignTo, setAssignTo] = useState('general');
  const [formError, setFormError] = useState('');
  const [editingItem, setEditingItem] = useState(null);

  // Estados Vendedores
  const [newSellerName, setNewSellerName] = useState('');
  const [newSellerCode, setNewSellerCode] = useState('');

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

  // --- 1. FIREBASE AUTH LISTENER ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (!user) setPosProfile(null); // Bloquear si se cierra sesión
    });
    return () => unsubscribe();
  }, []);

  // --- 2. CARGA DE DATOS FIRESTORE ---
  useEffect(() => {
    if (!firebaseUser) return;
    const uid = firebaseUser.uid;
    const getPath = (col) => collection(db, 'artifacts', appId, 'users', uid, col);

    // Cargar Configuración de Admin (PIN maestro)
    const unsubConfig = onSnapshot(doc(db, 'artifacts', appId, 'users', uid, 'config', 'adminProfile'), (doc) => {
      if(doc.exists()) setAdminConfig(doc.data());
    });

    // Cargar Resto de Colecciones
    const unsubInv = onSnapshot(getPath('inventory'), (snap) => setInventory(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubSales = onSnapshot(getPath('sales'), (snap) => setSalesHistory(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => b.timestamp - a.timestamp)));
    const unsubProv = onSnapshot(getPath('providerPayments'), (snap) => setProviderPayments(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubSell = onSnapshot(getPath('vendedores'), (snap) => setSellers(snap.docs.map(d => ({ id: d.id, ...d.data() }))));

    return () => { unsubConfig(); unsubInv(); unsubSales(); unsubProv(); unsubSell(); };
  }, [firebaseUser]);

  // Funciones Ref Helper
  const getColRef = (colName) => collection(db, 'artifacts', appId, 'users', firebaseUser.uid, colName);
  const getDocRef = (colName, docId) => doc(db, 'artifacts', appId, 'users', firebaseUser.uid, colName, docId);

  // --- LÓGICA DE LOGIN PRINCIPAL (ADMIN) ---
  const handleFirebaseLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      if (isRegistering) {
        if(!adminSetupPin || adminSetupPin.length < 4) {
          setAuthError("El PIN debe tener al menos 4 números.");
          return;
        }
        const userCred = await createUserWithEmailAndPassword(auth, loginEmail, loginPassword);
        // Guardar el PIN del admin
        await setDoc(doc(db, 'artifacts', appId, 'users', userCred.user.uid, 'config', 'adminProfile'), {
          adminPin: adminSetupPin
        });
      } else {
        await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      }
    } catch (error) {
      setAuthError("Error: " + error.message);
    }
  };

  // --- LÓGICA DE PANTALLA DE BLOQUEO (POS PIN) ---
  const handlePinUnlock = (e) => {
    e.preventDefault();
    setAuthError('');
    
    // Verificar si es Admin
    if (adminConfig && pinInput === adminConfig.adminPin) {
      setPosProfile({ role: 'admin', nombre: 'Administrador' });
      setActiveTab('inventory');
      setPinInput('');
      return;
    }

    // Verificar si es Vendedor
    const sellerMatch = sellers.find(s => s.pin === pinInput);
    if (sellerMatch) {
      setPosProfile({ role: 'seller', id: sellerMatch.id, nombre: sellerMatch.nombre });
      setActiveTab('sales');
      setPinInput('');
      return;
    }

    setAuthError("PIN incorrecto.");
    setTimeout(() => setAuthError(''), 3000);
  };

  const handleLockScreen = () => {
    setPosProfile(null);
    setCart([]);
  };

  // --- LÓGICA INVENTARIO ---
  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newDesc || !newWeight || !newQty) return;
    await addDoc(getColRef('inventory'), {
      description: newDesc,
      weight: Number(newWeight),
      quantity: Number(newQty),
      image: newImage.trim(),
      cost: Number(newWeight) * 40,
      assignedTo: assignTo, // 'general' o ID del vendedor
      timestamp: Date.now()
    });
    setNewDesc(''); setNewWeight(''); setNewQty(''); setNewImage(''); setAssignTo('general');
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    await updateDoc(getDocRef('inventory', editingItem.id), {
      description: editingItem.description,
      weight: Number(editingItem.weight),
      quantity: Number(editingItem.quantity),
      image: editingItem.image,
      cost: Number(editingItem.weight) * 40,
      assignedTo: editingItem.assignedTo || 'general'
    });
    setEditingItem(null);
  };

  const deleteItem = async (id) => await deleteDoc(getDocRef('inventory', id));

  // --- LÓGICA VENDEDORES ---
  const handleAddSeller = async (e) => {
    e.preventDefault();
    await addDoc(getColRef('vendedores'), {
      nombre: newSellerName,
      pin: newSellerCode,
      createdAt: Date.now()
    });
    setNewSellerName(''); setNewSellerCode('');
  };
  const deleteSeller = async (id) => await deleteDoc(getDocRef('vendedores', id));

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
      sellerId: posProfile.role === 'seller' ? posProfile.id : 'admin',
      sellerName: posProfile.nombre,
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

  // Deuda por Vendedor (Agrupada)
  const sellerDebts = sellers.map(seller => {
    const sellerSales = salesHistory.filter(s => s.sellerId === seller.id);
    const totalDebt = sellerSales.reduce((sum, s) => sum + s.baseCostTotal, 0);
    return { ...seller, totalDebt };
  });

  // --- FILTROS DE VISTA (ADMIN VS VENDEDOR) ---
  const visibleInventory = posProfile?.role === 'admin' 
    ? inventory 
    : inventory.filter(i => i.assignedTo === 'general' || i.assignedTo === posProfile?.id);
    
  const visibleHistory = posProfile?.role === 'admin'
    ? salesHistory
    : salesHistory.filter(s => s.sellerId === posProfile?.id);


  // =========================================================================
  // VISTA 1: LOGIN PRINCIPAL (FIREBASE)
  // =========================================================================
  if (!firebaseUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 w-full max-w-sm animate-in zoom-in-95 duration-300">
          <div className="flex justify-center text-amber-500 mb-4"><IconDiamond /></div>
          <h2 className="text-2xl font-black text-center text-gray-900 mb-6">JoyaPanel</h2>
          
          <form onSubmit={handleFirebaseLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Correo (Admin)</label>
              <input type="email" value={loginEmail} onChange={e=>setLoginEmail(e.target.value)} required className="w-full px-4 py-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-medium" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Contraseña</label>
              <input type="password" value={loginPassword} onChange={e=>setLoginPassword(e.target.value)} required className="w-full px-4 py-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-medium" />
            </div>
            
            {isRegistering && (
              <div className="pt-2">
                <label className="block text-xs font-bold text-amber-600 uppercase mb-1">Crea tu PIN de Acceso Rápido</label>
                <input type="password" value={adminSetupPin} onChange={e=>setAdminSetupPin(e.target.value)} required placeholder="Ej. 1234" className="w-full px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-bold tracking-widest text-center" />
              </div>
            )}

            {authError && <div className="text-red-500 text-xs font-bold text-center bg-red-50 p-2 rounded-lg">{authError}</div>}
            
            <button type="submit" className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl shadow-md transition-all mt-4">
              {isRegistering ? 'Crear Cuenta y Entrar' : 'Iniciar Sesión'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button onClick={() => setIsRegistering(!isRegistering)} className="text-sm font-bold text-gray-500 hover:text-amber-600 transition-colors">
              {isRegistering ? 'Ya tengo cuenta. Iniciar sesión.' : '¿Primera vez? Crear cuenta admin'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VISTA 2: PANTALLA DE BLOQUEO POS (PIN)
  // =========================================================================
  if (firebaseUser && !posProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
        <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-sm text-center animate-in slide-in-from-bottom-8 duration-500">
          <div className="inline-flex p-4 rounded-full bg-amber-100 text-amber-600 mb-6"><IconLock /></div>
          <h2 className="text-xl font-black text-gray-900 mb-2">Terminal Bloqueada</h2>
          <p className="text-sm font-medium text-gray-500 mb-8">Ingresa tu PIN asignado para abrir la caja.</p>
          
          <form onSubmit={handlePinUnlock} className="space-y-6">
            <input 
              type="password" 
              value={pinInput} 
              onChange={e=>setPinInput(e.target.value)} 
              required 
              autoFocus
              placeholder="••••" 
              className="w-3/4 mx-auto block px-4 py-4 text-center text-3xl tracking-[1em] bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 font-black" 
            />
            {authError && <div className="text-red-500 text-xs font-bold animate-pulse">{authError}</div>}
            
            <button type="submit" className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl shadow-lg transition-all text-lg flex items-center justify-center gap-2">
              <IconUnlock /> Desbloquear
            </button>
          </form>

          <button onClick={() => signOut(auth)} className="mt-8 text-xs font-bold text-gray-400 hover:text-gray-600">
            Cerrar sesión principal (Administrador)
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VISTA 3: DASHBOARD PRINCIPAL (ADMIN O VENDEDOR)
  // =========================================================================
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 pb-20 md:pb-0">
      {/* HEADER */}
      <header className="bg-white shadow-sm sticky top-0 z-30 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-600">
            <IconDiamond />
            <h1 className="text-xl font-black tracking-tight text-gray-900 hidden sm:block">Joya<span className="text-amber-500">Panel</span></h1>
            <span className="ml-2 px-2.5 py-0.5 rounded-full bg-gray-100 text-xs font-bold text-gray-600 border border-gray-200">
              {posProfile.nombre} ({posProfile.role === 'admin' ? 'Admin' : 'Vendedor'})
            </span>
          </div>
          
          <div className="flex space-x-1 sm:space-x-2 overflow-x-auto no-scrollbar">
            {posProfile.role === 'admin' && (
              <>
                <button onClick={() => setActiveTab('inventory')} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${activeTab === 'inventory' ? 'bg-amber-50 text-amber-700' : 'text-gray-500 hover:bg-gray-100'}`}>
                  <IconList /> <span className="hidden md:inline">Inventario</span>
                </button>
                <button onClick={() => setActiveTab('sellers')} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${activeTab === 'sellers' ? 'bg-amber-50 text-amber-700' : 'text-gray-500 hover:bg-gray-100'}`}>
                  <IconUsers /> <span className="hidden md:inline">Vendedores</span>
                </button>
                <button onClick={() => setActiveTab('finance')} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${activeTab === 'finance' ? 'bg-amber-50 text-amber-700' : 'text-gray-500 hover:bg-gray-100'}`}>
                  <IconWallet /> <span className="hidden md:inline">Finanzas</span>
                </button>
              </>
            )}
            
            <button onClick={() => setActiveTab('sales')} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${activeTab === 'sales' ? 'bg-amber-50 text-amber-700' : 'text-gray-500 hover:bg-gray-100'}`}>
              <IconTag /> <span className="hidden md:inline">Ventas</span>
            </button>
            <button onClick={() => setActiveTab('history')} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${activeTab === 'history' ? 'bg-amber-50 text-amber-700' : 'text-gray-500 hover:bg-gray-100'}`}>
              <IconHistory /> <span className="hidden md:inline">Historial</span>
            </button>

            <button onClick={handleLockScreen} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-all ml-2">
              <IconLock /> <span className="hidden md:inline">Bloquear</span>
            </button>
          </div>

          {activeTab === 'sales' && (
            <button onClick={() => setIsCartOpen(true)} className="relative p-2 text-gray-600 hover:text-amber-600 md:hidden">
              <IconCart />
              {cart.length > 0 && <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">{cart.length}</span>}
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
        <div className={`flex-1 ${activeTab === 'sales' && isCartOpen ? 'hidden md:block' : 'block'} animate-in fade-in duration-300`}>
          
          {/* ======================================= */}
          {/* TAB: INVENTARIO (Solo Admin)            */}
          {/* ======================================= */}
          {activeTab === 'inventory' && posProfile.role === 'admin' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-6">
                <h2 className="text-lg font-black mb-4 text-gray-900">Registrar Joya</h2>
                <form onSubmit={handleAddItem} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Descripción</label>
                    <input type="text" value={newDesc} onChange={e=>setNewDesc(e.target.value)} className="w-full px-3 py-2.5 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-medium" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Peso (g)</label>
                    <input type="number" step="0.01" value={newWeight} onChange={e=>setNewWeight(e.target.value)} className="w-full px-3 py-2.5 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-medium" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Cant.</label>
                    <input type="number" value={newQty} onChange={e=>setNewQty(e.target.value)} className="w-full px-3 py-2.5 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-medium" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-amber-600 uppercase mb-1">Asignar a</label>
                    <select value={assignTo} onChange={e=>setAssignTo(e.target.value)} className="w-full px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-bold text-amber-900">
                      <option value="general">Caja General</option>
                      {sellers.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-4">
                    <input type="url" value={newImage} onChange={e=>setNewImage(e.target.value)} placeholder="URL de Imagen (Opcional)" className="w-full px-3 py-2.5 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-medium text-sm" />
                  </div>
                  <button type="submit" className="w-full py-2.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 shadow-sm transition-colors md:col-span-1">Guardar</button>
                </form>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse whitespace-nowrap">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                        <th className="p-4 font-bold border-b">Joya</th>
                        <th className="p-4 font-bold border-b">Asignación</th>
                        <th className="p-4 font-bold border-b">Stock</th>
                        <th className="p-4 font-bold border-b">Costo</th>
                        <th className="p-4 font-bold border-b text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-sm">
                      {inventory.map(item => (
                        <tr key={item.id} className="hover:bg-gray-50/50">
                          <td className="p-4 font-bold text-gray-800 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-200">{item.image ? <img src={item.image} className="w-full h-full object-cover"/> : <div className="flex items-center justify-center h-full text-gray-400"><IconImage/></div>}</div>
                            <span>{item.description} <br/><span className="text-xs text-gray-400 font-medium">{item.weight}g</span></span>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-md text-xs font-bold ${item.assignedTo === 'general' ? 'bg-gray-100 text-gray-600' : 'bg-purple-100 text-purple-700'}`}>
                              {item.assignedTo === 'general' ? 'General' : sellers.find(s=>s.id===item.assignedTo)?.nombre || 'Desconocido'}
                            </span>
                          </td>
                          <td className="p-4"><span className={`px-2.5 py-1 rounded-full text-xs font-black ${item.quantity>0?'bg-emerald-100 text-emerald-700':'bg-red-100 text-red-700'}`}>{item.quantity}</span></td>
                          <td className="p-4 font-medium">Q{item.cost.toFixed(2)}</td>
                          <td className="p-4 flex justify-end gap-2">
                            <button onClick={() => setEditingItem(item)} className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg"><IconEdit /></button>
                            <button onClick={() => deleteItem(item.id)} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg"><IconTrash /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================= */}
          {/* TAB: VENDEDORES (Solo Admin)            */}
          {/* ======================================= */}
          {activeTab === 'sellers' && posProfile.role === 'admin' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-black mb-4 text-gray-900">Añadir Vendedor</h2>
                <form onSubmit={handleAddSeller} className="flex gap-4 items-end">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre</label>
                    <input type="text" value={newSellerName} onChange={e=>setNewSellerName(e.target.value)} className="w-full px-3 py-2.5 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-medium" required />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">PIN de Acceso</label>
                    <input type="text" value={newSellerCode} onChange={e=>setNewSellerCode(e.target.value)} className="w-full px-3 py-2.5 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-bold tracking-widest text-center" required placeholder="Ej. 1234" />
                  </div>
                  <button type="submit" className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold shadow-sm transition-colors">Crear</button>
                </form>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-50 bg-gray-50/50"><h3 className="font-bold text-gray-800">Vendedores Registrados</h3></div>
                <div className="p-4 space-y-3">
                  {sellers.length === 0 ? <p className="text-sm text-gray-500 text-center py-4">No hay vendedores creados.</p> : null}
                  {sellers.map(s => (
                    <div key={s.id} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-xl">
                      <div>
                        <div className="font-black text-gray-900">{s.nombre}</div>
                        <div className="text-xs text-gray-400 font-medium mt-0.5">ID: {s.id.substring(0,8)}</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-mono bg-white border px-3 py-1 rounded-lg text-sm font-bold tracking-widest text-amber-600 shadow-sm">{s.pin}</span>
                        <button onClick={() => deleteSeller(s.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-lg bg-white border shadow-sm"><IconTrash /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ======================================= */}
          {/* TAB: VENTAS (Todos)                     */}
          {/* ======================================= */}
          {activeTab === 'sales' && (
            <div>
              <div className="mb-6 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 mb-1">Catálogo de Venta</h2>
                  <p className="text-gray-500 text-sm font-medium">Inventario disponible para la venta.</p>
                </div>
                <button onClick={() => setIsCartOpen(!isCartOpen)} className="hidden md:flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-800 shadow-md">
                  <IconCart /> {isCartOpen ? 'Ocultar Carrito' : 'Ver Carrito'} {cart.length > 0 && <span className="bg-amber-500 text-white px-2 py-0.5 rounded-full text-xs">{cart.length}</span>}
                </button>
              </div>
              
              {visibleInventory.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center text-gray-500 font-medium">No tienes artículos asignados para vender.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {visibleInventory.map(item => (
                    <SalesCard key={item.id} item={item} onAddToCart={handleAddToCart} cartQty={cart.filter(c => c.inventoryId === item.id).reduce((a,b)=>a+b.quantity, 0)} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ======================================= */}
          {/* TAB: HISTORIAL (Todos filtrado)         */}
          {/* ======================================= */}
          {activeTab === 'history' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100"><h2 className="text-lg font-black text-gray-900">Órdenes de Venta</h2></div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                      <th className="p-4 font-bold border-b">Orden / Cliente</th>
                      {posProfile.role === 'admin' && <th className="p-4 font-bold border-b">Vendedor</th>}
                      <th className="p-4 font-bold border-b">Total</th>
                      <th className="p-4 font-bold border-b">Pagado</th>
                      <th className="p-4 font-bold border-b">Saldo</th>
                      <th className="p-4 font-bold border-b">Estado</th>
                      <th className="p-4 font-bold border-b text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-sm">
                    {visibleHistory.map(order => (
                      <tr key={order.id} className="hover:bg-gray-50/50">
                        <td className="p-4">
                          <div className="font-black text-gray-900">{order.orderNumber}</div>
                          <div className="text-xs text-gray-500 font-medium mt-0.5">{order.customerName} - {order.date.split(',')[0]}</div>
                        </td>
                        {posProfile.role === 'admin' && (
                          <td className="p-4"><span className="px-2 py-1 bg-gray-100 rounded-md text-xs font-bold text-gray-600">{order.sellerName}</span></td>
                        )}
                        <td className="p-4 font-black text-gray-900">Q{order.saleTotal.toFixed(2)}</td>
                        <td className="p-4 font-bold text-emerald-600">Q{order.paidAmount.toFixed(2)}</td>
                        <td className="p-4 font-bold text-red-600">Q{order.balance.toFixed(2)}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${order.status==='Pagada'?'bg-emerald-100 text-emerald-700 border border-emerald-200':'bg-amber-100 text-amber-700 border border-amber-200'}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="p-4 flex items-center justify-end gap-2">
                          {order.status === 'Pendiente' && (
                            <button onClick={() => {setAbonoOrder(order); setAbonoModalOpen(true);}} className="text-xs font-bold bg-amber-500 text-white px-3 py-1.5 rounded-lg hover:bg-amber-600 shadow-sm">Abonar</button>
                          )}
                          <button onClick={() => setSelectedOrderDetails(order)} className="text-xs font-bold bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-50 shadow-sm">Detalles</button>
                        </td>
                      </tr>
                    ))}
                    {visibleHistory.length === 0 && (
                      <tr><td colSpan="7" className="p-8 text-center text-gray-500 font-medium">No hay historial de ventas.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ======================================= */}
          {/* TAB: FINANZAS (Solo Admin)              */}
          {/* ======================================= */}
          {activeTab === 'finance' && posProfile.role === 'admin' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="text-xs font-bold text-gray-400 uppercase mb-2">Ingresos Totales (Ventas)</div>
                  <div className="text-3xl font-black text-gray-900">Q{totalSalesRevenue.toFixed(2)}</div>
                </div>
                <div className="bg-amber-500 p-6 rounded-2xl shadow-md border border-amber-600 text-white relative overflow-hidden">
                  <div className="text-xs font-bold text-amber-100 uppercase mb-2">Deuda Proveedor (Costo Base)</div>
                  <div className="text-3xl font-black">Q{currentProviderDebt.toFixed(2)}</div>
                  <button onClick={() => setProviderModalOpen(true)} className="absolute right-4 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-4 py-2 rounded-xl font-bold shadow-sm hover:bg-gray-800">Abonar a Prov.</button>
                </div>
                <div className="bg-emerald-50 p-6 rounded-2xl shadow-sm border border-emerald-100">
                  <div className="text-xs font-bold text-emerald-600 uppercase mb-2">Ganancia Neta Calculada</div>
                  <div className="text-3xl font-black text-emerald-700">Q{totalNetProfit.toFixed(2)}</div>
                </div>
              </div>

              {/* Deuda por Vendedor */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-50 bg-gray-50/50"><h2 className="text-lg font-black text-gray-900">Control: ¿Cuánto debe cada vendedor?</h2></div>
                <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sellerDebts.map(s => (
                    <div key={s.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-black">{s.nombre.charAt(0)}</div>
                        <span className="font-bold text-gray-900">{s.nombre}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-400 font-bold uppercase">Debe Entregar</div>
                        <div className="font-black text-lg text-amber-600">Q{s.totalDebt.toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                  {sellerDebts.length === 0 && <p className="text-sm text-gray-500">No hay vendedores registrados.</p>}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ======================================= */}
        {/* PANEL LATERAL: CARRITO DE COMPRAS       */}
        {/* ======================================= */}
        {activeTab === 'sales' && isCartOpen && (
          <div className="fixed inset-0 z-40 flex md:relative md:w-80 md:flex-shrink-0">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm md:hidden" onClick={() => setIsCartOpen(false)}></div>
            <div className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-2xl flex flex-col md:relative md:rounded-2xl md:shadow-sm md:border md:border-gray-100 md:h-[calc(100vh-100px)]">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/80 rounded-t-2xl">
                <h3 className="font-black text-gray-900 flex items-center gap-2"><IconCart /> Carrito Actual</h3>
                <button onClick={() => setIsCartOpen(false)} className="md:hidden text-gray-400 hover:text-gray-600 bg-white p-1 rounded-md shadow-sm"><IconClose /></button>
              </div>
              
              <div className="flex-grow overflow-y-auto p-4 space-y-3">
                {cart.length === 0 ? (
                  <div className="text-center text-gray-400 mt-10 text-sm font-medium">El carrito está vacío</div>
                ) : (
                  cart.map(c => (
                    <div key={c.cartId} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm relative pr-8">
                      <div className="text-sm font-black text-gray-800 truncate">{c.description}</div>
                      <div className="text-xs text-gray-500 flex justify-between mt-1 font-medium">
                        <span>{c.quantity} un. x Q{c.salePrice}</span>
                        <span className="font-bold text-gray-900">Q{c.saleTotal.toFixed(2)}</span>
                      </div>
                      <button onClick={() => removeFromCart(c.cartId)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 hover:text-red-500 bg-red-50 p-1 rounded-md"><IconClose /></button>
                    </div>
                  ))
                )}
              </div>

              <div className="p-5 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-bold text-gray-500">Total a Cobrar:</span>
                  <span className="text-2xl font-black text-amber-500">Q{cartTotal.toFixed(2)}</span>
                </div>
                <button 
                  onClick={() => setCheckoutModalOpen(true)}
                  disabled={cart.length === 0}
                  className="w-full py-3.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold shadow-md disabled:bg-gray-200 disabled:text-gray-400 transition-all"
                >
                  Procesar Orden
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ======================================= */}
      {/* MODALES FLOTANTES                       */}
      {/* ======================================= */}
      
      {/* MODAL COBRAR */}
      {checkoutModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-5 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-black text-gray-900">Completar Venta</h3>
              <button onClick={() => setCheckoutModalOpen(false)} className="bg-white p-1 rounded-md shadow-sm text-gray-500"><IconClose /></button>
            </div>
            <form onSubmit={processCheckout} className="p-6 space-y-4">
              <div className="bg-amber-50 p-4 rounded-2xl flex justify-between items-center border border-amber-100">
                <span className="font-bold text-amber-800 text-sm uppercase">Gran Total:</span>
                <span className="text-3xl font-black text-amber-600">Q{cartTotal.toFixed(2)}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre Cliente</label>
                  <input type="text" value={customerName} onChange={e=>setCustomerName(e.target.value)} required className="w-full px-3 py-2.5 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-bold" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Teléfono (Opc.)</label>
                  <input type="text" value={customerPhone} onChange={e=>setCustomerPhone(e.target.value)} className="w-full px-3 py-2.5 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Abono Inicial</label>
                  <input type="number" step="0.01" max={cartTotal} value={initialPayment} onChange={e=>setInitialPayment(e.target.value)} required placeholder="0.00" className="w-full px-3 py-2.5 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-black text-amber-600" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Método</label>
                  <select value={paymentMethod} onChange={e=>setPaymentMethod(e.target.value)} className="w-full px-3 py-2.5 bg-white border rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-bold">
                    <option>Efectivo</option>
                    <option>Transferencia</option>
                  </select>
                </div>
              </div>
              {Number(initialPayment) < cartTotal && Number(initialPayment) >= 0 && (
                <div className="text-xs font-bold text-red-600 flex items-center gap-1 mt-2 bg-red-50 p-2 rounded-lg">
                  <IconInfo /> Quedará un saldo pendiente de Q{(cartTotal - Number(initialPayment)).toFixed(2)}
                </div>
              )}
              <button type="submit" className="w-full mt-4 py-3.5 bg-amber-500 text-white font-black rounded-xl hover:bg-amber-600 shadow-md transition-all text-lg">Confirmar y Guardar</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DETALLES DE ORDEN */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95">
            <div className="p-5 bg-gray-50 border-b flex justify-between items-center">
              <h3 className="font-black text-gray-900">Orden: <span className="text-amber-600">{selectedOrderDetails.orderNumber}</span></h3>
              <button onClick={() => setSelectedOrderDetails(null)} className="bg-white p-1 rounded-md shadow-sm text-gray-500"><IconClose /></button>
            </div>
            <div className="p-6 overflow-y-auto text-sm space-y-6">
              <div className="grid grid-cols-2 gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div><span className="text-gray-400 text-[10px] font-bold uppercase">Cliente</span> <div className="font-black text-gray-800">{selectedOrderDetails.customerName}</div></div>
                <div><span className="text-gray-400 text-[10px] font-bold uppercase">Teléfono</span> <div className="font-bold text-gray-600">{selectedOrderDetails.customerPhone || 'N/A'}</div></div>
                <div><span className="text-gray-400 text-[10px] font-bold uppercase">Vendedor</span> <div className="font-bold text-gray-600">{selectedOrderDetails.sellerName}</div></div>
                <div><span className="text-gray-400 text-[10px] font-bold uppercase">Estado</span> <div className={selectedOrderDetails.status==='Pagada'?'text-emerald-600 font-black':'text-red-600 font-black'}>{selectedOrderDetails.status}</div></div>
              </div>
              <div>
                <h4 className="font-black text-gray-900 border-b border-gray-100 pb-2 mb-3">Artículos</h4>
                <div className="space-y-3">
                  {selectedOrderDetails.items.map((it, idx) => (
                    <div key={idx} className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
                      <div className="font-black text-gray-800 flex justify-between mb-1">
                        <span>{it.quantity}x {it.description}</span>
                        <span>Q{it.saleTotal.toFixed(2)}</span>
                      </div>
                      {posProfile.role === 'admin' && (
                        <div className="text-[10px] text-gray-400 font-bold uppercase flex justify-between">
                          <span>Costo: Q{it.baseCostTotal.toFixed(2)}</span>
                          <span className="text-emerald-500">Ganancia: Q{it.profit.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDITAR INVENTARIO */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6 animate-in zoom-in-95">
            <h3 className="font-black text-xl mb-6">Editar Joya</h3>
            <form onSubmit={handleEditSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Descripción</label>
                <input type="text" value={editingItem.description} onChange={e=>setEditingItem({...editingItem, description: e.target.value})} className="w-full px-3 py-2.5 border rounded-xl font-bold outline-none focus:ring-2 focus:ring-amber-500" required />
              </div>
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Peso</label>
                  <input type="number" step="0.01" value={editingItem.weight} onChange={e=>setEditingItem({...editingItem, weight: e.target.value})} className="w-full px-3 py-2.5 border rounded-xl font-bold outline-none focus:ring-2 focus:ring-amber-500" required />
                </div>
                <div className="w-1/2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Stock</label>
                  <input type="number" value={editingItem.quantity} onChange={e=>setEditingItem({...editingItem, quantity: e.target.value})} className="w-full px-3 py-2.5 border rounded-xl font-bold outline-none focus:ring-2 focus:ring-amber-500" required />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Asignación</label>
                <select value={editingItem.assignedTo || 'general'} onChange={e=>setEditingItem({...editingItem, assignedTo: e.target.value})} className="w-full px-3 py-2.5 bg-gray-50 border rounded-xl font-bold outline-none focus:ring-2 focus:ring-amber-500">
                  <option value="general">Caja General</option>
                  {sellers.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={()=>setEditingItem(null)} className="w-1/2 py-3 bg-gray-100 rounded-xl font-bold text-gray-600">Cancelar</button>
                <button type="submit" className="w-1/2 py-3 bg-amber-500 text-white rounded-xl font-bold shadow-md">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}