// 🔍 PRODUCT DIAGNOSTIC SCRIPT
// Copy and paste this into your browser console on the collection page

console.log('========================================');
console.log('🔍 DIAGNOSING PRODUCT CARDS');
console.log('========================================\n');

// Step 1: Check different selectors
console.log('📋 Step 1: Checking different selectors...\n');

const selectors = {
  'Product cards (.card)': '.card',
  'Product cards (.product-card)': '.product-card',
  'Grid items (.grid__item)': '.grid__item',
  'Articles': 'article',
  'Has data-product-id': '[data-product-id]',
  'Has data-product-handle': '[data-product-handle]',
  'Class contains "product"': '[class*="product"]'
};

let bestSelector = null;
let maxCount = 0;

Object.entries(selectors).forEach(([name, selector]) => {
  const elements = document.querySelectorAll(selector);
  console.log(`${name}: ${elements.length} found`);
  
  if (elements.length > maxCount && elements.length < 50) {
    maxCount = elements.length;
    bestSelector = selector;
  }
});

console.log(`\n✅ Best selector appears to be: ${bestSelector} (${maxCount} elements)\n`);

// Step 2: Inspect first product
console.log('========================================');
console.log('📦 Step 2: Inspecting first product...\n');

const products = document.querySelectorAll(bestSelector);
if (products.length > 0) {
  const firstProduct = products[0];
  
  console.log('First product element:', firstProduct);
  console.log('\n📊 Attributes:');
  console.log('  - Class:', firstProduct.className);
  console.log('  - data-product-id:', firstProduct.dataset.productId || '❌ NOT FOUND');
  console.log('  - data-product-handle:', firstProduct.dataset.productHandle || '❌ NOT FOUND');
  
  // Check for product link
  const productLink = firstProduct.querySelector('a[href*="/products/"]');
  if (productLink) {
    const href = productLink.getAttribute('href');
    console.log('  - Product URL:', href);
    
    const match = href.match(/\/products\/([^?#/]+)/);
    if (match) {
      console.log('  - Product Handle:', match[1]);
    }
  } else {
    console.log('  - Product URL: ❌ NOT FOUND');
  }
  
  // Check for price element
  const priceEl = firstProduct.querySelector('[data-price], .price');
  if (priceEl) {
    console.log('  - Has price element: ✅ YES');
  }
  
  // Check for form
  const form = firstProduct.querySelector('form[action*="/cart/add"]');
  if (form) {
    const variantInput = form.querySelector('input[name="id"]');
    if (variantInput) {
      console.log('  - Variant ID:', variantInput.value);
    }
  }
  
} else {
  console.log('❌ No products found with best selector!');
}

// Step 3: Check window.Shopify
console.log('\n========================================');
console.log('🏪 Step 3: Checking Shopify data...\n');

if (window.Shopify && window.Shopify.products) {
  console.log('✅ Shopify.products available');
  console.log('Products:', window.Shopify.products);
}

// Step 4: Provide fix
console.log('\n========================================');
console.log('🔧 Step 4: FIX RECOMMENDATION');
console.log('========================================\n');

if (products.length > 0) {
  const firstProduct = products[0];
  const hasId = !!firstProduct.dataset.productId;
  
  if (hasId) {
    console.log('✅ Products already have data-product-id!');
    console.log('The filter should work. Check if product IDs in database match these IDs.');
  } else {
    console.log('❌ Products are missing data-product-id attribute');
    console.log('\n📝 TO FIX:');
    console.log('1. Go to Themes → Edit code');
    console.log('2. Find: snippets/card-product.liquid');
    console.log(`3. Add to the main wrapper: data-product-id="{{ product.id }}"`);
    console.log(`\nThe wrapper selector is: ${bestSelector}`);
    console.log('\nExample:');
    console.log(`<div class="${firstProduct.className}" data-product-id="{{ product.id }}">`);
    
    console.log('\n🚀 QUICK FIX: Run this function to add IDs now:');
    console.log('addProductIds()');
    
    // Create quick fix function
    window.addProductIds = function() {
      console.log('🔧 Adding product IDs...');
      
      products.forEach((product, index) => {
        const link = product.querySelector('a[href*="/products/"]');
        if (link) {
          const href = link.getAttribute('href');
          const match = href.match(/\/products\/([^?#/]+)/);
          if (match) {
            const handle = match[1];
            product.dataset.productHandle = handle;
            
            // Try to fetch product data
            fetch(`/products/${handle}.js`)
              .then(r => r.json())
              .then(data => {
                product.dataset.productId = data.id;
                console.log(`✅ Product ${index + 1}: ID ${data.id} (${data.title})`);
                
                // Re-trigger filter if all done
                if (index === products.length - 1) {
                  console.log('✅ All IDs added! Reloading filters...');
                  if (typeof loadFiltersData === 'function') {
                    loadFiltersData();
                  }
                }
              })
              .catch(err => console.error(`❌ Failed to get ID for ${handle}:`, err));
          }
        }
      });
    };
  }
} else {
  console.log('❌ Could not find product elements');
  console.log('Try running: document.querySelectorAll(".card, .product-card, .grid__item")');
}

console.log('\n========================================');
console.log('Run: addProductIds() to auto-fix the issue');
console.log('========================================');

