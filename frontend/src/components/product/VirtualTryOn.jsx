import React, { useEffect, useRef, useState } from 'react';
import { X, Camera, RefreshCw, Zap } from 'lucide-react';

const VirtualTryOn = ({ product, onClose }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        startCamera();
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'user', width: 640, height: 480 } 
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                videoRef.current.onloadedmetadata = () => {
                    setLoading(false);
                    renderOverlay();
                };
            }
        } catch (err) {
            setError("Camera access denied. Please allow camera permissions to use Try-On.");
            setLoading(false);
        }
    };

    const renderOverlay = () => {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        if (!canvas || !video) return;

        const ctx = canvas.getContext('2d');
        
        const draw = () => {
            if (video.paused || video.ended) return;
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // In a real ML implementation, coordinates would come from a face tracker
            // For now, we position it in a standard "face zone" with a breathing animation
            const time = Date.now() / 1000;
            const floatY = Math.sin(time * 2) * 5;
            
            const centerX = canvas.width / 2;
            const centerY = canvas.height * 0.45 + floatY; // Eyes level
            const width = 220;
            const height = 80;

            // Draw the glasses image
            const tryOnImage = product.tryOnModelUrl || product.thumbnail;
            if (tryOnImage) {
                const img = new Image();
                img.src = tryOnImage;
                ctx.drawImage(img, centerX - width / 2, centerY - height / 2, width, height);
            }

            requestAnimationFrame(draw);
        };
        draw();
    };

    const overlayStyle = {
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.95)',
        zIndex: 3000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(12px)'
    };

    const containerStyle = {
        position: 'relative',
        width: '640px',
        height: '480px',
        background: '#000',
        borderRadius: '32px',
        overflow: 'hidden',
        boxShadow: '0 0 50px rgba(99, 102, 241, 0.3)',
        border: '4px solid #334155'
    };

    return (
        <div style={overlayStyle}>
            <div style={{ position: 'absolute', top: '40px', right: '40px' }}>
                <button 
                    onClick={onClose}
                    style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', padding: '15px', cursor: 'pointer', color: 'white' }}
                >
                    <X size={24} />
                </button>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '30px', color: 'white' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '10px' }}>
                    <Zap size={24} color="#6366f1" fill="#6366f1" />
                    <h2 style={{ fontSize: '28px', fontWeight: '900', margin: 0 }}>Smart AR Fitting Room</h2>
                </div>
                <p style={{ opacity: 0.7 }}>Align your face in the center of the frame</p>
            </div>

            <div style={containerStyle}>
                {loading && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', background: '#0f172a' }}>
                        <RefreshCw size={40} className="animate-spin" style={{ marginBottom: '20px' }} />
                        <p>Initializing AI Vision...</p>
                    </div>
                )}
                
                {error ? (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#f87171', padding: '40px', textAlign: 'center' }}>
                        <Camera size={48} style={{ marginBottom: '20px' }} />
                        <p>{error}</p>
                    </div>
                ) : (
                    <>
                        <video 
                            ref={videoRef} 
                            autoPlay 
                            playsInline 
                            style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} // Mirror mode
                        />
                        <canvas 
                            ref={canvasRef} 
                            width={640} 
                            height={480} 
                            style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
                        />
                        
                        {/* Scanning Guides */}
                        <div style={{ position: 'absolute', inset: '40px', border: '2px dashed rgba(99, 102, 241, 0.4)', borderRadius: '24px', pointerEvents: 'none' }}>
                            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '250px', height: '350px', border: '2px solid #6366f1', borderRadius: '150px 150px 100px 100px', opacity: 0.3 }}></div>
                        </div>
                    </>
                )}
            </div>

            <div style={{ marginTop: '40px', display: 'flex', gap: '20px' }}>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '15px 30px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '15px', color: 'white' }}>
                    <img src={product.thumbnail} alt="" style={{ width: '50px', height: '50px', objectFit: 'contain' }} />
                    <div>
                        <p style={{ margin: 0, fontSize: '12px', opacity: 0.6 }}>Now Trying</p>
                        <p style={{ margin: 0, fontWeight: '700' }}>{product.name}</p>
                    </div>
                </div>
            </div>

            <style>{`
                .animate-spin { animation: spin 1.5s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default VirtualTryOn;
