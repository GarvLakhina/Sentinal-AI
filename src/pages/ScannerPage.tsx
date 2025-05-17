
import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, query, where } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { 
  LayoutGrid, 
  List, 
  AlertTriangle, 
  Shield, 
  AlertCircle, 
  Check, 
  Play, 
  Download, 
  Wrench,
  ArrowRight,
  Database,
  Code,
  Zap
} from "lucide-react";
import ScannerVisualization from "@/components/scanner/ScannerVisualization";

interface Vulnerability {
  id: string;
  name: string;
  severity: "critical" | "high" | "medium" | "low";
  description: string;
  affectedEndpoint: string;
  cve?: string;
  fixAvailable: boolean;
}

// Sample vulnerabilities
const vulnerabilities: Vulnerability[] = [
  {
    id: "vuln-1",
    name: "SQL Injection in Login Form",
    severity: "critical",
    description: "The login form is vulnerable to SQL injection attacks, potentially allowing unauthorized access to the database.",
    affectedEndpoint: "/api/auth/login",
    cve: "CVE-2022-1234",
    fixAvailable: true
  },
  {
    id: "vuln-2",
    name: "Cross-Site Scripting (XSS)",
    severity: "high",
    description: "User input is not properly sanitized before being displayed, allowing potential XSS attacks.",
    affectedEndpoint: "/user/profile",
    cve: "CVE-2022-5678",
    fixAvailable: true
  },
  {
    id: "vuln-3",
    name: "Outdated SSL Certificate",
    severity: "medium",
    description: "The SSL certificate is using an outdated encryption algorithm.",
    affectedEndpoint: "*.example.com",
    fixAvailable: true
  },
  {
    id: "vuln-4",
    name: "Insecure Cookie Settings",
    severity: "medium",
    description: "Cookies do not have the 'secure' flag set, allowing them to be transmitted over unencrypted connections.",
    affectedEndpoint: "Global",
    fixAvailable: true
  },
  {
    id: "vuln-5",
    name: "Missing Rate Limiting",
    severity: "low",
    description: "API does not implement rate limiting, potentially allowing brute force attacks.",
    affectedEndpoint: "/api/endpoints",
    fixAvailable: false
  }
];

