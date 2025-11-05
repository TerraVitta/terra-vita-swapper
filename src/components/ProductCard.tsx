import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from './ui/card';

interface ProductCardProps {
  name: string;
  price: number;
  imageUrl: string;
  description: string;
  ecoScore: number;
  category: string;
}

const ProductCard = ({
  name,
  price,
  imageUrl,
  description,
  ecoScore,
  category,
}: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card className="glass-card overflow-hidden">
        <div className="relative aspect-square">
          <img
            src={imageUrl}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>
        
        <div className="relative space-y-3 p-6">
          {/* Category Tag */}
          <div className="eco-badge">
            {category}
          </div>
          
          {/* Title and Price */}
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-lg text-foreground group-hover:text-terra-500">
              {name}
            </h3>
            <p className="font-medium text-terra-600 dark:text-terra-400">
              ${price.toFixed(2)}
            </p>
          </div>
          
          {/* Eco Score */}
          <div className="flex items-center space-x-2">
            <div className="h-2 flex-1 rounded-full bg-nature-100 dark:bg-nature-900">
              <div
                className="h-full rounded-full bg-nature-500 transition-all duration-500"
                style={{ width: `${ecoScore * 10}%` }}
              />
            </div>
            <span className="text-sm font-medium text-nature-600 dark:text-nature-400">
              {ecoScore}/10
            </span>
          </div>
          
          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2">
            {description}
          </p>
          
          {/* Hover Actions */}
          <div 
            className={`absolute inset-x-0 bottom-0 flex items-center justify-center space-x-2 p-4 bg-background/80 backdrop-blur-sm
                       transition-all duration-300 ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}
          >
            <button className="glass-card px-4 py-2 text-sm font-medium text-foreground hover:text-terra-500">
              Add to Cart
            </button>
            <button className="glass-card px-4 py-2 text-sm font-medium text-foreground hover:text-terra-500">
              Learn More
            </button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default ProductCard;