/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider } from './context/AuthContext.js';
import { api } from './services/api.js';
import {
  Product,
  RawMaterial,
  Supplier,
  Customer,
  Workcenter,
  SalesOrder,
  ProductionOrder,
  KpiSummary,
  ViabilityReport
} from './types/index.js';

import { Layout } from './components/Layout.js';
import { DashboardView } from './components/DashboardView.js';
import { ProductionOrdersView } from './components/ProductionOrdersView.js';
import { ViabilityView } from './components/ViabilityView.js';
import { SalesOrdersView } from './components/SalesOrdersView.js';
import { ProductsView } from './components/ProductsView.js';
import { RawMaterialsView } from './components/RawMaterialsView.js';
import { CapacityView } from './components/CapacityView.js';
import { SuppliersView } from './components/SuppliersView.js';
import { CustomersView } from './components/CustomersView.js';
import { ReportsView } from './components/ReportsView.js';

import { PrintProductionOrderModal } from './components/PrintProductionOrderModal.js';
import { CreateProductionOrderModal } from './components/CreateProductionOrderModal.js';
import { CompleteProductionOrderModal } from './components/CompleteProductionOrderModal.js';
import { ProductModal } from './components/ProductModal.js';
import { RawMaterialModal } from './components/RawMaterialModal.js';
import { SalesOrderModal } from './components/SalesOrderModal.js';
import { WorkcenterModal } from './components/WorkcenterModal.js';
import { SupplierModal } from './components/SupplierModal.js';
import { CustomerModal } from './components/CustomerModal.js';
import { LoginModal } from './components/LoginModal.js';
import { SetupModal } from './components/SetupModal.js';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Entities state
  const [products, setProducts] = useState<Product[]>([]);
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [workcenters, setWorkcenters] = useState<Workcenter[]>([]);
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [productionOrders, setProductionOrders] = useState<ProductionOrder[]>([]);
  const [kpis, setKpis] = useState<KpiSummary | null>(null);
  const [viability, setViability] = useState<ViabilityReport | null>(null);

  // Modal states
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printTargetOrder, setPrintTargetOrder] = useState<ProductionOrder | null>(null);

  const [isCreateOpModalOpen, setIsCreateOpModalOpen] = useState(false);
  const [createOpPreselectedOrder, setCreateOpPreselectedOrder] = useState<SalesOrder | undefined>(undefined);
  const [createOpPreselectedProduct, setCreateOpPreselectedProduct] = useState<Product | undefined>(undefined);

  const [isCompleteOpModalOpen, setIsCompleteOpModalOpen] = useState(false);
  const [completeTargetOrder, setCompleteTargetOrder] = useState<ProductionOrder | null>(null);

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [isRawMaterialModalOpen, setIsRawMaterialModalOpen] = useState(false);
  const [editingRawMaterial, setEditingRawMaterial] = useState<RawMaterial | null>(null);

  const [isSalesOrderModalOpen, setIsSalesOrderModalOpen] = useState(false);
  const [editingSalesOrder, setEditingSalesOrder] = useState<SalesOrder | null>(null);

  const [isWorkcenterModalOpen, setIsWorkcenterModalOpen] = useState(false);
  const [editingWorkcenter, setEditingWorkcenter] = useState<Workcenter | null>(null);

  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);

  const refreshAllData = useCallback(async () => {
    try {
      const [
        prodsRes,
        matsRes,
        supsRes,
        custsRes,
        wcsRes,
        ordersRes,
        opsRes,
        kpisRes,
        viabilityRes
      ] = await Promise.all([
        api.getProducts(),
        api.getRawMaterials(),
        api.getSuppliers(),
        api.getCustomers(),
        api.getWorkcenters(),
        api.getOrders(),
        api.getProductionOrders(),
        api.getKpiSummary(),
        api.getViabilityReport()
      ]);

      setProducts(prodsRes);
      setRawMaterials(matsRes);
      setSuppliers(supsRes);
      setCustomers(custsRes);
      setWorkcenters(wcsRes);
      setSalesOrders(ordersRes);
      setProductionOrders(opsRes);
      setKpis(kpisRes);
      setViability(viabilityRes);
    } catch (err) {
      console.error('Erro ao sincronizar dados da fábrica:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // Handlers
  const handleOpenPrintOp = (order: ProductionOrder) => {
    setPrintTargetOrder(order);
    setIsPrintModalOpen(true);
  };

  const handleOpenCompleteOp = (order: ProductionOrder) => {
    setCompleteTargetOrder(order);
    setIsCompleteOpModalOpen(true);
  };

  const handleOpenCreateOp = (preOrder?: SalesOrder, preProd?: Product) => {
    setCreateOpPreselectedOrder(preOrder);
    setCreateOpPreselectedProduct(preProd);
    setIsCreateOpModalOpen(true);
  };

  return (
    <AuthProvider>
      <Layout
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onOpenSetup={() => setIsSetupModalOpen(true)}
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500 space-y-3">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="font-semibold text-xs">Conectando ao banco de dados da fábrica...</p>
          </div>
        ) : (
          <>
            {currentTab === 'dashboard' && (
              <DashboardView
                kpis={kpis}
                viability={viability}
                productionOrders={productionOrders}
                rawMaterials={rawMaterials}
                salesOrders={salesOrders}
                onNavigate={setCurrentTab}
                onOpenCreateOp={() => handleOpenCreateOp()}
                onPrintOp={handleOpenPrintOp}
                onCompleteOp={handleOpenCompleteOp}
              />
            )}

            {currentTab === 'ordens' && (
              <ProductionOrdersView
                orders={productionOrders}
                products={products}
                onOpenCreate={() => handleOpenCreateOp()}
                onOpenPrint={handleOpenPrintOp}
                onOpenComplete={handleOpenCompleteOp}
                onRefresh={refreshAllData}
              />
            )}

            {currentTab === 'viabilidade' && (
              <ViabilityView
                viability={viability}
                products={products}
                rawMaterials={rawMaterials}
                onOpenCreateOp={() => handleOpenCreateOp()}
              />
            )}

            {currentTab === 'pedidos' && (
              <SalesOrdersView
                orders={salesOrders}
                customers={customers}
                products={products}
                onOpenCreate={() => {
                  setEditingSalesOrder(null);
                  setIsSalesOrderModalOpen(true);
                }}
                onEdit={ord => {
                  setEditingSalesOrder(ord);
                  setIsSalesOrderModalOpen(true);
                }}
                onGenerateOp={ord => handleOpenCreateOp(ord)}
                onRefresh={refreshAllData}
              />
            )}

            {currentTab === 'produtos' && (
              <ProductsView
                products={products}
                rawMaterials={rawMaterials}
                onOpenCreate={() => {
                  setEditingProduct(null);
                  setIsProductModalOpen(true);
                }}
                onEdit={prod => {
                  setEditingProduct(prod);
                  setIsProductModalOpen(true);
                }}
                onEmitOp={prod => handleOpenCreateOp(undefined, prod)}
                onRefresh={refreshAllData}
              />
            )}

            {currentTab === 'materias-primas' && (
              <RawMaterialsView
                materials={rawMaterials}
                suppliers={suppliers}
                onOpenCreate={() => {
                  setEditingRawMaterial(null);
                  setIsRawMaterialModalOpen(true);
                }}
                onEdit={mat => {
                  setEditingRawMaterial(mat);
                  setIsRawMaterialModalOpen(true);
                }}
                onRefresh={refreshAllData}
              />
            )}

            {currentTab === 'capacidade' && (
              <CapacityView
                workcenters={workcenters}
                onOpenCreate={() => {
                  setEditingWorkcenter(null);
                  setIsWorkcenterModalOpen(true);
                }}
                onEdit={wc => {
                  setEditingWorkcenter(wc);
                  setIsWorkcenterModalOpen(true);
                }}
                onRefresh={refreshAllData}
              />
            )}

            {currentTab === 'fornecedores' && (
              <SuppliersView
                suppliers={suppliers}
                onOpenCreate={() => {
                  setEditingSupplier(null);
                  setIsSupplierModalOpen(true);
                }}
                onEdit={sup => {
                  setEditingSupplier(sup);
                  setIsSupplierModalOpen(true);
                }}
                onRefresh={refreshAllData}
              />
            )}

            {currentTab === 'clientes' && (
              <CustomersView
                customers={customers}
                onOpenCreate={() => {
                  setEditingCustomer(null);
                  setIsCustomerModalOpen(true);
                }}
                onEdit={cust => {
                  setEditingCustomer(cust);
                  setIsCustomerModalOpen(true);
                }}
                onRefresh={refreshAllData}
              />
            )}

            {currentTab === 'relatorios' && (
              <ReportsView
                orders={productionOrders}
                salesOrders={salesOrders}
                viability={viability}
              />
            )}
          </>
        )}

        {/* --- Modals --- */}
        {isPrintModalOpen && printTargetOrder && (
          <PrintProductionOrderModal
            order={printTargetOrder}
            product={products.find(p => p.id === printTargetOrder.productId)}
            company={{
              name: 'Metalúrgica & Manufatura Progresso Ltda.',
              cnpj: '14.285.932/0001-44',
              address: 'Av. das Indústrias, 1250 - Joinville - SC',
              phone: '(47) 3456-7890',
              email: 'pcp@manufacprogresso.com.br'
            }}
            onClose={() => {
              setIsPrintModalOpen(false);
              setPrintTargetOrder(null);
            }}
          />
        )}

        {isCreateOpModalOpen && (
          <CreateProductionOrderModal
            products={products}
            salesOrders={salesOrders}
            workcenters={workcenters}
            preselectedSalesOrder={createOpPreselectedOrder}
            preselectedProduct={createOpPreselectedProduct}
            onClose={() => {
              setIsCreateOpModalOpen(false);
              setCreateOpPreselectedOrder(undefined);
              setCreateOpPreselectedProduct(undefined);
            }}
            onSuccess={() => {
              setIsCreateOpModalOpen(false);
              setCreateOpPreselectedOrder(undefined);
              setCreateOpPreselectedProduct(undefined);
              refreshAllData();
            }}
          />
        )}

        {isCompleteOpModalOpen && completeTargetOrder && (
          <CompleteProductionOrderModal
            order={completeTargetOrder}
            onClose={() => {
              setIsCompleteOpModalOpen(false);
              setCompleteTargetOrder(null);
            }}
            onSuccess={() => {
              setIsCompleteOpModalOpen(false);
              setCompleteTargetOrder(null);
              refreshAllData();
            }}
          />
        )}

        {isProductModalOpen && (
          <ProductModal
            product={editingProduct}
            rawMaterials={rawMaterials}
            onClose={() => {
              setIsProductModalOpen(false);
              setEditingProduct(null);
            }}
            onSuccess={() => {
              setIsProductModalOpen(false);
              setEditingProduct(null);
              refreshAllData();
            }}
          />
        )}

        {isRawMaterialModalOpen && (
          <RawMaterialModal
            material={editingRawMaterial}
            suppliers={suppliers}
            onClose={() => {
              setIsRawMaterialModalOpen(false);
              setEditingRawMaterial(null);
            }}
            onSuccess={() => {
              setIsRawMaterialModalOpen(false);
              setEditingRawMaterial(null);
              refreshAllData();
            }}
          />
        )}

        {isSalesOrderModalOpen && (
          <SalesOrderModal
            order={editingSalesOrder}
            customers={customers}
            products={products}
            onClose={() => {
              setIsSalesOrderModalOpen(false);
              setEditingSalesOrder(null);
            }}
            onSuccess={() => {
              setIsSalesOrderModalOpen(false);
              setEditingSalesOrder(null);
              refreshAllData();
            }}
          />
        )}

        {isWorkcenterModalOpen && (
          <WorkcenterModal
            workcenter={editingWorkcenter}
            onClose={() => {
              setIsWorkcenterModalOpen(false);
              setEditingWorkcenter(null);
            }}
            onSuccess={() => {
              setIsWorkcenterModalOpen(false);
              setEditingWorkcenter(null);
              refreshAllData();
            }}
          />
        )}

        {isSupplierModalOpen && (
          <SupplierModal
            supplier={editingSupplier}
            onClose={() => {
              setIsSupplierModalOpen(false);
              setEditingSupplier(null);
            }}
            onSuccess={() => {
              setIsSupplierModalOpen(false);
              setEditingSupplier(null);
              refreshAllData();
            }}
          />
        )}

        {isCustomerModalOpen && (
          <CustomerModal
            customer={editingCustomer}
            onClose={() => {
              setIsCustomerModalOpen(false);
              setEditingCustomer(null);
            }}
            onSuccess={() => {
              setIsCustomerModalOpen(false);
              setEditingCustomer(null);
              refreshAllData();
            }}
          />
        )}

        {isLoginModalOpen && (
          <LoginModal onClose={() => setIsLoginModalOpen(false)} />
        )}

        {isSetupModalOpen && (
          <SetupModal
            onClose={() => setIsSetupModalOpen(false)}
            onDataReset={refreshAllData}
          />
        )}
      </Layout>
    </AuthProvider>
  );
}
