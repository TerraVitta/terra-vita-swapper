import React from 'react';
import './styles/glass.css';

const featuresData = [
  {
    title: 'Seamless Swapping',
    description: 'Easily swap between different assets with minimal fees and instant transactions.',
  },
  {
    title: 'User-Friendly Interface',
    description: 'Navigate through our platform effortlessly with an intuitive design.',
  },
  {
    title: 'Advanced Security',
    description: 'Your assets are safe with our top-notch security protocols and practices.',
  },
  {
    title: 'Cross-Chain Compatibility',
    description: 'Swap assets across multiple blockchains without any hassle.',
  },
];

const Features: React.FC = () => {
  return (
    <section className="features-section">
      <h2 className="features-title">Key Features</h2>
      <div className="features-grid">
        {featuresData.map((feature, index) => (
          <div key={index} className="glass-card">
            <h3 className="feature-title">{feature.title}</h3>
            <p className="feature-description">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;