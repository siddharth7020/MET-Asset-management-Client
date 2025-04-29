import React, { useState, useEffect } from 'react';
import Table from '../components/Table';
import FormInput from '../components/FormInput';
import InvoiceDetails from './InvoiceDetails';

function Invoice() {
  const [invoices, setInvoices] = useState([]);
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    poId: '',
    invoiceNo: '',
    invoiceDate: '',
    paymentDetails: '',
    items: [{ orderItemId: '', taxPercentage: '', quantity: '', rate: '', discount: '' }],
  });
  const [errors, setErrors] = useState({});
  const [editId, setEditId] = useState(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const [currentLayout, setCurrentLayout] = useState(null);

  // Initialize dummy data
  useEffect(() => {
    const invoicesData = [
      {
        id: 1,
        invoiceNo: 'INV-001',
        poId: 2,
        invoiceDate: '2025-04-16',
        subtotal: 60000.00,
        totalTax: 7800.00,
        invoiceAmount: 67800.00,
        paymentDetails: 'Payment Done',
        paymentDate: null,
        createdAt: '2025-04-24T07:14:41.946Z',
        updatedAt: '2025-04-24T07:14:41.946Z',
      },
    ];
    const invoiceItemsData = [
      {
        id: 1,
        invoiceId: 1,
        orderItemId: 3,
        quantity: 100,
        rate: 100.00,
        discount: 0.00,
        taxPercentage: 18.00,
        taxAmount: 1800.00,
        totalAmount: 11800.00,
        createdAt: '2025-04-24T07:14:41.955Z',
        updatedAt: '2025-04-24T07:14:41.955Z',
      },
      {
        id: 2,
        invoiceId: 1,
        orderItemId: 4,
        quantity: 500,
        rate: 100.00,
        discount: 0.00,
        taxPercentage: 12.00,
        taxAmount: 6000.00,
        totalAmount: 56000.00,
        createdAt: '2025-04-24T07:14:41.955Z',
        updatedAt: '2025-04-24T07:14:41.955Z',
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

    setInvoices(invoicesData);
    setInvoiceItems(invoiceItemsData);
    setPurchaseOrders(purchaseOrdersData);
    setOrderItems(orderItemsData);
  }, []);

  // Table columns for Invoice
  const invoiceColumns = [
    { key: 'id', label: 'ID' },
    { key: 'invoiceNo', label: 'Invoice Number' },
    { key: 'poId', label: 'PO Number', format: (value) => purchaseOrders.find((po) => po.poId === value)?.poNo || 'N/A' },
    { key: 'invoiceDate', label: 'Invoice Date', format: (value) => new Date(value).toLocaleDateString() },
    { key: 'subtotal', label: 'Subtotal', format: (value) => `₹${parseFloat(value).toFixed(2)}` },
    { key: 'totalTax', label: 'Total Tax', format: (value) => `₹${parseFloat(value).toFixed(2)}` },
    { key: 'invoiceAmount', label: 'Invoice Amount', format: (value) => `₹${parseFloat(value).toFixed(2)}` },
    { key: 'paymentDetails', label: 'Payment Details' },
  ];

  // Table actions
  const actions = [
    {
      label: 'Edit',
      onClick: (row) => {
        setIsEditMode(true);
        setEditId(row.id);
        const items = invoiceItems
          .filter((ii) => ii.invoiceId === row.id)
          .map((ii) => ({
            id: ii.id,
            orderItemId: ii.orderItemId,
            quantity: ii.quantity,
            rate: ii.rate,
            discount: ii.discount,
            taxPercentage: ii.taxPercentage,
            taxAmount: ii.taxAmount,
            totalAmount: ii.totalAmount,
          }));
        setFormData({
          id: row.id,
          poId: row.poId,
          invoiceNo: row.invoiceNo,
          invoiceDate: row.invoiceDate.split('T')[0],
          paymentDetails: row.paymentDetails,
          items: items.length > 0 ? items : [{ orderItemId: '', taxPercentage: '', quantity: '', rate: '', discount: '' }],
        });
        setIsFormVisible(true);
      },
      className: 'bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs sm:text-sm',
    },
    {
      label: 'Delete',
      onClick: (row) => {
        if (window.confirm(`Delete Invoice ${row.invoiceNo}?`)) {
          setInvoices((prev) => prev.filter((inv) => inv.id !== row.id));
          setInvoiceItems((prev) => prev.filter((ii) => ii.invoiceId !== row.id));
          resetForm();
        }
      },
      className: 'bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs sm:text-sm',
    },
  ];

  // Handle row click to show details
  const handleRowClick = (row) => {
    setSelectedInvoiceId(row.id);
  setCurrentLayout('details');
  };

  // Handle back to table view
  const handleBack = () => {
    setSelectedInvoiceId(null);
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
    const updatedItems = [...formData.items];
    updatedItems[index] = { ...updatedItems[index], [name]: value };

    // Calculate taxAmount and totalAmount
    const quantity = Number(updatedItems[index].quantity) || 0;
    const rate = Number(updatedItems[index].rate) || 0;
    const discount = Number(updatedItems[index].discount) || 0;
    const taxPercentage = Number(updatedItems[index].taxPercentage) || 0;

    const baseAmount = quantity * rate - discount;
    const taxAmount = baseAmount * (taxPercentage / 100);
    const totalAmount = baseAmount + taxAmount;

    updatedItems[index].taxAmount = taxAmount.toFixed(2);
    updatedItems[index].totalAmount = totalAmount.toFixed(2);

    setFormData((prev) => ({ ...prev, items: updatedItems }));
    setErrors((prev) => ({ ...prev, [`items[${index}].${name}`]: '' }));
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { orderItemId: '', taxPercentage: '', quantity: '', rate: '', discount: '', taxAmount: '', totalAmount: '' }],
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length === 1) {
      alert('At least one invoice item is required');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.poId) newErrors.poId = 'Purchase Order is required';
    if (!formData.invoiceNo) newErrors.invoiceNo = 'Invoice number is required';
    else if (invoices.some((inv) => inv.invoiceNo === formData.invoiceNo && inv.id !== editId)) {
      newErrors.invoiceNo = 'Invoice number must be unique';
    }
    if (!formData.invoiceDate) newErrors.invoiceDate = 'Invoice date is required';

    formData.items.forEach((item, index) => {
      if (!item.orderItemId) newErrors[`items[${index}].orderItemId`] = 'Order item is required';
      if (!item.quantity || item.quantity <= 0) newErrors[`items[${index}].quantity`] = 'Quantity must be positive';
      if (!item.rate || item.rate < 0) newErrors[`items[${index}].rate`] = 'Rate must be non-negative';
      if (item.discount < 0) newErrors[`items[${index}].discount`] = 'Discount cannot be negative';
      if (!item.taxPercentage || item.taxPercentage < 0 || item.taxPercentage > 100) {
        newErrors[`items[${index}].taxPercentage`] = 'Tax percentage must be between 0 and 100';
      }
    });

    return newErrors;
  };

  const calculateTotals = (items) => {
    let subtotal = 0;
    let totalTax = 0;
    const updatedItems = items.map((item) => {
      const quantity = Number(item.quantity) || 0;
      const rate = Number(item.rate) || 0;
      const discount = Number(item.discount) || 0;
      const taxPercentage = Number(item.taxPercentage) || 0;

      const baseAmount = quantity * rate - discount;
      const taxAmount = baseAmount * (taxPercentage / 100);
      const totalAmount = baseAmount + taxAmount;

      subtotal += baseAmount;
      totalTax += taxAmount;

      return {
        ...item,
        taxAmount: taxAmount.toFixed(2),
        totalAmount: totalAmount.toFixed(2),
      };
    });

    return {
      items: updatedItems,
      subtotal: subtotal.toFixed(2),
      totalTax: totalTax.toFixed(2),
      invoiceAmount: (subtotal + totalTax).toFixed(2),
    };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const { items, subtotal, totalTax, invoiceAmount } = calculateTotals(formData.items);

    if (isEditMode) {
      setInvoices((prev) =>
        prev.map((inv) =>
          inv.id === editId
            ? {
                ...formData,
                id: editId,
                poId: Number(formData.poId),
                subtotal,
                totalTax,
                invoiceAmount,
                updatedAt: new Date().toISOString(),
              }
            : inv
        )
      );
      const existingIds = invoiceItems.filter((ii) => ii.invoiceId === editId).map((ii) => ii.id);
      const updatedItems = items.map((item, index) => ({
        id: item.id || existingIds[index] || Math.max(...invoiceItems.map((i) => i.id), 0) + index + 1,
        invoiceId: editId,
        orderItemId: Number(item.orderItemId),
        quantity: Number(item.quantity),
        rate: Number(item.rate),
        discount: Number(item.discount),
        taxPercentage: Number(item.taxPercentage),
        taxAmount: Number(item.taxAmount),
        totalAmount: Number(item.totalAmount),
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      setInvoiceItems((prev) => [
        ...prev.filter((ii) => ii.invoiceId !== editId),
        ...updatedItems,
      ]);
    } else {
      const newInvoiceId = Math.max(...invoices.map((inv) => inv.id), 0) + 1;
      setInvoices((prev) => [
        ...prev,
        {
          ...formData,
          id: newInvoiceId,
          poId: Number(formData.poId),
          subtotal,
          totalTax,
          invoiceAmount,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);
      const newInvoiceItems = items.map((item, index) => ({
        id: Math.max(...invoiceItems.map((i) => i.id), 0) + index + 1,
        invoiceId: newInvoiceId,
        orderItemId: Number(item.orderItemId),
        quantity: Number(item.quantity),
        rate: Number(item.rate),
        discount: Number(item.discount),
        taxPercentage: Number(item.taxPercentage),
        taxAmount: Number(item.taxAmount),
        totalAmount: Number(item.totalAmount),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      setInvoiceItems((prev) => [...prev, ...newInvoiceItems]);
    }

    resetForm();
    setIsFormVisible(false);
  };

  const resetForm = () => {
    setFormData({
      id: '',
      poId: '',
      invoiceNo: '',
      invoiceDate: '',
      paymentDetails: '',
      items: [{ orderItemId: '', taxPercentage: '', quantity: '', rate: '', discount: '', taxAmount: '', totalAmount: '' }],
    });
    setErrors({});
    setIsEditMode(false);
    setEditId(null);
  };

  // Get selected invoice data
  const selectedInvoice = invoices.find((inv) => inv.id === selectedInvoiceId);
  const selectedInvoiceItems = invoiceItems.filter((ii) => ii.invoiceId === selectedInvoiceId);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {selectedInvoiceId ? (
        <InvoiceDetails
          invoice={selectedInvoice}
          invoiceItems={selectedInvoiceItems}
          purchaseOrders={purchaseOrders}
          orderItems={orderItems}
          onBack={handleBack}
        />
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-brand-secondary mb-4">Invoices</h2>
            <div>
              <button
                onClick={() => setIsFormVisible(!isFormVisible)}
                className="bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-red-600"
              >
                {isFormVisible ? 'Hide Form' : 'Add Invoice'}
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-6 mb-6">
            {isFormVisible && (
              <div>
                <h3 className="text-base sm:text-lg font-medium text-brand-secondary mb-4">
                  {isEditMode ? 'Edit Invoice' : 'Add Invoice'}
                </h3>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <FormInput
                    label="Invoice ID"
                    type="text"
                    name="id"
                    value={formData.id}
                    onChange={handleChange}
                    disabled
                    required={false}
                    className="w-full text-xs sm:text-sm"
                  />
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">Purchase Order</label>
                    <select
                      name="poId"
                      value={formData.poId}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-brand-primary focus:border-brand-primary text-xs sm:text-sm"
                      required
                    >
                      <option value="">Select PO</option>
                      {purchaseOrders.map((po) => (
                        <option key={po.poId} value={po.poId}>
                          {po.poNo}
                        </option>
                      ))}
                    </select>
                    
                  </div>
                  <FormInput
                    label="Invoice Number"
                    type="text"
                    name="invoiceNo"
                    value={formData.invoiceNo}
                    onChange={handleChange}
                    error={errors.invoiceNo}
                    required
                    className="w-full text-xs sm:text-sm"
                  />
                  <FormInput
                    label="Invoice Date"
                    type="date"
                    name="invoiceDate"
                    value={formData.invoiceDate}
                    onChange={handleChange}
                    error={errors.invoiceDate}
                    required
                    className="w-full text-xs sm:text-sm"
                  />
                  <FormInput
                    label="Payment Details"
                    type="text"
                    name="paymentDetails"
                    value={formData.paymentDetails}
                    onChange={handleChange}
                    error={errors.paymentDetails}
                    required={false}
                    className="w-full text-xs sm:text-sm"
                  />
                  <div className="col-span-1 sm:col-span-2 lg:col-span-3">
                    <h4 className="text-sm sm:text-md font-medium text-brand-secondary mb-2">Invoice Items</h4>
                    {formData.items.map((item, index) => (
                      <div key={index} className="flex flex-col gap-4 mb-4 p-4 border rounded-md">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700">Order Item</label>
                            <select
                              name="orderItemId"
                              value={item.orderItemId}
                              onChange={(e) => handleItemChange(index, e)}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-brand-primary focus:border-brand-primary text-xs sm:text-sm"
                              required
                            >
                              <option value="">Select Item</option>
                              {orderItems
                                .filter((oi) => oi.poId === Number(formData.poId))
                                .map((oi) => (
                                  <option key={oi.id} value={oi.id}>
                                    {oi.itemName}
                                  </option>
                                ))}
                            </select>
                            {errors[`items[${index}].orderItemId`] && (
                              <p className="mt-1 text-xs text-red-600">{errors[`items[${index}].orderItemId`]}</p>
                            )}
                          </div>
                          <FormInput
                            label="Quantity"
                            type="number"
                            name="quantity"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, e)}
                            error={errors[`items[${index}].quantity`]}
                            required
                            className="w-full text-xs sm:text-sm"
                          />
                          <FormInput
                            label="Rate"
                            type="number"
                            name="rate"
                            value={item.rate}
                            onChange={(e) => handleItemChange(index, e)}
                            error={errors[`items[${index}].rate`]}
                            required
                            className="w-full text-xs sm:text-sm"
                          />
                          <FormInput
                            label="Discount"
                            type="number"
                            name="discount"
                            value={item.discount}
                            onChange={(e) => handleItemChange(index, e)}
                            error={errors[`items[${index}].discount`]}
                            required={false}
                            className="w-full text-xs sm:text-sm"
                          />
                          <FormInput
                            label="Tax Percentage"
                            type="number"
                            name="taxPercentage"
                            value={item.taxPercentage}
                            onChange={(e) => handleItemChange(index, e)}
                            error={errors[`items[${index}].taxPercentage`]}
                            required
                            className="w-full text-xs sm:text-sm"
                          />
                          <FormInput
                            label="Tax Amount"
                            type="text"
                            name="taxAmount"
                            value={item.taxAmount}
                            disabled
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
                      Add Invoice Item
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
                <InvoiceDetails />
              ) : (
                <Table
                  columns={invoiceColumns}
                  data={invoices}
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

export default Invoice;