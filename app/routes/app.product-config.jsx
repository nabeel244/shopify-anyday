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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    availableDays: [],
    timeSlots: [],
    timeRangeStart: '09:00',
    timeRangeEnd: '17:00',
    slotDuration: 30,
    disabledDates: [],
    duration: 480,
    maxBookings: 1,
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
      const response = await fetch('/api/product-booking-configs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: selectedProduct.id,
          productTitle: selectedProduct.title,
          productPrice: selectedProduct.price,
          availableDays: formData.availableDays,
          timeSlots: formData.timeSlots,
          timeRangeStart: formData.timeRangeStart,
          timeRangeEnd: formData.timeRangeEnd,
          slotDuration: formData.slotDuration,
          disabledDates: formData.disabledDates,
          duration: formData.duration,
          maxBookings: formData.maxBookings,
          isActive: formData.isActive
        })
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setShowConfigModal(false);
        setSelectedProduct(null);
        setFormData({
          availableDays: [],
          timeSlots: [],
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
                      columnContentTypes={['text', 'text', 'text', 'text', 'text']}
                      headings={['Product', 'Price', 'Status', 'Days', 'Time Slots']}
                      rows={getConfiguredProducts().map(product => {
                        const config = configurations.find(c => c.productId === product.id);
                        return [
                          product.title,
                          formatPrice(product.price),
                          <Badge status={config?.isActive ? 'success' : 'critical'}>
                            {config?.isActive ? 'Active' : 'Inactive'}
                          </Badge>,
                          config ? JSON.parse(config.availableDays).length + ' days' : 'Not set',
                          config ? JSON.parse(config.timeSlots).length + ' slots' : 'Not set'
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
    </Page>
  );
}
