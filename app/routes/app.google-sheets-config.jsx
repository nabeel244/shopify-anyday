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
  TextField,
  Banner,
  Spinner,
  FormLayout,
  Divider
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

export default function GoogleSheetsConfig() {
  const [formData, setFormData] = useState({
    location: '',
    spreadsheetId: '',
    sheetName: 'Bookings',
    credentials: ''
  });
  const [configs, setConfigs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('info');

  // Load existing configs on mount
  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      const response = await fetch('/api/google-sheets-config');
      const data = await response.json();
      if (data.configs) {
        setConfigs(data.configs);
      }
    } catch (error) {
      console.error('Failed to load configs:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/google-sheets-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (!response.ok || data.error) {
        // Show detailed error message
        const errorMsg = data.details 
          ? `${data.error || 'Error'}: ${data.details}` 
          : data.error || 'Failed to save configuration';
        setMessage(errorMsg);
        setMessageType('critical');
        console.error('Save error:', data);
      } else {
        setMessage(data.message || 'Google Sheets configuration saved successfully!');
        setMessageType('success');
        // Reload configs after saving
        await loadConfigs();
        // Clear form
        setFormData({
          location: '',
          spreadsheetId: '',
          sheetName: 'Bookings',
          credentials: ''
        });
      }
    } catch (error) {
      setMessage('Failed to save configuration');
      setMessageType('critical');
      console.error('Error saving configuration:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/google-sheets-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (data.error) {
        setMessage(data.error);
        setMessageType('critical');
      } else {
        setMessage('Connection test successful!');
        setMessageType('success');
      }
    } catch (error) {
      setMessage('Connection test failed');
      setMessageType('critical');
      console.error('Error testing connection:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Page>
      <TitleBar title="Google Sheets Configuration" />
      
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd">Google Sheets Integration</Text>
              
              <Text variant="bodyMd">
                Configure Google Sheets integration to automatically sync booking data. 
                This will create a spreadsheet where all bookings are logged and can be managed.
              </Text>
              
              {message && (
                <Banner status={messageType}>
                  <p>{message}</p>
                </Banner>
              )}
              
              <FormLayout>
                <TextField
                  label="Location/City *"
                  value={formData.location}
                  onChange={(value) => handleInputChange('location', value)}
                  placeholder="e.g., Tbilisi, Batumi, Kutaisi"
                  helpText="The city/location for this Google Sheet. Bookings from centers in this location will sync to this sheet."
                  requiredIndicator
                />
                
                <TextField
                  label="Spreadsheet ID *"
                  value={formData.spreadsheetId}
                  onChange={(value) => handleInputChange('spreadsheetId', value)}
                  placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                  helpText="The ID from your Google Sheets URL (the long string between /d/ and /edit)"
                  requiredIndicator
                />
                
                <TextField
                  label="Sheet Name *"
                  value={formData.sheetName}
                  onChange={(value) => handleInputChange('sheetName', value)}
                  placeholder="Bookings"
                  helpText="The name of the sheet/tab within your spreadsheet"
                  requiredIndicator
                />
                
                <TextField
                  label="Service Account Credentials (JSON) *"
                  value={formData.credentials}
                  onChange={(value) => handleInputChange('credentials', value)}
                  placeholder='{"type": "service_account", "project_id": "...", ...}'
                  multiline={8}
                  helpText="Paste the complete JSON credentials from your Google Cloud service account"
                  requiredIndicator
                />
              </FormLayout>
              
              <Divider />
              
              <BlockStack gap="300">
                <Text variant="headingSm">Setup Instructions</Text>
                <ol style={{ paddingLeft: '20px', color: '#6B7280' }}>
                  <li>Go to <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer">Google Cloud Console</a></li>
                  <li>Create a new project or select an existing one</li>
                  <li>Enable the Google Sheets API</li>
                  <li>Create a service account and download the JSON credentials</li>
                  <li>Share your Google Sheet with the service account email</li>
                  <li>Enter the location/city name (must match the city in your product booking configurations)</li>
                  <li>Paste the credentials JSON above and save</li>
                </ol>
                <Text variant="bodyMd" color="subdued">
                  <strong>Note:</strong> You can configure multiple locations, each with its own Google Sheet. 
                  Bookings will automatically sync to the sheet that matches the center's location (city).
                </Text>
                
                <Banner status="info">
                  <p>
                    <strong>🔄 Automatic Sync Setup:</strong><br/>
                    To enable automatic syncing when status changes in Google Sheets (no button needed), 
                    follow these steps:
                  </p>
                  <ol style={{ marginTop: '10px', paddingLeft: '20px' }}>
                    <li>Open your Google Sheet</li>
                    <li>Go to Extensions → Apps Script</li>
                    <li>Paste the code from <code>google-apps-script-auto-sync.gs</code> file</li>
                    <li>Update the WEBSITE_URL with your website URL</li>
                    <li>Save and set up the trigger (see AUTOMATIC_SYNC_SETUP.md for details)</li>
                  </ol>
                  <p style={{ marginTop: '10px' }}>
                    <strong>Once set up:</strong> When anyone changes Status to "CANCELLED" in Google Sheets, 
                    it will automatically update on your website in real-time! 🎉
                  </p>
                </Banner>
              </BlockStack>
              
              {configs.length > 0 && (
                <>
                  <Divider />
                  <BlockStack gap="300">
                    <Text variant="headingSm">Configured Locations</Text>
                    {configs.map((config) => (
                      <Card key={config.id}>
                        <BlockStack gap="200">
                          <InlineStack align="space-between">
                            <BlockStack gap="100">
                              <Text variant="bodyMd" fontWeight="bold">
                                Location: {config.location || 'default'}
                              </Text>
                              <Text variant="bodySm" color="subdued">
                                Spreadsheet ID: {config.spreadsheetId}
                              </Text>
                              <Text variant="bodySm" color="subdued">
                                Sheet Name: {config.sheetName}
                              </Text>
                            </BlockStack>
                            <Text variant="bodySm" color={config.isActive ? 'success' : 'subdued'}>
                              {config.isActive ? '✓ Active' : 'Inactive'}
                            </Text>
                          </InlineStack>
                        </BlockStack>
                      </Card>
                    ))}
                  </BlockStack>
                </>
              )}
              
              <InlineStack gap="200">
                <Button 
                  variant="primary" 
                  onClick={handleSave}
                  loading={isLoading}
                >
                  Save Configuration
                </Button>
                
                <Button 
                  onClick={handleTestConnection}
                  loading={isLoading}
                >
                  Test Connection
                </Button>
              </InlineStack>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
