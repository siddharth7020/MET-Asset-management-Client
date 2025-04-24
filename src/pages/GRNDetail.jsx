import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Table from '../components/Table';

function GRNDetail() {
  const { id } = useParams();
  const [grn, setGrn] = useState(null);
  const [grnItems, setGrnItems] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [orderItems, setOrderItems] = useState([]);

  // Initialize dummy data
  useEffect(() => {
    const grnsData = [
      {
        id: 1,
        poId: 2,
        grnNo: 'GRN0010',
        grnDate: '2025-04-16',
        challanNo: 'CH0003',
        challanDate: '2025-04-16',
        document: 'grn_doc.pdf',
        remark: 'error testing grn',
        createdAt: '2025-04-24T06:58:36.038Z',
        updatedAt: '2025-04-24T06:58:36.038Z',
      },
    ];
    const grnItemsData = [
      {
        id: 1,
        grnId: 1,
        orderItemId: 3,
        receivedQuantity: 50,
        rejectedQuantity: 50,
        createdAt: '2025-04-24T06:58:36.061Z',
        updatedAt: '2025-04-24T06:58:36.061Z',
      },
      {
        id: 2,
        grnId: 1,
        orderItemId: 4,
        receivedQuantity: 100,
        rejectedQuantity: 400,
        createdAt: '2025-04-24T06:58:36.061Z',
        updatedAt: '2025-04-24T06:58:36.061Z',
      },
    ];
    const purchaseOrdersData = [
      { poId: 1, poNo: 'PO001' },
      { poId: 2, poNo: 'PO002' },
    ];
    const orderItemsData = [
      { id: 3, poId: 2, itemId: 3, itemName: 'Notebook' },
      { id: 4, poId: 2, itemId: 2, itemName: 'Office Chair' },
    ];

    const selectedGrn = grnsData.find((g) => g.id === Number(id));
    const filteredGrnItems = grnItemsData.filter((gi) => gi.grnId === Number(id));
    setGrn(selectedGrn);
    setGrnItems(filteredGrnItems);
    setPurchaseOrders(purchaseOrdersData);
    setOrderItems(orderItemsData);
    console.log('Loaded GRN:', selectedGrn, 'GRNItems:', filteredGrnItems); // Debug
  }, [id]);

  // GRNItem table columns
  const grnItemColumns = [
    { key: 'id', label: 'ID' },
    { key: 'orderItemId', label: 'Item', format: (value) => orderItems.find((oi) => oi.id === value)?.itemName || 'N/A' },
    { key: 'receivedQuantity', label: 'Received Quantity' },
    { key: 'rejectedQuantity', label: 'Rejected Quantity' },
  ];

  const handlePrint = () => {
    window.print();
  };

  if (!grn) {
    return (
      <div className="min-h-screen max-w-7xl mx-auto p-4 sm:p-6 ml-0 sm:ml-16 lg:ml-64 bg-white rounded-lg shadow-md">
        <h2 className="text-lg sm:text-xl font-semibold text-brand-secondary mb-4">GRN Details</h2>
        <p className="text-gray-600 text-xs sm:text-sm">GRN not found.</p>
        <Link
          to="/masters/grn"
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
      <h2 className="text-lg sm:text-xl font-semibold text-brand-secondary mb-4">GRN Details</h2>
      <div className="flex flex-col gap-4 sm:gap-6">
        <div>
          <h3 className="text-base sm:text-lg font-medium text-brand-secondary mb-2">Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700">GRN ID</label>
              <p className="mt-1 text-gray-900 text-xs sm:text-sm">{grn.id}</p>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700">PO Number</label>
              <p className="mt-1 text-gray-900 text-xs sm:text-sm">
                {purchaseOrders.find((po) => po.poId === grn.poId)?.poNo || 'N/A'}
              </p>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700">GRN Number</label>
              <p className="mt-1 text-gray-900 text-xs sm:text-sm">{grn.grnNo}</p>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700">GRN Date</label>
              <p className="mt-1 text-gray-900 text-xs sm:text-sm">{new Date(grn.grnDate).toLocaleDateString()}</p>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700">Challan Number</label>
              <p className="mt-1 text-gray-900 text-xs sm:text-sm">{grn.challanNo}</p>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700">Challan Date</label>
              <p className="mt-1 text-gray-900 text-xs sm:text-sm">{new Date(grn.challanDate).toLocaleDateString()}</p>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700">Document</label>
              <p className="mt-1 text-gray-900 text-xs sm:text-sm">{grn.document || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700">Remark</label>
              <p className="mt-1 text-gray-900 text-xs sm:text-sm">{grn.remark || 'N/A'}</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-base sm:text-lg font-medium text-brand-secondary mb-2">GRN Items</h3>
          <div className="sm:hidden space-y-4">
            {grnItems.map((gi) => (
              <div key={gi.id} className="p-4 border rounded-md bg-white card">
                <p className="text-xs"><strong>ID:</strong> {gi.id}</p>
                <p className="text-xs"><strong>Item:</strong> {orderItems.find((oi) => oi.id === gi.orderItemId)?.itemName || 'N/A'}</p>
                <p className="text-xs"><strong>Received Quantity:</strong> {gi.receivedQuantity}</p>
                <p className="text-xs"><strong>Rejected Quantity:</strong> {gi.rejectedQuantity}</p>
              </div>
            ))}
          </div>
          <div className="hidden sm:block overflow-x-auto">
            <Table columns={grnItemColumns} data={grnItems} actions={[]} className="text-sm" />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 no-print">
          <Link
            to="/masters/grn"
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

export default GRNDetail;