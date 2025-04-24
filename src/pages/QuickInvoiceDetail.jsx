import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Table from '../components/Table';

function QuickInvoiceDetail() {
  const { qInvoiceId } = useParams();
  const [quickInvoice, setQuickInvoice] = useState(null);
  const [quickInvoiceItems, setQuickInvoiceItems] = useState([]);
  const [quickGRNs, setQuickGRNs] = useState([]);
  const [items, setItems] = useState([]);

  // Initialize dummy data
  useEffect(() => {
    const quickInvoicesData = [
      {
        qInvoiceId: 1,
        qInvoiceNo: 'QINV-20250417-001',
        qInvoiceDate: '2025-04-17',
        qGRNIds: [1],
        totalAmount: 11800.00,
        remark: 'Quick Invoice for multiple test',
        createdAt: '2025-04-24T09:06:09.773Z',
        updatedAt: '2025-04-24T09:06:09.773Z',
      },
    ];
    const quickInvoiceItemsData = [
      {
        qInvoiceItemId: 1,
        qInvoiceId: 1,
        qGRNId: 1,
        qGRNItemid: 1,
        itemId: 1,
        quantity: 100,
        rate: 100.00,
        discount: 0.00,
        taxPercentage: 18.00,
        taxAmount: 1800.00,
        totalAmount: 11800.00,
        createdAt: '2025-04-24T09:06:09.780Z',
        updatedAt: '2025-04-24T09:06:09.780Z',
      },
    ];
    const quickGRNsData = [
      {
        qGRNId: 1,
        qGRNDate: '2025-04-17',
        qGRNNo: 'QGRN001',
        instituteId: 2,
        financialYearId: 1,
        vendorId: 1,
        document: 'po_doc.pdf',
        challanNo: 'CH001',
        challanDate: '2025-03-26',
        requestedBy: 'John Doe',
        remark: 'invoice 17-04',
        createdAt: '2025-04-24T07:42:42.587Z',
        updatedAt: '2025-04-24T07:42:42.587Z',
      },
    ];
    const itemsData = [
      { id: 1, name: 'Pen' },
      { id: 2, name: 'Notebook' },
    ];

    const selectedQuickInvoice = quickInvoicesData.find((inv) => inv.qInvoiceId === Number(qInvoiceId));
    const filteredQuickInvoiceItems = quickInvoiceItemsData.filter((qi) => qi.qInvoiceId === Number(qInvoiceId));
    setQuickInvoice(selectedQuickInvoice);
    setQuickInvoiceItems(filteredQuickInvoiceItems);
    setQuickGRNs(quickGRNsData);
    setItems(itemsData);
    console.log('Loaded QuickInvoice:', selectedQuickInvoice, 'QuickInvoiceItems:', filteredQuickInvoiceItems); // Debug
  }, [qInvoiceId]);

  // QuickInvoiceItem table columns
  const quickInvoiceItemColumns = [
    { key: 'qInvoiceItemId', label: 'ID' },
    { key: 'qGRNId', label: 'Quick GRN', format: (value) => quickGRNs.find((g) => g.qGRNId === value)?.qGRNNo || value },
    { key: 'qGRNItemid', label: 'GRN Item ID' },
    { key: 'itemId', label: 'Item', format: (value) => items.find((i) => i.id === value)?.name || 'N/A' },
    { key: 'quantity', label: 'Quantity' },
    { key: 'rate', label: 'Rate', format: (value) => `₹${parseFloat(value).toFixed(2)}` },
    { key: 'discount', label: 'Discount', format: (value) => `₹${parseFloat(value).toFixed(2)}` },
    { key: 'taxPercentage', label: 'Tax %', format: (value) => `${parseFloat(value).toFixed(2)}%` },
    { key: 'taxAmount', label: 'Tax Amount', format: (value) => `₹${parseFloat(value).toFixed(2)}` },
    { key: 'totalAmount', label: 'Total Amount', format: (value) => `₹${parseFloat(value).toFixed(2)}` },
  ];

  const handlePrint = () => {
    window.print();
  };

  if (!quickInvoice) {
    return (
      <div className="min-h-screen max-w-7xl mx-auto p-4 sm:p-6 ml-0 sm:ml-16 lg:ml-64 bg-white rounded-lg shadow-md">
        <h2 className="text-lg sm:text-xl font-semibold text-brand-secondary mb-4">Quick Invoice Details</h2>
        <p className="text-gray-600 text-xs sm:text-sm">Quick Invoice not found.</p>
        <Link
          to="/masters/quickinvoice"
          className="mt-4 block w-full sm:w-auto bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-red-600 text-xs sm:text-sm no-print"
        >
          Back
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-7xl mx-auto p-4 sm:p-6 ml-0 sm:ml-16 lg:ml-64 bg-white rounded-lg shadow-md">
      <style media="print">{`
        .no-print { display: none; }
        .bg-white { box-shadow: none; border: 1px solid #000; }
        h2, h3 { color: #123458; }
        .card { border: 1px solid #000; padding: 8px; margin-bottom: 8px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #000; padding: 8px; text-align: left; font-size: 12px; }
        .grid { display: block; }
        .grid > div { margin-bottom: 10px; }
        .text-xs { font-size: 12px; }
      `}</style>
      <h2 className="text-lg sm:text-xl font-semibold text-brand-secondary mb-4">Quick Invoice Details</h2>
      <div className="flex flex-col gap-4 sm:gap-6">
        <div>
          <h3 className="text-base sm:text-lg font-medium text-brand-secondary mb-2">Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700">Quick Invoice ID</label>
              <p className="mt-1 text-gray-900 text-xs sm:text-sm">{quickInvoice.qInvoiceId}</p>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700">Quick Invoice Number</label>
              <p className="mt-1 text-gray-900 text-xs sm:text-sm">{quickInvoice.qInvoiceNo}</p>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700">Quick Invoice Date</label>
              <p className="mt-1 text-gray-900 text-xs sm:text-sm">{new Date(quickInvoice.qInvoiceDate).toLocaleDateString()}</p>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700">Quick GRNs</label>
              <p className="mt-1 text-gray-900 text-xs sm:text-sm">
                {quickInvoice.qGRNIds.map((id) => quickGRNs.find((g) => g.qGRNId === id)?.qGRNNo || id).join(', ')}
              </p>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700">Total Amount</label>
              <p className="mt-1 text-gray-900 text-xs sm:text-sm">₹{parseFloat(quickInvoice.totalAmount).toFixed(2)}</p>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700">Remark</label>
              <p className="mt-1 text-gray-900 text-xs sm:text-sm">{quickInvoice.remark || 'N/A'}</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-base sm:text-lg font-medium text-brand-secondary mb-2">Quick Invoice Items</h3>
          <div className="sm:hidden space-y-4">
            {quickInvoiceItems.map((qi) => (
              <div key={qi.qInvoiceItemId} className="p-4 border rounded-md bg-white card">
                <p className="text-xs"><strong>ID:</strong> {qi.qInvoiceItemId}</p>
                <p className="text-xs"><strong>Quick GRN:</strong> {quickGRNs.find((g) => g.qGRNId === qi.qGRNId)?.qGRNNo || qi.qGRNId}</p>
                <p className="text-xs"><strong>GRN Item ID:</strong> {qi.qGRNItemid}</p>
                <p className="text-xs"><strong>Item:</strong> {items.find((i) => i.id === qi.itemId)?.name || 'N/A'}</p>
                <p className="text-xs"><strong>Quantity:</strong> {qi.quantity}</p>
                <p className="text-xs"><strong>Rate:</strong> ₹{parseFloat(qi.rate).toFixed(2)}</p>
                <p className="text-xs"><strong>Discount:</strong> ₹{parseFloat(qi.discount).toFixed(2)}</p>
                <p className="text-xs"><strong>Tax %:</strong> {parseFloat(qi.taxPercentage).toFixed(2)}%</p>
                <p className="text-xs"><strong>Tax Amount:</strong> ₹{parseFloat(qi.taxAmount).toFixed(2)}</p>
                <p className="text-xs"><strong>Total Amount:</strong> ₹{parseFloat(qi.totalAmount).toFixed(2)}</p>
              </div>
            ))}
          </div>
          <div className="hidden sm:block overflow-x-auto">
            <Table columns={quickInvoiceItemColumns} data={quickInvoiceItems} actions={[]} className="text-sm" />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 no-print">
          <Link
            to="/masters/quickinvoice"
            className="w-full sm:w-auto bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-red-600 text-xs sm:text-sm"
          >
            Back
          </Link>
          <button
            onClick={handlePrint}
            className="w-full sm:w-auto bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-red-600 text-xs sm:text-sm"
          >
            Print
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuickInvoiceDetail;