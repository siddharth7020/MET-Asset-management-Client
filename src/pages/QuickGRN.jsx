import React, { useState, useEffect } from 'react';
import Table from '../components/Table';
import FormInput from '../components/FormInput';
import QuickGRNDetails from './QuickGRNDetails';
import {
  getQuickGRNs,
  getQuickGRNById,
  createQuickGRN,
  updateQuickGRN,
  deleteQuickGRN,
} from '../api/quickGRNServices'; // Adjust path as needed
import axios from '../api/axiosInstance'; // Adjust path as needed
import Swal from 'sweetalert2';

function QuickGRN() {
  const [quickGRNs, setQuickGRNs] = useState([]);
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
    quickGRNItems: [{ itemId: '', quantity: '', rate: '', discount: '', amount: '', totalAmount: '' }],
  });
  const [errors, setErrors] = useState({});
  const [editId, setEditId] = useState(null);
  const [selectedQGRNId, setSelectedQGRNId] = useState(null);
  const [currentLayout, setCurrentLayout] = useState(null);

  // Fetch all necessary data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Quick GRNs
        const quickGRNsResponse = await getQuickGRNs();
        const quickGRNsData = quickGRNsResponse.data;
        setQuickGRNs(quickGRNsData);
        console.log('Quick GRNs:', quickGRNsData);

        // Fetch institutes
        const institutesResponse = await axios.get('/institutes');
        if (Array.isArray(institutesResponse.data.data)) {
          setInstitutes(institutesResponse.data.data);
        } else {
          console.error('Expected institutes data to be an array, but got:', institutesResponse.data.data);
          Swal.fire({
            icon: 'error',
            title: 'Data Error',
            text: 'Failed to load institutes data.',
          });
        }

        // Fetch financial years
        const fyResponse = await axios.get('/financialYears');
        if (Array.isArray(fyResponse.data.data)) {
          setFinancialYears(fyResponse.data.data);
        } else {
          console.error('Expected financial years data to be an array, but got:', fyResponse.data.data);
          Swal.fire({
            icon: 'error',
            title: 'Data Error',
            text: 'Failed to load financial years data.',
          });
        }

        // Fetch vendors
        const vendorsResponse = await axios.get('/vendors');
        if (Array.isArray(vendorsResponse.data.data)) {
          setVendors(vendorsResponse.data.data);
        } else {
          console.error('Expected vendors data to be an array, but got:', vendorsResponse.data.data);
          Swal.fire({
            icon: 'error',
            title: 'Data Error',
            text: 'Failed to load vendors data.',
          });
        }

        // Fetch items
        const itemsResponse = await axios.get('/items');
        if (Array.isArray(itemsResponse.data.items)) {
          setItems(itemsResponse.data.items);
        } else {
          console.error('Expected items data to be an array, but got:', itemsResponse.data.items);
          Swal.fire({
            icon: 'error',
            title: 'Data Error',
            text: 'Failed to load items data.',
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        Swal.fire({
          icon: 'error',
          title: 'Fetch Error',
          text: 'Failed to load data. Please try again.',
        });
      }
    };

    fetchData();
  }, []);

  // Table columns for QuickGRN
  const quickGRNColumns = [
    { key: 'qGRNNo', label: 'Quick GRN No' },
    {
      key: 'qGRNDate',
      label: 'Quick GRN Date',
      format: (value) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'instituteId',
      label: 'Institute',
      format: (value) => institutes.find((inst) => inst.instituteId === value)?.instituteName || 'N/A',
    },
    {
      key: 'financialYearId',
      label: 'Financial Year',
      format: (value) => financialYears.find((year) => year.financialYearId === value)?.year || 'N/A',
    },
    {
      key: 'vendorId',
      label: 'Vendor',
      format: (value) => vendors.find((v) => v.vendorId === value)?.name || 'N/A',
    },
    { key: 'challanNo', label: 'Challan No' },
    { key: 'requestedBy', label: 'Requested By' },
  ];

  // Table actions
  const actions = [
    {
      label: 'Edit',
      onClick: async (row) => {
        try {
          const response = await getQuickGRNById(row.qGRNId);
          const qgrn = response.data;
          const items = qgrn.items || [];
          setIsEditMode(true);
          setEditId(row.qGRNId);
          setFormData({
            qGRNId: qgrn.qGRNId,
            qGRNNo: qgrn.qGRNNo,
            qGRNDate: qgrn.qGRNDate.split('T')[0],
            instituteId: qgrn.instituteId ? String(qgrn.instituteId) : '',
            financialYearId: qgrn.financialYearId ? String(qgrn.financialYearId) : '',
            vendorId: qgrn.vendorId ? String(qgrn.vendorId) : '',
            document: qgrn.document || '',
            challanNo: qgrn.challanNo || '',
            challanDate: qgrn.challanDate ? qgrn.challanDate.split('T')[0] : '',
            requestedBy: qgrn.requestedBy || '',
            remark: qgrn.remark || '',
            quickGRNItems: items.length > 0
              ? items.map((qi) => ({
                qGRNItemid: qi.qGRNItemid,
                itemId: qi.itemId ? String(qi.itemId) : '',
                quantity: qi.quantity || '',
                rate: qi.rate || '',
                discount: qi.discount || '',
                amount: qi.amount || '',
                totalAmount: qi.totalAmount || '',
              }))
              : [{ itemId: '', quantity: '', rate: '', discount: '', amount: '', totalAmount: '' }],
          });
          setIsFormVisible(true);
        } catch (error) {
          console.error('Error fetching Quick GRN for edit:', error);
          Swal.fire({
            icon: 'error',
            title: 'Edit Error',
            text: 'Failed to load Quick GRN data.',
          });
        }
      },
      className: 'bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs sm:text-sm',
    },
    {
      label: 'Delete',
      onClick: async (row) => {
        Swal.fire({
          title: 'Are you sure?',
          text: `Do you want to delete Quick GRN ${row.qGRNNo}?`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6',
          confirmButtonText: 'Yes, delete it!',
          cancelButtonText: 'Cancel',
        }).then(async (result) => {
          if (result.isConfirmed) {
            try {
              await deleteQuickGRN(row.qGRNId);
              setQuickGRNs((prev) => prev.filter((qgrn) => qgrn.qGRNId !== row.qGRNId));
              Swal.fire({
                icon: 'success',
                title: 'Deleted!',
                text: `Quick GRN ${row.qGRNNo} has been deleted.`,
                timer: 1500,
                showConfirmButton: false,
              });
            } catch (error) {
              console.error('Error deleting Quick GRN:', error);
              Swal.fire({
                icon: 'error',
                title: 'Delete Error',
                text: 'Failed to delete Quick GRN.',
              });
            }
          }
        });
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
      quickGRNItems: [...prev.quickGRNItems, { itemId: '', quantity: '', rate: '', discount: '', amount: '', totalAmount: '' }],
    }));
  };

  const removeItem = (index) => {
    if (formData.quickGRNItems.length === 1) {
      Swal.fire({
        icon: 'warning',
        title: 'Cannot Remove',
        text: 'At least one Quick GRN item is required.',
      });
      return;
    }
    setFormData((prev) => ({
      ...prev,
      quickGRNItems: prev.quickGRNItems.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.qGRNDate) newErrors.qGRNDate = 'Quick GRN date is required';
    if (!formData.instituteId || Number(formData.instituteId) <= 0 || !institutes.some((inst) => inst.instituteId === Number(formData.instituteId))) {
      newErrors.instituteId = 'A valid institute is required';
    }
    if (!formData.financialYearId || Number(formData.financialYearId) <= 0 || !financialYears.some((fy) => fy.financialYearId === Number(formData.financialYearId))) {
      newErrors.financialYearId = 'A valid financial year is required';
    }
    if (!formData.vendorId || Number(formData.vendorId) <= 0 || !vendors.some((v) => v.vendorId === Number(formData.vendorId))) {
      newErrors.vendorId = 'A valid vendor is required';
    }
    if (!formData.requestedBy.trim()) newErrors.requestedBy = 'Requested By is required';

    formData.quickGRNItems.forEach((item, index) => {
      if (!item.itemId || Number(item.itemId) <= 0 || !items.some((it) => it.itemId === Number(item.itemId))) {
        newErrors[`quickGRNItems[${index}].itemId`] = 'A valid item is required';
      }
      if (!item.quantity || Number(item.quantity) <= 0) newErrors[`quickGRNItems[${index}].quantity`] = 'Quantity must be positive';
      if (!item.rate || Number(item.rate) <= 0) newErrors[`quickGRNItems[${index}].rate`] = 'Rate must be positive';
      if (item.discount && Number(item.discount) < 0) newErrors[`quickGRNItems[${index}].discount`] = 'Discount cannot be negative';
    });

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      console.log('Validation errors:', newErrors);
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        html: Object.values(newErrors).map((err) => `<p>${err}</p>`).join(''),
        confirmButtonColor: '#d33',
      });
      return;
    }

    const payload = {
      qGRNDate: formData.qGRNDate,
      qGRNNo: formData.qGRNNo.trim(),
      instituteId: Number(formData.instituteId),
      financialYearId: Number(formData.financialYearId),
      vendorId: Number(formData.vendorId),
      document: formData.document.trim() || null,
      challanNo: formData.challanNo.trim() || null,
      challanDate: formData.challanDate || null,
      requestedBy: formData.requestedBy.trim(),
      remark: formData.remark.trim() || null,
      quickGRNItems: formData.quickGRNItems.map((item) => ({
        qGRNItemid: item.qGRNItemid || undefined,
        itemId: Number(item.itemId),
        quantity: Number(item.quantity),
        rate: Number(item.rate),
        discount: Number(item.discount) || 0,
      })),
    };

    console.log('Submitting payload:', payload);

    try {
      if (isEditMode) {
        const response = await updateQuickGRN(editId, payload);
        const updatedQGRN = response.data;
        setQuickGRNs((prev) =>
          prev.map((qgrn) => (qgrn.qGRNId === editId ? updatedQGRN : qgrn))
        );
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Quick GRN updated successfully.',
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        const response = await createQuickGRN(payload);
        const newQGRN = response.data;
        setQuickGRNs((prev) => [...prev, newQGRN]);
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Quick GRN created successfully.',
          timer: 1500,
          showConfirmButton: false,
        });
      }
      resetForm();
      setIsFormVisible(false);
    } catch (error) {
      console.error('Error submitting Quick GRN:', error);
      Swal.fire({
        icon: 'error',
        title: 'Submission Error',
        text: `Failed to ${isEditMode ? 'update' : 'create'} Quick GRN: ${error.response?.data?.message || error.message}`,
      });
    }
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
      quickGRNItems: [{ itemId: '', quantity: '', rate: '', discount: '', amount: '', totalAmount: '' }],
    });
    setErrors({});
    setIsEditMode(false);
    setEditId(null);
  };

  const handleCancel = () => {
    Swal.fire({
      title: 'Cancel Form?',
      text: 'Are you sure you want to cancel? All unsaved changes will be lost.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, cancel',
      cancelButtonText: 'Stay',
    }).then((result) => {
      if (result.isConfirmed) {
        resetForm();
        setIsFormVisible(false);
      }
    });
  };

  // Get selected Quick GRN data
  const selectedQGRN = quickGRNs.find((qgrn) => qgrn.qGRNId === selectedQGRNId);
  const selectedQGRNItems = selectedQGRN?.items || [];

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
                        <option key={inst.instituteId} value={inst.instituteId}>
                          {inst.instituteName}
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
                        <option key={fy.financialYearId} value={fy.financialYearId}>
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
                        <option key={vendor.vendorId} value={vendor.vendorId}>
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
                    type="file"
                    name="document"
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
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
                                <option key={it.itemId} value={it.itemId}>
                                  {it.itemName}
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