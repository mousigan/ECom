import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosConfig';
import { Package, Truck, Check, Search } from 'lucide-react';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchAllOrders = async () => {
        setLoading(true);
        try {
            // We can fetch all orders by just using a dummy userId or creating an admin endpoint
            // For now, let's assume we want a global list. 
            // I'll use the existing /orders/vendor but for all, or better, I should have a global endpoint.
            // Let's iterate over vendors? No, let's just fetch all orders if we are admin.
            // I'll add a global endpoint in the backend for Admin.
            const res = await axiosInstance.get('/orders/admin/all');
            setOrders(res.data);
        } catch (error) {
            console.error('Error fetching admin orders', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllOrders();
    }, []);

    const handleShip = async (orderId) => {
        try {
            await axiosInstance.put(`/orders/${orderId}/status?status=SHIPPED`);
            // Also update all items in that order to SHIPPED for consistency
            const order = orders.find(o => o.id === orderId);
            for (const item of order.items) {
                if (item.status === 'VENDOR_ACCEPTED') {
                    await axiosInstance.put(`/orders/item/${item.id}/status?status=SHIPPED`);
                }
            }
            fetchAllOrders();
        } catch (error) {
            alert('Failed to update status');
        }
    };

    const containerStyle = { padding: '40px 50px', background: '#f8fafc', minHeight: '90vh' };
    
    return (
        <div style={containerStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#1e293b' }}>Global Logistics Hub</h1>
                    <p style={{ color: '#64748b' }}>Monitor seller confirmations and transition orders to "Shipped" status.</p>
                </div>
            </div>

            {loading ? (
                <p>Loading Global Orders...</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {orders.filter(o => o.orderStatus !== 'CANCELLED_BY_USER').map(order => {
                        const allAccepted = order.items.every(i => i.status === 'VENDOR_ACCEPTED' || i.status === 'SHIPPED');
                        const isShipped = order.orderStatus === 'SHIPPED';

                        return (
                            <div key={order.id} style={{ background: 'white', borderRadius: '24px', padding: '30px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                                    <div>
                                        <h3 style={{ fontSize: '18px', fontWeight: '800' }}>Order #{order.id}</h3>
                                        <p style={{ fontSize: '12px', color: '#94a3b8' }}>Placed on {new Date(order.orderDate).toLocaleString()}</p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <span style={{ padding: '6px 14px', borderRadius: '20px', background: isShipped ? '#f0fdf4' : '#fffbeb', color: isShipped ? '#166534' : '#b45309', fontSize: '11px', fontWeight: '800' }}>
                                            {order.orderStatus}
                                        </span>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px', marginBottom: '20px' }}>
                                    {order.items.map((item, idx) => (
                                        <div key={idx} style={{ padding: '15px', border: '1.5px solid #f1f5f9', borderRadius: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                                            <img src={item.productThumbnail} alt="" style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }} />
                                            <div>
                                                <p style={{ margin: 0, fontSize: '13px', fontWeight: '700' }}>{item.productName}</p>
                                                <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>{item.vendorName} • {item.status}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {allAccepted && !isShipped && (
                                    <button 
                                        onClick={() => handleShip(order.id)}
                                        style={{ width: '100%', padding: '14px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                                    >
                                        <Truck size={20} /> Mark as Shipped (All Vendors Confirmed)
                                    </button>
                                )}
                                
                                {!allAccepted && !isShipped && (
                                    <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '12px', textAlign: 'center', fontSize: '13px', color: '#64748b', border: '1px dashed #e2e8f0' }}>
                                        Waiting for some vendors to confirm...
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default AdminOrders;
