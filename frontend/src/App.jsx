import React, { useState } from 'react';
import { DashboardProvider, useDashboard } from './context/DashboardContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import KPICards from './components/KPICards';
import AlertsBanner from './components/AlertsBanner';
import SalesRevenueChart from './components/SalesRevenueChart';
import CategoryPieChart from './components/CategoryPieChart';
import TopProductsTable from './components/TopProductsTable';
import RecentOrdersFeed from './components/RecentOrdersFeed';
import ForecastChart from './components/ForecastChart';
import InventoryView from './components/InventoryView';
import OrdersView from './components/OrdersView';
import ReportsView from './components/ReportsView';
import AIAssistantModal from './components/AIAssistantModal';
import NotificationsDrawer from './components/NotificationsDrawer';

function DashboardContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAI, setShowAI] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar 
          onOpenAI={() => setShowAI(true)}
          onOpenNotifications={() => setShowNotifications(true)}
        />

        <main className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* Active Tab Router */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Critical Alerts Banner & Live Order Toasts */}
              <AlertsBanner onNavigateInventory={() => setActiveTab('inventory')} />

              {/* KPI Stat Cards */}
              <KPICards />

              {/* Primary Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <SalesRevenueChart />
                </div>
                <div>
                  <CategoryPieChart />
                </div>
              </div>

              {/* Secondary Tables & Activity Feed Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <TopProductsTable />
                </div>
                <div>
                  <RecentOrdersFeed onViewAllOrders={() => setActiveTab('orders')} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
                <h2 className="text-base font-bold text-white">In-Depth Sales & Revenue Analytics</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Correlate revenue trajectory, profit margins, and category volume performance over custom windows.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <SalesRevenueChart />
                </div>
                <div>
                  <CategoryPieChart />
                </div>
              </div>

              <TopProductsTable />
            </div>
          )}

          {activeTab === 'inventory' && (
            <InventoryView />
          )}

          {activeTab === 'orders' && (
            <OrdersView />
          )}

          {activeTab === 'ai-insights' && (
            <ForecastChart />
          )}

          {activeTab === 'reports' && (
            <ReportsView />
          )}
        </main>
      </div>

      {/* Floating AI Business Assistant Drawer */}
      <AIAssistantModal isOpen={showAI} onClose={() => setShowAI(false)} />

      {/* Notifications Drawer */}
      <NotificationsDrawer isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
    </div>
  );
}

export default function App() {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  );
}
