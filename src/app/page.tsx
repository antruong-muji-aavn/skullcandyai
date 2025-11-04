import React from 'react';
import { Navbar } from '@/components/navbar';
import { HeroSection } from '@/components/hero-section';
import { HomeClient } from './HomeClient';

// DEMO: Fetch backend data to show it also has mock data
// This demonstrates AI agent will update both frontend and backend
async function getProducts() {
  try {
    const response = await fetch('https://devday-aavn-d5284e914439.herokuapp.com/api/products', {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch products: ${response.statusText}`);
      return [];
    }

    const data = await response.json();
    return data.data.products || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export default async function Home() {
  // Get backend products for demo (they now have mock data too)
  const backendProducts = await getProducts();

  return (
    <div className="min-h-screen relative text-white">
      {/* Background - Exact linear gradient from Figma */}
      <div 
        className="fixed inset-0 -z-10" 
        style={{
          background: 'linear-gradient(119deg, #094DF7 11.35%, rgba(165, 190, 249, 0.90) 54.74%, rgba(82, 100, 250, 0.90) 101.78%)'
        }}
      />

      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <HeroSection
        title="Discover, find, and sell Skull Candy NFT"
        description="The world's first and unlimited digital marketplace for Skull Candy tokens"
        ctaLabel="Explore"
      />

      {/* Monthly Collection Section with Live Search */}
      <HomeClient products={backendProducts} />
    </div>
  );
}
