import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import Table from '../components/Table';
import FormInput from '../components/FormInput';
import ReturnDetails from './ReturnDetails';
import { getAllReturns, createReturn } from '../api/returnService';
import { getAllDistributions } from '../api/distributionService';
import axios from '../api/axiosInstance';
import Swal from 'sweetalert2';

function Return() {
  const [returns, setReturns] = useState([]);
  const [returnItems, setReturnItems] = useState([]);
  const [distributions, setDistributions] = useState([]);
  const [distributionItems, setDistributionItems] = useState([]);
  const [items, setItems] = useState([]);
  const [financialYears, setFinancialYears] = useState([]);
  const [institutes, setInstitutes] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [formData, setFormData] = useState({
    distributionId: '',
    financialYearId: '',
    instituteId: '',
    employeeName: '',
    location: '',
    documents: '',
    remark: '',
    items: [{ itemId: '', returnQuantity: '' }],
  });
  const [errors, setErrors] = useState({});
  const [selectedReturnId, setSelectedReturnId] = useState(null);
  const [expandedReturnId, setExpandedReturnId] = useState(null);

  // Fetch all necessary data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch returns
        const returnsResponse = await getAllReturns();
        const returnsData = returnsResponse.data;
        const returnItemsData = returnsData.flatMap(ret => ret.items || []);
        setReturns(returnsData);
        setReturnItems(returnItemsData);

        // Fetch distributions
        const distributionsResponse = await getAllDistributions();
        const distributionsData = distributionsResponse.data;
        const distributionItemsData = distributionsData.flatMap(dist => dist.items || []);
        setDistributions(distributionsData);
        setDistributionItems(distributionItemsData);

        // Fetch items
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

        // Fetch financial years
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

        // Fetch institutes
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

  // Form handling
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    if (name === 'distributionId') {
      setFormData((prev) => ({
        ...prev,
        items: [{ itemId: '', returnQuantity: '' }],
      }));
      setErrors((prev) => {
        const newErrors = { ...prev };
        Object.keys(newErrors).forEach((key) => {
          if (key.startsWith('items[')) delete newErrors[key];
        });
        return newErrors;
      });
    }
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [name]: value };
      return { ...prev, items: newItems };
    });
    setErrors((prev) => ({ ...prev, [`items[${index}].${name}`]: '' }));
  };

  const handleAddItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { itemId: '', returnQuantity: '' }],
    }));
  };

  const handleRemoveItem = (index) => {
    if (formData.items.length === 1) {
      Swal.fire({
        icon: 'warning',
        title: 'Cannot Remove',
        text: 'At least one item is required.',
      });
      return;
    }
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
    setErrors((prev) => {
      const newErrors = { ...prev };
      Object.keys(newErrors).forEach((key) => {
        if (key.startsWith(`items[${index}]`)) delete newErrors[key];
      });
      return newErrors;
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.distributionId) newErrors.distributionId = 'Distribution is required';
    if (!formData.financialYearId) newErrors.financialYearId = 'Financial year is required';
    if (!formData.instituteId) newErrors.instituteId = 'Institute is required';
    if (!formData.employeeName.trim()) newErrors.employeeName = 'Employee name is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (formData.items.length === 0) newErrors.items = 'At least one item is required';
    formData.items.forEach((item, index) => {
      if (!item.itemId) newErrors[`items[${index}].itemId`] = 'Item is required';
      if (!item.returnQuantity || Number(item.returnQuantity) <= 0)
        newErrors[`items[${index}].returnQuantity`] = 'Return quantity must be positive';
      if (formData.items.some((i, iIdx) => i.itemId === item.itemId && iIdx !== index))
        newErrors[`items[${index}].itemId`] = 'Duplicate item selected';
      if (formData.distributionId && item.itemId) {
        const distItems = distributionItems.filter((di) => di.distributionId === Number(formData.distributionId));
        const distItem = distItems.find((di) => di.itemId === Number(item.itemId));
        if (!distItem) {
          newErrors[`items[${index}].itemId`] = 'Item not associated with selected distribution';
        } else if (Number(item.returnQuantity) > distItem.issueQuantity) {
          newErrors[`items[${index}].returnQuantity`] = `Return quantity exceeds issued quantity (${distItem.issueQuantity})`;
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
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        html: Object.values(newErrors).map((err) => `<p>${err}</p>`).join(''),
      });
      return;
    }

    const payload = {
      distributionId: Number(formData.distributionId),
      financialYearId: Number(formData.financialYearId),
      instituteId: Number(formData.instituteId),
      employeeName: formData.employeeName.trim(),
      location: formData.location.trim(),
      documents: formData.documents.trim() || '',
      remark: formData.remark.trim() || '',
      items: formData.items.map((item) => ({
        itemId: Number(item.itemId),
        returnQuantity: Number(item.returnQuantity),
      })),
    };

    try {
      const response = await createReturn(payload);
      const newReturn = response.data.data || response.data;
      setReturns((prev) => [...prev, newReturn]);
      setReturnItems((prev) => [...prev, ...(newReturn.items || [])]);
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Return created successfully.',
        timer: 1500,
        showConfirmButton: false,
      });
      resetForm();
      setIsFormVisible(false);
    } catch (error) {
      console.error('Error creating return:', error);
      Swal.fire({
        icon: 'error',
        title: 'Submission Error',
        text: error.response?.data?.message || 'Failed to create return.',
      });
    }
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

  const resetForm = () => {
    setFormData({
      distributionId: '',
      financialYearId: '',
      instituteId: '',
      employeeName: '',
      location: '',
      documents: '',
      remark: '',
      items: [{ itemId: '', returnQuantity: '' }],
    });
    setErrors({});
    setIsFormVisible(false);
  };

  // Handle row click to show details
  const handleRowClick = (row) => {
    setSelectedReturnId(row.id);
  };

  // Handle back to table view
  const handleBack = () => {
    setSelectedReturnId(null);
  };

  // Table columns for Return
  const returnColumns = [
    { key: 'distributionId', label: 'Distribution ID' },
    {
      key: 'financialYearId',
      label: 'Financial Year',
      format: (value) => financialYears.find((fy) => fy.financialYearId === value)?.year || 'N/A',
    },
    {
      key: 'instituteId',
      label: 'Institute',
      format: (value) => institutes.find((inst) => inst.instituteId === value)?.instituteName || 'N/A',
    },
    { key: 'employeeName', label: 'Employee Name' },
    { key: 'location', label: 'Location' },
    {
      key: 'createdAt',
      label: 'Created At',
      format: (value) => new Date(value).toLocaleDateString(),
    },
  ];

  // Table columns for ReturnItem
  const returnItemColumns = [
    {
      key: 'itemId',
      label: 'Item',
      format: (value) => items.find((i) => i.itemId === value)?.itemName || 'N/A',
    },
    { key: 'returnQuantity', label: 'Return Quantity' },
  ];

  // Table actions
  const actions = [
    // Edit action disabled as no updateReturn API is provided
    /* {
      label: 'Edit',
      onClick: async (row) => {
        try {
          const response = await getReturnById(row.id);
          const returnData = response.data;
          setIsEditMode(true);
          setEditId(row.id);
          setFormData({
            distributionId: returnData.distributionId.toString(),
            financialYearId: returnData.financialYearId.toString(),
            instituteId: returnData.instituteId.toString(),
            employeeName: returnData.employeeName,
            location: returnData.location,
            documents: returnData.documents || '',
            remark: returnData.remark || '',
            items: returnData.items.length > 0
              ? returnData.items.map((item) => ({
                  itemId: item.itemId.toString(),
                  returnQuantity: item.returnQuantity.toString(),
                }))
              : [{ itemId: '', returnQuantity: '' }],
          });
          setIsFormVisible(true);
        } catch (error) {
          console.error('Error fetching return for edit:', error);
          Swal.fire({
            icon: 'error',
            title: 'Edit Error',
            text: 'Failed to load return data.',
          });
        }
      },
      className: 'bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs sm:text-sm',
    }, */
    {
      label: 'Delete',
      onClick: (row) => {
        Swal.fire({
          title: 'Are you sure?',
          text: `Do you want to delete Return ${row.id}?`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6',
          confirmButtonText: 'Yes, delete it!',
          cancelButtonText: 'Cancel',
        }).then(async (result) => {
          if (result.isConfirmed) {
            try {
              // Note: No delete API provided, so simulating frontend deletion
              setReturns((prev) => prev.filter((ret) => ret.id !== row.id));
              setReturnItems((prev) => prev.filter((ri) => ri.returnId !== row.id));
              Swal.fire({
                icon: 'success',
                title: 'Deleted!',
                text: `Return ${row.id} has been deleted.`,
                timer: 1500,
                showConfirmButton: false,
              });
            } catch (error) {
              console.error('Error deleting return:', error);
              Swal.fire({
                icon: 'error',
                title: 'Delete Error',
                text: 'Failed to delete return.',
              });
            }
          }
        });
      },
      className: 'bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs sm:text-sm',
    },
    {
      label: 'View Items',
      onClick: (row) => {
        setExpandedReturnId(expandedReturnId === row.id ? null : row.id);
      },
      className: 'bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs sm:text-sm',
    },
  ];

  // react-select options
  const distributionOptions = distributions.map((dist) => ({
    value: dist.id.toString(),
    label: `Distribution ${dist.id} - ${dist.employeeName} (${dist.location})`,
  }));
  const financialYearOptions = financialYears.map((fy) => ({
    value: fy.financialYearId.toString(),
    label: fy.year,
  }));
  const instituteOptions = institutes.map((inst) => ({
    value: inst.instituteId.toString(),
    label: inst.instituteName,
  }));
  const getItemOptions = (distributionId) => {
    if (!distributionId) return [];
    const distItems = distributionItems.filter((di) => di.distributionId === Number(distributionId));
    return distItems.map((di) => ({
      value: di.itemId.toString(),
      label: `${items.find((i) => i.itemId === di.itemId)?.itemName || 'N/A'} (Issued: ${di.issueQuantity})`,
    }));
  };

  // Get selected return data
  const selectedReturn = returns.find((ret) => ret.id === selectedReturnId);
  const selectedReturnItems = returnItems.filter((ri) => ri.returnId === selectedReturnId);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {selectedReturnId ? (
        <ReturnDetails
          returnData={selectedReturn}
          returnItems={selectedReturnItems}
          institutes={institutes}
          financialYears={financialYears}
          distributions={distributions}
          items={items}
          onBack={handleBack}
        />
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-brand-secondary mb-4">Returns</h2>
            <div>
              <button
                onClick={() => setIsFormVisible(!isFormVisible)}
                className="bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-red-600 text-sm"
              >
                {isFormVisible ? 'Hide Form' : 'Manage Return'}
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-6 mb-6">
            {isFormVisible && (
              <div>
                <h3 className="text-lg font-medium text-brand-secondary mb-4">
                  Add Return
                </h3>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Distribution</label>
                    <Select
                      options={distributionOptions}
                      value={distributionOptions.find((option) => option.value === formData.distributionId)}
                      onChange={(option) => handleChange({ target: { name: 'distributionId', value: option ? option.value : '' } })}
                      className="mt-1 text-sm"
                      classNamePrefix="select"
                      placeholder="Select Distribution"
                      isClearable
                    />
                    {errors.distributionId && (
                      <p className="mt-1 text-sm text-red-600">{errors.distributionId}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Financial Year</label>
                    <Select
                      options={financialYearOptions}
                      value={financialYearOptions.find((option) => option.value === formData.financialYearId)}
                      onChange={(option) => handleChange({ target: { name: 'financialYearId', value: option ? option.value : '' } })}
                      className="mt-1 text-sm"
                      classNamePrefix="select"
                      placeholder="Select Financial Year"
                      isClearable
                    />
                    {errors.financialYearId && (
                      <p className="mt-1 text-sm text-red-600">{errors.financialYearId}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Institute</label>
                    <Select
                      options={instituteOptions}
                      value={instituteOptions.find((option) => option.value === formData.instituteId)}
                      onChange={(option) => handleChange({ target: { name: 'instituteId', value: option ? option.value : '' } })}
                      className="mt-1 text-sm"
                      classNamePrefix="select"
                      placeholder="Select Institute"
                      isClearable
                    />
                    {errors.instituteId && (
                      <p className="mt-1 text-sm text-red-600">{errors.instituteId}</p>
                    )}
                  </div>
                  <FormInput
                    label="Employee Name"
                    type="text"
                    name="employeeName"
                    value={formData.employeeName}
                    onChange={handleChange}
                    error={errors.employeeName}
                    required
                    className="w-full text-sm"
                  />
                  <FormInput
                    label="Location"
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    error={errors.location}
                    required
                    className="w-full text-sm"
                  />
                  <FormInput
                    label="Documents"
                    type="text"
                    name="documents"
                    value={formData.documents}
                    onChange={handleChange}
                    error={errors.documents}
                    required={false}
                    className="w-full text-sm"
                  />
                  <FormInput
                    label="Remark"
                    type="textarea"
                    name="remark"
                    value={formData.remark}
                    onChange={handleChange}
                    error={errors.remark}
                    required={false}
                    className="w-full text-sm"
                  />
                  <div className="col-span-3">
                    <h4 className="text-md font-medium text-brand-secondary mb-2">Return Items</h4>
                    {formData.items.map((item, index) => (
                      <div key={index} className="flex flex-col gap-4 mb-4 p-4 border rounded-md">
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Item</label>
                            <Select
                              options={getItemOptions(formData.distributionId)}
                              value={getItemOptions(formData.distributionId).find((option) => option.value === item.itemId)}
                              onChange={(option) =>
                                handleItemChange(index, { target: { name: 'itemId', value: option ? option.value : '' } })
                              }
                              className="mt-1 text-sm"
                              classNamePrefix="select"
                              placeholder="Select Item"
                              isClearable
                              isDisabled={!formData.distributionId}
                            />
                            {errors[`items[${index}].itemId`] && (
                              <p className="mt-1 text-sm text-red-600">{errors[`items[${index}].itemId`]}</p>
                            )}
                          </div>
                          <FormInput
                            label="Return Quantity"
                            type="number"
                            name="returnQuantity"
                            value={item.returnQuantity}
                            onChange={(e) => handleItemChange(index, e)}
                            error={errors[`items[${index}].returnQuantity`]}
                            required
                            className="w-full text-sm"
                            min="1"
                          />
                          <div className="flex items-end">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(index)}
                              className="w-full bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600 text-sm"
                              disabled={formData.items.length === 1}
                            >
                              Remove Item
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {errors.items && (
                      <p className="mt-1 text-sm text-red-600">{errors.items}</p>
                    )}
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="mt-2 w-full bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-red-600 text-sm"
                    >
                      Add Item
                    </button>
                  </div>
                  <div className="col-span-3 flex space-x-4">
                    <button
                      type="submit"
                      className="bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-red-600 text-sm"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-4 py-2 text-gray-600 rounded-md hover:bg-gray-100 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
            <div>
              <Table
                columns={returnColumns}
                data={returns}
                actions={actions}
                onRowClick={handleRowClick}
                expandable={{
                  expandedRowRender: (row) => (
                    <div className="p-4 bg-gray-50">
                      <h4 className="text-md font-medium text-brand-secondary mb-2">Return Items</h4>
                      <Table
                        columns={returnItemColumns}
                        data={returnItems.filter((ri) => ri.returnId === row.id)}
                        actions={[]}
                      />
                    </div>
                  ),
                  rowExpandable: (row) => returnItems.some((ri) => ri.returnId === row.id),
                  expandedRowKeys: expandedReturnId ? [expandedReturnId] : [],
                }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Return;