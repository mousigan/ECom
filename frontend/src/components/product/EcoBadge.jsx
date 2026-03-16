import React from 'react';

const EcoBadge = ({ score }) => {
  const getEcoColor = (score) => {
    if (score >= 80) return '#10b981'; // Green
    if (score >= 50) return '#f97316'; // Orange
    return '#ef4444'; // Red
  };

  const badgeStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: getEcoColor(score),
    color: 'white',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '700',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s',
    cursor: 'default',
    userSelect: 'none'
  };

  return (
    <div style={badgeStyle} title={`Eco-Score: ${score}/100`}>
      <span style={{ fontSize: '10px' }}>ECO</span>
      <span>{score}</span>
    </div>
  );
};

export default EcoBadge;