import { authenticate } from "../shopify.server";
import {
  Page,
  Layout,
  Card,
  Text,
  BlockStack,
  InlineStack,
  Button,
  Banner,
  Box,
  Divider
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useNavigate } from "@remix-run/react";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

export default function ServicesManagement() {
  const navigate = useNavigate();

  return (
    <Page>
      <TitleBar title="Services Management" />
      <Layout>
        <Layout.Section>
          <Card>
            <Box padding="400">
              <BlockStack gap="400">
                <InlineStack align="space-between">
                  <Text variant="headingMd">Services Management</Text>
                </InlineStack>
                
                <Banner status="info">
                  <p>
                    <strong>Services are now managed through Product Configuration!</strong><br/>
                    Instead of creating separate services, you can now configure booking functionality 
                    directly on your Shopify products. This provides better integration and easier management.
                  </p>
                </Banner>

                <BlockStack gap="300">
                  <Text variant="headingSm">How it works now:</Text>
                  <ul style={{ margin: 0, paddingLeft: '20px' }}>
                    <li><strong>Select Products:</strong> Choose which products have booking functionality</li>
                    <li><strong>Configure Settings:</strong> Set time slots, availability, and duration for each product</li>
                    <li><strong>Automatic Services:</strong> Services are created automatically from your product configurations</li>
                    <li><strong>Better Integration:</strong> Booking forms appear directly on product pages</li>
                  </ul>
                </BlockStack>

                <Divider />

                <BlockStack gap="200">
                  <Text variant="bodyMd">
                    <strong>Ready to configure your products?</strong>
                  </Text>
                  
                  <InlineStack gap="200">
                    <Button 
                      variant="primary" 
                      onClick={() => navigate('/app/product-config')}
                    >
                      Go to Product Configuration
                    </Button>
                    
                    <Button 
                      onClick={() => navigate('/app/bookings')}
                    >
                      View Bookings
                    </Button>
                  </InlineStack>
                </BlockStack>

                <Divider />

                <BlockStack gap="200">
                  <Text variant="bodySm" color="subdued">
                    <strong>Note:</strong> The old services system has been replaced with a more integrated approach. 
                    All booking functionality is now managed through your Shopify products, providing better 
                    customer experience and easier administration.
                  </Text>
                </BlockStack>
              </BlockStack>
            </Box>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}