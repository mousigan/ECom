import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosConfig';
import { Plus, Trash2, CheckCircle, Clock, Users, X, Truck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'all'
    const [pendingVendors, setPendingVendors] = useState([]);
    const [allVendors, setAllVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newVendor, setNewVendor] = useState({
        name: '',
        email: '',
        password: '',
        mobileNumber: '',
        requestedRole: 'VENDOR'
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [pendingRes, allRes] = await Promise.all([
                axiosInstance.get('/admin/pending-vendors'),
                axiosInstance.get('/admin/vendors')
            ]);
            setPendingVendors(pendingRes.data);
            setAllVendors(allRes.data);
        } catch (error) {
            console.error('Error fetching data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleApprove = async (id) => {
        try {
            await axiosInstance.put(`/admin/approve-vendor/${id}`);
            fetchData();
        } catch (error) {
            alert('Approval failed');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to remove this vendor?')) return;
        try {
            await axiosInstance.delete(`/admin/user/${id}`);
            fetchData();
        } catch (error) {
            alert('Delete failed');
        }
    };

    const handleAddVendor = async (e) => {
        e.preventDefault();
        try {
            await axiosInstance.post('/admin/add-vendor', newVendor);
            setShowAddModal(false);
            setNewVendor({ name: '', email: '', password: '', mobileNumber: '', requestedRole: 'VENDOR' });
            fetchData();
        } catch (error) {
            alert('Failing to add vendor. Check if email exists.');
        }
    };

    // Styles (Improved)
    const containerStyle = { padding: '40px 50px', background: '#f8fafc', minHeight: '90vh' };
    const tabContainerStyle = { display: 'flex', gap: '20px', marginBottom: '30px', borderBottom: '1px solid #e2e8f0' };
    const tabStyle = (active) => ({
        padding: '12px 24px',
        cursor: 'pointer',
        fontWeight: '600',
        color: active ? '#2563eb' : '#64748b',
        borderBottom: active ? '3px solid #2563eb' : '3px solid transparent',
        transition: 'all 0.2s'
    });
    const cardStyle = { background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', overflow: 'hidden' };
    const tableStyle = { width: '100%', borderCollapse: 'collapse' };
    const thStyle = { textAlign: 'left', padding: '16px 24px', background: '#f1f5f9', color: '#475569', fontSize: '13px', fontWeight: 'bold' };
    const tdStyle = { padding: '16px 24px', borderBottom: '1px solid #f1f5f9', fontSize: '14px' };
    const btnStyle = (color) => ({
        padding: '8px 16px',
        borderRadius: '8px',
        border: 'none',
        color: 'white',
        background: color,
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: '600',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px'
    });

    return (
        <div style={containerStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#0f172a' }}>Admin Control Center</h1>
                    <p style={{ color: '#64748b', marginTop: '4px' }}>Manage the heartbeat of your ecosystem</p>
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                    <button 
                        onClick={() => navigate('/admin/orders')}
                        style={btnStyle('#6366f1')}
                    >
                        <Truck size={18} /> Global Logistics
                    </button>
                    <button 
                        onClick={() => setShowAddModal(true)}
                        style={btnStyle('#2563eb')}
                    >
                        <Plus size={18} /> Add New Seller
                    </button>
                </div>
            </div>

            <div style={tabContainerStyle}>
                <div style={tabStyle(activeTab === 'pending')} onClick={() => setActiveTab('pending')}>
                    <Clock size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                    Pending Approvals ({pendingVendors.length})
                </div>
                <div style={tabStyle(activeTab === 'all')} onClick={() => setActiveTab('all')}>
                    <Users size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                    All Vendors ({allVendors.length})
                </div>
            </div>

            <div style={cardStyle}>
                <table style={tableStyle}>
                    <thead>
                        <tr>
                            <th style={thStyle}>NAME</th>
                            <th style={thStyle}>EMAIL</th>
                            <th style={thStyle}>MOBILE</th>
                            <th style={thStyle}>CREDIT POINTS</th>
                            <th style={thStyle}>ACTION</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="4" style={{ textAlign: 'center', padding: '40px' }}>Loading...</td></tr>
                        ) : (activeTab === 'pending' ? pendingVendors : allVendors).length === 0 ? (
                            <tr><td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No records found.</td></tr>
                        ) : (activeTab === 'pending' ? pendingVendors : allVendors).map(v => (
                            <tr key={v.id}>
                                <td style={tdStyle}>{v.name}</td>
                                <td style={tdStyle}>{v.email}</td>
                                <td style={tdStyle}>{v.mobileNumber || 'N/A'}</td>
                                <td style={tdStyle}>{v.creditPoints || 0}</td>
                                <td style={tdStyle}>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        {activeTab === 'pending' && (
                                            <button onClick={() => handleApprove(v.id)} style={btnStyle('#10b981')}>
                                                <CheckCircle size={16} /> Approve
                                            </button>
                                        )}
                                        <button onClick={() => handleDelete(v.id)} style={btnStyle('#ef4444')}>
                                            <Trash2 size={16} /> {activeTab === 'pending' ? 'Reject' : 'Delete'}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add Vendor Modal */}
            {showAddModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', padding: '40px', borderRadius: '20px', width: '450px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: '700' }}>Onboard New Seller</h2>
                            <X size={24} style={{ cursor: 'pointer' }} onClick={() => setShowAddModal(false)} />
                        </div>
                        <form onSubmit={handleAddVendor}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Store Name</label>
                                <input 
                                    type="text" required
                                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                                    value={newVendor.name}
                                    onChange={e => setNewVendor({...newVendor, name: e.target.value})}
                                />
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Login Email</label>
                                <input 
                                    type="email" required
                                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                                    value={newVendor.email}
                                    onChange={e => setNewVendor({...newVendor, email: e.target.value})}
                                />
                            </div>
                             <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Mobile Number</label>
                                <input 
                                    type="tel" required
                                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                                    value={newVendor.mobileNumber}
                                    onChange={e => setNewVendor({...newVendor, mobileNumber: e.target.value})}
                                />
                            </div>
                            <div style={{ marginBottom: '30px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Temporary Password</label>
                                <input 
                                    type="password" required
                                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                                    value={newVendor.password}
                                    onChange={e => setNewVendor({...newVendor, password: e.target.value})}
                                />
                            </div>
                            <button 
                                type="submit" 
                                style={{ ...btnStyle('#2563eb'), width: '100%', justifyContent: 'center', padding: '14px' }}
                            >
                                <Plus size={18} /> Create Vendor Account
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
