import React, { useState } from 'react';
import { ThreatLevelIndicator } from '../components/ThreatLevelIndicator';
import { AttackGraph } from '../components/AttackGraph';
import { VulnerabilityTable } from '../components/VulnerabilityTable';
import { AlertsPanel } from '../components/AlertsPanel';
import { useScan } from '../contexts/ScanContext';

export default function Dashboard() {
  const { scanResult, triggerScan, loading, error } = useScan();
  const [url, setUrl] = useState('');
  const [scanType, setScanType] = useState<'Quick' | 'Full' | 'Custom'>('Quick');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleScan = () => {
    triggerScan({ url, scanType, username, password });
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold mb-4">Vulnerability Scanner Dashboard</h1>
      <div className="flex flex-col space-y-4 mb-4">
        <input
          type="text"
          placeholder="Enter website URL"
          value={url}
          onChange={e => setUrl(e.target.value)}
          className="border px-2 py-1"
        />
        <div className="flex space-x-2">
          {(['Quick', 'Full', 'Custom'] as const).map(type => (
            <button
              key={type}
              className={`px-4 py-1 rounded ${scanType === type ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
              onClick={() => setScanType(type)}
            >
              {type}
            </button>
          ))}
        </div>
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Username (optional)"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="border px-2 py-1"
          />
          <input
            type="password"
            placeholder="Password (optional)"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="border px-2 py-1"
          />
        </div>
        <button
          onClick={handleScan}
          className="bg-blue-600 text-white px-4 py-1 rounded"
          disabled={loading}
        >
          {loading ? 'Scanning...' : 'Start Scan'}
        </button>
      </div>
      {error && <div className="text-red-600">{error}</div>}
      {scanResult && (
        <>
          <ThreatLevelIndicator level={scanResult.threat_level} />
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">Vulnerabilities</h2>
            <VulnerabilityTable data={scanResult.vulnerabilities} />
          </div>
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">Attack Graph</h2>
            <AttackGraph nodes={scanResult.network.nodes} edges={scanResult.network.edges} />
          </div>
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">Alerts</h2>
            <AlertsPanel alerts={scanResult.alerts} />
          </div>
        </>
      )}
    </div>
  );
}
