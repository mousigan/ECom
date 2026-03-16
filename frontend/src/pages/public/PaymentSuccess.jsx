import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { createOrder } from '../../api/orderService';


const PaymentSuccess = () => {
    const { cartItems, cartTotal, clearCart } = useCart();
    const { user, updateUser } = useAuth();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const paidAmount = parseFloat(queryParams.get('paidAmount')) || location.state?.paidAmount || cartTotal;
    const pointsUsed = queryParams.get('pointsUsed') === 'true' || location.state?.pointsUsed || false;
    const [rewardPoints, setRewardPoints] = useState(0);
    const [orderConfirmed, setOrderConfirmed] = useState(false);
    const navigate = useNavigate();
    const processingRef = useRef(false);

    useEffect(() => {
        const finalizeOrder = async () => {
            if (!user || processingRef.current) return;
            processingRef.current = true; // Lock execution

            // 1. Check if we need to call createOrder (for Stripe redirect success OR Demo success)
            const stripeStatus = queryParams.get('redirect_status');
            const demoMode = queryParams.get('mode') === 'demo';
            const codMode = queryParams.get('mode') === 'cod';
            const cartBackup = localStorage.getItem('checkout_pending_cart');
            const totalBackup = localStorage.getItem('checkout_pending_total');
            const pointsBackup = localStorage.getItem('checkout_pending_points');
            const addressBackup = localStorage.getItem('checkout_pending_address');

            if ((stripeStatus === 'succeeded' || demoMode || codMode) && cartBackup) {
                try {
                    const parsedCart = JSON.parse(cartBackup);
                    await createOrder(user.id, {
                        totalAmount: parseFloat(totalBackup),
                        pointsUsed: pointsBackup === 'true',
                        shippingAddress: addressBackup,
                        items: parsedCart.map(item => ({
                            productId: item.id,
                            vendorId: item.vendorId || null,
                            quantity: item.quantity
                        }))
                    });
                } catch (err) {
                    console.error("Order creation failed on success page:", err);
                } finally {
                    localStorage.removeItem('checkout_pending_cart');
                    localStorage.removeItem('checkout_pending_total');
                    localStorage.removeItem('checkout_pending_points');
                    localStorage.removeItem('checkout_pending_address');
                    localStorage.removeItem('checkout_is_ai');
                }
            } else {
                // If we reach success page without a backup or valid status, 
                // clean up anyway to be safe for next time
                localStorage.removeItem('checkout_pending_cart');
                localStorage.removeItem('checkout_pending_total');
                localStorage.removeItem('checkout_pending_points');
                localStorage.removeItem('checkout_pending_address');
                localStorage.removeItem('checkout_is_ai');
            }

            // Always clear app cart state
            clearCart();

            // Always update XP local state
            const earned = Math.floor(paidAmount / 1000) * 3;
            setRewardPoints(earned);
            const currentPoints = pointsUsed ? 0 : (user.creditPoints || 0);
            updateUser({ creditPoints: currentPoints + earned });
        };

        finalizeOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, paidAmount, pointsUsed]);

    const celebrationStyle = {
        padding: '100px 50px',
        textAlign: 'center',
        background: 'white',
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    };

    const logoContainer = {
        width: '120px',
        height: '120px',
        background: '#ecfdf5',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '40px',
        boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.2)',
    };

    return (
        <div style={celebrationStyle}>
            <div style={logoContainer}>
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 13L9 17L19 7" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </div>

            <h1 style={{ fontSize: '48px', fontWeight: '800', marginBottom: '10px' }}>Order Confirmed!</h1>
            <p style={{ color: '#6b7280', fontSize: '20px', marginBottom: '40px' }}>Your payment was successful and your sustainability journey continues.</p>

            <div style={{ background: '#f8fafc', padding: '30px 60px', borderRadius: '32px', border: '1px solid #e2e8f0', marginBottom: '50px' }}>
                <h3 style={{ fontSize: '18px', marginBottom: '10px' }}>Eco-Rewards Unlocked</h3>
                <p style={{ fontSize: '48px', fontWeight: '900', color: '#6366f1' }}>+{rewardPoints} <span style={{ fontSize: '20px' }}>XP</span></p>
                <p style={{ color: '#6b7280', fontSize: '14px' }}>These points have been added to your global account.</p>
            </div>

            <div style={{ display: 'flex', gap: '20px' }}>
                <Link to="/catalog" style={{ 
                    padding: '16px 40px', 
                    background: '#6366f1', 
                    color: 'white', 
                    borderRadius: '12px', 
                    fontWeight: '700', 
                    textDecoration: 'none',
                    fontSize: '16px'
                }}>
                    Back to Catalog
                </Link>
                <Link to="/profile" style={{ 
                    padding: '16px 40px', 
                    background: '#f3f4f6', 
                    color: '#4b5563', 
                    borderRadius: '12px', 
                    fontWeight: '700', 
                    textDecoration: 'none',
                    fontSize: '16px'
                }}>
                    View Order Details
                </Link>
            </div>
        </div>
    );
};

export default PaymentSuccess;
