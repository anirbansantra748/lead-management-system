import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Chip,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Logout as LogoutIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, GridApi, GridReadyEvent, ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { useAuth } from '../contexts/AuthContext';
import { leadsAPI, Lead, LeadsResponse } from '../services/api';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import UserSwitcher from '../components/UserSwitcher';
import LeadsDebugPanel from '../components/LeadsDebugPanel';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// Import AG Grid styles
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-material.css';

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

// Form validation schema
const leadSchema = yup.object().shape({
  first_name: yup.string().required('First name is required').max(50),
  last_name: yup.string().required('Last name is required').max(50),
  email: yup.string().email('Invalid email').required('Email is required'),
  phone: yup.string().required('Phone is required').matches(/^[+]?[1-9][\d]{0,15}$/, 'Invalid phone number'),
  company: yup.string().required('Company is required').max(100),
  city: yup.string().required('City is required').max(50),
  state: yup.string().required('State is required').max(50),
  source: yup.string().required('Source is required'),
  status: yup.string().required('Status is required'),
  score: yup.number().min(0).max(100).required('Score is required'),
  lead_value: yup.number().min(0).required('Lead value is required'),
  is_qualified: yup.boolean().required(),
});

interface LeadFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company: string;
  city: string;
  state: string;
  source: string;
  status: string;
  score: number;
  lead_value: number;
  is_qualified: boolean;
}

