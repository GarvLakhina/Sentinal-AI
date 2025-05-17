import React, { createContext, useContext, useState } from 'react';

interface ScanOptions {
  url?: string;
  scanType?: 'Quick' | 'Full' | 'Custom';
  username?: string;
  password?: string;
}

interface ScanContextType {
  scanResult: any;
  setScanResult: (r: any) => void;
  scanOptions: ScanOptions;
  setScanOptions: (o: ScanOptions) => void;
  triggerScan: (options: ScanOptions) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const ScanContext = createContext<ScanContextType | undefined>(undefined);

export function ScanProvider({ children }: { children: React.ReactNode }) {
  const [scanResult, setScanResult] = useState<any>(null);
  const [scanOptions, setScanOptions] = useState<ScanOptions>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function triggerScan(options: ScanOptions) {
    setLoading(true);
    setError(null);
    setScanOptions(options);
    try {
      const form = new FormData();
      if (options.url) form.append('url', options.url);
      if (options.scanType) form.append('scan_type', options.scanType);
      if (options.username) form.append('username', options.username);
      if (options.password) form.append('password', options.password);
      const res = await fetch('http://localhost:8000/fullscan', {
        method: 'POST',
        body: form,
      });
      if (!res.ok) throw new Error('Scan failed');
      const data = await res.json();
      setScanResult(data);
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    }
    setLoading(false);
  }

  return (
    <ScanContext.Provider value={{ scanResult, setScanResult, scanOptions, setScanOptions, triggerScan, loading, error }}>
      {children}
    </ScanContext.Provider>
  );
}

export function useScan() {
  const ctx = useContext(ScanContext);
  if (!ctx) throw new Error('useScan must be used within a ScanProvider');
  return ctx;
}
