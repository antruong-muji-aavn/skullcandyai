# Sync Figma Products to Backend - Complete Data Migration

> **Purpose**: Extract all product data from Figma, download images, upload to CDN, and update backend database  
> **MCP Servers**: Figma MCP Server + SkullCandy MCP Server  
> **Target**: Sync 23 products from Figma to backend with CDN-hosted images

---

## 📋 Prerequisites

**Verify Figma Frame Selected**: "Monthly Collection" (Node ID: 121:6097)

**Required Tools**:
1. **Figma MCP Server** - Design context extraction
2. **Backend API** - `https://devday-aavn-d5284e914439.herokuapp.com/api/products`
3. **CDN Folder** - Create `skullcandydemo-2025-11-04/` for images

**Current Date**: 2025-11-04

---

## Phase 1: Extract All Product Data from Figma

### Step 1.1: Get Complete Design Context

```bash
# Extract all 23 products with metadata
mcp_figma-mcp-ser_get_design_context(
  nodeId="121:6097",
  clientLanguages="typescript",
  clientFrameworks="react"
)
```

**Extract from each product card**:
- Product Name (title)
- Author name
- Price (ETH value)
- Countdown timer
- Image node ID

### Step 1.2: Get Product List Metadata

```bash
# Get structural hierarchy to identify all product instances
mcp_figma-mcp-ser_get_metadata(
  nodeId="121:6103",  # Product List container
  clientLanguages="typescript",
  clientFrameworks="react"
)
```

**Expected Output**: 23 product instances with node IDs:
- Product 01: 121:6104
- Product 02: 121:6106
- Product 03: 121:6107
- Product 04: 196:1830
- Product 05: 121:6108
- Product 06: 121:6109
- Product 07: 121:6105
- Product 08: 121:6110
- Product 09: 121:6111
- Product 10: 121:6112
- Product 11: 121:6113
- Product 12: 121:6114
- Product 13: 610:1959
- Product 14: 196:1831
- Product 15: 610:1902
- Product 16: 121:6115
- Product 17: 610:1960
- Product 18: 610:1903
- Product 19: 632:2008
- Product 20: 196:1832
- Product 21: 610:1961
- Product 22: 610:1904
- Product 23: 632:2009

### Step 1.3: Extract Structured Product Data

**Parse Figma Output to JSON**:

```typescript
interface FigmaProduct {
  nodeId: string;
  name: string;        // From title text node
  author: string;      // From "By [Author]" text node
  price: number;       // From price text node (ETH value)
  imageNodeId: string; // Image container node ID
  countdown: {
    hours: number;
    minutes: number;
    seconds: number;
  };
}
```

**Example Parsing** (from get_design_context output):

```javascript
// Product 01 (Node: 121:6104)
{
  nodeId: "121:6104",
  name: "Cryptic Hacker",
  author: "CodeMaster",
  price: 3.75,
  imageNodeId: "I121:6104;31:2692",
  countdown: { hours: 4, minutes: 12, seconds: 34 }
}

// Product 02 (Node: 121:6106)
{
  nodeId: "121:6106",
  name: "Frosty Snow Queen",
  author: "WinterWhisper",
  price: 4.20,
  imageNodeId: "I121:6106;31:2692",
  countdown: { hours: 3, minutes: 45, seconds: 50 }
}

// ... repeat for all 23 products
```

---

## Phase 2: Download Product Images from Figma

**🚨 CRITICAL WARNING: NO SCREENSHOTS ALLOWED 🚨**

**FORBIDDEN METHODS**:
- ❌ `get_screenshot()` - DO NOT USE for image extraction
- ❌ Screenshot tools - DO NOT USE
- ❌ Image capture - DO NOT USE
- ❌ Render to image - DO NOT USE

**ONLY ALLOWED METHOD**:
- ✅ `get_design_context()` with asset extraction - Extract native Figma assets
- ✅ Direct asset download from `http://localhost:3000/figma-mcp/assets/[hash]`

**Reason**: Screenshots degrade image quality, add rendering artifacts, and do not provide the original assets stored in Figma. Always extract native image assets directly from Figma's storage.

---

### Step 2.1: Create Local Storage Directory

```bash
# Create dated folder for images
mkdir -p public/assets/products/skullcandydemo-2025-11-04
```

### Step 2.2: Find Image Nodes Within Each Product

