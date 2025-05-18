import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Animated dotted line between attacker and database
const AttackDottedLine = () => (
  <svg className="absolute top-1/2 left-[12%]" width="76%" height="0" style={{ zIndex: 1 }}>
    <line
      x1="0" y1="0" x2="100%" y2="0"
      stroke="#0FA0CE"
      strokeWidth={4}
      strokeDasharray="10 8"
      style={{
        animation: 'dashmove 1.2s linear infinite',
      }}
    />
    <style>{`@keyframes dashmove { to { stroke-dashoffset: -32; } }`}</style>
  </svg>
);

// Attacker Bot
const Attacker = ({ delay }: { delay: string }) => (
  <div className="absolute left-[5%] top-1/2 -translate-y-1/2">
    <div className="cyber-card w-16 h-16 flex items-center justify-center relative">
      <svg
        className="w-8 h-8 text-cyber-red"
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M12 2L2 22h20L12 2z"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>

      {/* Malicious Query Line */}
      <div className="absolute left-full top-1/2 -translate-y-1/2">
        <div
          className="h-2 w-2 rounded-full bg-cyber-red"
          style={{
            animation: `sql-payload 2s infinite ${delay}`,
            position: "absolute",
          }}
        />
      </div>
    </div>
  </div>
);

// Input Field being exploited
const InputField = () => (
  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[150%]">
    <div className="cyber-card px-4 py-2 text-sm text-white border border-cyber-blue bg-cyber-dark">
      <span>User ID: </span>
      <span className="text-cyber-red">' OR '1'='1</span>
    </div>
  </div>
);

// Compromised Database
const Database = () => (
  <div className="absolute right-[10%] top-1/2 -translate-y-1/2">
    <div className="cyber-card w-32 h-40 border-cyber-red animate-alert-flash flex flex-col items-center justify-center relative">
      {/* DB Icon */}
      <svg
        className="w-16 h-16 text-cyber-red z-10"
        viewBox="0 0 24 24"
        fill="none"
      >
        <ellipse
          cx="12"
          cy="5"
          rx="8"
          ry="3"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M4 5v14c0 1.656 3.582 3 8 3s8-1.344 8-3V5"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>

      <div className="text-xs mt-2 text-cyber-red font-semibold">
        Data Leak
      </div>

      {/* Tooltip */}
      <div className="absolute -top-3 -right-3">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="bg-cyber-blue rounded-full p-1.5 hover:bg-cyber-blue/80">
                <Info className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              className="bg-black/90 border-cyber-blue p-2 text-white max-w-xs"
            >
              <p>
                SQL Injection: Malicious input bypasses authentication and exposes sensitive data.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  </div>
);

// Main SQL Injection Scene
const SQLInjection = () => {
  return (
    <div className="relative w-full h-full min-h-[500px] bg-gradient-to-b from-cyber-dark to-black flex justify-center items-center overflow-hidden">
      {/* Cyber Grid */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, #0EA5E9 1px, transparent 1px), linear-gradient(to bottom, #0EA5E9 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Components */}
      <Attacker delay="0s" />
      <InputField />
      <Database />
    </div>
  );
};

export default SQLInjection;
