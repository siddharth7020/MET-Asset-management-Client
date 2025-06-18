import React, { useState, useEffect } from 'react';
import Table from '../components/Table';
import FormInput from '../components/FormInput';
import QuickGRNDetails from './QuickGRNDetails';
import { getQuickGRNs, createQuickGRN } from '../api/quickGRNServices';
import axios from '../api/axiosInstance';
import Swal from 'sweetalert2';
import Select from 'react-select';

function QuickGRN() {
  const [quickGRNs, setQuickGRNs] = useState([]);
  const [institutes, setInstitutes] = useState([]);
  const [financialYears, setFinancialYears] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [items, setItems] = useState([]);
  const [units, setUnits] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [formData, setFormData] = useState({
    qGRNDate: '',
    instituteId: '',
    financialYearId: '',
    vendorId: '',
    documents: [],
    existingDocuments: [],
    challanNo: '',
    challanDate: '',
    requestedBy: '',
    remark: '',
    quickGRNItems: [{ storeCode: '', itemId: '', unitId: '', quantity: '', rate: '', discount: '', amount: '', totalAmount: '' }],
  });
  const [errors, setErrors] = useState({});
  const [selectedQGRNId, setSelectedQGRNId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const quickGRNsResponse = await getQuickGRNs();
        setQuickGRNs(quickGRNsResponse.data);

        const institutesResponse = await axios.get('/institutes');
        if (Array.isArray(institutesResponse.data.data)) {
          setInstitutes(institutesResponse.data.data);
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Data Error',
            text: 'Failed to load institutes data.',
          });
        }

        const fyResponse = await axios.get('/financialYears');
        if (Array.isArray(fyResponse.data.data)) {
          setFinancialYears(fyResponse.data.data);
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Data Error',
            text: 'Failed to load financial years data.',
          });
        }

        const vendorsResponse = await axios.get('/vendors');
        if (Array.isArray(vendorsResponse.data.data)) {
          setVendors(vendorsResponse.data.data);
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Data Error',
            text: 'Failed to load vendors data.',
          });
        }

        const itemsResponse = await axios.get('/items');
        if (Array.isArray(itemsResponse.data.items)) {
          setItems(itemsResponse.data.items);
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Data Error',
            text: 'Failed to load items data.',
          });
        }

        const unitsResponse = await axios.get('/units');
        if (Array.isArray(unitsResponse.data.data)) {
          setUnits(unitsResponse.data.data);
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Data Error',
            text: 'Failed to load units data.',
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

  const filteredQuickGRNs = quickGRNs.filter((qgrn) => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    const qGRNNo = qgrn.qGRNNo ? qgrn.qGRNNo.toLowerCase() : '';
    const challanNo = qgrn.challanNo ? qgrn.challanNo.toLowerCase() : '';
    const instituteName = institutes.find((inst) => inst.instituteId === qgrn.instituteId)?.instituteName?.toLowerCase() || '';
    const vendorName = vendors.find((v) => v.vendorId === qgrn.vendorId)?.name?.toLowerCase() || '';
    const requestedBy = qgrn.requestedBy ? qgrn.requestedBy.toLowerCase() : '';
    const remark = qgrn.remark ? qgrn.remark.toLowerCase() : '';
    return (
      qGRNNo.includes(searchLower) ||
      challanNo.includes(searchLower) ||
      instituteName.includes(searchLower) ||
      vendorName.includes(searchLower) ||
      requestedBy.includes(searchLower) ||
      remark.includes(searchLower)
    );
  });

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
    { key: 'challanNo', label: 'Challan No' },
  ];

  const handleRowClick = (row) => {
    setSelectedQGRNId(row.qGRNId);
  };

  const handleBack = () => {
    setSelectedQGRNId(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleFileChange = (e) => {
    if (!e.target || !e.target.files) return;
    const files = Array.from(e.target.files);
    setFormData((prev) => ({
      ...prev,
      documents: files,
    }));
    setErrors((prev) => ({ ...prev, documents: '' }));
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const updatedItems = [...formData.quickGRNItems];
    updatedItems[index] = { ...updatedItems[index], [name]: value };

    const quantity = Number(updatedItems[index].quantity) || 0;
    const rate = Number(updatedItems[index].rate) || 0;
    const discount = Number(updatedItems[index].discount) || 0;
    const amount = quantity * rate;
    const totalAmount = amount * (1 - discount / 100);

    updatedItems[index].amount = amount.toFixed(2);
    updatedItems[index].totalAmount = totalAmount.toFixed(2);

    setFormData((prev) => ({ ...prev, quickGRNItems: updatedItems }));
    setErrors((prev) => ({ ...prev, [`quickGRNItems[${index}].${name}`]: '' }));
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      quickGRNItems: [...prev.quickGRNItems, { storeCode: '', itemId: '', unitId: '', quantity: '', rate: '', discount: '', amount: '', totalAmount: '' }],
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
    if (!formData.instituteId || !institutes.some((inst) => inst.instituteId === Number(formData.instituteId))) {
      newErrors.instituteId = 'A valid institute is required';
    }
    if (!formData.financialYearId || !financialYears.some((fy) => fy.financialYearId === Number(formData.financialYearId))) {
      newErrors.financialYearId = 'A valid financial year is required';
    }
    if (!formData.vendorId || !vendors.some((v) => v.vendorId === Number(formData.vendorId))) {
      newErrors.vendorId = 'A valid vendor is required';
    }
    if (!formData.requestedBy.trim()) newErrors.requestedBy = 'Requested By is required';
    formData.documents.forEach((file, index) => {
      if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) {
        newErrors[`documents[${index}]`] = `File ${file.name}: Only PDF, JPEG, or PNG files are allowed`;
      }
      if (file.size > 10 * 1024 * 1024) {
        newErrors[`documents[${index}]`] = `File ${file.name}: Size must not exceed 10MB`;
      }
    });

    formData.quickGRNItems.forEach((item, index) => {
      if (!item.itemId || !items.some((it) => it.itemId === Number(item.itemId))) {
        newErrors[`quickGRNItems[${index}].itemId`] = 'A valid item is required';
      }
      if (!item.unitId || !units.some((u) => u.unitId === Number(item.unitId))) {
        newErrors[`quickGRNItems[${index}].unitId`] = 'A valid unit is required';
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
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        html: Object.values(newErrors).map((err) => `<p>${err}</p>`).join(''),
        confirmButtonColor: '#d33',
      });
      return;
    }

    const formDataPayload = new FormData();
    formDataPayload.append('qGRNDate', formData.qGRNDate);
    formDataPayload.append('instituteId', Number(formData.instituteId));
    formDataPayload.append('financialYearId', Number(formData.financialYearId));
    formDataPayload.append('vendorId', Number(formData.vendorId));
    if (formData.challanNo) formDataPayload.append('challanNo', formData.challanNo.trim());
    if (formData.challanDate) formDataPayload.append('challanDate', formData.challanDate);
    formDataPayload.append('requestedBy', formData.requestedBy.trim());
    if (formData.remark) formDataPayload.append('remark', formData.remark.trim());

    formData.documents.forEach((file) => {
      formDataPayload.append('documents', file);
    });

    formDataPayload.append('quickGRNItems', JSON.stringify(formData.quickGRNItems.map((item) => ({
      itemId: Number(item.itemId),
      unitId: Number(item.unitId),
      quantity: Number(item.quantity),
      rate: Number(item.rate),
      discount: Number(item.discount) || 0,
    }))));

    try {
      const response = await createQuickGRN(formDataPayload);
      setQuickGRNs((prev) => [...prev, response.data]);
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Quick GRN created successfully.',
        timer: 1500,
        showConfirmButton: false,
      });
      resetForm();
      setIsFormVisible(false);
    } catch (error) {
      console.error('Error creating Quick GRN:', error);
      Swal.fire({
        icon: 'error',
        title: 'Submission Error',
        text: `Failed to create Quick GRN: ${error.response?.data?.message || error.message}`,
      });
    }
  };

  const resetForm = () => {
    setFormData({
      qGRNDate: '',
      instituteId: '',
      financialYearId: '',
      vendorId: '',
      documents: [],
      existingDocuments: [],
      challanNo: '',
      challanDate: '',
      requestedBy: '',
      remark: '',
      quickGRNItems: [{ itemId: '', unitId: '', quantity: '', rate: '', discount: '', amount: '', totalAmount: '' }],
    });
    setErrors({});
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
          units={units}
          onBack={handleBack}
        />
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-brand-secondary">Quick GRN</h2>
            <div className="flex items-center space-x-4">
              <input
                type="text"
                placeholder="Search by GRN Number, Challan Number, Institute, or Vendor"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 border border-gray-300 rounded-md shadow-sm p-2 focus:ring-brand-primary focus:border-brand-primary text-sm"
              />
              <button
                onClick={() => setIsFormVisible(!isFormVisible)}
                className="bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-brand-primary-dark text-sm"
              >
                {isFormVisible ? 'Hide Form' : 'Create Quick GRN'}
              </button>
            </div>
          </div>
          {isFormVisible && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-brand-secondary mb-4">Add Quick GRN</h3>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormInput
                  label="Quick GRN Date"
                  type="date"
                  name="qGRNDate"
                  value={formData.qGRNDate}
                  onChange={handleChange}
                  error={errors.qGRNDate}
                  required
                  className="w-full text-sm"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700">Institute</label>
                  <select
                    name="instituteId"
                    value={formData.instituteId}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-brand-primary focus:border-brand-primary text-sm"
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
                  <label className="block text-sm font-medium text-gray-700">Financial Year</label>
                  <select
                    name="financialYearId"
                    value={formData.financialYearId}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-brand-primary focus:border-brand-primary text-sm"
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
                  <label className="block text-sm font-medium text-gray-700">Vendor</label>
                  <select
                    name="vendorId"
                    value={formData.vendorId}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-brand-primary focus:border-brand-primary text-sm"
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
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700">Documents</label>
                  <input
                    type="file"
                    name="documents"
                    multiple
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="block w-full border border-gray-300 rounded-md shadow-sm p-2 text-xs sm:text-sm"
                  />
                  {errors.documents && <p className="mt-1 text-xs text-red-600">{errors.documents}</p>}
                  {formData.documents.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-600">Selected files:</p>
                      <ul className="list-disc pl-5 text-xs text-gray-600">
                        {formData.documents.map((file, index) => (
                          <li key={index}>{file.name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <FormInput
                  label="Challan Number"
                  type="text"
                  name="challanNo"
                  value={formData.challanNo}
                  onChange={handleChange}
                  error={errors.challanNo}
                  required={false}
                  className="w-full text-sm"
                />
                <FormInput
                  label="Challan Date"
                  type="date"
                  name="challanDate"
                  value={formData.challanDate}
                  onChange={handleChange}
                  error={errors.challanDate}
                  required={false}
                  className="w-full text-sm"
                />
                <FormInput
                  label="Requested By"
                  type="text"
                  name="requestedBy"
                  value={formData.requestedBy}
                  onChange={handleChange}
                  error={errors.requestedBy}
                  required
                  className="w-full text-sm"
                />
                <FormInput
                  label="Remark"
                  type="text"
                  name="remark"
                  value={formData.remark}
                  onChange={handleChange}
                  error={errors.remark}
                  required={false}
                  className="w-full text-sm"
                />
                <div className="col-span-1 sm:col-span-2 lg:col-span-3">
                  <h4 className="text-md font-medium text-brand-secondary mb-2">Quick GRN Items</h4>
                  {formData.quickGRNItems.map((item, index) => (
                    <div key={index} className="flex flex-col gap-4 mb-4 p-4 border rounded-md">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700">Item</label>
                          <Select
                            name="itemId"
                            value={items.find((it) => it.itemId === Number(item.itemId)) || null}
                            onChange={(selectedOption) =>
                              handleItemChange(index, {
                                target: {
                                  name: 'itemId',
                                  value: selectedOption ? selectedOption.value : '',
                                },
                              })
                            }
                            options={items.map((it) => ({
                              value: it.itemId,
                              label: it.itemName,
                            }))}
                            placeholder="Select Item"
                            className="text-xs sm:text-sm"
                            classNamePrefix="react-select"
                            isClearable
                            required
                          />
                          {errors[`quickGRNItems[${index}].itemId`] && (
                            <p className="mt-1 text-xs text-red-600">{errors[`quickGRNItems[${index}].itemId`]}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700">Unit</label>
                          <Select
                            name="unitId"
                            value={units.find((unit) => unit.unitId === Number(item.unitId)) || null}
                            onChange={(selectedOption) =>
                              handleItemChange(index, {
                                target: {
                                  name: 'unitId',
                                  value: selectedOption ? selectedOption.value : '',
                                },
                              })
                            }
                            options={units.map((unit) => ({
                              value: unit.unitId,
                              label: unit.unitCode,
                            }))}
                            placeholder="Select Unit"
                            className="text-xs sm:text-sm"
                            classNamePrefix="react-select"
                            isClearable
                            required
                          />
                          {errors[`quickGRNItems[${index}].unitId`] && (
                            <p className="mt-1 text-xs text-red-600">{errors[`quickGRNItems[${index}].unitId`]}</p>
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
                          min="0.01"
                          step="0.01"
                          className="w-full text-sm"
                        />
                        <FormInput
                          label="Rate"
                          type="number"
                          name="rate"
                          value={item.rate}
                          onChange={(e) => handleItemChange(index, e)}
                          error={errors[`quickGRNItems[${index}].rate`]}
                          required
                          min="0.01"
                          step="0.01"
                          className="w-full text-sm"
                        />
                        <FormInput
                          label="Amount"
                          type="text"
                          name="amount"
                          value={item.amount}
                          disabled
                          required={false}
                          className="w-full text-sm"
                        />
                        <FormInput
                          label="Discount"
                          type="number"
                          name="discount"
                          value={item.discount}
                          onChange={(e) => handleItemChange(index, e)}
                          error={errors[`quickGRNItems[${index}].discount`]}
                          required={false}
                          min="0"
                          step="0.01"
                          className="w-full text-sm"
                        />
                        <FormInput
                          label="Total Amount"
                          type="text"
                          name="totalAmount"
                          value={item.totalAmount}
                          disabled
                          required={false}
                          className="w-full text-sm"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-800 text-sm mt-2"
                      >
                        Remove Item
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addItem}
                    className="w-full sm:w-auto bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 text-sm"
                  >
                    Add Quick GRN Item
                  </button>
                </div>
                <div className="col-span-1 sm:col-span-2 lg:col-span-3 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                  <button
                    type="submit"
                    className="w-full sm:w-auto bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-brand-primary-dark text-sm"
                  >
                    Add Quick GRN
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="w-full sm:w-auto px-4 py-2 text-gray-600 rounded-md hover:bg-gray-100 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
          <Table
            columns={quickGRNColumns}
            data={filteredQuickGRNs}
            onRowClick={handleRowClick}
          />
        </>
      )}
    </div>
  );
}

export default QuickGRN;