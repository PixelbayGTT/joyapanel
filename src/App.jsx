import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, signInAnonymously, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, getDoc, setDoc } from 'firebase/firestore';

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
const IconEdit = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>;
const IconTrash = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>;
const IconCart = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>;
const IconClose = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>;
const IconInfo = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>;

// --- COMPONENTE TARJETA DE VENTAS (MÁS PEQUEÑO Y COMPACTO) ---
const SalesCard = ({ item, onAddToCart, cartQty }) => {
  const suggestedPrice = item.weight * 80;
  const [currentPrice, setCurrentPrice] = useState(suggestedPrice);
  const [sellQuantity, setSellQuantity] = useState(1);
  const [errorMsg, setErrorMsg] = useState('');

  const availableQty = item.quantity - cartQty;
  const difference = currentPrice - suggestedPrice;
  
  let messageColor = "text-gray-500 bg-gray-100";

  if (difference < -0.01) {
    messageColor = "text-red-700 bg-red-100 border-red-200";
  } else if (difference > 0.01) {
    messageColor = "text-emerald-700 bg-emerald-100 border-emerald-200";
  }

  const handleAdd = () => {
    if (sellQuantity > availableQty || sellQuantity <= 0) {
      setErrorMsg("Error");
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
      difference
    });
    setSellQuantity(1);
    setCurrentPrice(suggestedPrice);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      <div className="h-28 w-full bg-gray-50 relative">
        {item.image ? (
          <img src={item.image} alt={item.description} className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400"><IconImage /></div>
        )}
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full text-[10px] font-bold text-gray-700 shadow-sm">
          Stock: {availableQty}
        </div>
      </div>
      <div className="p-3 flex-grow flex flex-col">
        <h3 className="font-bold text-gray-800 text-sm mb-0.5 line-clamp-1">{item.description}</h3>
        <p className="text-gray-500 text-[10px] mb-2 font-medium">Peso: {item.weight}g</p>
        <div className="mt-auto space-y-2">
          <div>
            <label className="block text-[9px] font-bold text-gray-500 uppercase mb-0.5">Precio Venta (Q)</label>
            <input type="number" value={currentPrice} onChange={(e) => setCurrentPrice(Number(e.target.value))} className={`w-full px-2 py-1 text-xs border rounded focus:ring-1 outline-none font-bold ${messageColor}`} step="0.01" />
          </div>
          <div className="flex gap-1.5 items-end">
            <div className="w-1/3">
              <label className="block text-[9px] font-bold text-gray-500 uppercase mb-0.5">Cant.</label>
              <input type="number" min="1" max={availableQty} value={sellQuantity} onChange={(e) => setSellQuantity(Number(e.target.value))} className="w-full px-1.5 py-1 text-xs border border-gray-200 rounded outline-none text-center" />
            </div>
            <button onClick={handleAdd} disabled={availableQty === 0} className={`w-2/3 py-1 px-1 rounded font-bold text-xs transition-all shadow-sm ${availableQty === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-600 text-white'}`}>
              {availableQty === 0 ? 'Agotado' : 'Añadir'}
            </button>
          </div>
          {errorMsg && <div className="text-center text-[10px] text-red-600 font-bold animate-pulse">{errorMsg}</div>}
        </div>
      </div>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---
export default function App() {
  const [loading, setLoading] = useState(true);
  const [firebaseUser, setFirebaseUser] = useState(null);
  
  const [posProfile, setPosProfile] = useState(null);
  
  // Estados Login
  const [loginMode, setLoginMode] = useState('select');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [sellerPinInput, setSellerPinInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Navegación
  const [activeTab, setActiveTab] = useState('sales');

  // Datos Firestore
  const [inventory, setInventory] = useState([]);
  const [salesHistory, setSalesHistory] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [sellerToAdminPayments, setSellerToAdminPayments] = useState([]);

  // Estados Formularios Inventario/Vendedores
  const [newDesc, setNewDesc] = useState('');
  const [newWeight, setNewWeight] = useState('');
  const [newQty, setNewQty] = useState('');
  const [newImage, setNewImage] = useState('');
  const [assignTo, setAssignTo] = useState('general');
  const [editingItem, setEditingItem] = useState(null);
  const [newSellerName, setNewSellerName] = useState('');
  const [newSellerCode, setNewSellerCode] = useState('');

  // Carrito
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Efectivo');
  const [initialPayment, setInitialPayment] = useState('');

  // Modales y Acciones
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  
  const [abonoModalOpen, setAbonoModalOpen] = useState(false);
  const [abonoOrder, setAbonoOrder] = useState(null);
  const [abonoAmount, setAbonoAmount] = useState('');
  const [abonoMethod, setAbonoMethod] = useState('Efectivo');

  const [editingOrder, setEditingOrder] = useState(null);
  const [editCustomerName, setEditCustomerName] = useState('');
  const [editCustomerPhone, setEditCustomerPhone] = useState('');
  const [editPaidAmount, setEditPaidAmount] = useState('');

  // Finanzas y Pagos
  const [adminAbonoModalOpen, setAdminAbonoModalOpen] = useState(false);
  const [adminAbonoAmount, setAdminAbonoAmount] = useState('');
  const [sellerToPay, setSellerToPay] = useState(null);
  
  // Edición/Borrado de Historial de Pagos
  const [editingPayment, setEditingPayment] = useState(null);
  const [editPaymentAmount, setEditPaymentAmount] = useState('');

  const getColRef = (colName) => collection(db, 'artifacts', appId, 'public', 'data', colName);
  const getDocRef = (colName, docId) => doc(db, 'artifacts', appId, 'public', 'data', colName, docId);

  const confirmAction = (message, action) => setConfirmDialog({ message, onConfirm: action });

  // --- 1. MANEJO DE SESIÓN SEGURO Y CONEXIÓN ---
  useEffect(() => {
    // Inicialización proactiva de autenticación para evitar el "Error de conexión"
    const initAuth = async () => {
      try {
        if (!auth.currentUser) {
          if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
            await signInWithCustomToken(auth, __initial_auth_token);
          } else {
            await signInAnonymously(auth);
          }
        }
      } catch (err) {
        console.error("Auth init error:", err);
      }
    };
    initAuth();

    const savedProfile = localStorage.getItem('joyapanel_profile');
    if (savedProfile) {
      setPosProfile(JSON.parse(savedProfile));
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // --- 2. CARGA DE DATOS ---
  useEffect(() => {
    if (!posProfile || !firebaseUser) return;
    
    const adminRefUid = posProfile.adminUid;
    const errorHandler = (err) => console.error("Firestore Error:", err);
    // IMPORTANTE: Aseguramos que solo veamos los datos correspondientes al Administrador actual
    const filterByAdmin = (snap) => snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(d => d.adminUid === adminRefUid);

    const unsubInv = onSnapshot(getColRef('inventory'), (snap) => setInventory(filterByAdmin(snap)), errorHandler);
    const unsubSales = onSnapshot(getColRef('sales'), (snap) => setSalesHistory(filterByAdmin(snap).sort((a,b) => b.timestamp - a.timestamp)), errorHandler);
    const unsubSell = onSnapshot(getColRef('vendedores'), (snap) => setSellers(filterByAdmin(snap)), errorHandler);
    const unsubSellerPays = onSnapshot(getColRef('sellerPayments'), (snap) => setSellerToAdminPayments(filterByAdmin(snap).sort((a,b) => b.timestamp - a.timestamp)), errorHandler);

    return () => { unsubInv(); unsubSales(); unsubSell(); unsubSellerPays(); };
  }, [posProfile, firebaseUser]);

  // --- 3. LOGIN ---
  const handleAdminLogin = async (e) => {
    e.preventDefault(); setAuthError('');
    try {
      let userCred;
      if (isRegistering) {
        userCred = await createUserWithEmailAndPassword(auth, loginEmail, loginPassword);
      } else {
        userCred = await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      }
      const profile = { role: 'admin', adminUid: userCred.user.uid, nombre: 'Administrador' };
      setPosProfile(profile);
      localStorage.setItem('joyapanel_profile', JSON.stringify(profile));
      setActiveTab('inventory');
    } catch (error) {
      setAuthError("Credenciales incorrectas o correo ya registrado.");
    }
  };

  const handleSellerLogin = async (e) => {
    e.preventDefault(); setAuthError('');
    
    try {
      // Validamos explícitamente y esperamos la autenticación silenciosa si no está lista
      if (!auth.currentUser) {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      }

      // Ahora que la conexión está garantizada, buscamos el PIN
      const globalPinRef = doc(db, 'artifacts', appId, 'public', 'data', 'globalSellers', sellerPinInput);
      const pinSnap = await getDoc(globalPinRef);

      if (pinSnap.exists()) {
        const data = pinSnap.data();
        const profile = { role: 'seller', adminUid: data.adminUid, sellerId: data.sellerId, nombre: data.nombre };
        setPosProfile(profile);
        localStorage.setItem('joyapanel_profile', JSON.stringify(profile));
        setActiveTab('sales');
      } else {
        setAuthError("El PIN ingresado no existe.");
      }
    } catch (error) {
      console.error(error);
      setAuthError("Error de red. Asegúrate de tener conexión.");
    }
  };

  const handleLogout = () => {
    setPosProfile(null);
    localStorage.removeItem('joyapanel_profile');
    setLoginMode('select');
  };

  // --- 4. LÓGICA DEL SISTEMA ---
  
  // Vendedores
  const handleAddSeller = async (e) => {
    e.preventDefault();
    try {
      const sellerDoc = await addDoc(getColRef('vendedores'), { adminUid: posProfile.adminUid, nombre: newSellerName, pin: newSellerCode, createdAt: Date.now() });
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'globalSellers', newSellerCode), { adminUid: posProfile.adminUid, sellerId: sellerDoc.id, nombre: newSellerName });
      setNewSellerName(''); setNewSellerCode('');
    } catch (err) { console.error(err); }
  };

  const deleteSeller = (id, pin) => {
    confirmAction("¿Eliminar este vendedor?", async () => {
      try {
        await deleteDoc(getDocRef('vendedores', id));
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'globalSellers', pin));
      } catch(err) { console.error(err); }
    });
  };

  // Inventario
  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newDesc || !newWeight || !newQty) return;
    try {
      await addDoc(getColRef('inventory'), {
        adminUid: posProfile.adminUid, description: newDesc, weight: Number(newWeight), quantity: Number(newQty), image: newImage.trim(),
        cost: Number(newWeight) * 40, assignedTo: assignTo, timestamp: Date.now()
      });
      setNewDesc(''); setNewWeight(''); setNewQty(''); setNewImage(''); setAssignTo('general');
    } catch(err) { console.error(err); }
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    try {
      await updateDoc(getDocRef('inventory', editingItem.id), {
        description: editingItem.description, weight: Number(editingItem.weight), quantity: Number(editingItem.quantity),
        image: editingItem.image, cost: Number(editingItem.weight) * 40, assignedTo: editingItem.assignedTo || 'general'
      });
      setEditingItem(null);
    } catch(err) { console.error(err); }
  };

  const deleteItem = (id) => confirmAction("¿Eliminar esta joya?", async () => deleteDoc(getDocRef('inventory', id)));

  // Ventas y Carrito
  const handleAddToCart = (item) => setCart([...cart, { ...item, cartId: Date.now() + Math.random() }]);
  const removeFromCart = (cartId) => setCart(cart.filter(c => c.cartId !== cartId));

  const processCheckout = async (e) => {
    e.preventDefault();
    if (!customerName || cart.length === 0) return;
    const paymentAmount = Number(initialPayment);
    if (paymentAmount > cartTotal) return;

    const baseCostTotal = cart.reduce((sum, item) => sum + item.baseCostTotal, 0);
    const balance = cartTotal - paymentAmount;
    
    const newOrder = {
      adminUid: posProfile.adminUid, orderNumber: `JOY-${Math.floor(10000 + Math.random() * 90000)}`,
      customerName, customerPhone, items: cart, saleTotal: cartTotal, baseCostTotal,
      profit: cartTotal - baseCostTotal, paidAmount: paymentAmount, balance,
      status: balance <= 0 ? 'Pagada' : 'Pendiente',
      sellerId: posProfile.role === 'seller' ? posProfile.sellerId : 'admin',
      sellerName: posProfile.nombre, date: new Date().toLocaleString(), timestamp: Date.now(),
      payments: paymentAmount > 0 ? [{ id: Date.now(), date: new Date().toLocaleString(), amount: paymentAmount, method: paymentMethod, type: 'Inicial' }] : []
    };

    try {
      await addDoc(getColRef('sales'), newOrder);
      for (const cItem of cart) {
        const invItem = inventory.find(i => i.id === cItem.inventoryId);
        if (invItem) await updateDoc(getDocRef('inventory', invItem.id), { quantity: invItem.quantity - cItem.quantity });
      }
      setCart([]); setCheckoutModalOpen(false); setIsCartOpen(false);
      setCustomerName(''); setCustomerPhone(''); setInitialPayment('');
      setActiveTab('history');
    } catch (err) { console.error(err); }
  };

  // Historial: Editar / Eliminar Orden
  const handleDeleteOrder = (order) => {
    confirmAction("¿Seguro que deseas eliminar esta orden? El inventario será restaurado.", async () => {
      try {
        for (const item of order.items) {
          const invDocRef = getDocRef('inventory', item.inventoryId);
          const invSnap = await getDoc(invDocRef);
          if(invSnap.exists()) await updateDoc(invDocRef, { quantity: invSnap.data().quantity + item.quantity });
        }
        await deleteDoc(getDocRef('sales', order.id));
        setSelectedOrderDetails(null);
      } catch(err) { console.error(err); }
    });
  };

  const handleEditOrderSubmit = async (e) => {
    e.preventDefault();
    const newPaidAmount = Number(editPaidAmount);
    if(newPaidAmount > editingOrder.saleTotal) return;
    const newBalance = editingOrder.saleTotal - newPaidAmount;
    try {
      await updateDoc(getDocRef('sales', editingOrder.id), {
        customerName: editCustomerName, customerPhone: editCustomerPhone,
        paidAmount: newPaidAmount, balance: newBalance, status: newBalance <= 0 ? 'Pagada' : 'Pendiente'
      });
      setEditingOrder(null);
    } catch(err) { console.error(err); }
  };

  const processAbonoCliente = async (e) => {
    e.preventDefault();
    const amount = Number(abonoAmount);
    if (amount <= 0 || amount > abonoOrder.balance) return;
    const newPaidAmount = abonoOrder.paidAmount + amount;
    const newBalance = abonoOrder.saleTotal - newPaidAmount;
    try {
      await updateDoc(getDocRef('sales', abonoOrder.id), {
        paidAmount: newPaidAmount, balance: newBalance, status: newBalance <= 0 ? 'Pagada' : 'Pendiente',
        payments: [...(abonoOrder.payments||[]), { id: Date.now(), date: new Date().toLocaleString(), amount, method: abonoMethod, type: 'Abono' }]
      });
      setAbonoModalOpen(false); setAbonoAmount(''); setAbonoOrder(null);
    } catch(err) { console.error(err); }
  };

  // --- FINANZAS Y ABONOS VENDEDOR-ADMIN ---
  
  // Procesar nuevo abono
  const processAbonoAdmin = async (e) => {
    e.preventDefault();
    try {
      await addDoc(getColRef('sellerPayments'), {
        adminUid: posProfile.adminUid, sellerId: sellerToPay.id, sellerName: sellerToPay.nombre,
        amount: Number(adminAbonoAmount), date: new Date().toLocaleString(), timestamp: Date.now()
      });
      setAdminAbonoModalOpen(false); setAdminAbonoAmount(''); setSellerToPay(null);
    } catch(err) { console.error(err); }
  };

  // Editar abono existente
  const handleEditPaymentSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateDoc(getDocRef('sellerPayments', editingPayment.id), { amount: Number(editPaymentAmount) });
      setEditingPayment(null); setEditPaymentAmount('');
    } catch(err) { console.error(err); }
  };

  // Eliminar abono
  const handleDeletePayment = (paymentId) => {
    confirmAction("¿Eliminar este abono del historial?", async () => {
       await deleteDoc(getDocRef('sellerPayments', paymentId));
    });
  };

  // --- CÁLCULOS FINANCIEROS Y DE DEUDA ---
  const cartTotal = cart.reduce((sum, item) => sum + item.saleTotal, 0);
  
  // Filtros visuales dependiendo del rol
  const visibleInventory = posProfile?.role === 'admin' 
    ? inventory : inventory.filter(i => i.assignedTo === 'general' || i.assignedTo === posProfile?.sellerId);
    
  const visibleHistory = posProfile?.role === 'admin'
    ? salesHistory : salesHistory.filter(s => s.sellerId === posProfile?.sellerId);

  // Función Central de Deuda para Vendedores
  const calculateSellerDebt = (sId) => {
    // 1. Costo Base del inventario que tiene ACTUALMENTE asignado y no ha vendido
    const currentInventoryDebt = inventory.filter(i => i.assignedTo === sId).reduce((sum, i) => sum + (i.weight * 40 * i.quantity), 0);
    // 2. Costo Base de lo que YA VENDIÓ (se descuenta del inventario actual, así que el total se mantiene constante hasta que paga)
    const soldDebt = salesHistory.filter(s => s.sellerId === sId).reduce((sum, s) => sum + s.baseCostTotal, 0);
    // 3. Pagos (Abonos) realizados al Admin
    const totalPaid = sellerToAdminPayments.filter(p => p.sellerId === sId).reduce((sum, p) => sum + p.amount, 0);
    
    return (currentInventoryDebt + soldDebt) - totalPaid;
  };

  // Deuda específica de cada vendedor para el listado del Admin
  const sellerDebts = sellers.map(seller => ({
    ...seller,
    currentDebt: calculateSellerDebt(seller.id)
  }));

  // Deuda total global de todos los vendedores
  const totalSellersDebt = sellerDebts.reduce((sum, s) => sum + s.currentDebt, 0);

  // Deuda específica para el panel individual del Vendedor
  const myDebtToAdmin = posProfile?.role === 'seller' ? calculateSellerDebt(posProfile.sellerId) : 0;
  const myPaymentsHistory = sellerToAdminPayments.filter(p => p.sellerId === posProfile?.sellerId);

  // --- RENDERIZADOS ---
  if (loading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white"><IconDiamond /> Cargando...</div>;

  // LOGIN
  if (!posProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 w-full max-w-sm">
          <div className="flex justify-center text-amber-500 mb-4"><IconDiamond /></div>
          <h2 className="text-2xl font-black text-center text-gray-900 mb-8">JoyaPanel</h2>
          
          {loginMode === 'select' && (
            <div className="space-y-4">
              <button onClick={() => setLoginMode('admin')} className="w-full py-4 bg-gray-900 text-white font-bold rounded-xl shadow-md hover:bg-gray-800 transition-all">Soy Administrador</button>
              <button onClick={() => setLoginMode('seller')} className="w-full py-4 bg-amber-500 text-white font-bold rounded-xl shadow-md hover:bg-amber-600 transition-all">Soy Vendedor</button>
            </div>
          )}

          {loginMode === 'admin' && (
            <form onSubmit={handleAdminLogin} className="space-y-4 animate-in fade-in zoom-in-95">
              <h3 className="font-bold text-center mb-2">Acceso Administrador</h3>
              <input type="email" value={loginEmail} onChange={e=>setLoginEmail(e.target.value)} required placeholder="Correo electrónico" className="w-full px-4 py-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-medium" />
              <input type="password" value={loginPassword} onChange={e=>setLoginPassword(e.target.value)} required placeholder="Contraseña" className="w-full px-4 py-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-medium" />
              {authError && <div className="text-red-500 text-xs font-bold text-center bg-red-50 p-2 rounded-lg">{authError}</div>}
              <button type="submit" className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl">{isRegistering ? 'Crear Cuenta y Entrar' : 'Iniciar Sesión'}</button>
              <div className="text-center pt-2 flex justify-between text-xs font-bold">
                <button type="button" onClick={() => setLoginMode('select')} className="text-gray-400 hover:text-gray-600">← Volver</button>
                <button type="button" onClick={() => setIsRegistering(!isRegistering)} className="text-amber-600">{isRegistering ? 'Ya tengo cuenta' : 'Crear cuenta nueva'}</button>
              </div>
            </form>
          )}

          {loginMode === 'seller' && (
            <form onSubmit={handleSellerLogin} className="space-y-6 animate-in fade-in zoom-in-95">
              <h3 className="font-bold text-center mb-2">Acceso Vendedor</h3>
              <input type="password" value={sellerPinInput} onChange={e=>setSellerPinInput(e.target.value)} required placeholder="Ingresa tu PIN" className="w-full px-4 py-4 text-center text-3xl tracking-[1em] bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 font-black" />
              {authError && <div className="text-red-500 text-xs font-bold text-center bg-red-50 p-2 rounded-lg">{authError}</div>}
              <button type="submit" className="w-full py-4 bg-amber-500 text-white font-bold rounded-2xl">Entrar</button>
              <div className="text-center pt-2 text-xs font-bold">
                <button type="button" onClick={() => setLoginMode('select')} className="text-gray-400 hover:text-gray-600">← Volver al inicio</button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  // DASHBOARD PRINCIPAL
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 pb-20 md:pb-0">
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
              <button onClick={() => setActiveTab('sellers')} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${activeTab === 'sellers' ? 'bg-amber-50 text-amber-700' : 'text-gray-500 hover:bg-gray-100'}`}><IconUsers /> <span className="hidden md:inline">Vendedores</span></button>
            )}
            <button onClick={() => setActiveTab('inventory')} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${activeTab === 'inventory' ? 'bg-amber-50 text-amber-700' : 'text-gray-500 hover:bg-gray-100'}`}><IconList /> <span className="hidden md:inline">Inventario</span></button>
            <button onClick={() => setActiveTab('sales')} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${activeTab === 'sales' ? 'bg-amber-50 text-amber-700' : 'text-gray-500 hover:bg-gray-100'}`}><IconTag /> <span className="hidden md:inline">Ventas</span></button>
            <button onClick={() => setActiveTab('history')} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${activeTab === 'history' ? 'bg-amber-50 text-amber-700' : 'text-gray-500 hover:bg-gray-100'}`}><IconHistory /> <span className="hidden md:inline">Historial</span></button>
            <button onClick={() => setActiveTab('finance')} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${activeTab === 'finance' ? 'bg-amber-50 text-amber-700' : 'text-gray-500 hover:bg-gray-100'}`}><IconWallet /> <span className="hidden md:inline">Finanzas</span></button>
            <button onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-all ml-2">Salir</button>
          </div>

          {activeTab === 'sales' && (
            <button onClick={() => setIsCartOpen(true)} className="relative p-2 text-gray-600 md:hidden">
              <IconCart /> {cart.length > 0 && <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">{cart.length}</span>}
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
        <div className={`flex-1 ${activeTab === 'sales' && isCartOpen ? 'hidden md:block' : 'block'}`}>
          
          {/* TAB: INVENTARIO */}
          {activeTab === 'inventory' && (
            <div className="space-y-6">
              {posProfile.role === 'admin' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-6">
                  <h2 className="text-lg font-black mb-4">Registrar Joya</h2>
                  <form onSubmit={handleAddItem} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="sm:col-span-2"><input type="text" value={newDesc} onChange={e=>setNewDesc(e.target.value)} placeholder="Descripción" className="w-full px-3 py-2.5 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-medium" required /></div>
                    <div><input type="number" step="0.01" value={newWeight} onChange={e=>setNewWeight(e.target.value)} placeholder="Peso (g)" className="w-full px-3 py-2.5 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-medium" required /></div>
                    <div><input type="number" value={newQty} onChange={e=>setNewQty(e.target.value)} placeholder="Cant." className="w-full px-3 py-2.5 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-medium" required /></div>
                    <div>
                      <select value={assignTo} onChange={e=>setAssignTo(e.target.value)} className="w-full px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-bold text-amber-900">
                        <option value="general">Caja General</option>
                        {sellers.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                      </select>
                    </div>
                    <div className="md:col-span-4"><input type="url" value={newImage} onChange={e=>setNewImage(e.target.value)} placeholder="URL de Imagen (Opcional)" className="w-full px-3 py-2.5 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-medium" /></div>
                    <button type="submit" className="w-full py-2.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800">Guardar</button>
                  </form>
                </div>
              )}

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-50 bg-gray-50/50"><h3 className="font-bold text-gray-800">Mi Inventario Asignado</h3></div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse whitespace-nowrap">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                        <th className="p-4 font-bold border-b">Joya</th>
                        {posProfile.role === 'admin' && <th className="p-4 font-bold border-b">Asignado</th>}
                        <th className="p-4 font-bold border-b">Stock</th>
                        <th className="p-4 font-bold border-b">Peso</th>
                        <th className="p-4 font-bold border-b text-amber-600">Costo Base (Un)</th>
                        <th className="p-4 font-bold border-b text-emerald-600">Precio Sug.</th>
                        {posProfile.role === 'admin' && <th className="p-4 font-bold border-b text-right">Acciones</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-sm">
                      {visibleInventory.map(item => (
                        <tr key={item.id} className="hover:bg-gray-50/50">
                          <td className="p-4 font-bold text-gray-800 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gray-100 overflow-hidden shrink-0 border">{item.image ? <img src={item.image} className="w-full h-full object-cover"/> : <IconImage/>}</div>
                            <span>{item.description}</span>
                          </td>
                          {posProfile.role === 'admin' && <td className="p-4"><span className="px-2 py-1 rounded-md text-xs font-bold bg-gray-100 text-gray-600">{item.assignedTo === 'general' ? 'General' : sellers.find(s=>s.id===item.assignedTo)?.nombre || 'Desconocido'}</span></td>}
                          <td className="p-4"><span className={`px-2.5 py-1 rounded-full text-xs font-black ${item.quantity>0?'bg-emerald-100 text-emerald-700':'bg-red-100 text-red-700'}`}>{item.quantity}</span></td>
                          <td className="p-4 font-medium">{item.weight}g</td>
                          <td className="p-4 font-bold text-gray-600">Q{(item.weight * 40).toFixed(2)}</td>
                          <td className="p-4 font-bold text-emerald-600">Q{(item.weight * 80).toFixed(2)}</td>
                          {posProfile.role === 'admin' && (
                            <td className="p-4 flex justify-end gap-2">
                              <button onClick={() => setEditingItem(item)} className="p-2 text-blue-600 bg-blue-50 rounded-lg"><IconEdit /></button>
                              <button onClick={() => deleteItem(item.id)} className="p-2 text-red-600 bg-red-50 rounded-lg"><IconTrash /></button>
                            </td>
                          )}
                        </tr>
                      ))}
                      {visibleInventory.length === 0 && <tr><td colSpan="7" className="p-8 text-center text-gray-500">No hay inventario disponible.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: VENDEDORES (Admin) */}
          {activeTab === 'sellers' && posProfile.role === 'admin' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-black mb-4">Crear Vendedor</h2>
                <form onSubmit={handleAddSeller} className="flex gap-4 items-end">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre</label>
                    <input type="text" value={newSellerName} onChange={e=>setNewSellerName(e.target.value)} className="w-full px-3 py-2.5 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-medium" required />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">PIN Secreto</label>
                    <input type="text" value={newSellerCode} onChange={e=>setNewSellerCode(e.target.value)} className="w-full px-3 py-2.5 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-bold text-center tracking-widest" required placeholder="Ej. 1234" />
                  </div>
                  <button type="submit" className="px-6 py-2.5 bg-amber-500 text-white rounded-xl font-bold">Añadir</button>
                </form>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden p-4 space-y-3">
                <h3 className="font-bold text-gray-800 mb-2">Vendedores Activos</h3>
                {sellers.map(s => (
                  <div key={s.id} className="flex items-center justify-between p-4 bg-gray-50 border rounded-xl">
                    <div className="font-black text-gray-900">{s.nombre}</div>
                    <div className="flex gap-4 items-center">
                      <span className="font-mono bg-white border px-3 py-1 rounded-lg text-sm font-bold text-amber-600">PIN: {s.pin}</span>
                      <button onClick={() => deleteSeller(s.id, s.pin)} className="p-2 text-red-500 hover:bg-red-100 rounded-lg bg-white border"><IconTrash /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: VENTAS */}
          {activeTab === 'sales' && (
            <div>
              <div className="mb-4 flex justify-between items-center">
                <h2 className="text-xl font-black text-gray-900 mb-1">Punto de Venta</h2>
                <button onClick={() => setIsCartOpen(!isCartOpen)} className="hidden md:flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold">
                  <IconCart /> Ver Carrito {cart.length > 0 && <span className="bg-amber-500 px-2 py-0.5 rounded-full text-xs">{cart.length}</span>}
                </button>
              </div>
              {/* Cuadrícula más pequeña y compacta */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                {visibleInventory.map(item => <SalesCard key={item.id} item={item} onAddToCart={handleAddToCart} cartQty={cart.filter(c => c.inventoryId === item.id).reduce((a,b)=>a+b.quantity, 0)} />)}
                {visibleInventory.length === 0 && <div className="col-span-full text-center py-10 text-gray-500 font-bold">No tienes inventario disponible para vender.</div>}
              </div>
            </div>
          )}

          {/* TAB: HISTORIAL (ÓRDENES DE VENTA) */}
          {activeTab === 'history' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100"><h2 className="text-lg font-black text-gray-900">Historial de Órdenes de Venta</h2></div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead><tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider"><th className="p-4 font-bold border-b">Orden</th><th className="p-4 font-bold border-b">Total</th><th className="p-4 font-bold border-b">Saldo</th><th className="p-4 font-bold border-b">Estado</th><th className="p-4 font-bold border-b text-right">Acciones</th></tr></thead>
                  <tbody className="divide-y divide-gray-50 text-sm">
                    {visibleHistory.map(order => (
                      <tr key={order.id} className="hover:bg-gray-50/50">
                        <td className="p-4">
                          <div className="font-black text-gray-900 cursor-pointer text-blue-600 hover:underline" onClick={() => setSelectedOrderDetails(order)}>{order.orderNumber}</div>
                          <div className="text-xs text-gray-500 font-medium">{order.customerName} - {order.date.split(',')[0]}</div>
                        </td>
                        <td className="p-4 font-black text-gray-900">Q{order.saleTotal.toFixed(2)}</td>
                        <td className="p-4 font-bold text-red-600">Q{order.balance.toFixed(2)}</td>
                        <td className="p-4"><span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${order.status==='Pagada'?'bg-emerald-100 text-emerald-700':'bg-amber-100 text-amber-700'}`}>{order.status}</span></td>
                        <td className="p-4 flex items-center justify-end gap-2">
                          {order.status === 'Pendiente' && <button onClick={() => {setAbonoOrder(order); setAbonoModalOpen(true);}} className="text-xs font-bold bg-amber-500 text-white px-3 py-1.5 rounded-lg">Abonar</button>}
                          <button onClick={() => { setEditingOrder(order); setEditCustomerName(order.customerName); setEditCustomerPhone(order.customerPhone || ''); setEditPaidAmount(order.paidAmount); }} className="text-xs font-bold border bg-gray-50 px-3 py-1.5 rounded-lg text-gray-700">Editar</button>
                          <button onClick={() => handleDeleteOrder(order)} className="text-xs font-bold border bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100"><IconTrash/></button>
                        </td>
                      </tr>
                    ))}
                    {visibleHistory.length === 0 && <tr><td colSpan="5" className="p-8 text-center text-gray-500">No hay ventas registradas.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: FINANZAS (ADMIN Y VENDEDOR) */}
          {activeTab === 'finance' && (
            <div className="space-y-6">
              {posProfile.role === 'admin' ? (
                // PANEL FINANZAS ADMIN
                <>
                  <div className="bg-gray-900 p-6 sm:p-8 rounded-3xl shadow-xl border text-white relative flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                      <div className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2"><IconWallet/> Deuda Total de Vendedores</div>
                      <div className="text-5xl font-black">Q{totalSellersDebt.toFixed(2)}</div>
                      <p className="text-xs text-gray-400 mt-2 font-medium">Suma de inventario asignado + ventas realizadas - abonos recibidos</p>
                    </div>
                  </div>
                  
                  {/* ADMIN: CONTROL DE DEUDAS Y BOTONES DE PAGO */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-5 border-b border-gray-50 bg-gray-50/50"><h2 className="text-lg font-black text-gray-800">Desglose de Deudas por Vendedor</h2></div>
                    <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {sellerDebts.map(s => (
                        <div key={s.id} className="flex flex-col justify-between p-5 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all">
                          <div className="flex justify-between items-start mb-4">
                             <div className="font-black text-gray-900 text-lg">{s.nombre}</div>
                             <div className="text-right">
                               <div className="text-[10px] text-gray-400 font-bold uppercase">Deuda</div>
                               <div className={`font-black text-xl ${s.currentDebt > 0 ? 'text-red-500' : 'text-emerald-500'}`}>Q{s.currentDebt.toFixed(2)}</div>
                             </div>
                          </div>
                          <button onClick={() => { setSellerToPay(s); setAdminAbonoModalOpen(true); }} className="w-full text-sm bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-xl font-bold transition-colors">
                            Registrar Abono
                          </button>
                        </div>
                      ))}
                      {sellerDebts.length === 0 && <p className="text-sm text-gray-500 col-span-full">No hay vendedores creados.</p>}
                    </div>
                  </div>

                  {/* ADMIN: HISTORIAL GLOBAL DE ABONOS */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-5 border-b border-gray-50 bg-gray-50/50"><h2 className="text-lg font-black text-gray-800">Historial Global de Abonos</h2></div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead><tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider"><th className="p-4 font-bold border-b">Fecha</th><th className="p-4 font-bold border-b">Vendedor</th><th className="p-4 font-bold border-b">Monto Abonado</th><th className="p-4 font-bold border-b text-right">Acciones</th></tr></thead>
                        <tbody className="divide-y divide-gray-50 text-sm">
                           {sellerToAdminPayments.map(p => (
                             <tr key={p.id} className="hover:bg-gray-50/50">
                                <td className="p-4 font-medium text-gray-600">{p.date.split(',')[0]}</td>
                                <td className="p-4 font-bold text-gray-900">{p.sellerName || 'Desconocido'}</td>
                                <td className="p-4 font-black text-emerald-600">Q{p.amount.toFixed(2)}</td>
                                <td className="p-4 flex items-center justify-end gap-2">
                                  <button onClick={() => { setEditingPayment(p); setEditPaymentAmount(p.amount); }} className="text-xs font-bold border bg-gray-50 px-3 py-1.5 rounded-lg text-gray-700 hover:bg-gray-100">Editar</button>
                                  <button onClick={() => handleDeletePayment(p.id)} className="text-xs font-bold border bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100"><IconTrash/></button>
                                </td>
                             </tr>
                           ))}
                           {sellerToAdminPayments.length === 0 && <tr><td colSpan="4" className="p-8 text-center text-gray-500">No hay abonos registrados.</td></tr>}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : (
                // PANEL FINANZAS VENDEDOR
                <>
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                    <div className="p-6 border-b border-gray-50 bg-gray-50/50">
                      <h2 className="text-xl font-black text-gray-900">Resumen de Cuenta</h2>
                      <p className="text-sm text-gray-500 mt-1">Este panel refleja tu deuda general (inventario actual en tus manos + ventas) y los abonos que has realizado.</p>
                    </div>
                    <div className="p-6">
                      <div className="bg-red-50 p-6 sm:p-8 rounded-3xl border border-red-200 text-center sm:text-left">
                        <div className="text-sm font-bold text-red-600 uppercase mb-2">Deuda Pendiente al Administrador</div>
                        <div className="text-5xl font-black text-red-700">Q{myDebtToAdmin.toFixed(2)}</div>
                        <p className="text-xs text-red-500 font-bold mt-4 flex items-center justify-center sm:justify-start gap-1"><IconInfo/> Calculado sobre el costo base de tu inventario y ventas.</p>
                      </div>
                    </div>
                  </div>

                  {/* VENDEDOR: SU PROPIO HISTORIAL DE ABONOS */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-5 border-b border-gray-50 bg-gray-50/50"><h2 className="text-lg font-black text-gray-800">Mis Abonos Realizados</h2></div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead><tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider"><th className="p-4 font-bold border-b">Fecha de Registro</th><th className="p-4 font-bold border-b">Monto Abonado</th></tr></thead>
                        <tbody className="divide-y divide-gray-50 text-sm">
                           {myPaymentsHistory.map(p => (
                             <tr key={p.id} className="hover:bg-gray-50/50">
                                <td className="p-4 font-medium text-gray-600">{p.date}</td>
                                <td className="p-4 font-black text-emerald-600">Q{p.amount.toFixed(2)}</td>
                             </tr>
                           ))}
                           {myPaymentsHistory.length === 0 && <tr><td colSpan="2" className="p-8 text-center text-gray-500">Aún no tienes abonos registrados.</td></tr>}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* CARRITO LATERAL */}
        {activeTab === 'sales' && isCartOpen && (
          <div className="fixed inset-0 z-40 flex md:relative md:w-80 md:flex-shrink-0">
            <div className="fixed inset-0 bg-black/40 md:hidden" onClick={() => setIsCartOpen(false)}></div>
            <div className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-2xl flex flex-col md:relative md:rounded-2xl md:border h-full">
              <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-2xl">
                <h3 className="font-black flex items-center gap-2"><IconCart /> Carrito</h3>
                <button onClick={() => setIsCartOpen(false)} className="md:hidden"><IconClose /></button>
              </div>
              <div className="flex-grow overflow-y-auto p-4 space-y-3">
                {cart.map(c => (
                  <div key={c.cartId} className="bg-white p-3 rounded-xl border relative pr-8">
                    <div className="text-sm font-black truncate">{c.description}</div>
                    <div className="text-xs text-gray-500 mt-1">{c.quantity}x Q{c.salePrice} = <b>Q{c.saleTotal.toFixed(2)}</b></div>
                    <button onClick={() => removeFromCart(c.cartId)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 hover:text-red-500"><IconClose /></button>
                  </div>
                ))}
              </div>
              <div className="p-5 border-t bg-gray-50 rounded-b-2xl">
                <div className="flex justify-between items-center mb-4"><span className="font-bold text-gray-500">Total:</span><span className="text-2xl font-black text-amber-500">Q{cartTotal.toFixed(2)}</span></div>
                <button onClick={() => setCheckoutModalOpen(true)} disabled={cart.length === 0} className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-bold disabled:bg-gray-300">Cobrar</button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL COBRAR ORDEN */}
      {checkoutModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-5 bg-gray-50 border-b flex justify-between"><h3 className="font-black">Completar Venta</h3><button onClick={() => setCheckoutModalOpen(false)}><IconClose/></button></div>
            <form onSubmit={processCheckout} className="p-6 space-y-4">
              <div className="bg-amber-50 p-4 rounded-2xl flex justify-between border border-amber-100"><span className="font-bold text-amber-800 text-sm">Total:</span><span className="text-3xl font-black text-amber-600">Q{cartTotal.toFixed(2)}</span></div>
              <input type="text" value={customerName} onChange={e=>setCustomerName(e.target.value)} required placeholder="Nombre Cliente" className="w-full px-3 py-2.5 border rounded-xl font-bold" />
              <input type="text" value={customerPhone} onChange={e=>setCustomerPhone(e.target.value)} placeholder="Teléfono" className="w-full px-3 py-2.5 border rounded-xl font-bold" />
              <div className="flex gap-4">
                <input type="number" step="0.01" max={cartTotal} value={initialPayment} onChange={e=>setInitialPayment(e.target.value)} required placeholder="Monto que Paga" className="w-1/2 px-3 py-2.5 border rounded-xl font-black text-amber-600" />
                <select value={paymentMethod} onChange={e=>setPaymentMethod(e.target.value)} className="w-1/2 px-3 py-2.5 border rounded-xl font-bold"><option>Efectivo</option><option>Transferencia</option></select>
              </div>
              <button type="submit" className="w-full mt-4 py-3.5 bg-amber-500 text-white font-black rounded-xl text-lg">Confirmar</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DETALLES ORDEN COMPLETO */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-5 border-b flex justify-between"><h3 className="font-black">Orden: <span className="text-amber-600">{selectedOrderDetails.orderNumber}</span></h3><button onClick={() => setSelectedOrderDetails(null)}><IconClose/></button></div>
            <div className="p-6 overflow-y-auto space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div><span className="text-gray-400 text-[10px] font-bold uppercase">Cliente</span> <div className="font-black text-gray-800">{selectedOrderDetails.customerName}</div></div>
                <div><span className="text-gray-400 text-[10px] font-bold uppercase">Teléfono</span> <div className="font-bold text-gray-600">{selectedOrderDetails.customerPhone || 'N/A'}</div></div>
                <div><span className="text-gray-400 text-[10px] font-bold uppercase">Vendedor</span> <div className="font-bold text-gray-600">{selectedOrderDetails.sellerName}</div></div>
                <div><span className="text-gray-400 text-[10px] font-bold uppercase">Estado</span> <div className={selectedOrderDetails.status==='Pagada'?'text-emerald-600 font-black':'text-red-600 font-black'}>{selectedOrderDetails.status}</div></div>
              </div>
              <div>
                <h4 className="font-black mb-2 border-b pb-2">Artículos Vendidos</h4>
                {selectedOrderDetails.items.map((it, idx) => (
                  <div key={idx} className="border p-3 rounded-xl mb-2 bg-white shadow-sm">
                    <div className="flex justify-between font-black mb-1"><span>{it.quantity}x {it.description}</span><span>Q{it.saleTotal.toFixed(2)}</span></div>
                    <div className="flex flex-col gap-1 text-[11px]">
                       <div className="flex justify-between text-gray-500 font-bold"><span>Precio Venta Un: Q{it.salePrice.toFixed(2)}</span></div>
                       <div className="flex justify-between font-bold">
                         <span className="text-gray-500">Costo Base: Q{it.baseCostTotal.toFixed(2)}</span>
                         <span className="text-emerald-500">Ganancia: Q{it.profit.toFixed(2)}</span>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <h4 className="font-black mb-2 border-b pb-2">Historial de Pagos del Cliente</h4>
                {selectedOrderDetails.payments?.map(p => (
                  <div key={p.id} className="flex justify-between text-xs py-1 border-b border-dashed text-gray-600">
                    <span>{p.date.split(',')[0]} - {p.type} ({p.method})</span>
                    <span className="font-bold text-gray-900">Q{p.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDITAR ORDEN */}
      {editingOrder && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6">
            <h3 className="font-black mb-4">Editar Orden: {editingOrder.orderNumber}</h3>
            <form onSubmit={handleEditOrderSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre Cliente</label>
                <input type="text" value={editCustomerName} onChange={e=>setEditCustomerName(e.target.value)} required className="w-full px-3 py-2.5 border rounded-xl font-bold" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Teléfono</label>
                <input type="text" value={editCustomerPhone} onChange={e=>setEditCustomerPhone(e.target.value)} className="w-full px-3 py-2.5 border rounded-xl font-bold" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Total Pagado (Acumulado)</label>
                <input type="number" step="0.01" max={editingOrder.saleTotal} value={editPaidAmount} onChange={e=>setEditPaidAmount(e.target.value)} required className="w-full px-3 py-2.5 border rounded-xl font-black text-amber-600" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setEditingOrder(null)} className="w-1/2 py-3 bg-gray-100 rounded-xl font-bold text-gray-600">Cancelar</button>
                <button type="submit" className="w-1/2 py-3 bg-amber-500 text-white font-bold rounded-xl shadow-md">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ABONO CLIENTE */}
      {abonoModalOpen && abonoOrder && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6">
            <h3 className="font-black mb-4">Abono del Cliente</h3>
            <form onSubmit={processAbonoCliente} className="space-y-4">
              <div className="flex justify-between mb-4"><b>Saldo Pendiente:</b><b className="text-red-500">Q{abonoOrder.balance.toFixed(2)}</b></div>
              <input type="number" step="0.01" max={abonoOrder.balance} value={abonoAmount} onChange={e=>setAbonoAmount(e.target.value)} required placeholder="Monto a abonar" className="w-full px-3 py-2.5 border rounded-xl font-bold" />
              <select value={abonoMethod} onChange={e=>setAbonoMethod(e.target.value)} className="w-full px-3 py-2.5 bg-white border rounded-xl font-bold">
                 <option>Efectivo</option>
                 <option>Transferencia</option>
              </select>
              <button type="submit" className="w-full py-3 bg-amber-500 text-white font-bold rounded-xl">Guardar Abono</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ABONO ADMIN A VENDEDOR */}
      {adminAbonoModalOpen && sellerToPay && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6">
            <h3 className="font-black mb-1">Registrar Pago de Vendedor</h3>
            <p className="text-sm text-gray-500 mb-4 font-bold">{sellerToPay.nombre}</p>
            <form onSubmit={processAbonoAdmin} className="space-y-4">
              <div className="flex justify-between mb-4"><b>Deuda Actual:</b><b className="text-red-500">Q{sellerToPay.currentDebt.toFixed(2)}</b></div>
              <input type="number" step="0.01" value={adminAbonoAmount} onChange={e=>setAdminAbonoAmount(e.target.value)} required placeholder="Monto entregado por el vendedor" className="w-full px-3 py-2.5 border rounded-xl font-bold" />
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => {setAdminAbonoModalOpen(false); setSellerToPay(null);}} className="w-1/2 py-3 bg-gray-100 rounded-xl font-bold text-gray-600">Cancelar</button>
                <button type="submit" className="w-1/2 py-3 bg-amber-500 text-white font-bold rounded-xl shadow-md">Confirmar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDITAR HISTORIAL DE ABONO DE VENDEDOR */}
      {editingPayment && (
         <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6">
            <h3 className="font-black mb-1">Editar Abono Registrado</h3>
            <p className="text-sm text-gray-500 mb-4 font-bold">{editingPayment.sellerName}</p>
            <form onSubmit={handleEditPaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nuevo Monto (Q)</label>
                <input type="number" step="0.01" value={editPaymentAmount} onChange={e=>setEditPaymentAmount(e.target.value)} required className="w-full px-3 py-2.5 border rounded-xl font-bold" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setEditingPayment(null)} className="w-1/2 py-3 bg-gray-100 rounded-xl font-bold text-gray-600">Cancelar</button>
                <button type="submit" className="w-1/2 py-3 bg-amber-500 text-white font-bold rounded-xl shadow-md">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMACION GLOBAL */}
      {confirmDialog && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6 text-center">
            <h3 className="font-black text-lg mb-6 text-gray-900">{confirmDialog.message}</h3>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setConfirmDialog(null)} className="w-1/2 py-3 bg-gray-100 rounded-xl font-bold text-gray-600 hover:bg-gray-200">Cancelar</button>
              <button onClick={() => { confirmDialog.onConfirm(); setConfirmDialog(null); }} className="w-1/2 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-md">Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}