import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Animated dotted line between client and server
const AttackDottedLine = () => (
  <svg className="absolute top-1/2 left-[24%]" width="52%" height="0" style={{ zIndex: 1 }}>
    <line
      x1="0" y1="0" x2="100%" y2="0"
      stroke="#F97316"
      strokeWidth={4}
      strokeDasharray="10 8"
      style={{
        animation: 'dashmove 1.2s linear infinite',
      }}
    />
    <style>{`@keyframes dashmove { to { stroke-dashoffset: -32; } }`}</style>
  </svg>
);

// Single Attacker Component
const Attacker = ({ position, delay }: { position: string; delay: string }) => (
  <div className={`absolute ${position}`}>
    <div className="cyber-card w-16 h-16 flex items-center justify-center relative">
      {/* Attacker Icon */}
      <svg
        className="w-8 h-8 text-cyber-yellow z-10"
        viewBox="0 0 24 24"
        fill="none"
      >
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
        <path d="M8 15c1.333-2 6.667-2 8 0" stroke="currentColor" strokeWidth="2" />
        <circle cx="9" cy="10" r="1" fill="currentColor" />
        <circle cx="15" cy="10" r="1" fill="currentColor" />
      </svg>
      {/* Data Packet */}
      <div className="absolute left-full top-1/2 -translate-y-1/2">
        <div
          className="h-2 w-2 rounded-full bg-cyber-yellow"
          style={{
            animation: `data-flow 1.5s infinite ${delay}`,
            position: "absolute",
          }}
        />
      </div>
    </div>
  </div>
);

// Victim Client Component
const Client = ({ position }: { position: string }) => (
  <div className={`absolute ${position}`}>
    <div className="cyber-card w-16 h-16 flex items-center justify-center">
      {/* Client Icon */}
      <svg
        className="w-8 h-8 text-cyber-blue z-10"
        viewBox="0 0 24 24"
        fill="none"
      >
        <rect x="4" y="4" width="16" height="16" rx="4" stroke="currentColor" strokeWidth="2" />
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
      </svg>
    </div>
  </div>
);

// Server Component
const Server = () => (
  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
    <div className="cyber-card w-32 h-40 cyber-warning animate-alert-flash flex flex-col items-center justify-center relative">
      {/* Server Icon */}
      <svg
        className="w-20 h-20 text-cyber-blue z-10"
        viewBox="0 0 24 24"
        fill="none"
      >
        <rect x="3" y="12.5" width="18" height="3" rx="1" stroke="currentColor" strokeWidth="2" />
        <rect x="5" y="15.5" width="14" height="3" rx="1" stroke="currentColor" strokeWidth="2" />
        <rect x="7" y="18.5" width="10" height="3" rx="1" stroke="currentColor" strokeWidth="2" />
      </svg>
      {/* Warning Icon */}
      <div className="absolute top-1 right-1 bg-cyber-yellow rounded-full p-1 animate-pulse">
        <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 9V14M12 17H12.01M7.8 21H16.2C17.8802 21 18.7202 21 19.362 20.673C19.9265 20.3854 20.3854 19.9265 20.673 19.362C21 18.7202 21 17.8802 21 16.2V7.8C21 6.11984 21 5.27976 20.673 4.63803C20.3854 4.07354 19.9265 3.6146 19.362 3.32698C18.7202 3 17.8802 3 16.2 3H7.8C6.11984 3 5.27976 3 4.63803 3.32698C4.07354 3.6146 3.6146 4.07354 3.32698 4.63803C3 5.27976 3 6.11984 3 7.8V16.2C3 17.8802 3 18.7202 3.32698 19.362C3.6146 19.9265 4.07354 20.3854 4.63803 20.673C5.27976 21 6.11984 21 7.8 21Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="text-xs mt-2 text-cyber-yellow font-semibold">Intercepting</div>
    </div>
    {/* Tooltip */}
    <div className="absolute -top-4 -right-4">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="bg-cyber-blue rounded-full p-1.5 hover:bg-cyber-blue/80 transition-colors">
              <Info className="w-4 h-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent
            side="top"
            className="bg-black/90 border-cyber-blue p-2 text-white max-w-xs"
          >
            <p>Man-in-the-Middle: Attacker intercepts traffic between client and server</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  </div>
);

// Main MitM Attack Animation
const MitmAttack = () => {
  // Position attackers and clients around the server
  const attackerPositions = [
    "top-[15%] left-[30%]",
    "top-[15%] right-[30%]",
    "bottom-[15%] left-[30%]",
    "bottom-[15%] right-[30%]"
  ];
  const clientPositions = [
    "top-[5%] left-1/2 -translate-x-1/2",
    "bottom-[5%] left-1/2 -translate-x-1/2",
    "left-[5%] top-1/2 -translate-y-1/2",
    "right-[5%] top-1/2 -translate-y-1/2"
  ];

  return (
    <div className="relative w-full h-full min-h-[500px] bg-gradient-to-b from-cyber-dark to-black flex justify-center items-center overflow-hidden">
      {/* Cyber Grid */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, #eab308 1px, transparent 1px), linear-gradient(to bottom, #eab308 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      {/* Attackers */}
      {attackerPositions.map((pos, i) => (
        <Attacker key={i} position={pos} delay={`${i * 0.3}s`} />
      ))}
      {/* Clients */}
      {clientPositions.map((pos, i) => (
        <Client key={i} position={pos} />
      ))}
      {/* Server (victim) */}
      <Server />
    </div>
  );
};

export default MitmAttack;
