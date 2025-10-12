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
import ProductPageBookingForm from './ProductPageBookingForm';

const ProductBookingWidget = ({ productId, productTitle, productPrice }) => {
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
    // You might want to show a success message or redirect
    console.log('Booking successful:', booking);
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
    <ProductPageBookingForm
      productId={productId}
      productTitle={productTitle}
      productPrice={productPrice}
      bookingConfig={bookingConfig}
      onBookingSuccess={handleBookingSuccess}
    />
  );
};

export default ProductBookingWidget;
