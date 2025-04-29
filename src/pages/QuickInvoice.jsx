import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import Table from '../components/Table';
import FormInput from '../components/FormInput';
import QuickInvoiceDetails from './QuickInvoiceDetail';

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
    taxDetails: {}, // { qGRNItemid: { taxPercentage: number, taxAmount: string, baseAmount: string, totalAmount: string } }
  });
  const [errors, setErrors] = useState({});
  const [editId, setEditId] = useState(null);
  const [selectedQInvoiceId, setSelectedQInvoiceId] = useState(null);

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
    { key: 'qInvoiceNo', label: 'Invoice No' },
    { key: 'qInvoiceDate', label: 'Invoice Date', format: (value) => new Date(value).toLocaleDateString() },
    { key: 'qGRNIds', label: 'Quick GRNs', format: (value) => value.map((id) => quickGRNs.find((g) => g.qGRNId === id)?.qGRNNo || id).join(', ') },
    { key: 'totalAmount', label: 'Total Amount', format: (value) => `₹${parseFloat(value).toFixed(2)}` },
    { key: 'remark', label: 'Remark' },
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
            const grnItem = quickGRNItems.find((gi) => gi.qGRNItemid === qi.qGRNItemid);
            const { baseAmount, taxAmount, totalAmount } = calculateItemAmounts(grnItem, qi.taxPercentage);
            taxDetails[qi.qGRNItemid] = {
              taxPercentage: qi.taxPercentage,
              baseAmount,
              taxAmount,
              totalAmount,
            };
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
  ];

  // Handle row click to show details
  const handleRowClick = (row) => {
    setSelectedQInvoiceId(row.qInvoiceId);
  };

  // Handle back to table view
  const handleBack = () => {
    setSelectedQInvoiceId(null);
  };

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
        if (!newTaxDetails[gi.qGRNItemid]) {
          const { baseAmount, taxAmount, totalAmount } = calculateItemAmounts(gi, 0);
          newTaxDetails[gi.qGRNItemid] = { taxPercentage: '', baseAmount, taxAmount, totalAmount };
        }
      });
      return { ...prev, qGRNIds: selected, taxDetails: newTaxDetails };
    });
    setErrors((prev) => ({ ...prev, qGRNIds: '' }));
  };

  const handleTaxChange = (qGRNItemid, e) => {
    const { value } = e.target;
    setFormData((prev) => {
      const grnItem = quickGRNItems.find((gi) => gi.qGRNItemid === qGRNItemid);
      const { baseAmount, taxAmount, totalAmount } = calculateItemAmounts(grnItem, value);
      return {
        ...prev,
        taxDetails: {
          ...prev.taxDetails,
          [qGRNItemid]: { taxPercentage: value, baseAmount, taxAmount, totalAmount },
        },
      };
    });
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const items = [];
    let totalInvoiceAmount = 0;

    formData.qGRNIds.forEach((qGRNId) => {
      const grnItems = quickGRNItems.filter((gi) => gi.qGRNId === qGRNId);
      grnItems.forEach((gi) => {
        const taxPercentage = Number(formData.taxDetails[gi.qGRNItemid]?.taxPercentage) || 0;
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

    if (isEditMode) {
      setQuickInvoices((prev) =>
        prev.map((inv) =>
          inv.qInvoiceId === editId
            ? {
                ...formData,
                qInvoiceId: editId,
                qGRNIds: formData.qGRNIds,
                totalAmount: totalInvoiceAmount.toFixed(2),
                updatedAt: new Date().toISOString(),
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
        updatedAt: new Date().toISOString(),
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

  // Get selected Quick Invoice data
  const selectedQInvoice = quickInvoices.find((inv) => inv.qInvoiceId === selectedQInvoiceId);
  const selectedQInvoiceItems = quickInvoiceItems.filter((qi) => qi.qInvoiceId === selectedQInvoiceId);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {selectedQInvoiceId ? (
        <QuickInvoiceDetails
          quickInvoice={selectedQInvoice}
          quickInvoiceItems={selectedQInvoiceItems}
          quickGRNs={quickGRNs}
          quickGRNItems={quickGRNItems}
          items={items}
          onBack={handleBack}
        />
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-brand-secondary mb-4">Quick Invoices</h2>
            <div>
              <button
                onClick={() => setIsFormVisible(!isFormVisible)}
                className="bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-red-600"
              >
                {isFormVisible ? 'Hide Form' : 'Add Quick Invoice'}
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-6 mb-6">
            {isFormVisible && (
              <div>
                <h3 className="text-base sm:text-lg font-medium text-brand-secondary mb-4">
                  {isEditMode ? 'Edit Quick Invoice' : 'Add Quick Invoice'}
                </h3>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  <div className="col-span-1 sm:col-span-2 lg:col-span-3">
                    <h4 className="text-sm sm:text-md font-medium text-brand-secondary mb-2">Tax Details</h4>
                    {formData.qGRNIds.map((qGRNId) => (
                      <div key={qGRNId} className="mb-4 p-4 border rounded-md">
                        <h5 className="text-xs sm:text-sm font-medium text-gray-700 mb-2">
                          Items for {quickGRNs.find((g) => g.qGRNId === qGRNId)?.qGRNNo || qGRNId}
                        </h5>
                        {quickGRNItems
                          .filter((gi) => gi.qGRNId === qGRNId)
                          .map((gi) => (
                            <div key={gi.qGRNItemid} className="flex flex-col gap-2 mb-4 p-4 border rounded-md">
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                <div>
                                  <label className="block text-xs sm:text-sm font-medium text-gray-700">Item</label>
                                  <input
                                    type="text"
                                    value={items.find((i) => i.id === gi.itemId)?.name || 'N/A'}
                                    disabled
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-xs sm:text-sm bg-gray-100"
                                  />
                                </div>
                                <FormInput
                                  label="Quantity"
                                  type="number"
                                  value={gi.quantity}
                                  disabled
                                  required={false}
                                  className="w-full text-xs sm:text-sm"
                                />
                                <FormInput
                                  label="Rate"
                                  type="number"
                                  value={gi.rate}
                                  disabled
                                  required={false}
                                  className="w-full text-xs sm:text-sm"
                                />
                                <FormInput
                                  label="Discount"
                                  type="number"
                                  value={gi.discount || 0}
                                  disabled
                                  required={false}
                                  className="w-full text-xs sm:text-sm"
                                />
                                <FormInput
                                  label="Base Amount"
                                  type="text"
                                  value={formData.taxDetails[gi.qGRNItemid]?.baseAmount || ''}
                                  disabled
                                  required={false}
                                  className="w-full text-xs sm:text-sm"
                                />
                                <FormInput
                                  label="Tax Amount"
                                  type="text"
                                  value={formData.taxDetails[gi.qGRNItemid]?.taxAmount || ''}
                                  disabled
                                  required={false}
                                  className="w-full text-xs sm:text-sm"
                                />
                                <FormInput
                                  label="Total Amount"
                                  type="text"
                                  value={formData.taxDetails[gi.qGRNItemid]?.totalAmount || ''}
                                  disabled
                                  required={false}
                                  className="w-full text-xs sm:text-sm"
                                />
                                <div>
                                  <label className="block text-xs sm:text-sm font-medium text-gray-700">
                                    Tax Percentage
                                  </label>
                                  <input
                                    type="number"
                                    value={formData.taxDetails[gi.qGRNItemid]?.taxPercentage || ''}
                                    onChange={(e) => handleTaxChange(gi.qGRNItemid, e)}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-brand-primary focus:border-brand-primary text-xs sm:text-sm"
                                    placeholder="Enter tax percentage"
                                    required
                                  />
                                  {errors[`taxDetails[${gi.qGRNItemid}].taxPercentage`] && (
                                    <p className="mt-1 text-xs text-red-600">{errors[`taxDetails[${gi.qGRNItemid}].taxPercentage`]}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    ))}
                    <div className="mt-4 p-4 bg-gray-50 rounded-md">
                      <h4 className="text-sm sm:text-md font-semibold text-brand-secondary">Final Total Amount</h4>
                      <p className="text-sm sm:text-md font-medium text-gray-900">
                        ₹{calculateFinalTotalAmount(formData.qGRNIds, formData.taxDetails)}
                      </p>
                    </div>
                  </div>
                  <div className="col-span-1 sm:col-span-2 lg:col-span-3 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
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
              <Table
                columns={quickInvoiceColumns}
                data={quickInvoices}
                actions={actions}
                onRowClick={handleRowClick}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default QuickInvoice;