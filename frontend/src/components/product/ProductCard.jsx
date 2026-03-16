import React from 'react';
import { useNavigate } from 'react-router-dom';
import EcoBadge from './EcoBadge';
import { Star } from 'lucide-react';

const ProductCard = ({ product, selected, onSelect }) => {
    const navigate = useNavigate();

    const cardStyle = {
        background: 'white',
        borderRadius: '24px',
        padding: '20px',
        boxShadow: selected ? '0 0 0 3px #6366f1, 0 10px 15px -3px rgba(0, 0, 0, 0.1)' : '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        border: '1px solid #f1f5f9',
        transform: selected ? 'translateY(-5px)' : 'none'
    };

    const imageStyle = {
        width: '100%',
        height: '240px',
        borderRadius: '16px',
        objectFit: 'cover',
        marginBottom: '10px',
    };

    const badgeContainer = {
        position: 'absolute',
        top: '32px',
        right: '32px',
        zIndex: 10,
    };

    const compareToggleStyle = {
        position: 'absolute',
        top: '32px',
        left: '32px',
        zIndex: 20,
        background: selected ? '#6366f1' : 'rgba(255,255,255,0.9)',
        color: selected ? 'white' : '#64748b',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '6px 10px',
        fontSize: '11px',
        fontWeight: '800',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
    };

    return (
        <div style={cardStyle} onClick={() => navigate(`/product/${product.id}`)}>
            <div 
                style={compareToggleStyle} 
                onClick={(e) => { e.stopPropagation(); onSelect(product.id, product.category); }}
            >
                <div style={{ width: '12px', height: '12px', borderRadius: '3px', border: '1.5px solid currentColor', background: selected ? 'white' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   {selected && <div style={{ width: '6px', height: '6px', borderRadius: '1px', background: '#6366f1' }}></div>}
                </div>
                {selected ? 'Added to Compare' : 'Add to Compare'}
            </div>

            <div style={badgeContainer}>
                <EcoBadge score={product.ecoScore || 0} />
            </div>

            <img src={product.thumbnail} alt={product.name} style={imageStyle} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#94a3b8', fontWeight: '800', letterSpacing: '1px' }}>{product.brand}</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', flex: 1 }}>{product.name}</h3>
                </div>
                {product.vendorName && <span style={{ fontSize: '12px', color: '#6366f1', fontWeight: '600' }}>Sold by: {product.vendorName}</span>}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px', fontWeight: '800', color: '#6366f1' }}>₹{product.price}</span>
                <div style={{ display: 'flex', background: '#fffbeb', color: '#d97706', padding: '2px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', alignItems: 'center' }}>
                    <Star size={12} fill="#d97706" style={{ marginRight: '4px' }} /> {product.vendorRating ? product.vendorRating.toFixed(1) : product.rating}
                </div>
            </div>

            <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.5', height: '42px', overflow: 'hidden' }}>{product.description}</p>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                <div style={{ 
                    padding: '4px 8px', 
                    borderRadius: '6px', 
                    fontSize: '11px', 
                    fontWeight: '700', 
                    background: product.stock > 10 ? '#f0fdf4' : product.stock > 0 ? '#fff7ed' : '#fef2f2',
                    color: product.stock > 10 ? '#166534' : product.stock > 0 ? '#9a3412' : '#991b1b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: product.stock > 10 ? '#22c55e' : product.stock > 0 ? '#f97316' : '#ef4444' }}></span>
                    {product.stock > 0 ? `${product.stock} In Stock` : 'Out of Stock'}
                </div>
            </div>
            
            <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '15px' }}>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>Category: <b style={{ color: '#64748b' }}>{product.category}</b></span>
                <button style={{ 
                    padding: '8px 16px', 
                    background: '#f1f5f9', 
                    border: 'none', 
                    borderRadius: '10px', 
                    fontWeight: '700', 
                    color: '#6366f1',
                    fontSize: '13px'
                }}>
                    Details
                </button>
            </div>
        </div>
    );
};

export default ProductCard;
