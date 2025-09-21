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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingConfig, setBookingConfig] = useState(null);
  const [hasBooking, setHasBooking] = useState(false);

  useEffect(() => {
    checkBookingEnabled();
  }, [productId]);

  const checkBookingEnabled = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/product-booking-check?productId=${productId}`);
      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        setHasBooking(data.hasBooking);
        setBookingConfig(data.configuration);
      }
    } catch (err) {
      setError('Failed to check booking configuration');
      console.error('Error checking booking:', err);
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

  if (isLoading) {
    return (
      <Card>
        <Box padding="400">
          <InlineStack align="center">
            <Spinner size="small" />
            <Text variant="bodyMd">Checking booking availability...</Text>
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

  if (!hasBooking) {
    return null; // Don't show the widget if booking is not enabled
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
                <strong>Price:</strong> {formatPrice(productPrice)}
              </Text>
              
              <Text variant="bodyMd">
                <strong>Duration:</strong> Full day service (8 hours)
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
          productTitle={productTitle}
          productPrice={productPrice}
          bookingConfig={bookingConfig}
          onClose={() => setShowBookingForm(false)}
          onSuccess={handleBookingSuccess}
        />
      )}
    </>
  );
};

export default ProductBookingWidget;
