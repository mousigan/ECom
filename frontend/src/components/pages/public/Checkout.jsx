import React, { useState, useEffect, useMemo, useRef } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { createPaymentIntent } from '../../api/paymentService';
import { createOrder } from '../../api/orderService';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import StripePaymentForm from '../../components/checkout/StripePaymentForm';
import { CreditCard, Rocket, CheckCircle, MapPin, Truck, Wallet, Info } from 'lucide-react';

// Fix Leaflet marker icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

// Helper to handle Map updates from external triggers
const MapUpdater = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center) map.setView(center, 13);
    }, [center, map]);
    return null;
};

const Checkout = () => {
    const { cartTotal, cartItems, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    
    // States
    const [step, setStep] = useState(localStorage.getItem('checkout_pending_address') ? 'payment' : 'address');
    const [loading, setLoading] = useState(false);
    const [clientSecret, setClientSecret] = useState('');
    const [paymentMode, setPaymentMode] = useState('stripe');
    const [paymentError, setPaymentError] = useState(null);
    
    // Address State
    const [address, setAddress] = useState(localStorage.getItem('checkout_pending_address') || '');
    const [position, setPosition] = useState([12.9716, 77.5946]); // Default to Bangalore
    
    // AI-Order Synergy: If coming from Bot, use local storage data
    const isAiOrder = localStorage.getItem('checkout_is_ai') === 'true';
    const localCart = useMemo(() => {
        const data = localStorage.getItem('checkout_pending_cart');
        return data ? JSON.parse(data) : [];
    }, []);

    const localTotal = useMemo(() => {
        return parseFloat(localStorage.getItem('checkout_pending_total') || '0');
    }, []);

    const itemsToDisplay = (isAiOrder && localCart.length > 0) ? localCart : (cartItems.length > 0 ? cartItems : localCart);
    const baseTotal = (isAiOrder && localCart.length > 0) ? localTotal : (cartItems.length > 0 ? cartTotal : localTotal);

    // Credit Points State
    const [usePoints, setUsePoints] = useState(localStorage.getItem('checkout_pending_points') === 'true');
    const pointsValue = user?.creditPoints || 0;
    const finalAmount = usePoints ? Math.max(0, baseTotal - pointsValue) : baseTotal;

    useEffect(() => {
        // Validation: If no items in cart AND no AI order, go back
        if (cartItems.length === 0 && localCart.length === 0) {
            navigate('/cart');
        }
        
        // Auto-fetch Stripe secret if on payment step and we have a valid amount
        if (step === 'payment' && !clientSecret && finalAmount > 0) {
            fetchPaymentIntent();
        }
    }, [cartItems.length, localCart.length, navigate, step, finalAmount]);

    // Geocoding: Text -> Coords
    const handleAddressSearch = async () => {
        if (!address) return;
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
            const data = await res.json();
            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                setPosition([parseFloat(lat), parseFloat(lon)]);
            }
        } catch (e) {
            console.error("Geocoding error", e);
        }
    };

    // Reverse Geocoding: Coords -> Text
    const updateAddressFromCoords = async (lat, lng) => {
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await res.json();
            if (data && data.display_name) {
                setAddress(data.display_name);
            }
        } catch (e) {
            console.error("Reverse geocoding error", e);
        }
    };

    const handleProceedToPayment = () => {
        if (!address) {
            alert("Please provide the delivery address.");
            return;
        }
        
        // Save backup for Stripe redirect recovery
        localStorage.setItem('checkout_pending_cart', JSON.stringify(cartItems));
        localStorage.setItem('checkout_pending_total', finalAmount.toString());
        localStorage.setItem('checkout_pending_points', usePoints.toString());
        localStorage.setItem('checkout_pending_address', address);

        setStep('payment');
        setPaymentError(null);
        fetchPaymentIntent();
    };

    const fetchPaymentIntent = async () => {
        setLoading(true);
        setPaymentError(null);
        try {
            const data = await createPaymentIntent(finalAmount, 'inr');
            if (data.clientSecret) {
                setClientSecret(data.clientSecret);
            } else {
                setPaymentError("Could not initialize Stripe. Please try Demo Mode.");
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching client secret:', error);
            setPaymentError("Server Error: Payment gateway is currently offline.");
            setLoading(false);
        }
    };

    const handleDemoPayment = async () => {
        setLoading(true);
        // We move createOrder to PaymentSuccess to prevent duplicates
        // handleProceedToPayment already saved the backups to localStorage
        navigate(`/payment-success?mode=demo&paidAmount=${finalAmount}&pointsUsed=${usePoints}`); 
    };

    const handleCODPayment = async () => {
        setLoading(true);
        // Direct navigate to success page with mode=cod
        navigate(`/payment-success?mode=cod&paidAmount=${finalAmount}&pointsUsed=${usePoints}`);
    };

    // Map Event Handler Component
    const MapEvents = () => {
        useMapEvents({
            click(e) {
                setPosition([e.latlng.lat, e.latlng.lng]);
                updateAddressFromCoords(e.latlng.lat, e.latlng.lng);
            },
        });
        return null;
    };

    if (loading && step === 'payment' && !clientSecret) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', gap: '20px' }}>
                <div style={{ width: '50px', height: '50px', border: '5px solid #f3f4f6', borderTop: '5px solid #6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <p>Initializing Secure Payment...</p>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    const containerStyle = { maxWidth: '1400px', margin: '40px auto', padding: '0 4%' };
    const cardStyle = { background: 'white', padding: '30px', borderRadius: '24px', boxShadow: '0 10px 15px -1px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' };

    return (
        <div style={containerStyle}>
            <div className="checkout-grid">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    {/* Step 1: Address Selection */}
                    <div style={{ ...cardStyle, border: step === 'address' ? '2px solid #6366f1' : '1px solid #f1f5f9', opacity: step === 'payment' ? 0.6 : 1 }}>
                        <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '24px', fontWeight: '800', marginBottom: '20px' }}>
                            <MapPin size={28} color="#6366f1" /> Delivery Address
                        </h2>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#64748b', marginBottom: '8px' }}>Type Address or Pin on Map</label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input 
                                    type="text" 
                                    value={address} 
                                    onChange={(e) => setAddress(e.target.value)}
                                    onBlur={handleAddressSearch}
                                    placeholder="Colony, Street, City..."
                                    style={{ flex: 1, padding: '12px 18px', borderRadius: '12px', border: '1.5px solid #e2e8f0', fontSize: '15px' }}
                                />
                                <button 
                                    onClick={handleAddressSearch}
                                    style={{ padding: '0 20px', background: '#f1f5f9', border: 'none', borderRadius: '12px', color: '#6366f1', fontWeight: '700', cursor: 'pointer' }}
                                >
                                    Locate
                                </button>
                            </div>
                        </div>

                        <div style={{ height: '300px', borderRadius: '16px', overflow: 'hidden', border: '1.5px solid #e2e8f0', zIndex: 1 }}>
                            <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                <Marker 
                                    position={position} 
                                    draggable={true} 
                                    eventHandlers={{
                                        dragend: (e) => {
                                            const marker = e.target;
                                            const pos = marker.getLatLng();
                                            setPosition([pos.lat, pos.lng]);
                                            updateAddressFromCoords(pos.lat, pos.lng);
                                        }
                                    }}
                                />
                                <MapUpdater center={position} />
                                <MapEvents />
                            </MapContainer>
                        </div>

                        {step === 'address' && (
                            <button 
                                onClick={handleProceedToPayment}
                                style={{ width: '100%', marginTop: '25px', padding: '16px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                            >
                                Confirm Address & Continue <Rocket size={20} />
                            </button>
                        )}
                    </div>

                    {/* Step 2: Payment Section */}
                    {step === 'payment' && (
                        <div style={cardStyle}>
                            <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '24px', fontWeight: '800', marginBottom: '25px' }}>
                                <Wallet size={28} color="#6366f1" /> Payment & Rewards
                            </h2>

                            {/* Credit Points Section */}
                            {pointsValue > 0 && (
                                <div style={{ background: '#f5f3ff', padding: '20px', borderRadius: '16px', border: '1px solid #ddd6fe', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h4 style={{ margin: 0, color: '#5b21b6', display: 'flex', alignItems: 'center', gap: '6px' }}>Available Credit Points: {pointsValue} <Info size={14} /></h4>
                                        <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#7c3aed' }}>You can save ₹{pointsValue} on this order.</p>
                                    </div>
                                    <button 
                                        onClick={() => setUsePoints(!usePoints)}
                                        style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: usePoints ? '#10b981' : '#6366f1', color: 'white', fontWeight: '700', cursor: 'pointer' }}
                                    >
                                        {usePoints ? 'Points Applied' : 'Use Points'}
                                    </button>
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', flexWrap: 'wrap' }}>
                                <button 
                                    onClick={() => setPaymentMode('stripe')}
                                    style={{ flex: 1, minWidth: '120px', padding: '15px', borderRadius: '12px', border: paymentMode === 'stripe' ? '2px solid #6366f1' : '1px solid #e2e8f0', background: paymentMode === 'stripe' ? '#f5f3ff' : 'white', cursor: 'pointer', fontWeight: '700', transition: 'all 0.2s' }}
                                >
                                    Stripe Card
                                </button>
                                <button 
                                    onClick={() => setPaymentMode('cod')}
                                    style={{ flex: 1, minWidth: '120px', padding: '15px', borderRadius: '12px', border: paymentMode === 'cod' ? '2px solid #6366f1' : '1px solid #e2e8f0', background: paymentMode === 'cod' ? '#f5f3ff' : 'white', cursor: 'pointer', fontWeight: '700', transition: 'all 0.2s' }}
                                >
                                    Cash on Delivery
                                </button>
                                <button 
                                    onClick={() => setPaymentMode('demo')}
                                    style={{ flex: 1, minWidth: '120px', padding: '15px', borderRadius: '12px', border: paymentMode === 'demo' ? '2px solid #6366f1' : '1px solid #e2e8f0', background: paymentMode === 'demo' ? '#f5f3ff' : 'white', cursor: 'pointer', fontWeight: '700', transition: 'all 0.2s' }}
                                >
                                    Demo Mode
                                </button>
                            </div>

                            {paymentMode === 'stripe' ? (
                                clientSecret ? (
                                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                                        <StripePaymentForm finalAmount={finalAmount} pointsUsed={usePoints} />
                                    </Elements>
                                ) : paymentError ? (
                                    <div style={{ padding: '20px', background: '#fff1f2', borderRadius: '12px', border: '1px solid #fda4af', textAlign: 'center' }}>
                                        <p style={{ color: '#be123c', fontWeight: '700', margin: 0 }}>{paymentError}</p>
                                        <button onClick={fetchPaymentIntent} style={{ marginTop: '10px', background: 'none', border: 'none', color: '#6366f1', textDecoration: 'underline', cursor: 'pointer', fontWeight: '600' }}>Retry Connection</button>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#64748b' }}>
                                        <div style={{ width: '20px', height: '20px', border: '3px solid #f3f4f6', borderTop: '3px solid #6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                                        <span>Loading Secure Stripe Card...</span>
                                    </div>
                                )
                            ) : paymentMode === 'cod' ? (
                                <div style={{ textAlign: 'center', padding: '40px', background: '#fffbeb', borderRadius: '24px', border: '2px dashed #f59e0b' }}>
                                    <Truck size={48} color="#f59e0b" style={{ marginBottom: '20px' }} />
                                    <h3 style={{ color: '#92400e' }}>Cash on Delivery</h3>
                                    <p style={{ color: '#b45309', fontSize: '14px', marginTop: '5px' }}>Pay the amount when your items arrive at your doorstep.</p>
                                    <button 
                                        onClick={handleCODPayment}
                                        disabled={loading}
                                        style={{ 
                                            width: '100%', 
                                            marginTop: '25px', 
                                            padding: '16px', 
                                            background: '#f59e0b', 
                                            color: 'white', 
                                            border: 'none', 
                                            borderRadius: '12px', 
                                            fontWeight: '800', 
                                            cursor: loading ? 'not-allowed' : 'pointer',
                                            opacity: loading ? 0.7 : 1,
                                            boxShadow: '0 4px 6px -1px rgba(245, 158, 11, 0.3)'
                                        }}
                                    >
                                        {loading ? 'Processing...' : `Place COD Order (₹${finalAmount})`}
                                    </button>
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '40px', background: '#f8fafc', borderRadius: '24px', border: '2px dashed #e2e8f0' }}>
                                    <CheckCircle size={48} color="#10b981" style={{ marginBottom: '20px' }} />
                                    <h3>Ready for Demo Payment</h3>
                                    <button 
                                        onClick={handleDemoPayment}
                                        disabled={loading}
                                        style={{ 
                                            width: '100%', 
                                            marginTop: '20px', 
                                            padding: '15px', 
                                            background: '#10b981', 
                                            color: 'white', 
                                            border: 'none', 
                                            borderRadius: '12px', 
                                            fontWeight: '800', 
                                            cursor: loading ? 'not-allowed' : 'pointer',
                                            opacity: loading ? 0.7 : 1
                                        }}
                                    >
                                        {loading ? 'Processing Order...' : `Complete Payment (₹${finalAmount})`}
                                    </button>
                                </div>
                            )}
                            
                            <button 
                                onClick={() => setStep('address')}
                                style={{ width: '100%', marginTop: '20px', background: 'none', border: 'none', color: '#64748b', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline' }}
                            >
                                Change Shipping Address
                            </button>
                        </div>
                    )}
                </div>

                {/* Sidebar: Summary */}
                <div style={{ height: 'fit-content', position: 'sticky', top: '40px' }}>
                    <div style={cardStyle}>
                        <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '15px' }}>Order Summary</h3>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                            {itemsToDisplay.map((item, idx) => (
                                <div key={item.id || idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                    <span style={{ color: '#64748b' }}>{item.quantity}x {item.name}</span>
                                    <span style={{ fontWeight: '600' }}>₹{(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '20px 0', borderTop: '1px solid #f1f5f9' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                                <span>Subtotal</span>
                                <span>₹{baseTotal.toFixed(2)}</span>
                            </div>
                            {usePoints && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981', fontWeight: '600' }}>
                                    <span>Points Discount</span>
                                    <span>- ₹{pointsValue}</span>
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '20px', marginTop: '10px' }}>
                                <span>Total</span>
                                <span style={{ color: '#6366f1' }}>₹{finalAmount.toFixed(2)}</span>
                            </div>
                        </div>

                        <div style={{ background: '#f0fdf4', padding: '15px', borderRadius: '12px', border: '1px solid #dcfce7', marginTop: '10px' }}>
                            <p style={{ margin: 0, fontSize: '13px', color: '#166534', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Rocket size={16} /> Future Reward: +{Math.floor(finalAmount / 1000) * 3} Points
                            </p>
                            <p style={{ margin: '5px 0 0', fontSize: '11px', color: '#15803d' }}>3 points per ₹1000 spent. For your next order!</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
