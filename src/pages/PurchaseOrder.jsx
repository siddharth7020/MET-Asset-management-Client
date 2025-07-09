import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import Table from '../components/Table';
import FormInput from '../components/FormInput';
import Details from '../components/Details';
import { getPurchaseOrders, createPurchaseOrder, updatePurchaseOrder, deletePurchaseOrder } from '../api/purchaseOrderService';
import axios from '../api/axiosInstance';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

function PurchaseOrder() {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [institutes, setInstitutes] = useState([]);
  const [financialYears, setFinancialYears] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [items, setItems] = useState([]);
  const [units, setUnits] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    poId: '',
    poDate: '',
    poNo: '',
    instituteId: '',
    financialYearId: '',
    vendorId: '',
    documents: [], // Changed to array for multiple files
    existingDocuments: [], // To track existing documents during edit
    requestedBy: '',
    remark: '',
    orderItems: [{ itemId: '', unitId: '', quantity: '', rate: '', amount: '', discount: '', totalAmount: '' }],
  });
  const [errors, setErrors] = useState({});
  const [editId, setEditId] = useState(null);
  const [expandedPoId, setExpandedPoId] = useState(null);
  const [selectedPoId, setSelectedPoId] = useState(null);
  const [currentLayout, setCurrentLayout] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const MySwal = withReactContent(Swal);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const poResponse = await getPurchaseOrders();
        setPurchaseOrders(poResponse.data);
        const institutesResponse = await axios.get('/institutes');
        if (Array.isArray(institutesResponse.data.data)) {
          setInstitutes(institutesResponse.data.data);
        } else {
          console.error('Expected institutes data to be an array, but got:', institutesResponse.data.data);
        }
        const fyResponse = await axios.get('/financialYears');
        if (Array.isArray(fyResponse.data.data)) {
          setFinancialYears(fyResponse.data.data);
        } else {
          console.error('Expected financial years data to be an array, but got:', fyResponse.data.data);
        }
        const vendorsResponse = await axios.get('/vendors');
        if (Array.isArray(vendorsResponse.data.data)) {
          setVendors(vendorsResponse.data.data);
        } else {
          console.error(errors);
        }
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

  const filteredPurchaseOrders = purchaseOrders.filter((po) => {
    const searchLower = searchQuery.toLowerCase();
    const poNo = po.poNo ? po.poNo.toLowerCase() : '';
    const instituteName = institutes.find((inst) => inst.instituteId === po.instituteId)?.instituteName?.toLowerCase() || '';
    const financialYear = financialYears.find((year) => year.financialYearId === po.financialYearId)?.year?.toLowerCase() || '';
    const vendorName = vendors.find((vend) => vend.vendorId === po.vendorId)?.name?.toLowerCase() || '';
    return (
      poNo.includes(searchLower) ||
      instituteName.includes(searchLower) ||
      financialYear.includes(searchLower) ||
      vendorName.includes(searchLower)
    );
  });

  const poColumns = [
    { key: 'poNo', label: 'PO Number' },
    {
      key: 'poDate',
      label: 'Date',
      format: (value) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'instituteId',
      label: 'Institute',
      format: (value) => institutes?.find((inst) => inst.instituteId === value)?.instituteName || 'N/A',
    },
    {
      key: 'financialYearId',
      label: 'Financial Year',
      format: (value) => financialYears?.find((year) => year.financialYearId === value)?.year || 'N/A',
    },
    {
      key: 'vendorId',
      label: 'Vendor',
      format: (value) => vendors?.find((vend) => vend.vendorId === value)?.name || 'N/A',
    },
  ];

  const orderItemColumns = [
    {
      key: 'itemId',
      label: 'Item',
      format: (value) => items?.find((item) => item.itemId === value)?.itemName || 'N/A',
    },
    {
      key: 'unitId',
      label: 'Unit',
      format: (value) => units?.find((unit) => unit.unitId === value)?.uniteName || 'N/A',
    },
    { key: 'quantity', label: 'Quantity' },
    { key: 'rate', label: 'Rate' },
    { key: 'amount', label: 'Amount' },
    { key: 'totalAmount', label: 'Total Amount' },
  ];

  const handleRowClick = (row) => {
    setSelectedPoId(row.poId);
    setCurrentLayout('details');
  };

  const handleBack = () => {
    setSelectedPoId(null);
    setCurrentLayout(null);
  };

  const actions = [
    {
      label: 'Edit',
      onClick: (row) => {
        setIsEditMode(true);
        setEditId(row.poId);
        const poItems = row.orderItems.map((oi) => ({
          id: oi.id,
          itemId: oi.itemId,
          unitId: oi.unitId,
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
          documents: [],
          existingDocuments: row.document || [],
          requestedBy: row.requestedBy,
          remark: row.remark,
          orderItems: poItems.length > 0 ? poItems : [{ itemId: '', unitId: '', quantity: '', rate: '', amount: '', discount: '', totalAmount: '' }],
        });
        setIsFormVisible(true);
      },
      className: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      label: 'Delete',
      onClick: async (row) => {
        const result = await MySwal.fire({
          title: 'Are you sure?',
          text: `Do you want to delete purchase order ${row.poNo}?`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes, delete it!',
          cancelButtonText: 'No, cancel!',
          reverseButtons: true,
        });
        if (result.isConfirmed) {
          try {
            await deletePurchaseOrder(row.poId);
            setPurchaseOrders((prev) => prev.filter((po) => po.poId !== row.poId));
            resetForm();
            MySwal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'Purchase order has been deleted successfully.',
            });
          } catch (error) {
            console.error('Error deleting purchase order:', error);
            MySwal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Failed to delete purchase order. Please try again.',
            });
          }
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
  ];

  const handleOrderItemChange = (index, e) => {
    const { name, value } = e.target;
    const updatedOrderItems = [...formData.orderItems];
    updatedOrderItems[index] = { ...updatedOrderItems[index], [name]: value };
    const quantity = parseFloat(updatedOrderItems[index].quantity) || 0;
    const rate = parseFloat(updatedOrderItems[index].rate) || 0;
    const discount = parseFloat(updatedOrderItems[index].discount) || 0;
    const amount = quantity * rate;
    const totalAmount = amount * (1 - (discount / 100)); // calculate total amount with discount
    updatedOrderItems[index].amount = amount.toFixed(2);
    updatedOrderItems[index].totalAmount = totalAmount.toFixed(2);
    setFormData((prev) => ({ ...prev, orderItems: updatedOrderItems }));
    setErrors((prev) => ({ ...prev, [`orderItems[${index}].${name}`]: '' }));
  };

  const addOrderItem = () => {
    setFormData((prev) => ({
      ...prev,
      orderItems: [...prev.orderItems, { itemId: '', unitId: '', quantity: '', rate: '', amount: '', discount: '', totalAmount: '' }],
    }));
  };

  const removeOrderItem = (index) => {
    if (formData.orderItems.length === 1) {
      MySwal.fire({
        icon: 'warning',
        title: 'Cannot Remove',
        text: 'At least one order item is required.',
      });
      return;
    }
    setFormData((prev) => ({
      ...prev,
      orderItems: prev.orderItems.filter((_, i) => i !== index),
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData((prev) => ({
      ...prev,
      documents: files,
    }));
    setErrors((prev) => ({ ...prev, documents: '' }));
  };

  // Remove a file from documents or existingDocuments
  const handleRemoveFile = (index, isExisting = false) => {
    if (isExisting) {
      setFormData(prev => ({
        ...prev,
        existingDocuments: prev.existingDocuments.filter((_, i) => i !== index),
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        documents: prev.documents.filter((_, i) => i !== index),
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.poDate) newErrors.poDate = 'PO date is required';
    if (!formData.instituteId) newErrors.instituteId = 'Institute is required';
    if (!formData.financialYearId) newErrors.financialYearId = 'Financial year is required';
    if (!formData.vendorId) newErrors.vendorId = 'Vendor is required';
    if (!formData.requestedBy) newErrors.requestedBy = 'Requested by is required';
    
    // Validate documents
    formData.documents.forEach((file, index) => {
      if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) {
        newErrors[`documents[${index}]`] = `File ${file.name}: Only PDF, JPEG, or PNG files are allowed`;
      }
      if (file.size > 10 * 1024 * 1024) {
        newErrors[`documents[${index}]`] = `File ${file.name}: Size must not exceed 10MB`;
      }
    });
    
    // Validate order items
    formData.orderItems.forEach((oi, index) => {
      if (!oi.itemId) newErrors[`orderItems[${index}].itemId`] = 'Item is required';
      if (!oi.unitId) newErrors[`orderItems[${index}].unitId`] = 'Unit is required';
      if (!oi.quantity || oi.quantity <= 0) newErrors[`orderItems[${index}].quantity`] = 'Quantity must be positive';
      if (!oi.rate || oi.rate <= 0) newErrors[`orderItems[${index}].rate`] = 'Rate must be positive';
      if (oi.discount < 0) newErrors[`orderItems[${index}].discount`] = 'Discount must be non-negative';
    });
    
    // Check for duplicate items
    const itemIds = formData.orderItems.map((oi) => oi.itemId);
    formData.orderItems.forEach((oi, index) => {
      if (oi.itemId) {
        const isDuplicate = itemIds.indexOf(oi.itemId) !== index;
        if (isDuplicate) {
          newErrors[`orderItems[${index}].itemId`] = 'This item is already selected';
        }
      }
    });
    
    return newErrors;
};

const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      MySwal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please fill all required fields correctly.',
      });
      return;
    }
    if (!Array.isArray(formData.orderItems) || formData.orderItems.length === 0) {
      MySwal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'At least one valid order item is required.',
      });
      return;
    }
    const formDataToSend = new FormData();
    formDataToSend.append('poDate', formData.poDate);
    formDataToSend.append('instituteId', Number(formData.instituteId));
    formDataToSend.append('financialYearId', Number(formData.financialYearId));
    formDataToSend.append('vendorId', Number(formData.vendorId));
    formDataToSend.append('requestedBy', formData.requestedBy);
    formDataToSend.append('remark', formData.remark);
    formDataToSend.append('orderItems', JSON.stringify(formData.orderItems.map((oi) => ({
      id: oi.id || undefined,
      itemId: Number(oi.itemId),
      unitId: Number(oi.unitId),
      quantity: Number(oi.quantity),
      rate: Number(oi.rate),
      amount: Number(oi.amount),
      discount: Number(oi.discount),
      totalAmount: Number(oi.totalAmount),
    }))));
    formDataToSend.append('existingDocuments', JSON.stringify(formData.existingDocuments));
    formData.documents.forEach((file) => {
      formDataToSend.append('documents', file);
    });

    try {
      if (isEditMode) {
        const response = await updatePurchaseOrder(editId, formDataToSend);
        setPurchaseOrders((prev) =>
          prev.map((po) => (po.poId === editId ? response.data : po))
        );
        MySwal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Purchase order updated successfully!',
        });
      } else {
        const response = await createPurchaseOrder(formDataToSend);
        setPurchaseOrders((prev) => [...prev, response.data]);
        MySwal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Purchase order created successfully!',
        });
      }
      resetForm();
      setIsFormVisible(false);
    } catch (error) {
      console.error('Error saving purchase order:', error);
      MySwal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to save purchase order. Please try again.',
      });
    }
};
  const resetForm = () => {
    setFormData({
      poId: '',
      poDate: '',
      poNo: '',
      instituteId: '',
      financialYearId: '',
      vendorId: '',
      documents: [],
      existingDocuments: [],
      requestedBy: '',
      remark: '',
      orderItems: [{ itemId: '', unitId: '', quantity: '', rate: '', amount: '', discount: '', totalAmount: '' }],
    });
    setErrors({});
    setIsEditMode(false);
    setEditId(null);
  };

  const selectedPo = purchaseOrders.find((po) => po.poId === selectedPoId);
  const selectedOrderItems = selectedPo?.orderItems || [];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {selectedPoId ? (
        <Details
          purchaseOrder={selectedPo}
          orderItems={selectedOrderItems}
          institutesData={institutes}
          financialYears={financialYears}
          vendors={vendors}
          items={items}
          units={units}
          onBack={handleBack}
        />
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-brand-secondary mb-4">Purchase Orders</h2>
            <div className="flex items-center space-x-4">
              <input
                type="text"
                placeholder="Search by PO Number, Institute, Financial Year, or Vendor"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 border border-gray-300 rounded-md shadow-sm p-2 focus:ring-brand-primary focus:border-brand-primary text-xs sm:text-sm"
              />
              <button
                onClick={() => setIsFormVisible(!isFormVisible)}
                className="bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-red-600"
              >
                {isFormVisible ? 'Hide Form' : 'Add Purchase Order'}
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
                    label="PO Date"
                    type="date"
                    name="poDate"
                    value={formData.poDate}
                    onChange={(e) => setFormData({ ...formData, poDate: e.target.value })}
                    error={errors.poDate}
                    required
                    className="w-full text-xs sm:text-sm"
                  />
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">Institute</label>
                    <Select
                      name="instituteId"
                      value={institutes.find((inst) => inst.instituteId === formData.instituteId) ? { value: formData.instituteId, label: institutes.find((inst) => inst.instituteId === formData.instituteId)?.intituteCode } : null}
                      onChange={(selectedOption) =>
                        setFormData({ ...formData, instituteId: selectedOption ? selectedOption.value : '' })
                      }
                      options={institutes.map((inst) => ({
                        value: inst.instituteId,
                        label: inst.intituteCode,
                      }))}
                      placeholder="Select Institute"
                      className="text-xs sm:text-sm"
                      classNamePrefix="react-select"
                      isClearable
                      required
                    />
                    {errors.instituteId && <p className="mt-1 text-xs text-red-600">{errors.instituteId}</p>}
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">Financial Year</label>
                    <Select
                      name="financialYearId"
                      value={financialYears.find((fy) => fy.financialYearId === formData.financialYearId) ? { value: formData.financialYearId, label: financialYears.find((fy) => fy.financialYearId === formData.financialYearId)?.year } : null}
                      onChange={(selectedOption) =>
                        setFormData({ ...formData, financialYearId: selectedOption ? selectedOption.value : '' })
                      }
                      options={financialYears.map((fy) => ({
                        value: fy.financialYearId,
                        label: fy.year,
                      }))}
                      placeholder="Select Financial Year"
                      className="text-xs sm:text-sm"
                      classNamePrefix="react-select"
                      isClearable
                      required
                    />
                    {errors.financialYearId && <p className="mt-1 text-xs text-red-600">{errors.financialYearId}</p>}
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">Vendor</label>
                    <Select
                      name="vendorId"
                      value={vendors.find((v) => v.vendorId === formData.vendorId) ? { value: formData.vendorId, label: vendors.find((v) => v.vendorId === formData.vendorId)?.name } : null}
                      onChange={(selectedOption) =>
                        setFormData({ ...formData, vendorId: selectedOption ? selectedOption.value : '' })
                      }
                      options={vendors.map((v) => ({
                        value: v.vendorId,
                        label: v.name,
                      }))}
                      placeholder="Select Vendor"
                      className="text-xs sm:text-sm"
                      classNamePrefix="react-select"
                      isClearable
                      required
                    />
                    {errors.vendorId && <p className="mt-1 text-xs text-red-600">{errors.vendorId}</p>}
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
                    {/* {formData.documents.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-600">Selected files:</p>
                        <ul className="list-disc pl-5 text-xs text-gray-600">
                          {formData.documents.map((file, index) => (
                            <li key={index}>{file.name}</li>
                          ))}
                        </ul>
                      </div>
                    )} */}
                    {isEditMode && formData.existingDocuments.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-600">Existing documents:</p>
                        <ul className="list-disc pl-5 text-xs text-gray-600">
                          {formData.existingDocuments.map((doc, index) => (
                            <li key={index} className="flex items-center">
                              <span>{doc.split('/').pop()}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveFile(index)}
                                className="ml-2 text-red-600 hover:text-red-800 text-xs"
                              >
                                Remove
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {formData.documents.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-700">New Files:</p>
                        <ul className="list-disc list-inside text-sm text-gray-600">
                          {formData.documents.map((file, index) => (
                            <li key={index} className="flex items-center justify-between">
                              <span>{file.name}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveFile(index, false)}
                                className="text-red-600 hover:text-red-800 text-xs"
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
                    label="Requested By"
                    type="text"
                    name="requestedBy"
                    value={formData.requestedBy}
                    onChange={(e) => setFormData({ ...formData, requestedBy: e.target.value })}
                    error={errors.requestedBy}
                    required
                    className="w-full text-xs sm:text-sm"
                  />
                  <FormInput
                    label="Remark"
                    type="text"
                    name="remark"
                    value={formData.remark}
                    onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
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
                            <Select
                              name="itemId"
                              value={
                                oi.itemId && items.find((item) => item.itemId === oi.itemId)
                                  ? { value: oi.itemId, label: items.find((item) => item.itemId === oi.itemId).itemName }
                                  : null
                              }
                              onChange={(selectedOption) =>
                                handleOrderItemChange(index, {
                                  target: { name: 'itemId', value: selectedOption ? selectedOption.value : '' },
                                })
                              }
                              options={items.map((item) => ({
                                value: item.itemId,
                                label: item.itemName,
                              }))}
                              placeholder="Select Item"
                              className="text-xs sm:text-sm"
                              classNamePrefix="react-select"
                              isClearable
                              required
                            />
                            {errors[`orderItems[${index}].itemId`] && (
                              <p className="mt-1 text-xs text-red-600">{errors[`orderItems[${index}].itemId`]}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700">Unit</label>
                            <Select
                              name="unitId"
                              value={
                                oi.unitId && units.find((unit) => unit.unitId === oi.unitId)
                                  ? { value: oi.unitId, label: units.find((unit) => unit.unitId === oi.unitId).uniteCode }
                                  : null
                              }
                              onChange={(selectedOption) =>
                                handleOrderItemChange(index, {
                                  target: { name: 'unitId', value: selectedOption ? selectedOption.value : '' },
                                })
                              }
                              options={units.map((unit) => ({
                                value: unit.unitId,
                                label: unit.uniteCode, // Corrected from 'uniteName' to 'unitName'
                              }))}
                              placeholder="Select Unit"
                              className="text-xs sm:text-sm"
                              classNamePrefix="react-select"
                              isClearable
                              required
                            />
                            {errors[`orderItems[${index}].unitId`] && (
                              <p className="mt-1 text-xs text-red-600">{errors[`orderItems[${index}].unitId`]}</p>
                            )}
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
                            label="Discount %"
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
                <Details />
              ) : (
                <Table
                  columns={poColumns}
                  data={filteredPurchaseOrders}
                  actions={actions}
                  onRowClick={handleRowClick}
                  expandable={{
                    expandedRowRender: (row) => (
                      <div className="p-4 bg-gray-50">
                        <h4 className="text-md font-medium text-brand-secondary mb-2">Order Items</h4>
                        <Table columns={orderItemColumns} data={row.orderItems} actions={[]} />
                      </div>
                    ),
                    rowExpandable: (row) => row.orderItems && row.orderItems.length > 0,
                    expandedRowKeys: expandedPoId ? [expandedPoId] : [],
                  }}
                />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default PurchaseOrder;