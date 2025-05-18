import { useState } from 'react';
import { Info } from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Animated dotted line between botnet and server
const AttackDottedLine = () => (
  <svg className="absolute top-1/2 left-[14%]" width="72%" height="0" style={{ zIndex: 1 }}>
    <line
      x1="0" y1="0" x2="100%" y2="0"
      stroke="#ef4444"
      strokeWidth={4}
      strokeDasharray="10 8"
      style={{
        animation: 'dashmove 1.2s linear infinite',
      }}
    />
    <style>{`@keyframes dashmove { to { stroke-dashoffset: -32; } }`}</style>
  </svg>
);

// Component for a single bot/infected computer
const Bot = ({ position, delay }: { position: string, delay: string }) => {
  return (
    <div className={`absolute ${position}`}>
      <div className="cyber-card w-16 h-16 flex items-center justify-center">
        <div className="relative z-10">
          <svg className="w-8 h-8 text-cyber-blue" viewBox="0 0 24 24" fill="none">
            <path d="M20 7L12 3L4 7M20 7V17L12 21M20 7L12 11M12 21L4 17V7M12 21V11M4 7L12 11" 
                  stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>
        
        {/* Data packets animation */}
        <div className="absolute left-full top-1/2 -translate-y-1/2">
          <div 
            className="h-2 w-2 rounded-full bg-cyber-red" 
            style={{
              animation: `data-flow 1.5s infinite ${delay}`,
              position: 'absolute'
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

// Server component with warning indicator
const Server = () => {
  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
      <div className="cyber-card w-32 h-40 cyber-warning animate-alert-flash flex flex-col items-center justify-center">
        <div className="relative z-10">
          <svg className="w-20 h-20 text-cyber-red" viewBox="0 0 24 24" fill="none">
            <path d="M5 12.5V5.5C5 4.11929 6.11929 3 7.5 3H16.5C17.8807 3 19 4.11929 19 5.5V12.5" 
                  stroke="currentColor" strokeWidth="2" />
            <rect x="3" y="12.5" width="18" height="3" rx="1" stroke="currentColor" strokeWidth="2" />
            <rect x="5" y="15.5" width="14" height="3" rx="1" stroke="currentColor" strokeWidth="2" />
            <rect x="7" y="18.5" width="10" height="3" rx="1" stroke="currentColor" strokeWidth="2" />
          </svg>
          
          {/* Warning symbol */}
          <div className="absolute top-1 right-1 bg-cyber-red rounded-full p-1 animate-pulse">
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none">
              <path d="M12 9V14M12 17H12.01M7.8 21H16.2C17.8802 21 18.7202 21 19.362 20.673C19.9265 20.3854 20.3854 19.9265 20.673 19.362C21 18.7202 21 17.8802 21 16.2V7.8C21 6.11984 21 5.27976 20.673 4.63803C20.3854 4.07354 19.9265 3.6146 19.362 3.32698C18.7202 3 17.8802 3 16.2 3H7.8C6.11984 3 5.27976 3 4.63803 3.32698C4.07354 3.6146 3.6146 4.07354 3.32698 4.63803C3 5.27976 3 6.11984 3 7.8V16.2C3 17.8802 3 18.7202 3.32698 19.362C3.6146 19.9265 4.07354 20.3854 4.63803 20.673C5.27976 21 6.11984 21 7.8 21Z" 
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        <div className="text-xs mt-2 text-cyber-red font-semibold">Overloaded</div>
      </div>
      
      {/* Info tooltip */}
      <div className="absolute -top-4 -right-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="bg-cyber-blue rounded-full p-1.5 hover:bg-cyber-blue/80 transition-colors">
                <Info className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-black/90 border-cyber-blue p-2 text-white max-w-xs">
              <p>DDoS Attack: Server overwhelmed by traffic from compromised devices</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

const DDoSAttack = () => {
  // Bot positions around the center server - improved positioning for better alignment
  const botPositions = [
    "top-1/5 left-1/4", 
    "top-1/5 right-1/4",
    "bottom-1/5 left-1/4",
    "bottom-1/5 right-1/4",
    "top-1/8 left-1/2",
    "bottom-1/8 left-1/2",
    "left-1/8 top-1/2",
    "right-1/8 top-1/2"
  ];

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-cyber-dark to-black flex justify-center items-center">
      {/* Grid lines for cyber effect */}
      <div className="absolute inset-0 opacity-20" 
           style={{
             backgroundImage: 'linear-gradient(to right, #0EA5E9 1px, transparent 1px), linear-gradient(to bottom, #0EA5E9 1px, transparent 1px)',
             backgroundSize: '40px 40px'
           }}>
      </div>
      
      {/* Bots sending traffic */}
      {botPositions.map((position, index) => (
        <Bot key={index} position={position} delay={`${index * 0.2}s`} />
      ))}
      
      {/* Central server */}
      <Server />
    </div>
  );
};

export default DDoSAttack;
