import React from 'react';
import { Navbar } from '@/components/navbar';
import { HeroSection } from '@/components/hero-section';
import { HomeClient } from './HomeClient';

// DEMO: Skip API calls - use mock data in components
// This demonstrates AI agent will later connect to real API
export default function Home() {

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
      <HomeClient />
    </div>
  );
}
