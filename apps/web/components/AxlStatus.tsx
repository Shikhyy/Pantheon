export default function AxlStatus() {
  const mockStatus = 'healthy' as const;
  const statusConfig = {
    healthy: { color: 'text-olivine', label: 'Healthy' },
    degraded: { color: 'text-sky', label: 'Degraded' },
    disconnected: { color: 'text-hadria', label: 'Disconnected' },
  } as const;
  const { color: statusColor } = statusConfig[mockStatus];

  return (
    <div className="fixed bottom-4 right-4 stone-card p-3 text-sm space-y-1 z-50">
      <div className="flex items-center gap-2 mb-1">
        <div className={`w-2 h-2 rounded-full ${statusColor}`} />
        <span className="font-medium">AXL Swarm</span>
      </div>
      <div className="flex justify-between gap-4">
        <span>Nodes: <span className={statusColor}>12 active</span></span>
        <span>Latency: <span className={statusColor}>42ms avg</span></span>
      </div>
      <div className="flex justify-between gap-4">
        <span>Compute: <span className={statusColor}>89%</span></span>
      </div>
    </div>
  );
}
