'use client';

import { useState, useMemo } from 'react';
import { NFTGrid } from '@/components/nft-grid';
import { NFTCardClient } from '@/components/nft-card-client';
import { Snackbar } from '@/components/snackbar';

// Mock data for demo - only 3 items to show AI agent capabilities
const MOCK_PRODUCTS = [
  {
    id: 1,
    name: "[DEMO] Mock Shoe NFT #001",
    image: "https://res.cloudinary.com/dtes5pcfm/image/upload/v1760925713/samples/shoe.jpg",
    price: 1.25,
    rating: 4.5,
    tags: ["demo", "mock", "placeholder"]
  },
  {
    id: 2, 
    name: "[DEMO] Mock Shoe NFT #002",
    image: "https://res.cloudinary.com/dtes5pcfm/image/upload/v1760925713/samples/shoe.jpg",
    price: 2.50,
    rating: 4.2,
    tags: ["demo", "mock", "placeholder"]
  },
  {
    id: 3,
    name: "[DEMO] Mock Shoe NFT #003", 
    image: "https://res.cloudinary.com/dtes5pcfm/image/upload/v1760925713/samples/shoe.jpg",
    price: 0.99,
    rating: 3.8,
    tags: ["demo", "mock", "placeholder"]
  }
];

interface HomeClientProps {
  products?: any[]; // Backend products for demo comparison
}

export function HomeClient({ products: backendProducts = [] }: HomeClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [useBackendData, setUseBackendData] = useState(false);
  const [snackbar, setSnackbar] = useState({
    isOpen: false,
    message: '',
    type: 'info' as 'info' | 'success' | 'warning' | 'error',
  });

  // For demo: Remove cart functionality - just show message
  const handleBidNow = (product: typeof MOCK_PRODUCTS[0]) => {
    // Show demo message instead of adding to cart
    setSnackbar({
      isOpen: true,
      message: `[DEMO] Bidding on "${product.name}" - Cart feature will be implemented by AI agent later!`,
      type: 'info',
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, isOpen: false }));
  };

  // Choose data source for demo: frontend mock vs backend mock
  const currentProducts = useBackendData ? backendProducts : MOCK_PRODUCTS;

  // Filter products based on search query (case-insensitive, searches in name)
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) {
      return currentProducts;
    }
    
    const query = searchQuery.toLowerCase();
    return currentProducts.filter((product) => 
      product.name.toLowerCase().includes(query)
    );
  }, [currentProducts, searchQuery]);

  return (
    <>
      <section id="products" className="px-container py-20">
        {/* Demo Toggle - For presentation purposes */}
        <div className="max-w-container mx-auto mb-8">
          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={() => setUseBackendData(false)}
              className={`px-6 py-3 rounded-lg font-bold transition-all ${
                !useBackendData 
                  ? 'bg-primary-500 text-white' 
                  : 'bg-glass-light text-white/70 hover:bg-glass-dark'
              }`}
            >
              Frontend Mock Data (3 items)
            </button>
            <button
              onClick={() => setUseBackendData(true)}
              className={`px-6 py-3 rounded-lg font-bold transition-all ${
                useBackendData 
                  ? 'bg-primary-500 text-white' 
                  : 'bg-glass-light text-white/70 hover:bg-glass-dark'
              }`}
            >
              Backend Mock Data ({backendProducts.length} items)
            </button>
          </div>
          <div className="text-center text-sm text-white/70 mb-4">
            <strong>🎯 DEMO MODE:</strong> Both sources have mock data. AI agent will update both with real Figma content.
          </div>
        </div>

        {/* NFT Grid with integrated header (SectionHeading + SearchBar) */}
        <div className="max-w-container mx-auto">
          <NFTGrid
            title="MONTHLY SKULL CANDIES"
            description="Discover one of the most cutest NFT creations created for you. Place your bid and be the first to have these treasures. All of the artworks are limited selections."
            searchPlaceholder="Search NFTs by name..."
            gap="md"
            onSearchChange={setSearchQuery}
          >
            {filteredProducts.length === 0 && searchQuery && (
              <div className="col-span-full text-center py-12">
                <p className="text-xl font-family-body">
                  No NFTs found matching &ldquo;{searchQuery}&rdquo;
                </p>
                <p className="text-sm font-family-body opacity-70 mt-2">
                  Try a different search term
                </p>
              </div>
            )}
            
            {filteredProducts.length === 0 && !searchQuery && (
              <div className="col-span-full text-center py-12">
                <p className="text-xl font-family-body">No products available</p>
              </div>
            )}
            
            {filteredProducts.map((product) => {
              // Fixed countdown for demo
              const countdown = { hours: 2, minutes: 15, seconds: 30 };
              
              return (
                <NFTCardClient
                  key={product.id}
                  image={product.image}
                  imageAlt={`${product.name} NFT artwork`}
                  title={product.name}
                  author="Demo Creator [MOCK]"
                  verified={false}
                  countdown={countdown}
                  price={product.price.toFixed(2)}
                  currency="ETH"
                  currencyIcon="/ethereum-icon.svg"
                  buttonText="Bid now"
                  onButtonClick={() => handleBidNow(product)}
                />
              );
            })}
          </NFTGrid>
        </div>
      </section>

      {/* Cart Component - Removed for demo, will be implemented later */}
      {/* <Cart items={cartItems} onRemoveItem={handleRemoveFromCart} /> */}

      {/* Snackbar for notifications */}
      <Snackbar
        message={snackbar.message}
        type={snackbar.type}
        isOpen={snackbar.isOpen}
        onClose={handleCloseSnackbar}
        duration={3000}
      />
    </>
  );
}
