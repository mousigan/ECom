import React, { useState, useEffect } from 'react';
import { addVendorProduct, getCategories } from '../../api/productService';
import { useAuth } from '../../context/AuthContext';
import { Package, DollarSign, Archive, Tag, Image as ImageIcon, Info, Plus, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const categorySpecs = {
    'mobiles': ['Model', 'RAM', 'Storage', 'Processor', 'Display Size', 'Display Type', 'Rear Camera', 'Front Camera', 'Battery Capacity', 'Operating System', '5G Support', 'Color'],
    'laptops': ['Model', 'Processor', 'Processor Generation', 'RAM', 'RAM Type', 'Storage', 'GPU', 'Display Size', 'Resolution', 'Refresh Rate', 'Battery', 'Operating System', 'Weight'],
    'sunglasses': ['Frame Type', 'Frame Material', 'Lens Type', 'Lens Color', 'UV Protection', 'Gender', 'Frame Shape', 'Weight'],
    'watches': ['Watch Type', 'Dial Shape', 'Dial Size', 'Strap Material', 'Strap Color', 'Water Resistance', 'Display Type', 'Battery Life'],
    'men-shirts': ['Size', 'Fit Type', 'Fabric', 'Sleeve Type', 'Pattern', 'Collar Type', 'Occasion', 'Color'],
    'shoes': ['Shoe Type', 'Size', 'Material', 'Sole Material', 'Closure Type', 'Color', 'Gender'],
    'handbags': ['Bag Type', 'Material', 'Number of Compartments', 'Closure Type', 'Strap Type', 'Color', 'Occasion']
};

const AddProduct = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        name: '',
        brand: '',
        category: '',
        description: '',
        thumbnail: '',
        price: '',
        stock: '',
        ecoScore: 80,
    });

    const [specs, setSpecs] = useState({});

    useEffect(() => {
        getCategories().then(setCategories).catch(console.error);
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        // Reset specs if category changes
        if (e.target.name === 'category') {
            setSpecs({});
        }
    };

    const handleSpecChange = (e) => {
        setSpecs({ ...specs, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Basic validation
        if (parseFloat(formData.price) <= 0) {
            alert('Selling Price must be greater than 0');
            return;
        }
        if (parseInt(formData.stock) < 0) {
            alert('Stock Units cannot be negative');
            return;
        }
        if (parseInt(formData.ecoScore) < 0 || parseInt(formData.ecoScore) > 100) {
            alert('Eco-Score must be between 0 and 100');
            return;
        }

        setLoading(true);
        try {
            await addVendorProduct(user.id, {
                ...formData,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock),
                images: [formData.thumbnail],
                specifications: specs
            });
            alert('Product added successfully!');
            navigate('/vendor/dashboard');
        } catch (err) {
            console.error(err);
            alert('Failed to add product');
        }
        setLoading(false);
    };

    const containerStyle = { padding: '40px', background: '#f8fafc', minHeight: '90vh' };
    const cardStyle = { background: 'white', padding: '50px', borderRadius: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', width: '100%', border: '1px solid #f1f5f9' };
    const inputGroupStyle = { marginBottom: '25px' };
    const labelStyle = { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '700', color: '#475569', marginBottom: '8px' };
    const inputStyle = { width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #e2e8f0', fontSize: '16px', outline: 'none', transition: 'all 0.2s' };

    return (
        <div style={containerStyle}>
            <div style={cardStyle}>
                <div style={{ marginBottom: '40px' }}>
                    <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#1e293b' }}>Add New Product</h1>
                    <p style={{ color: '#64748b' }}>List your item with detailed specifications for easy comparison.</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}><Package size={16} /> Product Name</label>
                            <input name="name" style={inputStyle} placeholder="e.g. iPhone 15 Pro" value={formData.name} onChange={handleChange} required />
                        </div>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}><Tag size={16} /> Brand</label>
                            <input name="brand" style={inputStyle} placeholder="e.g. Apple" value={formData.brand} onChange={handleChange} required />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}><Tag size={16} /> Category</label>
                            <select name="category" style={inputStyle} value={formData.category} onChange={handleChange} required>
                                <option value="">Select Category</option>
                                {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
                            </select>
                        </div>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}><ImageIcon size={16} /> Thumbnail URL</label>
                            <input name="thumbnail" style={inputStyle} placeholder="https://images.com/product.jpg" value={formData.thumbnail} onChange={handleChange} required />
                        </div>
                    </div>

                    {formData.category && categorySpecs[formData.category] && (
                        <div style={{ marginBottom: '40px', padding: '30px', background: '#f1f5f9', borderRadius: '20px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#334155', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Settings size={20} /> Category Specific Specifications
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                {categorySpecs[formData.category].map(spec => (
                                    <div key={spec} style={inputGroupStyle}>
                                        <label style={labelStyle}>{spec}</label>
                                        <input 
                                            name={spec} 
                                            style={inputStyle} 
                                            placeholder={`Enter ${spec}`} 
                                            value={specs[spec] || ''} 
                                            onChange={handleSpecChange} 
                                            required 
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div style={inputGroupStyle}>
                        <label style={labelStyle}><Info size={16} /> Description</label>
                        <textarea name="description" style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }} placeholder="Tell customers about your product..." value={formData.description} onChange={handleChange} required />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}><DollarSign size={16} /> Selling Price (₹)</label>
                            <input type="number" name="price" style={inputStyle} placeholder="0.00" value={formData.price} onChange={handleChange} required min="0.01" step="0.01" />
                        </div>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}><Archive size={16} /> Stock Units</label>
                            <input type="number" name="stock" style={inputStyle} placeholder="10" value={formData.stock} onChange={handleChange} required min="0" />
                        </div>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}><Plus size={16} /> Eco-Score (0-100)</label>
                            <input type="number" name="ecoScore" style={inputStyle} placeholder="80" value={formData.ecoScore} onChange={handleChange} required min="0" max="100" />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        style={{ width: '100%', padding: '16px', borderRadius: '16px', background: '#6366f1', color: 'white', fontSize: '18px', fontWeight: '700', border: 'none', cursor: 'pointer', marginTop: '20px', boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.4)' }}
                    >
                        {loading ? 'Creating Listing...' : 'List Product Now'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddProduct;
