import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  Chip,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

interface UserSwitcherProps {
  open: boolean;
  onClose: () => void;
}

const UserSwitcher: React.FC<UserSwitcherProps> = ({ open, onClose }) => {
  const { login, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Known user accounts from our database check
  const knownUsers = [
    {
      email: 'test@example.com',
      leads: 123,
      note: 'Main account with all leads'
    },
    {
      email: 'test1758256134961@example.com', 
      leads: 1,
      note: 'Test account'
    }
  ];

  const handleQuickLogin = async (userEmail: string) => {
    setLoading(true);
    try {
      console.log('🔄 [UserSwitcher] Attempting quick login for:', userEmail);
      
      // Try common passwords for test accounts
      const commonPasswords = ['password', 'password123', 'test123', 'testpassword'];
      
      for (const pwd of commonPasswords) {
        try {
          await login(userEmail, pwd);
          console.log('✅ [UserSwitcher] Login successful with password:', pwd);
          toast.success(`Logged in as ${userEmail}`);
          onClose();
          return;
        } catch (error) {
          console.log(`❌ [UserSwitcher] Password "${pwd}" failed for ${userEmail}`);
          continue;
        }
      }
      
      throw new Error('None of the common passwords worked');
      
    } catch (error: any) {
      console.error('❌ [UserSwitcher] Quick login failed:', error);
      toast.error(`Quick login failed for ${userEmail}. Try manual login.`);
    } finally {
      setLoading(false);
    }
  };

  const handleManualLogin = async () => {
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      console.log('🔄 [UserSwitcher] Manual login attempt for:', email);
      await login(email, password);
      console.log('✅ [UserSwitcher] Manual login successful');
      toast.success(`Logged in as ${email}`);
      setEmail('');
      setPassword('');
      onClose();
    } catch (error: any) {
      console.error('❌ [UserSwitcher] Manual login failed:', error);
      toast.error('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Switch User Account
      </DialogTitle>
      <DialogContent>
        <Box mb={2}>
          <Alert severity="info">
            <Typography variant="body2">
              <strong>Current User:</strong> {user?.email} ({user?.firstName} {user?.lastName})
            </Typography>
          </Alert>
        </Box>

        <Typography variant="h6" gutterBottom>
          Quick Login (Known Accounts)
        </Typography>
        
        {knownUsers.map((knownUser, index) => (
          <Box key={index} mb={2} p={2} border="1px solid #ddd" borderRadius={1}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="body1" fontWeight="bold">
                {knownUser.email}
              </Typography>
              <Chip 
                label={`${knownUser.leads} leads`} 
                color={knownUser.leads > 100 ? "success" : "default"}
                size="small"
              />
            </Box>
            <Typography variant="body2" color="text.secondary" mb={1}>
              {knownUser.note}
            </Typography>
            <Button
              variant={knownUser.leads > 100 ? "contained" : "outlined"}
              size="small"
              onClick={() => handleQuickLogin(knownUser.email)}
              disabled={loading}
              color={knownUser.leads > 100 ? "primary" : "secondary"}
            >
              {knownUser.leads > 100 ? "Login (Recommended)" : "Login"}
            </Button>
          </Box>
        ))}

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Manual Login
        </Typography>
        
        <TextField
          fullWidth
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          margin="normal"
          disabled={loading}
        />
        
        <TextField
          fullWidth
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          margin="normal"
          disabled={loading}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleManualLogin();
            }
          }}
        />
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleManualLogin} 
          variant="contained" 
          disabled={loading || !email || !password}
        >
          Login Manually
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserSwitcher;