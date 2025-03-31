'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAppSelector } from '@/redux/hooks';

// Material UI imports
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  CircularProgress,
  useTheme,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import AssessmentIcon from '@mui/icons-material/Assessment';
import HomeIcon from '@mui/icons-material/Home';

// Drawer width
const drawerWidth = 280;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isAdmin, isLoading } = useAppSelector((state) => state.auth);
  const theme = useTheme();

  useEffect(() => {
    setIsClient(true);
    
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }

      if (!isAdmin) {
        router.push('/');
      }
    }
  }, [isAuthenticated, isAdmin, isLoading, router]);

  // Menu items
  const menuItems = [
    { text: 'Dashboard', path: '/admin/dashboard', icon: <DashboardIcon /> },
    { text: 'İstifadəçilər', path: '/admin/users', icon: <PeopleIcon /> },
    { text: 'Departamentlar', path: '/admin/departments', icon: <BusinessIcon /> },
    { text: 'Qiymətləndirmələr', path: '/admin/evaluations', icon: <AssessmentIcon /> },
    { text: 'Sayta Qayıt', path: '/', icon: <HomeIcon /> },
  ];

  if (!isClient || isLoading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          bgcolor: 'background.default'
        }}
      >
        <CircularProgress color="primary" size={60} thickness={4} />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: 'background.paper',
            boxShadow: '0 0 10px rgba(0,0,0,0.1)',
            border: 'none'
          },
        }}
      >
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h5" fontWeight="bold" color="primary">
            Admin Panel
          </Typography>
        </Box>
        <List sx={{ mt: 2 }}>
          {menuItems.map((item) => {
            const isActive = item.path === '/' 
              ? pathname === item.path 
              : pathname.startsWith(item.path);
            
            return (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  component={Link}
                  href={item.path}
                  sx={{
                    py: 1.5,
                    px: 3,
                    borderRight: isActive ? `4px solid ${theme.palette.primary.main}` : 'none',
                    bgcolor: isActive ? 'action.selected' : 'transparent',
                    color: isActive ? 'primary.main' : 'text.primary',
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: isActive ? 'primary.main' : 'text.secondary', minWidth: 40 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    primaryTypographyProps={{ 
                      fontWeight: isActive ? 'bold' : 'medium',
                    }} 
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Drawer>

      {/* Main Content */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          overflow: 'auto',
          minHeight: '100vh',
          bgcolor: 'background.default'
        }}
      >
        {children}
      </Box>
    </Box>
  );
} 