**CRITICAL**: Images are nested deep inside product cards. You MUST navigate the node hierarchy to find the actual image node.

**For each product (1-23), follow this process**:

#### Step 2.2.1: Get Product Metadata to Find Image Node

```bash
# Example for Product 01 (Node: 121:6104)
mcp_figma-mcp-ser_get_metadata(
  nodeId="121:6104",  # Product card container
  clientLanguages="typescript",
  clientFrameworks="react"
)
```

**Expected Node Structure**:
```xml
<FRAME id="121:6104" name="Product 01">
  <FRAME id="121:6XXX" name="Image Container">
    <FRAME id="121:6YYY" name="Background">
      <IMAGE id="I121:6104;31:2692" name="product-image">
        <!-- THIS IS THE ACTUAL IMAGE NODE -->
      </IMAGE>
    </FRAME>
  </FRAME>
  <FRAME id="121:6ZZZ" name="Content">
    <!-- Text nodes for title, author, price -->
  </FRAME>
</FRAME>
```

**Image Node Search Strategy**:
1. Look for `<IMAGE>` or `<RECTANGLE>` with fill type "IMAGE"
2. Check for nodes with names like:
   - "product-image"
   - "Rectangle" (with image fill)
   - "Image" 
   - "Placeholder"
3. Image nodes typically start with "I" prefix (e.g., "I121:6104;31:2692")
4. Navigate through "Image Container", "Background", "Card" layers

#### Step 2.2.2: Extract Image Node ID

**Parse metadata XML to find image node**:

```javascript
// Look for patterns like:
// <IMAGE id="I121:6104;31:2692" name="Rectangle 6" />
// <RECTANGLE id="121:6XXX" name="image-bg" fills='[{"type":"IMAGE"}]' />

// Extract the ID - examples:
const imageNodeIds = {
  'Product 01 (121:6104)': 'I121:6104;31:2692',
  'Product 02 (121:6106)': 'I121:6106;31:2692',
  'Product 03 (121:6107)': 'I121:6107;31:2692',
  // ... continue for all products
};
```

**⚠️ FALLBACK: If Image Node Cannot Be Found**:

If metadata does not show clear IMAGE node:

```bash
# Try getting design context for the product card
mcp_figma-mcp-ser_get_design_context(
  nodeId="121:6104",
  clientLanguages="typescript",
  clientFrameworks="react"
)

# Look for <img> tags or image references in the output
# Example output might show:
# <img src="http://localhost:3000/figma-mcp/assets/abc123.png" />
```

**❌ CRITICAL: If No Image Found After Both Attempts**:

**STOP AND ASK USER**:
```
❌ Unable to locate image node for [Product Name] (Node: [nodeId])

The product card structure does not contain a clearly identifiable IMAGE node.

Please perform the following in Figma:
1. Open the Figma file: https://www.figma.com/design/V8UvDvpedWuc7biBBVPi7C/SkullCandy
2. Navigate to the "Monthly Collection" frame (Node: 121:6097)
3. Click directly on the PRODUCT IMAGE (not the card, but the actual image inside)
4. Once selected, the image node will be highlighted
5. Re-run this prompt - the agent will detect the selected node

Alternative: Manually provide the image node ID from Figma layers panel.
```

**DO NOT**:
- ❌ Skip the product
- ❌ Use placeholder images
- ❌ Guess the node ID
- ❌ Screenshot the entire product card (will include text/UI)

### Step 2.3: Extract Image Assets from Figma

**⚠️ CRITICAL RULE: NEVER USE SCREENSHOTS FOR IMAGE EXTRACTION**

**ONLY METHOD ALLOWED**: Extract images directly from Figma using the native asset extraction API. Screenshots will degrade quality and include unwanted rendering artifacts.

**For each product with confirmed image node ID**:

#### Step 2.3.1: Get Design Context with Assets (PREFERRED METHOD)

```bash
# Extract design context which includes native Figma asset URLs
mcp_figma-mcp-ser_get_design_context(
  nodeId="I121:6104;31:2692",  # Use the IMAGE node ID, not product card ID
  clientLanguages="typescript",
  clientFrameworks="react"
)
```

**Expected Output**: Design context will include image source from Figma MCP assets endpoint (localhost URL pointing to original Figma assets):

```tsx
// Example output from get_design_context:
<img 
  src="http://localhost:3000/figma-mcp/assets/abc123def456.png" 
  alt="product-image"
  width="400"
  height="400"
/>
```

