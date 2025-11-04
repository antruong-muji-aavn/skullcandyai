/**
 * Demo Backend Cleanup Script
 * 
 * Clears backend data to prepare for AI agent demonstration.
 * This will reset the product database to a minimal state for demo purposes.
 */

const https = require('https');

// API Configuration
const API_BASE_URL = 'devday-aavn-d5284e914439.herokuapp.com';
const API_PATH = '/api/products/batch';

/**
 * Clear backend products for demo
 * Keep only 3 placeholder products with obvious mock data
 */
function clearBackendForDemo() {
  // Demo products - minimal data for demo purposes
  const demoProducts = [
    { 
      id: 999,
      name: '[DEMO] Placeholder Product 1 - Needs Update',
      creator: { name: 'Mock Creator' },
      price: 0.01,
      image: 'https://res.cloudinary.com/dtes5pcfm/image/upload/v1760925713/samples/shoe.jpg'
    },
    { 
      id: 998,
      name: '[DEMO] Placeholder Product 2 - Needs Update', 
      creator: { name: 'Mock Creator' },
      price: 0.01,
      image: 'https://res.cloudinary.com/dtes5pcfm/image/upload/v1760925713/samples/shoe.jpg'
    },
    { 
      id: 997,
      name: '[DEMO] Placeholder Product 3 - Needs Update',
      creator: { name: 'Mock Creator' },
      price: 0.01,
      image: 'https://res.cloudinary.com/dtes5pcfm/image/upload/v1760925713/samples/shoe.jpg'
    }
  ];

  const updates = demoProducts.map(product => ({
    id: product.id,
    data: product
  }));

  const payload = JSON.stringify({ 
    action: 'clear_and_replace',
    updates 
  });

  const options = {
    hostname: API_BASE_URL,
    path: API_PATH,
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    }
  };

  console.log('🧹 Clearing backend data for AI agent demo...\n');
  console.log(`📊 Setting up ${demoProducts.length} placeholder products\n`);

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
          console.log('\n✅ Demo backend setup successful!\n');
          console.log('📋 Demo Products Ready:');
          console.log('─'.repeat(80));
          console.log('ID  | Name                                    | Status');
          console.log('─'.repeat(80));
          
          demoProducts.forEach(product => {
            const nameCol = product.name.padEnd(40);
            const idCol = String(product.id).padStart(3);
            console.log(`${idCol} | ${nameCol} | Ready for AI update`);
          });
          console.log('─'.repeat(80));
          console.log('\n🚀 Backend is now ready for AI agent demonstration!');
          console.log('   • Frontend uses mock data (3 items)');
          console.log('   • Backend has placeholder products');
          console.log('   • AI agent can update both via API calls');
        } else {
          console.log('\n❌ Demo setup failed!');
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
    console.log('\n💡 Note: Backend cleanup is optional for frontend demo');
    console.log('   The frontend will use mock data regardless');
  });

  req.write(payload);
  req.end();
}

// Run the demo setup
clearBackendForDemo();