import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Table from '../components/Table';

function PurchaseOrderDetail() {
  const { poId } = useParams();
  const [purchaseOrder, setPurchaseOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [institutes, setInstitutes] = useState([]);
  const [financialYears, setFinancialYears] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [items, setItems] = useState([]);

  // Initialize with dummy data
  useEffect(() => {
    const purchaseOrders = [
      {
        poId: 1,
        poDate: '2025-03-26',
        poNo: 'PO001',
        instituteId: 2,
        financialYearId: 1,
        vendorId: 1,
        document: 'po_doc1.pdf',
        requestedBy: 'John Doe',
        remark: 'Demo test',
      },
      {
        poId: 2,
        poDate: '2025-04-01',
        poNo: 'PO002',
        instituteId: 1,
        financialYearId: 2,
        vendorId: 2,
        document: 'po_doc2.pdf',
        requestedBy: 'Jane Smith',
        remark: 'Bulk order',
      },
    ];
    const orderItemsData = [
      {
        id: 1,
        poId: 1,
        itemId: 1,
        quantity: 100,
        rate: 100.00,
        amount: 10000.00,
        discount: 0.00,
        totalAmount: 10000.00,
      },
      {
        id: 2,
        poId: 1,
        itemId: 2,
        quantity: 500,
        rate: 100.00,
        amount: 50000.00,
        discount: 0.00,
        totalAmount: 50000.00,
      },
      {
        id: 3,
        poId: 2,
        itemId: 3,
        quantity: 200,
        rate: 5.00,
        amount: 1000.00,
        discount: 50.00,
        totalAmount: 950.00,
      },
    ];
    const institutesData = [
      { instituteId: 1, instituteName: 'Central University', intituteCode: 'CU001' },
      { instituteId: 2, instituteName: 'State College', intituteCode: 'SC002' },
      { instituteId: 3, instituteName: 'Tech Institute', intituteCode: 'TI003' },
    ];
    const financialYearsData = [
      { financialYearId: 1, year: '2023-2024', startDate: '2023-04-01', endDate: '2024-03-31' },
      { financialYearId: 2, year: '2024-2025', startDate: '2024-04-01', endDate: '2025-03-31' },
      { financialYearId: 3, year: '2025-2026', startDate: '2025-04-01', endDate: '2026-03-31' },
    ];
    const vendorsData = [
      { vendorId: 1, name: 'John Doe', companyName: 'ABC Supplies', email: 'john@abcsupplies.com' },
      { vendorId: 2, name: 'Jane Smith', companyName: 'XYZ Traders', email: 'jane@xyztraders.com' },
    ];
    const itemsData = [
      { itemId: 1, itemName: 'Laptop', itemCategory: 1, unit: 1, remark: 'High-performance laptop' },
      { itemId: 2, itemName: 'Office Chair', itemCategory: 2, unit: 1, remark: 'Ergonomic chair' },
      { itemId: 3, itemName: 'Notebook', itemCategory: 3, unit: 1, remark: 'A4 size notebook' },
    ];

    const po = purchaseOrders.find((po) => po.poId === Number(poId));
    const filteredOrderItems = orderItemsData.filter((oi) => oi.poId === Number(poId));
    setPurchaseOrder(po);
    setOrderItems(filteredOrderItems);
    setInstitutes(institutesData);
    setFinancialYears(financialYearsData);
    setVendors(vendorsData);
    setItems(itemsData);
    console.log('Loaded PO:', po, 'OrderItems:', filteredOrderItems); // Debug
  }, [poId]);

  // OrderItem table columns
  const orderItemColumns = [
    { key: 'id', label: 'ID' },
    { key: 'itemId', label: 'Item', format: (value) => items.find((item) => item.itemId === value)?.itemName || 'N/A' },
    { key: 'quantity', label: 'Quantity' },
    { key: 'rate', label: 'Rate' },
    { key: 'amount', label: 'Amount' },
    { key: 'discount', label: 'Discount' },
    { key: 'totalAmount', label: 'Total Amount' },
  ];

  const handlePrint = () => {
    window.print();
  };

  if (!purchaseOrder) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl sm:text-2xl font-semibold text-brand-secondary mb-4">Purchase Order Details</h2>
        <p className="text-gray-600 text-sm sm:text-base">Purchase Order not found.</p>
        <Link
          to="/masters/purchase-order"
          className="mt-4 inline-block w-full sm:w-auto bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-red-600 text-sm no-print"
        >
          Back
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-md">
      <style media="print">{`
        .no-print { display: none; }
        .bg-white { box-shadow: none; border: 1px solid #000; }
        h2, h3 { color: #123458; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #000; padding: 8px; text-align: left; font-size: 12px; }
        .grid { display: block; }
        .grid > div { margin-bottom: 10px; }
        .text-sm { font-size: 12px; }
      `}</style>
      <h2 className="text-xl sm:text-2xl font-semibold text-brand-secondary mb-4">Purchase Order Details</h2>
      <div className="flex flex-col gap-6">
        <div>
          <h3 className="text-lg font-medium text-brand-secondary mb-2">Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">PO ID</label>
              <p className="mt-1 text-gray-900 text-sm">{purchaseOrder.poId}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">PO Date</label>
              <p className="mt-1 text-gray-900 text-sm">{new Date(purchaseOrder.poDate).toLocaleDateString()}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">PO Number</label>
              <p className="mt-1 text-gray-900 text-sm">{purchaseOrder.poNo}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Institute</label>
              <p className="mt-1 text-gray-900 text-sm">
                {institutes.find((inst) => inst.instituteId === purchaseOrder.instituteId)?.instituteName || 'N/A'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Financial Year</label>
              <p className="mt-1 text-gray-900 text-sm">
                {financialYears.find((fy) => fy.financialYearId === purchaseOrder.financialYearId)?.year || 'N/A'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Vendor</label>
              <p className="mt-1 text-gray-900 text-sm">
                {vendors.find((v) => v.vendorId === purchaseOrder.vendorId)?.name || 'N/A'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Document</label>
              <p className="mt-1 text-gray-900 text-sm">{purchaseOrder.document || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Requested By</label>
              <p className="mt-1 text-gray-900 text-sm">{purchaseOrder.requestedBy}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Remark</label>
              <p className="mt-1 text-gray-900 text-sm">{purchaseOrder.remark || 'N/A'}</p>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <h3 className="text-lg font-medium text-brand-secondary mb-2">Order Items</h3>
          <Table columns={orderItemColumns} data={orderItems} actions={[]} className="text-sm" />
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 no-print">
          <Link
            to="/masters/purchase-order"
            className="w-full sm:w-auto bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-red-600 text-sm"
          >
            Back
          </Link>
          <button
            onClick={handlePrint}
            className="w-full sm:w-auto bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-red-600 text-sm"
          >
            Print
          </button>
        </div>
      </div>
    </div>
  );
}

export default PurchaseOrderDetail;