**Why This Method?**
- ✅ **Original Quality**: Direct from Figma's image storage
- ✅ **Exact Assets**: Same files used in Figma design
- ✅ **No Artifacts**: No rendering or compression issues
- ✅ **Proper Format**: PNG/JPG as stored in Figma
- ❌ **NEVER Screenshot**: Loses quality, adds UI elements, wrong format

#### Step 2.3.2: Download Image from Assets Endpoint

**Extract the localhost asset URL from the output** and download it:

```bash
# For Product 01 - Extract asset URL from get_design_context output
# Example: http://localhost:3000/figma-mcp/assets/abc123def456.png

# Download using curl
curl -o public/assets/products/skullcandydemo-2025-11-04/product-01-cryptic-hacker.png \
  "http://localhost:3000/figma-mcp/assets/abc123def456.png"
```

**Automation Script** for batch downloading:

```javascript
// scripts/download-figma-assets.js
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const productImages = [
  {
    id: 1,
    name: 'cryptic-hacker',
    imageNodeId: 'I121:6104;31:2692',
    assetUrl: null  // Will be populated from get_design_context
  },
  // ... all 23 products
];

async function downloadAsset(assetUrl, outputPath) {
  try {
    const response = await fetch(assetUrl);
    if (!response.ok) {
      throw new Error(`Failed to download: ${response.statusText}`);
    }
    
    const buffer = await response.buffer();
    fs.writeFileSync(outputPath, buffer);
    
    console.log(`✅ Downloaded: ${path.basename(outputPath)}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to download ${outputPath}:`, error.message);
    return false;
  }
}

async function downloadAllImages() {
  const outputDir = 'public/assets/products/skullcandydemo-2025-11-04';
  
  for (const product of productImages) {
    if (!product.assetUrl) {
      console.log(`⚠️  Skipping ${product.name} - no asset URL`);
      continue;
    }
    
    const outputPath = path.join(outputDir, `product-${String(product.id).padStart(2, '0')}-${product.name}.png`);
    await downloadAsset(product.assetUrl, outputPath);
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

downloadAllImages();
```

#### Step 2.3.3: Manual Workflow (Per Product)

**For each of the 23 products, execute**:

1. **Get design context for image node**:
   ```bash
   mcp_figma-mcp-ser_get_design_context(
     nodeId="[IMAGE_NODE_ID]",
     clientLanguages="typescript",
     clientFrameworks="react"
   )
   ```

2. **Extract asset URL** from output (look for `src="http://localhost:3000/figma-mcp/assets/..."`):
   ```
   Example: http://localhost:3000/figma-mcp/assets/abc123def456.png
   ```

3. **Download using curl**:
   ```bash
   curl -o public/assets/products/skullcandydemo-2025-11-04/product-01-cryptic-hacker.png \
     "http://localhost:3000/figma-mcp/assets/abc123def456.png"
   ```

4. **Verify download**:
   ```bash
   file public/assets/products/skullcandydemo-2025-11-04/product-01-cryptic-hacker.png
   # Expected: PNG image data
   
   ls -lh public/assets/products/skullcandydemo-2025-11-04/product-01-cryptic-hacker.png
   # Expected: Size > 10KB
   ```

**Naming convention**: `product-[number]-[kebab-case-name].png`
- `product-01-cryptic-hacker.png`
- `product-02-frosty-snow-queen.png`
- `product-03-spooky-halloween-ghost.png`
- ... etc.

**Validation Per Image**:
```bash
# After each download, verify:
# 1. File exists
test -f public/assets/products/skullcandydemo-2025-11-04/product-01-cryptic-hacker.png && echo "✅ File exists"

# 2. File size > 10KB (not empty)
if [ $(stat -f%z public/assets/products/skullcandydemo-2025-11-04/product-01-cryptic-hacker.png) -gt 10240 ]; then
  echo "✅ File size valid"
fi

# 3. File is valid PNG
file public/assets/products/skullcandydemo-2025-11-04/product-01-cryptic-hacker.png
# Expected output: PNG image data, 400 x 400 (or similar dimensions)
```

### Step 2.4: Verify All Image Downloads

