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
  Box,
  Checkbox,
  DataTable
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

export default function ProductConfig() {
  const [products, setProducts] = useState([]);
  const [configurations, setConfigurations] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    availableDays: [],
    timeSlots: [], // Legacy - will be deprecated
    timeRanges: [], // New time ranges format
    timeRangeStart: '09:00',
    timeRangeEnd: '17:00',
    slotDuration: 30,
    disabledDates: [],
    services: [],
    duration: 480,
    maxBookings: 1,
    bookingStartDate: '',
    bookingEndDate: '',
    city: '',
    rating: 0,
    serviceCategory: '',
    isActive: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [productsResponse, configsResponse] = await Promise.all([
        fetch('/api/shopify/products'),
        fetch('/api/product-booking-configs')
      ]);
      
      const productsData = await productsResponse.json();
      const configsData = await configsResponse.json();
      
      if (productsData.error) {
        setError(productsData.error);
      } else {
        setProducts(productsData.products || []);
      }
      
      if (configsData.error) {
        console.error('Failed to load configurations:', configsData.error);
      } else {
        setConfigurations(configsData.configurations || []);
      }
    } catch (err) {
      setError('Failed to load data');
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setShowProductModal(false);
    setShowConfigModal(true);
  };


  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDayToggle = (day) => {
    setFormData(prev => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter(d => d !== day)
        : [...prev.availableDays, day]
    }));
    
    // Clear error when user selects a day
    if (error && formData.availableDays.length === 0) {
      setError(null);
    }
  };

  const handleTimeSlotToggle = (timeSlot) => {
    setFormData(prev => ({
      ...prev,
      timeSlots: prev.timeSlots.includes(timeSlot)
        ? prev.timeSlots.filter(t => t !== timeSlot)
        : [...prev.timeSlots, timeSlot]
    }));
  };

  const addService = () => {
    const newService = {
      id: Date.now().toString(),
      name: '',
      price: 0,
      description: ''
    };
    setFormData(prev => ({
      ...prev,
      services: [...prev.services, newService]
    }));
  };

  const updateService = (serviceId, field, value) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.map(service =>
        service.id === serviceId ? { ...service, [field]: value } : service
      )
    }));
  };

  const removeService = (serviceId) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter(service => service.id !== serviceId)
    }));
  };

  // Time Range Functions
  const addTimeRange = () => {
    const newTimeRange = {
      id: Date.now().toString(),
      day: 'monday', // Default to Monday
      start: '10:00',
      end: '12:00',
      duration: 120 // 2 hours in minutes
    };
    setFormData(prev => ({
      ...prev,
      timeRanges: [...prev.timeRanges, newTimeRange]
    }));
  };

  const updateTimeRange = (rangeId, field, value) => {
    setFormData(prev => ({
      ...prev,
      timeRanges: prev.timeRanges.map(range => {
        if (range.id === rangeId) {
          const updatedRange = { ...range, [field]: value };
          
          // Auto-calculate duration if start or end time changes
          if (field === 'start' || field === 'end') {
            const startTime = field === 'start' ? value : range.start;
            const endTime = field === 'end' ? value : range.end;
            
            if (startTime && endTime) {
              const [startHour, startMin] = startTime.split(':').map(Number);
              const [endHour, endMin] = endTime.split(':').map(Number);
              
              const startMinutes = startHour * 60 + startMin;
              const endMinutes = endHour * 60 + endMin;
              
              updatedRange.duration = endMinutes - startMinutes;
            }
          }
          
          return updatedRange;
        }
        return range;
      })
    }));
  };

  const removeTimeRange = (rangeId) => {
    setFormData(prev => ({
      ...prev,
      timeRanges: prev.timeRanges.filter(range => range.id !== rangeId)
    }));
  };

  const formatTimeRange = (range) => {
    const formatTime = (timeStr) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      const date = new Date();
      date.setHours(hours, minutes, 0, 0);
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    };
    
    const duration = Math.floor(range.duration / 60);
    const durationMinutes = range.duration % 60;
    const durationStr = durationMinutes > 0 ? `${duration}h ${durationMinutes}m` : `${duration}h`;
    
    return `${formatTime(range.start)} - ${formatTime(range.end)} (${durationStr})`;
  };

  const generateTimeSlots = () => {
    const slots = [];
    const startTime = formData.timeRangeStart || '09:00';
    const endTime = formData.timeRangeEnd || '17:00';
    const duration = formData.slotDuration || 30;
    
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    
    for (let minutes = startMinutes; minutes < endMinutes; minutes += duration) {
      const hour = Math.floor(minutes / 60);
      const minute = minutes % 60;
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push(timeString);
    }
    
    return slots;
  };

  const generateAndSetTimeSlots = () => {
    const slots = generateTimeSlots();
    setFormData(prev => ({ ...prev, timeSlots: slots }));
  };

  const handleDisabledDateToggle = (date) => {
    const dateString = date.toISOString().split('T')[0];
    setFormData(prev => ({
      ...prev,
      disabledDates: prev.disabledDates.includes(dateString)
        ? prev.disabledDates.filter(d => d !== dateString)
        : [...prev.disabledDates, dateString]
    }));
  };

  const isDateDisabled = (date) => {
    const dateString = date.toISOString().split('T')[0];
    return formData.disabledDates.includes(dateString);
  };

  const handleSaveConfiguration = async () => {
    // Validate form data before sending
    if (formData.availableDays.length === 0) {
      setError('Please select at least one available day');
      return;
    }

    try {
      console.log('🔍 Submitting configuration data:', {
        productId: selectedProduct.id,
        productTitle: selectedProduct.title,
        productPrice: selectedProduct.price,
        city: formData.city,
        availableDays: formData.availableDays,
        timeSlots: formData.timeSlots,
        timeRanges: formData.timeRanges,
        timeRangeStart: formData.timeRangeStart,
        timeRangeEnd: formData.timeRangeEnd,
        slotDuration: formData.slotDuration,
        disabledDates: formData.disabledDates,
        services: formData.services,
        duration: formData.duration,
        maxBookings: formData.maxBookings,
        bookingStartDate: formData.bookingStartDate,
        bookingEndDate: formData.bookingEndDate,
        isActive: formData.isActive
      });

      const response = await fetch('/api/product-booking-configs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: selectedProduct.id,
          productTitle: selectedProduct.title,
          productPrice: selectedProduct.price,
          city: formData.city,
          availableDays: formData.availableDays,
          timeSlots: formData.timeSlots,
          timeRanges: formData.timeRanges,
          timeRangeStart: formData.timeRangeStart,
          timeRangeEnd: formData.timeRangeEnd,
          slotDuration: formData.slotDuration,
          disabledDates: formData.disabledDates,
          services: formData.services,
          duration: formData.duration,
          maxBookings: formData.maxBookings,
          bookingStartDate: formData.bookingStartDate,
          bookingEndDate: formData.bookingEndDate,
          isActive: formData.isActive
        })
      });

      const data = await response.json();

      console.log('🔍 API Response:', data);
      console.log('🔍 Response status:', response.status);

      if (data.error) {
        console.error('❌ API Error:', data.error);
        console.error('❌ Error details:', data.details);
        setError(data.error);
      } else {
        setShowConfigModal(false);
        setSelectedProduct(null);
        setFormData({
          availableDays: [],
          timeSlots: [],
          timeRanges: [],
          duration: 480,
          maxBookings: 1,
          isActive: true
        });
        loadData(); // Reload data
      }
    } catch (err) {
      setError('Failed to save configuration');
      console.error('Error saving configuration:', err);
    }
  };

  const handleToggleConfig = async (configId, isActive) => {
    try {
      const response = await fetch('/api/product-booking-configs', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: configId,
          isActive: !isActive
        })
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        loadData(); // Reload data
      }
    } catch (err) {
      setError('Failed to update configuration');
      console.error('Error updating configuration:', err);
    }
  };

  const handleEditConfig = (config) => {
    const product = products.find(p => p.id === config.productId);
    setSelectedProduct(product);
    setEditingConfig(config);
    
    // Populate form with existing data
    setFormData({
      availableDays: JSON.parse(config.availableDays),
      timeSlots: JSON.parse(config.timeSlots || '[]'),
      timeRanges: JSON.parse(config.timeRanges || '[]'),
      timeRangeStart: config.timeRangeStart || '09:00',
      timeRangeEnd: config.timeRangeEnd || '17:00',
      slotDuration: config.slotDuration || 30,
      disabledDates: config.disabledDates ? JSON.parse(config.disabledDates) : [],
      services: config.services ? JSON.parse(config.services) : [],
      duration: config.duration || 480,
      maxBookings: config.maxBookings || 1,
      bookingStartDate: config.bookingStartDate || '',
      bookingEndDate: config.bookingEndDate || '',
      city: config.city || '',
      rating: config.productRating || 0,
      isActive: config.isActive
    });
    
    setShowEditModal(true);
  };

  const handleDeleteConfig = async (configId) => {
    if (!confirm('Are you sure you want to delete this configuration? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch('/api/product-booking-configs', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: configId })
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        loadData(); // Reload data
        setError(null);
      }
    } catch (err) {
      setError('Failed to delete configuration');
      console.error('Error deleting configuration:', err);
    }
  };

  const handleUpdateConfig = async () => {
    try {
      if (formData.availableDays.length === 0) {
        setError('Please select at least one available day');
        return;
      }

      const response = await fetch('/api/product-booking-configs', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingConfig.id,
          city: formData.city,
          availableDays: formData.availableDays,
          timeSlots: formData.timeSlots,
          timeRanges: formData.timeRanges,
          timeRangeStart: formData.timeRangeStart,
          timeRangeEnd: formData.timeRangeEnd,
          slotDuration: formData.slotDuration,
          disabledDates: formData.disabledDates,
          services: formData.services,
          duration: formData.duration,
          maxBookings: formData.maxBookings,
          bookingStartDate: formData.bookingStartDate,
          bookingEndDate: formData.bookingEndDate,
          isActive: formData.isActive
        })
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setShowEditModal(false);
        setEditingConfig(null);
        setError(null);
        loadData(); // Reload data
        
        // Reset form
        setFormData({
          availableDays: [],
          timeSlots: [],
          timeRanges: [],
          timeRangeStart: '09:00',
          timeRangeEnd: '17:00',
          slotDuration: 30,
          disabledDates: [],
          services: [],
          duration: 480,
          maxBookings: 1,
          bookingStartDate: '',
          bookingEndDate: '',
          isActive: true
        });
      }
    } catch (err) {
      setError('Failed to update configuration');
      console.error('Error updating configuration:', err);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const getConfiguredProductIds = () => {
    return configurations.map(config => config.productId);
  };

  const getAvailableProducts = () => {
    return products.filter(product => !getConfiguredProductIds().includes(product.id));
  };

  const getConfiguredProducts = () => {
    return products.filter(product => getConfiguredProductIds().includes(product.id));
  };

  if (isLoading) {
    return (
      <Page>
        <TitleBar title="Product Booking Configuration" />
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
        <TitleBar title="Product Booking Configuration" />
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
      <TitleBar title="Product Booking Configuration" />
      <Layout>
        <Layout.Section>
          <Card>
            <Box padding="400">
              <BlockStack gap="400">
                <InlineStack align="space-between">
                  <Text variant="headingMd">Configure Product Booking</Text>
                  <Button 
                    variant="primary" 
                    onClick={() => setShowProductModal(true)}
                    disabled={getAvailableProducts().length === 0}
                  >
                    Add Product
                  </Button>
                </InlineStack>
                
                <Text variant="bodyMd">
                  Select products to enable booking functionality. Configure time slots and availability for each product.
                </Text>

                <Divider />

                <BlockStack gap="300">
                  <Text variant="headingSm">Configured Products</Text>
                  
                  {getConfiguredProducts().length === 0 ? (
                    <Text variant="bodyMd" color="subdued">
                      No products configured yet. Click "Add Product" to get started.
                    </Text>
                  ) : (
                    <DataTable
                      columnContentTypes={['text', 'text', 'text', 'text', 'text', 'text']}
                      headings={['Product', 'Price', 'Status', 'Days', 'Time Slots', 'Actions']}
                      rows={getConfiguredProducts().map(product => {
                        const config = configurations.find(c => c.productId === product.id);
                        return [
                          product.title,
                          formatPrice(product.price),
                          <Badge status={config?.isActive ? 'success' : 'critical'}>
                            {config?.isActive ? 'Active' : 'Inactive'}
                          </Badge>,
                          config ? JSON.parse(config.availableDays).length + ' days' : 'Not set',
                          config ? JSON.parse(config.timeSlots).length + ' slots' : 'Not set',
                          <InlineStack gap="200">
                            <Button 
                              size="micro" 
                              variant="secondary"
                              onClick={() => handleEditConfig(config)}
                            >
                              Edit
                            </Button>
                            <Button 
                              size="micro" 
                              variant="critical"
                              onClick={() => handleDeleteConfig(config.id)}
                            >
                              Delete
                            </Button>
                          </InlineStack>
                        ];
                      })}
                    />
                  )}
                </BlockStack>

                <Divider />

                <BlockStack gap="200">
                  <Text variant="headingSm">How it works:</Text>
                  <ul style={{ margin: 0, paddingLeft: '20px' }}>
                    <li>Select products from your store to enable booking</li>
                    <li>Configure available days and time slots for each product</li>
                    <li>Customers will see booking forms on configured product pages</li>
                    <li>Manage all bookings from the Bookings section</li>
                  </ul>
                </BlockStack>
              </BlockStack>
            </Box>
          </Card>
        </Layout.Section>
      </Layout>

      {/* Product Selection Modal */}
      {showProductModal && (
        <Modal
          open={showProductModal}
          onClose={() => setShowProductModal(false)}
          title="Select Product to Configure"
          large
        >
          <Modal.Section>
            <BlockStack gap="400">
              <Text variant="bodyMd">
                Choose a product to enable booking functionality:
              </Text>
              
              <BlockStack gap="200">
                {getAvailableProducts().map((product) => (
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
                          Configure
                        </Button>
                      </InlineStack>
                    </Box>
                  </Card>
                ))}
              </BlockStack>

              {getAvailableProducts().length === 0 && (
                <Text variant="bodyMd" color="subdued">
                  All products are already configured.
                </Text>
              )}

              <InlineStack gap="200">
                <Button onClick={() => setShowProductModal(false)}>
                  Cancel
                </Button>
              </InlineStack>
            </BlockStack>
          </Modal.Section>
        </Modal>
      )}

      {/* Configuration Modal */}
      {showConfigModal && selectedProduct && (
        <Modal
          open={showConfigModal}
          onClose={() => {
            setShowConfigModal(false);
            setError(null);
          }}
          title={`Configure Booking for: ${selectedProduct.title}`}
          large
        >
          <Modal.Section>
            <BlockStack gap="400">
              {error && (
                <Banner status="critical">
                  <p>{error}</p>
                </Banner>
              )}
              
              <Banner status="info">
                <p>
                  Configure the booking settings for this product. Customers will be able to book appointments 
                  based on the days and time slots you set here.
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

              <Divider />

              <BlockStack gap="300">
                <Text variant="headingSm">City / Location</Text>
                <Text variant="bodySm" color="subdued">
                  Set the city where this service is available:
                </Text>
                
                <TextField
                  label="City"
                  value={formData.city}
                  onChange={(value) => handleInputChange('city', value)}
                  placeholder="e.g., New York, Los Angeles"
                  helpText="City where this service is available"
                />
              </BlockStack>

              <Divider />

              <BlockStack gap="300">
                <Text variant="headingSm">Available Days *</Text>
                <Text variant="bodySm" color="subdued">
                  Select at least one day when customers can book appointments:
                </Text>
                <InlineStack gap="200">
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                    <Checkbox
                      key={day}
                      label={day.charAt(0).toUpperCase() + day.slice(1)}
                      checked={formData.availableDays.includes(day)}
                      onChange={() => handleDayToggle(day)}
                    />
                  ))}
                </InlineStack>
                {formData.availableDays.length === 0 && (
                  <Banner status="warning">
                    <p>Please select at least one day for availability.</p>
                  </Banner>
                )}
              </BlockStack>

              <Divider />

              {/* Date Range Configuration */}
              <BlockStack gap="300">
                <Text variant="headingSm">📅 Booking Date Range (Optional)</Text>
                <Text variant="bodySm" color="subdued">
                  Set specific date range for booking availability. Leave empty for no date restrictions:
                </Text>
                
                <FormLayout.Group>
                  <TextField
                    label="Booking Start Date"
                    type="date"
                    value={formData.bookingStartDate}
                    onChange={(value) => handleInputChange('bookingStartDate', value)}
                    helpText="First date when bookings are available"
                  />
                  <TextField
                    label="Booking End Date"
                    type="date"
                    value={formData.bookingEndDate}
                    onChange={(value) => handleInputChange('bookingEndDate', value)}
                    helpText="Last date when bookings are available"
                  />
                </FormLayout.Group>
                
                {formData.bookingStartDate && formData.bookingEndDate && (
                  <Banner status="info">
                    <p>
                      <strong>Date Range:</strong> Bookings available from {new Date(formData.bookingStartDate).toLocaleDateString()} to {new Date(formData.bookingEndDate).toLocaleDateString()}
                    </p>
                  </Banner>
                )}
              </BlockStack>

              <Divider />

              <BlockStack gap="300">
                <Text variant="headingSm">Time Range Configuration</Text>
                <Text variant="bodySm" color="subdued">
                  Set the time range and slot duration for bookings:
                </Text>
                
                <FormLayout.Group>
                  <TextField
                    label="Start Time"
                    type="time"
                    value={formData.timeRangeStart}
                    onChange={(value) => handleInputChange('timeRangeStart', value)}
                    helpText="Earliest booking time"
                  />
                  
                  <TextField
                    label="End Time"
                    type="time"
                    value={formData.timeRangeEnd}
                    onChange={(value) => handleInputChange('timeRangeEnd', value)}
                    helpText="Latest booking time"
                  />
                </FormLayout.Group>

                <TextField
                  label="Slot Duration (minutes)"
                  type="number"
                  value={formData.slotDuration.toString()}
                  onChange={(value) => handleInputChange('slotDuration', parseInt(value))}
                  helpText="Duration of each time slot (e.g., 30 for 30-minute slots)"
                />

                <BlockStack gap="200">
                  <Text variant="bodyMd">
                    <strong>Generated Time Slots:</strong> {generateTimeSlots().length} slots
                  </Text>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', 
                    gap: '4px',
                    maxHeight: '150px',
                    overflowY: 'auto',
                    padding: '8px',
                    border: '1px solid #e1e5e9',
                    borderRadius: '4px',
                    backgroundColor: '#f6f6f7'
                  }}>
                    {generateTimeSlots().map(timeSlot => (
                      <div key={timeSlot} style={{ 
                        padding: '4px 8px', 
                        fontSize: '12px',
                        backgroundColor: '#fff',
                        border: '1px solid #e1e5e9',
                        borderRadius: '2px',
                        textAlign: 'center'
                      }}>
                        {timeSlot}
                      </div>
                    ))}
                  </div>
                </BlockStack>
              </BlockStack>

              <Divider />

              <BlockStack gap="300">
                <Text variant="headingSm">Disabled Dates</Text>
                <Text variant="bodySm" color="subdued">
                  Select specific dates when booking is not available:
                </Text>
                
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
                  gap: '8px',
                  maxHeight: '200px',
                  overflowY: 'auto'
                }}>
                  {Array.from({ length: 30 }, (_, i) => {
                    const date = new Date();
                    date.setDate(date.getDate() + i);
                    const dateString = date.toISOString().split('T')[0];
                    const isDisabled = isDateDisabled(date);
                    
                    return (
                      <div key={dateString} style={{ 
                        padding: '8px',
                        border: '1px solid #e1e5e9',
                        borderRadius: '4px',
                        backgroundColor: isDisabled ? '#fef2f2' : '#fff',
                        cursor: 'pointer'
                      }} onClick={() => handleDisabledDateToggle(date)}>
                        <Text variant="bodySm" color={isDisabled ? 'critical' : 'base'}>
                          {date.toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </Text>
                        {isDisabled && (
                          <Text variant="bodySm" color="critical">
                            Disabled
                          </Text>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {formData.disabledDates.length > 0 && (
                  <BlockStack gap="200">
                    <Text variant="bodyMd">
                      <strong>Disabled Dates ({formData.disabledDates.length}):</strong>
                    </Text>
                    <div style={{ 
                      display: 'flex', 
                      flexWrap: 'wrap', 
                      gap: '4px' 
                    }}>
                      {formData.disabledDates.map(date => (
                        <Badge key={date} status="critical">
                          {new Date(date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </Badge>
                      ))}
                    </div>
                  </BlockStack>
                )}
              </BlockStack>

              <Divider />

              {/* Services Configuration */}
              <BlockStack gap="300">
                <Text variant="headingMd">Additional Services</Text>
                <Text variant="bodyMd" color="subdued">
                  Configure additional services that customers can add to their booking
                </Text>
                
                {formData.services.map((service, index) => (
                  <Card key={service.id}>
                    <BlockStack gap="300">
                      <InlineStack align="space-between">
                        <Text variant="headingSm">Service {index + 1}</Text>
                        <Button 
                          size="micro" 
                          variant="plain" 
                          onClick={() => removeService(service.id)}
                        >
                          Remove
                        </Button>
                      </InlineStack>
                      
                      <FormLayout>
                        <FormLayout.Group>
                          <TextField
                            label="Service Name"
                            value={service.name}
                            onChange={(value) => updateService(service.id, 'name', value)}
                            placeholder="e.g., Extra Photography, Catering"
                          />
                          <TextField
                            label="Price"
                            type="number"
                            value={service.price.toString()}
                            onChange={(value) => updateService(service.id, 'price', parseFloat(value) || 0)}
                            prefix="$"
                          />
                        </FormLayout.Group>
                        
                        <TextField
                          label="Description"
                          value={service.description}
                          onChange={(value) => updateService(service.id, 'description', value)}
                          multiline={2}
                          placeholder="Brief description of the service"
                        />
                      </FormLayout>
                    </BlockStack>
                  </Card>
                ))}
                
                <Button onClick={addService} variant="secondary">
                  Add Service
                </Button>
              </BlockStack>

              <Divider />

              <FormLayout.Group>
                <TextField
                  label="Duration (minutes)"
                  type="number"
                  value={formData.duration.toString()}
                  onChange={(value) => handleInputChange('duration', parseInt(value))}
                  helpText="How long each booking lasts"
                />
                
                <TextField
                  label="Max Bookings per Slot"
                  type="number"
                  value={formData.maxBookings.toString()}
                  onChange={(value) => handleInputChange('maxBookings', parseInt(value))}
                  helpText="Maximum bookings allowed per time slot"
                />
              </FormLayout.Group>

              {/* Time Ranges Configuration */}
              <Card>
                <BlockStack gap="300">
                  <Text variant="headingMd">⏰ Time Ranges Configuration</Text>
                  <Text variant="bodyMd" color="subdued">
                    Configure specific time ranges when your service is available. Each range represents a block of time when bookings can be made.
                  </Text>
                  
                  <Button onClick={addTimeRange} variant="primary">
                    Add Time Range
                  </Button>

                  {formData.timeRanges.length > 0 && (
                    <BlockStack gap="300">
                      {formData.timeRanges.map((range, index) => (
                        <Card key={range.id} sectioned>
                          <BlockStack gap="300">
                            <InlineStack align="space-between">
                              <Text variant="headingSm">Time Range {index + 1}</Text>
                              <Button 
                                size="micro" 
                                variant="plain" 
                                onClick={() => removeTimeRange(range.id)}
                              >
                                Remove
                              </Button>
                            </InlineStack>
                            
                            <FormLayout>
                              <FormLayout.Group>
                                <TextField
                                  label="Start Time"
                                  type="time"
                                  value={range.start}
                                  onChange={(value) => updateTimeRange(range.id, 'start', value)}
                                />
                                <TextField
                                  label="End Time"
                                  type="time"
                                  value={range.end}
                                  onChange={(value) => updateTimeRange(range.id, 'end', value)}
                                />
                                <TextField
                                  label="Duration (minutes)"
                                  type="number"
                                  value={range.duration.toString()}
                                  onChange={(value) => updateTimeRange(range.id, 'duration', parseInt(value) || 120)}
                                  helpText="Auto-calculated from start/end times"
                                  readOnly
                                />
                              </FormLayout.Group>
                            </FormLayout>

                            <Banner status="info">
                              <p><strong>Preview:</strong> {formatTimeRange(range)}</p>
                            </Banner>
                          </BlockStack>
                        </Card>
                      ))}
                      
                      <Banner status="success">
                        <p>
                          <strong>Total Time Ranges:</strong> {formData.timeRanges.length} configured
                        </p>
                      </Banner>
                    </BlockStack>
                  )}

                  {formData.timeRanges.length === 0 && (
                    <Banner status="warning">
                      <p>No time ranges configured. Add at least one time range to enable bookings.</p>
                    </Banner>
                  )}
                </BlockStack>
              </Card>

              <Checkbox
                label="Enable booking for this product"
                checked={formData.isActive}
                onChange={(checked) => handleInputChange('isActive', checked)}
              />

              <InlineStack gap="200">
                <Button 
                  variant="primary" 
                  onClick={handleSaveConfiguration}
                >
                  Save Configuration
                </Button>
                
                <Button onClick={() => setShowConfigModal(false)}>
                  Cancel
                </Button>
              </InlineStack>
            </BlockStack>
          </Modal.Section>
        </Modal>
      )}

      {/* Edit Configuration Modal */}
      {showEditModal && editingConfig && selectedProduct && (
        <Modal
          open={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingConfig(null);
            setSelectedProduct(null);
          }}
          title={`Edit Configuration - ${selectedProduct.title}`}
          large
        >
          <Modal.Section>
            <BlockStack gap="400">
              {error && (
                <Banner status="critical">
                  <p>{error}</p>
                </Banner>
              )}

              {/* Product Info */}
              <Card>
                <BlockStack gap="200">
                  <Text variant="headingMd">Product Information</Text>
                  <InlineStack gap="400">
                    <Box>
                      <Text variant="bodyMd" fontWeight="bold">Product:</Text>
                      <Text variant="bodyMd">{selectedProduct.title}</Text>
                    </Box>
                    <Box>
                      <Text variant="bodyMd" fontWeight="bold">Price:</Text>
                      <Text variant="bodyMd">{formatPrice(selectedProduct.price)}</Text>
                    </Box>
                  </InlineStack>
                </BlockStack>
              </Card>

              {/* City / Location */}
              <Card>
                <BlockStack gap="300">
                  <Text variant="headingMd">City / Location</Text>
                  <Text variant="bodyMd" color="subdued">
                    Set the city where this service is available:
                  </Text>
                  
                  <TextField
                    label="City"
                    value={formData.city}
                    onChange={(value) => handleInputChange('city', value)}
                    placeholder="e.g., New York, Los Angeles"
                    helpText="City where this service is available"
                  />
                </BlockStack>
              </Card>

              {/* Available Days */}
              <Card>
                <BlockStack gap="300">
                  <Text variant="headingMd">Available Days</Text>
                  <Text variant="bodyMd" color="subdued">
                    Select the days when this product can be booked
                  </Text>
                  
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                      <Button
                        key={day}
                        size="small"
                        variant={formData.availableDays.includes(day) ? "primary" : "secondary"}
                        onClick={() => handleDayToggle(day)}
                      >
                        {day.charAt(0).toUpperCase() + day.slice(1)}
                      </Button>
                    ))}
                  </div>
                </BlockStack>
              </Card>

              {/* Date Range Configuration */}
              <Card>
                <BlockStack gap="300">
                  <Text variant="headingMd">📅 Booking Date Range (Optional)</Text>
                  <Text variant="bodyMd" color="subdued">
                    Set specific date range for booking availability. Leave empty for no date restrictions:
                  </Text>
                  
                  <FormLayout.Group>
                    <TextField
                      label="Booking Start Date"
                      type="date"
                      value={formData.bookingStartDate}
                      onChange={(value) => handleInputChange('bookingStartDate', value)}
                      helpText="First date when bookings are available"
                    />
                    <TextField
                      label="Booking End Date"
                      type="date"
                      value={formData.bookingEndDate}
                      onChange={(value) => handleInputChange('bookingEndDate', value)}
                      helpText="Last date when bookings are available"
                    />
                  </FormLayout.Group>
                  
                  {formData.bookingStartDate && formData.bookingEndDate && (
                    <Banner status="info">
                      <p>
                        <strong>Date Range:</strong> Bookings available from {new Date(formData.bookingStartDate).toLocaleDateString()} to {new Date(formData.bookingEndDate).toLocaleDateString()}
                      </p>
                    </Banner>
                  )}
                </BlockStack>
              </Card>

              {/* Time Configuration */}
              <Card>
                <BlockStack gap="300">
                  <Text variant="headingMd">Time Configuration</Text>
                  
                  <FormLayout>
                    <FormLayout.Group>
                      <TextField
                        label="Start Time"
                        type="time"
                        value={formData.timeRangeStart}
                        onChange={(value) => handleInputChange('timeRangeStart', value)}
                      />
                      <TextField
                        label="End Time"
                        type="time"
                        value={formData.timeRangeEnd}
                        onChange={(value) => handleInputChange('timeRangeEnd', value)}
                      />
                      <TextField
                        label="Slot Duration (minutes)"
                        type="number"
                        value={formData.slotDuration.toString()}
                        onChange={(value) => handleInputChange('slotDuration', parseInt(value) || 30)}
                      />
                    </FormLayout.Group>
                    
                    <FormLayout.Group>
                      <TextField
                        label="Service Duration (minutes)"
                        type="number"
                        value={formData.duration.toString()}
                        onChange={(value) => handleInputChange('duration', parseInt(value) || 480)}
                        helpText="How long each booking lasts"
                      />
                      <TextField
                        label="Max Bookings"
                        type="number"
                        value={formData.maxBookings.toString()}
                        onChange={(value) => handleInputChange('maxBookings', parseInt(value) || 1)}
                        helpText="Maximum bookings per time slot"
                      />
                    </FormLayout.Group>
                  </FormLayout>

                  <Button onClick={generateAndSetTimeSlots}>
                    Generate Time Slots
                  </Button>

                  {formData.timeSlots.length > 0 && (
                    <BlockStack gap="200">
                      <Text variant="bodyMd">
                        <strong>Generated Time Slots ({formData.timeSlots.length}):</strong>
                      </Text>
                      <div style={{ 
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        gap: '4px' 
                      }}>
                        {formData.timeSlots.map(timeSlot => (
                          <Badge key={timeSlot} status="info">
                            {timeSlot}
                          </Badge>
                        ))}
                      </div>
                    </BlockStack>
                  )}
                </BlockStack>
              </Card>

              {/* Time Ranges Configuration */}
              <Card>
                <BlockStack gap="300">
                  <Text variant="headingMd">⏰ Time Ranges Configuration</Text>
                  <Text variant="bodyMd" color="subdued">
                    Configure specific time ranges when your service is available. Each range represents a block of time when bookings can be made.
                  </Text>
                  
                  <Button onClick={addTimeRange} variant="primary">
                    Add Time Range
                  </Button>

                  {formData.timeRanges.length > 0 && (
                    <BlockStack gap="300">
                      {formData.timeRanges.map((range, index) => (
                        <Card key={range.id} sectioned>
                          <BlockStack gap="300">
                            <InlineStack align="space-between">
                              <Text variant="headingSm">Time Range {index + 1}</Text>
                              <Button 
                                size="micro" 
                                variant="plain" 
                                onClick={() => removeTimeRange(range.id)}
                              >
                                Remove
                              </Button>
                            </InlineStack>
                            
                            <FormLayout>
                              <FormLayout.Group>
                                <TextField
                                  label="Start Time"
                                  type="time"
                                  value={range.start}
                                  onChange={(value) => updateTimeRange(range.id, 'start', value)}
                                />
                                <TextField
                                  label="End Time"
                                  type="time"
                                  value={range.end}
                                  onChange={(value) => updateTimeRange(range.id, 'end', value)}
                                />
                                <TextField
                                  label="Duration (minutes)"
                                  type="number"
                                  value={range.duration.toString()}
                                  onChange={(value) => updateTimeRange(range.id, 'duration', parseInt(value) || 120)}
                                  helpText="Auto-calculated from start/end times"
                                  readOnly
                                />
                              </FormLayout.Group>
                            </FormLayout>

                            <Banner status="info">
                              <p><strong>Preview:</strong> {formatTimeRange(range)}</p>
                            </Banner>
                          </BlockStack>
                        </Card>
                      ))}
                      
                      <Banner status="success">
                        <p>
                          <strong>Total Time Ranges:</strong> {formData.timeRanges.length} configured
                        </p>
                      </Banner>
                    </BlockStack>
                  )}

                  {formData.timeRanges.length === 0 && (
                    <Banner status="warning">
                      <p>No time ranges configured. Add at least one time range to enable bookings.</p>
                    </Banner>
                  )}
                </BlockStack>
              </Card>

              {/* Services Configuration */}
              <Card>
                <BlockStack gap="300">
                  <Text variant="headingMd">Additional Services</Text>
                  <Text variant="bodyMd" color="subdued">
                    Configure additional services that customers can add to their booking
                  </Text>
                  
                  {formData.services.map((service, index) => (
                    <Card key={service.id}>
                      <BlockStack gap="300">
                        <InlineStack align="space-between">
                          <Text variant="headingSm">Service {index + 1}</Text>
                          <Button 
                            size="micro" 
                            variant="plain" 
                            onClick={() => removeService(service.id)}
                          >
                            Remove
                          </Button>
                        </InlineStack>
                        
                        <FormLayout>
                          <FormLayout.Group>
                            <TextField
                              label="Service Name"
                              value={service.name}
                              onChange={(value) => updateService(service.id, 'name', value)}
                              placeholder="e.g., Extra Photography, Catering"
                            />
                            <TextField
                              label="Price"
                              type="number"
                              value={service.price.toString()}
                              onChange={(value) => updateService(service.id, 'price', parseFloat(value) || 0)}
                              prefix="$"
                            />
                          </FormLayout.Group>
                          
                          <TextField
                            label="Description"
                            value={service.description}
                            onChange={(value) => updateService(service.id, 'description', value)}
                            multiline={2}
                            placeholder="Brief description of the service"
                          />
                        </FormLayout>
                      </BlockStack>
                    </Card>
                  ))}
                  
                  <Button onClick={addService} variant="secondary">
                    Add Service
                  </Button>
                </BlockStack>
              </Card>

              {/* Status */}
              <Card>
                <BlockStack gap="200">
                  <Text variant="headingMd">Configuration Status</Text>
                  <Checkbox
                    label="Active (Enable booking for this product)"
                    checked={formData.isActive}
                    onChange={(checked) => handleInputChange('isActive', checked)}
                  />
                </BlockStack>
              </Card>

              <InlineStack gap="200">
                <Button 
                  variant="primary" 
                  onClick={handleUpdateConfig}
                >
                  Update Configuration
                </Button>
                
                <Button onClick={() => {
                  setShowEditModal(false);
                  setEditingConfig(null);
                  setSelectedProduct(null);
                }}>
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
