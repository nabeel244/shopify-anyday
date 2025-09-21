import React, { useState, useEffect } from 'react';
import {
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
} from '@shopify/ui-extensions-react/checkout';

export default function ProductBookingBlock({ extension, settings }) {
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bookingDate: '',
    startTime: '',
    specialRequests: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push({ label: timeString, value: timeString });
      }
    }
    return slots;
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          productId: extension.target?.product?.id || 'default',
          productTitle: extension.target?.product?.title || 'Service'
        })
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setSuccess(true);
        setShowBookingForm(false);
        // Reset form
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          bookingDate: '',
          startTime: '',
          specialRequests: ''
        });
      }
    } catch (err) {
      setError('Failed to submit booking. Please try again.');
      console.error('Booking error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  if (success) {
    return (
      <Card>
        <Box padding="400">
          <Banner status="success">
            <Text>Booking submitted successfully! You'll receive a confirmation email shortly.</Text>
          </Banner>
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
              <Text variant="headingMd">{settings.title || 'Book This Service'}</Text>
              <Badge status="success">Available</Badge>
            </InlineStack>
            
            <Divider />
            
            <BlockStack gap="300">
              <Text variant="bodyMd">
                <strong>Service:</strong> {extension.target?.product?.title || 'Service'}
              </Text>
              
              <Text variant="bodyMd">
                <strong>Price:</strong> {formatPrice(extension.target?.product?.price || 0)}
              </Text>
            </BlockStack>
            
            <Divider />
            
            <BlockStack gap="200">
              <Text variant="bodySm" color="subdued">
                {settings.description || 'Book your appointment online and get instant confirmation.'}
              </Text>
              
              <Button 
                variant="primary" 
                onClick={() => setShowBookingForm(true)}
                fullWidth
              >
                {settings.button_text || 'Book Appointment'}
              </Button>
            </BlockStack>
          </BlockStack>
        </Box>
      </Card>

      {showBookingForm && (
        <Modal
          open={showBookingForm}
          onClose={() => setShowBookingForm(false)}
          title="Book Your Appointment"
        >
          <Modal.Section>
            <BlockStack gap="400">
              {error && (
                <Banner status="critical">
                  <Text>{error}</Text>
                </Banner>
              )}

              <FormLayout>
                <FormLayout.Group>
                  <TextField
                    label="First Name"
                    value={formData.firstName}
                    onChange={(value) => handleInputChange('firstName', value)}
                    required
                  />
                  
                  <TextField
                    label="Last Name"
                    value={formData.lastName}
                    onChange={(value) => handleInputChange('lastName', value)}
                    required
                  />
                </FormLayout.Group>

                <FormLayout.Group>
                  <TextField
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(value) => handleInputChange('email', value)}
                    required
                  />
                  
                  <TextField
                    label="Phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(value) => handleInputChange('phone', value)}
                    required
                  />
                </FormLayout.Group>

                <FormLayout.Group>
                  <TextField
                    label="Booking Date"
                    type="date"
                    value={formData.bookingDate}
                    onChange={(value) => handleInputChange('bookingDate', value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                  
                  <Select
                    label="Time Slot"
                    options={[
                      { label: 'Select a time...', value: '' },
                      ...generateTimeSlots()
                    ]}
                    value={formData.startTime}
                    onChange={(value) => handleInputChange('startTime', value)}
                    required
                  />
                </FormLayout.Group>

                <TextField
                  label="Special Requests (Optional)"
                  value={formData.specialRequests}
                  onChange={(value) => handleInputChange('specialRequests', value)}
                  multiline={3}
                />
              </FormLayout>

              <InlineStack gap="200">
                <Button 
                  variant="primary" 
                  onClick={handleSubmit}
                  loading={isLoading}
                  fullWidth
                >
                  {isLoading ? 'Submitting...' : 'Submit Booking'}
                </Button>
                
                <Button onClick={() => setShowBookingForm(false)}>
                  Cancel
                </Button>
              </InlineStack>
            </BlockStack>
          </Modal.Section>
        </Modal>
      )}
    </>
  );
}