```bash
# List downloaded images
ls -la public/assets/products/skullcandydemo-2025-11-04/

# Expected: 23 PNG files
# Total size estimate: ~5-10MB

# Count files
find public/assets/products/skullcandydemo-2025-11-04/ -name "*.png" | wc -l
# Expected: 23

# Check for any corrupt/empty files
find public/assets/products/skullcandydemo-2025-11-04/ -name "*.png" -size -10k
# Expected: (empty output - no files under 10KB)
```

**If any images are missing or corrupt**:
1. Re-run Step 2.2 for that specific product
2. Try alternative image node IDs from metadata
3. If still failing, follow the "ASK USER" procedure above

---

## Phase 3: Upload Images to CDN

**✅ CREDENTIALS READY**: Cloudinary credentials are pre-configured in `scripts/upload-to-cdn.sh`

- **Cloud Name**: dtes5pcfm
- **API Key**: 279415635918263
- **Upload URL**: https://api.cloudinary.com/v1_1/dtes5pcfm/image/upload

### Step 3.1: Update Upload Script for New Products

**Modify `scripts/upload-to-cdn.sh` to use the new folder**:

```bash
replace_string_in_file(
  filePath="scripts/upload-to-cdn.sh",
  oldString='IMAGE_DIR="../public/assets/products"',
  newString='IMAGE_DIR="../public/assets/products/skullcandydemo-2025-11-04"'
)

replace_string_in_file(
  filePath="scripts/upload-to-cdn.sh",
  oldString='PRODUCT_IDS=(100 101 102 103 104 105 106 107 108 109 110 111 113 114 115 116 117 118 119 120 121 122 123)',
  newString='# Loop through all PNG files in directory instead of specific IDs'
)
```

**OR create a simplified version for the new products**:

```bash
#!/bin/bash

# Cloudinary credentials (already configured)
CLOUD_NAME="dtes5pcfm"
API_KEY="279415635918263"
API_SECRET="kTnO17uuq2PrP4FHSSnQ0J-dCBM"
UPLOAD_URL="https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload"

# New products folder
IMAGE_DIR="public/assets/products/skullcandydemo-2025-11-04"
CLOUDINARY_FOLDER="skullcandy-products"

echo "🚀 Starting CDN upload for Figma products..."

SUCCESS_COUNT=0
FAIL_COUNT=0

# Loop through all PNG files
for IMAGE_FILE in "$IMAGE_DIR"/*.png; do
  if [ ! -f "$IMAGE_FILE" ]; then
    echo "❌ No images found in $IMAGE_DIR"
    exit 1
  fi
  
  FILENAME=$(basename "$IMAGE_FILE" .png)
  echo "📦 Uploading: $FILENAME"
  
  # Generate timestamp and signature
  TIMESTAMP=$(date +%s)
  STRING_TO_SIGN="folder=${CLOUDINARY_FOLDER}&public_id=${FILENAME}&timestamp=${TIMESTAMP}${API_SECRET}"
  SIGNATURE=$(echo -n "$STRING_TO_SIGN" | openssl dgst -sha1 | sed 's/^.* //')
  
  # Upload to Cloudinary
  RESPONSE=$(curl -s -X POST "$UPLOAD_URL" \
    -F "file=@$IMAGE_FILE" \
    -F "api_key=$API_KEY" \
    -F "timestamp=$TIMESTAMP" \
    -F "public_id=$FILENAME" \
    -F "folder=$CLOUDINARY_FOLDER" \
    -F "signature=$SIGNATURE")
  
  # Parse response
  CLOUDINARY_URL=$(echo "$RESPONSE" | grep -o '"secure_url":"[^"]*' | sed 's/"secure_url":"//')
  
  if [ -n "$CLOUDINARY_URL" ]; then
    echo "✅ Success: $CLOUDINARY_URL"
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
  else
    echo "❌ Failed: $FILENAME"
    FAIL_COUNT=$((FAIL_COUNT + 1))
  fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ Upload complete!"
echo "✅ Successful: $SUCCESS_COUNT"
echo "❌ Failed: $FAIL_COUNT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
```

### Step 3.2: Execute Direct Upload (NO CONFIGURATION NEEDED)

```bash
# Upload all 23 product images to Cloudinary
run_in_terminal(
  command="cd scripts && bash upload-to-cdn.sh",
  explanation="Upload all 23 product images to Cloudinary CDN using pre-configured credentials",
  isBackground=false
)
```

