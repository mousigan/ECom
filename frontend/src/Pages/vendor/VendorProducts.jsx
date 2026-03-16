import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getVendorInventory, updateVendorInventory, deleteVendorInventory } from '../../api/productService';
import { Package, Archive, Edit2, Trash2, X, Check, AlertTriangle, RefreshCw } from 'lucide-react';

const VendorProducts = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingProduct, setEditingProduct] = useState(null);
    const [editForm, setEditForm] = useState({ sellingPrice: 0, stock: 0, discount: 0 });
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

    const fetchInventory = async () => {
        if (user) {
            setLoading(true);
            try {
                const data = await getVendorInventory(user.id);
                setProducts(data);
            } catch (e) {
                console.error(e);
            }
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, [user]);

    const handleEditClick = (p) => {
        setEditingProduct(p);
        setEditForm({ sellingPrice: p.sellingPrice, stock: p.stock, discount: p.discount });
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        let newValue = parseFloat(value) || 0;
        
        let updatedForm = { ...editForm, [name]: newValue };

        // If discount changed, update selling price based on original price
        if (name === 'discount' && editingProduct) {
            const originalPrice = editingProduct.originalPrice || updatedForm.sellingPrice;
            updatedForm.sellingPrice = originalPrice - (originalPrice * (newValue / 100));
        }
        
        // If selling price changed manually, maybe recalculate discount?
        // Let's keep it simple: discount drives price mostly, but price can be manual.
        if (name === 'sellingPrice' && editingProduct) {
            const originalPrice = editingProduct.originalPrice;
            if (originalPrice > 0) {
                updatedForm.discount = ((originalPrice - newValue) / originalPrice) * 100;
            }
        }

        setEditForm(updatedForm);
    };

    const handleSaveEdit = async () => {
        try {
            await updateVendorInventory(editingProduct.id, {
                productId: editingProduct.productId,
                ...editForm
            });
            setEditingProduct(null);
            fetchInventory();
        } catch (e) {
            alert("Failed to update inventory");
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteVendorInventory(id);
            setShowDeleteConfirm(null);
            fetchInventory();
        } catch (e) {
            alert("Failed to delete product");
        }
    };

    const containerStyle = { padding: '40px 4%', background: '#f8fafc', minHeight: '90vh' };
    const tableStyle = { width: '100%', borderCollapse: 'separate', borderSpacing: '0 12px' };
    const tdStyle = { padding: '20px', background: 'white', verticalAlign: 'middle', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' };
    
    const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100 };
    const modalStyle = { background: 'white', padding: '40px', borderRadius: '32px', width: '500px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' };

    return (
        <div style={containerStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#1e293b' }}>Store Inventory</h1>
                    <p style={{ color: '#64748b' }}>Manage your prices, stock levels, and active listings in real-time.</p>
                </div>
                <button onClick={fetchInventory} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: 'white', border: '1.5px solid #e2e8f0', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', color: '#64748b' }}>
                    <RefreshCw size={18} className={loading ? 'animate-spin' : ''} /> Refresh
                </button>
            </div>

            {loading && products.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '100px', color: '#64748b' }}>Synchronizing inventory...</div>
            ) : products.length > 0 ? (
                <table style={tableStyle}>
                    <thead>
                        <tr style={{ color: '#94a3b8', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            <th style={{ textAlign: 'left', padding: '0 20px 10px' }}>Product Details</th>
                            <th style={{ textAlign: 'left', padding: '0 20px 10px' }}>Selling Price</th>
                            <th style={{ textAlign: 'left', padding: '0 20px 10px' }}>Inventory Health</th>
                            <th style={{ textAlign: 'left', padding: '0 20px 10px' }}>Current Deal</th>
                            <th style={{ textAlign: 'center', padding: '0 20px 10px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(p => (
                            <tr key={p.id}>
                                <td style={{ ...tdStyle, borderLeft: '1px solid #f1f5f9', borderRadius: '16px 0 0 16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <div style={{ width: '45px', height: '45px', background: '#f1f5f9', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Package size={22} color="#6366f1" />
                                        </div>
                                        <div>
                                            <h4 style={{ fontWeight: '700', color: '#1e293b' }}>{p.productName}</h4>
                                            <span style={{ fontSize: '12px', color: '#94a3b8' }}>ID: #{p.productId}</span>
                                        </div>
                                    </div>
                                </td>
                                <td style={tdStyle}>
                                    <div style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b' }}>₹{p.sellingPrice.toLocaleString()}</div>
                                    <div style={{ fontSize: '12px', color: '#94a3b8', textDecoration: 'line-through' }}>MRP: ₹{p.originalPrice?.toLocaleString()}</div>
                                </td>
                                <td style={tdStyle}>
                                    <div style={{ 
                                        display: 'inline-flex', 
                                        alignItems: 'center', 
                                        gap: '8px', 
                                        padding: '6px 14px', 
                                        background: p.stock > 10 ? '#f0fdf4' : p.stock > 0 ? '#fffbeb' : '#fef2f2', 
                                        color: p.stock > 10 ? '#15803d' : p.stock > 0 ? '#b45309' : '#b91c1c', 
                                        borderRadius: '20px', 
                                        fontSize: '13px', 
                                        fontWeight: '700' 
                                    }}>
                                        <Archive size={14} /> {p.stock} units
                                        {p.stock <= 5 && <AlertTriangle size={14} style={{ marginLeft: '4px' }} />}
                                    </div>
                                </td>
                                <td style={tdStyle}>
                                    <span style={{ 
                                        padding: '4px 10px', 
                                        background: '#eef2ff', 
                                        color: '#6366f1', 
                                        borderRadius: '8px', 
                                        fontSize: '12px', 
                                        fontWeight: '800' 
                                    }}>
                                        {p.discount.toFixed(0)}% OFF
                                    </span>
                                </td>
                                <td style={{ ...tdStyle, borderRight: '1px solid #f1f5f9', borderRadius: '0 16px 16px 0', textAlign: 'center' }}>
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                                        <button 
                                            onClick={() => handleEditClick(p)}
                                            style={{ padding: '10px', borderRadius: '12px', border: 'none', background: '#f8fafc', color: '#6366f1', cursor: 'pointer', transition: 'all 0.2s' }}
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button 
                                            onClick={() => setShowDeleteConfirm(p)}
                                            style={{ padding: '10px', borderRadius: '12px', border: 'none', background: '#fef2f2', color: '#ef4444', cursor: 'pointer', transition: 'all 0.2s' }}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <div style={{ textAlign: 'center', padding: '100px', background: 'white', borderRadius: '32px', border: '2px dashed #e2e8f0' }}>
                   <div style={{ fontSize: '64px', marginBottom: '20px' }}>📊</div>
                   <h3 style={{ fontSize: '24px', fontWeight: '800' }}>Inventory Empty</h3>
                   <p style={{ color: '#64748b', margin: '15px 0 25px' }}>Listing your own products will help you manage your stock levels here.</p>
                </div>
            )}

            {/* Edit Modal */}
            {editingProduct && (
                <div style={modalOverlayStyle}>
                    <div style={modalStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Edit Listing</h2>
                            <button onClick={() => setEditingProduct(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X /></button>
                        </div>
                        
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>Discount Percentage (%)</label>
                            <input 
                                type="number" 
                                name="discount"
                                value={editForm.discount}
                                onChange={handleEditChange}
                                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1.5px solid #e2e8f0', fontSize: '16px' }}
                            />
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>Final Selling Price (₹)</label>
                            <input 
                                type="number" 
                                name="sellingPrice"
                                value={editForm.sellingPrice}
                                onChange={handleEditChange}
                                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1.5px solid #e2e8f0', fontSize: '16px', background: '#f8fafc' }}
                            />
                            <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '5px' }}>Automatically adjusted based on discount and MRP (₹{editingProduct.originalPrice})</p>
                        </div>

                        <div style={{ marginBottom: '30px' }}>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>Quick Stock Update</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <input 
                                    type="number" 
                                    name="stock"
                                    value={editForm.stock}
                                    onChange={handleEditChange}
                                    style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1.5px solid #e2e8f0', fontSize: '16px' }}
                                />
                                <div style={{ display: 'flex', gap: '5px' }}>
                                    {[10, 50, 100].map(amt => (
                                        <button 
                                            key={amt}
                                            onClick={() => setEditForm({...editForm, stock: editForm.stock + amt})}
                                            style={{ padding: '8px 12px', background: '#f1f5f9', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                                        >
                                            +{amt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={handleSaveEdit}
                            style={{ width: '100%', padding: '16px', background: '#6366f1', color: 'white', borderRadius: '16px', fontWeight: '700', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                        >
                            <Check size={20} /> Update Inventory
                        </button>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            {showDeleteConfirm && (
                <div style={modalOverlayStyle}>
                    <div style={{ ...modalStyle, textAlign: 'center' }}>
                        <div style={{ width: '70px', height: '70px', background: '#fef2f2', color: '#ef4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 25px' }}>
                            <Trash2 size={35} />
                        </div>
                        <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '10px' }}>Remove Listing?</h2>
                        <p style={{ color: '#64748b', marginBottom: '30px', lineHeight: '1.6' }}>Are you sure you want to remove <strong>{showDeleteConfirm.productName}</strong> from your inventory? This cannot be undone.</p>
                        
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <button 
                                onClick={() => setShowDeleteConfirm(null)}
                                style={{ flex: 1, padding: '14px', background: 'white', border: '1.5px solid #e2e8f0', borderRadius: '14px', fontWeight: '700', cursor: 'pointer' }}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={() => handleDelete(showDeleteConfirm.id)}
                                style={{ flex: 1, padding: '14px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '14px', fontWeight: '700', cursor: 'pointer' }}
                            >
                                Yes, Remove
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VendorProducts;