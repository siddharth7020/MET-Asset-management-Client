import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Table from '../components/Table';
import FormInput from '../components/FormInput';

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
  const [expandedInvoiceId, setExpandedInvoiceId] = useState(null);

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
    console.log('Invoices:', invoicesData, 'InvoiceItems:', invoiceItemsData); // Debug
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
    { key: 'paymentDetails', label: 'Payment Details', className: 'hidden sm:table-cell' },
  ];

  // Table columns for InvoiceItem
  const invoiceItemColumns = [
    { key: 'id', label: 'ID' },
    { key: 'orderItemId', label: 'Item', format: (value) => orderItems.find((oi) => oi.id === value)?.itemName || 'N/A' },
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
    {
      label: 'View Items',
      onClick: (row) => {
        console.log('Toggling items for invoiceId:', row.id); // Debug
        setExpandedInvoiceId(expandedInvoiceId === row.id ? null : row.id);
      },
      className: 'bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs sm:text-sm',
    },
    {
      label: 'View Details',
      className: 'bg-purple-500 hover:bg-purple-600 text-white px-2 py-1 rounded text-xs sm:text-sm',
      render: (row) => (
        <Link
          to={`/masters/invoice/${row.id}`}
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
    const updatedItems = [...formData.items];
    updatedItems[index] = { ...updatedItems[index], [name]: value };
    setFormData((prev) => ({ ...prev, items: updatedItems }));
    setErrors((prev) => ({ ...prev, [`items[${index}].${name}`]: '' }));
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { orderItemId: '', taxPercentage: '', quantity: '', rate: '', discount: '' }],
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
      items: [{ orderItemId: '', taxPercentage: '', quantity: '', rate: '', discount: '' }],
    });
    setErrors({});
    setIsEditMode(false);
    setEditId(null);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className='flex justify-between items-center mb-4'>
        <h2 className="text-lg sm:text-xl font-semibold text-brand-secondary mb-4">Invoices</h2>
        <div>
          <button
            onClick={() => setIsFormVisible(!isFormVisible)}
            className="w-full sm:w-auto bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-red-600 text-xs sm:text-sm"
          >
            {isFormVisible ? 'Hide Form' : 'Manage Invoice'}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:gap-6">

        {isFormVisible && (
          <div>
            <h3 className="text-base sm:text-lg font-medium text-brand-secondary mb-4">
              {isEditMode ? 'Edit Invoice' : 'Add Invoice'}
            </h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                {errors.poId && (
                  <p className="mt-1 text-xs text-red-600">{errors.poId}</p>
                )}
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
          <div className="sm:hidden space-y-4">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="p-4 border rounded-md bg-gray-50">
                <div className="space-y-2">
                  <p className="text-xs"><strong>ID:</strong> {invoice.id}</p>
                  <p className="text-xs"><strong>Invoice Number:</strong> {invoice.invoiceNo}</p>
                  <p className="text-xs"><strong>PO Number:</strong> {purchaseOrders.find((po) => po.poId === invoice.poId)?.poNo || 'N/A'}</p>
                  <p className="text-xs"><strong>Invoice Date:</strong> {new Date(invoice.invoiceDate).toLocaleDateString()}</p>
                  <p className="text-xs"><strong>Subtotal:</strong> ₹{parseFloat(invoice.subtotal).toFixed(2)}</p>
                  <p className="text-xs"><strong>Total Tax:</strong> ₹{parseFloat(invoice.totalTax).toFixed(2)}</p>
                  <p className="text-xs"><strong>Invoice Amount:</strong> ₹{parseFloat(invoice.invoiceAmount).toFixed(2)}</p>
                </div>
                <div className="flex flex-col space-y-2 mt-2">
                  {actions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => action.onClick && action.onClick(invoice)}
                      className={`${action.className} w-full text-xs py-1 ${action.render ? 'hidden' : ''}`}
                    >
                      {action.label}
                    </button>
                  ))}
                  <Link
                    to={`/masters/invoice/${invoice.id}`}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-2 py-1 rounded text-xs w-full text-center"
                  >
                    View Details
                  </Link>
                </div>
                {expandedInvoiceId === invoice.id && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-brand-secondary mb-2">Invoice Items</h4>
                    <div className="space-y-4">
                      {invoiceItems.filter((ii) => ii.invoiceId === Number(invoice.id)).map((ii) => (
                        <div key={ii.id} className="p-4 border rounded-md bg-white">
                          <p className="text-xs"><strong>ID:</strong> {ii.id}</p>
                          <p className="text-xs"><strong>Item:</strong> {orderItems.find((oi) => oi.id === ii.orderItemId)?.itemName || 'N/A'}</p>
                          <p className="text-xs"><strong>Quantity:</strong> {ii.quantity}</p>
                          <p className="text-xs"><strong>Rate:</strong> ₹{parseFloat(ii.rate).toFixed(2)}</p>
                          <p className="text-xs"><strong>Discount:</strong> ₹{parseFloat(ii.discount).toFixed(2)}</p>
                          <p className="text-xs"><strong>Tax %:</strong> {parseFloat(ii.taxPercentage).toFixed(2)}%</p>
                          <p className="text-xs"><strong>Tax Amount:</strong> ₹{parseFloat(ii.taxAmount).toFixed(2)}</p>
                          <p className="text-xs"><strong>Total Amount:</strong> ₹{parseFloat(ii.totalAmount).toFixed(2)}</p>
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
              columns={invoiceColumns}
              data={invoices}
              actions={actions}
              expandable={{
                expandedRowRender: (row) => {
                  const items = invoiceItems.filter((ii) => ii.invoiceId === Number(row.id));
                  console.log('Rendering items for invoiceId:', row.id, items); // Debug
                  return (
                    <div className="p-4 bg-gray-50">
                      <h4 className="text-sm font-medium text-brand-secondary mb-2">Invoice Items</h4>
                      <div className="sm:hidden space-y-4">
                        {items.map((ii) => (
                          <div key={ii.id} className="p-4 border rounded-md bg-white">
                            <p className="text-xs"><strong>ID:</strong> {ii.id}</p>
                            <p className="text-xs"><strong>Item:</strong> {orderItems.find((oi) => oi.id === ii.orderItemId)?.itemName || 'N/A'}</p>
                            <p className="text-xs"><strong>Quantity:</strong> {ii.quantity}</p>
                            <p className="text-xs"><strong>Rate:</strong> ₹{parseFloat(ii.rate).toFixed(2)}</p>
                            <p className="text-xs"><strong>Discount:</strong> ₹{parseFloat(ii.discount).toFixed(2)}</p>
                            <p className="text-xs"><strong>Tax %:</strong> {parseFloat(ii.taxPercentage).toFixed(2)}%</p>
                            <p className="text-xs"><strong>Tax Amount:</strong> ₹{parseFloat(ii.taxAmount).toFixed(2)}</p>
                            <p className="text-xs"><strong>Total Amount:</strong> ₹{parseFloat(ii.totalAmount).toFixed(2)}</p>
                          </div>
                        ))}
                      </div>
                      <div className="hidden sm:block overflow-x-auto">
                        <Table
                          columns={invoiceItemColumns}
                          data={items}
                          actions={[]}
                          className="text-sm"
                        />
                      </div>
                    </div>
                  );
                },
                rowExpandable: (row) => invoiceItems.some((ii) => ii.invoiceId === Number(row.id)),
                expandedRowKeys: expandedInvoiceId ? [Number(expandedInvoiceId)] : [],
              }}
              className="text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Invoice;