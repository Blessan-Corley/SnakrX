/**
 * Input Performance Monitor Component
 * Displays real-time input performance metrics for debugging and optimization
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Zap, Target, Clock } from 'lucide-react';

const InputPerformanceMonitor = ({ 
  getInputPerformance, 
  isVisible = false,
  position = 'top-right' 
}) => {
  const [performance, setPerformance] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (!isVisible || !getInputPerformance) return;

    const updatePerformance = () => {
      setPerformance(getInputPerformance());
    };

    // Update every 500ms when visible
    const interval = setInterval(updatePerformance, 500);
    updatePerformance(); // Initial update

    return () => clearInterval(interval);
  }, [isVisible, getInputPerformance]);

  if (!isVisible || !performance) return null;

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4'
  };

  const getLatencyColor = (latency) => {
    const latencyNum = parseFloat(latency);
    if (latencyNum < 5) return 'text-green-400';
    if (latencyNum < 10) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getSuccessRateColor = (rate) => {
    const rateNum = parseFloat(rate);
    if (rateNum >= 98) return 'text-green-400';
    if (rateNum >= 90) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <motion.div
      className={`fixed ${positionClasses[position]} z-50`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
    >
      <div className="bg-black/80 backdrop-blur-sm border border-white/20 rounded-lg p-3 text-xs font-mono text-white shadow-xl">
        <div 
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <Activity className="w-4 h-4 text-blue-400" />
          <span className="font-semibold">Input Monitor</span>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            className="text-white/60"
          >
            ↓
          </motion.div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-2 space-y-2 overflow-hidden"
            >
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <Zap className="w-3 h-3 text-yellow-400" />
                    <span className={getLatencyColor(performance.averageLatency)}>
                      {performance.averageLatency}
                    </span>
                  </div>
                  <div className="text-white/60">Latency</div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <Target className="w-3 h-3 text-green-400" />
                    <span className={getSuccessRateColor(performance.successRate)}>
                      {performance.successRate}
                    </span>
                  </div>
                  <div className="text-white/60">Success</div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-blue-400" />
                    <span className="text-white">
                      {performance.queueSize}
                    </span>
                  </div>
                  <div className="text-white/60">Queue</div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <Activity className="w-3 h-3 text-purple-400" />
                    <span className="text-white">
                      {performance.keysDown}
                    </span>
                  </div>
                  <div className="text-white/60">Keys</div>
                </div>
              </div>

              <div className="border-t border-white/20 pt-2 space-y-1">
                <div className="flex justify-between">
                  <span className="text-white/60">Total:</span>
                  <span className="text-white">{performance.totalInputs}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Processed:</span>
                  <span className="text-green-400">{performance.processedInputs}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Dropped:</span>
                  <span className="text-red-400">{performance.droppedInputs}</span>
                </div>
              </div>

              {/* Performance indicators */}
              <div className="flex gap-1 mt-2">
                <div 
                  className={`w-2 h-2 rounded-full ${
                    parseFloat(performance.averageLatency) < 5 ? 'bg-green-400' : 
                    parseFloat(performance.averageLatency) < 10 ? 'bg-yellow-400' : 'bg-red-400'
                  }`}
                  title={`Latency: ${performance.averageLatency}`}
                />
                <div 
                  className={`w-2 h-2 rounded-full ${
                    parseFloat(performance.successRate) >= 98 ? 'bg-green-400' : 
                    parseFloat(performance.successRate) >= 90 ? 'bg-yellow-400' : 'bg-red-400'
                  }`}
                  title={`Success Rate: ${performance.successRate}`}
                />
                <div 
                  className={`w-2 h-2 rounded-full ${
                    performance.queueSize === 0 ? 'bg-green-400' : 
                    performance.queueSize < 5 ? 'bg-yellow-400' : 'bg-red-400'
                  }`}
                  title={`Queue Size: ${performance.queueSize}`}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default InputPerformanceMonitor;