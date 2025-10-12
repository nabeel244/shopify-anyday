import React, { useState, useEffect } from 'react';
import { useFetcher } from '@remix-run/react';
import {
  Card,
  FormLayout,
  TextField,
  Select,
  Button,
  Text,
  BlockStack,
  InlineStack,
  Banner,
  Spinner,
  Divider,
  Badge,
  Box,
  DatePicker
} from '@shopify/polaris';
import { format, addDays, isAfter, isBefore, startOfDay } from 'date-fns';

const ProductPageBookingForm = ({ 
  productId, 
  productTitle, 
  productPrice, 
  bookingConfig, 
  onBookingSuccess 
}) => {
  const fetcher = useFetcher();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bookingDate: new Date(),
    startTime: '',
    specialRequests: ''
  });
  const [availableTimes, setAvailableTimes] = useState([]);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Load available times when date is selected
  useEffect(() => {
    if (formData.bookingDate) {
      loadAvailableTimes();
    }
  }, [formData.bookingDate]);

  const loadAvailableTimes = async () => {
    setIsLoading(true);
    try {
      if (bookingConfig && bookingConfig.timeSlots) {
        const configuredSlots = bookingConfig.timeSlots.map(slot => ({
          label: slot,
          value: slot
        }));
        setAvailableTimes(configuredSlots);
      } else {
        setAvailableTimes(generateTimeSlots());
      }
    } catch (error) {
      console.error('Failed to load available times:', error);
      setAvailableTimes(generateTimeSlots());
    } finally {
      setIsLoading(false);
    }
  };

  const generateTimeSlots = () => {
    const slots = [];
    const startHour = 9; // 9 AM
    const endHour = 17; // 5 PM
    const interval = 30; // 30 minutes

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minutes = 0; minutes < 60; minutes += interval) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        slots.push({ value: timeString, label: timeString });
      }
    }

    return slots;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.startTime) newErrors.startTime = 'Please select a time slot';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    // Calculate end time using configured duration
    const duration = bookingConfig ? bookingConfig.duration : 480; // Default 8 hours
    const endTime = calculateEndTime(formData.startTime, duration);

    const bookingData = {
      ...formData,
      endTime,
      totalPrice: productPrice,
      productId: productId,
      productTitle: productTitle,
      productBookingConfigId: bookingConfig ? bookingConfig.id : null
    };

    fetcher.submit(
      { bookingData: JSON.stringify(bookingData) },
      { method: 'POST', action: '/api/bookings' }
    );
  };

  const calculateEndTime = (startTime, durationMinutes) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    
    const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
    return `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
  };

  const isDateDisabled = (date) => {
    const today = startOfDay(new Date());
    
    // Disable past dates
    if (isBefore(date, today)) return true;
    
    // Disable configured disabled dates
    if (bookingConfig && bookingConfig.disabledDates) {
      const dateString = date.toISOString().split('T')[0];
      if (bookingConfig.disabledDates.includes(dateString)) return true;
    }
    
    return false;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  // Handle successful booking
  useEffect(() => {
    if (fetcher.data?.success) {
      onBookingSuccess?.(fetcher.data.booking);
      setShowForm(false);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        bookingDate: new Date(),
        startTime: '',
        specialRequests: ''
      });
    }
  }, [fetcher.data]);

  if (!showForm) {
    return (
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
            
            <Button 
              variant="primary" 
              onClick={() => setShowForm(true)}
              fullWidth
              size="large"
            >
              📅 Book Appointment
            </Button>
            
            <Text variant="bodySm" color="subdued">
              Choose your preferred date and time. You'll receive instant confirmation via email.
            </Text>
          </BlockStack>
        </Box>
      </Card>
    );
  }

  return (
    <Card>
      <Box padding="400">
        <BlockStack gap="400">
          <InlineStack align="space-between">
            <Text variant="headingMd">Book Your Appointment</Text>
            <Button 
              variant="plain" 
              onClick={() => setShowForm(false)}
            >
              ✕ Cancel
            </Button>
          </InlineStack>
          
          <Divider />
          
          {fetcher.data?.error && (
            <Banner status="critical">
              <p>{fetcher.data.error}</p>
            </Banner>
          )}

          <FormLayout>
            <FormLayout.Group>
              <TextField
                label="First Name"
                value={formData.firstName}
                onChange={(value) => handleInputChange('firstName', value)}
                error={errors.firstName}
                autoComplete="given-name"
                requiredIndicator
              />
              <TextField
                label="Last Name"
                value={formData.lastName}
                onChange={(value) => handleInputChange('lastName', value)}
                error={errors.lastName}
                autoComplete="family-name"
                requiredIndicator
              />
            </FormLayout.Group>
            
            <FormLayout.Group>
              <TextField
                label="Email"
                type="email"
                value={formData.email}
                onChange={(value) => handleInputChange('email', value)}
                error={errors.email}
                autoComplete="email"
                requiredIndicator
              />
              <TextField
                label="Phone Number"
                type="tel"
                value={formData.phone}
                onChange={(value) => handleInputChange('phone', value)}
                error={errors.phone}
                autoComplete="tel"
                requiredIndicator
              />
            </FormLayout.Group>

            <Divider />

            <Text variant="headingSm">Select Date & Time</Text>

            <FormLayout.Group>
              <DatePicker
                month={formData.bookingDate.getMonth()}
                year={formData.bookingDate.getFullYear()}
                selected={formData.bookingDate}
                onMonthChange={(month, year) => {
                  const newDate = new Date(year, month, formData.bookingDate.getDate());
                  handleInputChange('bookingDate', newDate);
                }}
                onChange={(selectedDates) => {
                  if (selectedDates.start) {
                    handleInputChange('bookingDate', selectedDates.start);
                  }
                }}
                disableDatesBefore={new Date()}
              />
              
              <Select
                label="Available Time Slots"
                options={[
                  { label: 'Select a time...', value: '' },
                  ...availableTimes
                ]}
                value={formData.startTime}
                onChange={(value) => handleInputChange('startTime', value)}
                error={errors.startTime}
                disabled={isLoading}
                requiredIndicator
              />
            </FormLayout.Group>
            
            {isLoading && (
              <InlineStack align="center">
                <Spinner size="small" />
                <Text variant="bodyMd">Loading available times...</Text>
              </InlineStack>
            )}
            
            <TextField
              label="Special Requests (Optional)"
              value={formData.specialRequests}
              onChange={(value) => handleInputChange('specialRequests', value)}
              placeholder="Any special requests or notes for your appointment..."
              multiline={3}
            />

            <Divider />

            <BlockStack gap="300">
              <Text variant="headingSm">Booking Summary</Text>
              
              <InlineStack align="space-between">
                <Text variant="bodyMd"><strong>Service:</strong></Text>
                <Text variant="bodyMd">{productTitle}</Text>
              </InlineStack>
              
              <InlineStack align="space-between">
                <Text variant="bodyMd"><strong>Date:</strong></Text>
                <Text variant="bodyMd">{format(formData.bookingDate, 'PPP')}</Text>
              </InlineStack>
              
              {formData.startTime && (
                <InlineStack align="space-between">
                  <Text variant="bodyMd"><strong>Time:</strong></Text>
                  <Text variant="bodyMd">
                    {formData.startTime} - {calculateEndTime(formData.startTime, bookingConfig?.duration || 480)}
                  </Text>
                </InlineStack>
              )}
              
              <InlineStack align="space-between">
                <Text variant="bodyMd"><strong>Total Price:</strong></Text>
                <Badge status="success" size="large">{formatPrice(productPrice)}</Badge>
              </InlineStack>
            </BlockStack>

            <Divider />

            <Button 
              variant="primary" 
              onClick={handleSubmit} 
              loading={fetcher.state === 'submitting'}
              disabled={fetcher.state === 'submitting'}
              size="large"
              fullWidth
            >
              {fetcher.state === 'submitting' ? 'Booking...' : 'Confirm Booking'}
            </Button>
          </FormLayout>
        </BlockStack>
      </Box>
    </Card>
  );
};

export default ProductPageBookingForm;