**Expected CDN URLs Format**:
```
https://res.cloudinary.com/dtes5pcfm/image/upload/v1730707200/skullcandy-products/product-01-cryptic-hacker.png
https://res.cloudinary.com/dtes5pcfm/image/upload/v1730707200/skullcandy-products/product-02-frosty-snow-queen.png
... etc.
```

### Step 3.3: Extract CDN URLs from Upload Output

**Parse the upload script output** and extract all CDN URLs:

```javascript
// After upload completes, collect all CDN URLs
const cdnUrls = {
  "product-01-cryptic-hacker": "https://res.cloudinary.com/dtes5pcfm/image/upload/v1730707200/skullcandy-products/product-01-cryptic-hacker.png",
  "product-02-frosty-snow-queen": "https://res.cloudinary.com/dtes5pcfm/image/upload/v1730707200/skullcandy-products/product-02-frosty-snow-queen.png",
  // ... all 23 products
};

// Save to scripts/cdn-urls.json
fs.writeFileSync('scripts/cdn-urls.json', JSON.stringify(cdnUrls, null, 2));
```

**Expected Upload Output Per Image**:
```
📦 Uploading: product-01-cryptic-hacker
✅ Success: https://res.cloudinary.com/dtes5pcfm/image/upload/v1730707200/skullcandy-products/product-01-cryptic-hacker.png
```

**Verification**: All 23 images should upload successfully with `✅ Success` status

---

## Phase 4: Prepare Backend Update Payload

### Step 4.1: Structure Product Data for Backend

**Backend API Expected Format**:

```typescript
interface BackendProduct {
  id: number;           // Sequential ID (1-23)
  name: string;         // Product name from Figma
  image: string;        // CDN URL
  price: number;        // ETH price
  author?: string;      // Creator name
  rating?: number;      // Default to 4.5
  tags?: string[];      // Auto-generate from name
  createdAt?: string;   // ISO timestamp
  updatedAt?: string;   // ISO timestamp
}
```

### Step 4.2: Generate Complete Product Array

**File**: `scripts/update-entities.js`

```javascript
const products = [
  {
    id: 1,
    name: "Cryptic Hacker",
    image: "https://res.cloudinary.com/dtes5pcfm/image/upload/v1730707200/skullcandy/products/skullcandydemo-2025-11-04/product-01-cryptic-hacker.png",
    price: 3.75,
    author: "CodeMaster",
    rating: 4.5,
    tags: ["cryptic", "hacker", "technology", "cyberpunk"],
    createdAt: "2025-11-04T00:00:00Z",
    updatedAt: "2025-11-04T00:00:00Z"
  },
  {
    id: 2,
    name: "Frosty Snow Queen",
    image: "https://res.cloudinary.com/dtes5pcfm/image/upload/v1730707200/skullcandy/products/skullcandydemo-2025-11-04/product-02-frosty-snow-queen.png",
    price: 4.20,
    author: "WinterWhisper",
    rating: 4.3,
    tags: ["frosty", "snow", "queen", "winter"],
    createdAt: "2025-11-04T00:00:00Z",
    updatedAt: "2025-11-04T00:00:00Z"
  },
  {
    id: 3,
    name: "Spooky Halloween Ghost",
    image: "https://res.cloudinary.com/dtes5pcfm/image/upload/v1730707200/skullcandy/products/skullcandydemo-2025-11-04/product-03-spooky-halloween-ghost.png",
    price: 1.85,
    author: "PhantomArtist",
    rating: 4.1,
    tags: ["spooky", "halloween", "ghost", "scary"],
    createdAt: "2025-11-04T00:00:00Z",
    updatedAt: "2025-11-04T00:00:00Z"
  },
  // ... Continue for all 23 products with exact Figma data
];

module.exports = { products };
```

### Step 4.3: Auto-Generate Tags from Product Names

**Tag Generation Logic**:

```javascript
function generateTags(productName, author) {
  // Split name by spaces and convert to lowercase
  const nameTags = productName.toLowerCase().split(' ');
  
  // Extract theme from name
  const themes = {
    'hacker': ['technology', 'cyberpunk', 'digital'],
    'snow': ['winter', 'cold', 'ice'],
    'halloween': ['spooky', 'scary', 'festive'],
    'christmas': ['holiday', 'festive', 'winter'],
    'astronaut': ['space', 'cosmic', 'exploration'],
    // ... add more mappings
  };
  
  // Combine name tags + theme tags
  let tags = [...nameTags];
  for (const [key, themeList] of Object.entries(themes)) {
    if (productName.toLowerCase().includes(key)) {
      tags = [...tags, ...themeList];
    }
  }
  
  // Remove duplicates and limit to 5 tags
  return [...new Set(tags)].slice(0, 5);
}
```

