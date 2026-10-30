import axios from 'axios';

const API_BASE = '/api';

const client = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  // Analytics
  getKPIs: (range = '30d') => client.get(`/analytics/kpis?date_range=${range}`).then(r => r.data),
  getSalesTrend: (range = '30d') => client.get(`/analytics/sales-trend?date_range=${range}`).then(r => r.data),
  getCategoryPerformance: (range = '30d') => client.get(`/analytics/category-performance?date_range=${range}`).then(r => r.data),
  getTopProducts: (limit = 5) => client.get(`/analytics/top-products?limit=${limit}`).then(r => r.data),

  // Orders
  getOrders: (limit = 20, offset = 0, status = null) => {
    let url = `/orders?limit=${limit}&offset=${offset}`;
    if (status) url += `&status=${status}`;
    return client.get(url).then(r => r.data);
  },
  createOrder: (data) => client.post('/orders', data).then(r => r.data),

  // Products & Inventory
  getProducts: (category = null, lowStockOnly = false) => {
    let url = `/products?low_stock_only=${lowStockOnly}`;
    if (category) url += `&category=${category}`;
    return client.get(url).then(r => r.data);
  },
  restockProduct: (id, quantity) => client.put(`/products/${id}/restock?quantity=${quantity}`).then(r => r.data),

  // AI & ML
  getSalesForecast: (days = 14) => client.get(`/predictions/sales-forecast?days=${days}`).then(r => r.data),
  getAnomalies: () => client.get('/predictions/anomalies').then(r => r.data),
  askAssistant: (message) => client.post('/assistant/chat', { message }).then(r => r.data),

  // Notifications
  getNotifications: () => client.get('/notifications').then(r => r.data),
  markAllNotificationsRead: () => client.put('/notifications/read-all').then(r => r.data),

  // Simulator
  triggerSimulatorOrder: () => client.post('/simulator/trigger').then(r => r.data),
  toggleSimulator: () => client.post('/simulator/toggle').then(r => r.data),
  getSimulatorStatus: () => client.get('/simulator/status').then(r => r.data),

  // Reports
  getReportSummary: (start = null, end = null) => {
    let url = '/reports/summary';
    const params = [];
    if (start) params.push(`start_date=${start}`);
    if (end) params.push(`end_date=${end}`);
    if (params.length) url += `?${params.join('&')}`;
    return client.get(url).then(r => r.data);
  },
  getExportCSVUrl: (days = 30) => `${API_BASE}/reports/export/csv?days=${days}`,
};

export function createWebSocketConnection(onMessage, onStatusChange) {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}/ws/live`;
  
  let ws = null;
  let reconnectTimer = null;

  function connect() {
    try {
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        if (onStatusChange) onStatusChange(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (onMessage) onMessage(data);
        } catch (e) {
          console.error("Failed to parse WS payload:", e);
        }
      };

      ws.onerror = (err) => {
        if (onStatusChange) onStatusChange(false);
      };

      ws.onclose = () => {
        if (onStatusChange) onStatusChange(false);
        // Auto-reconnect after 3 seconds
        clearTimeout(reconnectTimer);
        reconnectTimer = setTimeout(connect, 3000);
      };
    } catch (e) {
      if (onStatusChange) onStatusChange(false);
      reconnectTimer = setTimeout(connect, 3000);
    }
  }

  connect();

  return {
    send: (msg) => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(typeof msg === 'string' ? msg : JSON.stringify(msg));
      }
    },
    close: () => {
      clearTimeout(reconnectTimer);
      if (ws) ws.close();
    }
  };
}

