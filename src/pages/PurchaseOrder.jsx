import React, { useState, useEffect } from 'react';
import Table from '../components/Table';

function PurchaseOrder() {
  const [purchaseOrders, setPurchaseOrders] = useState([]);

  // Mock data (replace with API call)
  useEffect(() => {
    // Example: fetch('/api/purchase/purchase-order').then(res => res.json()).then(setPurchaseOrders);
    setPurchaseOrders([
      { poId: 1, poDate: '2025-03-01', instituteId: 101, remark: 'Office supplies' },
      { poId: 2, poDate: '2025-03-15', instituteId: 102, remark: 'Lab equipment' },
      { poId: 1, poDate: '2025-03-01', instituteId: 101, remark: 'Office supplies' },
      { poId: 2, poDate: '2025-03-15', instituteId: 102, remark: 'Lab equipment' },
      { poId: 1, poDate: '2025-03-01', instituteId: 101, remark: 'Office supplies' },
      { poId: 2, poDate: '2025-03-15', instituteId: 102, remark: 'Lab equipment' },
      { poId: 1, poDate: '2025-03-01', instituteId: 101, remark: 'Office supplies' },
      { poId: 2, poDate: '2025-03-15', instituteId: 102, remark: 'Lab equipment' },
      { poId: 1, poDate: '2025-03-01', instituteId: 101, remark: 'Office supplies' },
      { poId: 2, poDate: '2025-03-15', instituteId: 102, remark: 'Lab equipment' },
      { poId: 1, poDate: '2025-03-01', instituteId: 101, remark: 'Office supplies' },
      { poId: 2, poDate: '2025-03-15', instituteId: 102, remark: 'Lab equipment' },
    ]);
  }, []);

  const columns = [
    { key: 'poId', label: 'PO ID' },
    { key: 'poDate', label: 'Date' },
    { key: 'instituteId', label: 'Institute ID' },
    { key: 'remark', label: 'Remark' },
  ];

  const actions = [
    {
      label: 'Edit',
      onClick: (row) => alert(`Edit PO ${row.poId}`),
      className: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      label: 'Delete',
      onClick: (row) => alert(`Delete PO ${row.poId}`),
      className: 'bg-red-500 hover:bg-red-600',
    },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-brand-secondary mb-4">Purchase Orders</h2>
      <Table columns={columns} data={purchaseOrders} actions={actions} />
    </div>
  );
}

export default PurchaseOrder;