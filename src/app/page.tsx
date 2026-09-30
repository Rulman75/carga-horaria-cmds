'use client';
import { useEffect, useState } from 'react';
import SchoolDashboard from './dashboard/components/SchoolDashboard';
import GlobalDashboard from './dashboard/components/GlobalDashboard';

export default function DashboardPage() {
  const [estId, setEstId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const idStr = localStorage.getItem('selectedEstablecimientoId');
    const id = idStr ? Number(idStr) : 0;
    if (id > 0) {
      setEstId(id);
    }
    setLoading(false);
  }, []);

  if (loading) return null;

  return (
    <div className="max-w-7xl mx-auto h-full p-4 md:p-8">
      {estId ? (
        <SchoolDashboard estId={estId} />
      ) : (
        <GlobalDashboard />
      )}
    </div>
  );
}
