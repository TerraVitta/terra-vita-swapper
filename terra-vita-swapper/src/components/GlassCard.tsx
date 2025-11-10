import React from 'react';
import './glass.css';

interface GlassCardProps {
  title: string;
  description: string;
  imageUrl?: string;
}

const GlassCard: React.FC<GlassCardProps> = ({ title, description, imageUrl }) => {
  return (
    <div className="glass-card">
      {imageUrl && <img src={imageUrl} alt={title} className="glass-card-image" />}
      <h3 className="glass-card-title">{title}</h3>
      <p className="glass-card-description">{description}</p>
    </div>
  );
};

export default GlassCard;