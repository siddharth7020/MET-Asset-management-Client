import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Table from '../components/Table';
import FormInput from '../components/FormInput';

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
    quickGRNItems: [{ itemId: '', quantity: '', rate: '', receivedQuantity: '', rejectedQuantity: '', discount: '' }],
  });
  const [errors, setErrors] = useState({});
  const [editId, setEditId] = useState(null);
  const [expandedQGRNId, setExpandedQGRNId] = useState(null);

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
    console.log('QuickGRNs:', quickGRNsData, 'QuickGRNItems:', quickGRNItemsData); // Debug
  }, []);

  // Table columns for QuickGRN
  const quickGRNColumns = [
    { key: 'qGRNNo', label: 'Quick GRN No' },
    { key: 'qGRNDate', label: 'Quick GRN Date', format: (value) => new Date(value).toLocaleDateString() },
    { key: 'instituteId', label: 'Institute', format: (value) => institutes.find((i) => i.id === value)?.name || 'N/A' },
    { key: 'financialYearId', label: 'Financial Year', format: (value) => financialYears.find((fy) => fy.id === value)?.year || 'N/A' },
    { key: 'vendorId', label: 'Vendor', format: (value) => vendors.find((v) => v.id === value)?.name || 'N/A' },
    { key: 'challanNo', label: 'Challan No', className: 'hidden sm:table-cell' },
    { key: 'challanDate', label: 'Challan Date', format: (value) => value ? new Date(value).toLocaleDateString() : 'N/A', className: 'hidden sm:table-cell' },
    { key: 'requestedBy', label: 'Requested By', className: 'hidden sm:table-cell' },
  ];

  // Table columns for QuickGRNItem
  const quickGRNItemColumns = [
    { key: 'qGRNItemid', label: 'ID' },
    { key: 'itemId', label: 'Item', format: (value) => items.find((i) => i.id === value)?.name || 'N/A' },
    { key: 'quantity', label: 'Quantity' },
    { key: 'rate', label: 'Rate', format: (value) => `₹${parseFloat(value).toFixed(2)}` },
    { key: 'amount', label: 'Amount', format: (value) => `₹${parseFloat(value).toFixed(2)}` },
    { key: 'discount', label: 'Discount', format: (value) => `₹${parseFloat(value).toFixed(2)}` },
    { key: 'totalAmount', label: 'Total Amount', format: (value) => `₹${parseFloat(value).toFixed(2)}` },
    { key: 'receivedQuantity', label: 'Received Quantity' },
    { key: 'rejectedQuantity', label: 'Rejected Quantity' },
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
          quickGRNItems: items.length > 0 ? items : [{ itemId: '', quantity: '', rate: '', receivedQuantity: '', rejectedQuantity: '', discount: '' }],
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
    {
      label: 'View Items',
      onClick: (row) => {
        console.log('Toggling items for qGRNId:', row.qGRNId); // Debug
        setExpandedQGRNId(expandedQGRNId === row.qGRNId ? null : row.qGRNId);
      },
      className: 'bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs sm:text-sm',
    },
    {
      label: 'View Details',
      className: 'bg-purple-500 hover:bg-purple-600 text-white px-2 py-1 rounded text-xs sm:text-sm',
      render: (row) => (
        <Link
          to={`/masters/quickgrn/${row.qGRNId}`}
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
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const updatedItems = [...formData.quickGRNItems];
    updatedItems[index] = { ...updatedItems[index], [name]: value };
    setFormData((prev) => ({ ...prev, quickGRNItems: updatedItems }));
    setErrors((prev) => ({ ...prev, [`quickGRNItems[${index}].${name}`]: '' }));
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      quickGRNItems: [...prev.quickGRNItems, { itemId: '', quantity: '', rate: '', receivedQuantity: '', rejectedQuantity: '', discount: '' }],
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

  const calculateItemTotals = (items) => {
    return items.map((item) => {
      const quantity = Number(item.quantity) || 0;
      const rate = Number(item.rate) || 0;
      const discount = Number(item.discount) || 0;

      const amount = quantity * rate;
      const totalAmount = amount - discount;

      return {
        ...item,
        amount: amount.toFixed(2),
        totalAmount: totalAmount.toFixed(2),
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const updatedItems = calculateItemTotals(formData.quickGRNItems);

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
              }
            : qgrn
        )
      );
      const existingIds = quickGRNItems.filter((qi) => qi.qGRNId === editId).map((qi) => qi.qGRNItemid);
      const updatedItemsData = updatedItems.map((item, index) => ({
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
      }));
      setQuickGRNItems((prev) => [
        ...prev.filter((qi) => qi.qGRNId !== editId),
        ...updatedItemsData,
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
      const newQuickGRNItems = updatedItems.map((item, index) => ({
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
      quickGRNItems: [{ itemId: '', quantity: '', rate: '', receivedQuantity: '', rejectedQuantity: '', discount: '' }],
    });
    setErrors({});
    setIsEditMode(false);
    setEditId(null);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-lg sm:text-xl font-semibold text-brand-secondary mb-4">Quick GRNs</h2>
      <div className="flex flex-col gap-4 sm:gap-6">
        <div>
          <button
            onClick={() => setIsFormVisible(!isFormVisible)}
            className="w-full sm:w-auto bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-red-600 text-xs sm:text-sm"
          >
            {isFormVisible ? 'Hide Form' : 'Manage Quick GRN'}
          </button>
        </div>
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
          <div className="sm:hidden space-y-4">
            {quickGRNs.map((qgrn) => (
              <div key={qgrn.qGRNId} className="p-4 border rounded-md bg-gray-50">
                <div className="space-y-2">
                  <p className="text-xs"><strong>ID:</strong> {qgrn.qGRNId}</p>
                  <p className="text-xs"><strong>Quick GRN No:</strong> {qgrn.qGRNNo}</p>
                  <p className="text-xs"><strong>Quick GRN Date:</strong> {new Date(qgrn.qGRNDate).toLocaleDateString()}</p>
                  <p className="text-xs"><strong>Institute:</strong> {institutes.find((i) => i.id === qgrn.instituteId)?.name || 'N/A'}</p>
                  <p className="text-xs"><strong>Financial Year:</strong> {financialYears.find((fy) => fy.id === qgrn.financialYearId)?.year || 'N/A'}</p>
                  <p className="text-xs"><strong>Vendor:</strong> {vendors.find((v) => v.id === qgrn.vendorId)?.name || 'N/A'}</p>
                </div>
                <div className="flex flex-col space-y-2 mt-2">
                  {actions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => action.onClick && action.onClick(qgrn)}
                      className={`${action.className} w-full text-xs py-1 ${action.render ? 'hidden' : ''}`}
                    >
                      {action.label}
                    </button>
                  ))}
                  <Link
                    to={`/masters/quickgrn/${qgrn.qGRNId}`}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-2 py-1 rounded text-xs w-full text-center"
                  >
                    View Details
                  </Link>
                </div>
                {expandedQGRNId === qgrn.qGRNId && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-brand-secondary mb-2">Quick GRN Items</h4>
                    <div className="space-y-4">
                      {quickGRNItems.filter((qi) => qi.qGRNId === Number(qgrn.qGRNId)).map((qi) => (
                        <div key={qi.qGRNItemid} className="p-4 border rounded-md bg-white">
                          <p className="text-xs"><strong>ID:</strong> {qi.qGRNItemid}</p>
                          <p className="text-xs"><strong>Item:</strong> {items.find((i) => i.id === qi.itemId)?.name || 'N/A'}</p>
                          <p className="text-xs"><strong>Quantity:</strong> {qi.quantity}</p>
                          <p className="text-xs"><strong>Rate:</strong> ₹{parseFloat(qi.rate).toFixed(2)}</p>
                          <p className="text-xs"><strong>Amount:</strong> ₹{parseFloat(qi.amount).toFixed(2)}</p>
                          <p className="text-xs"><strong>Discount:</strong> ₹{parseFloat(qi.discount).toFixed(2)}</p>
                          <p className="text-xs"><strong>Total Amount:</strong> ₹{parseFloat(qi.totalAmount).toFixed(2)}</p>
                          <p className="text-xs"><strong>Received Quantity:</strong> {qi.receivedQuantity}</p>
                          <p className="text-xs"><strong>Rejected Quantity:</strong> {qi.rejectedQuantity}</p>
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
              columns={quickGRNColumns}
              data={quickGRNs}
              actions={actions}
              expandable={{
                expandedRowRender: (row) => {
                  const items = quickGRNItems.filter((qi) => qi.qGRNId === Number(row.qGRNId));
                  console.log('Rendering items for qGRNId:', row.qGRNId, items); // Debug
                  return (
                    <div className="p-4 bg-gray-50">
                      <h4 className="text-sm font-medium text-brand-secondary mb-2">Quick GRN Items</h4>
                      <div className="sm:hidden space-y-4">
                        {items.map((qi) => (
                          <div key={qi.qGRNItemid} className="p-4 border rounded-md bg-white">
                            <p className="text-xs"><strong>ID:</strong> {qi.qGRNItemid}</p>
                            <p className="text-xs"><strong>Item:</strong> {items.find((i) => i.id === qi.itemId)?.name || 'N/A'}</p>
                            <p className="text-xs"><strong>Quantity:</strong> {qi.quantity}</p>
                            <p className="text-xs"><strong>Rate:</strong> ₹{parseFloat(qi.rate).toFixed(2)}</p>
                            <p className="text-xs"><strong>Amount:</strong> ₹{parseFloat(qi.amount).toFixed(2)}</p>
                            <p className="text-xs"><strong>Discount:</strong> ₹{parseFloat(qi.discount).toFixed(2)}</p>
                            <p className="text-xs"><strong>Total Amount:</strong> ₹{parseFloat(qi.totalAmount).toFixed(2)}</p>
                            <p className="text-xs"><strong>Received Quantity:</strong> {qi.receivedQuantity}</p>
                            <p className="text-xs"><strong>Rejected Quantity:</strong> {qi.rejectedQuantity}</p>
                          </div>
                        ))}
                      </div>
                      <div className="hidden sm:block overflow-x-auto">
                        <Table
                          columns={quickGRNItemColumns}
                          data={items}
                          actions={[]}
                          className="text-sm"
                        />
                      </div>
                    </div>
                  );
                },
                rowExpandable: (row) => quickGRNItems.some((qi) => qi.qGRNId === Number(row.qGRNId)),
                expandedRowKeys: expandedQGRNId ? [Number(expandedQGRNId)] : [],
              }}
              className="text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuickGRN;