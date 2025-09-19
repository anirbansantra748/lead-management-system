import React, { useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Alert,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Lead } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface LeadsDebugPanelProps {
  leadsData: Lead[];
  totalLeads: number;
  loading: boolean;
  user: any;
  onRefresh: () => void;
}

const LeadsDebugPanel: React.FC<LeadsDebugPanelProps> = ({
  leadsData,
  totalLeads,
  loading,
  user,
  onRefresh,
}) => {
  // Log changes in real-time
  useEffect(() => {
    console.log('🔍 [DebugPanel] Props changed:', {
      leadsDataLength: leadsData?.length || 0,
      totalLeads,
      loading,
      userId: user?.id,
      userEmail: user?.email
    });
  }, [leadsData, totalLeads, loading, user]);

  const debugInfo = {
    stateInfo: {
      'leadsData Length': leadsData?.length || 0,
      'totalLeads': totalLeads,
      'loading': loading,
      'leadsData Type': Array.isArray(leadsData) ? 'Array' : typeof leadsData,
      'leadsData Truthy': !!leadsData,
    },
    userInfo: {
      'User ID': user?.id,
      'User Email': user?.email,
      'User FirstName': user?.firstName,
      'User LastName': user?.lastName,
    },
    dataStructure: {
      'First Lead ID': leadsData?.[0]?._id || 'No leads',
      'First Lead Name': leadsData?.[0] ? `${leadsData[0].first_name} ${leadsData[0].last_name}` : 'No leads',
      'First Lead User': leadsData?.[0]?.user || 'No leads',
      'Sample Lead Keys': leadsData?.[0] ? Object.keys(leadsData[0]).join(', ') : 'No leads',
    }
  };

  const handleTestAPICall = () => {
    console.log('🧪 [DebugPanel] Testing direct API call...');
    
    // Make a direct API call to test
    fetch('/api/leads', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      console.log('🔍 [DebugPanel] Direct API response status:', response.status);
      return response.json();
    })
    .then(data => {
      console.log('🔍 [DebugPanel] Direct API response data:', data);
    })
    .catch(error => {
      console.error('❌ [DebugPanel] Direct API call failed:', error);
    });
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2">
          <strong>Debug Panel Active:</strong> Check browser console for detailed logs. 
          Current state: {leadsData?.length || 0} leads loaded, {totalLeads} total.
        </Typography>
      </Alert>

      <Paper elevation={1} sx={{ p: 2, mb: 2, bgcolor: '#f5f5f5' }}>
        <Typography variant="h6" gutterBottom color="primary">
          🐛 React Debug Panel
        </Typography>

        <Box display="flex" gap={2} mb={2}>
          <Button variant="outlined" size="small" onClick={onRefresh}>
            Refresh Data
          </Button>
          <Button variant="outlined" size="small" onClick={handleTestAPICall}>
            Test Direct API
          </Button>
          <Button 
            variant="outlined" 
            size="small" 
            onClick={() => console.log('🔍 Current leadsData:', leadsData)}
          >
            Log Current Data
          </Button>
        </Box>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>State Information</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box component="pre" sx={{ fontSize: '0.875rem', overflow: 'auto' }}>
              {JSON.stringify(debugInfo.stateInfo, null, 2)}
            </Box>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>User Information</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box component="pre" sx={{ fontSize: '0.875rem', overflow: 'auto' }}>
              {JSON.stringify(debugInfo.userInfo, null, 2)}
            </Box>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Data Structure</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box component="pre" sx={{ fontSize: '0.875rem', overflow: 'auto' }}>
              {JSON.stringify(debugInfo.dataStructure, null, 2)}
            </Box>
          </AccordionDetails>
        </Accordion>

        {leadsData?.length > 0 && (
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Sample Lead Data (First 3)</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box component="pre" sx={{ fontSize: '0.875rem', overflow: 'auto', maxHeight: 300 }}>
                {JSON.stringify(leadsData.slice(0, 3), null, 2)}
              </Box>
            </AccordionDetails>
          </Accordion>
        )}
      </Paper>
    </Box>
  );
};

export default LeadsDebugPanel;