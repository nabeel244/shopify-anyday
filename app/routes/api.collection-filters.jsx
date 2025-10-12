import { json } from "@remix-run/node";
import prisma from "../db.server";
import { authenticate } from "../shopify.server";

/**
 * API endpoint to get aggregated filter data from all product configurations
 * This will be used by the collection page filter sidebar
 */
export async function loader({ request }) {
  try {
    // Get all active product configurations
    const configs = await prisma.productBookingConfig.findMany({
      where: {
        isActive: true
      },
      select: {
        productId: true,
        productTitle: true,
        productPrice: true,
        city: true,
        availableDays: true,
        timeSlots: true,
        timeRangeStart: true,
        timeRangeEnd: true,
        services: true,
        bookingStartDate: true,
        bookingEndDate: true
      }
    });

    // Fetch product ratings from Shopify
    let productRatings = {};
    try {
      const { admin } = await authenticate.admin(request);
      const productIds = configs.map(c => c.productId);
      
      // Fetch products with ratings from Shopify
      for (const productId of productIds) {
        try {
          const response = await admin.graphql(`
            query getProduct($id: ID!) {
              product(id: $id) {
                id
                metafields(first: 10) {
                  edges {
                    node {
                      namespace
                      key
                      value
                    }
                  }
                }
              }
            }
          `, {
            variables: { id: productId }
          });

          const data = await response.json();
          if (data.data && data.data.product) {
            // Look for rating in metafields (common namespaces: reviews, rating, product_reviews)
            const ratingField = data.data.product.metafields.edges.find(edge => 
              (edge.node.namespace === 'reviews' || edge.node.namespace === 'rating' || edge.node.namespace === 'product_reviews') &&
              (edge.node.key === 'rating' || edge.node.key === 'rating_value' || edge.node.key === 'average_rating')
            );
            
            if (ratingField) {
              productRatings[productId] = parseFloat(ratingField.node.value) || 0;
            }
          }
        } catch (err) {
          console.error(`Error fetching rating for product ${productId}:`, err);
        }
      }
    } catch (authError) {
      console.error('Error authenticating with Shopify:', authError);
      // Continue without ratings if authentication fails
    }

    // Aggregate filter data
    const filterData = {
      dates: [],
      times: [],
      services: [],
      cities: [],
      priceRange: {
        min: 0,
        max: 0
      },
      products: []
    };

    // Track unique values
    const uniqueDates = new Set();
    const uniqueTimes = new Set();
    const uniqueServices = new Set();
    const uniqueCities = new Set();
    let minPrice = Infinity;
    let maxPrice = 0;

    configs.forEach(config => {
      // Parse JSON fields
      const availableDays = JSON.parse(config.availableDays || '[]');
      const timeSlots = JSON.parse(config.timeSlots || '[]');
      const services = JSON.parse(config.services || '[]');

      // Collect available dates
      if (config.bookingStartDate && config.bookingEndDate) {
        const startDate = new Date(config.bookingStartDate);
        const endDate = new Date(config.bookingEndDate);
        
        // Generate all dates in range for available days
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
          const dayName = d.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
          
          if (availableDays.includes(dayName)) {
            const dateString = d.toISOString().split('T')[0];
            uniqueDates.add(dateString);
          }
        }
      }

      // Collect time slots
      timeSlots.forEach(time => uniqueTimes.add(time));

      // Collect services
      services.forEach(service => {
        if (service.name) {
          uniqueServices.add(service.name);
        }
      });

      // Collect cities
      if (config.city) {
        uniqueCities.add(config.city);
      }

      // Track price range
      if (config.productPrice < minPrice) minPrice = config.productPrice;
      if (config.productPrice > maxPrice) maxPrice = config.productPrice;

      // Add product info with rating from Shopify
      filterData.products.push({
        productId: config.productId,
        title: config.productTitle,
        price: config.productPrice,
        rating: productRatings[config.productId] || 0,
        city: config.city,
        availableDays,
        timeSlots,
        services: services.map(s => s.name),
        dateRange: {
          start: config.bookingStartDate,
          end: config.bookingEndDate
        }
      });
    });

    // Convert sets to sorted arrays
    filterData.dates = Array.from(uniqueDates).sort();
    filterData.times = Array.from(uniqueTimes).sort();
    filterData.services = Array.from(uniqueServices).sort();
    filterData.cities = Array.from(uniqueCities).sort();
    filterData.priceRange = {
      min: minPrice === Infinity ? 0 : minPrice,
      max: maxPrice
    };

    return json({
      success: true,
      filters: filterData
    });

  } catch (error) {
    console.error('Error fetching collection filters:', error);
    return json({
      success: false,
      error: 'Failed to fetch filters',
      details: error.message
    }, { status: 500 });
  }
}

