import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Select from 'react-select';
import Table from '../components/Table';
import FormInput from '../components/FormInput';

function QuickInvoice() {
  const [quickInvoices, setQuickInvoices] = useState([]);
  const [quickInvoiceItems, setQuickInvoiceItems] = useState([]);
  const [quickGRNs, setQuickGRNs] = useState([]);
  const [quickGRNItems, setQuickGRNItems] = useState([]);
  const [items, setItems] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    qInvoiceNo: '',
    qInvoiceDate: '',
    qGRNIds: [],
    remark: '',
    taxDetails: {}, // { qGRNItemid: { taxPercentage: number } }
  });
  const [errors, setErrors] = useState({});
  const [editId, setEditId] = useState(null);
  const [expandedQInvoiceId, setExpandedQInvoiceId] = useState(null);

  // Initialize dummy data
  useEffect(() => {
    const quickInvoicesData = [
      {
        qInvoiceId: 1,
        qInvoiceNo: 'QINV-20250417-001',
        qInvoiceDate: '2025-04-17',
        qGRNIds: [1, 2],
        totalAmount: 26550.00,
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
      {
        qInvoiceItemId: 2,
        qInvoiceId: 1,
        qGRNId: 1,
        qGRNItemid: 2,
        itemId: 3,
        quantity: 50,
        rate: 50.00,
        discount: 0.00,
        taxPercentage: 18.00,
        taxAmount: 450.00,
        totalAmount: 2950.00,
        createdAt: '2025-04-24T09:06:09.780Z',
        updatedAt: '2025-04-24T09:06:09.780Z',
      },
      {
        qInvoiceItemId: 3,
        qInvoiceId: 1,
        qGRNId: 2,
        qGRNItemid: 3,
        itemId: 2,
        quantity: 50,
        rate: 200.00,
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
      {
        qGRNId: 2,
        qGRNDate: '2025-04-18',
        qGRNNo: 'QGRN002',
        instituteId: 2,
        financialYearId: 1,
        vendorId: 1,
        document: 'po_doc2.pdf',
        challanNo: 'CH002',
        challanDate: '2025-03-27',
        requestedBy: 'Jane Doe',
        remark: 'invoice 18-04',
        createdAt: '2025-04-24T07:43:42.587Z',
        updatedAt: '2025-04-24T07:43:42.587Z',
      },
    ];
    const quickGRNItemsData = [
      {
        qGRNItemid: 1,
        qGRNId: 1,
        itemId: 1,
        quantity: 100,
        rate: 100.00,
        amount: 10000.00,
        discount: 0.00,
        totalAmount: 10000.00,
        receivedQuantity: 100,
        rejectedQuantity: 0,
        createdAt: '2025-04-24T07:42:42.593Z',
        updatedAt: '2025-04-24T07:42:42.593Z',
      },
      {
        qGRNItemid: 2,
        qGRNId: 1,
        itemId: 3,
        quantity: 50,
        rate: 50.00,
        amount: 2500.00,
        discount: 0.00,
        totalAmount: 2500.00,
        receivedQuantity: 50,
        rejectedQuantity: 0,
        createdAt: '2025-04-24T07:42:42.593Z',
        updatedAt: '2025-04-24T07:42:42.593Z',
      },
      {
        qGRNItemid: 3,
        qGRNId: 2,
        itemId: 2,
        quantity: 50,
        rate: 200.00,
        amount: 10000.00,
        discount: 0.00,
        totalAmount: 10000.00,
        receivedQuantity: 50,
        rejectedQuantity: 0,
        createdAt: '2025-04-24T07:43:42.593Z',
        updatedAt: '2025-04-24T07:43:42.593Z',
      },
    ];
    const itemsData = [
      { id: 1, name: 'Pen' },
      { id: 2, name: 'Notebook' },
      { id: 3, name: 'Pencil' },
    ];

    setQuickInvoices(quickInvoicesData);
    setQuickInvoiceItems(quickInvoiceItemsData);
    setQuickGRNs(quickGRNsData);
    setQuickGRNItems(quickGRNItemsData);
    setItems(itemsData);
    console.log('QuickInvoices:', quickInvoicesData, 'QuickInvoiceItems:', quickInvoiceItemsData);
  }, []);

  // Generate qInvoiceNo
  const generateInvoiceNo = (date) => {
    const dateStr = date.replace(/-/g, '');
    const count = quickInvoices.filter((inv) => inv.qInvoiceDate.split('T')[0] === date).length + 1;
    return `QINV-${dateStr}-${String(count).padStart(3, '0')}`;
  };

  // Calculate item amounts
  const calculateItemAmounts = (item, taxPercentage) => {
    const quantity = Number(item.quantity);
    const rate = Number(item.rate);
    const discount = Number(item.discount) || 0;
    const baseAmount = quantity * rate - discount;
    const taxAmount = baseAmount * (Number(taxPercentage || 0) / 100);
    const totalAmount = baseAmount + taxAmount;
    return {
      baseAmount: baseAmount.toFixed(2),
      taxAmount: taxAmount.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
    };
  };

  // Calculate final total amount
  const calculateFinalTotalAmount = (qGRNIds, taxDetails) => {
    let totalInvoiceAmount = 0;
    qGRNIds.forEach((qGRNId) => {
      const grnItems = quickGRNItems.filter((gi) => gi.qGRNId === qGRNId);
      grnItems.forEach((gi) => {
        const { totalAmount } = calculateItemAmounts(gi, taxDetails[gi.qGRNItemid]?.taxPercentage);
        totalInvoiceAmount += Number(totalAmount);
      });
    });
    return totalInvoiceAmount.toFixed(2);
  };

  // Table columns for QuickInvoice
  const quickInvoiceColumns = [
    { key: 'qInvoiceId', label: 'ID' },
    { key: 'qInvoiceNo', label: 'Invoice No' },
    { key: 'qInvoiceDate', label: 'Invoice Date', format: (value) => new Date(value).toLocaleDateString() },
    { key: 'qGRNIds', label: 'Quick GRNs', format: (value) => value.map((id) => quickGRNs.find((g) => g.qGRNId === id)?.qGRNNo || id).join(', ') },
    { key: 'totalAmount', label: 'Total Amount', format: (value) => `₹${parseFloat(value).toFixed(2)}` },
    { key: 'remark', label: 'Remark', className: 'hidden sm:table-cell' },
  ];

  // Table columns for QuickInvoiceItem
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

  // Table actions
  const actions = [
    {
      label: 'Edit',
      onClick: (row) => {
        setIsEditMode(true);
        setEditId(row.qInvoiceId);
        const taxDetails = {};
        quickInvoiceItems
          .filter((qi) => qi.qInvoiceId === row.qInvoiceId)
          .forEach((qi) => {
            taxDetails[qi.qGRNItemid] = { taxPercentage: qi.taxPercentage };
          });
        setFormData({
          qInvoiceNo: row.qInvoiceNo,
          qInvoiceDate: row.qInvoiceDate.split('T')[0],
          qGRNIds: row.qGRNIds,
          remark: row.remark,
          taxDetails,
        });
        setIsFormVisible(true);
      },
      className: 'bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs sm:text-sm',
    },
    {
      label: 'Delete',
      onClick: (row) => {
        if (window.confirm(`Delete Quick Invoice ${row.qInvoiceNo}?`)) {
          setQuickInvoices((prev) => prev.filter((inv) => inv.qInvoiceId !== row.qInvoiceId));
          setQuickInvoiceItems((prev) => prev.filter((qi) => qi.qInvoiceId !== row.qInvoiceId));
          resetForm();
        }
      },
      className: 'bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs sm:text-sm',
    },
    {
      label: 'View Items',
      onClick: (row) => {
        console.log('Toggling items for qInvoiceId:', row.qInvoiceId);
        setExpandedQInvoiceId(expandedQInvoiceId === row.qInvoiceId ? null : row.qInvoiceId);
      },
      className: 'bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs sm:text-sm',
    },
    {
      label: 'View Details',
      className: 'bg-purple-500 hover:bg-purple-600 text-white px-2 py-1 rounded text-xs sm:text-sm',
      render: (row) => (
        <Link
          to={`/masters/quickinvoice/${row.qInvoiceId}`}
          className="bg-purple-500 hover:bg-purple-600 text-white px-2 py-1 rounded text-xs sm:text-sm"
        >
          View Details
        </Link>
      ),
    },
  ];

  // Form handling
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    if (name === 'qInvoiceDate' && !isEditMode) {
      setFormData((prev) => ({ ...prev, qInvoiceNo: generateInvoiceNo(value) }));
    }
  };

  const handleGRNChange = (selectedOptions) => {
    const selected = selectedOptions ? selectedOptions.map((option) => Number(option.value)) : [];
    setFormData((prev) => {
      const newTaxDetails = { ...prev.taxDetails };
      const selectedGRNItems = quickGRNItems.filter((gi) => selected.includes(gi.qGRNId));
      Object.keys(newTaxDetails).forEach((key) => {
        if (!selectedGRNItems.some((gi) => gi.qGRNItemid === Number(key))) delete newTaxDetails[key];
      });
      selectedGRNItems.forEach((gi) => {
        if (!newTaxDetails[gi.qGRNItemid]) newTaxDetails[gi.qGRNItemid] = { taxPercentage: '' };
      });
      return { ...prev, qGRNIds: selected, taxDetails: newTaxDetails };
    });
    setErrors((prev) => ({ ...prev, qGRNIds: '' }));
  };

  const handleTaxChange = (qGRNItemid, e) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      taxDetails: {
        ...prev.taxDetails,
        [qGRNItemid]: { taxPercentage: value },
      },
    }));
    setErrors((prev) => ({ ...prev, [`taxDetails[${qGRNItemid}].taxPercentage`]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.qInvoiceDate) newErrors.qInvoiceDate = 'Invoice date is required';
    if (!formData.qGRNIds || formData.qGRNIds.length === 0) newErrors.qGRNIds = 'At least one Quick GRN is required';
    if (!formData.qInvoiceNo) newErrors.qInvoiceNo = 'Invoice number is required';
    else if (
      quickInvoices.some((inv) => inv.qInvoiceNo === formData.qInvoiceNo && inv.qInvoiceId !== editId)
    ) {
      newErrors.qInvoiceNo = 'Invoice number must be unique';
    }

    const selectedGRNItems = quickGRNItems.filter((gi) => formData.qGRNIds.includes(gi.qGRNId));
    selectedGRNItems.forEach((gi) => {
      if (!formData.taxDetails[gi.qGRNItemid]?.taxPercentage || formData.taxDetails[gi.qGRNItemid].taxPercentage < 0) {
        newErrors[`taxDetails[${gi.qGRNItemid}].taxPercentage`] = 'Tax percentage must be non-negative';
      }
    });

    return newErrors;
  };

  const calculateInvoiceItems = (qGRNIds, taxDetails) => {
    const items = [];
    let totalInvoiceAmount = 0;

    qGRNIds.forEach((qGRNId) => {
      const grnItems = quickGRNItems.filter((gi) => gi.qGRNId === qGRNId);
      grnItems.forEach((gi) => {
        const taxPercentage = Number(taxDetails[gi.qGRNItemid]?.taxPercentage) || 0;
        const quantity = Number(gi.quantity);
        const rate = Number(gi.rate);
        const discount = Number(gi.discount) || 0;
        const baseAmount = quantity * rate - discount;
        const taxAmount = baseAmount * (taxPercentage / 100);
        const totalAmount = baseAmount + taxAmount;

        items.push({
          qGRNId,
          qGRNItemid: gi.qGRNItemid,
          itemId: gi.itemId,
          quantity,
          rate,
          discount,
          taxPercentage,
          taxAmount: taxAmount.toFixed(2),
          totalAmount: totalAmount.toFixed(2),
        });

        totalInvoiceAmount += totalAmount;
      });
    });

    return { items, totalInvoiceAmount };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const { items, totalInvoiceAmount } = calculateInvoiceItems(formData.qGRNIds, formData.taxDetails);

    if (isEditMode) {
      setQuickInvoices((prev) =>
        prev.map((inv) =>
          inv.qInvoiceId === editId
            ? {
                ...formData,
                qInvoiceId: editId,
                qGRNIds: formData.qGRNIds,
                totalAmount: totalInvoiceAmount.toFixed(2),
              }
            : inv
        )
      );
      const updatedItems = items.map((item, index) => ({
        qInvoiceItemId:
          quickInvoiceItems.find((qi) => qi.qInvoiceId === editId && qi.qGRNItemid === item.qGRNItemid)?.qInvoiceItemId ||
          Math.max(...quickInvoiceItems.map((i) => i.qInvoiceItemId), 0) + index + 1,
        qInvoiceId: editId,
        ...item,
      }));
      setQuickInvoiceItems((prev) => [
        ...prev.filter((qi) => qi.qInvoiceId !== editId),
        ...updatedItems,
      ]);
    } else {
      const newQInvoiceId = Math.max(...quickInvoices.map((inv) => inv.qInvoiceId), 0) + 1;
      setQuickInvoices((prev) => [
        ...prev,
        {
          ...formData,
          qInvoiceId: newQInvoiceId,
          qGRNIds: formData.qGRNIds,
          totalAmount: totalInvoiceAmount.toFixed(2),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);
      const newItems = items.map((item, index) => ({
        qInvoiceItemId: Math.max(...quickInvoiceItems.map((i) => i.qInvoiceItemId), 0) + index + 1,
        qInvoiceId: newQInvoiceId,
        ...item,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      setQuickInvoiceItems((prev) => [...prev, ...newItems]);
    }

    resetForm();
    setIsFormVisible(false);
  };

  const resetForm = () => {
    setFormData({
      qInvoiceNo: '',
      qInvoiceDate: '',
      qGRNIds: [],
      remark: '',
      taxDetails: {},
    });
    setErrors({});
    setIsEditMode(false);
    setEditId(null);
  };

  // react-select options for Quick GRNs
  const grnOptions = quickGRNs.map((grn) => ({
    value: grn.qGRNId,
    label: grn.qGRNNo,
  }));

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className='flex justify-between items-center mb-4'>
        <h2 className="text-lg sm:text-xl font-semibold text-brand-secondary mb-4">Quick Invoices</h2>
        <div>
          <button
            onClick={() => setIsFormVisible(!isFormVisible)}
            className="w-full sm:w-auto bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-red-600 text-xs sm:text-sm"
          >
            {isFormVisible ? 'Hide Form' : 'Manage Quick Invoice'}
          </button>
        </div>
      </div>
      
      <div className="flex flex-col gap-4 sm:gap-6">
        
        {isFormVisible && (
          <div>
            <h3 className="text-base sm:text-lg font-medium text-brand-secondary mb-4">
              {isEditMode ? 'Edit Quick Invoice' : 'Add Quick Invoice'}
            </h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label="Quick Invoice ID"
                type="text"
                name="qInvoiceId"
                value={formData.qInvoiceId}
                onChange={handleChange}
                disabled
                required={false}
                className="w-full text-xs sm:text-sm"
              />
              <FormInput
                label="Quick Invoice Number"
                type="text"
                name="qInvoiceNo"
                value={formData.qInvoiceNo}
                onChange={handleChange}
                error={errors.qInvoiceNo}
                disabled
                required
                className="w-full text-xs sm:text-sm"
              />
              <FormInput
                label="Quick Invoice Date"
                type="date"
                name="qInvoiceDate"
                value={formData.qInvoiceDate}
                onChange={handleChange}
                error={errors.qInvoiceDate}
                required
                className="w-full text-xs sm:text-sm"
              />
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700">Quick GRNs</label>
                <Select
                  isMulti
                  options={grnOptions}
                  value={grnOptions.filter((option) => formData.qGRNIds.includes(option.value))}
                  onChange={handleGRNChange}
                  className="mt-1 text-xs sm:text-sm"
                  classNamePrefix="select"
                  placeholder="Select Quick GRNs"
                  required
                />
                {errors.qGRNIds && (
                  <p className="mt-1 text-xs text-red-600">{errors.qGRNIds}</p>
                )}
              </div>
              <FormInput
                label="Remark"
                type="text"
                name="remark"
                value={formData.remark}
                onChange={handleChange}
                error={errors.remark}
                required={false}
                className="w-full text-xs sm:text-sm"
              />
              <div className="col-span-1 sm:col-span-2">
                <h4 className="text-sm sm:text-md font-medium text-brand-secondary mb-2">Tax Details</h4>
                {formData.qGRNIds.map((qGRNId) => (
                  <div key={qGRNId} className="mb-4 p-4 border rounded-md">
                    <h5 className="text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      Items for {quickGRNs.find((g) => g.qGRNId === qGRNId)?.qGRNNo || qGRNId}
                    </h5>
                    {quickGRNItems
                      .filter((gi) => gi.qGRNId === qGRNId)
                      .map((gi) => {
                        const { baseAmount, taxAmount, totalAmount } = calculateItemAmounts(
                          gi,
                          formData.taxDetails[gi.qGRNItemid]?.taxPercentage
                        );
                        return (
                          <div key={gi.qGRNItemid} className="flex flex-col gap-2 mb-4 p-4 border rounded-md">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <p className="text-xs sm:text-sm">
                                <strong>Item:</strong> {items.find((i) => i.id === gi.itemId)?.name || 'N/A'}
                              </p>
                              <p className="text-xs sm:text-sm">
                                <strong>Quantity:</strong> {gi.quantity}
                              </p>
                              <p className="text-xs sm:text-sm">
                                <strong>Rate:</strong> ₹{parseFloat(gi.rate).toFixed(2)}
                              </p>
                              <p className="text-xs sm:text-sm">
                                <strong>Discount:</strong> ₹{parseFloat(gi.discount || 0).toFixed(2)}
                              </p>
                              <p className="text-xs sm:text-sm">
                                <strong>Base Amount:</strong> ₹{baseAmount}
                              </p>
                              <p className="text-xs sm:text-sm">
                                <strong>Tax Amount:</strong> ₹{taxAmount}
                              </p>
                              <p className="text-xs sm:text-sm">
                                <strong>Total Amount:</strong> ₹{totalAmount}
                              </p>
                            </div>
                            <label className="text-xs sm:text-sm font-medium text-gray-700 mt-2">
                              Tax Percentage for Item {gi.qGRNItemid}
                            </label>
                            <input
                              type="number"
                              value={formData.taxDetails[gi.qGRNItemid]?.taxPercentage || ''}
                              onChange={(e) => handleTaxChange(gi.qGRNItemid, e)}
                              className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-brand-primary focus:border-brand-primary text-xs sm:text-sm"
                              placeholder="Enter tax percentage"
                              required
                            />
                            {errors[`taxDetails[${gi.qGRNItemid}].taxPercentage`] && (
                              <p className="mt-1 text-xs text-red-600">{errors[`taxDetails[${gi.qGRNItemid}].taxPercentage`]}</p>
                            )}
                          </div>
                        );
                      })}
                  </div>
                ))}
                <div className="mt-4 p-4 bg-gray-50 rounded-md">
                  <h4 className="text-sm sm:text-md font-semibold text-brand-secondary">Final Total Amount</h4>
                  <p className="text-sm sm:text-md font-medium text-gray-900">
                    ₹{calculateFinalTotalAmount(formData.qGRNIds, formData.taxDetails)}
                  </p>
                </div>
              </div>
              <div className="col-span-1 sm:col-span-2 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                <button
                  type="submit"
                  className="w-full sm:w-auto bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-red-600 text-xs sm:text-sm"
                >
                  {isEditMode ? 'Update' : 'Add'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setIsFormVisible(false);
                  }}
                  className="w-full sm:w-auto px-4 py-2 text-gray-600 rounded-md hover:bg-gray-100 text-xs sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
        <div>
          <div className="sm:hidden space-y-4">
            {quickInvoices.map((inv) => (
              <div key={inv.qInvoiceId} className="p-4 border rounded-md bg-gray-50">
                <div className="space-y-2">
                  <p className="text-xs"><strong>ID:</strong> {inv.qInvoiceId}</p>
                  <p className="text-xs"><strong>Invoice No:</strong> {inv.qInvoiceNo}</p>
                  <p className="text-xs"><strong>Invoice Date:</strong> {new Date(inv.qInvoiceDate).toLocaleDateString()}</p>
                  <p className="text-xs"><strong>Quick GRNs:</strong> {inv.qGRNIds.map((id) => quickGRNs.find((g) => g.qGRNId === id)?.qGRNNo || id).join(', ')}</p>
                  <p className="text-xs"><strong>Total Amount:</strong> ₹{parseFloat(inv.totalAmount).toFixed(2)}</p>
                </div>
                <div className="flex flex-col space-y-2 mt-2">
                  {actions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => action.onClick && action.onClick(inv)}
                      className={`${action.className} w-full text-xs py-1 ${action.render ? 'hidden' : ''}`}
                    >
                      {action.label}
                    </button>
                  ))}
                  <Link
                    to={`/masters/quickinvoice/${inv.qInvoiceId}`}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-2 py-1 rounded text-xs w-full text-center"
                  >
                    View Details
                  </Link>
                </div>
                {expandedQInvoiceId === inv.qInvoiceId && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-brand-secondary mb-2">Quick Invoice Items</h4>
                    <div className="space-y-4">
                      {quickInvoiceItems
                        .filter((qi) => qi.qInvoiceId === Number(inv.qInvoiceId))
                        .map((qi) => (
                          <div key={qi.qInvoiceItemId} className="p-4 border rounded-md bg-white">
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
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="hidden sm:block overflow-x-auto">
            <Table
              columns={quickInvoiceColumns}
              data={quickInvoices}
              actions={actions}
              expandable={{
                expandedRowRender: (row) => {
                  const items = quickInvoiceItems.filter((qi) => qi.qInvoiceId === Number(row.qInvoiceId));
                  console.log('Rendering items for qInvoiceId:', row.qInvoiceId, items);
                  return (
                    <div className="p-4 bg-gray-50">
                      <h4 className="text-sm font-medium text-brand-secondary mb-2">Quick Invoice Items</h4>
                      <div className="sm:hidden space-y-4">
                        {items.map((qi) => (
                          <div key={qi.qInvoiceItemId} className="p-4 border rounded-md bg-white">
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
                        <Table
                          columns={quickInvoiceItemColumns}
                          data={items}
                          actions={[]}
                          className="text-sm"
                        />
                      </div>
                    </div>
                  );
                },
                rowExpandable: (row) => quickInvoiceItems.some((qi) => qi.qInvoiceId === Number(row.qInvoiceId)),
                expandedRowKeys: expandedQInvoiceId ? [Number(expandedQInvoiceId)] : [],
              }}
              className="text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuickInvoice;