
import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import Table from '../components/Table';
import FormInput from '../components/FormInput';
import QuickInvoiceDetails from './QuickInvoiceDetail';
import { getQuickInvoices, createQuickInvoice, updateQuickInvoice } from '../api/quickInvoiceServices';
import { getQuickGRNs } from '../api/quickGRNServices';
import { getItems } from '../api/itemService';

function QuickInvoice() {
  const [quickInvoices, setQuickInvoices] = useState([]);
  const [quickGRNs, setQuickGRNs] = useState([]);
  const [quickGRNItems, setQuickGRNItems] = useState([]);
  const [items, setItems] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    qInvoiceDate: '',
    qGRNIds: [],
    remark: '',
    taxDetails: {}, // { qGRNItemid: { taxPercentage: number, baseAmount: string, taxAmount: string, totalAmount: string } }
  });
  const [errors, setErrors] = useState({});
  const [editId, setEditId] = useState(null);
  const [selectedQInvoiceId, setSelectedQInvoiceId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [invoicesResponse, grnsResponse, itemsResponse] = await Promise.all([
          getQuickInvoices(),
          getQuickGRNs(),
          getItems(),
        ]);

        // Set Quick Invoices
        setQuickInvoices(invoicesResponse.data || []);
        console.log('Quick Invoices:', invoicesResponse.data || []);

        // Set Quick GRNs
        setQuickGRNs(grnsResponse.data || []);
        console.log('Quick GRNs:', grnsResponse.data || []);

        // Set Quick GRN Items from grnsResponse.data.items
        const grnItems = grnsResponse.data.flatMap(grn => grn.items || []) || [];
        setQuickGRNItems(grnItems);
        console.log('Quick GRN Items:', grnItems);

        // Set Items (inventory items)
        setItems(itemsResponse.data || []);
        console.log('Items:', itemsResponse.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setErrors({ api: 'Failed to load data. Please try again.' });
        setQuickGRNItems([]);
        setItems([]);
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
    let total = 0;
    qGRNIds.forEach((qGRNId) => {
      const grnItems = quickGRNItems.filter((gi) => gi.qGRNId === qGRNId);
      grnItems.forEach((gi) => {
        const { totalAmount } = calculateItemAmounts(gi, taxDetails[gi.qGRNItemid]?.taxPercentage);
        total += Number(totalAmount);
      });
    });
    return total.toFixed(2);
  };

  // Handle GRN selection
  const handleGRNChange = async (selectedOptions) => {
    const selected = selectedOptions ? selectedOptions.map((option) => Number(option.value)) : [];
    console.log('Selected GRNs:', selected);

    setIsLoading(true);
    try {
      // Update quickGRNItems for selected GRNs
      const newGRNItems = [...quickGRNItems];
      for (const qGRNId of selected) {
        if (!quickGRNItems.some((gi) => gi.qGRNId === qGRNId)) {
          const grnResponse = await getQuickGRNs(qGRNId);
          const grnItems = grnResponse.data.items || [];
          newGRNItems.push(...grnItems);
        }
      }
      setQuickGRNItems(newGRNItems);

      // Update formData
      setFormData((prev) => {
        const newTaxDetails = {};
        const selectedGRNItems = newGRNItems.filter((gi) => selected.includes(gi.qGRNId));
        selectedGRNItems.forEach((gi) => {
          const existingTax = prev.taxDetails[gi.qGRNItemid] || { taxPercentage: '' };
          const { baseAmount, taxAmount, totalAmount } = calculateItemAmounts(gi, existingTax.taxPercentage);
          newTaxDetails[gi.qGRNItemid] = { taxPercentage: existingTax.taxPercentage, baseAmount, taxAmount, totalAmount };
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

  // Handle tax percentage change
  const handleTaxChange = (qGRNItemid, e) => {
    const { value } = e.target;
    setFormData((prev) => {
      const grnItem = quickGRNItems.find((gi) => gi.qGRNItemid === qGRNItemid);
      if (!grnItem) return prev;
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

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    if (!formData.qInvoiceDate) newErrors.qInvoiceDate = 'Invoice date is required';
    if (!formData.qGRNIds.length) newErrors.qGRNIds = 'At least one Quick GRN is required';
    quickGRNItems
      .filter((gi) => formData.qGRNIds.includes(gi.qGRNId))
      .forEach((gi) => {
        if (!formData.taxDetails[gi.qGRNItemid]?.taxPercentage || Number(formData.taxDetails[gi.qGRNItemid].taxPercentage) < 0) {
          newErrors[`taxDetails[${gi.qGRNItemid}].taxPercentage`] = 'Valid tax percentage required';
        }
      });
    return newErrors;
  };

  // Handle form submission
// Handle form submission
const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
    }

    setIsLoading(true);
    try {
        // Prepare taxDetails and quickInvoiceItems
        const simplifiedTaxDetails = {};
        const quickInvoiceItems = [];
        let totalInvoiceAmount = 0;

        formData.qGRNIds.forEach((qGRNId) => {
            const grnItems = quickGRNItems.filter((gi) => gi.qGRNId === qGRNId);
            grnItems.forEach((gi) => {
                const taxPercentage = Number(formData.taxDetails[gi.qGRNItemid]?.taxPercentage) || 0;
                const { taxAmount, totalAmount } = calculateItemAmounts(gi, taxPercentage);

                // Add to taxDetails
                simplifiedTaxDetails[gi.qGRNItemid] = { taxPercentage };

                // Add to quickInvoiceItems
                const invoiceItem = {
                    qGRNId,
                    qGRNItemid: gi.qGRNItemid,
                    itemId: gi.itemId,
                    quantity: Number(gi.quantity),
                    rate: Number(gi.rate),
                    discount: Number(gi.discount || 0),
                    taxPercentage,
                    taxAmount: Number(taxAmount),
                    totalAmount: Number(totalAmount),
                };

                // Include qInvoiceItemId for existing items in edit mode
                if (isEditMode) {
                    const existingItem = quickInvoices
                        .find((inv) => inv.qInvoiceId === editId)
                        ?.quickInvoiceItems.find((qi) => qi.qGRNItemid === gi.qGRNItemid);
                    if (existingItem) {
                        invoiceItem.qInvoiceItemId = existingItem.qInvoiceItemId;
                    }
                }

                quickInvoiceItems.push(invoiceItem);
                totalInvoiceAmount += Number(totalAmount);
            });
        });

        // Prepare payload
        const payload = {
            qGRNIds: formData.qGRNIds,
            qInvoiceDate: formData.qInvoiceDate,
            remark: formData.remark,
            taxDetails: simplifiedTaxDetails,
            ...(isEditMode && { quickInvoiceItems }), // Include quickInvoiceItems only for edit mode
        };

        let response;
        if (isEditMode) {
            response = await updateQuickInvoice(editId, payload);
            setQuickInvoices((prev) =>
                prev.map((inv) => (inv.qInvoiceId === editId ? response.data.invoice : inv))
            );
        } else {
            response = await createQuickInvoice(payload);
            setQuickInvoices((prev) => [...prev, response.data.invoice]);
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

  const resetForm = () => {
    setFormData({
      qInvoiceDate: '',
      qGRNIds: [],
      remark: '',
      taxDetails: {},
    });
    setErrors({});
    setIsEditMode(false);
    setEditId(null);
  };

  // GRN options for react-select
  const grnOptions = quickGRNs.map((grn) => ({
    value: grn.qGRNId,
    label: grn.qGRNNo,
  }));

  // Table columns
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
        row.quickInvoiceItems.forEach((qi) => {
          const grnItem = quickGRNItems.find((gi) => gi.qGRNItemid === qi.qGRNItemid);
          if (grnItem) {
            const { baseAmount, taxAmount, totalAmount } = calculateItemAmounts(grnItem, qi.taxPercentage);
            taxDetails[qi.qGRNItemid] = { taxPercentage: qi.taxPercentage, baseAmount, taxAmount, totalAmount };
          }
        });
        setFormData({
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
          // TODO: Implement deleteQuickInvoice API call
        }
      },
      className: 'bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs sm:text-sm',
    },
  ];

  // Handle row click
  const handleRowClick = (row) => {
    setSelectedQInvoiceId(row.qInvoiceId);
  };

  // Handle back
  const handleBack = () => {
    setSelectedQInvoiceId(null);
  };

  // Render
  const selectedQInvoice = quickInvoices.find((inv) => inv.qInvoiceId === selectedQInvoiceId);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {isLoading && <div className="text-center p-4">Loading...</div>}
      {errors.api && <div className="text-red-600 text-sm mb-4">{errors.api}</div>}
      {selectedQInvoiceId ? (
        <QuickInvoiceDetails
          quickInvoice={selectedQInvoice}
          quickInvoiceItems={selectedQInvoice?.quickInvoiceItems || []}
          quickGRNs={quickGRNs}
          quickGRNItems={quickGRNItems}
          items={items}
          onBack={handleBack}
        />
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-brand-secondary">Quick Invoices</h2>
            <button
              onClick={() => setIsFormVisible(!isFormVisible)}
              className="bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-brand-primary-hover"
              disabled={isLoading}
            >
              {isFormVisible ? 'Hide Form' : 'Add Quick Invoice'}
            </button>
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
                    className="mt-1 text-sm"
                    placeholder="Select Quick GRNs"
                    required
                  />
                  {errors.qGRNIds && <p className="mt-1 text-xs text-red-600">{errors.qGRNIds}</p>}
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
                  {formData.qGRNIds.map((qGRNId) => {
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
                              <div key={gi.qGRNItemid} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 p-2 border rounded-md">
                                <FormInput
                                  label="Item"
                                  type="text"
                                  value={gi.itemId}
                                  disabled
                                  className="text-sm"
                                />
                                <FormInput
                                  label="Quantity"
                                  type="number"
                                  value={gi.quantity}
                                  disabled
                                  className="text-sm"
                                />
                                <FormInput
                                  label="Rate"
                                  type="number"
                                  value={gi.rate}
                                  disabled
                                  className="text-sm"
                                />
                                <FormInput
                                  label="Discount"
                                  type="number"
                                  value={gi.discount || 0}
                                  disabled
                                  className="text-sm"
                                />
                                <FormInput
                                  label="Base Amount"
                                  type="text"
                                  value={formData.taxDetails[gi.qGRNItemid]?.baseAmount || '0.00'}
                                  disabled
                                  className="text-sm"
                                />
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
                                    <p className="mt-1 text-xs text-red-600">
                                      {errors[`taxDetails[${gi.qGRNItemid}].taxPercentage`]}
                                    </p>
                                  )}
                                </div>
                                <FormInput
                                  label="Tax Amount"
                                  type="text"
                                  value={formData.taxDetails[gi.qGRNItemid]?.taxAmount || '0.00'}
                                  disabled
                                  className="text-sm"
                                />
                                <FormInput
                                  label="Total Amount"
                                  type="text"
                                  value={formData.taxDetails[gi.qGRNItemid]?.totalAmount || '0.00'}
                                  disabled
                                  className="text-sm"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <div className="mt-4 p-4 bg-gray-50 rounded-md">
                    <h4 className="text-md font-semibold text-brand-secondary">Final Total Amount</h4>
                    <p className="text-md font-medium text-gray-900">
                      ₹{calculateFinalTotalAmount(formData.qGRNIds, formData.taxDetails)}
                    </p>
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
            data={quickInvoices}
            actions={actions}
            onRowClick={handleRowClick}
          />
        </>
      )}
    </div>
  );
}

export default QuickInvoice;