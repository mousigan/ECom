import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getMarketplaceProducts, getCategories } from '../../api/productService';
import ProductCard from '../../components/product/ProductCard';
import { Search, SlidersHorizontal, Mic } from 'lucide-react';

const ProductCatalog = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Initialize filter from URL
    const getUrlCategory = () => {
        const params = new URLSearchParams(location.search);
        return params.get('category') || '';
    };

    const [filter, setFilter] = useState({ 
        category: getUrlCategory(), 
        search: '' 
    });
    const [selectedIds, setSelectedIds] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isListening, setIsListening] = useState(false);

    // Sync filter with URL changes
    useEffect(() => {
        const urlCat = getUrlCategory();
        if (urlCat !== filter.category) {
            setFilter(prev => ({ ...prev, category: urlCat }));
        }
    }, [location.search]);

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, [filter.category]);

    const toggleCompare = (id, category) => {
        if (selectedIds.includes(id)) {
            const newSelection = selectedIds.filter(i => i !== id);
            setSelectedIds(newSelection);
            if (newSelection.length === 0) setSelectedCategory(null);
        } else {
            if (selectedCategory && selectedCategory !== category) {
                alert(`You can only compare products from the same category (${selectedCategory})`);
                return;
            }
            if (selectedIds.length >= 3) {
                alert('You can compare a maximum of 3 products at a time');
                return;
            }
            setSelectedIds([...selectedIds, id]);
            setSelectedCategory(category);
        }
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const data = await getMarketplaceProducts(filter.category, filter.search);
            // Sort available products to top
            const sortedData = [...data].sort((a, b) => {
                if (a.stock > 0 && b.stock <= 0) return -1;
                if (a.stock <= 0 && b.stock > 0) return 1;
                return 0;
            });
            setProducts(sortedData);
        } catch (error) {
            console.error('Failed to fetch products', error);
        }
        setLoading(false);
    };

    const fetchCategories = async () => {
        try {
            const cats = await getCategories();
            setCategories(cats);
        } catch (e) {}
    };

    const handleVoiceSearch = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert('Your browser does not support voice search. Please try Chrome or Edge.');
            return;
        }

        try {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = navigator.language || 'en-US';

            recognition.onstart = () => setIsListening(true);
            recognition.onend = () => setIsListening(false);
            
            recognition.onerror = (event) => {
                console.error("Catalog Voice Error:", event.error);
                setIsListening(false);
            };

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                const cleanTranscript = transcript.replace(/[.,]$/g, '').trim(); 
                if (cleanTranscript) {
                    setFilter(prev => ({ ...prev, search: cleanTranscript }));
                    // Trigger fetch immediately
                    getMarketplaceProducts(filter.category, cleanTranscript)
                        .then(data => {
                            const sortedData = [...data].sort((a, b) => (a.stock > 0 && b.stock <= 0 ? -1 : 1));
                            setProducts(sortedData);
                        });
                }
            };

            recognition.start();
        } catch (err) {
            console.error("Catalog Voice Initialization Error:", err);
            setIsListening(false);
        }
    };

    const containerStyle = { padding: '40px 4%', background: '#f8fafc', minHeight: '90vh', position: 'relative' };
    const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px', marginTop: '30px' };

    return (
        <div style={containerStyle}>
            <div className="page-header">
                <div>
                    <h1 style={{ fontSize: '36px', fontWeight: '800', color: '#1e293b' }}>Marketplace</h1>
                    <p style={{ color: '#64748b', marginTop: '5px' }}>Top quality products from our trusted global vendors</p>
                </div>
                <div className="search-container">
                    <div style={{ position: 'relative', width: '100%' }}>
                        <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
                        <input 
                            className="search-input"
                            placeholder="Search products..." 
                            style={{ padding: '12px 60px 12px 40px', borderRadius: '12px', border: '1.5px solid #e2e8f0', minWidth: '350px', width: '100%' }}
                            value={filter.search}
                            onChange={(e) => setFilter({...filter, search: e.target.value})}
                            onKeyPress={(e) => e.key === 'Enter' && fetchProducts()}
                        />
                        <button 
                            onClick={handleVoiceSearch}
                            style={{ 
                                position: 'absolute', 
                                right: '8px', 
                                top: '50%', 
                                transform: 'translateY(-50%)', 
                                background: isListening ? '#ef4444' : '#f1f5f9', 
                                border: 'none', 
                                borderRadius: '8px', 
                                padding: '6px', 
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                transition: 'all 0.2s',
                                animation: isListening ? 'pulse 1.5s infinite' : 'none'
                            }}
                            title="Voice Search"
                        >
                            <Mic size={18} color={isListening ? 'white' : '#6366f1'} fill={isListening ? 'white' : 'transparent'} />
                        </button>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '15px', overflowX: 'auto', padding: '10px 5px 25px', scrollbarWidth: 'none' }}>
                <button 
                    onClick={() => {
                        setFilter({...filter, category: ''});
                        navigate('/catalog');
                    }}
                    style={{ 
                        padding: '12px 28px', 
                        borderRadius: '16px', 
                        border: 'none', 
                        background: filter.category === '' ? 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)' : 'white', 
                        color: filter.category === '' ? 'white' : '#64748b', 
                        fontWeight: '700', 
                        cursor: 'pointer', 
                        whiteSpace: 'nowrap', 
                        boxShadow: filter.category === '' ? '0 10px 15px -3px rgba(99, 102, 241, 0.4)' : '0 4px 6px -1px rgba(0,0,0,0.05)',
                        transform: filter.category === '' ? 'scale(1.05)' : 'scale(1)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    {filter.category === '' && <span style={{ width: '8px', height: '8px', background: 'white', borderRadius: '50%' }}></span>}
                    All Items
                </button>
                {categories.map(c => {
                    const isActive = filter.category === c.slug;
                    return (
                        <button 
                            key={c.id}
                            onClick={() => {
                                setFilter({...filter, category: c.slug});
                                navigate(`/catalog?category=${c.slug}`);
                            }}
                            style={{ 
                                padding: '12px 28px', 
                                borderRadius: '16px', 
                                border: isActive ? 'none' : '1px solid #e2e8f0', 
                                background: isActive ? 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)' : 'white', 
                                color: isActive ? 'white' : '#475569', 
                                fontWeight: '700', 
                                cursor: 'pointer', 
                                whiteSpace: 'nowrap', 
                                boxShadow: isActive ? '0 10px 15px -3px rgba(99, 102, 241, 0.4)' : '0 4px 6px -1px rgba(0,0,0,0.05)',
                                transform: isActive ? 'scale(1.05)' : 'scale(1)',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            {isActive && <span style={{ width: '8px', height: '8px', background: 'white', borderRadius: '50%' }}></span>}
                            {c.name}
                        </button>
                    );
                })}
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '100px', color: '#64748b' }}>Discovering matching products...</div>
            ) : (
                <div style={gridStyle}>
                    {products.length > 0 ? (
                        products.map(product => (
                            <ProductCard 
                                key={product.id} 
                                product={product} 
                                selected={selectedIds.includes(product.id)}
                                onSelect={toggleCompare}
                            />
                        ))
                    ) : (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '100px', background: 'white', borderRadius: '32px', border: '2px dashed #e2e8f0' }}>
                            <div style={{ fontSize: '48px', marginBottom: '20px' }}>📦</div>
                            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b' }}>No products found</h3>
                            <p style={{ color: '#64748b', marginTop: '10px' }}>Try adjusting your search or category filters</p>
                        </div>
                    )}
                </div>
            )}

            {/* Floating Compare Button */}
            {selectedIds.length > 0 && (
                <div style={{ 
                    position: 'fixed', 
                    bottom: '40px', 
                    left: '50%', 
                    transform: 'translateX(-50%)', 
                    background: '#1e293b', 
                    color: 'white', 
                    padding: '16px 32px', 
                    borderRadius: '20px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '24px', 
                    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)',
                    zIndex: 1000,
                    animation: 'slideUp 0.3s ease-out'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <SlidersHorizontal size={20} color="#6366f1" />
                        <span style={{ fontWeight: '700' }}>{selectedIds.length} Product{selectedIds.length > 1 ? 's' : ''} Selected</span>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button 
                            onClick={() => { setSelectedIds([]); setSelectedCategory(null); }}
                            style={{ background: 'transparent', border: '1px solid #475569', color: '#94a3b8', padding: '8px 16px', borderRadius: '12px', cursor: 'pointer', fontWeight: '600' }}
                        >
                            Clear
                        </button>
                        <button 
                            disabled={selectedIds.length < 2}
                            onClick={() => navigate(`/compare?ids=${selectedIds.join(',')}`)}
                            style={{ background: selectedIds.length < 2 ? '#475569' : '#6366f1', border: 'none', color: 'white', padding: '8px 24px', borderRadius: '12px', cursor: 'pointer', fontWeight: '700' }}
                        >
                            Compare Now
                        </button>
                    </div>
                </div>
            )}
            
            <style>{`
                @keyframes slideUp {
                    from { transform: translate(-50%, 100px); opacity: 0; }
                    to { transform: translate(-50%, 0); opacity: 1; }
                }
                @keyframes pulse {
                    0% { transform: translateY(-50%) scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
                    70% { transform: translateY(-50%) scale(1.1); box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
                    100% { transform: translateY(-50%) scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
                }
            `}</style>
        </div>
    );
};

export default ProductCatalog;
