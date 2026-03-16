import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';
import { Package, PlusCircle, TrendingUp, Star, Search, RefreshCw, ShoppingCart, Tag } from 'lucide-react';

const VendorDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ totalProducts: 0, reviewsCount: 0, avgRating: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            if (user?.id) {
                try {
                   const res = await axiosInstance.get(`/products/vendor-inventory`, { params: { vendorId: user.id } });
                   const ratingRes = await axiosInstance.get(`/ratings/vendor/${user.id}/average`);
                   setStats({ totalProducts: res.data.length, reviewsCount: 0, avgRating: ratingRes.data || 0 });
                } catch(e) {}
            }
        };
        fetchStats();
    }, [user]);

    const containerStyle = { padding: '40px 4%', background: '#f8fafc', minHeight: '90vh' };
    const statsCard = { flex: '1', background: 'white', padding: '30px', borderRadius: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', display: 'flex', alignItems: 'center', gap: '20px', border: '1px solid #f1f5f9' };
    const iconContainer = (bg, color) => ({ width: '60px', height: '60px', borderRadius: '18px', background: bg, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' });

    return (
        <div style={containerStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ fontSize: '36px', fontWeight: '800', color: '#1e293b' }}>Vendor Dashboard</h1>
                    <p style={{ color: '#64748b' }}>Welcome back! Manage your marketplace presence and products here.</p>
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                    <button 
                        onClick={() => navigate('/vendor/add-product')}
                        style={{ padding: '12px 24px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
                    >
                        <PlusCircle size={20} /> List New Product
                    </button>
                    <button 
                        onClick={() => navigate('/vendor/orders')}
                        style={{ padding: '12px 24px', background: 'white', color: '#1e293b', border: '1.5px solid #e2e8f0', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
                    >
                        <ShoppingCart size={20} /> Manage Orders
                    </button>
                    <button 
                        onClick={() => navigate('/vendor/products')}
                        style={{ padding: '12px 24px', background: 'white', color: '#1e293b', border: '1.5px solid #e2e8f0', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
                    >
                        <Package size={20} /> My Inventory
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '30px', marginBottom: '50px' }}>
                <div style={statsCard}>
                    <div style={iconContainer('#eef2ff', '#6366f1')}><ShoppingCart size={28} /></div>
                    <div>
                        <p style={{ color: '#64748b', fontSize: '14px', fontWeight: '600' }}>Live Products</p>
                        <h3 style={{ fontSize: '28px', fontWeight: '800', color: '#1e293b' }}>{stats.totalProducts}</h3>
                    </div>
                </div>
                <div style={statsCard}>
                    <div style={iconContainer('#ecfdf5', '#10b981')}><Star size={28} /></div>
                    <div>
                        <p style={{ color: '#64748b', fontSize: '14px', fontWeight: '600' }}>Store Rating</p>
                        <h3 style={{ fontSize: '28px', fontWeight: '800', color: '#1e293b' }}>{stats.avgRating.toFixed(1)} / 5.0</h3>
                    </div>
                </div>
                <div style={statsCard}>
                    <div style={iconContainer('#fff7ed', '#f59e0b')}><TrendingUp size={28} /></div>
                    <div>
                        <p style={{ color: '#64748b', fontSize: '14px', fontWeight: '600' }}>Credit Score</p>
                        <h3 style={{ fontSize: '28px', fontWeight: '800', color: '#1e293b' }}>{user?.creditPoints || 0}</h3>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '40px' }}>
                <div style={{ background: 'white', padding: '40px', borderRadius: '32px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', border: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Direct Actions</h2>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div onClick={() => navigate('/vendor/add-product')} style={{ padding: '30px', border: '2px solid #f1f5f9', borderRadius: '24px', cursor: 'pointer', transition: 'all 0.2s', background: '#f8fafc' }}>
                            <div style={{ color: '#6366f1', marginBottom: '15px' }}><PlusCircle size={32} /></div>
                            <h4 style={{ fontSize: '18px', fontWeight: '700' }}>Create New Listing</h4>
                            <p style={{ color: '#64748b', fontSize: '14px', marginTop: '10px' }}>Upload photos, set prices, and specify categories for your own unique products.</p>
                        </div>
                        <div onClick={() => navigate('/vendor/products')} style={{ padding: '30px', border: '2px solid #f1f5f9', borderRadius: '24px', cursor: 'pointer', transition: 'all 0.2s', background: '#f8fafc' }}>
                            <div style={{ color: '#10b981', marginBottom: '15px' }}><Package size={32} /></div>
                            <h4 style={{ fontSize: '18px', fontWeight: '700' }}>Manage Stock</h4>
                            <p style={{ color: '#64748b', fontSize: '14px', marginTop: '10px' }}>Update inventory levels, prices, and discounts for your listed items.</p>
                        </div>
                    </div>

                    <div style={{ marginTop: '40px', padding: '30px', background: '#ecfdf5', borderRadius: '24px', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <h3 style={{ color: '#064e3b', fontSize: '20px', fontWeight: '800' }}>Marketplace Notice</h3>
                            <p style={{ color: '#047857', marginTop: '10px' }}>The "Master Catalog" sourcing feature is now disabled. Vendors are responsible for adding their own unique products and descriptions.</p>
                        </div>
                        <Tag size={120} style={{ position: 'absolute', right: '-20px', bottom: '-20px', color: '#059669', opacity: 0.1 }} />
                    </div>
                </div>

                <div style={{ background: 'white', padding: '40px', borderRadius: '32px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', border: '1px solid #f1f5f9' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '30px' }}>Store Performance</h2>
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                            <svg width="150" height="150" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="45" fill="none" stroke="#f1f5f9" strokeWidth="10" />
                                <circle cx="50" cy="50" r="45" fill="none" stroke="#6366f1" strokeWidth="10" strokeDasharray="210 282" strokeLinecap="round" />
                            </svg>
                            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                                <p style={{ fontSize: '28px', fontWeight: '900', color: '#1e293b' }}>75%</p>
                                <p style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Growth</p>
                            </div>
                        </div>
                        <h4 style={{ marginTop: '30px', fontWeight: '700' }}>Healthy Status</h4>
                        <p style={{ color: '#64748b', fontSize: '14px', marginTop: '10px' }}>Your store is performing 15% better than last month. All products are verified.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorDashboard;
