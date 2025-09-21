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
  Modal,
  Divider,
  Badge,
  Box
} from '@shopify/polaris';
import { format, addDays, isAfter, isBefore, startOfDay } from 'date-fns';

const BookingForm = ({ productId, productTitle, productPrice, bookingConfig, onClose, onSuccess }) => {
  const fetcher = useFetcher();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    productId: productId || '',
    productTitle: productTitle || '',
    productPrice: productPrice || 0,
    bookingDate: new Date(),
    startTime: '',
    specialRequests: ''
  });
  const [availableTimes, setAvailableTimes] = useState([]);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Load available times when date is selected
  useEffect(() => {
    if (formData.bookingDate) {
      loadAvailableTimes();
    }
  }, [formData.bookingDate]);

  const loadAvailableTimes = async () => {
    setIsLoading(true);
    try {
      // Use configured time slots if available
      if (bookingConfig && bookingConfig.timeSlots) {
        const configuredSlots = bookingConfig.timeSlots.map(slot => ({
          label: slot,
          value: slot
        }));
        setAvailableTimes(configuredSlots);
      } else {
        // Fallback to generated time slots
        setAvailableTimes(generateTimeSlots());
      }
    } catch (error) {
      console.error('Failed to load available times:', error);
      // Fallback to generated time slots
      setAvailableTimes(generateTimeSlots());
    } finally {
      setIsLoading(false);
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
      if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    }

    if (step === 2) {
      // Service details are already provided, no validation needed
    }

    if (step === 3) {
      if (!formData.startTime) newErrors.startTime = 'Please select a time slot';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    // Calculate end time using configured duration
    const duration = bookingConfig ? bookingConfig.duration : 480; // Default 8 hours
    const endTime = calculateEndTime(formData.startTime, duration);

    const bookingData = {
      ...formData,
      endTime,
      totalPrice: formData.productPrice,
      productId: formData.productId,
      productTitle: formData.productTitle,
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

  const generateTimeSlots = () => {
    const slots = [];
    const startHour = 9; // 9 AM
    const endHour = 17; // 5 PM
    const interval = 30; // 30 minutes

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minutes = 0; minutes < 60; minutes += interval) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        const isAvailable = availableTimes.includes(timeString);
        slots.push({ value: timeString, label: timeString, disabled: !isAvailable });
      }
    }

    return slots;
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

  const renderStep1 = () => (
    <BlockStack gap="400">
      <Text variant="headingMd">Personal Information</Text>
      <FormLayout>
        <FormLayout.Group>
          <TextField
            label="First Name"
            value={formData.firstName}
            onChange={(value) => handleInputChange('firstName', value)}
            error={errors.firstName}
            autoComplete="given-name"
          />
          <TextField
            label="Last Name"
            value={formData.lastName}
            onChange={(value) => handleInputChange('lastName', value)}
            error={errors.lastName}
            autoComplete="family-name"
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
          />
          <TextField
            label="Phone Number"
            type="tel"
            value={formData.phone}
            onChange={(value) => handleInputChange('phone', value)}
            error={errors.phone}
            autoComplete="tel"
          />
        </FormLayout.Group>
      </FormLayout>
    </BlockStack>
  );

  const renderStep2 = () => (
    <BlockStack gap="400">
      <Text variant="headingMd">Service Details</Text>
      <Card>
        <Box padding="300">
          <BlockStack gap="200">
            <Text variant="headingSm">{formData.productTitle}</Text>
            <Text variant="bodyMd">Birthday party center service</Text>
            <InlineStack gap="200">
              <Badge status="info">${formData.productPrice}</Badge>
              <Badge status="info">Full day service</Badge>
            </InlineStack>
          </BlockStack>
        </Box>
      </Card>
    </BlockStack>
  );

  const renderStep3 = () => (
    <BlockStack gap="400">
      <Text variant="headingMd">Select Date & Time</Text>
      <FormLayout>
        <TextField
          label="Booking Date"
          type="date"
          value={format(formData.bookingDate, 'yyyy-MM-dd')}
          onChange={(value) => {
            const newDate = new Date(value);
            handleInputChange('bookingDate', newDate);
          }}
          error={errors.bookingDate}
          min={format(new Date(), 'yyyy-MM-dd')}
        />
        
        <Select
          label="Available Time Slots"
          options={[
            { label: 'Select a time...', value: '' },
            ...generateTimeSlots()
          ]}
          value={formData.startTime}
          onChange={(value) => handleInputChange('startTime', value)}
          error={errors.startTime}
          disabled={isLoading}
        />
        
        {isLoading && <Spinner size="small" />}
        
        <TextField
          label="Special Requests (Optional)"
          value={formData.specialRequests}
          onChange={(value) => handleInputChange('specialRequests', value)}
          placeholder="Any special requests or notes for your appointment..."
          multiline={3}
        />
      </FormLayout>
    </BlockStack>
  );

  const renderStep4 = () => {
    const duration = bookingConfig ? bookingConfig.duration : 480; // Default 8 hours
    const endTime = calculateEndTime(formData.startTime, duration);

    return (
      <BlockStack gap="400">
        <Text variant="headingMd">Confirm Your Booking</Text>
        
        <Card>
          <BlockStack gap="300">
            <Text variant="headingSm">Booking Summary</Text>
            
            <Divider />
            
            <InlineStack align="space-between">
              <Text variant="bodyMd"><strong>Name:</strong></Text>
              <Text variant="bodyMd">{formData.firstName} {formData.lastName}</Text>
            </InlineStack>
            
            <InlineStack align="space-between">
              <Text variant="bodyMd"><strong>Email:</strong></Text>
              <Text variant="bodyMd">{formData.email}</Text>
            </InlineStack>
            
            <InlineStack align="space-between">
              <Text variant="bodyMd"><strong>Phone:</strong></Text>
              <Text variant="bodyMd">{formData.phone}</Text>
            </InlineStack>
            
            <Divider />
            
            <InlineStack align="space-between">
              <Text variant="bodyMd"><strong>Service:</strong></Text>
              <Text variant="bodyMd">{formData.productTitle}</Text>
            </InlineStack>
            
            <InlineStack align="space-between">
              <Text variant="bodyMd"><strong>Date:</strong></Text>
              <Text variant="bodyMd">{format(formData.bookingDate, 'PPP')}</Text>
            </InlineStack>
            
            <InlineStack align="space-between">
              <Text variant="bodyMd"><strong>Time:</strong></Text>
              <Text variant="bodyMd">{formData.startTime} - {endTime}</Text>
            </InlineStack>
            
            <InlineStack align="space-between">
              <Text variant="bodyMd"><strong>Duration:</strong></Text>
              <Text variant="bodyMd">{selectedService.duration} minutes</Text>
            </InlineStack>
            
            {formData.specialRequests && (
              <>
                <Divider />
                <InlineStack align="space-between">
                  <Text variant="bodyMd"><strong>Special Requests:</strong></Text>
                  <Text variant="bodyMd">{formData.specialRequests}</Text>
                </InlineStack>
              </>
            )}
            
            <Divider />
            
            <InlineStack align="space-between">
              <Text variant="headingSm"><strong>Total Price:</strong></Text>
              <Badge status="success" size="large">${selectedService.price}</Badge>
            </InlineStack>
          </BlockStack>
        </Card>
      </BlockStack>
    );
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      default: return null;
    }
  };

  const renderButtons = () => {
    const isSubmitting = fetcher.state === 'submitting';
    
    return (
      <InlineStack align="space-between">
        <InlineStack gap="200">
          {currentStep > 1 && (
            <Button onClick={handlePrevious} disabled={isSubmitting}>
              Previous
            </Button>
          )}
        </InlineStack>
        
        <InlineStack gap="200">
          {currentStep < 4 ? (
            <Button variant="primary" onClick={handleNext} disabled={isSubmitting}>
              Next
            </Button>
          ) : (
            <Button 
              variant="primary" 
              onClick={handleSubmit} 
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              Confirm Booking
            </Button>
          )}
        </InlineStack>
      </InlineStack>
    );
  };

  // Handle successful booking
  useEffect(() => {
    if (fetcher.data?.success) {
      onSuccess?.(fetcher.data.booking);
      onClose?.();
    }
  }, [fetcher.data]);

  return (
    <Modal
      open={true}
      onClose={onClose}
      title={`Book Appointment - Step ${currentStep} of 4`}
      large
    >
      <Modal.Section>
        <BlockStack gap="400">
          {fetcher.data?.error && (
            <Banner status="critical">
              <p>{fetcher.data.error}</p>
            </Banner>
          )}
          
          {renderCurrentStep()}
          
          {renderButtons()}
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
};

export default BookingForm;