---

## Phase 5: Update Backend Database

### Step 5.1: Read Backend API Documentation

```bash
# Check backend API structure
read_file("docs/api/backend-api.md")
```

### Step 5.2: Create Update Script

**File**: `scripts/sync-entity-data.js`

```javascript
const fetch = require('node-fetch');
const { products } = require('./update-entities');

const API_URL = 'https://devday-aavn-d5284e914439.herokuapp.com/api';

async function updateProducts() {
  console.log('Starting product sync...');
  console.log(`Total products to sync: ${products.length}`);
  
  try {
    // Option A: Bulk update (if API supports)
    const response = await fetch(`${API_URL}/products/bulk-update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_API_KEY' // If required
      },
      body: JSON.stringify({ products })
    });
    
    if (!response.ok) {
      throw new Error(`Bulk update failed: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('✅ Bulk update successful:', result);
    
  } catch (bulkError) {
    console.log('❌ Bulk update not supported, falling back to individual updates');
    
    // Option B: Individual updates
    for (const product of products) {
      try {
        const response = await fetch(`${API_URL}/products/${product.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(product)
        });
        
        if (response.ok) {
          console.log(`✅ Updated product ${product.id}: ${product.name}`);
        } else {
          console.log(`❌ Failed to update product ${product.id}: ${response.statusText}`);
        }
        
        // Rate limiting delay
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`❌ Error updating product ${product.id}:`, error.message);
      }
    }
  }
  
  console.log('Product sync complete!');
}

updateProducts();
```

### Step 5.3: Execute Backend Update

```bash
# Run sync script
run_in_terminal(
  command="node scripts/sync-entity-data.js",
  explanation="Update backend database with all 23 products from Figma",
  isBackground=false
)
```

**Expected Output**:
```
Starting product sync...
Total products to sync: 23
✅ Updated product 1: Cryptic Hacker
✅ Updated product 2: Frosty Snow Queen
✅ Updated product 3: Spooky Halloween Ghost
...
✅ Updated product 23: Forever Young Peter Pan
Product sync complete!
```

### Step 5.4: Verify Backend Data

```bash
# Fetch products from backend to verify
curl -X GET "https://devday-aavn-d5284e914439.herokuapp.com/api/products" \
  -H "Content-Type: application/json"
```

**Verification Checklist**:
- [ ] All 23 products returned
- [ ] Names match Figma exactly
- [ ] Images are CDN URLs (not placeholders)
- [ ] Prices match Figma data
- [ ] Authors match Figma data
- [ ] Tags are meaningful and relevant

---

## Phase 6: Test Frontend Integration

### Step 6.1: Verify Frontend Fetches Updated Data

```bash
# Check page.tsx fetches correctly
read_file("src/app/page.tsx")
```

**Ensure API call is correct**:
```typescript
async function getProducts() {
  const response = await fetch(
    'https://devday-aavn-d5284e914439.herokuapp.com/api/products',
    {
      next: { revalidate: 60 },
    }
  );
  
  if (!response.ok) {
    return [];
  }
  
  const data = await response.json();
  return data.data.products || [];
}
```

### Step 6.2: Start Dev Server and Test

```bash
# Start development server
run_in_terminal(
  command="pnpm dev",
  explanation="Start Next.js dev server to test product display",
  isBackground=true
)
```

**Manual Testing**:
1. Open http://localhost:3000
2. Verify 23 products display
3. Check all images load from CDN
4. Verify names match Figma
5. Verify prices match Figma
6. Test search functionality
7. Test cart with new products

### Step 6.3: Browser Console Verification

```javascript
// In browser console, check fetched data
fetch('https://devday-aavn-d5284e914439.herokuapp.com/api/products')
  .then(r => r.json())
  .then(data => {
    console.log('Total products:', data.data.products.length);
    console.log('Sample product:', data.data.products[0]);
    
    // Verify images are CDN URLs
    const invalidImages = data.data.products.filter(p => 
      !p.image.includes('cloudinary.com') || p.image.includes('placeholder')
    );
    
    if (invalidImages.length === 0) {
      console.log('✅ All images are CDN URLs');
    } else {
      console.log('❌ Some images are not CDN URLs:', invalidImages);
    }
  });
