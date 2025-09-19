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
    spreadsheetId: '',
    sheetName: 'Bookings',
    credentials: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('info');

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
      
      if (data.error) {
        setMessage(data.error);
        setMessageType('critical');
      } else {
        setMessage('Google Sheets configuration saved successfully!');
        setMessageType('success');
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
                  label="Spreadsheet ID"
                  value={formData.spreadsheetId}
                  onChange={(value) => handleInputChange('spreadsheetId', value)}
                  placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                  helpText="The ID from your Google Sheets URL (the long string between /d/ and /edit)"
                />
                
                <TextField
                  label="Sheet Name"
                  value={formData.sheetName}
                  onChange={(value) => handleInputChange('sheetName', value)}
                  placeholder="Bookings"
                  helpText="The name of the sheet/tab within your spreadsheet"
                />
                
                <TextField
                  label="Service Account Credentials (JSON)"
                  value={formData.credentials}
                  onChange={(value) => handleInputChange('credentials', value)}
                  placeholder='{"type": "service_account", "project_id": "...", ...}'
                  multiline={8}
                  helpText="Paste the complete JSON credentials from your Google Cloud service account"
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
                  <li>Paste the credentials JSON above</li>
                </ol>
              </BlockStack>
              
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
