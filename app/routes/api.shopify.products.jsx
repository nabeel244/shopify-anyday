import { authenticate } from "../shopify.server";
import { json } from "@remix-run/node";

export const loader = async ({ request }) => {
  try {
    const { admin } = await authenticate.admin(request);
    
    // Fetch products from Shopify
    const response = await admin.graphql(`
      query getProducts($first: Int!) {
        products(first: $first) {
          edges {
            node {
              id
              title
              description
              handle
              status
              productType
              vendor
              createdAt
              updatedAt
              variants(first: 1) {
                edges {
                  node {
                    id
                    title
                    price
                    compareAtPrice
                    availableForSale
                  }
                }
              }
            }
          }
        }
      }
    `, {
      variables: { first: 50 }
    });

    const data = await response.json();
    
    if (data.errors) {
      console.error('GraphQL errors:', data.errors);
      return json({ error: 'Failed to fetch products', details: data.errors }, { status: 500 });
    }

    const products = data.data.products.edges.map(edge => {
      const product = edge.node;
      const variant = product.variants.edges[0]?.node;
      
      return {
        id: product.id,
        title: product.title,
        description: product.description,
        handle: product.handle,
        status: product.status,
        productType: product.productType,
        vendor: product.vendor,
        price: variant ? parseFloat(variant.price) : 0,
        compareAtPrice: variant ? parseFloat(variant.compareAtPrice || 0) : 0,
        availableForSale: variant ? variant.availableForSale : false,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      };
    });

    return json({ products });
  } catch (error) {
    console.error('Error fetching products:', error);
    return json({ error: 'Failed to fetch products' }, { status: 500 });
  }
};
