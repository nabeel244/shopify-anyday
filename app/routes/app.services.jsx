import { useState, useEffect } from "react";
import { useFetcher } from "@remix-run/react";
import { authenticate } from "../shopify.server";
import {
  Page,
  Layout,
  Card,
  DataTable,
  Button,
  Text,
  BlockStack,
  InlineStack,
  TextField,
  Modal,
  Banner,
  Spinner,
  EmptyState,
  FormLayout,
  Badge,
  Box
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

export default function ServicesManagement() {
  const fetcher = useFetcher();
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/services');
      const data = await response.json();
      
      if (data.error) {
        console.error('Failed to load services:', data.error);
      } else {
        setServices(data.services || []);
      }
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Service name is required';
    if (!formData.price.trim()) newErrors.price = 'Price is required';
    else if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Price must be a positive number';
    }
    if (!formData.duration.trim()) newErrors.duration = 'Duration is required';
    else if (isNaN(parseInt(formData.duration)) || parseInt(formData.duration) <= 0) {
      newErrors.duration = 'Duration must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (data.error) {
        console.error('Failed to save service:', data.error);
      } else {
        setServices(prev => [...prev, data.service]);
        resetForm();
        setShowModal(false);
      }
    } catch (error) {
      console.error('Error saving service:', error);
    }
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;

    try {
      const response = await fetch(`/api/services/${editingService.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (data.error) {
        console.error('Failed to update service:', data.error);
      } else {
        setServices(prev => prev.map(service => 
          service.id === editingService.id ? data.service : service
        ));
        resetForm();
        setShowModal(false);
        setEditingService(null);
      }
    } catch (error) {
      console.error('Error updating service:', error);
    }
  };

  const handleDelete = async (serviceId) => {
    if (!confirm('Are you sure you want to delete this service?')) return;

    try {
      const response = await fetch(`/api/services/${serviceId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (data.error) {
        console.error('Failed to delete service:', data.error);
      } else {
        setServices(prev => prev.filter(service => service.id !== serviceId));
      }
    } catch (error) {
      console.error('Error deleting service:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      duration: ''
    });
    setErrors({});
  };

  const openEditModal = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || '',
      price: service.price.toString(),
      duration: service.duration.toString()
    });
    setShowModal(true);
  };

  const openCreateModal = () => {
    setEditingService(null);
    resetForm();
    setShowModal(true);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const tableRows = services.map(service => [
    service.name,
    service.description || '-',
    formatPrice(service.price),
    `${service.duration} minutes`,
    <Badge status={service.isActive ? 'success' : 'critical'}>
      {service.isActive ? 'Active' : 'Inactive'}
    </Badge>,
    <InlineStack gap="100">
      <Button 
        size="slim" 
        onClick={() => openEditModal(service)}
      >
        Edit
      </Button>
      <Button 
        size="slim" 
        variant="critical"
        onClick={() => handleDelete(service.id)}
      >
        Delete
      </Button>
    </InlineStack>
  ]);

  return (
    <Page>
      <TitleBar title="Services Management">
        <button variant="primary" onClick={openCreateModal}>
          Add Service
        </button>
      </TitleBar>
      
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <InlineStack align="space-between">
                <Text variant="headingMd">Services</Text>
                <Button onClick={loadServices} loading={isLoading}>
                  Refresh
                </Button>
              </InlineStack>
              
              {isLoading ? (
                <Box padding="800">
                  <InlineStack align="center">
                    <Spinner size="large" />
                    <Text variant="bodyMd">Loading services...</Text>
                  </InlineStack>
                </Box>
              ) : services.length === 0 ? (
                <EmptyState
                  heading="No services found"
                  image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                >
                  <p>Create your first service to start accepting bookings.</p>
                  <Button variant="primary" onClick={openCreateModal}>
                    Add Service
                  </Button>
                </EmptyState>
              ) : (
                <DataTable
                  columnContentTypes={[
                    'text',
                    'text',
                    'text',
                    'text',
                    'text',
                    'text'
                  ]}
                  headings={[
                    'Service Name',
                    'Description',
                    'Price',
                    'Duration',
                    'Status',
                    'Actions'
                  ]}
                  rows={tableRows}
                />
              )}
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
      
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingService ? 'Edit Service' : 'Add New Service'}
        large
      >
        <Modal.Section>
          <FormLayout>
            <TextField
              label="Service Name"
              value={formData.name}
              onChange={(value) => setFormData(prev => ({ ...prev, name: value }))}
              error={errors.name}
              autoComplete="off"
            />
            
            <TextField
              label="Description"
              value={formData.description}
              onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
              placeholder="Describe what this service includes..."
              multiline={3}
            />
            
            <FormLayout.Group>
              <TextField
                label="Price ($)"
                type="number"
                value={formData.price}
                onChange={(value) => setFormData(prev => ({ ...prev, price: value }))}
                error={errors.price}
                prefix="$"
                autoComplete="off"
              />
              
              <TextField
                label="Duration (minutes)"
                type="number"
                value={formData.duration}
                onChange={(value) => setFormData(prev => ({ ...prev, duration: value }))}
                error={errors.duration}
                suffix="min"
                autoComplete="off"
              />
            </FormLayout.Group>
          </FormLayout>
        </Modal.Section>
        
        <Modal.Section>
          <InlineStack align="space-between">
            <Button onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={editingService ? handleUpdate : handleSubmit}
            >
              {editingService ? 'Update Service' : 'Create Service'}
            </Button>
          </InlineStack>
        </Modal.Section>
      </Modal>
    </Page>
  );
}
