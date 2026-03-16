import React from 'react';

const Footer = () => {
    const footerStyle = {
        background: '#ffffff',
        borderTop: '1px solid #e5e7eb',
        padding: '30px 50px',
        marginTop: 'auto',
        textAlign: 'center',
        color: '#9ca3af',
        fontSize: '14px',
    };

    return (
        <footer style={footerStyle}>
            &copy; {new Date().getFullYear()} ECOM PRO · Premium E-commerce Platform · Built with React & Spring Boot
        </footer>
    );
};

export default Footer;