const Leads: React.FC = () => {
  const { user, logout } = useAuth();
  const [gridApi, setGridApi] = useState<GridApi | null>(null);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [leadsData, setLeadsData] = useState<Lead[]>([]);
  const [totalLeads, setTotalLeads] = useState(0);
  const [userSwitcherOpen, setUserSwitcherOpen] = useState(false);

  // Function to fetch leads
  const fetchLeads = useCallback(async () => {
    try {
      console.log('🚀 [Frontend] Starting leads fetch process');
      console.log('🔄 [Frontend] Setting loading state to true');
      setLoading(true);
      
      console.log('👤 [Frontend] Current user context:', {
        id: user?.id,
        email: user?.email,
        firstName: user?.firstName,
        lastName: user?.lastName
      });
      
      const requestParams = {
        page: 1,
        limit: 100, // Get more leads for now
        sort: JSON.stringify({ created_at: -1 }) // Ensure newest first
      };
      
      console.log('📫 [Frontend] API request params:', requestParams);
      console.log('🔗 [Frontend] Making API call to /api/leads...');
      
      const startTime = Date.now();
      const response = await leadsAPI.getLeads(requestParams);
      const apiCallTime = Date.now() - startTime;
      
      console.log('✅ [Frontend] API call completed in', apiCallTime + 'ms');
      console.log('📊 [Frontend] Raw API response:', response);
      
      const data: LeadsResponse = response.data;
      
      console.log('📊 [Frontend] Processed response data:', {
        total: data.total,
        count: data.data.length,
        page: data.page,
        limit: data.limit,
        totalPages: data.totalPages,
        hasNextPage: data.hasNextPage
      });
      
      // Log detailed lead information
      if (data.data.length > 0) {
        console.log('📋 [Frontend] Sample leads (first 5):');
        data.data.slice(0, 5).forEach((lead, index) => {
          console.log(`   ${index + 1}. ID: ${lead._id}`);
          console.log(`      Name: ${lead.first_name} ${lead.last_name}`);
          console.log(`      Email: ${lead.email}`);
          console.log(`      Company: ${lead.company}`);
          console.log(`      Status: ${lead.status}`);
          console.log(`      Created: ${new Date(lead.created_at).toLocaleString()}`);
          console.log(`      User: ${lead.user}`);
        });
      } else {
        console.log('😅 [Frontend] No leads found in response');
      }
      
      // Update state
      console.log('🔄 [Frontend] Updating React state...');
      console.log('📊 [Frontend] Previous leads count:', leadsData.length);
      console.log('📊 [Frontend] New leads count:', data.data.length);
      
      setLeadsData(data.data);
      setTotalLeads(data.total);
      
      console.log('✅ [Frontend] State updated successfully');
      console.log('🏁 [Frontend] Leads fetch process completed');
      
    } catch (error: any) {
      console.error('❌ [Frontend] Error fetching leads:', error);
      console.error('📊 [Frontend] Error details:', {
        message: error?.message,
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        data: error?.response?.data
      });
      toast.error('Failed to fetch leads');
    } finally {
      console.log('🔄 [Frontend] Setting loading state to false');
      setLoading(false);
    }
  }, [user, leadsData.length]);

  // Fetch leads on component mount
  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Monitor state changes for debugging
  useEffect(() => {
    console.log('📈 [Frontend] State change detected - leadsData updated:', {
      count: leadsData.length,
      totalLeads,
      sampleIds: leadsData.slice(0, 3).map(l => l._id)
    });
  }, [leadsData, totalLeads]);

  // Form hook
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<LeadFormData>({
    resolver: yupResolver(leadSchema),
    defaultValues: {
      status: 'new',
      score: 0,
      lead_value: 0,
      is_qualified: false,
    },
  });

  // Handle edit and delete functions
  const handleEditLead = useCallback((lead: Lead) => {
    setEditingLead(lead);
    
    // Populate form with lead data
    setValue('first_name', lead.first_name);
    setValue('last_name', lead.last_name);
    setValue('email', lead.email);
    setValue('phone', lead.phone);
    setValue('company', lead.company);
    setValue('city', lead.city);
    setValue('state', lead.state);
    setValue('source', lead.source);
    setValue('status', lead.status);
    setValue('score', lead.score);
    setValue('lead_value', lead.lead_value);
    setValue('is_qualified', lead.is_qualified);
    
    setDialogOpen(true);
  }, [setValue]);

  const handleDeleteLead = useCallback(async (lead: Lead) => {
    if (window.confirm(`Are you sure you want to delete ${lead.first_name} ${lead.last_name}?`)) {
      try {
        await leadsAPI.deleteLead(lead._id);
        toast.success('Lead deleted successfully!');
        
        // Refresh leads data
        await fetchLeads();
      } catch (error) {
        console.error('Error deleting lead:', error);
        toast.error('Failed to delete lead');
      }
    }
  }, [fetchLeads]);

  // Column definitions for AG Grid
  const columnDefs: ColDef[] = useMemo(() => [
    {
      field: 'first_name',
      headerName: 'First Name',
      sortable: true,
      filter: 'agTextColumnFilter',
      width: 120,
    },
    {
      field: 'last_name',
      headerName: 'Last Name',
      sortable: true,
      filter: 'agTextColumnFilter',
      width: 120,
    },
    {
      field: 'email',
      headerName: 'Email',
      sortable: true,
      filter: 'agTextColumnFilter',
      width: 200,
    },
    {
      field: 'phone',
      headerName: 'Phone',
      sortable: true,
      width: 140,
    },
    {
      field: 'company',
      headerName: 'Company',
      sortable: true,
      filter: 'agTextColumnFilter',
      width: 150,
    },
    {
      field: 'city',
      headerName: 'City',
      sortable: true,
      filter: 'agTextColumnFilter',
      width: 100,
    },
    {
      field: 'state',
      headerName: 'State',
      sortable: true,
      width: 80,
    },
    {
      field: 'source',
      headerName: 'Source',
      sortable: true,
      filter: 'agSetColumnFilter',
      width: 120,
      cellRenderer: (params: any) => {
        const sourceColors: { [key: string]: string } = {
          website: '#2196f3',
          facebook_ads: '#3f51b5',
          google_ads: '#4caf50',
          referral: '#ff9800',
          events: '#9c27b0',
          other: '#607d8b',
        };
        return (
          <Chip
            label={params.value?.replace('_', ' ')}
            size="small"
            style={{ backgroundColor: sourceColors[params.value] || '#gray', color: 'white' }}
          />
        );
      },
    },
    {
      field: 'status',
      headerName: 'Status',
      sortable: true,
      filter: 'agSetColumnFilter',
      width: 120,
      cellRenderer: (params: any) => {
        const statusColors: { [key: string]: string } = {
          new: '#2196f3',
          contacted: '#ff9800',
          qualified: '#4caf50',
          lost: '#f44336',
          won: '#8bc34a',
        };
        return (
          <Chip
            label={params.value}
            size="small"
            style={{ backgroundColor: statusColors[params.value] || '#gray', color: 'white' }}
          />
        );
      },
    },
    {
      field: 'score',
      headerName: 'Score',
      sortable: true,
      filter: 'agNumberColumnFilter',
      width: 80,
      cellRenderer: (params: any) => (
        <Box display="flex" alignItems="center">
          {params.value}
          <Box
            width={50}
            height={8}
            bgcolor="grey.300"
            borderRadius={1}
            ml={1}
            position="relative"
          >
            <Box
              width={`${params.value}%`}
              height="100%"
              bgcolor="primary.main"
              borderRadius={1}
            />
          </Box>
        </Box>
      ),
    },
    {
      field: 'lead_value',
      headerName: 'Value',
      sortable: true,
      filter: 'agNumberColumnFilter',
      width: 100,
      valueFormatter: (params: any) => `$${params.value?.toLocaleString() || 0}`,
    },
    {
      field: 'is_qualified',
      headerName: 'Qualified',
      sortable: true,
      filter: 'agSetColumnFilter',
      width: 100,
      cellRenderer: (params: any) => (
        <Chip
          label={params.value ? 'Yes' : 'No'}
          size="small"
          color={params.value ? 'success' : 'default'}
        />
      ),
    },
    {
      field: 'created_at',
      headerName: 'Created',
      sortable: true,
      width: 120,
      valueFormatter: (params: any) =>
        params.value ? new Date(params.value).toLocaleDateString() : '',
    },
    {
      headerName: 'Actions',
      width: 120,
      cellRenderer: (params: any) => (
        <Box>
          <IconButton
            size="small"
            onClick={() => handleEditLead(params.data)}
            color="primary"
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleDeleteLead(params.data)}
            color="error"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
      pinned: 'right',
      sortable: false,
      filter: false,
      resizable: false,
    },
  ], [handleEditLead, handleDeleteLead]);

  // Grid ready event
  const onGridReady = useCallback((params: GridReadyEvent) => {
    setGridApi(params.api);
  }, []);

  // Handle create/edit lead
  const handleSaveLead = async (data: LeadFormData) => {
    try {
      console.log('🚀 [Frontend] Starting lead save process');
      console.log('💾 [Frontend] Lead data:', JSON.stringify(data, null, 2));
      console.log('🔄 [Frontend] Edit mode:', !!editingLead);
      console.log('👤 [Frontend] Current user:', { id: user?.id, email: user?.email });
      console.log('📅 [Frontend] Timestamp:', new Date().toISOString());
      
      let savedLead: Lead;
      
      if (editingLead) {
        console.log('🔄 [Frontend] Updating existing lead:', editingLead._id);
        const updateResult = await leadsAPI.updateLead(editingLead._id, data);
        console.log('✅ [Frontend] Lead update API response:', updateResult.data);
        savedLead = updateResult.data.lead || updateResult.data.data;
        toast.success('Lead updated successfully!');
        
        // Update lead in current state instead of full refresh
        setLeadsData(prevLeads => 
          prevLeads.map(lead => 
            lead._id === savedLead._id ? savedLead : lead
          )
        );
        console.log('🔄 [Frontend] Updated lead in local state');
        
      } else {
        console.log('➕ [Frontend] Creating new lead');
        const createResult = await leadsAPI.createLead(data);
        console.log('✅ [Frontend] Lead creation API response:', createResult);
        console.log('📊 [Frontend] Response data structure:', {
          hasData: !!createResult.data,
          hasLead: !!createResult.data?.lead,
          hasDataField: !!createResult.data?.data,
          success: createResult.data?.success
        });
        
        // Extract the created lead from response (handle both 'data' and 'lead' fields)
        savedLead = createResult.data?.lead || createResult.data?.data;
        console.log('🆕 [Frontend] Extracted saved lead:', savedLead);
        
        if (!savedLead) {
          console.error('❌ [Frontend] No lead data in response!');
          throw new Error('Lead created but no data returned from server');
        }
        
        toast.success('Lead created successfully!');
        
        // Add new lead to beginning of list (since we sort by created_at desc)
        setLeadsData(prevLeads => [savedLead, ...prevLeads]);
        setTotalLeads(prevTotal => prevTotal + 1);
        
        console.log('➕ [Frontend] Added new lead to local state');
        console.log('📊 [Frontend] New leads count:', leadsData.length + 1);
      }
      
      // Close dialog and reset form
      setDialogOpen(false);
      setEditingLead(null);
      reset();
      
      console.log('✅ [Frontend] Dialog closed and form reset');
      
      // Optional: Also refresh from server to ensure consistency
      // Comment out the line below if you want to rely only on state updates
      console.log('🔄 [Frontend] Performing additional server refresh for consistency...');
      await fetchLeads();
      
      console.log('🏁 [Frontend] Lead save process completed successfully');
      
    } catch (error: any) {
      console.error('❌ [Frontend] Error saving lead:', error);
      console.error('📊 [Frontend] Error details:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status
      });
      toast.error('Failed to save lead');
    }
  };


  const handleAddLead = () => {
    setEditingLead(null);
    reset();
    setDialogOpen(true);
  };

  const handleRefresh = () => {
    fetchLeads();
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* App Bar */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Lead Management System
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            Welcome, {user?.firstName} {user?.lastName}
          </Typography>
          <Button 
            color="inherit" 
            onClick={() => setUserSwitcherOpen(true)}
            sx={{ mr: 1 }}
          >
            Switch User
          </Button>
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 2 }}>
        {/* Action Bar */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main', mb: 1 }}>
              Leads Management
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 0.5 }}>
              📊 Total leads: <strong>{totalLeads}</strong> | Loaded: <strong>{leadsData.length}</strong>
              {loading && <span style={{ color: '#ff9800', marginLeft: '8px' }}>⏳ Loading...</span>}
            </Typography>
            <Typography variant="caption" color="info.main" sx={{ 
              display: 'block', 
              bgcolor: 'info.light', 
              px: 1, 
              py: 0.5, 
              borderRadius: 1,
              width: 'fit-content'
            }}>
              👤 {user?.firstName} {user?.lastName} ({user?.email})
            </Typography>
          </Box>
          <Box>
            <Button
              variant="outlined"
              onClick={() => setUserSwitcherOpen(true)}
              sx={{ mr: 1 }}
              color="info"
            >
              Switch User
            </Button>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              sx={{ mr: 1 }}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddLead}
            >
              Add Lead
            </Button>
          </Box>
        </Box>

        {/* AG Grid */}
        <Paper 
          elevation={3} 
          sx={{ 
            height: 650, 
            width: '100%',
            borderRadius: 2,
            overflow: 'hidden',
            '& .ag-theme-material': {
              '--ag-header-background-color': '#f8f9fa',
              '--ag-header-foreground-color': '#333',
              '--ag-header-cell-hover-background-color': '#e3f2fd',
              '--ag-border-color': '#e0e0e0',
              '--ag-row-hover-color': '#f5f5f5',
              '--ag-selected-row-background-color': '#e3f2fd',
            }
          }}
        >
          <div className="ag-theme-material" style={{ height: '100%', width: '100%' }}>
            <AgGridReact
              columnDefs={columnDefs}
              defaultColDef={{
                sortable: true,
                resizable: true,
                filter: true,
                flex: 1,
                minWidth: 100,
              }}
              rowData={leadsData}
              onGridReady={onGridReady}
              rowSelection="multiple"
              loading={loading}
              animateRows={true}
              pagination={true}
              paginationPageSize={25}
              paginationPageSizeSelector={[10, 25, 50, 100]}
              // Enhanced grid options for professional appearance
              suppressLoadingOverlay={false}
              suppressNoRowsOverlay={false}
              getRowId={(params) => params.data._id}
              rowHeight={50}
              headerHeight={45}
              // Grid styling options
              suppressCellFocus={true}
              suppressRowClickSelection={false}
              rowMultiSelectWithClick={true}
              // Grid event handlers for debugging
              onRowDataUpdated={() => {
                console.log('🔄 [Frontend] AG Grid row data updated. Current row count:', gridApi?.getDisplayedRowCount());
              }}
              onModelUpdated={() => {
                console.log('📈 [Frontend] AG Grid model updated');
              }}
            />
          </div>
        </Paper>
      </Container>

      {/* Lead Form Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingLead ? 'Edit Lead' : 'Add New Lead'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Row 1 - Name fields */}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ flex: '1 1 45%', minWidth: '200px' }}>
                  <TextField
                    fullWidth
                    label="First Name"
                    {...register('first_name')}
                    error={!!errors.first_name}
                    helperText={errors.first_name?.message}
                  />
                </Box>
                <Box sx={{ flex: '1 1 45%', minWidth: '200px' }}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    {...register('last_name')}
                    error={!!errors.last_name}
                    helperText={errors.last_name?.message}
                  />
                </Box>
              </Box>
              
              {/* Row 2 - Contact fields */}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ flex: '1 1 45%', minWidth: '200px' }}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    {...register('email')}
                    error={!!errors.email}
                    helperText={errors.email?.message}
                  />
                </Box>
                <Box sx={{ flex: '1 1 45%', minWidth: '200px' }}>
                  <TextField
                    fullWidth
                    label="Phone"
                    {...register('phone')}
                    error={!!errors.phone}
                    helperText={errors.phone?.message}
                  />
                </Box>
              </Box>
              
              {/* Row 3 - Company and Qualified */}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <Box sx={{ flex: '1 1 60%', minWidth: '250px' }}>
                  <TextField
                    fullWidth
                    label="Company"
                    {...register('company')}
                    error={!!errors.company}
                    helperText={errors.company?.message}
                  />
                </Box>
                <Box sx={{ flex: '1 1 35%', minWidth: '150px' }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        {...register('is_qualified')}
                      />
                    }
                    label="Qualified"
                  />
                </Box>
              </Box>
              
              {/* Row 4 - Location fields */}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ flex: '1 1 45%', minWidth: '200px' }}>
                  <TextField
                    fullWidth
                    label="City"
                    {...register('city')}
                    error={!!errors.city}
                    helperText={errors.city?.message}
                  />
                </Box>
                <Box sx={{ flex: '1 1 45%', minWidth: '200px' }}>
                  <TextField
                    fullWidth
                    label="State"
                    {...register('state')}
                    error={!!errors.state}
                    helperText={errors.state?.message}
                  />
                </Box>
              </Box>
              
              {/* Row 5 - Source and Status */}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ flex: '1 1 45%', minWidth: '200px' }}>
                  <FormControl fullWidth>
                    <InputLabel>Source</InputLabel>
                    <Select
                      {...register('source')}
                      error={!!errors.source}
                      label="Source"
                    >
                      <MenuItem value="website">Website</MenuItem>
                      <MenuItem value="facebook_ads">Facebook Ads</MenuItem>
                      <MenuItem value="google_ads">Google Ads</MenuItem>
                      <MenuItem value="referral">Referral</MenuItem>
                      <MenuItem value="events">Events</MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ flex: '1 1 45%', minWidth: '200px' }}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      {...register('status')}
                      error={!!errors.status}
                      label="Status"
                    >
                      <MenuItem value="new">New</MenuItem>
                      <MenuItem value="contacted">Contacted</MenuItem>
                      <MenuItem value="qualified">Qualified</MenuItem>
                      <MenuItem value="lost">Lost</MenuItem>
                      <MenuItem value="won">Won</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>
              
              {/* Row 6 - Score and Lead Value */}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ flex: '1 1 45%', minWidth: '200px' }}>
                  <TextField
                    fullWidth
                    label="Score (0-100)"
                    type="number"
                    inputProps={{ min: 0, max: 100 }}
                    {...register('score', { valueAsNumber: true })}
                    error={!!errors.score}
                    helperText={errors.score?.message}
                  />
                </Box>
                <Box sx={{ flex: '1 1 45%', minWidth: '200px' }}>
                  <TextField
                    fullWidth
                    label="Lead Value ($)"
                    type="number"
                    inputProps={{ min: 0, step: 0.01 }}
                    {...register('lead_value', { valueAsNumber: true })}
                    error={!!errors.lead_value}
                    helperText={errors.lead_value?.message}
                  />
                </Box>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit(handleSaveLead)}
            variant="contained"
          >
            {editingLead ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* User Switcher Dialog */}
      <UserSwitcher 
        open={userSwitcherOpen} 
        onClose={() => setUserSwitcherOpen(false)} 
      />

      {/* Debug Panel */}
      <LeadsDebugPanel
        leadsData={leadsData}
        totalLeads={totalLeads}
        loading={loading}
        user={user}
        onRefresh={fetchLeads}
      />
    </Box>
  );
};

export default Leads;