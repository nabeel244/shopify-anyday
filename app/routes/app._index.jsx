import { useEffect, useState } from "react";
import { useFetcher } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  Box,
  List,
  Link,
  InlineStack,
  Badge,
  Spinner,
  EmptyState
} from "@shopify/polaris";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);

  return null;
};

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const color = ["Red", "Orange", "Yellow", "Green"][
    Math.floor(Math.random() * 4)
  ];
  const response = await admin.graphql(
    `#graphql
      mutation populateProduct($product: ProductCreateInput!) {
        productCreate(product: $product) {
          product {
            id
            title
            handle
            status
            variants(first: 10) {
              edges {
                node {
                  id
                  price
                  barcode
                  createdAt
                }
              }
            }
          }
        }
      }`,
    {
      variables: {
        product: {
          title: `${color} Snowboard`,
        },
      },
    },
  );
  const responseJson = await response.json();
  const product = responseJson.data.productCreate.product;
  const variantId = product.variants.edges[0].node.id;
  const variantResponse = await admin.graphql(
    `#graphql
    mutation shopifyRemixTemplateUpdateVariant($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
      productVariantsBulkUpdate(productId: $productId, variants: $variants) {
        productVariants {
          id
          price
          barcode
          createdAt
        }
      }
    }`,
    {
      variables: {
        productId: product.id,
        variants: [{ id: variantId, price: "100.00" }],
      },
    },
  );
  const variantResponseJson = await variantResponse.json();

  return {
    product: responseJson.data.productCreate.product,
    variant: variantResponseJson.data.productVariantsBulkUpdate.productVariants,
  };
};

export default function Index() {
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    totalServices: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      
      // Load booking stats
      const bookingsResponse = await fetch('/api/bookings');
      const bookingsData = await bookingsResponse.json();
      
      // Load services count
      const servicesResponse = await fetch('/api/services');
      const servicesData = await servicesResponse.json();
      
      const bookings = bookingsData.bookings || [];
      const services = servicesData.services || [];
      
      setStats({
        totalBookings: bookings.length,
        pendingBookings: bookings.filter(b => b.status === 'PENDING').length,
        confirmedBookings: bookings.filter(b => b.status === 'CONFIRMED').length,
        totalServices: services.length
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Page>
      <TitleBar title="Booking System Dashboard" />
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="500">
                <BlockStack gap="200">
                  <Text as="h2" variant="headingMd">
                    Welcome to Your Booking System 🎉
                  </Text>
                  <Text variant="bodyMd" as="p">
                    Your advanced booking system is ready! Manage appointments, 
                    sync with Google Sheets, and provide excellent customer service.
                  </Text>
                </BlockStack>
                
                {isLoading ? (
                  <Box padding="400">
                    <InlineStack align="center">
                      <Spinner size="small" />
                      <Text variant="bodyMd">Loading statistics...</Text>
                    </InlineStack>
                  </Box>
                ) : (
                  <BlockStack gap="300">
                    <Text as="h3" variant="headingMd">
                      System Overview
                    </Text>
                    <Layout>
                      <Layout.Section variant="oneHalf">
                        <Card>
                          <BlockStack gap="200">
                            <Text variant="headingSm">Total Bookings</Text>
                            <Text variant="headingLg">{stats.totalBookings}</Text>
                          </BlockStack>
                        </Card>
                      </Layout.Section>
                      <Layout.Section variant="oneHalf">
                        <Card>
                          <BlockStack gap="200">
                            <Text variant="headingSm">Active Services</Text>
                            <Text variant="headingLg">{stats.totalServices}</Text>
                          </BlockStack>
                        </Card>
                      </Layout.Section>
                    </Layout>
                    
                    <Layout>
                      <Layout.Section variant="oneHalf">
                        <Card>
                          <BlockStack gap="200">
                            <Text variant="headingSm">Pending Bookings</Text>
                            <Text variant="headingLg">{stats.pendingBookings}</Text>
                          </BlockStack>
                        </Card>
                      </Layout.Section>
                      <Layout.Section variant="oneHalf">
                        <Card>
                          <BlockStack gap="200">
                            <Text variant="headingSm">Confirmed Bookings</Text>
                            <Text variant="headingLg">{stats.confirmedBookings}</Text>
                          </BlockStack>
                        </Card>
                      </Layout.Section>
                    </Layout>
                  </BlockStack>
                )}
                
                <BlockStack gap="200">
                  <Text as="h3" variant="headingMd">
                    Quick Actions
                  </Text>
                  <InlineStack gap="300">
                    <Button url="/app/services" variant="primary">
                      Manage Services
                    </Button>
                    <Button url="/app/bookings">
                      View Bookings
                    </Button>
                    <Button url="/app/google-sheets-config">
                      Google Sheets Setup
                    </Button>
                  </InlineStack>
                </BlockStack>
              </BlockStack>
            </Card>
          </Layout.Section>
          <Layout.Section variant="oneThird">
            <BlockStack gap="500">
              <Card>
                <BlockStack gap="200">
                  <Text as="h2" variant="headingMd">
                    Features
                  </Text>
                  <List>
                    <List.Item>
                      <strong>Multi-step Booking Form</strong> - Easy customer experience
                    </List.Item>
                    <List.Item>
                      <strong>Google Sheets Integration</strong> - Automatic data sync
                    </List.Item>
                    <List.Item>
                      <strong>Email Notifications</strong> - Instant confirmations
                    </List.Item>
                    <List.Item>
                      <strong>Real-time Availability</strong> - Prevent double bookings
                    </List.Item>
                    <List.Item>
                      <strong>Admin Dashboard</strong> - Complete booking management
                    </List.Item>
                  </List>
                </BlockStack>
              </Card>
              <Card>
                <BlockStack gap="200">
                  <Text as="h2" variant="headingMd">
                    Getting Started
                  </Text>
                  <List>
                    <List.Item>
                      <Link url="/app/services" removeUnderline>
                        Set up your services
                      </Link>
                    </List.Item>
                    <List.Item>
                      <Link url="/app/google-sheets-config" removeUnderline>
                        Configure Google Sheets
                      </Link>
                    </List.Item>
                    <List.Item>
                      <Link url="/app/bookings" removeUnderline>
                        View existing bookings
                      </Link>
                    </List.Item>
                    <List.Item>
                      Test the booking widget on product pages
                    </List.Item>
                  </List>
                </BlockStack>
              </Card>
            </BlockStack>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
