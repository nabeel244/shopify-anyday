import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Text,
  BlockStack,
  InlineStack,
  Badge,
  Divider,
  Box,
  Banner,
  Spinner
} from '@shopify/polaris';
import BookingForm from './BookingForm';

const ProductBookingWidget = ({ productId, productTitle, productPrice }) => {
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/services');
      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        setServices(data.services || []);
      }
    } catch (err) {
      setError('Failed to load services');
      console.error('Error loading services:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookingSuccess = (booking) => {
    setShowBookingForm(false);
    // You might want to show a success message or redirect
    console.log('Booking successful:', booking);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const getServicePriceRange = () => {
    if (services.length === 0) return null;
    
    const prices = services.map(s => s.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    if (minPrice === maxPrice) {
      return formatPrice(minPrice);
    }
    
    return `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;
  };

  if (isLoading) {
    return (
      <Card>
        <Box padding="400">
          <InlineStack align="center">
            <Spinner size="small" />
            <Text variant="bodyMd">Loading booking options...</Text>
          </InlineStack>
        </Box>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <Banner status="critical">
          <p>{error}</p>
        </Banner>
      </Card>
    );
  }

  if (services.length === 0) {
    return (
      <Card>
        <Box padding="400">
          <Text variant="bodyMd" color="subdued">
            No booking services available at this time.
          </Text>
        </Box>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <Box padding="400">
          <BlockStack gap="400">
            <InlineStack align="space-between">
              <Text variant="headingMd">Book This Service</Text>
              <Badge status="success">Available</Badge>
            </InlineStack>
            
            <Divider />
            
            <BlockStack gap="300">
              <Text variant="bodyMd">
                <strong>Service:</strong> {productTitle}
              </Text>
              
              <Text variant="bodyMd">
                <strong>Price Range:</strong> {getServicePriceRange()}
              </Text>
              
              <Text variant="bodyMd">
                <strong>Available Services:</strong> {services.length} option{services.length !== 1 ? 's' : ''}
              </Text>
            </BlockStack>
            
            <Divider />
            
            <BlockStack gap="200">
              <Text variant="bodySm" color="subdued">
                Choose from our available services and book your appointment online. 
                You'll receive instant confirmation and can manage your booking easily.
              </Text>
              
              <InlineStack gap="200">
                <Button 
                  variant="primary" 
                  onClick={() => setShowBookingForm(true)}
                  fullWidth
                >
                  Book Appointment
                </Button>
              </InlineStack>
            </BlockStack>
            
            <Divider />
            
            <BlockStack gap="200">
              <Text variant="bodySm" color="subdued">
                <strong>What's included:</strong>
              </Text>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#6B7280' }}>
                <li>Instant booking confirmation</li>
                <li>Email notifications</li>
                <li>Easy rescheduling</li>
                <li>Professional service</li>
              </ul>
            </BlockStack>
          </BlockStack>
        </Box>
      </Card>
      
      {showBookingForm && (
        <BookingForm
          productId={productId}
          onClose={() => setShowBookingForm(false)}
          onSuccess={handleBookingSuccess}
        />
      )}
    </>
  );
};

export default ProductBookingWidget;
