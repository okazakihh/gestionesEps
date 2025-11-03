import React from 'react';
import { Alert, Group, Button, Accordion, Code } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

const ErrorDisplay = ({ submitError, debugInfo, setError }) => {
  if (!submitError) return null;

  return (
    <Alert 
      icon={<IconAlertCircle size={20} />} 
      title={submitError.title} 
      color="red" 
      variant="light"
      withCloseButton
      onClose={() => setError(null)}
    >
      <p>{submitError.message}</p>
      
      {debugInfo && (
        <Accordion mt="md" variant="contained">
          <Accordion.Item value="details">
            <Accordion.Control>Ver detalles técnicos</Accordion.Control>
            <Accordion.Panel>
              <Code block>
                <div style={{ fontSize: '11px' }}>
                  {debugInfo.url && (
                    <div style={{ marginBottom: '8px' }}>
                      <strong>URL:</strong> {debugInfo.url}
                    </div>
                  )}
                  {debugInfo.requestData && (
                    <div style={{ marginBottom: '8px' }}>
                      <strong>Datos enviados:</strong>
                      <pre style={{ marginTop: '4px', whiteSpace: 'pre-wrap' }}>
                        {JSON.stringify(debugInfo.requestData, null, 2)}
                      </pre>
                    </div>
                  )}
                  {debugInfo.error && (
                    <div style={{ marginBottom: '8px' }}>
                      <strong>Error del cliente:</strong> {debugInfo.error}
                    </div>
                  )}
                  {debugInfo.response && (
                    <div>
                      <strong>Respuesta del servidor:</strong>
                      <pre style={{ marginTop: '4px', whiteSpace: 'pre-wrap' }}>
                        {JSON.stringify(debugInfo.response, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </Code>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      )}
    </Alert>
  );
};

export default ErrorDisplay;