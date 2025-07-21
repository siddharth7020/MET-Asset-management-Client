import React, { useState, useEffect } from 'react';
import Table from '../components/Table';
import FormInput from '../components/FormInput';
import InvoiceDetails from './InvoiceDetails';
import { getAllInvoices, createInvoice, updateInvoice, getInvoiceById } from '../api/invoiceService';
import { getPurchaseOrders } from '../api/purchaseOrderService';
import axios from '../api/axiosInstance';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

function Invoice() {
  const [invoices, setInvoices] = useState([]);
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [items, setItems] = useState([]);
  const [units, setUnits] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    poId: '',
    invoiceNo: '',
    invoiceDate: '',
    paymentDetails: '',
    OtherAmount: '0.00',
    documents: [],
    existingDocuments: [],
    items: [{
      orderItemId: '',
      itemId: '',
      unitId: '',
      taxPercentage: '',
      quantity: '',
      rate: '',
      discount: '',
      amount: '',
      taxAmount: '',
      totalAmount: ''
    }],
  });
  const [errors, setErrors] = useState({});
  const [editId, setEditId] = useState(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const [currentLayout, setCurrentLayout] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const MySwal = withReactContent(Swal);

  // Fetch data from APIs
  useEffect(() => {
    const fetchData = async () => {
      try {
        const invoiceResponse = await getAllInvoices();
        const invoicesData = Array.isArray(invoiceResponse.data.invoices) ? invoiceResponse.data.invoices : [];
        const invoiceItemsData = invoicesData.flatMap((inv) => inv.items || []);
        setInvoices(invoicesData);
        setInvoiceItems(invoiceItemsData);

        const poResponse = await getPurchaseOrders();
        const poData = Array.isArray(poResponse.data) ? poResponse.data : [];
        setPurchaseOrders(poData);

        const itemsResponse = await axios.get('/items');
        if (Array.isArray(itemsResponse.data.items)) {
          setItems(itemsResponse.data.items);
        } else {
          console.error('Expected items data to be an array, but got:', itemsResponse.data.items);
        }

        const unitsResponse = await axios.get('/units');
        if (Array.isArray(unitsResponse.data.data)) {
          setUnits(unitsResponse.data.data);
        } else {
          console.error('Expected units data to be an array, but got:', unitsResponse.data.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        MySwal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to fetch data. Please try again.',
        });
      }
    };
    fetchData();
  }, []);

  // Fetch order items when poId changes
  useEffect(() => {
    if (formData.poId && !isEditMode) {
      const fetchOrderItems = async () => {
        try {
          const poResponse = await axios.get(`/purchase/${formData.poId}`);
          const orderItemsData = Array.isArray(poResponse.data.orderItems) ? poResponse.data.orderItems : [];
          setOrderItems(orderItemsData);
          setFormData((prev) => ({
            ...prev,
            items: orderItemsData.map((item) => ({
              orderItemId: item.id,
              itemId: item.itemId || '',
              unitId: item.unitId || '',
              quantity: item.quantity || '',
              rate: item.rate || '',
              discount: item.discount || '',
              taxPercentage: '',
              amount: '',
              taxAmount: '',
              totalAmount: ''
            })),
            documents: [],
            existingDocuments: [],
            OtherAmount: '0.00'
          }));
        } catch (error) {
          console.error('Error fetching order items:', error);
          MySwal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to fetch order items. Please try again.',
          });
        }
      };
      fetchOrderItems();
    } else if (!isEditMode) {
      setFormData((prev) => ({
        ...prev,
        items: [{
          orderItemId: '',
          itemId: '',
          unitId: '',
          taxPercentage: '',
          quantity: '',
          rate: '',
          discount: '',
          amount: '',
          taxAmount: '',
          totalAmount: ''
        }],
        documents: [],
        existingDocuments: [],
        OtherAmount: '0.00'
      }));
      setOrderItems([]);
    }
  }, [formData.poId, isEditMode]);

  const filteredInvoices = invoices.filter((invoice) => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    const poNo = purchaseOrders.find((po) => po.poId === invoice.poId)?.poNo?.toLowerCase() || '';
    const invoiceNo = invoice.invoiceNo ? invoice.invoiceNo.toLowerCase() : '';
    const paymentDetails = invoice.paymentDetails ? invoice.paymentDetails.toLowerCase() : '';
    return (
      poNo.includes(searchLower) ||
      invoiceNo.includes(searchLower) ||
      paymentDetails.includes(searchLower)
    );
  });

  // Table columns for Invoice
  const invoiceColumns = [
    { key: 'invoiceNo', label: 'Invoice Number' },
    {
      key: 'poId',
      label: 'PO Number',
      format: (value) => purchaseOrders.find((po) => po.poId === value)?.poNo || 'N/A',
    },
    {
      key: 'invoiceDate',
      label: 'Invoice Date',
      format: (value) => new Date(value).toLocaleDateString('en-GB'),
    },
    {
      key: 'OtherAmount',
      label: 'Other Amount',
      format: (value) => `₹${parseFloat(value).toFixed(2)}`,
    },
    {
      key: 'invoiceAmount',
      label: 'Invoice Amount',
      format: (value) => `₹${parseFloat(value).toFixed(2)}`,
    }
  ];

  // Table actions
  const actions = [
    {
      label: 'Edit',
      onClick: async (row) => {
        try {
          const invoiceResponse = await getInvoiceById(row.id);
          if (!invoiceResponse.data) {
            MySwal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Invoice not found.',
            });
            return;
          }
          const invoice = invoiceResponse.data;
          console.log('Fetched Invoice for Edit:', invoice);
          setIsEditMode(true);
          setEditId(row.id);
          const poResponse = await axios.get(`/purchase/${invoice.poId}`);
          const orderItemsData = poResponse.data.orderItems || [];
          setOrderItems(orderItemsData);
          const updatedFormData = {
            poId: invoice.poId,
            invoiceNo: invoice.invoiceNo,
            invoiceDate: invoice.invoiceDate.split('T')[0],
            paymentDetails: invoice.paymentDetails || '',
            OtherAmount: invoice.OtherAmount || '0.00',
            documents: [],
            existingDocuments: Array.isArray(invoice.document) ? invoice.document : [],
            items: invoice.items.map((item) => ({
              id: item.id,
              orderItemId: item.orderItemId,
              itemId: item.itemId || '',
              unitId: item.unitId || '',
              quantity: item.quantity,
              rate: item.rate,
              discount: item.discount,
              taxPercentage: item.taxPercentage,
              amount: item.amount,
              taxAmount: item.taxAmount,
              totalAmount: item.totalAmount
            })),
          };
          console.log('Form Data for Edit:', updatedFormData);
          setFormData(updatedFormData);
          setIsFormVisible(true);
        } catch (error) {
          console.error('Error fetching invoice:', error);
          MySwal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to fetch invoice details. Please try again.',
          });
        }
      },
      className: 'bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs sm:text-sm',
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

  // Handle file input change for new uploads
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData((prev) => ({
      ...prev,
      documents: files,
    }));
    setErrors((prev) => ({ ...prev, documents: '' }));
  };

  // Remove an existing document
  const removeExistingDocument = (index) => {
    setFormData((prev) => ({
      ...prev,
      existingDocuments: prev.existingDocuments.filter((_, i) => i !== index),
    }));
  };

  // Remove a new document
  const removeNewDocument = (index) => {
    setFormData((prev) => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index),
    }));
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const updatedItems = [...formData.items];
    updatedItems[index] = { ...updatedItems[index], [name]: value };

    if (name === 'orderItemId') {
      const selectedOrderItem = orderItems.find((oi) => oi.id === Number(value));
      updatedItems[index].itemId = selectedOrderItem ? selectedOrderItem.itemId : '';
      updatedItems[index].unitId = selectedOrderItem ? selectedOrderItem.unitId : '';
      updatedItems[index].quantity = selectedOrderItem ? selectedOrderItem.quantity : '';
      updatedItems[index].rate = selectedOrderItem ? selectedOrderItem.rate : '';
      updatedItems[index].discount = selectedOrderItem ? selectedOrderItem.discount : '';
    }

    const quantity = Number(updatedItems[index].quantity) || 0;
    const rate = Number(updatedItems[index].rate) || 0;
    const discount = Number(updatedItems[index].discount) || 0;
    const taxPercentage = Number(updatedItems[index].taxPercentage) || 0;

    const itemSubtotal = quantity * rate;
    const amount = itemSubtotal * (1 - discount / 100);
    const taxAmount = amount * (taxPercentage / 100);
    const totalAmount = amount + taxAmount;

    updatedItems[index].amount = amount.toFixed(2);
    updatedItems[index].taxAmount = taxAmount.toFixed(2);
    updatedItems[index].totalAmount = totalAmount.toFixed(2);

    setFormData((prev) => ({ ...prev, items: updatedItems }));
    setErrors((prev) => ({ ...prev, [`items[${index}].${name}`]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.poId) newErrors.poId = 'Purchase Order is required';
    if (!formData.invoiceDate) newErrors.invoiceDate = 'Invoice date is required';
    if (formData.OtherAmount < 0) newErrors.OtherAmount = 'Other Amount must be non-negative';

    if (!isEditMode && formData.poId && invoices.some((inv) => inv.poId === Number(formData.poId))) {
      newErrors.poId = 'This Purchase Order already has an invoice.';
    }

    formData.items.forEach((item, index) => {
      if (!item.orderItemId) newErrors[`items[${index}].orderItemId`] = 'Order item is required';
      if (!item.itemId) newErrors[`items[${index}].itemId`] = 'Item ID is required';
      if (!item.unitId) newErrors[`items[${index}].unitId`] = 'Unit ID is required';
      if (!item.quantity || item.quantity <= 0) newErrors[`items[${index}].quantity`] = 'Quantity must be positive';
      if (!item.rate || item.rate < 0) newErrors[`items[${index}].rate`] = 'Rate must be non-negative';
      if (item.discount < 0 || item.discount > 100) newErrors[`items[${index}].discount`] = 'Discount must be between 0 and 100%';
      if (!item.taxPercentage || item.taxPercentage < 0 || item.taxPercentage > 100) {
        newErrors[`items[${index}].taxPercentage`] = 'Tax percentage must be between 0 and 100';
      }
    });

    return newErrors;
  };

  const calculateTotals = (items, otherAmount) => {
    let subtotal = 0;
    let totalTax = 0;
    const updatedItems = items.map((item) => {
      const quantity = Number(item.quantity) || 0;
      const rate = Number(item.rate) || 0;
      const discount = Number(item.discount) || 0;
      const taxPercentage = Number(item.taxPercentage) || 0;

      const itemSubtotal = quantity * rate;
      const amount = itemSubtotal * (1 - discount / 100);
      const taxAmount = amount * (taxPercentage / 100);
      const totalAmount = amount + taxAmount;

      return {
        ...item,
        amount: amount.toFixed(2),
        taxAmount: taxAmount.toFixed(2),
        totalAmount: totalAmount.toFixed(2),
      };
    });

    subtotal = updatedItems.reduce((sum, item) => {
      const itemSubtotal = (Number(item.quantity) * Number(item.rate));
      return sum + (itemSubtotal * (1 - Number(item.discount || 0) / 100));
    }, 0);
    totalTax = updatedItems.reduce((sum, item) => sum + Number(item.taxAmount), 0);
    const parsedOtherAmount = Number(otherAmount) || 0;

    return {
      items: updatedItems,
      subtotal: subtotal.toFixed(2),
      totalTax: totalTax.toFixed(2),
      OtherAmount: parsedOtherAmount.toFixed(2),
      invoiceAmount: (subtotal + totalTax + parsedOtherAmount).toFixed(2),
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      if (newErrors.poId === 'This Purchase Order already has an invoice.') {
        MySwal.fire({
          icon: 'error',
          title: 'Invoice Already Exists',
          text: 'This Purchase Order already has an invoice. Please select a different Purchase Order.',
        });
      } else {
        MySwal.fire({
          icon: 'error',
          title: 'Validation Error',
          text: 'Please fill all required fields correctly.',
        });
      }
      return;
    }

    const { items, subtotal, totalTax, OtherAmount, invoiceAmount } = calculateTotals(formData.items, formData.OtherAmount);
    console.log('Calculated Totals:', { items, subtotal, totalTax, OtherAmount, invoiceAmount });

    const formDataToSend = new FormData();
    formDataToSend.append('poId', Number(formData.poId));
    formDataToSend.append('invoiceNo', formData.invoiceNo);
    formDataToSend.append('invoiceDate', formData.invoiceDate);
    formDataToSend.append('paymentDetails', formData.paymentDetails || '');
    formDataToSend.append('OtherAmount', Number(formData.OtherAmount));
    formDataToSend.append('items', JSON.stringify(items.map((item) => ({
      id: item.id || undefined,
      orderItemId: Number(item.orderItemId),
      itemId: Number(item.itemId),
      unitId: item.unitId ? Number(item.unitId) : undefined,
      quantity: Number(item.quantity),
      rate: Number(item.rate),
      discount: Number(item.discount || 0),
      amount: Number(item.amount),
      taxPercentage: Number(item.taxPercentage),
      taxAmount: Number(item.taxAmount),
      totalAmount: Number(item.totalAmount),
    }))));

    formData.documents.forEach((file) => {
      formDataToSend.append('documents', file);
    });

    if (isEditMode && formData.existingDocuments.length > 0) {
      formDataToSend.append('existingDocuments', JSON.stringify(formData.existingDocuments));
    }

    console.log('Submitting FormData:', formDataToSend);

    try {
      if (isEditMode) {
        await updateInvoice(editId, formDataToSend);
        const invoiceResponse = await getInvoiceById(editId);
        console.log('Updated Invoice Response:', invoiceResponse.data);
        if (!invoiceResponse.data) {
          MySwal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Invoice not found.',
          });
          return;
        }
        setInvoices((prev) =>
          prev.map((inv) => (inv.id === editId ? invoiceResponse.data : inv))
        );
        setInvoiceItems((prev) => [
          ...prev.filter((ii) => ii.invoiceId !== editId),
          ...(Array.isArray(invoiceResponse.data.items) ? invoiceResponse.data.items : []),
        ]);
        MySwal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Invoice updated successfully!',
        });
      } else {
        const response = await createInvoice(formDataToSend);
        setInvoices((prev) => [...prev, response.data]);
        setInvoiceItems((prev) => [...prev, ...(Array.isArray(response.data.items) ? response.data.items : [])]);
        MySwal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Invoice created successfully!',
        });
      }
      resetForm();
      setIsFormVisible(false);
    } catch (error) {
      console.error('Error saving invoice:', error);
      MySwal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to save invoice. Please try again.',
      });
    }
  };

  const handleCancel = async () => {
    const hasChanges = Object.values(formData).some(
      (value) =>
        (typeof value === 'string' && value !== '' && value !== '0.00') ||
        (Array.isArray(value) && value.length > 0 && (
          value === formData.items ? value.some((item) => Object.values(item).some((v) => v !== '')) : true
        ))
    );

    if (hasChanges) {
      const result = await MySwal.fire({
        title: 'Are you sure?',
        text: 'You have unsaved changes. Do you want to cancel?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, cancel',
        cancelButtonText: 'No, keep editing',
        reverseButtons: true,
      });

      if (!result.isConfirmed) {
        return;
      }
    }

    resetForm();
    setIsFormVisible(false);
  };

  const resetForm = () => {
    setFormData({
      poId: '',
      invoiceNo: '',
      invoiceDate: '',
      paymentDetails: '',
      OtherAmount: '0.00',
      documents: [],
      existingDocuments: [],
      items: [{
        orderItemId: '',
        itemId: '',
        unitId: '',
        taxPercentage: '',
        quantity: '',
        rate: '',
        discount: '',
        amount: '',
        taxAmount: '',
        totalAmount: ''
      }],
    });
    setErrors({});
    setIsEditMode(false);
    setEditId(null);
    setOrderItems([]);
  };

  const selectedInvoice = invoices.find((inv) => inv.id === selectedInvoiceId);
  const selectedInvoiceItems = invoiceItems.filter((ii) => ii.invoiceId === selectedInvoiceId);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {selectedInvoiceId ? (
        <InvoiceDetails
          invoice={selectedInvoice}
          invoiceItems={selectedInvoiceItems}
          items={items}
          units={units}
          purchaseOrders={purchaseOrders}
          onBack={handleBack}
        />
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-brand-secondary mb-4">Invoice</h2>
            <div className="flex items-center space-x-4">
              <input
                type="text"
                placeholder="Search by PO Number, Invoice Number, or Payment Details"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 border border-gray-300 rounded-md shadow-sm p-2 focus:ring-brand-primary focus:border-brand-primary text-sm"
              />
              <button
                onClick={() => setIsFormVisible(!isFormVisible)}
                className="bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-red-600 text-sm"
              >
                {isFormVisible ? 'Hide Form' : 'Create Invoice'}
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-6 mb-6">
            {isFormVisible && (
              <div>
                <h3 className="text-base sm:text-lg font-medium text-brand-secondary mb-4">
                  {isEditMode ? 'Edit Invoice' : 'Add Invoice'}
                </h3>
                <form onSubmit={handleSubmit} encType="multipart/form-data" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                    {errors.poId && <p className="mt-1 text-xs text-red-600">{errors.poId}</p>}
                  </div>
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
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">Documents</label>
                    <input
                      type="file"
                      name="documents"
                      onChange={handleFileChange}
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-brand-primary focus:border-brand-primary text-xs sm:text-sm"
                    />
                    {formData.documents.length > 0 && (
                      <div className="mt-2">
                        <h4 className="text-xs font-medium text-gray-700">New Documents</h4>
                        <ul className="mt-1 text-xs text-gray-600">
                          {formData.documents.map((file, index) => (
                            <li key={index} className="flex items-center">
                              <span>{file.name}</span>
                              <button
                                type="button"
                                onClick={() => removeNewDocument(index)}
                                className="ml-2 text-red-600 hover:text-red-800 text-xs"
                              >
                                Remove
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {isEditMode && formData.existingDocuments.length > 0 && (
                      <div className="mt-2">
                        <h4 className="text-xs font-medium text-gray-700">Existing Documents</h4>
                        <ul className="mt-1 text-xs text-gray-600">
                          {formData.existingDocuments.map((path, index) => (
                            <li key={index} className="flex items-center">
                              <a href={path} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                {path.split('/').pop()}
                              </a>
                              <button
                                type="button"
                                onClick={() => removeExistingDocument(index)}
                                className="ml-2 text-red-600 hover:text-red-800 text-xs"
                              >
                                Remove
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {errors.documents && <p className="mt-1 text-xs text-red-600">{errors.documents}</p>}
                  </div>
                  <div className="col-span-1 sm:col-span-2 lg:col-span-3">
                    <h4 className="text-sm sm:text-md font-medium text-brand-secondary mb-2">Invoice Items</h4>
                    {formData.items.map((item, index) => (
                      <div key={index} className="flex flex-col gap-4 mb-4 p-4 border rounded-md">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Order Item</label>
                            <select
                              name="orderItemId"
                              value={item.orderItemId}
                              onChange={(e) => handleItemChange(index, e)}
                              className="block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-brand-primary focus:border-brand-primary text-sm"
                              required
                            >
                              <option value="">Select Order Item</option>
                              {orderItems.map((oi) => (
                                <option key={oi.id} value={oi.id}>
                                  {items.find((i) => i.itemId === oi.itemId)?.itemName || 'N/A'}
                                </option>
                              ))}
                            </select>
                            {errors[`items[${index}].orderItemId`] && (
                              <p className="mt-1 text-sm text-red-600">{errors[`items[${index}].orderItemId`]}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Item Name</label>
                            <input
                              type="text"
                              value={items.find((i) => i.itemId === item.itemId)?.itemName || 'N/A'}
                              disabled
                              className="block w-full border border-gray-300 rounded-md shadow-sm px-2 py-2 bg-gray-100 text-sm"
                            />
                            {errors[`items[${index}].itemId`] && (
                              <p className="mt-1 text-sm text-red-600">{errors[`items[${index}].itemId`]}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Unit</label>
                            <input
                              type="text"
                              value={units.find((u) => u.unitId === item.unitId)?.uniteCode || 'N/A'}
                              disabled
                              className="block w-full border border-gray-300 rounded-md shadow-sm px-2 py-2 bg-gray-100 text-sm"
                            />
                            {errors[`items[${index}].unitId`] && (
                              <p className="mt-1 text-sm text-red-600">{errors[`items[${index}].unitId`]}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Quantity</label>
                            <input
                              type="text"
                              value={item.quantity}
                              disabled
                              className="block w-full border border-gray-300 rounded-md shadow-sm px-2 py-2 bg-gray-100 text-sm"
                            />
                            {errors[`items[${index}].quantity`] && (
                              <p className="mt-1 text-sm text-red-600">{errors[`items[${index}].quantity`]}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Rate</label>
                            <input
                              type="text"
                              value={item.rate}
                              disabled
                              className="block w-full border border-gray-300 rounded-md shadow-sm px-2 py-2 bg-gray-100 text-sm"
                            />
                            {errors[`items[${index}].rate`] && (
                              <p className="mt-1 text-sm text-red-600">{errors[`items[${index}].rate`]}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Discount %</label>
                            <input
                              type="text"
                              value={item.discount}
                              disabled
                              className="block w-full border border-gray-300 rounded-md shadow-sm px-2 py-2 bg-gray-100 text-sm"
                            />
                            {errors[`items[${index}].discount`] && (
                              <p className="mt-1 text-sm text-red-600">{errors[`items[${index}].discount`]}</p>
                            )}
                          </div>
                          <FormInput
                            label="Tax Percentage"
                            type="number"
                            name="taxPercentage"
                            value={item.taxPercentage}
                            onChange={(e) => handleItemChange(index, e)}
                            error={errors[`items[${index}].taxPercentage`]}
                            required
                            className="w-full text-xs sm:text-sm"
                            min="0"
                            max="100"
                            step="0.01"
                          />
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Amount</label>
                            <input
                              type="text"
                              value={item.amount}
                              disabled
                              className="block w-full border border-gray-300 rounded-md shadow-sm px-2 py-2 bg-gray-100 text-sm"
                            />
                            {errors[`items[${index}].amount`] && (
                              <p className="mt-1 text-sm text-red-600">{errors[`items[${index}].amount`]}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Tax Amount</label>
                            <input
                              type="text"
                              value={item.taxAmount}
                              disabled
                              className="block w-full border border-gray-300 rounded-md shadow-sm px-2 py-2 bg-gray-100 text-sm"
                            />
                            {errors[`items[${index}].taxAmount`] && (
                              <p className="mt-1 text-sm text-red-600">{errors[`items[${index}].taxAmount`]}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Total Amount</label>
                            <input
                              type="text"
                              value={item.totalAmount}
                              disabled
                              className="block w-full border border-gray-300 rounded-md shadow-sm px-2 py-2 bg-gray-100 text-sm"
                            />
                            {errors[`items[${index}].totalAmount`] && (
                              <p className="mt-1 text-sm text-red-600">{errors[`items[${index}].totalAmount`]}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="flex flex-col gap-4 mb-4 p-4 border rounded-md">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Sub Total</label>
                          <input
                            type="text"
                            value={calculateTotals(formData.items, formData.OtherAmount).subtotal}
                            disabled
                            className="block w-full border border-gray-300 rounded-md shadow-sm px-2 py-2 bg-gray-100 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Tax Total</label>
                          <input
                            type="text"
                            value={calculateTotals(formData.items, formData.OtherAmount).totalTax}
                            disabled
                            className="block w-full border border-gray-300 rounded-md shadow-sm px-2 py-2 bg-gray-100 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Other Amount</label>
                          <input
                            type="number"
                            name="OtherAmount"
                            value={formData.OtherAmount}
                            onChange={handleChange}
                            className="block w-full border border-gray-300 rounded-md shadow-sm px-2 py-2 text-sm"
                            min="0"
                            step="0.01"
                          />
                          {errors.OtherAmount && (
                            <p className="mt-1 text-sm text-red-600">{errors.OtherAmount}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Invoice Amount</label>
                          <input
                            type="text"
                            value={calculateTotals(formData.items, formData.OtherAmount).invoiceAmount}
                            disabled
                            className="block w-full border border-gray-300 rounded-md shadow-sm px-2 py-2 bg-gray-100 text-sm"
                          />
                        </div>
                      </div>
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
                      onClick={handleCancel}
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
                  data={filteredInvoices}
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