```

---

## Phase 7: Documentation and Cleanup

### Step 7.1: Update Changelog

**File**: `docs/changelogs/FIGMA_PRODUCTS_SYNC.md`

```markdown
# Figma Products Sync - Complete Data Migration

**Date**: 2025-11-04  
**Products Updated**: 23  
**CDN Folder**: skullcandydemo-2025-11-04

## Changes

### Data Migration
- Extracted all 23 product details from Figma "Monthly Collection" (121:6097)
- Downloaded high-resolution product images from Figma
- Uploaded images to Cloudinary CDN in dated folder
- Updated backend database with complete product data

### Product Details
| ID | Name | Price (ETH) | Author | Image |
|----|------|-------------|--------|-------|
| 1 | Cryptic Hacker | 3.75 | CodeMaster | ✅ CDN |
| 2 | Frosty Snow Queen | 4.20 | WinterWhisper | ✅ CDN |
| 3 | Spooky Halloween Ghost | 1.85 | PhantomArtist | ✅ CDN |
| ... | ... | ... | ... | ... |
| 23 | Forever Young Peter Pan | 3.60 | TimelessTales | ✅ CDN |

### Technical Details
- **Figma Node**: 121:6097 (Monthly Collection)
- **Image Format**: PNG, optimized
- **CDN Provider**: Cloudinary
- **Storage Path**: `skullcandy/products/skullcandydemo-2025-11-04/`
- **Backend API**: Updated via bulk/individual PUT requests

### Verification
- ✅ All 23 products display on frontend
- ✅ All images load from CDN (no 404s)
- ✅ Names match Figma exactly
- ✅ Prices match Figma exactly
- ✅ Authors match Figma exactly
- ✅ Search functionality works with new data
- ✅ Cart functionality works with new products

## Files Modified
- `scripts/update-entities.js` - Product data array
- `scripts/sync-entity-data.js` - Backend sync script
- `scripts/cdn-urls.json` - CDN URL mapping
- `public/assets/products/skullcandydemo-2025-11-04/` - 23 product images

## Next Steps
- Consider adding more metadata (descriptions, categories)
- Implement image optimization (WebP format)
- Add cache invalidation for updated products
```

### Step 7.2: Create Product Mapping Reference

**File**: `docs/mapping/figma-product-data.json`

```json
{
  "source": "Figma Monthly Collection (121:6097)",
  "syncDate": "2025-11-04",
  "totalProducts": 23,
  "cdnFolder": "skullcandydemo-2025-11-04",
  "products": [
    {
      "figmaNodeId": "121:6104",
      "backendId": 1,
      "name": "Cryptic Hacker",
      "author": "CodeMaster",
      "price": 3.75,
      "imageNodeId": "I121:6104;31:2692",
      "cdnUrl": "https://res.cloudinary.com/dtes5pcfm/image/upload/v1730707200/skullcandy/products/skullcandydemo-2025-11-04/product-01-cryptic-hacker.png"
    }
    // ... all 23 products
  ]
}
```

### Step 7.3: Commit Changes

```bash
git add .
git commit -m "Sync Figma products to backend with CDN images

- Extracted 23 products from Figma Monthly Collection (121:6097)
- Downloaded and uploaded all product images to Cloudinary
- Created dated CDN folder: skullcandydemo-2025-11-04
- Updated backend database with complete product data
- Verified frontend displays all products with CDN images
- Names, prices, and authors match Figma exactly

