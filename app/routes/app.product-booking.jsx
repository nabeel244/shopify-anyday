import { useState, useEffect } from "react";
import { authenticate } from "../shopify.server";
import {
  Page,
  Layout,
  Card,
  Button,
  Text,
  BlockStack,
  InlineStack,
  Banner,
  Spinner,
  FormLayout,
  TextField,
  Select,
  Modal,
  Divider,
  Badge,
  Box
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

export default function ProductBooking() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/shopify/products');
      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        setProducts(data.products || []);
      }
    } catch (err) {
      setError('Failed to load products');
      console.error('Error loading products:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setShowBookingForm(true);
  };

  const handleBookingSuccess = (booking) => {
    setShowBookingForm(false);
    setSelectedProduct(null);
    // Show success message
    console.log('Booking successful:', booking);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  if (isLoading) {
    return (
      <Page>
        <TitleBar title="Product Booking Setup" />
        <Layout>
          <Layout.Section>
            <Card>
              <Box padding="400">
                <InlineStack align="center">
                  <Spinner size="small" />
                  <Text variant="bodyMd">Loading products...</Text>
                </InlineStack>
              </Box>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  if (error) {
    return (
      <Page>
        <TitleBar title="Product Booking Setup" />
        <Layout>
          <Layout.Section>
            <Card>
              <Banner status="critical">
                <p>{error}</p>
              </Banner>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  return (
    <Page>
      <TitleBar title="Product Booking Setup" />
      <Layout>
        <Layout.Section>
          <Card>
            <Box padding="400">
              <BlockStack gap="400">
                <Text variant="headingMd">Add Booking Form to Product Pages</Text>
                
                <Text variant="bodyMd">
                  Select a product to add the booking form. This will create a booking widget 
                  that customers can use to book appointments directly from the product page.
                </Text>

                <Divider />

                <BlockStack gap="300">
                  <Text variant="headingSm">Available Products</Text>
                  
                  {products.length === 0 ? (
                    <Text variant="bodyMd" color="subdued">
                      No products found. Make sure you have products in your store.
                    </Text>
                  ) : (
                    <BlockStack gap="200">
                      {products.map((product) => (
                        <Card key={product.id}>
                          <Box padding="300">
                            <InlineStack align="space-between">
                              <BlockStack gap="200">
                                <Text variant="bodyMd">
                                  <strong>{product.title}</strong>
                                </Text>
                                <Text variant="bodySm" color="subdued">
                                  {product.description || 'No description available'}
                                </Text>
                                <Text variant="bodySm">
                                  Price: {formatPrice(product.price)}
                                </Text>
                              </BlockStack>
                              
                              <Button 
                                variant="primary" 
                                onClick={() => handleProductSelect(product)}
                              >
                                Add Booking Form
                              </Button>
                            </InlineStack>
                          </Box>
                        </Card>
                      ))}
                    </BlockStack>
                  )}
                </BlockStack>

                <Divider />

                <BlockStack gap="200">
                  <Text variant="headingSm">How it works:</Text>
                  <ul style={{ margin: 0, paddingLeft: '20px' }}>
                    <li>Select a product to add booking functionality</li>
                    <li>Customers will see a booking form on the product page</li>
                    <li>They can select date, time, and fill in their details</li>
                    <li>You'll receive booking notifications in your admin dashboard</li>
                    <li>Manage all bookings from the Bookings section</li>
                  </ul>
                </BlockStack>
              </BlockStack>
            </Box>
          </Card>
        </Layout.Section>
      </Layout>

      {showBookingForm && selectedProduct && (
        <Modal
          open={showBookingForm}
          onClose={() => setShowBookingForm(false)}
          title={`Add Booking Form to: ${selectedProduct.title}`}
          large
        >
          <Modal.Section>
            <BlockStack gap="400">
              <Text variant="bodyMd">
                This will add a booking form to the product page for: <strong>{selectedProduct.title}</strong>
              </Text>
              
              <Banner status="info">
                <p>
                  The booking form will be automatically embedded into the product page. 
                  Customers will be able to book appointments directly from the product page.
                </p>
              </Banner>

              <FormLayout>
                <TextField
                  label="Product Title"
                  value={selectedProduct.title}
                  readOnly
                />
                
                <TextField
                  label="Product Price"
                  value={formatPrice(selectedProduct.price)}
                  readOnly
                />
              </FormLayout>

              <InlineStack gap="200">
                <Button 
                  variant="primary" 
                  onClick={() => {
                    // Here you would implement the actual integration
                    console.log('Adding booking form to product:', selectedProduct.id);
                    setShowBookingForm(false);
                  }}
                >
                  Add Booking Form
                </Button>
                
                <Button onClick={() => setShowBookingForm(false)}>
                  Cancel
                </Button>
              </InlineStack>
            </BlockStack>
          </Modal.Section>
        </Modal>
      )}
    </Page>
  );
}
