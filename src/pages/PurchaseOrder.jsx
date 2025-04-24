import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Table from '../components/Table';
import FormInput from '../components/FormInput';

function PurchaseOrder() {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [institutes, setInstitutes] = useState([]);
  const [financialYears, setFinancialYears] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [items, setItems] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    poId: '',
    poDate: '',
    poNo: '',
    instituteId: '',
    financialYearId: '',
    vendorId: '',
    document: '',
    requestedBy: '',
    remark: '',
    orderItems: [{ itemId: '', quantity: '', rate: '', amount: '', discount: '', totalAmount: '' }],
  });
  const [errors, setErrors] = useState({});
  const [editId, setEditId] = useState(null);
  const [expandedPoId, setExpandedPoId] = useState(null);

  // Initialize with dummy data
  useEffect(() => {
    setPurchaseOrders([
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
    ]);
    setOrderItems([
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
    ]);
    setInstitutes([
      { instituteId: 1, instituteName: 'Central University', intituteCode: 'CU001' },
      { instituteId: 2, instituteName: 'State College', intituteCode: 'SC002' },
      { instituteId: 3, instituteName: 'Tech Institute', intituteCode: 'TI003' },
    ]);
    setFinancialYears([
      {
        financialYearId: 1,
        year: '2023-2024',
        startDate: '2023-04-01',
        endDate: '2024-03-31',
      },
      {
        financialYearId: 2,
        year: '2024-2025',
        startDate: '2024-04-01',
        endDate: '2025-03-31',
      },
      {
        financialYearId: 3,
        year: '2025-2026',
        startDate: '2025-04-01',
        endDate: '2026-03-31',
      },
    ]);
    setVendors([
      {
        vendorId: 1,
        name: 'John Doe',
        companyName: 'ABC Supplies',
        email: 'john@abcsupplies.com',
      },
      {
        vendorId: 2,
        name: 'Jane Smith',
        companyName: 'XYZ Traders',
        email: 'jane@xyztraders.com',
      },
    ]);
    setItems([
      {
        itemId: 1,
        itemName: 'Laptop',
        itemCategory: 1,
        unit: 1,
        remark: 'High-performance laptop',
      },
      {
        itemId: 2,
        itemName: 'Office Chair',
        itemCategory: 2,
        unit: 1,
        remark: 'Ergonomic chair',
      },
      {
        itemId: 3,
        itemName: 'Notebook',
        itemCategory: 3,
        unit: 1,
        remark: 'A4 size notebook',
      },
    ]);
  }, []);

  // Table columns for PurchaseOrder
  const poColumns = [
    { key: 'poId', label: 'ID' },
    {
      key: 'poDate',
      label: 'Date',
      format: (value) => new Date(value).toLocaleDateString(),
    },
    { key: 'poNo', label: 'PO Number' },
    {
      key: 'instituteId',
      label: 'Institute',
      format: (value) => institutes.find((inst) => inst.instituteId === value)?.instituteName || 'N/A',
    },
    {
      key: 'financialYearId',
      label: 'Financial Year',
      format: (value) => financialYears.find((fy) => fy.financialYearId === value)?.year || 'N/A',
    },
    {
      key: 'vendorId',
      label: 'Vendor',
      format: (value) => vendors.find((v) => v.vendorId === value)?.name || 'N/A',
    },
    { key: 'requestedBy', label: 'Requested By' },
    { key: 'remark', label: 'Remark' },
  ];

  // Table columns for OrderItem (in collapsible section)
  const orderItemColumns = [
    { key: 'id', label: 'ID' },
    {
      key: 'itemId',
      label: 'Item',
      format: (value) => items.find((item) => item.itemId === value)?.itemName || 'N/A',
    },
    { key: 'quantity', label: 'Quantity' },
    { key: 'rate', label: 'Rate' },
    { key: 'amount', label: 'Amount' },
    { key: 'discount', label: 'Discount' },
    { key: 'totalAmount', label: 'Total Amount' },
  ];

  // Table actions
  const actions = [
    {
      label: 'Edit',
      onClick: (row) => {
        setIsEditMode(true);
        setEditId(row.poId);
        const poItems = orderItems
          .filter((oi) => oi.poId === row.poId)
          .map((oi) => ({
            id: oi.id,
            itemId: oi.itemId,
            quantity: oi.quantity,
            rate: oi.rate,
            amount: oi.amount,
            discount: oi.discount,
            totalAmount: oi.totalAmount,
          }));
        setFormData({
          poId: row.poId,
          poDate: row.poDate.split('T')[0],
          poNo: row.poNo,
          instituteId: row.instituteId,
          financialYearId: row.financialYearId,
          vendorId: row.vendorId,
          document: row.document,
          requestedBy: row.requestedBy,
          remark: row.remark,
          orderItems: poItems.length > 0 ? poItems : [{ itemId: '', quantity: '', rate: '', amount: '', discount: '', totalAmount: '' }],
        });
        setIsFormVisible(true);
      },
      className: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      label: 'Delete',
      onClick: (row) => {
        if (window.confirm(`Delete purchase order ${row.poNo}?`)) {
          setPurchaseOrders((prev) => prev.filter((po) => po.poId !== row.poId));
          setOrderItems((prev) => prev.filter((oi) => oi.poId !== row.poId));
          resetForm();
        }
      },
      className: 'bg-red-500 hover:bg-red-600',
    },
    {
      label: 'View Items',
      onClick: (row) => {
        setExpandedPoId(expandedPoId === row.poId ? null : row.poId);
      },
      className: 'bg-green-500 hover:bg-green-600',
    },
    {
      label: 'View Details',
      onClick: () => null, // Handled by Link
      className: 'bg-purple-500 hover:bg-purple-600',
      render: (row) => (
        <Link
          to={`/masters/purchase-order/${row.poId}`}
          className="bg-purple-500 hover:bg-purple-600 text-white px-2 py-1 rounded"
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

  const handleOrderItemChange = (index, e) => {
    const { name, value } = e.target;
    const updatedOrderItems = [...formData.orderItems];
    updatedOrderItems[index] = { ...updatedOrderItems[index], [name]: value };

    // Calculate amount and totalAmount
    const quantity = parseFloat(updatedOrderItems[index].quantity) || 0;
    const rate = parseFloat(updatedOrderItems[index].rate) || 0;
    const discount = parseFloat(updatedOrderItems[index].discount) || 0;
    const amount = quantity * rate;
    const totalAmount = amount - discount;

    updatedOrderItems[index].amount = amount.toFixed(2);
    updatedOrderItems[index].totalAmount = totalAmount.toFixed(2);

    setFormData((prev) => ({ ...prev, orderItems: updatedOrderItems }));
    setErrors((prev) => ({ ...prev, [`orderItems[${index}].${name}`]: '' }));
  };

  const addOrderItem = () => {
    setFormData((prev) => ({
      ...prev,
      orderItems: [...prev.orderItems, { itemId: '', quantity: '', rate: '', amount: '', discount: '', totalAmount: '' }],
    }));
  };

  const removeOrderItem = (index) => {
    if (formData.orderItems.length === 1) {
      alert('At least one order item is required');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      orderItems: prev.orderItems.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.poDate) newErrors.poDate = 'PO date is required';
    if (!formData.poNo) newErrors.poNo = 'PO number is required';
    else if (purchaseOrders.some((po) => po.poNo === formData.poNo && po.poId !== editId)) {
      newErrors.poNo = 'PO number must be unique';
    }
    if (!formData.instituteId) newErrors.instituteId = 'Institute is required';
    if (!formData.financialYearId) newErrors.financialYearId = 'Financial year is required';
    if (!formData.vendorId) newErrors.vendorId = 'Vendor is required';
    if (!formData.requestedBy) newErrors.requestedBy = 'Requested by is required';

    formData.orderItems.forEach((oi, index) => {
      if (!oi.itemId) newErrors[`orderItems[${index}].itemId`] = 'Item is required';
      if (!oi.quantity || oi.quantity < 0) newErrors[`orderItems[${index}].quantity`] = 'Quantity must be non-negative';
      if (!oi.rate || oi.rate < 0) newErrors[`orderItems[${index}].rate`] = 'Rate must be non-negative';
      if (oi.discount < 0) newErrors[`orderItems[${index}].discount`] = 'Discount must be non-negative';
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
      // Update PurchaseOrder
      setPurchaseOrders((prev) =>
        prev.map((po) =>
          po.poId === editId
            ? { ...formData, poId: editId, instituteId: Number(formData.instituteId), financialYearId: Number(formData.financialYearId), vendorId: Number(formData.vendorId) }
            : po
        )
      );
      // Update OrderItems
      const existingIds = orderItems.filter((oi) => oi.poId === editId).map((oi) => oi.id);
      const updatedItems = formData.orderItems.map((oi, index) => ({
        id: oi.id || existingIds[index] || Math.max(...orderItems.map((o) => o.id), 0) + index + 1,
        poId: editId,
        itemId: Number(oi.itemId),
        quantity: Number(oi.quantity),
        rate: Number(oi.rate),
        amount: Number(oi.amount),
        discount: Number(oi.discount),
        totalAmount: Number(oi.totalAmount),
      }));
      setOrderItems((prev) => [
        ...prev.filter((oi) => oi.poId !== editId),
        ...updatedItems,
      ]);
    } else {
      // Add new PurchaseOrder
      const newPoId = Math.max(...purchaseOrders.map((po) => po.poId), 0) + 1;
      setPurchaseOrders((prev) => [
        ...prev,
        {
          ...formData,
          poId: newPoId,
          instituteId: Number(formData.instituteId),
          financialYearId: Number(formData.financialYearId),
          vendorId: Number(formData.vendorId),
        },
      ]);
      // Add new OrderItems
      const newOrderItems = formData.orderItems.map((oi, index) => ({
        id: Math.max(...orderItems.map((o) => o.id), 0) + index + 1,
        poId: newPoId,
        itemId: Number(oi.itemId),
        quantity: Number(oi.quantity),
        rate: Number(oi.rate),
        amount: Number(oi.amount),
        discount: Number(oi.discount),
        totalAmount: Number(oi.totalAmount),
      }));
      setOrderItems((prev) => [...prev, ...newOrderItems]);
    }

    resetForm();
    setIsFormVisible(false);
  };

  const resetForm = () => {
    setFormData({
      poId: '',
      poDate: '',
      poNo: '',
      instituteId: '',
      financialYearId: '',
      vendorId: '',
      document: '',
      requestedBy: '',
      remark: '',
      orderItems: [{ itemId: '', quantity: '', rate: '', amount: '', discount: '', totalAmount: '' }],
    });
    setErrors({});
    setIsEditMode(false);
    setEditId(null);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className='flex justify-between items-center mb-4'>
        <h2 className="text-2xl font-semibold text-brand-secondary mb-4">Purchase Orders</h2>
        <div>
          <button
            onClick={() => setIsFormVisible(!isFormVisible)}
            className="bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-red-600"
          >
            {isFormVisible ? 'Hide Form' : 'Manage Purchase Order'}
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-6 mb-6">

        {isFormVisible && (
          <div>
            <h3 className="text-base sm:text-lg font-medium text-brand-secondary mb-4">
              {isEditMode ? 'Edit Purchase Order' : 'Add Purchase Order'}
            </h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <FormInput
                label="PO ID"
                type="text"
                name="poId"
                value={formData.poId}
                onChange={handleChange}
                disabled
                required={false}
                className="w-full text-xs sm:text-sm"
              />
              <FormInput
                label="PO Date"
                type="date"
                name="poDate"
                value={formData.poDate}
                onChange={handleChange}
                error={errors.poDate}
                required
                className="w-full text-xs sm:text-sm"
              />
              <FormInput
                label="PO Number"
                type="text"
                name="poNo"
                value={formData.poNo}
                onChange={handleChange}
                error={errors.poNo}
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
                    <option key={inst.instituteId} value={inst.instituteId}>
                      {inst.instituteName}
                    </option>
                  ))}
                </select>
                {errors.instituteId && <p className="mt-1 text-xs text-red-600">{errors.instituteId}</p>}
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
                    <option key={fy.financialYearId} value={fy.financialYearId}>
                      {fy.year}
                    </option>
                  ))}
                </select>
                {errors.financialYearId && <p className="mt-1 text-xs text-red-600">{errors.financialYearId}</p>}
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
                  {vendors.map((v) => (
                    <option key={v.vendorId} value={v.vendorId}>
                      {v.name}
                    </option>
                  ))}
                </select>
                {errors.vendorId && <p className="mt-1 text-xs text-red-600">{errors.vendorId}</p>}
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
                <h4 className="text-sm sm:text-md font-medium text-brand-secondary mb-2">Order Items</h4>
                {formData.orderItems.map((oi, index) => (
                  <div key={index} className="flex flex-col gap-4 mb-4 p-4 border rounded-md">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700">Item</label>
                        <select
                          name="itemId"
                          value={oi.itemId}
                          onChange={(e) => handleOrderItemChange(index, e)}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-brand-primary focus:border-brand-primary text-xs sm:text-sm"
                          required
                        >
                          <option value="">Select Item</option>
                          {items.map((item) => (
                            <option key={item.itemId} value={item.itemId}>
                              {item.itemName}
                            </option>
                          ))}
                        </select>
                        {errors[`orderItems[${index}].itemId`] && <p className="mt-1 text-xs text-red-600">{errors[`orderItems[${index}].itemId`]}</p>}
                      </div>
                      <FormInput
                        label="Quantity"
                        type="number"
                        name="quantity"
                        value={oi.quantity}
                        onChange={(e) => handleOrderItemChange(index, e)}
                        error={errors[`orderItems[${index}].quantity`]}
                        required
                        className="w-full text-xs sm:text-sm"
                      />
                      <FormInput
                        label="Rate"
                        type="number"
                        name="rate"
                        value={oi.rate}
                        onChange={(e) => handleOrderItemChange(index, e)}
                        error={errors[`orderItems[${index}].rate`]}
                        required
                        className="w-full text-xs sm:text-sm"
                      />
                      <FormInput
                        label="Amount"
                        type="text"
                        name="amount"
                        value={oi.amount}
                        disabled
                        required={false}
                        className="w-full text-xs sm:text-sm"
                      />
                      <FormInput
                        label="Discount"
                        type="number"
                        name="discount"
                        value={oi.discount}
                        onChange={(e) => handleOrderItemChange(index, e)}
                        error={errors[`orderItems[${index}].discount`]}
                        required={false}
                        className="w-full text-xs sm:text-sm"
                      />
                      <FormInput
                        label="Total Amount"
                        type="text"
                        name="totalAmount"
                        value={oi.totalAmount}
                        disabled
                        required={false}
                        className="w-full text-xs sm:text-sm"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeOrderItem(index)}
                      className="text-red-600 hover:text-red-800 text-xs sm:text-sm mt-2"
                    >
                      Remove Item
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addOrderItem}
                  className="w-full sm:w-auto bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 text-xs sm:text-sm"
                >
                  Add Order Item
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
                  onClick={() => { resetForm(); setIsFormVisible(false); }}
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
            columns={poColumns}
            data={purchaseOrders}
            actions={actions}
            expandable={{
              expandedRowRender: (row) => (
                <div className="p-4 bg-gray-50">
                  <h4 className="text-md font-medium text-brand-secondary mb-2">Order Items</h4>
                  <Table
                    columns={orderItemColumns}
                    data={orderItems.filter((oi) => oi.poId === row.poId)}
                    actions={[]}
                  />
                </div>
              ),
              rowExpandable: (row) => orderItems.some((oi) => oi.poId === row.poId),
              expandedRowKeys: expandedPoId ? [expandedPoId] : [],
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default PurchaseOrder;