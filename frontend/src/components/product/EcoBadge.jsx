import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { compareProducts } from '../../api/productService';
import { ArrowLeft, Zap, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';

const ProductComparison = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [products, setProducts] = useState([]);
    const ids = searchParams.get('ids')?.split(',') || [];

    const [categoryPeers, setCategoryPeers] = useState([]);
    const [mainProduct, setMainProduct] = useState(null);

    useEffect(() => {
        const fetchComparisonData = async () => {
            if (ids.length === 0) return;

            try {
                if (ids.length === 1) {
                    // Logic: User wants to compare one product with its category peers
                    const mainProductData = await compareProducts([ids[0]]); // Fetch current product detail
                    if (mainProductData.length > 0) {
                        setMainProduct(mainProductData[0]);
                        const category = mainProductData[0].product.category;
                        // Fetch other products in same category from marketplace
                        const { getMarketplaceProducts } = await import('../../api/productService');
                        const marketplace = await getMarketplaceProducts(category);
                        
                        // Filter out the current product
                        const peers = marketplace.filter(p => p.id !== parseInt(ids[0]));
                        setCategoryPeers(peers);
                        setProducts(mainProductData); // Show at least the main product
                    }
                } else {
                    // Standard multi-selection comparison
                    const data = await compareProducts(ids);
                    setProducts(data);
                    setCategoryPeers([]);
                    setMainProduct(null);
                }
            } catch (error) {
                console.error('Error fetching comparison data', error);
            }
        };

        fetchComparisonData();
    }, [searchParams.get('ids')]);

    const handleSelectPeer = async (peerId) => {
        const newIds = [...ids, peerId].join(',');
        navigate(`/compare?ids=${newIds}`);
    };

    const containerStyle = { padding: '40px 4%', background: '#f8fafc', minHeight: '90vh' };
    const tableStyle = { width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '24px', overflow: 'hidden', marginTop: '30px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' };
    const thStyle = { padding: '24px', background: '#fcfdff', color: '#1e293b', textAlign: 'center', border: '1px solid #e2e8f0', fontWeight: '800', fontSize: '18px' };
    const labelTdStyle = { padding: '20px 24px', border: '1px solid #e2e8f0', textAlign: 'left', fontWeight: '700', color: '#64748b', background: '#f8fafc', width: '250px' };
    const valueTdStyle = { padding: '20px 24px', border: '1px solid #e2e8f0', textAlign: 'center', color: '#1e293b', fontSize: '16px' };

    if (products.length === 0) return (
        <div style={containerStyle}>
             <button onClick={() => navigate(-1)} style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#6366f1', fontWeight: '700', cursor: 'pointer' }}>
                <ArrowLeft size={20} /> Back to Catalog
            </button>
            <div style={{ padding: '100px', textAlign: 'center', background: 'white', borderRadius: '32px', border: '2px dashed #e2e8f0' }}>
                <h2 style={{ color: '#64748b' }}>Select products to compare side-by-side</h2>
            </div>
        </div>
    );

    // Get all unique specification keys across all products
    const allSpecKeys = Array.from(new Set(
        products.flatMap(d => d.product.specifications ? Object.keys(d.product.specifications) : [])
    )).sort();

    return (
        <div style={containerStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                   <button onClick={() => navigate(-1)} style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#6366f1', fontWeight: '700', cursor: 'pointer' }}>
                        <ArrowLeft size={18} /> Back
                    </button>
                    <h1 style={{ fontSize: '32px', fontWeight: '900', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <Zap size={28} color="#6366f1" fill="#6366f1" /> Smart Comparison
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '14px' }}>
                        {products.length > 1 
                            ? `Comparing ${products.length} products head-to-head.` 
                            : `Select products from the same category to compare with ${mainProduct?.product?.name}`}
                    </p>
                </div>
            </div>

            {/* Peer Selection Grid (Shown when ids.length is limited) */}
            {categoryPeers.length > 0 && products.length < 3 && (
                <div style={{ marginTop: '30px', background: '#eef2ff', padding: '30px', borderRadius: '32px', border: '1.5px dashed #6366f1' }}>
                    <h3 style={{ marginBottom: '20px', color: '#4338ca', fontWeight: '800' }}>Choose competitors to compare with:</h3>
                    <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '10px' }}>
                        {categoryPeers.filter(p => !ids.includes(p.id.toString())).map(peer => (
                            <div key={peer.id} onClick={() => handleSelectPeer(peer.id)} style={{ 
                                minWidth: '220px', 
                                background: 'white', 
                                padding: '20px', 
                                borderRadius: '24px', 
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                border: '1px solid #e2e8f0',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
                            }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={e => e.currentTarget.style.transform = 'none'}>
                                <img src={peer.thumbnail} style={{ width: '100%', height: '120px', objectFit: 'contain', borderRadius: '12px' }} />
                                <h4 style={{ fontSize: '14px', marginTop: '15px', fontWeight: '800', height: '34px', overflow: 'hidden' }}>{peer.name}</h4>
                                <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: '900', color: '#6366f1' }}>₹{peer.price}</span>
                                    <button style={{ padding: '6px 12px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '700' }}>Add</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {products.length > 1 && (
            <table style={tableStyle}>
                <thead>
                    <tr>
                        <th style={{ ...thStyle, textAlign: 'left', width: '250px', background: '#f8fafc' }}>
                            <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Comparison Engine v2.0</div>
                            <div style={{ marginTop: '10px' }}>Product Details</div>
                        </th>
                        {products.slice(0, 3).map(d => {
                            const bestOffer = d.vendors.length > 0 
                                ? [...d.vendors].sort((a,b) => a.sellingPrice - b.sellingPrice).find(v => v.stock > 0)
                                : null;

                            return (
                                <th key={d.product.id} style={thStyle}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <img src={d.product.thumbnail} alt={d.product.name} style={{ width: '130px', height: '130px', objectFit: 'contain', borderRadius: '15px', marginBottom: '15px' }} />
                                        <span style={{ fontSize: '18px', fontWeight: '900', lineHeight: '1.2', marginBottom: '15px' }}>{d.product.name}</span>
                                        <button 
                                            disabled={!bestOffer}
                                            onClick={() => {
                                                addToCart({
                                                    ...d.product,
                                                    price: bestOffer.sellingPrice,
                                                    vendorId: bestOffer.vendorId,
                                                    vendorName: bestOffer.vendorName,
                                                    stock: bestOffer.stock
                                                });
                                                navigate('/cart');
                                            }}
                                            style={{ 
                                                width: '100%', 
                                                padding: '12px', 
                                                background: bestOffer ? '#6366f1' : '#ced4da', 
                                                color: 'white', 
                                                border: 'none', 
                                                borderRadius: '12px', 
                                                fontWeight: '700', 
                                                fontSize: '14px',
                                                cursor: bestOffer ? 'pointer' : 'not-allowed',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '8px'
                                            }}
                                        >
                                            <ShoppingBag size={16} /> {bestOffer ? 'Buy Now' : 'Out of Stock'}
                                        </button>
                                    </div>
                                </th>
                            );
                        })}
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style={labelTdStyle}>Brand & Origin</td>
                        {products.slice(0, 3).map(d => <td key={d.product.id} style={valueTdStyle}>{d.product.brand}</td>)}
                    </tr>
                    <tr>
                        <td style={labelTdStyle}>Marketplace Price</td>
                        {products.slice(0, 3).map(d => {
                            const minPrice = d.vendors.length > 0 
                                ? Math.min(...d.vendors.map(v => v.sellingPrice)) 
                                : d.product.price;
                            return (
                                <td key={d.product.id} style={{ ...valueTdStyle, fontWeight: '900', fontSize: '22px', color: '#1e293b' }}>
                                    ₹{minPrice.toLocaleString()}
                                </td>
                            );
                        })}
                    </tr>
                    <tr>
                        <td style={labelTdStyle}>User Rating</td>
                        {products.slice(0, 3).map(d => (
                            <td key={d.product.id} style={valueTdStyle}>
                                <div style={{ fontWeight: '800', fontSize: '18px' }}>⭐ {d.product.rating}</div>
                            </td>
                        ))}
                    </tr>
                    
                    {/* All Vendors Section */}
                    <tr>
                        <td colSpan={Math.min(products.length, 3) + 1} style={{ padding: '30px 24px 10px', background: '#f8fafc', fontWeight: '800', fontSize: '13px', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                            Available Offers
                        </td>
                    </tr>
                    <tr>
                        <td style={labelTdStyle}>Vendor Listings</td>
                        {products.slice(0, 3).map(d => (
                            <td key={d.product.id} style={{ ...valueTdStyle, padding: '15px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {d.vendors.length > 0 ? d.vendors.map((v, i) => (
                                        <div key={i} style={{ 
                                            padding: '12px', 
                                            background: '#ffffff', 
                                            borderRadius: '16px', 
                                            border: '1.5px solid #f1f5f9',
                                            textAlign: 'left',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <div>
                                                <p style={{ margin: 0, fontWeight: '800', fontSize: '13px', color: '#1e293b' }}>{v.vendorName}</p>
                                                <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>Stock: {v.stock}</p>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <p style={{ margin: 0, fontWeight: '900', color: '#6366f1', fontSize: '15px' }}>₹{v.sellingPrice.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    )) : (
                                        <p style={{ color: '#94a3b8', fontSize: '13px' }}>Sold Out</p>
                                    )}
                                </div>
                            </td>
                        ))}
                    </tr>
                    
                    {/* Dynamic Specifications */}
                    {allSpecKeys.length > 0 && (
                        <tr>
                            <td colSpan={Math.min(products.length, 3) + 1} style={{ padding: '30px 24px 10px', background: '#f8fafc', fontWeight: '800', fontSize: '13px', color: '#1e293b', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                                Technical Specifications
                            </td>
                        </tr>
                    )}
                    
                    {allSpecKeys.map(key => (
                        <tr key={key}>
                            <td style={labelTdStyle}>{key}</td>
                            {products.slice(0, 3).map(d => (
                                <td key={d.product.id} style={{...valueTdStyle, fontSize: '15px'}}>
                                    {(d.product.specifications && d.product.specifications[key]) || <span style={{ color: '#cbd5e1' }}>—</span>}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            )}
        </div>
    );
};

export default ProductComparison;
