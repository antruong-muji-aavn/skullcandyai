/**
 * Demo Mock Data Update Script
 * 
 * Updates backend products with obviously fake/mock data while keeping real images.
 * This demonstrates that AI agent can later update with proper Figma context.
 */

const https = require('https');

// API Configuration
const API_BASE_URL = 'devday-aavn-d5284e914439.herokuapp.com';
const API_PATH = '/api/products/batch';

/**
 * Mock data for demo - obviously fake with mock shoe images
 * Only using existing product IDs (112 doesn't exist in backend)
 */
const mockProductUpdates = [
  { id: 100, name: '[MOCK] Generic Product #100', creator: 'MockCreator', price: 1.00 },
  { id: 101, name: '[MOCK] Generic Product #101', creator: 'MockCreator', price: 1.00 },
  { id: 102, name: '[MOCK] Generic Product #102', creator: 'MockCreator', price: 1.00 },
  { id: 103, name: '[MOCK] Generic Product #103', creator: 'MockCreator', price: 1.00 },
  { id: 104, name: '[MOCK] Generic Product #104', creator: 'MockCreator', price: 1.00 },
  { id: 105, name: '[MOCK] Generic Product #105', creator: 'MockCreator', price: 1.00 },
  { id: 106, name: '[MOCK] Generic Product #106', creator: 'MockCreator', price: 1.00 },
  { id: 107, name: '[MOCK] Generic Product #107', creator: 'MockCreator', price: 1.00 },
  { id: 108, name: '[MOCK] Generic Product #108', creator: 'MockCreator', price: 1.00 },
  { id: 109, name: '[MOCK] Generic Product #109', creator: 'MockCreator', price: 1.00 },
  { id: 110, name: '[MOCK] Generic Product #110', creator: 'MockCreator', price: 1.00 },
  { id: 111, name: '[MOCK] Generic Product #111', creator: 'MockCreator', price: 1.00 },
  // Note: Skipping 112 - doesn't exist in backend
  { id: 113, name: '[MOCK] Generic Product #113', creator: 'MockCreator', price: 1.00 },
  { id: 114, name: '[MOCK] Generic Product #114', creator: 'MockCreator', price: 1.00 },
  { id: 115, name: '[MOCK] Generic Product #115', creator: 'MockCreator', price: 1.00 },
  { id: 116, name: '[MOCK] Generic Product #116', creator: 'MockCreator', price: 1.00 },
  { id: 117, name: '[MOCK] Generic Product #117', creator: 'MockCreator', price: 1.00 },
  { id: 118, name: '[MOCK] Generic Product #118', creator: 'MockCreator', price: 1.00 },
  { id: 119, name: '[MOCK] Generic Product #119', creator: 'MockCreator', price: 1.00 },
  { id: 120, name: '[MOCK] Generic Product #120', creator: 'MockCreator', price: 1.00 },
  { id: 121, name: '[MOCK] Generic Product #121', creator: 'MockCreator', price: 1.00 },
  { id: 122, name: '[MOCK] Generic Product #122', creator: 'MockCreator', price: 1.00 },
  { id: 123, name: '[MOCK] Generic Product #123', creator: 'MockCreator', price: 1.00 }
];

/**
 * Update backend products with mock data
 */
function updateBackendWithMockData() {
  const updates = mockProductUpdates.map(product => ({
    id: product.id,
    data: {
      name: product.name,
      price: product.price,
      creator: {
        name: product.creator
      },
      // Using mock shoe image for ALL products to make demo obvious
      image: 'https://res.cloudinary.com/dtes5pcfm/image/upload/v1760925713/samples/shoe.jpg'
    }
  }));

  const payload = JSON.stringify({ updates });

  const options = {
    hostname: API_BASE_URL,
    path: API_PATH,
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    }
  };

  console.log('🎭 Updating backend with MOCK data for AI agent demo...\n');
  console.log(`📊 Total products to update: ${updates.length}`);
  console.log('🖼️  Setting ALL images to mock shoe image for obvious demo effect\n');

  const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log(`📊 Response Status: ${res.statusCode}`);
      
      try {
        const response = JSON.parse(data);
        
        if (res.statusCode === 200) {
          console.log('\n✅ Mock data update successful!\n');
          console.log('📋 Backend Products Now Show:');
          console.log('─'.repeat(80));
          console.log('ID  | Name                        | Creator      | Price');
          console.log('─'.repeat(80));
          
          mockProductUpdates.slice(0, 10).forEach(product => {
            const nameCol = product.name.padEnd(28);
            const creatorCol = product.creator.padEnd(12);
            const idCol = String(product.id).padStart(3);
            console.log(`${idCol} | ${nameCol} | ${creatorCol} | ${product.price} ETH`);
          });
          console.log('... (and 14 more with same pattern)');
          console.log('─'.repeat(80));
          
          console.log('\n🎯 DEMO READY:');
          console.log('   ✅ Backend has MOCK shoe images for all products');
          console.log('   ✅ Backend has generic mock names/creators/prices');
          console.log('   ✅ Frontend uses same mock shoe images (3 items only)');
          console.log('   ✅ AI agent can demonstrate complete transformation');
          console.log('   ✅ Audience will see dramatic before/after improvement');
          
          console.log('\n🚀 Next Steps for Demo:');
          console.log('   1. Show frontend with mock shoe data (3 items only)');
          console.log('   2. Show backend API - all products have same shoe image + generic names');
          console.log('   3. AI agent analyzes Figma and updates with proper images/names/data');
          console.log('   4. Demonstrate complete transformation - from mock to professional!');
          
        } else {
          console.log('\n❌ Mock data update failed!');
          console.log('Response:', JSON.stringify(response, null, 2));
        }
      } catch (error) {
        console.error('❌ Error parsing response:', error.message);
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Request failed:', error.message);
  });

  req.write(payload);
  req.end();
}

// Run the mock data update
updateBackendWithMockData();