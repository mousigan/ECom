import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';
import { ShoppingBag, Check, X, Clock, AlertCircle } from 'lucide-react';

const VendorOrders = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const res = await axiosInstance.get(`/orders/vendor/${user.id}`);
            setOrders(res.data);
        } catch (error) {
            console.error('Error fetching vendor orders', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [user]);

    const handleAction = async (itemId, status) => {
        try {
            await axiosInstance.put(`/orders/item/${itemId}/status?status=${status}`);
            fetchOrders();
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Action failed';
            alert(errorMsg);
        }
    };

    const containerStyle = { padding: '40px 4%', background: '#f8fafc', minHeight: '90vh' };
    const orderCard = { background: 'white', borderRadius: '24px', padding: '30px', marginBottom: '30px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' };
    const statusBadge = (status) => {
        let colors = { background: '#f1f5f9', color: '#64748b' };
        if (status === 'PENDING') colors = { background: '#fffbeb', color: '#b45309' };
        if (status === 'VENDOR_ACCEPTED') colors = { background: '#f0fdf4', color: '#166534' };
        if (status === 'CANCELLED_BY_VENDOR') colors = { background: '#fef2f2', color: '#991b1b' };
        if (status === 'CANCELLED_BY_USER') colors = { background: '#f5f3ff', color: '#6d28d9' };
        if (status === 'SHIPPED') colors = { background: '#eef2ff', color: '#3730a3' };
        
        return (
            <span style={{ 
                padding: '6px 14px', 
                borderRadius: '20px', 
                fontSize: '12px', 
                fontWeight: '800', 
                textTransform: 'uppercase',
                ...colors 
            }}>
                {status.replace(/_/g, ' ')}
            </span>
        );
    };

    return (
        <div style={containerStyle}>
            <div style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#1e293b' }}>Order Management</h1>
                <p style={{ color: '#64748b' }}>Confirm or cancel incoming orders for your products. Stock is deducted only upon confirmation.</p>
            </div>

            {loading ? (
                <p>Loading orders...</p>
            ) : orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '100px 0' }}>
                    <div style={{ background: '#f1f5f9', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#94a3b8' }}>
                        <ShoppingBag size={40} />
                    </div>
                    <h3 style={{ color: '#1e293b' }}>No orders found</h3>
                    <p style={{ color: '#64748b' }}>When customers buy your products, they will appear here.</p>
                </div>
            ) : (
                <div>
                    {orders.map(order => {
                        // Filter items that belong to this vendor
                        const myItems = (order.items || []).filter(i => i.vendorName === user?.name);
                        if (myItems.length === 0) return null;

                        return (
                            <div key={order.id} style={orderCard}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1.5px solid #f1f5f9', paddingBottom: '20px', marginBottom: '20px' }}>
                                    <div>
                                        <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b' }}>Order #{order.id}</h3>
                                        <p style={{ color: '#94a3b8', fontSize: '14px', margin: '5px 0' }}>
                                            Date: {new Date(order.orderDate).toLocaleString('en-IN')}
                                        </p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ color: '#64748b', fontSize: '13px', fontWeight: '600' }}>Customer Total</p>
                                        <p style={{ fontSize: '22px', fontWeight: '900', color: '#6366f1' }}>₹{order.totalAmount.toLocaleString()}</p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    {myItems.map((item, idx) => (
                                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '15px', background: '#f8fafc', borderRadius: '16px' }}>
                                            <img src={item.productThumbnail} alt="" style={{ width: '70px', height: '70px', borderRadius: '12px', objectFit: 'cover' }} />
                                            <div style={{ flex: 1 }}>
                                                <h4 style={{ fontWeight: '700', color: '#1e293b', fontSize: '16px' }}>{item.productName}</h4>
                                                <p style={{ fontSize: '14px', color: '#64748b' }}>Quantity: {item.quantity} • Unit Price: ₹{item.price.toLocaleString()}</p>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                                {statusBadge(item.status)}
                                                {item.status === 'PENDING' && (
                                                    <div style={{ display: 'flex', gap: '10px' }}>
                                                        <button 
                                                            onClick={() => handleAction(item.id || item.productId, 'VENDOR_ACCEPTED')}
                                                            style={{ padding: '8px 16px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                                                        >
                                                            <Check size={16} /> Accept
                                                        </button>
                                                        <button 
                                                            onClick={() => handleAction(item.id || item.productId, 'CANCELLED_BY_VENDOR')}
                                                            style={{ padding: '8px 16px', background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                                                        >
                                                            <X size={16} /> Reject
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                <div style={{ marginTop: '20px', padding: '15px', background: '#f0f9ff', borderRadius: '12px', border: '1px solid #e0f2fe', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <AlertCircle size={18} color="#0369a1" />
                                    <p style={{ margin: 0, fontSize: '13px', color: '#0369a1', fontWeight: '600' }}>
                                        Accepted orders are sent to the Admin Hub for final shipment. Stock is automatically updated upon your confirmation.
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default VendorOrders;
