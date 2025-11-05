import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import ProductCard from './ProductCard';
import { supabase } from '../integrations/supabase/client';

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
  description: string;
  eco_score: number;
  category: string;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const ProductGrid = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
      } else {
        setProducts(data || []);
      }
      setLoading(false);
    };

    // Subscribe to realtime changes
    const channel = supabase
      .channel('product_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products'
        },
        (payload) => {
          console.log('Change received!', payload);
          fetchProducts();
        }
      )
      .subscribe();

    fetchProducts();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const categories = ['all', ...new Set(products.map(p => p.category))];

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  return (
    <div className="min-h-screen px-6 py-12">
      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-6 scrollbar-hide">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`glass-card shrink-0 px-4 py-2 text-sm font-medium capitalize transition-all duration-300
                       ${selectedCategory === category 
                         ? 'bg-terra-500 text-white hover:bg-terra-600' 
                         : 'hover:text-terra-500'}`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        {loading ? (
          // Shimmer Loading States
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="glass-card aspect-[3/4] animate-shimmer" />
          ))
        ) : filteredProducts.length === 0 ? (
          // Empty State
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full flex flex-col items-center justify-center space-y-4 py-12 text-center"
          >
            <div className="text-terra-500">🌱</div>
            <h3 className="text-lg font-semibold">No Products Found</h3>
            <p className="text-sm text-muted-foreground">
              Try selecting a different category or check back later.
            </p>
          </motion.div>
        ) : (
          // Product Cards
          filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              name={product.name}
              price={product.price}
              imageUrl={product.image_url}
              description={product.description}
              ecoScore={product.eco_score}
              category={product.category}
            />
          ))
        )}
      </motion.div>
    </div>
  );
};

export default ProductGrid;