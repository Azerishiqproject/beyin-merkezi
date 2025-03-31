'use client';

import { usePathname } from "next/navigation";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";
import { Box } from "@mui/material";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');
  
  return (
    <>
      {!isAdminPage && <Navbar />}
      <Box 
        component="main" 
        sx={{ 
          minHeight: '100vh',
          pt: isAdminPage ? 0 : '80px' // 80px is equivalent to pt-20 in Tailwind
        }}
      >
        {children}
      </Box>
      {!isAdminPage && <Footer />}
    </>
  );
} 