'use client';

import { useState } from 'react';
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
  products?: any[]; // Optional for future use
}

export function HomeClient(_props: HomeClientProps) {
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

  // Use only frontend mock data for live demo

  return (
    <>
      <section id="products" className="px-container py-20">
        {/* NFT Grid with integrated header */}
        <div className="max-w-container mx-auto">
          <NFTGrid
            title="MONTHLY SKULL CANDIES"
            description="Discover one of the most cutest NFT creations created for you. Place your bid and be the first to have these treasures. All of the artworks are limited selections."
            gap="md"
          >
            {MOCK_PRODUCTS.map((product) => {
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
