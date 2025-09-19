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
  Box
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
    search: '',
    dateRange: { start: null, end: null }
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    loadBookings();
  }, [filters, currentPage]);

  const loadBookings = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);
      if (filters.dateRange.start) params.append('startDate', filters.dateRange.start.toISOString());
      if (filters.dateRange.end) params.append('endDate', filters.dateRange.end.toISOString());
      params.append('page', currentPage);
      params.append('limit', itemsPerPage);

      const response = await fetch(`/api/bookings?${params}`);
      const data = await response.json();
      
      if (data.error) {
        console.error('Failed to load bookings:', data.error);
      } else {
        setBookings(data.bookings || []);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      
      if (data.success) {
        setBookings(prev => prev.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: newStatus }
            : booking
        ));
      } else {
        console.error('Failed to update booking status:', data.error);
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (data.success) {
        setBookings(prev => prev.filter(booking => booking.id !== bookingId));
        setShowModal(false);
      } else {
        console.error('Failed to delete booking:', data.error);
      }
    } catch (error) {
      console.error('Error deleting booking:', error);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      PENDING: { status: 'warning', children: 'Pending' },
      CONFIRMED: { status: 'success', children: 'Confirmed' },
      CANCELLED: { status: 'critical', children: 'Cancelled' },
      COMPLETED: { status: 'info', children: 'Completed' }
    };
    
    return <Badge {...statusMap[status]} />;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (timeString) => {
    return timeString;
  };

  const filteredBookings = bookings.filter(booking => {
    if (filters.status && booking.status !== filters.status) return false;
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const customerName = `${booking.user.firstName} ${booking.user.lastName}`.toLowerCase();
      const serviceName = booking.service.name.toLowerCase();
      const email = booking.user.email.toLowerCase();
      
      if (!customerName.includes(searchTerm) && 
          !serviceName.includes(searchTerm) && 
          !email.includes(searchTerm)) {
        return false;
      }
    }
    return true;
  });

  const tableRows = filteredBookings.map(booking => [
    `${booking.user.firstName} ${booking.user.lastName}`,
    booking.user.email,
    booking.user.phone,
    booking.service.name,
    `$${booking.totalPrice}`,
    formatDate(booking.bookingDate),
    `${booking.startTime} - ${booking.endTime}`,
    getStatusBadge(booking.status),
    <InlineStack gap="100">
      <Button 
        size="slim" 
        onClick={() => {
          setSelectedBooking(booking);
          setModalAction('view');
          setShowModal(true);
        }}
      >
        View
      </Button>
      <Button 
        size="slim" 
        onClick={() => {
          setSelectedBooking(booking);
          setModalAction('edit');
          setShowModal(true);
        }}
      >
        Edit
      </Button>
    </InlineStack>
  ]);

  const statusOptions = [
    { label: 'All Statuses', value: '' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Confirmed', value: 'CONFIRMED' },
    { label: 'Cancelled', value: 'CANCELLED' },
    { label: 'Completed', value: 'COMPLETED' }
  ];

  const renderModal = () => {
    if (!selectedBooking) return null;

    return (
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={modalAction === 'view' ? 'Booking Details' : 'Edit Booking'}
        large
      >
        <Modal.Section>
          <BlockStack gap="400">
            {modalAction === 'view' ? (
              <BlockStack gap="300">
                <Text variant="headingMd">Customer Information</Text>
                <Text variant="bodyMd"><strong>Name:</strong> {selectedBooking.user.firstName} {selectedBooking.user.lastName}</Text>
                <Text variant="bodyMd"><strong>Email:</strong> {selectedBooking.user.email}</Text>
                <Text variant="bodyMd"><strong>Phone:</strong> {selectedBooking.user.phone}</Text>
                
                <Divider />
                
                <Text variant="headingMd">Booking Details</Text>
                <Text variant="bodyMd"><strong>Service:</strong> {selectedBooking.service.name}</Text>
                <Text variant="bodyMd"><strong>Date:</strong> {formatDate(selectedBooking.bookingDate)}</Text>
                <Text variant="bodyMd"><strong>Time:</strong> {selectedBooking.startTime} - {selectedBooking.endTime}</Text>
                <Text variant="bodyMd"><strong>Price:</strong> ${selectedBooking.totalPrice}</Text>
                <Text variant="bodyMd"><strong>Status:</strong> {getStatusBadge(selectedBooking.status)}</Text>
                
                {selectedBooking.specialRequests && (
                  <>
                    <Divider />
                    <Text variant="headingMd">Special Requests</Text>
                    <Text variant="bodyMd">{selectedBooking.specialRequests}</Text>
                  </>
                )}
              </BlockStack>
            ) : (
              <BlockStack gap="300">
                <Select
                  label="Status"
                  options={statusOptions.filter(opt => opt.value !== '')}
                  value={selectedBooking.status}
                  onChange={(value) => {
                    setSelectedBooking(prev => ({ ...prev, status: value }));
                  }}
                />
                
                <TextField
                  label="Notes"
                  value={selectedBooking.specialRequests || ''}
                  onChange={(value) => {
                    setSelectedBooking(prev => ({ ...prev, specialRequests: value }));
                  }}
                  multiline={3}
                />
              </BlockStack>
            )}
            
            <InlineStack align="space-between">
              <Button onClick={() => setShowModal(false)}>
                {modalAction === 'view' ? 'Close' : 'Cancel'}
              </Button>
              
              {modalAction === 'edit' && (
                <InlineStack gap="200">
                  <Button 
                    variant="primary"
                    onClick={() => {
                      handleStatusChange(selectedBooking.id, selectedBooking.status);
                      setShowModal(false);
                    }}
                  >
                    Save Changes
                  </Button>
                  <Button 
                    variant="critical"
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this booking?')) {
                        handleDeleteBooking(selectedBooking.id);
                      }
                    }}
                  >
                    Delete
                  </Button>
                </InlineStack>
              )}
            </InlineStack>
          </BlockStack>
        </Modal.Section>
      </Modal>
    );
  };

  return (
    <Page>
      <TitleBar title="Booking Management" />
      
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <InlineStack align="space-between">
                <Text variant="headingMd">All Bookings</Text>
                <Button onClick={loadBookings} loading={isLoading}>
                  Refresh
                </Button>
              </InlineStack>
              
              <InlineStack gap="300">
                <TextField
                  label="Search"
                  value={filters.search}
                  onChange={(value) => setFilters(prev => ({ ...prev, search: value }))}
                  placeholder="Search by name, email, or service..."
                  clearButton
                />
                
                <Select
                  label="Status"
                  options={statusOptions}
                  value={filters.status}
                  onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                />
              </InlineStack>
              
              {isLoading ? (
                <Box padding="800">
                  <InlineStack align="center">
                    <Spinner size="large" />
                    <Text variant="bodyMd">Loading bookings...</Text>
                  </InlineStack>
                </Box>
              ) : filteredBookings.length === 0 ? (
                <EmptyState
                  heading="No bookings found"
                  image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                >
                  <p>No bookings match your current filters.</p>
                </EmptyState>
              ) : (
                <DataTable
                  columnContentTypes={[
                    'text',
                    'text', 
                    'text',
                    'text',
                    'text',
                    'text',
                    'text',
                    'text',
                    'text'
                  ]}
                  headings={[
                    'Customer',
                    'Email',
                    'Phone',
                    'Service',
                    'Price',
                    'Date',
                    'Time',
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
      
      {renderModal()}
    </Page>
  );
}
