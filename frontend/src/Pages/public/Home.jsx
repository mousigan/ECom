import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCategories } from '../../api/productService';
import { ShoppingCart, ShieldCheck, Zap, ArrowRight, Grid } from 'lucide-react';

const Home = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        getCategories().then(setCategories).catch(console.error);
    }, []);

    const heroStyle = {
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        color: 'white',
        padding: '0 20px',
        position: 'relative',
        overflow: 'hidden'
    };

    return (
        <div style={{ background: '#f8fafc' }}>
            <div style={heroStyle}>
                <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '40%', height: '40%', background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)', opacity: '0.2', filter: 'blur(100px)' }} />
                <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: '40%', height: '40%', background: 'radial-gradient(circle, #ec4899 0%, transparent 70%)', opacity: '0.2', filter: 'blur(100px)' }} />
                
                <h1 style={{ fontSize: '72px', fontWeight: '900', marginBottom: '24px', maxWidth: '900px', lineHeight: '1.1' }}>
                    Multi-Vendor <span style={{ background: 'linear-gradient(to right, #818cf8, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Essentials</span> Marketplace
                </h1>
                <p style={{ fontSize: '20px', opacity: '0.7', marginBottom: '40px', maxWidth: '700px', lineHeight: '1.6' }}>
                    Connect with premium vendors, compare hundreds of products, and discover sustainable essentials with verified user ratings.
                </p>
                <div style={{ display: 'flex', gap: '20px' }}>
                    <button onClick={() => navigate('/catalog')} style={{ padding: '18px 40px', background: 'white', color: '#1e1b4b', borderRadius: '15px', fontWeight: '800', fontSize: '18px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        Browse Marketplace <ArrowRight size={20} />
                    </button>
                    <button onClick={() => navigate('/signup')} style={{ padding: '18px 40px', background: 'rgba(255,255,255,0.1)', color: 'white', borderRadius: '15px', fontWeight: '800', fontSize: '18px', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', backdropFilter: 'blur(10px)' }}>
                        Become a Vendor
                    </button>
                </div>
            </div>

            <div style={{ padding: '80px 4%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
                    <div>
                        <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#0f172a' }}>Browse by Category</h2>
                        <p style={{ color: '#64748b', marginTop: '10px' }}>Explore thousands of catalog products category-wise</p>
                    </div>
                    <button onClick={() => navigate('/catalog')} style={{ color: '#6366f1', fontWeight: '700', background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                        View All <ArrowRight size={18} />
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                    {categories.slice(0, 12).map(cat => (
                        <div 
                            key={cat.id} 
                            onClick={() => navigate(`/catalog?category=${cat.slug}`)}
                            style={{ padding: '30px 20px', background: 'white', borderRadius: '24px', textAlign: 'center', border: '1px solid #e2e8f0', cursor: 'pointer', transition: 'all 0.3s' }}
                        >
                            <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: '#f5f3ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}>
                                <Grid size={28} />
                            </div>
                            <h4 style={{ fontWeight: '700', fontSize: '16px', color: '#1e293b' }}>{cat.name}</h4>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ padding: '40px 4% 100px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px' }}>
                <div style={{ padding: '40px', background: 'white', borderRadius: '32px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }}>
                    <div style={{ padding: '15px', background: '#ecfdf5', borderRadius: '15px', width: 'fit-content' }}><ShieldCheck size={32} color="#10b981" /></div>
                    <h3 style={{ fontSize: '22px', fontWeight: '800', margin: '20px 0 10px' }}>Verified Vendors</h3>
                    <p style={{ color: '#64748b', lineHeight: '1.6' }}>We manually vet every vendor to ensure quality, fast shipping, and reliable service.</p>
                </div>
                <div style={{ padding: '40px', background: 'white', borderRadius: '32px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }}>
                    <div style={{ padding: '15px', background: '#eff6ff', borderRadius: '15px', width: 'fit-content' }}><Zap size={32} color="#3b82f6" /></div>
                    <h3 style={{ fontSize: '22px', fontWeight: '800', margin: '20px 0 10px' }}>Instant Compare</h3>
                    <p style={{ color: '#64748b', lineHeight: '1.6' }}>Can't decide? Compare specifications side-by-side to make the best purchasing decision.</p>
                </div>
                <div style={{ padding: '40px', background: 'white', borderRadius: '32px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }}>
                    <div style={{ padding: '15px', background: '#fef2f2', borderRadius: '15px', width: 'fit-content' }}><ShoppingCart size={32} color="#ef4444" /></div>
                    <h3 style={{ fontSize: '22px', fontWeight: '800', margin: '20px 0 10px' }}>Flexible Inventory</h3>
                    <p style={{ color: '#64748b', lineHeight: '1.6' }}>Multiple vendors selling the same product allows you to choose based on price, rating, or stock.</p>
                </div>
            </div>
        </div>
    );
};

export default Home;
