import React, { useState, useEffect, useRef } from 'react';
import { Bot, Mic, Send, X, ShoppingCart, Zap, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../../api/axiosConfig';

const SmartAssistant = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', text: 'Hey! I am your Smart Shopping Assistant. Say "Order this" or "Buy Laptop" to start!', type: 'text' }
    ]);
    const [isListening, setIsListening] = useState(false);
    const [input, setInput] = useState('');
    const [pendingAction, setPendingAction] = useState(null);
    const [isWaitingForAddress, setIsWaitingForAddress] = useState(false);
    const chatEndRef = useRef(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const speakResponse = (text) => {
        if (!window.speechSynthesis) return;
        // Stop any current speech
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.1;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        utterance.lang = navigator.language || 'en-US';
        
        window.speechSynthesis.speak(utterance);
    };

    const addMessage = (text, role, type = 'text', data = null) => {
        setMessages(prev => [...prev, { text, role, type, data }]);
        if (role === 'assistant' && type === 'text') {
            speakResponse(text);
        }
    };

    const handleAction = async (command) => {
        const cmd = command.toLowerCase().trim();

        // Check if we are waiting for an address
        if (isWaitingForAddress) {
            addMessage(command, 'user');
            localStorage.setItem('assistant_saved_address', command);
            setIsWaitingForAddress(false);
            proceedToCheckout(pendingAction);
            return;
        }

        // Check for confirmation
        if (pendingAction && (cmd.includes('yes') || cmd.includes('confirm') || cmd.includes('do it') || cmd === 'y')) {
            addMessage("Confirming...", 'user');
            
            try {
                // 1. Check Saved Addresses
                const addRes = await axiosInstance.get(`/auth/${user.id}/addresses`);
                let lastAddress = addRes.data.length > 0 ? addRes.data[addRes.data.length - 1].streetAddress : null;

                // 2. Fallback: Check Order History if no saved address
                if (!lastAddress) {
                    const orderRes = await axiosInstance.get(`/orders/${user.id}`);
                    const orders = orderRes.data;
                    if (orders && orders.length > 0) {
                        lastAddress = orders[0].shippingAddress;
                    }
                }

                if (lastAddress) {
                    addMessage(`Aha! I found your previous address: ${lastAddress}. Proceed with this?`, 'assistant');
                    localStorage.setItem('assistant_saved_address', lastAddress);
                    proceedToCheckout(pendingAction);
                } else {
                    addMessage("I couldn't find a saved address for you. Where should I deliver this? Please type it below!", 'assistant');
                    setIsWaitingForAddress(true);
                }
            } catch (e) {
                console.error("Address Recovery Error:", e);
                addMessage("Where should I deliver this? Please type your address below.", 'assistant');
                setIsWaitingForAddress(true);
            }
            return;
        } else if (pendingAction && (cmd.includes('no') || cmd.includes('cancel') || cmd.includes('stop') || cmd === 'n')) {
            addMessage("No problem, order cancelled.", 'assistant');
            setPendingAction(null);
            return;
        }
        
        // 0. Authorization Intents
        if (cmd.includes('logout') || cmd.includes('log out') || cmd.includes('signout') || cmd.includes('sign out')) {
            if (!isAuthenticated) {
                addMessage("You are not even logged in right now!", 'assistant');
                return;
            }
            addMessage("Logging you out... See you later!", 'assistant');
            setTimeout(() => {
                logout();
                navigate('/');
                setIsOpen(false);
            }, 1500);
            return;
        }

        // 1. Navigation & Category Redirects
        if (cmd.includes('go to') || cmd.includes('show') || cmd.includes('open') || cmd.includes('browse')) {
            // Check for specific pages
            if (cmd.includes('home')) { navigate('/'); addMessage("Taking you home.", 'assistant'); return; }
            if (cmd.includes('cart')) { navigate('/cart'); addMessage("Opening your cart.", 'assistant'); return; }
            if (cmd.includes('profile') || cmd.includes('history') || cmd.includes('order')) { navigate('/profile'); addMessage("Opening your history.", 'assistant'); return; }
            
            // Check for category-specific navigation
            try {
                const catRes = await axiosInstance.get('/products/categories');
                const cats = catRes.data;
                const targetCat = cats.find(c => cmd.includes(c.name.toLowerCase()) || cmd.includes(c.slug.toLowerCase()));
                
                if (targetCat) {
                    addMessage(`Sure! Heading over to the ${targetCat.name} section.`, 'assistant');
                    setTimeout(() => {
                        navigate(`/catalog?category=${targetCat.slug}`);
                        setIsOpen(false);
                    }, 1000);
                    return;
                }
            } catch (e) {
                console.error("Bot Category Sync Error:", e);
            }

            if (cmd.includes('marketplace') || cmd.includes('shop') || cmd.includes('catalog') || cmd.includes('everything')) { 
                navigate('/catalog'); 
                addMessage("Heading to the shop.", 'assistant'); 
                return; 
            }
        }

        // 2. Buy/Order/Search Intents
        const buyKeywords = ['buy', 'order', 'purchase', 'want', 'get', 'search', 'find', 'look for'];
        
        let finalSearch = cmd;
        buyKeywords.forEach(k => {
            if (finalSearch.startsWith(k + ' ')) {
                finalSearch = finalSearch.replace(k + ' ', '').trim();
            }
        });

        // 🧠 Context Sensitivity: Handle "it" or "this"
        if (finalSearch === 'this' || finalSearch === 'it' || finalSearch === 'the product' || finalSearch === 'this product' || finalSearch === 'order this' || finalSearch === 'buy this') {
            const productMatch = location.pathname.match(/\/product\/(\d+)/);
            if (productMatch) {
                const productId = productMatch[1];
                addMessage("Got it! You're looking at this product. Preparing your order...", 'assistant');
                try {
                    const res = await axiosInstance.get(`/products/${productId}/details`);
                    const productInfo = res.data.product;
                    const productData = {
                        id: productInfo.id,
                        name: productInfo.name,
                        price: productInfo.price,
                        thumbnail: productInfo.thumbnail
                    };
                    setPendingAction(productData);
                    addMessage(`I've found the ${productData.name}. Should I proceed with the order?`, 'assistant');
                } catch (e) {
                    addMessage("I'm having trouble identifying this product. Try using its name?", 'assistant');
                }
                return;
            } else {
                addMessage("I'm not sure which product you mean. Try 'Buy Laptop' or 'Order Shoes'!", 'assistant');
                return;
            }
        }

        // Deep Cleanup for "category" and "section" words
        finalSearch = finalSearch.replace('category', '').replace('section', '').replace('department', '').trim();

        const stem = (word) => {
            if (word.endsWith('ies')) return word.slice(0, -3) + 'y';
            if (word.endsWith('es')) return word.slice(0, -2);
            if (word.endsWith('s')) return word.slice(0, -1);
            return word;
        };

        if (finalSearch.length > 1) {
            const adjustedSearch = stem(finalSearch);
            addMessage(`Checking our catalog for "${finalSearch}"...`, 'assistant');
            
            const performSearch = async (term) => {
                const res = await axiosInstance.get(`/products/marketplace?search=${term}`);
                return res.data;
            };

            try {
                let matches = await performSearch(adjustedSearch);
                
                // If stemming failed, try the raw command
                if (matches.length === 0 && adjustedSearch !== finalSearch) {
                    matches = await performSearch(finalSearch);
                }

                if (matches.length > 1) {
                    addMessage(`I found ${matches.length} results. Which one appeals to you?`, 'assistant', 'choice', matches);
                } else if (matches.length === 1) {
                    const bestItem = matches[0];
                    setPendingAction(bestItem);
                    addMessage(`I found a ${bestItem.name} for ₹${bestItem.price}. Should I start the order?`, 'assistant');
                } else {
                    const catRes = await axiosInstance.get('/products/categories');
                    const cats = catRes.data;
                    if (cats.length > 0) {
                        addMessage(`I couldn't find any "${finalSearch}". We do have items in: ${cats.map(c => c.name).slice(0, 3).join(', ')}. Or would you like to see all products?`, 'assistant');
                    } else {
                        addMessage(`I couldn't find any "${finalSearch}". Try a different keyword like 'Mobile' or 'Glass'.`, 'assistant');
                    }
                }
            } catch (e) {
                addMessage("I'm having trouble searching right now. Try again later!", 'assistant');
            }
            return;
        }

        addMessage("I'm not sure how to help. Try saying 'Buy Laptop' or 'Show Mobiles'!", 'assistant');
    };

    const handleChoice = (product) => {
        setPendingAction(product);
        addMessage(`Okay, ${product.name}. Confirm to place the order?`, 'assistant');
    };

    const proceedToCheckout = async (product) => {
        if (!isAuthenticated) {
            addMessage("Please login first to place an order!", 'assistant');
            navigate('/login');
            return;
        }

        try {
            // Fetch detailed prices and vendor info
            const pRes = await axiosInstance.get(`/products/${product.id}/details`);
            const { vendors } = pRes.data;

            if (!vendors || vendors.length === 0) {
                addMessage("This product is currently not available.", 'assistant');
                return;
            }

            const bestOffer = vendors.find(v => v.stock > 0) || vendors[0];
            const address = localStorage.getItem('assistant_saved_address');

            // Setup Checkout State for /checkout page
            const items = [{
                ...product,
                quantity: 1,
                vendorId: bestOffer.vendorId,
                vendorName: bestOffer.vendorName,
                price: bestOffer.sellingPrice
            }];

            localStorage.setItem('checkout_pending_cart', JSON.stringify(items));
            localStorage.setItem('checkout_pending_total', bestOffer.sellingPrice.toString());
            localStorage.setItem('checkout_pending_address', address || "");
            localStorage.setItem('checkout_is_ai', 'true');
            
            addMessage("Setting up your secure checkout...", 'assistant');
            
            setTimeout(() => {
                navigate('/checkout');
                setIsOpen(false);
                setPendingAction(null);
            }, 1500);

        } catch (error) {
            console.error('Checkout Error:', error);
            addMessage("I couldn't prepare your checkout. Try again in a moment.", 'assistant');
        }
    };

    const handleVoice = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            addMessage("Voice not supported in this browser. Please use Chrome or Edge.", 'assistant');
            return;
        }

        try {
            const recognition = new SpeechRecognition();
            recognition.lang = navigator.language || 'en-US';
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;

            recognition.onstart = () => setIsListening(true);
            recognition.onend = () => setIsListening(false);
            
            recognition.onerror = (event) => {
                console.error("Speech Recognition Error:", event.error);
                setIsListening(false);
                if (event.error === 'not-allowed') {
                    addMessage("Microphone access denied. Please enable it in your browser settings.", 'assistant');
                } else {
                    addMessage("I couldn't hear you clearly. Could you try again?", 'assistant');
                }
            };

            recognition.onresult = (e) => {
                const transcript = e.results[0][0].transcript;
                if (transcript) {
                    addMessage(transcript, 'user');
                    handleAction(transcript);
                }
            };

            recognition.start();
        } catch (err) {
            console.error("Speech Start Error:", err);
            setIsListening(false);
        }
    };

    const bubbleStyle = {
        position: 'fixed', bottom: '30px', right: '30px',
        width: '60px', height: '60px', borderRadius: '50%',
        background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', boxShadow: '0 10px 25px rgba(99, 102, 241, 0.4)',
        zIndex: 2000, transition: 'transform 0.3s ease',
        transform: isOpen ? 'scale(0) rotate(90deg)' : 'scale(1) rotate(0deg)'
    };

    const chatStyle = {
        position: 'fixed', bottom: '100px', right: '30px',
        width: '380px', height: '500px', background: 'white',
        borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
        zIndex: 2000, display: isOpen ? 'flex' : 'none', flexDirection: 'column',
        overflow: 'hidden', border: '1px solid #f1f5f9',
        animation: 'slideIn 0.3s ease'
    };

    return (
        <>
            <div style={bubbleStyle} onClick={() => setIsOpen(true)}>
                <Bot color="white" size={30} />
            </div>

            <div style={chatStyle}>
                {/* Header */}
                <div style={{ background: 'linear-gradient(to right, #6366f1, #ec4899)', padding: '20px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Zap size={18} fill="white" />
                        <span style={{ fontWeight: '800' }}>Smart Shopper Bot</span>
                    </div>
                    <X size={20} style={{ cursor: 'pointer' }} onClick={() => setIsOpen(false)} />
                </div>

                {/* Messages */}
                <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px', background: '#f8fafc' }}>
                    {messages.map((m, i) => (
                        <div key={i} style={{ 
                            alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                            maxWidth: '85%',
                            padding: '12px 16px',
                            borderRadius: m.role === 'user' ? '16px 16px 0 16px' : '16px 16px 16px 0',
                            background: m.role === 'user' ? '#6366f1' : 'white',
                            color: m.role === 'user' ? 'white' : '#1e293b',
                            fontSize: '14px',
                            fontWeight: '500',
                            boxShadow: m.role === 'user' ? 'none' : '0 2px 8px rgba(0,0,0,0.05)',
                            border: m.role === 'user' ? 'none' : '1px solid #e2e8f0'
                        }}>
                            {m.text}
                            {m.type === 'choice' && m.data && (
                                <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {m.data.slice(0, 3).map((item, idx) => (
                                        <div 
                                            key={idx} 
                                            onClick={() => handleChoice(item)}
                                            style={{ padding: '8px', background: '#f1f5f9', borderRadius: '8px', cursor: 'pointer', border: '1px solid #e2e8f0', fontSize: '12px' }}
                                        >
                                            🛍️ {item.name} - ₹{item.price}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                    <div ref={chatEndRef} />
                </div>

                {/* Input Area */}
                <div style={{ padding: '20px', background: 'white', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <button 
                        onClick={handleVoice}
                        style={{ 
                            padding: '10px', borderRadius: '50%', border: 'none', 
                            background: isListening ? '#ef4444' : '#f1f5f9',
                            animation: isListening ? 'pulse 1.5s infinite' : 'none',
                            cursor: 'pointer'
                        }}
                    >
                        <Mic size={20} color={isListening ? 'white' : '#6366f1'} />
                    </button>
                    <input 
                        type="text" 
                        placeholder="Ask me anything..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (addMessage(input, 'user'), handleAction(input), setInput(''))}
                        style={{ flex: 1, padding: '10px 15px', borderRadius: '12px', border: '1.5px solid #e2e8f0', fontSize: '14px', outline: 'none' }}
                    />
                    <button 
                        onClick={() => { if(input) { addMessage(input, 'user'); handleAction(input); setInput(''); }}}
                        style={{ background: '#6366f1', color: 'white', border: 'none', borderRadius: '10px', padding: '10px', cursor: 'pointer' }}
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes slideIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes pulse {
                    0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
                    70% { transform: scale(1.1); box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
                    100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
                }
            `}</style>
        </>
    );
};

export default SmartAssistant;
