import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, createWebSocketConnection } from '../services/api';

const DashboardContext = createContext(null);

export function DashboardProvider({ children }) {
  const [dateRange, setDateRange] = useState('30d');
  const [kpis, setKpis] = useState(null);
  const [salesTrend, setSalesTrend] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [wsConnected, setWsConnected] = useState(false);
  const [simulatorActive, setSimulatorActive] = useState(false);
  const [liveToast, setLiveToast] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load all dashboard primary data
  const loadDashboardData = useCallback(async (range = dateRange) => {
    try {
      const [kpiRes, trendRes, catRes, topProdRes, ordersRes, anomalyRes, notifRes] = await Promise.all([
        api.getKPIs(range),
        api.getSalesTrend(range),
        api.getCategoryPerformance(range),
        api.getTopProducts(6),
        api.getOrders(10),
        api.getAnomalies(),
        api.getNotifications()
      ]);

      setKpis(kpiRes);
      setSalesTrend(trendRes);
      setCategoryData(catRes);
      setTopProducts(topProdRes);
      setRecentOrders(ordersRes);
      setAnomalies(anomalyRes);
      setNotifications(notifRes);
    } catch (err) {
      console.error("[Dashboard] Error loading data:", err);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  // Handle WebSocket message
  const handleWebSocketMessage = useCallback((msg) => {
    if (msg.type === 'NEW_ORDER') {
      const orderData = msg.data;

      // Show live toast banner
      setLiveToast({
        title: `⚡ Live Order: ${orderData.order_number}`,
        message: `${orderData.customer_name} placed an order of ₹${orderData.total_amount.toLocaleString()}`,
        alerts: orderData.alerts || [],
        timestamp: new Date().toLocaleTimeString()
      });

      // Clear toast after 6 seconds
      setTimeout(() => setLiveToast(null), 6000);

      // Instantly update KPIs & Recent Orders list without waiting for full reload
      setKpis(prev => {
        if (!prev) return prev;
        const newRev = prev.total_revenue + orderData.total_amount;
        const newProf = prev.total_profit + orderData.profit_amount;
        return {
          ...prev,
          total_revenue: Math.round(newRev * 100) / 100,
          total_orders: prev.total_orders + 1,
          total_profit: Math.round(newProf * 100) / 100,
          avg_order_value: Math.round((newRev / (prev.total_orders + 1)) * 100) / 100
        };
      });

      // Refresh orders list
      api.getOrders(10).then(orders => setRecentOrders(orders)).catch(console.error);

      // Refresh anomalies in case of low stock
      api.getAnomalies().then(anom => setAnomalies(anom)).catch(console.error);
    } else if (msg.type === 'STOCK_UPDATED') {
      // Refresh top products & inventory
      api.getTopProducts(6).then(prods => setTopProducts(prods)).catch(console.error);
      api.getAnomalies().then(anom => setAnomalies(anom)).catch(console.error);
    }
  }, []);

  // Initialize WebSocket connection
  useEffect(() => {
    const ws = createWebSocketConnection(
      handleWebSocketMessage,
      (status) => setWsConnected(status)
    );

    // Check simulator status
    api.getSimulatorStatus()
      .then(res => setSimulatorActive(res.simulator_active))
      .catch(() => {});

    return () => ws.close();
  }, [handleWebSocketMessage]);

  // Reload data when dateRange changes
  useEffect(() => {
    loadDashboardData(dateRange);
  }, [dateRange, loadDashboardData]);

  // Trigger simulated live order
  const triggerSimulation = async () => {
    try {
      const res = await api.triggerSimulatorOrder();
      return res;
    } catch (err) {
      console.error("Simulation failed:", err);
    }
  };

  // Toggle auto simulator
  const toggleAutoSimulator = async () => {
    try {
      const res = await api.toggleSimulator();
      setSimulatorActive(res.simulator_active);
      return res;
    } catch (err) {
      console.error("Toggle simulator failed:", err);
    }
  };

  return (
    <DashboardContext.Provider value={{
      dateRange,
      setDateRange,
      kpis,
      salesTrend,
      categoryData,
      topProducts,
      recentOrders,
      anomalies,
      notifications,
      wsConnected,
      simulatorActive,
      liveToast,
      setLiveToast,
      loading,
      refreshDashboard: loadDashboardData,
      triggerSimulation,
      toggleAutoSimulator
    }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used within DashboardProvider");
  return ctx;
}

