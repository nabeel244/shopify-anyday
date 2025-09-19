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

const BookingForm = ({ productId, onClose, onSuccess }) => {
  const fetcher = useFetcher();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    serviceId: '',
    bookingDate: new Date(),
    startTime: '',
    specialRequests: ''
  });
  const [services, setServices] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Load services on component mount
  useEffect(() => {
    loadServices();
  }, []);

  // Load available times when service and date are selected
  useEffect(() => {
    if (formData.serviceId && formData.bookingDate) {
      loadAvailableTimes();
    }
  }, [formData.serviceId, formData.bookingDate]);

  const loadServices = async () => {
    try {
      const response = await fetch('/api/services');
      const data = await response.json();
      setServices(data.services || []);
    } catch (error) {
      console.error('Failed to load services:', error);
    }
  };

  const loadAvailableTimes = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/availability?serviceId=${formData.serviceId}&date=${formData.bookingDate.toISOString()}`);
      const data = await response.json();
      setAvailableTimes(data.availableTimes || []);
    } catch (error) {
      console.error('Failed to load available times:', error);
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
      if (!formData.serviceId) newErrors.serviceId = 'Please select a service';
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

    const selectedService = services.find(s => s.id === formData.serviceId);
    const endTime = calculateEndTime(formData.startTime, selectedService.duration);

    const bookingData = {
      ...formData,
      endTime,
      totalPrice: selectedService.price,
      productId
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
    return isBefore(date, startOfDay(new Date()));
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
      <Text variant="headingMd">Select Service</Text>
      <FormLayout>
        <Select
          label="Choose a Service"
          options={[
            { label: 'Select a service...', value: '' },
            ...services.map(service => ({
              label: `${service.name} - $${service.price} (${service.duration} min)`,
              value: service.id
            }))
          ]}
          value={formData.serviceId}
          onChange={(value) => handleInputChange('serviceId', value)}
          error={errors.serviceId}
        />
        
        {formData.serviceId && (
          <Box padding="400" background="bg-surface-secondary" borderRadius="200">
            <BlockStack gap="200">
              <Text variant="headingSm">Service Details</Text>
              {(() => {
                const selectedService = services.find(s => s.id === formData.serviceId);
                return (
                  <>
                    <Text variant="bodyMd"><strong>Duration:</strong> {selectedService.duration} minutes</Text>
                    <Text variant="bodyMd"><strong>Price:</strong> ${selectedService.price}</Text>
                    {selectedService.description && (
                      <Text variant="bodyMd"><strong>Description:</strong> {selectedService.description}</Text>
                    )}
                  </>
                );
              })()}
            </BlockStack>
          </Box>
        )}
      </FormLayout>
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
    const selectedService = services.find(s => s.id === formData.serviceId);
    const endTime = calculateEndTime(formData.startTime, selectedService.duration);

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
              <Text variant="bodyMd">{selectedService.name}</Text>
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
