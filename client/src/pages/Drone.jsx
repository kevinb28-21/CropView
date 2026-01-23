import React, { useEffect, useState } from 'react';
import { api, formatDate } from '../utils/api.js';

export default function DronePage() {
  const [telemetry, setTelemetry] = useState(null);
  const [battery, setBattery] = useState(null);
  const [health, setHealth] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [flightHistory, setFlightHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Schedule Modal State
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    name: '',
    time: '09:00',
    duration: 20,
    area: 'North Field',
    priority: 'Medium',
    daysFromNow: 1
  });

  useEffect(() => {
    let mounted = true;
    let intervalId = null;
    let isFetching = false;

    const fetchData = async () => {
      if (document.hidden || isFetching || !mounted) return;

      isFetching = true;
      try {
        const tel = await api.get('/api/telemetry').catch(() => null);

        if (mounted && tel) {
          setTelemetry(tel);
          
          setBattery({
            level: 85,
            voltage: 11.8,
            current: 2.5,
            temperature: 28,
            cycles: 142,
            health: 'Good',
            estimatedTimeRemaining: 25,
            charging: false,
            lastCharged: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
          });

          setHealth({
            overall: 'Excellent',
            status: 'Operational',
            uptime: 99.8,
            lastMaintenance: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            nextMaintenance: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000).toISOString(),
            components: {
              motors: { status: 'Good', hours: 245 },
              propellers: { status: 'Good', hours: 89 },
              camera: { status: 'Excellent', hours: 312 },
              gimbal: { status: 'Good', hours: 198 },
              sensors: { status: 'Excellent', hours: 312 }
            },
            errors: [],
            warnings: []
          });

          setFlightHistory([
            { id: 1, date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), duration: 18, distance: 2.4, images: 156, status: 'Completed', batteryStart: 100, batteryEnd: 72 },
            { id: 2, date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), duration: 22, distance: 3.1, images: 203, status: 'Completed', batteryStart: 100, batteryEnd: 68 },
            { id: 3, date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), duration: 15, distance: 1.8, images: 124, status: 'Completed', batteryStart: 95, batteryEnd: 75 }
          ]);
        }
      } catch (e) {
        console.error('Error fetching drone data:', e);
      } finally {
        if (mounted) { setIsLoading(false); isFetching = false; }
      }
    };

    fetchData();

    const startPolling = () => {
      if (!document.hidden && !intervalId && mounted) {
        intervalId = setInterval(() => { if (!document.hidden && mounted) fetchData(); }, 30000);
      }
    };

    const stopPolling = () => { if (intervalId) { clearInterval(intervalId); intervalId = null; } };

    startPolling();

    const handleVisibilityChange = () => {
      if (document.hidden) stopPolling();
      else { startPolling(); fetchData(); }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => { mounted = false; stopPolling(); document.removeEventListener('visibilitychange', handleVisibilityChange); };
  }, []);

  useEffect(() => {
    setSchedules([
      { id: 1, name: 'Morning Field Survey', time: '08:00', date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), duration: 20, area: 'North Field', status: 'Scheduled', priority: 'High' },
      { id: 2, name: 'Afternoon Health Check', time: '14:00', date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), duration: 15, area: 'South Field', status: 'Scheduled', priority: 'Medium' },
      { id: 3, name: 'Weekly Full Survey', time: '09:00', date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), duration: 45, area: 'All Fields', status: 'Scheduled', priority: 'High' }
    ]);
  }, []);

  const handleCreateSchedule = () => {
    if (!newSchedule.name.trim()) return;
    const date = new Date();
    date.setDate(date.getDate() + newSchedule.daysFromNow);
    const schedule = { id: Date.now(), name: newSchedule.name, time: newSchedule.time, date: date.toISOString(), duration: newSchedule.duration, area: newSchedule.area, status: 'Scheduled', priority: newSchedule.priority };
    setSchedules(prev => [...prev, schedule]);
    setShowScheduleModal(false);
    setNewSchedule({ name: '', time: '09:00', duration: 20, area: 'North Field', priority: 'Medium', daysFromNow: 1 });
  };

  const handleDeleteSchedule = (id) => setSchedules(prev => prev.filter(s => s.id !== id));

  const getBatteryColor = (level) => level >= 70 ? 'var(--color-success)' : level >= 40 ? 'var(--color-warning)' : 'var(--color-error)';
  const getHealthColor = (status) => (status === 'Excellent' || status === 'Good') ? 'var(--color-success)' : status === 'Fair' ? 'var(--color-warning)' : 'var(--color-error)';

  if (isLoading) {
    return (
      <div className="container">
        <div className="card">
          <div style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
            <div className="animate-pulse" style={{ fontSize: '2rem', marginBottom: 'var(--space-4)' }}>🚁</div>
            <div>Loading drone information...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in">
      {/* Schedule Modal */}
      {showScheduleModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 'var(--space-4)', backdropFilter: 'blur(4px)' }} onClick={() => setShowScheduleModal(false)}>
          <div className="card card-elevated" style={{ width: '100%', maxWidth: 480, maxHeight: '90vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
              <h3 className="section-title" style={{ marginBottom: 0 }}>New Flight Schedule</h3>
              <button onClick={() => setShowScheduleModal(false)} style={{ background: 'none', border: 'none', fontSize: 'var(--font-size-xl)', cursor: 'pointer', color: 'var(--color-text-tertiary)', padding: 'var(--space-1)', lineHeight: 1 }}>×</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div>
                <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>Schedule Name *</label>
                <input type="text" value={newSchedule.name} onChange={e => setNewSchedule(prev => ({ ...prev, name: e.target.value }))} placeholder="e.g., Morning Field Survey" style={{ width: '100%', padding: 'var(--space-3)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)', background: 'var(--color-bg-primary)', color: 'var(--color-text-primary)' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>Time</label>
                  <input type="time" value={newSchedule.time} onChange={e => setNewSchedule(prev => ({ ...prev, time: e.target.value }))} style={{ width: '100%', padding: 'var(--space-3)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)', background: 'var(--color-bg-primary)', color: 'var(--color-text-primary)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>Duration (min)</label>
                  <input type="number" min="5" max="120" value={newSchedule.duration} onChange={e => setNewSchedule(prev => ({ ...prev, duration: parseInt(e.target.value) || 20 }))} style={{ width: '100%', padding: 'var(--space-3)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)', background: 'var(--color-bg-primary)', color: 'var(--color-text-primary)' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>Area</label>
                <select value={newSchedule.area} onChange={e => setNewSchedule(prev => ({ ...prev, area: e.target.value }))} style={{ width: '100%', padding: 'var(--space-3)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)', background: 'var(--color-bg-primary)', color: 'var(--color-text-primary)', cursor: 'pointer' }}>
                  <option value="North Field">North Field</option>
                  <option value="South Field">South Field</option>
                  <option value="East Field">East Field</option>
                  <option value="West Field">West Field</option>
                  <option value="Greenhouse A">Greenhouse A</option>
                  <option value="Greenhouse B">Greenhouse B</option>
                  <option value="All Fields">All Fields</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>Priority</label>
                  <select value={newSchedule.priority} onChange={e => setNewSchedule(prev => ({ ...prev, priority: e.target.value }))} style={{ width: '100%', padding: 'var(--space-3)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)', background: 'var(--color-bg-primary)', color: 'var(--color-text-primary)', cursor: 'pointer' }}>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>Days from now</label>
                  <input type="number" min="0" max="30" value={newSchedule.daysFromNow} onChange={e => setNewSchedule(prev => ({ ...prev, daysFromNow: parseInt(e.target.value) || 1 }))} style={{ width: '100%', padding: 'var(--space-3)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)', background: 'var(--color-bg-primary)', color: 'var(--color-text-primary)' }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-2)', justifyContent: 'flex-end' }}>
                <button className="btn btn-secondary" onClick={() => setShowScheduleModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleCreateSchedule} disabled={!newSchedule.name.trim()} style={{ opacity: newSchedule.name.trim() ? 1 : 0.5, cursor: newSchedule.name.trim() ? 'pointer' : 'not-allowed' }}>Create Schedule</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container-grid">
        {/* Battery Status */}
        <div className="card card-elevated animate-fade-in-up">
          <h3 className="section-title">Battery Status</h3>
          {battery ? (
            <div>
              <div style={{ marginBottom: 'var(--space-6)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                  <span className="metric-label">Battery Level</span>
                  <span style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: getBatteryColor(battery.level) }}>{battery.level}%</span>
                </div>
                <div style={{ width: '100%', height: '24px', background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-full)', overflow: 'hidden', border: '2px solid var(--color-border)' }}>
                  <div style={{ width: `${battery.level}%`, height: '100%', background: `linear-gradient(90deg, ${getBatteryColor(battery.level)} 0%, ${getBatteryColor(battery.level)}dd 100%)`, transition: 'width 0.3s ease', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 'var(--space-2)', color: 'white', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)' }}>{battery.level >= 10 && `${battery.level}%`}</div>
                </div>
              </div>
              <div className="metrics">
                <div className="metric"><div className="metric-label">Voltage</div><div className="metric-value" style={{ fontSize: 'var(--font-size-xl)' }}>{battery.voltage}V</div></div>
                <div className="metric"><div className="metric-label">Current</div><div className="metric-value" style={{ fontSize: 'var(--font-size-xl)' }}>{battery.current}A</div></div>
                <div className="metric"><div className="metric-label">Temperature</div><div className="metric-value" style={{ fontSize: 'var(--font-size-xl)' }}>{battery.temperature}°C</div></div>
                <div className="metric"><div className="metric-label">Cycles</div><div className="metric-value" style={{ fontSize: 'var(--font-size-xl)' }}>{battery.cycles}</div></div>
              </div>
              <div style={{ marginTop: 'var(--space-4)', padding: 'var(--space-4)', background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div><div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)' }}>Estimated Flight Time</div><div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)' }}>{battery.estimatedTimeRemaining} min</div></div>
                <div style={{ padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-full)', background: battery.charging ? 'var(--color-info-bg)' : 'var(--color-bg-secondary)', color: battery.charging ? 'var(--color-info-text)' : 'var(--color-text-secondary)', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)' }}>{battery.charging ? '⚡ Charging' : '🔋 Standby'}</div>
              </div>
            </div>
          ) : (<div className="empty-state"><div className="empty-state-icon">🔋</div><div className="empty-state-title">No Battery Data</div></div>)}
        </div>

        {/* Health Analytics */}
        <div className="card card-elevated animate-fade-in-up stagger-1">
          <h3 className="section-title">Health Analytics</h3>
          {health ? (
            <div>
              <div style={{ marginBottom: 'var(--space-6)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                  <div><div className="metric-label">Overall Status</div><div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: getHealthColor(health.overall) }}>{health.overall}</div></div>
                  <div style={{ padding: 'var(--space-3) var(--space-5)', borderRadius: 'var(--radius-lg)', background: getHealthColor(health.status === 'Operational' ? 'Excellent' : health.status), color: 'white', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)' }}>{health.status}</div>
                </div>
                <div className="metrics">
                  <div className="metric"><div className="metric-label">Uptime</div><div className="metric-value" style={{ fontSize: 'var(--font-size-xl)' }}>{health.uptime}%</div></div>
                  <div className="metric"><div className="metric-label">Last Maintenance</div><div className="metric-value" style={{ fontSize: 'var(--font-size-sm)' }}>{formatDate(health.lastMaintenance, 'date')}</div></div>
                </div>
              </div>
              <div style={{ marginTop: 'var(--space-4)' }}>
                <div className="metric-label" style={{ marginBottom: 'var(--space-3)' }}>Component Status</div>
                <div className="list">
                  {Object.entries(health.components).map(([name, data]) => (
                    <div key={name} className="list-item" style={{ cursor: 'default' }}>
                      <div style={{ flex: 1 }}><div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', textTransform: 'capitalize', marginBottom: 'var(--space-1)' }}>{name}</div><div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)' }}>{data.hours} hours</div></div>
                      <span className={`badge badge-${data.status === 'Excellent' ? 'success' : data.status === 'Good' ? 'info' : 'warning'}`}>{data.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (<div className="empty-state"><div className="empty-state-icon">🏥</div><div className="empty-state-title">No Health Data</div></div>)}
        </div>

        {/* Flight Schedule */}
        <div className="card card-elevated animate-fade-in-up stagger-2">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <h3 className="section-title" style={{ marginBottom: 0 }}>Flight Schedule</h3>
            <button className="btn btn-primary btn-sm" onClick={() => setShowScheduleModal(true)}>+ New Schedule</button>
          </div>
          {schedules.length > 0 ? (
            <div className="list">
              {schedules.map((schedule) => (
                <div key={schedule.id} className="list-item">
                  <div style={{ flex: 1 }}><div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-1)' }}>{schedule.name}</div><div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)' }}>{formatDate(schedule.date, 'date')} at {schedule.time} • {schedule.duration} min • {schedule.area}</div></div>
                  <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                    <span className={`badge badge-${schedule.priority === 'High' ? 'error' : schedule.priority === 'Medium' ? 'warning' : 'info'}`}>{schedule.priority}</span>
                    <span className="badge badge-success">{schedule.status}</span>
                    <button onClick={() => handleDeleteSchedule(schedule.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 'var(--space-1)', color: 'var(--color-text-tertiary)', fontSize: 'var(--font-size-lg)', lineHeight: 1, opacity: 0.7 }} title="Delete schedule">×</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (<div className="empty-state"><div className="empty-state-icon">📅</div><div className="empty-state-title">No Scheduled Flights</div><div className="empty-state-description">Create a new flight schedule to get started</div></div>)}
        </div>

        {/* Flight History */}
        <div className="card card-elevated animate-fade-in-up stagger-3">
          <h3 className="section-title">Recent Flight History</h3>
          {flightHistory.length > 0 ? (
            <div className="list">
              {flightHistory.map((flight) => (
                <div key={flight.id} className="list-item">
                  <div style={{ flex: 1 }}><div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-2)' }}>Flight #{flight.id}</div><div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-2)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)' }}><div>📅 {formatDate(flight.date, 'date')}</div><div>⏱️ {flight.duration} min</div><div>📏 {flight.distance} km</div><div>📸 {flight.images} images</div></div></div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', alignItems: 'flex-end' }}><span className="badge badge-success">{flight.status}</span><div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)' }}>🔋 {flight.batteryStart}% → {flight.batteryEnd}%</div></div>
                </div>
              ))}
            </div>
          ) : (<div className="empty-state"><div className="empty-state-icon">📊</div><div className="empty-state-title">No Flight History</div></div>)}
        </div>

        {/* Telemetry Summary */}
        {telemetry && (
          <div className="card animate-fade-in-up stagger-4">
            <h3 className="section-title">Current Telemetry</h3>
            <div className="metrics">
              {telemetry.position && (<><div className="metric"><div className="metric-label">Latitude</div><div className="metric-value" style={{ fontSize: 'var(--font-size-lg)' }}>{telemetry.position.lat.toFixed(6)}</div></div><div className="metric"><div className="metric-label">Longitude</div><div className="metric-value" style={{ fontSize: 'var(--font-size-lg)' }}>{telemetry.position.lng.toFixed(6)}</div></div>{telemetry.position.altitude && (<div className="metric"><div className="metric-label">Altitude</div><div className="metric-value" style={{ fontSize: 'var(--font-size-lg)' }}>{telemetry.position.altitude.toFixed(1)}m</div></div>)}</>)}
              {telemetry.route && telemetry.route.length > 0 && (<div className="metric"><div className="metric-label">Route Points</div><div className="metric-value" style={{ fontSize: 'var(--font-size-lg)' }}>{telemetry.route.length}</div></div>)}
              {telemetry.geofence && telemetry.geofence.length > 0 && (<div className="metric"><div className="metric-label">Geofence Points</div><div className="metric-value" style={{ fontSize: 'var(--font-size-lg)' }}>{telemetry.geofence.length}</div></div>)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
