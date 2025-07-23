import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import Table from '../components/Table';
import FormInput from '../components/FormInput';
import QuickInvoiceDetails from './QuickInvoiceDetail';
import { getQuickInvoices, createQuickInvoice, updateQuickInvoice } from '../api/quickInvoiceServices';
import { getQuickGRNs } from '../api/quickGRNServices';
import axios from '../api/axiosInstance';

function QuickInvoice() {
  const [quickInvoices, setQuickInvoices] = useState([]);
  const [quickGRNs, setQuickGRNs] = useState([]);
  const [quickGRNItems, setQuickGRNItems] = useState([]);
  const [items, setItems] = useState([]);
  const [units, setUnits] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    qInvoiceDate: '',
    qGRNIds: [],
    remark: '',
    taxDetails: {},
    documents: [],
    existingDocuments: [],
    OtherAmount:'',
  });
  const [errors, setErrors] = useState({});
  const [editId, setEditId] = useState(null);
  const [selectedQInvoiceId, setSelectedQInvoiceId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [invoicesResponse, grnsResponse] = await Promise.all([
          getQuickInvoices(),
          getQuickGRNs(),
        ]);

        setQuickInvoices(invoicesResponse.data || []);
        console.log('Fetched Quick Invoices:', invoicesResponse.data);
        
        setQuickGRNs(grnsResponse.data || []);
        const grnItems = grnsResponse.data.flatMap((grn) => (grn.items || []).map(item => ({ ...item, discount: item.discount || 0 }))) || [];
        setQuickGRNItems(grnItems);

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
        setErrors({ api: 'Failed to load data. Please try again.' });
        setQuickGRNItems([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Calculate item amounts
  const calculateItemAmounts = (item, taxPercentage) => {
    const quantity = Number(item.quantity) || 0;
    const rate = Number(item.rate) || 0;
    const discount = Number(item.discount) || 0;

    console.log(`Calculating for item ${item.qGRNItemid}: qty=${quantity}, rate=${rate}, discount=${discount}, taxPercentage=${taxPercentage}`);

    if (discount < 0 || discount > 100) {
      return { baseAmount: '0.00', discountAmount: '0.00', amount: '0.00', taxAmount: '0.00', totalAmount: '0.00', error: 'Discount must be between 0 and 100%.' };
    }

    const baseAmount = quantity * rate;
    const discountAmount = baseAmount * (discount / 100);
    const amount = baseAmount - discountAmount;
    const taxAmount = amount * (Number(taxPercentage || 0) / 100);
    const totalAmount = amount + taxAmount;

    return {
      baseAmount: parseFloat(baseAmount.toFixed(2)),
      discountAmount: parseFloat(discountAmount.toFixed(2)),
      amount: parseFloat(amount.toFixed(2)),
      taxAmount: parseFloat(taxAmount.toFixed(2)),
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      error: null,
    };
  };

 // Calculate final totals
const calculateFinalTotals = (qGRNIds, taxDetails, OtherAmount) => {
  let totalAmount = 0;
  let taxAmount = 0;
  let discountedAmount = 0;
  qGRNIds.forEach((qGRNId) => {
    const grnItems = quickGRNItems.filter((gi) => gi.qGRNId === qGRNId);
    grnItems.forEach((gi) => {
      const { baseAmount, discountAmount, taxAmount: itemTaxAmount } = calculateItemAmounts(gi, taxDetails[gi.qGRNItemid]?.taxPercentage);
      totalAmount += baseAmount;
      taxAmount += itemTaxAmount;
      discountedAmount += discountAmount;
    });
  });
  const totalAmountWithTax = totalAmount + Number(OtherAmount) + taxAmount - discountedAmount;
  return {
    totalAmount: parseFloat(totalAmount.toFixed(2)),
    taxAmount: parseFloat(taxAmount.toFixed(2)),
    discountedAmount: parseFloat(discountedAmount.toFixed(2)),
    totalAmountWithTax: parseFloat(totalAmountWithTax.toFixed(2)),
  };
};

  // Handle GRN selection
  const handleGRNChange = async (selectedOptions) => {
    const selected = selectedOptions ? selectedOptions.map((option) => Number(option.value)) : [];

    setIsLoading(true);
    try {
      const newGRNItems = [...quickGRNItems];
      for (const qGRNId of selected) {
        if (!quickGRNItems.some((gi) => gi.qGRNId === qGRNId)) {
          const grnResponse = await getQuickGRNs(qGRNId);
          const grnItems = (grnResponse.data.items || []).map(item => ({ ...item, discount: item.discount || 0 }));
          newGRNItems.push(...grnItems);
        }
      }
      setQuickGRNItems(newGRNItems);

      setFormData((prev) => {
        const newTaxDetails = { ...prev.taxDetails };
        const selectedGRNItems = newGRNItems.filter((gi) => selected.includes(gi.qGRNId));
        selectedGRNItems.forEach((gi) => {
          const existingTax = prev.taxDetails[gi.qGRNItemid] || { taxPercentage: '' };
          const { baseAmount, discountAmount, amount, taxAmount, totalAmount, error } = calculateItemAmounts(gi, existingTax.taxPercentage);
          newTaxDetails[gi.qGRNItemid] = { taxPercentage: existingTax.taxPercentage, baseAmount, discountAmount, amount, taxAmount, totalAmount };
          if (error) {
            setErrors((prevErrors) => ({
              ...prevErrors,
              [`items[${gi.qGRNItemid}].discount`]: error,
            }));
          }
        });
        return { ...prev, qGRNIds: selected, taxDetails: newTaxDetails };
      });
      setErrors((prev) => ({ ...prev, qGRNIds: '' }));
    } catch (error) {
      console.error('Error fetching GRN items:', error);
      setErrors({ api: 'Failed to load GRN items.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle discount change
  const handleDiscountChange = (qGRNItemid, e) => {
    const discount = Number(e.target.value) || 0;
    console.log(`Handling discount change for qGRNItemid=${qGRNItemid}, discount=${discount}`);
    if (discount < 0 || discount > 100) {
      setErrors((prev) => ({
        ...prev,
        [`items[${qGRNItemid}].discount`]: 'Discount must be between 0 and 100%.',
      }));
      return;
    }

    setQuickGRNItems((prev) => {
      const updatedItems = [...prev];
      const itemIndex = updatedItems.findIndex((item) => item.qGRNItemid === qGRNItemid);
      if (itemIndex !== -1) {
        updatedItems[itemIndex] = { ...updatedItems[itemIndex], discount };
      } else {
        console.error(`Item with qGRNItemid=${qGRNItemid} not found in quickGRNItems`);
        return prev;
      }
      console.log(`Updated quickGRNItems for ${qGRNItemid}:`, updatedItems[itemIndex]);
      return updatedItems;
    });

    setFormData((prev) => {
      const grnItem = quickGRNItems.find((gi) => gi.qGRNItemid === qGRNItemid);
      if (!grnItem) {
        console.error(`GRN item ${qGRNItemid} not found during discount update`);
        return prev;
      }
      const updatedItem = { ...grnItem, discount };
      const { baseAmount, discountAmount, amount, taxAmount, totalAmount } = calculateItemAmounts(
        updatedItem,
        prev.taxDetails[qGRNItemid]?.taxPercentage
      );
      return {
        ...prev,
        taxDetails: {
          ...prev.taxDetails,
          [qGRNItemid]: {
            ...prev.taxDetails[qGRNItemid],
            baseAmount,
            discountAmount,
            amount,
            taxAmount,
            totalAmount,
          },
        },
      };
    });

    setErrors((prev) => ({ ...prev, [`items[${qGRNItemid}].discount`]: '' }));
  };

  // Handle tax percentage change
  const handleTaxChange = (qGRNItemid, e) => {
    const taxPercentage = Number(e.target.value) || 0;
    console.log(`Handling tax change for qGRNItemid=${qGRNItemid}, taxPercentage=${taxPercentage}`);
    if (taxPercentage < 0) {
      setErrors((prev) => ({
        ...prev,
        [`taxDetails[${qGRNItemid}].taxPercentage`]: 'Tax percentage cannot be negative.',
      }));
      return;
    }

    setFormData((prev) => {
      const grnItem = quickGRNItems.find((gi) => gi.qGRNItemid === qGRNItemid);
      if (!grnItem) {
        console.error(`GRN item ${qGRNItemid} not found during tax update`);
        return prev;
      }
      const { baseAmount, discountAmount, amount, taxAmount, totalAmount } = calculateItemAmounts(grnItem, taxPercentage);
      return {
        ...prev,
        taxDetails: {
          ...prev.taxDetails,
          [qGRNItemid]: { taxPercentage, baseAmount, discountAmount, amount, taxAmount, totalAmount },
        },
      };
    });

    setErrors((prev) => ({ ...prev, [`taxDetails[${qGRNItemid}].taxPercentage`]: '' }));
  };

  // Handle OtherAmount change
  const handleOtherAmountChange = (e) => {
    const value = Number(e.target.value) || '';
    if (value < 0) {
      setErrors((prev) => ({
        ...prev,
        OtherAmount: 'Other Amount cannot be negative.',
      }));
      return;
    }
    setFormData((prev) => ({ ...prev, OtherAmount: value }));
    setErrors((prev) => ({ ...prev, OtherAmount: '' }));
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    const invalidFiles = files.filter(file => !validTypes.includes(file.type) || file.size > maxSize);
    if (invalidFiles.length > 0) {
      setErrors((prev) => ({
        ...prev,
        documents: 'Invalid file(s). Only PDF, JPEG, PNG allowed, max 10MB.',
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      documents: files,
    }));
    setErrors((prev) => ({ ...prev, documents: '' }));
  };

  // Handle document removal
  const handleRemoveDocument = (index) => {
    setFormData((prev) => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index),
    }));
  };

  // Handle existing document removal
  const handleRemoveExistingDocument = (index) => {
    setFormData((prev) => ({
      ...prev,
      existingDocuments: prev.existingDocuments.filter((_, i) => i !== index),
    }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    if (!formData.qInvoiceDate) newErrors.qInvoiceDate = 'Invoice date is required';
    if (!formData.qGRNIds.length) newErrors.qGRNIds = 'At least one Quick GRN is required';
    if (formData.OtherAmount < 0) newErrors.OtherAmount = 'Other Amount cannot be negative';
    quickGRNItems
      .filter((gi) => formData.qGRNIds.includes(gi.qGRNId))
      .forEach((gi) => {
        const taxPercentage = formData.taxDetails[gi.qGRNItemid]?.taxPercentage;
        if (taxPercentage === undefined || taxPercentage === '' || Number(taxPercentage) < 0) {
          newErrors[`taxDetails[${gi.qGRNItemid}].taxPercentage`] = 'Valid tax percentage required';
        }
        const discount = Number(gi.discount) || 0;
        if (discount < 0 || discount > 100) {
          newErrors[`items[${gi.qGRNItemid}].discount`] = 'Discount must be between 0 and 100%';
        }
        const { amount, error } = calculateItemAmounts(gi, taxPercentage);
        if (error) {
          newErrors[`items[${gi.qGRNItemid}].discount`] = error;
        }
        if (Number(amount) < 0) {
          newErrors[`taxDetails[${gi.qGRNItemid}].amount`] = 'Amount cannot be negative';
        }
      });
    console.log('Form validation errors:', newErrors);
    return newErrors;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      const simplifiedTaxDetails = {};
      const quickInvoiceItems = [];
      formData.qGRNIds.forEach((qGRNId) => {
        const grnItems = quickGRNItems.filter((gi) => gi.qGRNId === qGRNId);
        grnItems.forEach((gi) => {
          const taxPercentage = Number(formData.taxDetails[gi.qGRNItemid]?.taxPercentage) || 0;
          const discount = Number(gi.discount) || 0;
          console.log(`Preparing invoice item ${gi.qGRNItemid} with discount=${discount}`);
          const { baseAmount, discountAmount, amount, taxAmount, totalAmount } = calculateItemAmounts(gi, taxPercentage);

          simplifiedTaxDetails[gi.qGRNItemid] = { taxPercentage };

          const invoiceItem = {
            qGRNId,
            qGRNItemid: gi.qGRNItemid,
            itemId: gi.itemId,
            unitId: gi.unitId,
            quantity: Number(gi.quantity),
            rate: Number(gi.rate),
            discount: parseFloat(discount.toFixed(2)),
            baseAmount,
            discountAmount,
            amount,
            taxPercentage,
            taxAmount,
            totalAmount,
          };

          if (isEditMode) {
            const existingItem = quickInvoices
              .find((inv) => inv.qInvoiceId === editId)
              ?.quickInvoiceItems.find((qi) => qi.qGRNItemid === gi.qGRNItemid);
            if (existingItem) {
              invoiceItem.qInvoiceItemId = existingItem.qInvoiceItemId;
            }
          }

          quickInvoiceItems.push(invoiceItem);
        });
      });

      const payload = new FormData();
      payload.append('qGRNIds', JSON.stringify(formData.qGRNIds));
      payload.append('qInvoiceDate', formData.qInvoiceDate);
      payload.append('remark', formData.remark || '');
      payload.append('taxDetails', JSON.stringify(simplifiedTaxDetails));
      payload.append('quickInvoiceItems', JSON.stringify(quickInvoiceItems));
      payload.append('OtherAmount', JSON.stringify(formData.OtherAmount));
      if (isEditMode) {
        payload.append('existingDocuments', JSON.stringify(formData.existingDocuments));
      }
      formData.documents.forEach((file) => {
        payload.append('documents', file);
      });

      console.log('Submitting payload:', [...payload.entries()]);

      let response;
      if (isEditMode) {
        response = await updateQuickInvoice(editId, payload);
        setQuickInvoices((prev) =>
          prev.map((inv) => (inv.qInvoiceId === editId ? response.data.invoice : inv))
        );
        setSuccessMessage('Quick Invoice updated successfully!');
      } else {
        response = await createQuickInvoice(payload);
        setQuickInvoices((prev) => [...prev, response.data.invoice]);
        setSuccessMessage('Quick Invoice created successfully!');
      }

      resetForm();
      setIsFormVisible(false);
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors({ api: error.response?.data?.message || 'Failed to save invoice.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      qInvoiceDate: '',
      qGRNIds: [],
      remark: '',
      taxDetails: {},
      documents: [],
      existingDocuments: [],
      OtherAmount: '',
    });
    setErrors({});
    setSuccessMessage('');
    setIsEditMode(false);
    setEditId(null);
  };

  // GRN options for select
  const grnOptions = quickGRNs.map((grn) => ({
    value: grn.qGRNId,
    label: grn.qGRNNo,
  }));

  // Filter invoices for search
  const filteredQuickInvoices = quickInvoices.filter((invoice) => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    const qInvoiceNo = invoice.qInvoiceNo ? invoice.qInvoiceNo.toLowerCase() : '';
    const qGRNNos = invoice.qGRNIds
      .map((id) => quickGRNs.find((g) => g.qGRNId === id)?.qGRNNo?.toLowerCase() || '')
      .join(' ');
    const remark = invoice.remark ? invoice.remark.toLowerCase() : '';
    return qInvoiceNo.includes(searchLower) || qGRNNos.includes(searchLower) || remark.includes(searchLower);
  });

  // Table columns
  const quickInvoiceColumns = [
    { key: 'qInvoiceNo', label: 'Invoice No' },
    {
      key: 'qInvoiceDate',
      label: 'Invoice Date',
      format: (value) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'totalAmountWithTax',
      label: 'Total Amount with Tax',
      format: (value) => `₹${parseFloat(value).toFixed(2)}`,
    },
  ];

  // Table actions
  const actions = [
    {
      label: 'Edit',
      onClick: (row) => {
        setIsEditMode(true);
        setEditId(row.qInvoiceId);
        const taxDetails = {};
        const updatedGRNItems = [...quickGRNItems];
        row.quickInvoiceItems.forEach((qi) => {
          const grnItemIndex = updatedGRNItems.findIndex((gi) => gi.qGRNItemid === qi.qGRNItemid);
          if (grnItemIndex !== -1) {
            updatedGRNItems[grnItemIndex] = { ...updatedGRNItems[grnItemIndex], discount: Number(qi.discount) || 0 };
          }
          const grnItem = updatedGRNItems.find((gi) => gi.qGRNItemid === qi.qGRNItemid);
          if (grnItem) {
            const { baseAmount, discountAmount, amount, taxAmount, totalAmount } = calculateItemAmounts(grnItem, qi.taxPercentage);
            taxDetails[qi.qGRNItemid] = { taxPercentage: qi.taxPercentage, baseAmount, discountAmount, amount, taxAmount, totalAmount };
          }
        });
        console.log('Loaded edit form with quickGRNItems:', updatedGRNItems);
        setQuickGRNItems(updatedGRNItems);
        setFormData({
          qInvoiceDate: row.qInvoiceDate.split('T')[0],
          qGRNIds: row.qGRNIds,
          remark: row.remark || '',
          taxDetails,
          documents: [],
          existingDocuments: row.document || [],
          OtherAmount: Number(row.OtherAmount) || '',
        });
        setSuccessMessage('');
        setIsFormVisible(true);
      },
      className: 'bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs sm:text-sm',
    },
  ];

  // Handle row click
  const handleRowClick = (row) => {
    setSelectedQInvoiceId(row.qInvoiceId);
  };

  // Handle back navigation
  const handleBack = () => {
    setSelectedQInvoiceId(null);
  };

  const selectedQInvoice = quickInvoices.find((inv) => inv.qInvoiceId === selectedQInvoiceId);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {isLoading && <div className="text-center p-4">Loading...</div>}
      {errors.api && <div className="text-red-600 text-sm mb-4">{errors.api}</div>}
      {successMessage && <div className="text-green-600 text-sm mb-4">{successMessage}</div>}
      {selectedQInvoiceId ? (
        <QuickInvoiceDetails
          quickInvoice={selectedQInvoice}
          quickInvoiceItems={selectedQInvoice?.quickInvoiceItems || []}
          quickGRNs={quickGRNs}
          quickGRNItems={quickGRNItems}
          items={items}
          units={units}
          onBack={handleBack}
        />
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-brand-secondary mb-4">Quick Invoice</h2>
            <div className="flex items-center space-x-4">
              <input
                type="text"
                placeholder="Search by Invoice Number, GRN Number, or Remark"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 border border-gray-300 rounded-md shadow-sm p-2 focus:ring-brand-primary focus:border-brand-primary text-sm"
              />
              <button
                onClick={() => setIsFormVisible(!isFormVisible)}
                className="bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-red-600 text-sm"
              >
                {isFormVisible ? 'Hide Form' : 'Create Quick Invoice'}
              </button>
            </div>
          </div>
          {isFormVisible && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-brand-secondary mb-4">
                {isEditMode ? 'Edit Quick Invoice' : 'Add Quick Invoice'}
              </h3>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormInput
                  label="Invoice Date"
                  type="date"
                  name="qInvoiceDate"
                  value={formData.qInvoiceDate}
                  onChange={(e) => setFormData({ ...formData, qInvoiceDate: e.target.value })}
                  error={errors.qInvoiceDate}
                  required
                  className="w-full text-sm"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700">Quick GRNs</label>
                  <Select
                    isMulti
                    options={grnOptions}
                    value={grnOptions.filter((option) => formData.qGRNIds.includes(option.value))}
                    onChange={handleGRNChange}
                    className="text-sm"
                    placeholder="Select Quick GRNs"
                    required
                  />
                  {errors.qGRNIds && <p className="mt-1 text-xs text-red-600">{errors.qGRNIds}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Documents</label>
                  <input
                    type="file"
                    name="documents"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                  />
                  {errors.documents && <p className="mt-1 text-xs text-red-600">{errors.documents}</p>}
                  {formData.documents.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-600">Selected files:</p>
                      <ul className="list-disc pl-5 text-xs text-gray-600">
                        {formData.documents.map((file, index) => (
                          <li key={index} className="flex items-center">
                            <span>{file.name}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveDocument(index)}
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
                      <p className="text-xs text-gray-600">Existing documents:</p>
                      <ul className="list-disc pl-5 text-xs text-gray-600">
                        {formData.existingDocuments.map((doc, index) => (
                          <li key={index} className="flex items-center">
                            <a
                              href={doc}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {doc.split('/').pop()}
                            </a>
                            <button
                              type="button"
                              onClick={() => handleRemoveExistingDocument(index)}
                              className="ml-2 text-red-600 hover:text-red-800 text-xs"
                            >
                              Remove
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <FormInput
                  label="Remark"
                  type="text"
                  name="remark"
                  value={formData.remark}
                  onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                  error={errors.remark}
                  required={false}
                  className="w-full text-sm"
                />
                <div className="col-span-1 sm:col-span-2 lg:col-span-3">
                  <h4 className="text-md font-medium text-brand-secondary mb-2">Items</h4>
                  {formData.qGRNIds.length === 0 ? (
                    <p className="text-sm text-gray-500">Select at least one Quick GRN to view items.</p>
                  ) : (
                    formData.qGRNIds.map((qGRNId) => {
                      const grnItems = quickGRNItems.filter((gi) => gi.qGRNId === qGRNId);
                      return (
                        <div key={qGRNId} className="mb-4 p-4 border rounded-md">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">
                            Items for GRN #{quickGRNs.find((g) => g.qGRNId === qGRNId)?.qGRNNo || qGRNId}
                          </h5>
                          {grnItems.length === 0 ? (
                            <p className="text-sm text-gray-500">No items found.</p>
                          ) : (
                            <div className="space-y-4">
                              {grnItems.map((gi) => (
                                <div key={gi.qGRNItemid} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2 p-2 border rounded-md">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700">Item Name</label>
                                    <input
                                      type="text"
                                      value={items.find((item) => item.itemId === gi.itemId)?.itemName || ''}
                                      disabled
                                      className="block w-full border border-gray-300 rounded-md shadow-sm px-2 py-2 bg-gray-100 text-sm"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700">Unit</label>
                                    <input
                                      type="text"
                                      value={units.find((unit) => unit.unitId === gi.unitId)?.uniteCode || ''}
                                      disabled
                                      className="block w-full border border-gray-300 rounded-md shadow-sm px-2 py-2 bg-gray-100 text-sm"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700">Quantity</label>
                                    <input
                                      type="text"
                                      value={gi.quantity}
                                      disabled
                                      className="block w-full border border-gray-300 rounded-md shadow-sm px-2 py-2 bg-gray-100 text-sm"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700">Rate</label>
                                    <input
                                      type="text"
                                      value={gi.rate}
                                      disabled
                                      className="block w-full border border-gray-300 rounded-md shadow-sm px-2 py-2 bg-gray-100 text-sm"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700">Base Amount</label>
                                    <input
                                      type="text"
                                      value={formData.taxDetails[gi.qGRNItemid]?.baseAmount || '0.00'}
                                      disabled
                                      className="block w-full border border-gray-300 rounded-md shadow-sm px-2 py-2 bg-gray-100 text-sm"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700">Discount %</label>
                                    <input
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      max="100"
                                      value={gi.discount || ''}
                                      onChange={(e) => handleDiscountChange(gi.qGRNItemid, e)}
                                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-brand-primary focus:border-brand-primary"
                                      placeholder="Enter discount %"
                                    />
                                    {errors[`items[${gi.qGRNItemid}].discount`] && (
                                      <p className="mt-1 text-xs text-red-600">{errors[`items[${gi.qGRNItemid}].discount`]}</p>
                                    )}
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700">Discount Amount</label>
                                    <input
                                      type="text"
                                      value={formData.taxDetails[gi.qGRNItemid]?.discountAmount || '0.00'}
                                      disabled
                                      className="block w-full border border-gray-300 rounded-md shadow-sm px-2 py-2 bg-gray-100 text-sm"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700">Amount</label>
                                    <input
                                      type="text"
                                      value={formData.taxDetails[gi.qGRNItemid]?.amount || '0.00'}
                                      disabled
                                      className="block w-full border border-gray-300 rounded-md shadow-sm px-2 py-2 bg-gray-100 text-sm"
                                    />
                                    {errors[`taxDetails[${gi.qGRNItemid}].amount`] && (
                                      <p className="mt-1 text-xs text-red-600">{errors[`taxDetails[${gi.qGRNItemid}].amount`]}</p>
                                    )}
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700">Tax Percentage</label>
                                    <input
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      value={formData.taxDetails[gi.qGRNItemid]?.taxPercentage || ''}
                                      onChange={(e) => handleTaxChange(gi.qGRNItemid, e)}
                                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-brand-primary focus:border-brand-primary"
                                      placeholder="Enter tax %"
                                      required
                                    />
                                    {errors[`taxDetails[${gi.qGRNItemid}].taxPercentage`] && (
                                      <p className="mt-1 text-xs text-red-600">{errors[`taxDetails[${gi.qGRNItemid}].taxPercentage`]}</p>
                                    )}
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700">Tax Amount</label>
                                    <input
                                      type="text"
                                      value={formData.taxDetails[gi.qGRNItemid]?.taxAmount || '0.00'}
                                      disabled
                                      className="block w-full border border-gray-300 rounded-md shadow-sm px-2 py-2 bg-gray-100 text-sm"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700">Total Amount</label>
                                    <input
                                      type="text"
                                      value={formData.taxDetails[gi.qGRNItemid]?.totalAmount || '0.00'}
                                      disabled
                                      className="block w-full border border-gray-300 rounded-md shadow-sm px-2 py-2 bg-gray-100 text-sm"
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                  <div className="mt-4 p-4 bg-gray-50 rounded-md">
                    <h4 className="text-md font-semibold text-brand-secondary">Invoice Totals</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Base Amount</label>
                        <p className="text-md font-medium text-gray-900">
                          ₹{calculateFinalTotals(formData.qGRNIds, formData.taxDetails, formData.OtherAmount).totalAmount}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Other Amount</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.OtherAmount}
                          onChange={handleOtherAmountChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-brand-primary focus:border-brand-primary"
                          placeholder="Enter other amount"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Tax Amount</label>
                        <p className="text-md font-medium text-gray-900">
                          ₹{calculateFinalTotals(formData.qGRNIds, formData.taxDetails, formData.OtherAmount).taxAmount}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Discount Amount</label>
                        <p className="text-md font-medium text-gray-900">
                          ₹{calculateFinalTotals(formData.qGRNIds, formData.taxDetails, formData.OtherAmount).discountedAmount}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Total Amount with Tax</label>
                        <p className="text-md font-medium text-gray-900">
                          ₹{calculateFinalTotals(formData.qGRNIds, formData.taxDetails, formData.OtherAmount).totalAmountWithTax}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-span-1 sm:col-span-2 lg:col-span-3 flex space-x-4">
                  <button
                    type="submit"
                    className="bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-brand-primary-hover text-sm"
                    disabled={isLoading}
                  >
                    {isEditMode ? 'Update' : 'Add'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setIsFormVisible(false);
                    }}
                    className="px-4 py-2 text-gray-600 rounded-md hover:bg-gray-100 text-sm"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
          <Table
            columns={quickInvoiceColumns}
            data={filteredQuickInvoices}
            actions={actions}
            onRowClick={handleRowClick}
          />
        </>
      )}
    </div>
  );
}

export default QuickInvoice;