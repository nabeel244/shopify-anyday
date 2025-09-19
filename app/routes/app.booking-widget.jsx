import { useLoaderData } from "@remix-run/react";
import { authenticate } from "../shopify.server";
import ProductBookingWidget from "../components/ProductBookingWidget";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  
  const url = new URL(request.url);
  const productId = url.searchParams.get('productId');
  const productTitle = url.searchParams.get('title') || 'Service';
  const productPrice = url.searchParams.get('price') || '0';
  
  return {
    productId,
    productTitle,
    productPrice: parseFloat(productPrice)
  };
};

export default function BookingWidget() {
  const { productId, productTitle, productPrice } = useLoaderData();
  
  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
      <ProductBookingWidget 
        productId={productId}
        productTitle={productTitle}
        productPrice={productPrice}
      />
    </div>
  );
}
