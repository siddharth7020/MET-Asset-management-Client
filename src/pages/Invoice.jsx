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
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
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

  const MySwal = withReactContent(Swal);

  // Fetch data from APIs
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch invoices
        const invoiceResponse = await getAllInvoices();
        const invoicesData = Array.isArray(invoiceResponse.data.invoices) ? invoiceResponse.data.invoices : [];
        const invoiceItemsData = invoicesData.flatMap((inv) => inv.items || []);
        setInvoices(invoicesData);
        setInvoiceItems(invoiceItemsData);

        // Fetch purchase orders
        const poResponse = await getPurchaseOrders();
        const poData = Array.isArray(poResponse.data) ? poResponse.data : [];
        setPurchaseOrders(poData);
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
              quantity: item.quantity || '',
              rate: item.rate || '',
              discount: item.discount || '',
              taxPercentage: '',
            })),
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
        items: [{ orderItemId: '', taxPercentage: '', quantity: '', rate: '', discount: '' }],
      }));
      setOrderItems([]);
    }
  }, [formData.poId, isEditMode]);

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
      format: (value) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'invoiceAmount',
      label: 'Invoice Amount',
      format: (value) => `₹${parseFloat(value).toFixed(2)}`,
    },
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
            paymentDetails: invoice.paymentDetails,
            items: invoice.items.map((item) => ({
              id: item.id, // Include the item ID
              orderItemId: item.orderItemId,
              quantity: item.quantity,
              rate: item.rate,
              discount: item.discount,
              taxPercentage: item.taxPercentage,
              taxAmount: item.taxAmount,
              totalAmount: item.totalAmount,
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
      items: [
        ...prev.items,
        {
          orderItemId: '',
          taxPercentage: '',
          quantity: '',
          rate: '',
          discount: '',
          taxAmount: '',
          totalAmount: '',
        }, // No id for new items
      ],
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length === 1) {
      MySwal.fire({
        icon: 'warning',
        title: 'Cannot Remove',
        text: 'At least one invoice item is required.',
      });
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
    if (!formData.invoiceDate) newErrors.invoiceDate = 'Invoice date is required';

    // Check if an invoice already exists for the selected PO (only for create mode)
    if (!isEditMode && formData.poId && invoices.some((inv) => inv.poId === Number(formData.poId))) {
      newErrors.poId = 'This Purchase Order already has an invoice.';
    }

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
  
    const { items, subtotal, totalTax, invoiceAmount } = calculateTotals(formData.items);
  
    const payload = {
      poId: Number(formData.poId),
      invoiceNo: formData.invoiceNo,
      invoiceDate: formData.invoiceDate,
      paymentDetails: formData.paymentDetails || '',
      subtotal,
      totalTax,
      invoiceAmount,
      items: items.map((item) => ({
        id: item.id || undefined, // Include id if it exists, otherwise undefined
        orderItemId: Number(item.orderItemId),
        quantity: Number(item.quantity),
        rate: Number(item.rate),
        discount: Number(item.discount || 0),
        taxPercentage: Number(item.taxPercentage),
        taxAmount: Number(item.taxAmount),
        totalAmount: Number(item.totalAmount),
      })),
    };
  
    console.log('Submitting Payload:', payload); // Log payload for debugging
  
    try {
      if (isEditMode) {
        await updateInvoice(editId, payload);
        const invoiceResponse = await getInvoiceById(editId);
        console.log('Updated Invoice Response:', invoiceResponse.data); // Log response
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
        const response = await createInvoice(payload);
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
        (typeof value === 'string' && value !== '') ||
        (Array.isArray(value) && value.some((item) => Object.values(item).some((v) => v !== '')))
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
      items: [{ orderItemId: '', taxPercentage: '', quantity: '', rate: '', discount: '', taxAmount: '', totalAmount: '' }],
    });
    setErrors({});
    setIsEditMode(false);
    setEditId(null);
    setOrderItems([]);
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
                              {orderItems.map((oi) => (
                                <option key={oi.id} value={oi.id}>
                                  {oi.itemName || 'N/A'}
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
                  <div className="col-span-1 sm:col-span-2 lg:col-span-3 flex flex-col sm:flex-row пространство-y-2 sm:space-y-0 sm:space-x-4">
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