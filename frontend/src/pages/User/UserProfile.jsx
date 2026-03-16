import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../api/axiosConfig';

const UserProfile = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, [user]);

    const fetchOrders = () => {
        if (user) {
            axiosInstance.get(`/orders/${user.id}`)
                .then(res => { setOrders(res.data || []); setLoading(false); })
                .catch(() => setLoading(false));
        }
    };

    const handleCancelOrder = async (orderId) => {
        if (!window.confirm('Are you sure you want to cancel this order?')) return;
        try {
            await axiosInstance.post(`/orders/${orderId}/cancel/${user.id}`);
            fetchOrders();
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.response?.data || 'Failed to cancel order';
            alert(typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : errorMsg);
        }
    };

    const containerStyle = { padding: '40px 50px', background: '#f8fafc', minHeight: '80vh' };
    const xpCardStyle = { background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)', padding: '40px', borderRadius: '32px', color: 'white', marginBottom: '40px', textAlign: 'center', boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.3)' };

    const statusColor = (status) => {
        if (status === 'PENDING') return '#f59e0b';
        if (status === 'DELIVERED') return '#10b981';
        return '#6366f1';
    };

    return (
        <div style={containerStyle}>
            <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start' }}>
                <div style={{ flex: '1' }}>
                    <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '10px' }}>Hi, {user?.name}!</h1>
                    <p style={{ color: '#6b7280', marginBottom: '30px' }}>Welcome back to your sustainability dashboard.</p>
                    
                    <div style={xpCardStyle}>
                        <h4 style={{ margin: 0, fontSize: '18px', opacity: 0.8 }}>Current Reward XP</h4>
                        <p style={{ fontSize: '72px', fontWeight: '900', margin: '10px 0' }}>{user?.creditPoints || 0}</p>
                        <p style={{ margin: 0, fontWeight: '600' }}>
                            {(user?.creditPoints || 0) >= 500 ? '🥇 Gold Tier Member' : (user?.creditPoints || 0) >= 100 ? '🥈 Silver Tier Member' : '🥉 Bronze Tier Member'}
                        </p>
                    </div>

                    <div style={{ background: 'white', padding: '30px', borderRadius: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                        <h3 style={{ marginBottom: '20px' }}>Account Information</h3>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                            <span style={{ color: '#9ca3af' }}>Email Address</span>
                            <span style={{ fontWeight: '600' }}>{user?.email}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#9ca3af' }}>Account Type</span>
                            <span style={{ fontWeight: '600', color: '#6366f1' }}>{user?.role}</span>
                        </div>
                    </div>
                </div>

                <div style={{ flex: '1' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '30px' }}>Recent Sustainable Purchases</h2>
                    {loading ? (
                        <p style={{ color: '#9ca3af' }}>Loading your history...</p>
                    ) : orders.length === 0 ? (
                        <div style={{ background: 'white', padding: '30px', borderRadius: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                            <p style={{ color: '#9ca3af', textAlign: 'center', padding: '40px' }}>No orders yet. Start shopping!</p>
                        </div>
                    ) : (
                         <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                             {orders.map(order => (
                                 <div key={order.id} style={{ background: 'white', padding: '24px', borderRadius: '24px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
                                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #f1f5f9', paddingBottom: '15px', marginBottom: '15px' }}>
                                         <div>
                                             <p style={{ margin: 0, fontWeight: '800', fontSize: '18px', color: '#111827' }}>Order #{order.id}</p>
                                             <p style={{ margin: '4px 0 0', color: '#9ca3af', fontSize: '12px' }}>
                                                  📅 {order.orderDate ? new Date(order.orderDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                                              </p>
                                              {order.shippingAddress && (
                                                  <p style={{ margin: '8px 0 0', color: '#64748b', fontSize: '11px', lineHeight: '1.4', maxWidth: '300px' }}>
                                                      📍 <span style={{ fontWeight: '600' }}>Delivery to:</span> {order.shippingAddress}
                                                  </p>
                                              )}
                                          </div>
                                         <div style={{ textAlign: 'right' }}>
                                             <span style={{ fontSize: '11px', fontWeight: '800', color: statusColor(order.orderStatus), background: statusColor(order.orderStatus) + '15', padding: '4px 12px', borderRadius: '20px', textTransform: 'uppercase' }}>
                                                  {order.orderStatus}
                                              </span>
                                              <p style={{ margin: '8px 0 0', fontWeight: '900', fontSize: '20px', color: '#6366f1' }}>₹{order.totalAmount?.toLocaleString('en-IN')}</p>
                                              
                                              {order.orderStatus === 'PENDING' && order.items?.every(item => item.status === 'PENDING') && (
                                                  <button 
                                                      onClick={() => handleCancelOrder(order.id)}
                                                      style={{ marginTop: '10px', padding: '6px 12px', background: '#fee2e2', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '8px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
                                                  >
                                                      Cancel Order
                                                  </button>
                                              )}
                                          </div>
                                     </div>

                                     {/* Order Items */}
                                     <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                         {order.items && order.items.map((item, idx) => (
                                             <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                 <img 
                                                     src={item.productThumbnail} 
                                                     alt={item.productName} 
                                                     style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover', background: '#f8fafc' }} 
                                                 />
                                                 <div style={{ flex: 1 }}>
                                                     <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>{item.productName}</p>
                                                     <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Qty: {item.quantity} • {item.vendorName || 'Global Store'}</p>
                                                 </div>
                                                 <div style={{ fontWeight: '700', color: '#1e293b' }}>₹{item.price * item.quantity}</div>
                                             </div>
                                         ))}
                                     </div>
                                 </div>
                             ))}
                         </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserProfile;


