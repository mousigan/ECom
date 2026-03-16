import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { Minus, Plus, Trash2 } from 'lucide-react';

const Cart = () => {
    const { cartItems, removeFromCart, updateQuantity, cartTotal } = useCart();
    const navigate = useNavigate();

    const containerStyle = {
        padding: '40px 4%',
        background: '#f8fafc',
        minHeight: '80vh',
    };



    const summaryCard = {
        background: 'white',
        padding: '30px',
        borderRadius: '24px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        height: 'fit-content',
    };

    const btnStyle = {
        width: '100%',
        padding: '16px',
        background: 'linear-gradient(to right, #6366f1, #ec4899)',
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        fontSize: '18px',
        fontWeight: '700',
        cursor: 'pointer',
        marginTop: '20px',
    };

    return (
        <div style={containerStyle}>
            <div className="checkout-grid">
                <div>
                    <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '30px' }}>Your Shopping Bag</h1>
                    
                    {cartItems.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '100px', background: 'white', borderRadius: '24px' }}>
                            <h3>Your bag is empty</h3>
                            <Link to="/catalog" style={{ color: '#6366f1', textDecoration: 'none', fontWeight: '600' }}>Explore Catalog</Link>
                        </div>
                    ) : (
                        cartItems.map(item => (
                            <div key={item.id} className="cart-item-card">
                                <img 
                                    src={item.thumbnail} 
                                    alt={item.name} 
                                    className="cart-image"
                                    style={{ width: '100px', height: '100px', background: '#f3f4f6', borderRadius: '12px', objectFit: 'contain', padding: '10px' }} 
                                />
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ fontSize: '20px', fontWeight: '700' }}>{item.name}</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '10px' }}>
                                        <button 
                                            onClick={() => updateQuantity(item.id, -1)}
                                            style={{ width: '30px', height: '30px', borderRadius: '50%', border: '1.5px solid #e2e8f0', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                                        >
                                            <Minus size={14} />
                                        </button>
                                        <span style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>{item.quantity}</span>
                                        <button 
                                            onClick={() => updateQuantity(item.id, 1)}
                                            disabled={item.quantity >= (item.stock || 999)}
                                            style={{ 
                                                width: '30px', 
                                                height: '30px', 
                                                borderRadius: '50%', 
                                                border: '1.5px solid #e2e8f0', 
                                                background: 'white', 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'center', 
                                                cursor: item.quantity >= (item.stock || 999) ? 'not-allowed' : 'pointer', 
                                                transition: 'all 0.2s',
                                                opacity: item.quantity >= (item.stock || 999) ? 0.5 : 1
                                            }}
                                        >
                                            <Plus size={14} />
                                        </button>
                                        {item.stock !== undefined && (
                                            <span style={{ fontSize: '11px', color: item.stock < 5 ? '#ef4444' : '#64748b', fontWeight: '500' }}>
                                                {item.stock} available
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ fontSize: '20px', fontWeight: '800', color: '#6366f1' }}>₹{item.price * item.quantity}</p>
                                    <button onClick={() => removeFromCart(item.id)} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: '600', padding: '5px' }}>
                                        <Trash2 size={14} /> Remove
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div style={summaryCard}>
                <h2 style={{ marginBottom: '25px' }}>Order Summary</h2>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', color: '#6b7280' }}>
                    <span>Subtotal</span>
                    <span>₹{cartTotal.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', color: '#6b7280' }}>
                    <span>Shipping</span>
                    <span>FREE</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 0', borderTop: '1px solid #f3f4f6', borderBottom: '1px solid #f3f4f6', marginBottom: '25px' }}>
                    <span style={{ fontSize: '20px', fontWeight: '700' }}>Grand Total</span>
                    <span style={{ fontSize: '20px', fontWeight: '800', color: '#6366f1' }}>₹{cartTotal.toFixed(2)}</span>
                </div>
                
                <div style={{ background: '#fef3c7', padding: '15px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #fde68a' }}>
                    <p style={{ fontSize: '12px', color: '#92400e', fontWeight: '600', margin: 0 }}>
                        ⭐ You will earn {Math.floor(cartTotal / 1000) * 3} Credit Points with this order!
                    </p>
                </div>

                <button 
                    disabled={cartItems.length === 0}
                    onClick={() => navigate('/checkout')} 
                    style={{ ...btnStyle, opacity: cartItems.length === 0 ? 0.5 : 1 }}
                >
                    Proceed to Checkout
                </button>
            </div>
        </div>
    </div>
    );
};

export default Cart;
