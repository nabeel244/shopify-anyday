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
  Select,
  TextField,
  Badge,
  Modal,
  Banner,
  Spinner,
  EmptyState,
  Box,
  Divider,
  FormLayout
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

export default function BookingsDashboard() {
  const fetcher = useFetcher();
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    search: ''
  });
  const [statistics, setStatistics] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    cancelled: 0,
    completed: 0
  });

  useEffect(() => {
    loadBookings();
  }, [filters]);

  const loadBookings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/bookings');
      const data = await response.json();
      
      if (data.error) {
        console.error('Failed to load bookings:', data.error);
      } else {
        setBookings(data.bookings || []);
        calculateStatistics(data.bookings || []);
      }
    } catch (err) {
      console.error('Error loading bookings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStatistics = (bookingsData) => {
    const stats = {
      total: bookingsData.length,
      pending: bookingsData.filter(b => b.status === 'PENDING').length,
      confirmed: bookingsData.filter(b => b.status === 'CONFIRMED').length,
      cancelled: bookingsData.filter(b => b.status === 'CANCELLED').length,
      completed: bookingsData.filter(b => b.status === 'COMPLETED').length
    };
    setStatistics(stats);
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      const response = await fetch('/api/bookings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: bookingId,
          status: newStatus
        })
      });

      const data = await response.json();

      if (data.error) {
        console.error('Failed to update booking status:', data.error);
      } else {
        loadBookings(); // Reload bookings
      }
    } catch (err) {
      console.error('Error updating booking status:', err);
    }
  };

  const handleViewBooking = (booking) => {
    setSelectedBooking(booking);
    setModalAction('view');
    setShowModal(true);
  };

  const handleEditBooking = (booking) => {
    setSelectedBooking(booking);
    setModalAction('edit');
    setShowModal(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return timeString;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { status: 'warning', text: 'Pending' },
      CONFIRMED: { status: 'success', text: 'Confirmed' },
      CANCELLED: { status: 'critical', text: 'Cancelled' },
      COMPLETED: { status: 'info', text: 'Completed' }
    };
    
    const config = statusConfig[status] || { status: 'info', text: status };
    return <Badge status={config.status}>{config.text}</Badge>;
  };

  const filteredBookings = bookings.filter(booking => {
    if (filters.status && booking.status !== filters.status) return false;
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      return (
        booking.user.firstName.toLowerCase().includes(searchTerm) ||
        booking.user.lastName.toLowerCase().includes(searchTerm) ||
        booking.user.email.toLowerCase().includes(searchTerm) ||
        (booking.service?.name || booking.productBookingConfig?.productTitle || '').toLowerCase().includes(searchTerm)
      );
    }
    return true;
  });

  if (isLoading) {
    return (
      <Page>
        <TitleBar title="Bookings Dashboard" />
        <Layout>
          <Layout.Section>
            <Card>
              <Box padding="400">
                <InlineStack align="center">
                  <Spinner size="small" />
                  <Text variant="bodyMd">Loading bookings...</Text>
                </InlineStack>
              </Box>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  return (
    <Page>
      <TitleBar title="Bookings Dashboard" />
      <Layout>
        {/* Statistics Cards */}
        <Layout.Section>
          <InlineStack gap="400">
            <Card>
              <Box padding="400">
                <BlockStack gap="200">
                  <Text variant="headingLg" color="success">{statistics.total}</Text>
                  <Text variant="bodyMd" color="subdued">Total Bookings</Text>
                </BlockStack>
              </Box>
            </Card>
            
            <Card>
              <Box padding="400">
                <BlockStack gap="200">
                  <Text variant="headingLg" color="info">{statistics.confirmed}</Text>
                  <Text variant="bodyMd" color="subdued">Confirmed</Text>
                </BlockStack>
              </Box>
            </Card>
            
            <Card>
              <Box padding="400">
                <BlockStack gap="200">
                  <Text variant="headingLg" color="warning">{statistics.pending}</Text>
                  <Text variant="bodyMd" color="subdued">Pending</Text>
                </BlockStack>
              </Box>
            </Card>
            
            <Card>
              <Box padding="400">
                <BlockStack gap="200">
                  <Text variant="headingLg" color="critical">{statistics.cancelled}</Text>
                  <Text variant="bodyMd" color="subdued">Cancelled</Text>
                </BlockStack>
              </Box>
            </Card>
            
            <Card>
              <Box padding="400">
                <BlockStack gap="200">
                  <Text variant="headingLg" color="info">{statistics.completed}</Text>
                  <Text variant="bodyMd" color="subdued">Completed</Text>
                </BlockStack>
              </Box>
            </Card>
          </InlineStack>
        </Layout.Section>

        {/* Filters and Actions */}
        <Layout.Section>
          <Card>
            <Box padding="400">
              <BlockStack gap="400">
                <InlineStack align="space-between">
                  <Text variant="headingMd">All Bookings</Text>
                  <Button onClick={loadBookings}>Refresh</Button>
                </InlineStack>
                
                <InlineStack gap="300">
                  <div style={{ minWidth: '200px' }}>
                    <Select
                      label="Filter by Status"
                      options={[
                        { label: 'All Statuses', value: '' },
                        { label: 'Pending', value: 'PENDING' },
                        { label: 'Confirmed', value: 'CONFIRMED' },
                        { label: 'Cancelled', value: 'CANCELLED' },
                        { label: 'Completed', value: 'COMPLETED' }
                      ]}
                      value={filters.status}
                      onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                    />
                  </div>
                  
                  <div style={{ minWidth: '300px' }}>
                    <TextField
                      label="Search"
                      value={filters.search}
                      onChange={(value) => setFilters(prev => ({ ...prev, search: value }))}
                      placeholder="Search by name, email, or service..."
                    />
                  </div>
                </InlineStack>
              </BlockStack>
            </Box>
          </Card>
        </Layout.Section>

        {/* Bookings Table */}
        <Layout.Section>
          <Card>
            {filteredBookings.length === 0 ? (
              <Box padding="400">
                <EmptyState
                  heading="No bookings found"
                  image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                >
                  <p>No bookings match your current filters.</p>
                </EmptyState>
              </Box>
            ) : (
              <DataTable
                columnContentTypes={['text', 'text', 'text', 'text', 'text', 'text', 'text', 'text']}
                headings={['Customer', 'Service', 'Date', 'Time', 'Price', 'Status', 'Created', 'Actions']}
                rows={filteredBookings.map(booking => [
                  `${booking.user.firstName} ${booking.user.lastName}`,
                  booking.service?.name || booking.productBookingConfig?.productTitle || 'Unknown',
                  formatDate(booking.bookingDate),
                  `${formatTime(booking.startTime)} - ${formatTime(booking.endTime)}`,
                  formatPrice(booking.totalPrice),
                  getStatusBadge(booking.status),
                  formatDate(booking.createdAt),
                  <InlineStack gap="100">
                    <Button 
                      size="slim" 
                      onClick={() => handleViewBooking(booking)}
                    >
                      View
                    </Button>
                    <Button 
                      size="slim" 
                      onClick={() => handleEditBooking(booking)}
                    >
                      Edit
                    </Button>
                  </InlineStack>
                ])}
              />
            )}
          </Card>
        </Layout.Section>
      </Layout>

      {/* Booking Details Modal */}
      {showModal && selectedBooking && (
        <Modal
          open={showModal}
          onClose={() => setShowModal(false)}
          title={`Booking Details - ${selectedBooking.user.firstName} ${selectedBooking.user.lastName}`}
          large
        >
          <Modal.Section>
            <BlockStack gap="400">
              <Banner status="info">
                <p>
                  Booking ID: <strong>{selectedBooking.id}</strong>
                </p>
              </Banner>

              <FormLayout>
                <FormLayout.Group>
                  <TextField
                    label="Customer Name"
                    value={`${selectedBooking.user.firstName} ${selectedBooking.user.lastName}`}
                    readOnly
                  />
                  
                  <TextField
                    label="Email"
                    value={selectedBooking.user.email}
                    readOnly
                  />
                </FormLayout.Group>

                <FormLayout.Group>
                  <TextField
                    label="Phone"
                    value={selectedBooking.user.phone}
                    readOnly
                  />
                  
                  <TextField
                    label="Service"
                    value={selectedBooking.service?.name || selectedBooking.productBookingConfig?.productTitle || 'Unknown'}
                    readOnly
                  />
                </FormLayout.Group>

                <FormLayout.Group>
                  <TextField
                    label="Booking Date"
                    value={formatDate(selectedBooking.bookingDate)}
                    readOnly
                  />
                  
                  <TextField
                    label="Time"
                    value={`${formatTime(selectedBooking.startTime)} - ${formatTime(selectedBooking.endTime)}`}
                    readOnly
                  />
                </FormLayout.Group>

                <FormLayout.Group>
                  <TextField
                    label="Total Price"
                    value={formatPrice(selectedBooking.totalPrice)}
                    readOnly
                  />
                  
                  <Select
                    label="Status"
                    options={[
                      { label: 'Pending', value: 'PENDING' },
                      { label: 'Confirmed', value: 'CONFIRMED' },
                      { label: 'Cancelled', value: 'CANCELLED' },
                      { label: 'Completed', value: 'COMPLETED' }
                    ]}
                    value={selectedBooking.status}
                    onChange={(value) => {
                      setSelectedBooking(prev => ({ ...prev, status: value }));
                      handleStatusChange(selectedBooking.id, value);
                    }}
                  />
                </FormLayout.Group>

                <TextField
                  label="Special Requests"
                  value={selectedBooking.specialRequests || 'None'}
                  readOnly
                  multiline={3}
                />
              </FormLayout>

              <InlineStack gap="200">
                <Button onClick={() => setShowModal(false)}>
                  Close
                </Button>
              </InlineStack>
            </BlockStack>
          </Modal.Section>
        </Modal>
      )}
    </Page>
  );
}