Backend API: 3 mock products → 23 real products
Images: Placeholder URLs → Cloudinary CDN URLs
Data Source: Frontend mocks → Figma design system"
```

---

## Complete Product List (Reference)

**All 23 Products from Figma**:

1. **Cryptic Hacker** - 3.75 ETH - By CodeMaster
2. **Frosty Snow Queen** - 4.20 ETH - By WinterWhisper
3. **Spooky Halloween Ghost** - 1.85 ETH - By PhantomArtist
4. **Lunar Moon Queen** - 2.90 ETH - By CelestialDream
5. **Jolly Christmas Elf** - 2.20 ETH - By HolidayJoy
6. **Galactic Astronaut** - 3.00 ETH - By SpaceExplorer
7. **Rustic Farmer** - 1.50 ETH - By EarthBound
8. **Athletic Tennis Girl** - 2.75 ETH - By SportyStyle
9. **Grapevine Wine Monster** - 2.00 ETH - By VinoVibes
10. **Regal Rose Lord** - 3.50 ETH - By FloralMajesty
11. **Skateboard Boy** - 1.95 ETH - By UrbanMotion
12. **Oceanic Sea Princess** - 3.35 ETH - By AquaDreamer
13. **Mountain Angel Goat** - 4.00 ETH - By DreamyAnimals
14. **Joyful Ice Cream Lover** - 2.99 ETH - By SweetTreats
15. **Elegant White Swan** - 3.50 ETH - By NatureArt
16. **Daring Pilot Captain** - 4.00 ETH - By SkyNavigator
17. **Quick Brown Squirrel** - 2.50 ETH - By ForestFriends
18. **Cheerful Firefly Kid** - 2.20 ETH - By HappyKids
19. **Adventure Camping Boy** - 2.85 ETH - By OutdoorExplorer
20. **Charming Valentine Cupid** - 3.60 ETH - By LoveArtisan
21. **Dreamy Purple Baby** - 3.75 ETH - By ChildOfImagination
22. **Wandering Butterfly** - 1.75 ETH - By FlutterArt
23. **Forever Young Peter Pan** - 3.60 ETH - By TimelessTales

---

## Success Criteria Checklist

### Data Extraction
- [ ] All 23 product names extracted from Figma
- [ ] All author names extracted correctly
- [ ] All prices (ETH) extracted correctly
- [ ] Image node IDs identified for each product

### Image Processing
- [ ] ✅ **VERIFIED**: All images extracted using `get_design_context()` asset URLs (NO screenshots)
- [ ] ✅ **VERIFIED**: All asset URLs are from `http://localhost:3000/figma-mcp/assets/[hash]`
- [ ] 23 images downloaded from Figma native assets (PNG format)
- [ ] Images saved to `public/assets/products/skullcandydemo-2025-11-04/`
- [ ] All downloaded images are original quality (not screenshots)
- [ ] Images uploaded to Cloudinary CDN
- [ ] CDN URLs generated for all 23 images

### Backend Update
- [ ] Backend API updated with all 23 products
- [ ] Product IDs sequential (1-23)
- [ ] All names match Figma exactly
- [ ] All prices match Figma exactly
- [ ] All authors match Figma exactly
- [ ] All images use CDN URLs (no placeholders)
- [ ] Tags auto-generated for each product

### Frontend Verification
- [ ] Frontend fetches 23 products (not 3)
- [ ] All product cards display correctly
- [ ] All images load without errors
- [ ] Search functionality works
- [ ] Cart functionality works
- [ ] No console errors

### Documentation
- [ ] Changelog created with full details
- [ ] Product mapping JSON created
- [ ] CDN URL mapping file created
- [ ] Git commit with descriptive message

---

## Troubleshooting

### Issue: Image Node IDs Not Found
**Solution**: Use `get_metadata` to find exact image node IDs within each product card instance.

### Issue: Asset URL Not Found in get_design_context Output
**Solution**: 
1. Verify you're calling `get_design_context` on the IMAGE node ID (starts with "I"), not the product card container
2. Look for `<img src="http://localhost:3000/figma-mcp/assets/...">` in the output
3. If still not found, check if the image node has actual image fills (not just placeholder)
4. **NEVER fallback to screenshot** - ask user to re-select the correct image node

### Issue: Asset Download Returns 404
**Solution**:
1. Verify Figma MCP Server is running on `http://localhost:3000`
2. Check that the asset hash in the URL is correct (from get_design_context output)
3. Try accessing the URL directly in browser to test connectivity
4. Restart Figma MCP Server if needed

### Issue: CDN Upload Fails
**Solution**: 
1. Check Cloudinary credentials in environment variables
2. Verify image file sizes (should be <5MB each)
3. Try individual uploads instead of batch

### Issue: Backend API Returns 401/403
**Solution**: Check if API requires authentication token. Add to headers if needed.

### Issue: Images Don't Display on Frontend
**Solution**:
1. Verify CDN URLs are publicly accessible (test in browser)
2. Check CORS settings on Cloudinary
3. Verify image URLs in backend response

### Issue: Product Count Mismatch
**Solution**: Re-run `get_metadata` on Product List (121:6103) to get exact count and node IDs.

---

**End of Prompt** ✅

**Execution Time Estimate**: 30-45 minutes for complete sync
