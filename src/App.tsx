import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard/Dashboard';
import { PropertyList } from './components/Property/PropertyList';
import { PropertyFormModal } from './components/Property/PropertyFormModal';
import { PropertyDetailModal } from './components/Property/PropertyDetailModal';
import { SupersedeModal } from './components/Property/SupersedeModal';
import { PropertyLineageGraph } from './components/Property/PropertyLineageGraph';
import { PrintableTaxDeclaration } from './components/Property/PrintableTaxDeclaration';
import { UserManagement } from './components/UserManagement/UserManagement';
import { SettingsView } from './components/Settings/SettingsView';
import { AuditLogsView } from './components/Audit/AuditLogsView';
import { LoginModal } from './components/Common/LoginModal';
import { ToastContainer } from './components/Common/ToastContainer';
import { TaxDeclaration } from './types';

const MainLayout: React.FC = () => {
  const { activeTab, selectedProperty, setSelectedProperty } = useApp();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isPropertyFormOpen, setIsPropertyFormOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<TaxDeclaration | null>(null);
  const [supersedingProperty, setSupersedingProperty] = useState<TaxDeclaration | null>(null);
  const [isPrintViewOpen, setIsPrintViewOpen] = useState(false);
  const [printingProperty, setPrintingProperty] = useState<TaxDeclaration | null>(null);

  // Handlers for modal actions
  const handleOpenNewProperty = () => {
    setEditingProperty(null);
    setIsPropertyFormOpen(true);
  };

  const handleOpenEditProperty = (property: TaxDeclaration) => {
    setEditingProperty(property);
    setIsPropertyFormOpen(true);
  };

  const handleOpenSupersede = (property: TaxDeclaration) => {
    setSupersedingProperty(property);
  };

  const handleOpenPrint = (property: TaxDeclaration) => {
    setPrintingProperty(property);
    setIsPrintViewOpen(true);
  };

  return (
    <div className="h-screen max-h-screen bg-slate-50 text-slate-800 flex font-sans selection:bg-sky-200 selection:text-sky-900 overflow-hidden">
      
      {/* Toast Notification Container */}
      <ToastContainer />

      {/* Navigation Sidebar (Full height on left) */}
      <Sidebar
        isOpenMobile={isSidebarOpen}
        onCloseMobile={() => setIsSidebarOpen(false)}
        onOpenNewPropertyModal={handleOpenNewProperty}
      />

      {/* Right Content Area: Header on top, main workspace below */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0 min-h-0">
        {/* Top App Bar Header */}
        <Header
          onOpenNewPropertyModal={handleOpenNewProperty}
          onOpenLoginModal={() => setIsLoginModalOpen(true)}
          onToggleMobileSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        {/* Dynamic Center Stage */}
        <main className="flex-1 px-3 sm:px-6 lg:px-8 py-4 sm:py-6 overflow-y-auto w-full min-h-0">
          {isPrintViewOpen && printingProperty ? (
            <PrintableTaxDeclaration
              property={printingProperty}
              onBack={() => setIsPrintViewOpen(false)}
            />
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <Dashboard
                  onOpenNewPropertyModal={handleOpenNewProperty}
                  onOpenSupersedeModal={handleOpenSupersede}
                  onOpenPrintView={handleOpenPrint}
                />
              )}

              {activeTab === 'properties' && (
                <PropertyList
                  onOpenNewPropertyModal={handleOpenNewProperty}
                  onOpenEditModal={handleOpenEditProperty}
                  onOpenSupersedeModal={handleOpenSupersede}
                  onOpenPrintView={handleOpenPrint}
                />
              )}

              {activeTab === 'lineage' && (
                <PropertyLineageGraph
                  onOpenNewPropertyModal={handleOpenNewProperty}
                  onOpenSupersedeModal={handleOpenSupersede}
                />
              )}

              {activeTab === 'users' && <UserManagement />}

              {activeTab === 'settings' && <SettingsView />}

              {activeTab === 'audit-logs' && <AuditLogsView />}
            </>
          )}
        </main>
      </div>

      {/* Modals */}
      <PropertyFormModal
        isOpen={isPropertyFormOpen}
        onClose={() => {
          setIsPropertyFormOpen(false);
          setEditingProperty(null);
        }}
        editingProperty={editingProperty}
      />

      <PropertyDetailModal
        property={selectedProperty}
        onClose={() => setSelectedProperty(null)}
        onOpenEditModal={(prop) => {
          setSelectedProperty(null);
          handleOpenEditProperty(prop);
        }}
        onOpenSupersedeModal={(prop) => {
          setSelectedProperty(null);
          handleOpenSupersede(prop);
        }}
        onOpenPrintView={(prop) => {
          setSelectedProperty(null);
          handleOpenPrint(prop);
        }}
      />

      <SupersedeModal
        property={supersedingProperty}
        isOpen={!!supersedingProperty}
        onClose={() => setSupersedingProperty(null)}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
