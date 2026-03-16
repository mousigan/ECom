import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { LogOut, X, User, Mail, ShoppingBag, Trash2, ChevronDown, Menu as MenuIcon } from 'lucide-react';
import axiosInstance from '../../api/axiosConfig';

const Navbar = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const { cartItems } = useCart();
    const navigate = useNavigate();
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [showAccountPanel, setShowAccountPanel] = useState(false);
    const [orders, setOrders] = useState([]);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Fetch recent orders when dropdown opens
    useEffect(() => {
        if (showProfileDropdown && user && user.id) {
            axiosInstance.get(`/orders/${user.id}`)
                .then(res => setOrders(res.data?.slice(0, 3) || []))
                .catch(() => setOrders([]));
        }
        if (!showProfileDropdown) setShowAccountPanel(false);
    }, [showProfileDropdown, user]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowProfileDropdown(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleDeleteAccount = async () => {
        if (!user?.id) return;
        setDeleteLoading(true);
        try {
            await axiosInstance.delete(`/auth/account/${user.id}`);
            logout();
            navigate('/login');
        } catch (err) {
            alert('Failed to delete account. Please try again.');
        } finally {
            setDeleteLoading(false);
            setShowDeleteModal(false);
        }
    };

    const navStyle = {
        background: '#ffffff',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        padding: '10px 4%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
    };

    const logoStyle = {
        fontSize: '24px',
        fontWeight: 'bold',
        color: 'var(--primary)',
        textDecoration: 'none',
        background: 'linear-gradient(to right, #6366f1, #ec4899)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
    };

    const linkStyle = {
        textDecoration: 'none',
        color: '#4b5563',
        fontWeight: '500',
        fontSize: '15px',
        transition: 'color 0.2s',
    };

    const authBtnStyle = {
        background: 'var(--primary)',
        color: 'white',
        padding: '8px 20px',
        borderRadius: '8px',
        textDecoration: 'none',
        fontWeight: '600',
        fontSize: '14px',
    };

    const modalOverlayStyle = {
        position: 'fixed', top: 0, left: 0,
        width: '100%', height: '100%',
        background: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(4px)',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        zIndex: 2000,
    };

    const modalStyle = {
        background: 'white', padding: '40px', borderRadius: '24px',
        width: '400px', textAlign: 'center',
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
        position: 'relative',
    };

    const dashboardLink = () => {
        if (!user) return null;
        if (user.role === 'ADMIN' || user.role === 'ASTADMIN') return <Link to="/admin/dashboard" style={linkStyle}>Admin Dash</Link>;
        if (user.role === 'VENDOR') return (
            <>
                <Link to="/vendor/dashboard" style={linkStyle}>Dashboard</Link>
                <Link to="/vendor/add-product" style={linkStyle}>Add Product</Link>
            </>
        );
        return null;
    };

    const statusColor = (s) => s === 'PENDING' ? '#f59e0b' : s === 'DELIVERED' ? '#10b981' : '#6366f1';

    return (
        <>
            <nav className="nav-container">
                <Link to="/" style={logoStyle}>ECOM PRO</Link>

                <div className="nav-links-desktop">
                    <div style={{ display: 'flex', gap: '25px', alignItems: 'center' }}>
                        <Link to="/catalog" style={linkStyle}>Catalog</Link>
                        {dashboardLink()}
                        {isAuthenticated && (
                            <>
                                <Link to="/cart" style={{ ...linkStyle, position: 'relative' }}>
                                    Cart
                                    {cartItems.length > 0 && (
                                        <span style={{ position: 'absolute', top: '-8px', right: '-10px', background: '#ef4444', color: 'white', borderRadius: '50%', fontSize: '10px', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>
                                            {cartItems.length}
                                        </span>
                                    )}
                                </Link>
                                <div style={{ padding: '4px 12px', background: '#f3f4f6', borderRadius: '20px', fontSize: '11px', fontWeight: '700' }}>
                                    XP: {user.creditPoints || 0}
                                </div>
                            </>
                        )}
                    </div>

                    {isAuthenticated ? (
                        <div style={{ position: 'relative' }} ref={dropdownRef}>
                            <button
                                onClick={() => setShowProfileDropdown(p => !p)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '10px',
                                    background: showProfileDropdown ? '#f3f4f6' : 'white',
                                    border: '1.5px solid #e2e8f0', borderRadius: '40px',
                                    padding: '6px 14px 6px 6px', cursor: 'pointer',
                                    transition: 'all 0.2s',
                                }}
                            >
                                <div style={{
                                    width: '32px', height: '32px', borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #6366f1, #ec4899)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'white', fontWeight: '800', fontSize: '14px',
                                }}>
                                    {user.name?.charAt(0).toUpperCase()}
                                </div>
                                <span style={{ fontSize: '13px', fontWeight: '700', color: '#111827' }}>{user.name?.split(' ')[0]}</span>
                                <ChevronDown size={14} color="#6b7280" />
                            </button>

                            {showProfileDropdown && (
                                <div style={{
                                    position: 'absolute', top: 'calc(100% + 15px)', right: 0,
                                    width: '340px', background: 'white', borderRadius: '24px',
                                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid #f1f5f9',
                                    overflow: 'hidden', zIndex: 1000,
                                    animation: 'fadeInDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                                }}>
                                    {/* Premium Personalized Header */}
                                    <div style={{ padding: '24px', background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)', color: 'white', position: 'relative' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            <div style={{ 
                                                width: '56px', height: '56px', borderRadius: '18px', 
                                                background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                                fontSize: '24px', fontWeight: '900', border: '1px solid rgba(255,255,255,0.3)'
                                            }}>
                                                {user.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: '800', fontSize: '18px', letterSpacing: '-0.5px' }}>{user.name}</div>
                                                <div style={{ fontSize: '12px', opacity: 0.9, fontWeight: '500' }}>{user.email}</div>
                                            </div>
                                        </div>
                                        
                                        {/* Status Badge */}
                                        <div style={{ 
                                            position: 'absolute', top: '20px', right: '20px',
                                            background: 'rgba(255,255,255,0.2)', padding: '4px 10px', 
                                            borderRadius: '20px', fontSize: '10px', fontWeight: '800',
                                            textTransform: 'uppercase', letterSpacing: '1px', border: '1px solid rgba(255,255,255,0.4)'
                                        }}>
                                            {user.creditPoints > 100 ? '⭐ Elite' : 'Basic'}
                                        </div>

                                        {/* XP Progress Bar */}
                                        <div style={{ marginTop: '20px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '700', marginBottom: '6px' }}>
                                                <span>Level 1 Progress</span>
                                                <span>{user.creditPoints || 0} / 500 XP</span>
                                            </div>
                                            <div style={{ height: '6px', background: 'rgba(255,255,255,0.2)', borderRadius: '10px', overflow: 'hidden' }}>
                                                <div style={{ width: `${Math.min(100, (user.creditPoints || 0) / 5)}%`, height: '100%', background: 'white', borderRadius: '10px', transition: 'width 1s ease' }}></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Grid */}
                                    <div style={{ padding: '12px' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                                            <Link to="/profile" onClick={() => setShowProfileDropdown(false)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '16px', background: '#f8fafc', borderRadius: '16px', textDecoration: 'none', transition: 'all 0.2s', border: '1.5px solid transparent' }}
                                                onMouseOver={(e) => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.transform = 'scale(1.03)'; }}
                                                onMouseOut={(e) => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.transform = 'scale(1)'; }}
                                            >
                                                <ShoppingBag size={20} color="#6366f1" />
                                                <span style={{ fontSize: '12px', fontWeight: '700', color: '#1e293b' }}>Orders</span>
                                            </Link>
                                            <button onClick={() => setShowAccountPanel(p => !p)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '16px', background: showAccountPanel ? '#fdf2f8' : '#f8fafc', borderRadius: '16px', border: showAccountPanel ? '1.5px solid #ec4899' : '1.5px solid transparent', cursor: 'pointer', transition: 'all 0.2s' }}
                                                onMouseOver={(e) => { if (!showAccountPanel) { e.currentTarget.style.borderColor = '#ec4899'; e.currentTarget.style.transform = 'scale(1.03)'; } }}
                                                onMouseOut={(e) => { if (!showAccountPanel) { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.transform = 'scale(1)'; } }}
                                            >
                                                <User size={20} color="#ec4899" />
                                                <span style={{ fontSize: '12px', fontWeight: '700', color: '#1e293b' }}>Account</span>
                                            </button>
                                        </div>

                                        {/* Account Info Panel (toggles on Account click) */}
                                        {showAccountPanel && (
                                            <div style={{ margin: '0 0 12px', padding: '18px', background: '#fdf2f8', borderRadius: '16px', border: '1px solid #fbcfe8', animation: 'fadeInDown 0.25s ease' }}>
                                                <div style={{ fontSize: '11px', color: '#9d174d', fontWeight: '800', textTransform: 'uppercase', marginBottom: '14px', letterSpacing: '0.5px' }}>Account Information</div>
                                                
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <span style={{ fontSize: '12px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '6px' }}><User size={13} /> Name</span>
                                                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>{user.name}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <span style={{ fontSize: '12px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={13} /> Email</span>
                                                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>{user.email}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <span style={{ fontSize: '12px', color: '#6b7280' }}>🎖️ Role</span>
                                                        <span style={{ fontSize: '12px', fontWeight: '800', color: '#6366f1', background: '#ede9fe', padding: '2px 8px', borderRadius: '6px' }}>{user.role}</span>
                                                    </div>
                                                </div>

                                                <button 
                                                    onClick={() => { setShowProfileDropdown(false); setShowDeleteModal(true); }}
                                                    style={{ 
                                                        width: '100%', marginTop: '16px', padding: '10px', 
                                                        borderRadius: '12px', border: '1.5px solid #fecaca', 
                                                        background: '#fff1f2', color: '#dc2626', 
                                                        fontSize: '12px', fontWeight: '800', 
                                                        cursor: 'pointer', transition: 'all 0.2s',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                                                    }}
                                                    onMouseOver={(e) => { e.currentTarget.style.background = '#dc2626'; e.currentTarget.style.color = 'white'; }}
                                                    onMouseOut={(e) => { e.currentTarget.style.background = '#fff1f2'; e.currentTarget.style.color = '#dc2626'; }}
                                                >
                                                    <Trash2 size={14} /> Delete My Account
                                                </button>
                                            </div>
                                        )}

                                        {/* Activity Feed Snippet */}
                                        <div style={{ padding: '0 8px 12px' }}>
                                            <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.5px' }}>Recent Activity</div>
                                            {orders.length === 0 ? (
                                                <div style={{ fontSize: '12px', color: '#64748b', padding: '10px 0', textAlign: 'center' }}>No recent orders</div>
                                            ) : (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                    {orders.slice(0, 2).map(o => (
                                                        <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f1f5f9', borderRadius: '12px' }}>
                                                            <div>
                                                                <div style={{ fontSize: '12px', fontWeight: '700', color: '#1e293b' }}>Order #{o.id}</div>
                                                                <div style={{ fontSize: '10px', color: statusColor(o.orderStatus), fontWeight: '800' }}>{o.orderStatus}</div>
                                                            </div>
                                                            <div style={{ fontSize: '13px', fontWeight: '900', color: '#6366f1' }}>₹{o.totalAmount}</div>
                                                        </div>
                                                    ))}
                                                    {orders.length > 2 && (
                                                        <Link to="/profile" onClick={() => setShowProfileDropdown(false)} style={{ fontSize: '11px', color: '#6366f1', fontWeight: '700', textAlign: 'center', textDecoration: 'none' }}>
                                                            View all {orders.length} orders →
                                                        </Link>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Footer Actions */}
                                        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <button 
                                                onClick={() => { setShowProfileDropdown(false); setShowLogoutModal(true); }} 
                                                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: '12px', border: 'none', background: 'transparent', color: '#64748b', fontSize: '13px', fontWeight: '600', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', width: '100%' }}
                                                onMouseOver={(e) => e.currentTarget.style.background = '#fef2f2'}
                                                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                            >
                                                <LogOut size={16} color="#ef4444" />
                                                <span style={{ color: '#ef4444' }}>Sign Out Account</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link to="/login" style={authBtnStyle}>Login</Link>
                    )}
                </div>

                {/* Mobile Hamburger Toggle */}
                <button className="menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    {isMenuOpen ? <X size={28} /> : <MenuIcon size={28} />}
                </button>

                {/* Mobile Menu Sheet */}
                <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
                    <Link to="/catalog" onClick={() => setIsMenuOpen(false)} style={linkStyle}>Catalog</Link>
                    {isAuthenticated ? (
                        <>
                            <Link to="/cart" onClick={() => setIsMenuOpen(false)} style={linkStyle}>Cart ({cartItems.length})</Link>
                            <Link to="/profile" onClick={() => setIsMenuOpen(false)} style={linkStyle}>Profile</Link>
                            <button onClick={() => { setIsMenuOpen(false); setShowLogoutModal(true); }} style={{ ...linkStyle, border: 'none', background: 'none', textAlign: 'left', color: '#ef4444' }}>Logout</button>
                        </>
                    ) : (
                        <Link to="/login" onClick={() => setIsMenuOpen(false)} style={authBtnStyle}>Login</Link>
                    )}
                </div>
            </nav>

            {/* Logout Modal */}
            {showLogoutModal && (
                <div style={modalOverlayStyle}>
                    <div style={modalStyle}>
                        <button onClick={() => setShowLogoutModal(false)} style={{ position: 'absolute', top: '20px', right: '20px', border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                            <X size={20} />
                        </button>
                        <div style={{ width: '64px', height: '64px', background: '#fef2f2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                            <LogOut size={32} color="#ef4444" />
                        </div>
                        <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b', marginBottom: '12px' }}>Wait, {user?.name.split(' ')[0]}!</h2>
                        <p style={{ color: '#64748b', lineHeight: '1.6', marginBottom: '32px' }}>Are you sure you want to log out?</p>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button onClick={() => setShowLogoutModal(false)} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1.5px solid #e2e8f0', background: 'white', color: '#475569', fontWeight: '700', cursor: 'pointer' }}>
                                No, Stay
                            </button>
                            <button onClick={() => { logout(); setShowLogoutModal(false); }} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: '#ef4444', color: 'white', fontWeight: '700', cursor: 'pointer' }}>
                                Yes, Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Account Modal */}
            {showDeleteModal && (
                <div style={modalOverlayStyle}>
                    <div style={modalStyle}>
                        <button onClick={() => setShowDeleteModal(false)} style={{ position: 'absolute', top: '20px', right: '20px', border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                            <X size={20} />
                        </button>
                        <div style={{ width: '64px', height: '64px', background: '#fef2f2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                            <Trash2 size={32} color="#dc2626" />
                        </div>
                        <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b', marginBottom: '12px' }}>Delete Account?</h2>
                        <p style={{ color: '#64748b', lineHeight: '1.6', marginBottom: '8px' }}>
                            This will <strong>permanently delete</strong> your account and all associated data:
                        </p>
                        <ul style={{ textAlign: 'left', color: '#ef4444', fontSize: '13px', marginBottom: '28px', paddingLeft: '20px', lineHeight: '1.8' }}>
                            <li>All order history</li>
                            <li>All credit points ({user?.creditPoints || 0} XP)</li>
                            <li>Account profile & email</li>
                        </ul>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button onClick={() => setShowDeleteModal(false)} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1.5px solid #e2e8f0', background: 'white', color: '#475569', fontWeight: '700', cursor: 'pointer' }}>
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={deleteLoading}
                                style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: '#dc2626', color: 'white', fontWeight: '700', cursor: deleteLoading ? 'not-allowed' : 'pointer', opacity: deleteLoading ? 0.7 : 1 }}
                            >
                                {deleteLoading ? 'Deleting...' : 'Yes, Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes fadeInDown {
                    from { opacity: 0; transform: translateY(-8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </>
    );
};

export default Navbar;
