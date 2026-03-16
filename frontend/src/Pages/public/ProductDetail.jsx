import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductDetails, getMarketplaceProducts } from '../../api/productService';
import { useCart } from '../../context/CartContext';
import EcoBadge from '../../components/product/EcoBadge';
import VirtualTryOn from '../../components/product/VirtualTryOn';
import { Store, ShoppingBag, Star, Zap, X, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../api/axiosConfig';

const ProductDetail = () => {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tryOnActive, setTryOnActive] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [userRating, setUserRating] = useState(5);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [compareOverlay, setCompareOverlay] = useState(false);
    const [peers, setPeers] = useState([]);
    const [selectedPeers, setSelectedPeers] = useState([]);
    const [selectionLoading, setSelectionLoading] = useState(false);
    const { addToCart } = useCart();
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = await getProductDetails(id);
                setData(res);
                setReviews(res.reviews || []);
                setLoading(false);
            } catch (e) {
                console.error(e);
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id]);

    const handleSubmitReview = async () => {
        if (!isAuthenticated) {
            alert("Please login to submit a review!");
            navigate('/login');
            return;
        }

        if (comment.length < 5) {
            alert("Please provide a bit more detail in your comment!");
            return;
        }

        setSubmitting(true);
        try {
            const res = await axiosInstance.post(`/reviews/${user.id}`, {
                productId: id,
                rating: userRating,
                comment: comment
            });
            
            // Add new review to local state
            setReviews([res.data, ...reviews]);
            setComment("");
            setUserRating(5);
            alert("Thanks! Your rating has been updated in real-time.");
            
            // Optional: Re-fetch details to sync the overall average product rating
            const reRes = await getProductDetails(id);
            setData(reRes);
        } catch (e) {
            console.error("Rating Error:", e);
            alert("Couldn't submit rating. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };
    
    const handleOpenCompare = async () => {
        setCompareOverlay(true);
        setSelectionLoading(true);
        try {
            const marketplace = await getMarketplaceProducts(product.category);
            // Filter out current product
            setPeers(marketplace.filter(p => p.id !== product.id));
        } catch (e) {
            console.error("Comparison Load Error:", e);
        } finally {
            setSelectionLoading(false);
        }
    };

    const togglePeerSelection = (peerId) => {
        if (selectedPeers.includes(peerId)) {
            setSelectedPeers(selectedPeers.filter(id => id !== peerId));
        } else {
            if (selectedPeers.length >= 2) {
                alert("You can select up to 2 additional products for comparison.");
                return;
            }
            setSelectedPeers([...selectedPeers, peerId]);
        }
    };

    const startComparison = () => {
        const ids = [product.id, ...selectedPeers].join(',');
        navigate(`/compare?ids=${ids}`);
    };

    if (loading) return <div style={{ padding: '100px', textAlign: 'center' }}>Optimizing Details...</div>;
    if (!data) return <div style={{ padding: '100px', textAlign: 'center' }}>Product Not Found</div>;

    const { product, vendors } = data;

    return (
        <div className="product-detail-grid" style={{ background: 'white', minHeight: '80vh' }}>
            {/* Left Column: Media & Reviews */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                <div className="media-container">
                    <EcoBadge score={product.ecoScore} />
                    <img src={product.thumbnail} alt={product.name} style={{ width: '80%', height: 'auto', borderRadius: '20px' }} />
                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                        {product.images?.slice(0, 4).map((img, i) => (
                            <img key={i} src={img} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '10px', border: '2px solid white' }} />
                        ))}
                    </div>
                    {tryOnActive && (
                        <VirtualTryOn 
                            product={product} 
                            onClose={() => setTryOnActive(false)} 
                        />
                    )}
                </div>

                {/* REAL-TIME RATING SYSTEM (Customer Voice) */}
                <div style={{ padding: '30px', background: '#ffffff', borderRadius: '32px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        Customer Voice & Ratings
                    </h3>

                    {/* Review Form */}
                    <div style={{ background: '#f8fafc', padding: '25px', borderRadius: '24px', marginBottom: '40px' }}>
                        <p style={{ margin: '0 0 15px', fontWeight: '700', color: '#1e293b' }}>Share your experience</p>
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                            {[1, 2, 3, 4, 5].map(star => (
                                <Star 
                                    key={star}
                                    size={30}
                                    color={star <= userRating ? "#f59e0b" : "#cbd5e1"}
                                    fill={star <= userRating ? "#f59e0b" : "none"}
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => setUserRating(star)}
                                />
                            ))}
                        </div>
                        <textarea 
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Tell us what you loved about this product..."
                            style={{ width: '100%', minHeight: '100px', padding: '15px', borderRadius: '12px', border: '1.5px solid #e2e8f0', fontSize: '14px', marginBottom: '15px', outline: 'none', background: 'white' }}
                        />
                        <button 
                            disabled={submitting}
                            onClick={handleSubmitReview}
                            style={{ width: '100%', padding: '14px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', opacity: submitting ? 0.7 : 1, transition: 'all 0.2s' }}
                        >
                            {submitting ? 'Updating System...' : 'Submit Real-time Rating'}
                        </button>
                    </div>

                    {/* Review List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                        {reviews.length > 0 ? reviews.map(r => (
                            <div key={r.id} style={{ paddingBottom: '25px', borderBottom: '1px solid #f1f5f9' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                    <span style={{ fontWeight: '800', color: '#1e293b' }}>{r.userName}</span>
                                    <div style={{ display: 'flex', gap: '2px' }}>
                                        {[...Array(r.rating)].map((_, i) => <Star key={i} size={14} fill="#f59e0b" color="#f59e0b" />)}
                                    </div>
                                </div>
                                <p style={{ margin: 0, color: '#64748b', fontSize: '15px', lineHeight: '1.6' }}>"{r.comment}"</p>
                            </div>
                        )) : (
                            <p style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>No ratings yet. Be the first!</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Column: Info, Specs, Sellers */}
            <div>

                <span style={{ color: '#6366f1', fontWeight: '700', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '2px' }}>{product.brand}</span>
                <h1 style={{ fontSize: '48px', fontWeight: '800', marginTop: '10px', marginBottom: '20px' }}>{product.name}</h1>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '30px' }}>
                    <div style={{ display: 'flex', background: '#fef3c7', color: '#92400e', padding: '4px 12px', borderRadius: '50px', fontWeight: '700', alignItems: 'center', gap: '5px' }}>
                        <Star size={16} fill="#92400e" /> {product.rating}
                    </div>
                    <span style={{ color: '#94a3b8' }}>| Category: {product.category}</span>
                </div>
                
                <p style={{ color: '#6b7280', lineHeight: '1.8', fontSize: '16px', marginBottom: '30px' }}>{product.description}</p>

                {product.specifications && Object.keys(product.specifications).length > 0 && (
                    <div style={{ marginBottom: '40px' }}>
                        <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '15px' }}>Technical Specifications</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px', background: '#e2e8f0', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                            {Object.entries(product.specifications).map(([key, value]) => (
                                <React.Fragment key={key}>
                                    <div style={{ background: '#f8fafc', padding: '12px 15px', fontSize: '14px', fontWeight: '600', color: '#64748b' }}>{key}</div>
                                    <div style={{ background: 'white', padding: '12px 15px', fontSize: '14px', color: '#1e293b' }}>{value}</div>
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                )}

                <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Store size={22} color="#6366f1" /> Available from these Sellers
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '40px' }}>
                    {vendors.length > 0 ? vendors.map(v => (
                        <div key={v.vendorId} style={{ padding: '20px', border: '1.5px solid #e2e8f0', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s', ':hover': { borderColor: '#6366f1' } }}>
                            <div>
                                <h4 style={{ fontSize: '18px', fontWeight: '700' }}>{v.vendorName}</h4>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '5px', fontSize: '14px', color: '#64748b' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Star size={14} fill="#f59e0b" color="#f59e0b" /> {v.vendorRating?.toFixed(1) || '0.0'}</span>
                                    <span>•</span>
                                    <span>{v.stock > 0 ? `${v.stock} in stock` : 'Out of stock'}</span>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <div>
                                    <span style={{ fontSize: '24px', fontWeight: '800', color: '#111827' }}>₹{v.sellingPrice}</span>
                                    {v.discount > 0 && <p style={{ fontSize: '12px', color: '#10b981', fontWeight: 'bold' }}>{v.discount}% off</p>}
                                </div>
                                <button 
                                    disabled={v.stock === 0}
                                    onClick={() => { addToCart({...product, price: v.sellingPrice, vendorId: v.vendorId, vendorName: v.vendorName, stock: v.stock}); navigate('/cart'); }}
                                    style={{ padding: '12px 24px', background: v.stock > 0 ? '#6366f1' : '#94a3b8', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                >
                                    <ShoppingBag size={18} /> Buy Now
                                </button>
                            </div>
                        </div>
                    )) : (
                        <div style={{ padding: '30px', background: '#f8fafc', borderRadius: '20px', textAlign: 'center', color: '#64748b' }}>
                            Currently not available from any vendors.
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', gap: '20px' }}>
                    <button 
                         onClick={handleOpenCompare}
                         style={{ flex: 1, padding: '18px', background: '#eef2ff', color: '#4338ca', border: 'none', borderRadius: '16px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                        <Zap size={18} /> Compare Product
                    </button>
                    <button 
                        onClick={() => setTryOnActive(true)}
                        style={{ flex: 1, padding: '18px', background: 'white', border: '2px solid #6366f1', color: '#6366f1', borderRadius: '16px', fontWeight: '700', cursor: 'pointer' }}
                    >
                        Try On (Virtual)
                    </button>
                </div>
            </div>
            
            {/* COMPARISON SELECTION MODAL */}
            {compareOverlay && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div style={{ backgroundColor: 'white', width: '100%', maxWidth: '900px', maxHeight: '85vh', borderRadius: '32px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
                        
                        {/* Modal Header */}
                        <div style={{ padding: '30px 40px', background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h2 style={{ fontSize: '24px', fontWeight: '900', margin: 0 }}>Smart Selection</h2>
                                <p style={{ margin: '5px 0 0', opacity: 0.9, fontSize: '14px' }}>Choose up to 2 products to compare with {product.name}</p>
                            </div>
                            <button onClick={() => setCompareOverlay(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
                            {selectionLoading ? (
                                <div style={{ textAlign: 'center', padding: '100px 0' }}>
                                    <div className="spinner" style={{ border: '4px solid #f3f3f3', borderTop: '4px solid #6366f1', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }} />
                                    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                                    <p style={{ color: '#64748b', fontWeight: '600' }}>Scanning {product.category} category...</p>
                                </div>
                            ) : peers.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
                                    <p style={{ fontSize: '18px', fontWeight: '600' }}>No other products found in this category for comparison.</p>
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '24px' }}>
                                    {peers.map(peer => {
                                        const isSelected = selectedPeers.includes(peer.id);
                                        return (
                                            <div 
                                                key={peer.id} 
                                                onClick={() => togglePeerSelection(peer.id)}
                                                style={{ 
                                                    padding: '15px', 
                                                    borderRadius: '20px', 
                                                    border: `2px solid ${isSelected ? '#6366f1' : '#f1f5f9'}`, 
                                                    background: isSelected ? '#f5f7ff' : 'white',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                                    position: 'relative',
                                                    textAlign: 'center'
                                                }}
                                            >
                                                {isSelected && (
                                                    <div style={{ position: 'absolute', top: '10px', right: '10px', color: '#6366f1' }}>
                                                        <CheckCircle2 size={24} fill="white" />
                                                    </div>
                                                )}
                                                <img src={peer.thumbnail} alt={peer.name} style={{ width: '100%', height: '140px', objectFit: 'contain', marginBottom: '15px', borderRadius: '12px' }} />
                                                <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#1e293b', margin: '0 0 10px', height: '34px', overflow: 'hidden' }}>{peer.name}</h4>
                                                <p style={{ fontWeight: '900', color: '#6366f1', margin: 0 }}>₹{peer.price.toLocaleString()}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div style={{ padding: '25px 40px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                            <div style={{ color: '#64748b', fontSize: '14px' }}>
                                <b>{selectedPeers.length + 1}</b> products selected
                            </div>
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <button 
                                    onClick={() => setCompareOverlay(false)}
                                    style={{ padding: '12px 25px', color: '#64748b', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                                <button 
                                    disabled={selectedPeers.length === 0}
                                    onClick={startComparison}
                                    style={{ 
                                        padding: '12px 30px', 
                                        background: selectedPeers.length > 0 ? '#6366f1' : '#cbd5e1', 
                                        color: 'white', 
                                        border: 'none', 
                                        borderRadius: '12px', 
                                        fontWeight: '700', 
                                        cursor: selectedPeers.length > 0 ? 'pointer' : 'not-allowed',
                                        boxShadow: selectedPeers.length > 0 ? '0 10px 15px -3px rgba(99, 102, 241, 0.3)' : 'none'
                                    }}
                                >
                                    Start Comparison →
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetail;
