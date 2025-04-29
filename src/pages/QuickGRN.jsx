import React, { useState, useEffect } from 'react';
import Table from '../components/Table';
import FormInput from '../components/FormInput';
import QuickGRNDetails from './QuickGRNDetails';

function QuickGRN() {
  const [quickGRNs, setQuickGRNs] = useState([]);
  const [quickGRNItems, setQuickGRNItems] = useState([]);
  const [institutes, setInstitutes] = useState([]);
  const [financialYears, setFinancialYears] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [items, setItems] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    qGRNId: '',
    qGRNNo: '',
    qGRNDate: '',
    instituteId: '',
    financialYearId: '',
    vendorId: '',
    document: '',
    challanNo: '',
    challanDate: '',
    requestedBy: '',
    remark: '',
    quickGRNItems: [{ itemId: '', quantity: '', rate: '', receivedQuantity: '', rejectedQuantity: '', discount: '', amount: '', totalAmount: '' }],
  });
  const [errors, setErrors] = useState({});
  const [editId, setEditId] = useState(null);
  const [selectedQGRNId, setSelectedQGRNId] = useState(null);
  const [currentLayout, setCurrentLayout] = useState(null);

  // Initialize dummy data
  useEffect(() => {
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
      }
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
        qGRNId: 2,
        itemId: 2,
        quantity: 100,
        rate: 100.00,
        amount: 10000.00,
        discount: 0.00,
        totalAmount: 10000.00,
        receivedQuantity: 100,
        rejectedQuantity: 0,
        createdAt: '2025-04-24T07:42:42.593Z',
        updatedAt: '2025-04-24T07:42:42.593Z',
      }
    ];
    const institutesData = [
      { id: 1, name: 'Institute A' },
      { id: 2, name: 'Institute B' },
    ];
    const financialYearsData = [
      { id: 1, year: '2024-2025' },
      { id: 2, year: '2025-2026' },
    ];
    const vendorsData = [
      { id: 1, name: 'Vendor X' },
      { id: 2, name: 'Vendor Y' },
    ];
    const itemsData = [
      { id: 1, name: 'Pen' },
      { id: 2, name: 'Notebook' },
    ];

    setQuickGRNs(quickGRNsData);
    setQuickGRNItems(quickGRNItemsData);
    setInstitutes(institutesData);
    setFinancialYears(financialYearsData);
    setVendors(vendorsData);
    setItems(itemsData);
  }, []);

  // Table columns for QuickGRN
  const quickGRNColumns = [
    { key: 'qGRNNo', label: 'Quick GRN No' },
    { key: 'qGRNDate', label: 'Quick GRN Date', format: (value) => new Date(value).toLocaleDateString() },
    { key: 'instituteId', label: 'Institute', format: (value) => institutes.find((i) => i.id === value)?.name || 'N/A' },
    { key: 'financialYearId', label: 'Financial Year', format: (value) => financialYears.find((fy) => fy.id === value)?.year || 'N/A' },
    { key: 'vendorId', label: 'Vendor', format: (value) => vendors.find((v) => v.id === value)?.name || 'N/A' },
    { key: 'challanNo', label: 'Challan No' },
    { key: 'challanDate', label: 'Challan Date', format: (value) => value ? new Date(value).toLocaleDateString() : 'N/A' },
    { key: 'requestedBy', label: 'Requested By' },
  ];

  // Table actions
  const actions = [
    {
      label: 'Edit',
      onClick: (row) => {
        setIsEditMode(true);
        setEditId(row.qGRNId);
        const items = quickGRNItems
          .filter((qi) => qi.qGRNId === row.qGRNId)
          .map((qi) => ({
            qGRNItemid: qi.qGRNItemid,
            itemId: qi.itemId,
            quantity: qi.quantity,
            rate: qi.rate,
            receivedQuantity: qi.receivedQuantity,
            rejectedQuantity: qi.rejectedQuantity,
            discount: qi.discount,
            amount: qi.amount,
            totalAmount: qi.totalAmount,
          }));
        setFormData({
          qGRNId: row.qGRNId,
          qGRNNo: row.qGRNNo,
          qGRNDate: row.qGRNDate.split('T')[0],
          instituteId: row.instituteId,
          financialYearId: row.financialYearId,
          vendorId: row.vendorId,
          document: row.document,
          challanNo: row.challanNo,
          challanDate: row.challanDate ? row.challanDate.split('T')[0] : '',
          requestedBy: row.requestedBy,
          remark: row.remark,
          quickGRNItems: items.length > 0 ? items : [{ itemId: '', quantity: '', rate: '', receivedQuantity: '', rejectedQuantity: '', discount: '', amount: '', totalAmount: '' }],
        });
        setIsFormVisible(true);
      },
      className: 'bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs sm:text-sm',
    },
    {
      label: 'Delete',
      onClick: (row) => {
        if (window.confirm(`Delete Quick GRN ${row.qGRNNo}?`)) {
          setQuickGRNs((prev) => prev.filter((qgrn) => qgrn.qGRNId !== row.qGRNId));
          setQuickGRNItems((prev) => prev.filter((qi) => qi.qGRNId !== row.qGRNId));
          resetForm();
        }
      },
      className: 'bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs sm:text-sm',
    },
  ];

  // Handle row click to show details
  const handleRowClick = (row) => {
    setSelectedQGRNId(row.qGRNId);
    setCurrentLayout('details');
  };

  // Handle back to table view
  const handleBack = () => {
    setSelectedQGRNId(null);
    setCurrentLayout(null);
  };

  // Form handling
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const updatedItems = [...formData.quickGRNItems];
    updatedItems[index] = { ...updatedItems[index], [name]: value };

    // Calculate amount and totalAmount
    const quantity = Number(updatedItems[index].quantity) || 0;
    const rate = Number(updatedItems[index].rate) || 0;
    const discount = Number(updatedItems[index].discount) || 0;
    const amount = quantity * rate;
    const totalAmount = amount - discount;

    updatedItems[index].amount = amount.toFixed(2);
    updatedItems[index].totalAmount = totalAmount.toFixed(2);

    setFormData((prev) => ({ ...prev, quickGRNItems: updatedItems }));
    setErrors((prev) => ({ ...prev, [`quickGRNItems[${index}].${name}`]: '' }));
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      quickGRNItems: [...prev.quickGRNItems, { itemId: '', quantity: '', rate: '', receivedQuantity: '', rejectedQuantity: '', discount: '', amount: '', totalAmount: '' }],
    }));
  };

  const removeItem = (index) => {
    if (formData.quickGRNItems.length === 1) {
      alert('At least one Quick GRN item is required');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      quickGRNItems: prev.quickGRNItems.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.qGRNNo) newErrors.qGRNNo = 'Quick GRN number is required';
    else if (quickGRNs.some((qgrn) => qgrn.qGRNNo === formData.qGRNNo && qgrn.qGRNId !== editId)) {
      newErrors.qGRNNo = 'Quick GRN number must be unique';
    }
    if (!formData.qGRNDate) newErrors.qGRNDate = 'Quick GRN date is required';
    if (!formData.instituteId) newErrors.instituteId = 'Institute is required';
    if (!formData.financialYearId) newErrors.financialYearId = 'Financial Year is required';
    if (!formData.vendorId) newErrors.vendorId = 'Vendor is required';
    if (!formData.requestedBy) newErrors.requestedBy = 'Requested By is required';

    formData.quickGRNItems.forEach((item, index) => {
      if (!item.itemId) newErrors[`quickGRNItems[${index}].itemId`] = 'Item is required';
      if (!item.quantity || item.quantity < 0) newErrors[`quickGRNItems[${index}].quantity`] = 'Quantity must be non-negative';
      if (!item.rate || item.rate < 0) newErrors[`quickGRNItems[${index}].rate`] = 'Rate must be non-negative';
      if (!item.receivedQuantity || item.receivedQuantity < 0) newErrors[`quickGRNItems[${index}].receivedQuantity`] = 'Received quantity must be non-negative';
      if (item.rejectedQuantity < 0) newErrors[`quickGRNItems[${index}].rejectedQuantity`] = 'Rejected quantity must be non-negative';
      if (item.discount < 0) newErrors[`quickGRNItems[${index}].discount`] = 'Discount cannot be negative';
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

    if (isEditMode) {
      setQuickGRNs((prev) =>
        prev.map((qgrn) =>
          qgrn.qGRNId === editId
            ? {
                ...formData,
                qGRNId: editId,
                instituteId: Number(formData.instituteId),
                financialYearId: Number(formData.financialYearId),
                vendorId: Number(formData.vendorId),
                updatedAt: new Date().toISOString(),
              }
            : qgrn
        )
      );
      const existingIds = quickGRNItems.filter((qi) => qi.qGRNId === editId).map((qi) => qi.qGRNItemid);
      const updatedItems = formData.quickGRNItems.map((item, index) => ({
        qGRNItemid: item.qGRNItemid || existingIds[index] || Math.max(...quickGRNItems.map((i) => i.qGRNItemid), 0) + index + 1,
        qGRNId: editId,
        itemId: Number(item.itemId),
        quantity: Number(item.quantity),
        rate: Number(item.rate),
        amount: Number(item.amount),
        discount: Number(item.discount),
        totalAmount: Number(item.totalAmount),
        receivedQuantity: Number(item.receivedQuantity),
        rejectedQuantity: Number(item.rejectedQuantity || 0),
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      setQuickGRNItems((prev) => [
        ...prev.filter((qi) => qi.qGRNId !== editId),
        ...updatedItems,
      ]);
    } else {
      const newQGRNId = Math.max(...quickGRNs.map((qgrn) => qgrn.qGRNId), 0) + 1;
      setQuickGRNs((prev) => [
        ...prev,
        {
          ...formData,
          qGRNId: newQGRNId,
          instituteId: Number(formData.instituteId),
          financialYearId: Number(formData.financialYearId),
          vendorId: Number(formData.vendorId),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);
      const newQuickGRNItems = formData.quickGRNItems.map((item, index) => ({
        qGRNItemid: Math.max(...quickGRNItems.map((i) => i.qGRNItemid), 0) + index + 1,
        qGRNId: newQGRNId,
        itemId: Number(item.itemId),
        quantity: Number(item.quantity),
        rate: Number(item.rate),
        amount: Number(item.amount),
        discount: Number(item.discount),
        totalAmount: Number(item.totalAmount),
        receivedQuantity: Number(item.receivedQuantity),
        rejectedQuantity: Number(item.rejectedQuantity || 0),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      setQuickGRNItems((prev) => [...prev, ...newQuickGRNItems]);
    }

    resetForm();
    setIsFormVisible(false);
  };

  const resetForm = () => {
    setFormData({
      qGRNId: '',
      qGRNNo: '',
      qGRNDate: '',
      instituteId: '',
      financialYearId: '',
      vendorId: '',
      document: '',
      challanNo: '',
      challanDate: '',
      requestedBy: '',
      remark: '',
      quickGRNItems: [{ itemId: '', quantity: '', rate: '', receivedQuantity: '', rejectedQuantity: '', discount: '', amount: '', totalAmount: '' }],
    });
    setErrors({});
    setIsEditMode(false);
    setEditId(null);
  };

  // Get selected Quick GRN data
  const selectedQGRN = quickGRNs.find((qgrn) => qgrn.qGRNId === selectedQGRNId);
  const selectedQGRNItems = quickGRNItems.filter((qi) => qi.qGRNId === selectedQGRNId);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {selectedQGRNId ? (
        <QuickGRNDetails
          quickGRN={selectedQGRN}
          quickGRNItems={selectedQGRNItems}
          institutes={institutes}
          financialYears={financialYears}
          vendors={vendors}
          items={items}
          onBack={handleBack}
        />
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-brand-secondary mb-4">Quick GRNs</h2>
            <div>
              <button
                onClick={() => setIsFormVisible(!isFormVisible)}
                className="bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-red-600"
              >
                {isFormVisible ? 'Hide Form' : 'Add Quick GRN'}
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-6 mb-6">
            {isFormVisible && (
              <div>
                <h3 className="text-base sm:text-lg font-medium text-brand-secondary mb-4">
                  {isEditMode ? 'Edit Quick GRN' : 'Add Quick GRN'}
                </h3>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <FormInput
                    label="Quick GRN ID"
                    type="text"
                    name="qGRNId"
                    value={formData.qGRNId}
                    onChange={handleChange}
                    disabled
                    required={false}
                    className="w-full text-xs sm:text-sm"
                  />
                  <FormInput
                    label="Quick GRN Number"
                    type="text"
                    name="qGRNNo"
                    value={formData.qGRNNo}
                    onChange={handleChange}
                    error={errors.qGRNNo}
                    required
                    className="w-full text-xs sm:text-sm"
                  />
                  <FormInput
                    label="Quick GRN Date"
                    type="date"
                    name="qGRNDate"
                    value={formData.qGRNDate}
                    onChange={handleChange}
                    error={errors.qGRNDate}
                    required
                    className="w-full text-xs sm:text-sm"
                  />
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">Institute</label>
                    <select
                      name="instituteId"
                      value={formData.instituteId}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-brand-primary focus:border-brand-primary text-xs sm:text-sm"
                      required
                    >
                      <option value="">Select Institute</option>
                      {institutes.map((inst) => (
                        <option key={inst.id} value={inst.id}>
                          {inst.name}
                        </option>
                      ))}
                    </select>
                    {errors.instituteId && (
                      <p className="mt-1 text-xs text-red-600">{errors.instituteId}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">Financial Year</label>
                    <select
                      name="financialYearId"
                      value={formData.financialYearId}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-brand-primary focus:border-brand-primary text-xs sm:text-sm"
                      required
                    >
                      <option value="">Select Financial Year</option>
                      {financialYears.map((fy) => (
                        <option key={fy.id} value={fy.id}>
                          {fy.year}
                        </option>
                      ))}
                    </select>
                    {errors.financialYearId && (
                      <p className="mt-1 text-xs text-red-600">{errors.financialYearId}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">Vendor</label>
                    <select
                      name="vendorId"
                      value={formData.vendorId}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-brand-primary focus:border-brand-primary text-xs sm:text-sm"
                      required
                    >
                      <option value="">Select Vendor</option>
                      {vendors.map((vendor) => (
                        <option key={vendor.id} value={vendor.id}>
                          {vendor.name}
                        </option>
                      ))}
                    </select>
                    {errors.vendorId && (
                      <p className="mt-1 text-xs text-red-600">{errors.vendorId}</p>
                    )}
                  </div>
                  <FormInput
                    label="Document"
                    type="text"
                    name="document"
                    value={formData.document}
                    onChange={handleChange}
                    error={errors.document}
                    required={false}
                    className="w-full text-xs sm:text-sm"
                  />
                  <FormInput
                    label="Challan Number"
                    type="text"
                    name="challanNo"
                    value={formData.challanNo}
                    onChange={handleChange}
                    error={errors.challanNo}
                    required={false}
                    className="w-full text-xs sm:text-sm"
                  />
                  <FormInput
                    label="Challan Date"
                    type="date"
                    name="challanDate"
                    value={formData.challanDate}
                    onChange={handleChange}
                    error={errors.challanDate}
                    required={false}
                    className="w-full text-xs sm:text-sm"
                  />
                  <FormInput
                    label="Requested By"
                    type="text"
                    name="requestedBy"
                    value={formData.requestedBy}
                    onChange={handleChange}
                    error={errors.requestedBy}
                    required
                    className="w-full text-xs sm:text-sm"
                  />
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
                    <h4 className="text-sm sm:text-md font-medium text-brand-secondary mb-2">Quick GRN Items</h4>
                    {formData.quickGRNItems.map((item, index) => (
                      <div key={index} className="flex flex-col gap-4 mb-4 p-4 border rounded-md">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700">Item</label>
                            <select
                              name="itemId"
                              value={item.itemId}
                              onChange={(e) => handleItemChange(index, e)}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-brand-primary focus:border-brand-primary text-xs sm:text-sm"
                              required
                            >
                              <option value="">Select Item</option>
                              {items.map((it) => (
                                <option key={it.id} value={it.id}>
                                  {it.name}
                                </option>
                              ))}
                            </select>
                            {errors[`quickGRNItems[${index}].itemId`] && (
                              <p className="mt-1 text-xs text-red-600">{errors[`quickGRNItems[${index}].itemId`]}</p>
                            )}
                          </div>
                          <FormInput
                            label="Quantity"
                            type="number"
                            name="quantity"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, e)}
                            error={errors[`quickGRNItems[${index}].quantity`]}
                            required
                            className="w-full text-xs sm:text-sm"
                          />
                          <FormInput
                            label="Rate"
                            type="number"
                            name="rate"
                            value={item.rate}
                            onChange={(e) => handleItemChange(index, e)}
                            error={errors[`quickGRNItems[${index}].rate`]}
                            required
                            className="w-full text-xs sm:text-sm"
                          />
                          <FormInput
                            label="Amount"
                            type="text"
                            name="amount"
                            value={item.amount}
                            disabled
                            required={false}
                            className="w-full text-xs sm:text-sm"
                          />
                          <FormInput
                            label="Discount"
                            type="number"
                            name="discount"
                            value={item.discount}
                            onChange={(e) => handleItemChange(index, e)}
                            error={errors[`quickGRNItems[${index}].discount`]}
                            required={false}
                            className="w-full text-xs sm:text-sm"
                          />
                          <FormInput
                            label="Total Amount"
                            type="text"
                            name="totalAmount"
                            value={item.totalAmount}
                            disabled
                            required={false}
                            className="w-full text-xs sm:text-sm"
                          />
                          <FormInput
                            label="Received Quantity"
                            type="number"
                            name="receivedQuantity"
                            value={item.receivedQuantity}
                            onChange={(e) => handleItemChange(index, e)}
                            error={errors[`quickGRNItems[${index}].receivedQuantity`]}
                            required
                            className="w-full text-xs sm:text-sm"
                          />
                          <FormInput
                            label="Rejected Quantity"
                            type="number"
                            name="rejectedQuantity"
                            value={item.rejectedQuantity}
                            onChange={(e) => handleItemChange(index, e)}
                            error={errors[`quickGRNItems[${index}].rejectedQuantity`]}
                            required={false}
                            className="w-full text-xs sm:text-sm"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-red-600 hover:text-red-800 text-xs sm:text-sm mt-2"
                        >
                          Remove Item
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addItem}
                      className="w-full sm:w-auto bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 text-xs sm:text-sm"
                    >
                      Add Quick GRN Item
                    </button>
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
              {currentLayout ? (
                <QuickGRNDetails />
              ) : (
                <Table
                  columns={quickGRNColumns}
                  data={quickGRNs}
                  actions={actions}
                  onRowClick={handleRowClick}
                />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default QuickGRN;