const ScannerPage = () => {
  const [userTargets, setUserTargets] = useState<{id: string, url: string}[]>([]);
  const [newUrl, setNewUrl] = useState("");
  const [addUrlError, setAddUrlError] = useState<string | null>(null);
  const [addUrlSuccess, setAddUrlSuccess] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  // Fetch user and their URLs on mount
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const q = collection(db, `users/${u.uid}/targets`);
        const snap = await getDocs(q);
        setUserTargets(snap.docs.map(doc => ({id: doc.id, url: doc.data().url})));
      } else {
        setUserTargets([]);
      }
    });
    return () => unsubscribe();
  }, []);

  // Basic URL validation
  function isValidUrl(url: string) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // Add a new URL for testing
  const handleAddUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddUrlError(null);
    setAddUrlSuccess(null);
    if (!user) {
      setAddUrlError("You must be logged in.");
      return;
    }
    if (!isValidUrl(newUrl)) {
      setAddUrlError("Please enter a valid URL (including http/https). Example: https://example.com");
      return;
    }
    try {
      // Prevent duplicate URLs
      if (userTargets.some(t => t.url === newUrl)) {
        setAddUrlError("This URL is already added.");
        return;
      }
      const docRef = await addDoc(collection(db, `users/${user.uid}/targets`), { url: newUrl });
      setUserTargets([...userTargets, { id: docRef.id, url: newUrl }]);
      setNewUrl("");
      setAddUrlSuccess("URL added successfully!");
    } catch (err: any) {
      setAddUrlError("Failed to add URL: " + (err.message || "Unknown error"));
    }
  };

  // Remove a URL
  const handleRemoveUrl = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, `users/${user.uid}/targets`, id));
      setUserTargets(userTargets.filter(t => t.id !== id));
    } catch {}
  };

  const [targets, setTargets] = useState<string[]>([""]);
  const [scanType, setScanType] = useState<"quick" | "full" | "custom">("quick");
  const [scanDepth, setScanDepth] = useState(50);
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scanComplete, setScanComplete] = useState(false);
  const [currentViewMode, setCurrentViewMode] = useState<"grid" | "list">("list");
  const [visualizationType, setVisualizationType] = useState<"sql" | "xss" | "mitm" | "idle">("idle");
  
  // Add a new target input
  const addTarget = () => {
    setTargets([...targets, ""]);
  };
  
  // Update target at index
  const updateTarget = (index: number, value: string) => {
    const newTargets = [...targets];
    newTargets[index] = value;
    setTargets(newTargets);
  };
  
  // Remove target at index
  const removeTarget = (index: number) => {
    if (targets.length > 1) {
      const newTargets = [...targets];
      newTargets.splice(index, 1);
      setTargets(newTargets);
    }
  };
  
  // Start scan
  const startScan = () => {
    setIsScanning(true);
    setScanComplete(false);
    setProgress(0);
    
    // Determine visualization type based on target URL or random
    const targetString = targets.join('').toLowerCase();
    if (targetString.includes('login') || targetString.includes('auth')) {
      setVisualizationType('sql');
    } else if (targetString.includes('form') || targetString.includes('input')) {
      setVisualizationType('xss');
    } else if (targetString.includes('api') || targetString.includes('data')) {
      setVisualizationType('mitm');
    } else {
      // Randomly select a visualization type
      const types: Array<"sql" | "xss" | "mitm"> = ['sql', 'xss', 'mitm'];
      setVisualizationType(types[Math.floor(Math.random() * types.length)]);
    }
    
    // Simulate scan progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          setScanComplete(true);
          return 100;
        }
        return prev + Math.floor(Math.random() * 10) + 1;
      });
    }, 800);
  };
  
  // Severity badge color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-500/20 text-red-400 border-red-500/40";
      case "high": return "bg-orange-500/20 text-orange-400 border-orange-500/40";
      case "medium": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/40";
      case "low": return "bg-blue-500/20 text-blue-400 border-blue-500/40";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/40";
    }
  };
  
  // Determine what scan visualization technique to display
  const getScanTestLabels = () => {
    return (
      <div className="grid grid-cols-3 gap-2 w-full mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          className={`gap-2 ${visualizationType === 'sql' ? 'border-cyber-blue text-cyber-blue' : ''}`}
          onClick={() => setVisualizationType('sql')}
        >
          <Database size={16} />
          SQL Injection
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className={`gap-2 ${visualizationType === 'xss' ? 'border-cyber-blue text-cyber-blue' : ''}`}
          onClick={() => setVisualizationType('xss')}
        >
          <Code size={16} />
          XSS Attack
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className={`gap-2 ${visualizationType === 'mitm' ? 'border-cyber-blue text-cyber-blue' : ''}`}
          onClick={() => setVisualizationType('mitm')}
        >
          <Zap size={16} />
          MITM Attack
        </Button>
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Add a URL for Testing</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddUrl} className="flex gap-2 items-center mb-2">
            <Input
              type="url"
              placeholder="https://example.com"
              value={newUrl}
              onChange={e => setNewUrl(e.target.value)}
              className="flex-1"
              required
            />
            <Button type="submit">Add URL</Button>
          </form>
          {addUrlError && <div className="text-red-500 text-sm mb-2">{addUrlError}</div>}
          {addUrlSuccess && <div className="text-green-600 text-sm mb-2">{addUrlSuccess}</div>}
          <div>
            <h4 className="font-semibold mb-2">Your URLs for Testing</h4>
            {userTargets.length === 0 ? (
              <div className="text-gray-500 text-sm">No URLs added yet.</div>
            ) : (
              <ul className="space-y-2">
                {userTargets.map(t => (
                  <li key={t.id} className="flex items-center justify-between border px-3 py-2 rounded">
                    <span className="truncate max-w-xs block">{t.url}</span>
                    <Button variant="destructive" size="sm" onClick={() => handleRemoveUrl(t.id)}>
                      Remove
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Vulnerability Scanner</h1>
      </div>
      
      {/* Scanner Visualization */}
      <ScannerVisualization 
        scanType={visualizationType} 
        isScanning={isScanning} 
        progress={progress} 
      />
      
      {scanComplete && !isScanning && getScanTestLabels()}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scan configuration */}
        <Card className="cyber-card lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-mono text-gray-300">Scan Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Target inputs */}
            <div className="space-y-4">
              <Label className="text-sm text-gray-300">Target URLs or IP Addresses</Label>
              {targets.map((target, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="https://example.com"
                    className="cyber-input"
                    value={target}
                    onChange={e => updateTarget(index, e.target.value)}
                  />
                  {targets.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                      onClick={() => removeTarget(index)}
                    >
                      <AlertCircle size={16} />
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="ghost" className="cyber-button w-full" onClick={addTarget}>
                Add Target
              </Button>
            </div>
            
            {/* Scan type tabs */}
            <div className="space-y-2">
              <Label className="text-sm text-gray-300">Scan Type</Label>
              <Tabs value={scanType} onValueChange={(v) => setScanType(v as any)}>
                <TabsList className="grid grid-cols-3">
                  <TabsTrigger value="quick">Quick</TabsTrigger>
                  <TabsTrigger value="full">Full</TabsTrigger>
                  <TabsTrigger value="custom">Custom</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            {/* Scan depth (only for custom) */}
            {scanType === "custom" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm text-gray-300">Scan Depth</Label>
                  <span className="text-sm text-cyber-blue font-mono">{scanDepth}%</span>
                </div>
                <Slider
                  value={[scanDepth]}
                  min={10}
                  max={100}
                  step={10}
                  onValueChange={values => setScanDepth(values[0])}
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Basic</span>
                  <span>Thorough</span>
                </div>
              </div>
            )}
            
            {/* Authentication options (simplified) */}
            <div className="space-y-2">
              <Label className="text-sm text-gray-300">Authentication (Optional)</Label>
              <Input
                placeholder="Username"
                className="cyber-input"
              />
              <Input
                type="password"
                placeholder="Password"
                className="cyber-input"
              />
            </div>
            
            {/* Start scan button */}
            <Button
              className="w-full text-black bg-cyber-blue hover:bg-cyber-blue/90 flex items-center gap-2"
              onClick={startScan}
              disabled={isScanning || targets[0].trim() === ""}
            >
              {isScanning ? (
                <>Running Scan...</>
              ) : (
                <>
                  <Play size={16} />
                  Start Scan
                </>
              )}
            </Button>
          </CardContent>
        </Card>
        
        {/* Scan status and results */}
        <Card className="cyber-card lg:col-span-2">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-mono text-gray-300">Scan Results</CardTitle>
            
            {scanComplete && (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="text-gray-400" onClick={() => setCurrentViewMode("grid")}>
                  <LayoutGrid size={16} className={currentViewMode === "grid" ? "text-cyber-blue" : "text-gray-400"} />
                </Button>
                <Button variant="ghost" size="icon" className="text-gray-400" onClick={() => setCurrentViewMode("list")}>
                  <List size={16} className={currentViewMode === "list" ? "text-cyber-blue" : "text-gray-400"} />
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="p-4">
            {/* Progress indicator */}
            {isScanning && (
              <div className="space-y-4">
                <div className="flex justify-between mb-1 text-sm">
                  <span className="text-gray-300">Scanning targets...</span>
                  <span className="font-mono text-cyber-blue">{progress}%</span>
                </div>
                <div className="h-2 bg-cyber-darker rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyber-blue rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="grid grid-cols-4 gap-2 mt-4">
                  {["Initializing", "Port Scanning", "Vulnerability Detection", "Reporting"].map((stage, index) => (
                    <div
                      key={stage}
                      className={`text-center p-2 rounded-md text-xs ${
                        progress >= (index + 1) * 25 - 10
                          ? "bg-cyber-blue/20 text-cyber-blue"
                          : "bg-cyber-darker text-gray-500"
                      }`}
                    >
                      {stage}
                    </div>
                  ))}
                </div>
                <div className="mt-4 animate-pulse text-center text-sm text-gray-400">
                  {progress < 25 && "Setting up scan environment..."}
                  {progress >= 25 && progress < 50 && "Detecting open ports and services..."}
                  {progress >= 50 && progress < 75 && "Analyzing vulnerabilities..."}
                  {progress >= 75 && "Generating report..."}
                </div>
              </div>
            )}
            
            {/* Empty state */}
            {!isScanning && !scanComplete && (
              <div className="py-12 flex flex-col items-center justify-center text-gray-500">
                <Shield size={48} className="mb-4 opacity-50" />
                <p className="text-center mb-2">No scan results yet.</p>
                <p className="text-center text-sm">Configure target and press "Start Scan" to begin.</p>
              </div>
            )}
            
            {/* Scan results */}
            {scanComplete && (
              <div className="space-y-6">
                {/* Attack Summary Card */}
                <div className="flex flex-col md:flex-row gap-4 items-center mb-6 p-4 rounded-lg border border-cyber-blue/40 bg-cyber-blue/5">
                  <div className="flex items-center gap-4 flex-1">
                    {visualizationType === 'sql' && <Database size={48} className="text-cyber-blue" />}
                    {visualizationType === 'xss' && <Code size={48} className="text-cyber-magenta" />}
                    {visualizationType === 'mitm' && <Zap size={48} className="text-cyber-orange" />}
                    <div>
                      <div className="text-lg font-bold text-cyber-blue">
                        {visualizationType === 'sql' && 'SQL Injection Attack Predicted'}
                        {visualizationType === 'xss' && 'Cross-Site Scripting (XSS) Predicted'}
                        {visualizationType === 'mitm' && 'Man-in-the-Middle (MITM) Attack Predicted'}
                      </div>
                      <div className="text-gray-300 mt-1">
                        {visualizationType === 'sql' && 'Your application login or data endpoints may be vulnerable to SQL injection. Attackers could access or modify your database.'}
                        {visualizationType === 'xss' && 'User input fields may be vulnerable to XSS, allowing attackers to inject malicious scripts into your site.'}
                        {visualizationType === 'mitm' && 'API endpoints or data flows may be susceptible to interception by a Man-in-the-Middle.'}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 min-w-[220px]">
                    <Badge className={
                      visualizationType === 'sql' ? 'bg-red-500/20 text-red-400 border-red-500/40' :
                      visualizationType === 'xss' ? 'bg-orange-500/20 text-orange-400 border-orange-500/40' :
                      visualizationType === 'mitm' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40' :
                      'bg-gray-500/20 text-gray-400 border-gray-500/40'
                    }>
                      {visualizationType === 'sql' && 'Critical'}
                      {visualizationType === 'xss' && 'High'}
                      {visualizationType === 'mitm' && 'Medium'}
                    </Badge>
                    <Button size="sm" className="mt-2" onClick={() => window.print()}>
                      Download Report
                    </Button>
                  </div>
                </div>

                {/* Recommendations & Details */}
                <div className="bg-cyber-darker/80 p-6 rounded-lg border border-cyber-blue/20">
                  <h3 className="text-cyber-blue font-bold mb-2">Remediation & Recommendations</h3>
                  <ul className="list-disc pl-6 text-gray-300 space-y-2">
                    {visualizationType === 'sql' && (
                      <>
                        <li>Use parameterized queries or prepared statements for all database access.</li>
                        <li>Sanitize and validate all user inputs, especially in login and data forms.</li>
                        <li>Restrict database user permissions as much as possible.</li>
                        <li>Monitor and log database access for suspicious activity.</li>
                      </>
                    )}
                    {visualizationType === 'xss' && (
                      <>
                        <li>Sanitize and escape all user-generated content before rendering.</li>
                        <li>Implement Content Security Policy (CSP) headers to restrict script execution.</li>
                        <li>Use frameworks that auto-escape output (React, Angular, etc.).</li>
                        <li>Validate input on both client and server sides.</li>
                      </>
                    )}
                    {visualizationType === 'mitm' && (
                      <>
                        <li>Enforce HTTPS for all endpoints and redirect all HTTP traffic to HTTPS.</li>
                        <li>Use strong TLS configurations and keep certificates up to date.</li>
                        <li>Validate SSL certificates on both client and server sides.</li>
                        <li>Educate users about phishing and certificate warnings.</li>
                      </>
                    )}
                  </ul>
                </div>
                
                {/* Action buttons */}
                <div className="flex gap-2 mb-4">
                  <Button className="cyber-button">
                    <Download size={16} />
                    Export PDF
                  </Button>
                  <Button className="cyber-button">
                    <Wrench size={16} />
                    Auto-Fix
                  </Button>
                </div>
                
                {/* Results list */}
                <div className="space-y-4">
                  {currentViewMode === "list" ? (
                    <div className="rounded-md overflow-hidden border border-cyber-blue/20">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-cyber-darker">
                            <th className="px-4 py-2 text-left text-xs uppercase text-gray-400">Severity</th>
                            <th className="px-4 py-2 text-left text-xs uppercase text-gray-400">Vulnerability</th>
                            <th className="px-4 py-2 text-left text-xs uppercase text-gray-400">Endpoint</th>
                            <th className="px-4 py-2 text-right text-xs uppercase text-gray-400">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-cyber-blue/20">
                          {vulnerabilities.map(vuln => (
                            <tr key={vuln.id} className="hover:bg-cyber-blue/5 transition-colors">
                              <td className="px-4 py-3">
                                <Badge className={getSeverityColor(vuln.severity)}>
                                  {vuln.severity}
                                </Badge>
                              </td>
                              <td className="px-4 py-3">
                                <div className="font-medium text-gray-200">{vuln.name}</div>
                                <div className="text-xs text-gray-500 mt-1">{vuln.cve || "No CVE assigned"}</div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="text-gray-300 font-mono">{vuln.affectedEndpoint}</div>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <Button size="sm" variant="ghost" className="text-xs text-cyber-blue">
                                  Details <ArrowRight size={12} className="ml-1" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {vulnerabilities.map(vuln => (
                        <Card key={vuln.id} className="cyber-card">
                          <CardContent className="p-4">
                            <div className="flex justify-between mb-2">
                              <Badge className={getSeverityColor(vuln.severity)}>
                                {vuln.severity}
                              </Badge>
                              {vuln.fixAvailable ? (
                                <Badge className="bg-green-500/20 text-green-400 border-green-500/40">
                                  Auto-fix Available
                                </Badge>
                              ) : (
                                <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/40">
                                  Manual Fix
                                </Badge>
                              )}
                            </div>
                            <h3 className="text-gray-200 font-medium mb-1">{vuln.name}</h3>
                            <p className="text-xs text-gray-400 mb-3">{vuln.description}</p>
                            <div className="text-xs text-gray-500 mb-3">
                              <div>Endpoint: <span className="font-mono text-gray-300">{vuln.affectedEndpoint}</span></div>
                              {vuln.cve && <div>CVE: <span className="font-mono text-gray-300">{vuln.cve}</span></div>}
                            </div>
                            <div className="flex justify-end">
                              <Button className="text-xs" variant="ghost">View Details</Button>
                              {vuln.fixAvailable && (
                                <Button className="text-xs bg-green-500/20 text-green-400 hover:bg-green-500/30">
                                  <Check size={12} className="mr-1" />
                                  Apply Fix
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ScannerPage;
