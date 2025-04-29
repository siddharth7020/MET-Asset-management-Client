import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import Table from '../components/Table';
import FormInput from '../components/FormInput';
import ReturnDetails from './ReturnDetails';

function Return() {
  const [returns, setReturns] = useState([]);
  const [returnItems, setReturnItems] = useState([]);
  const [distributions, setDistributions] = useState([]);
  const [distributionItems, setDistributionItems] = useState([]);
  const [items, setItems] = useState([]);
  const [financialYears, setFinancialYears] = useState([]);
  const [institutes, setInstitutes] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    distributionId: '',
    financialYearId: '',
    instituteId: '',
    employeeName: '',
    location: '',
    documents: null,
    remark: '',
    items: [{ itemId: '', returnQuantity: '' }],
  });
  const [errors, setErrors] = useState({});
  const [editId, setEditId] = useState(null);
  const [expandedReturnId, setExpandedReturnId] = useState(null);
  const [selectedReturnId, setSelectedReturnId] = useState(null);

  // Initialize dummy data
  useEffect(() => {
    const returnsData = [
      {
        id: 1,
        distributionId: 1,
        financialYearId: 1,
        instituteId: 1,
        employeeName: 'Shreya',
        location: 'Building A',
        documents: 'return_receipt.pdf',
        remark: 'Returned due to excess',
        createdAt: '2025-04-25T04:51:02.977Z',
        updatedAt: '2025-04-25T04:51:02.977Z',
      },
    ];
    const returnItemsData = [
      {
        id: 1,
        returnId: 1,
        itemId: 1,
        returnQuantity: 15,
        createdAt: '2025-04-25T04:51:02.990Z',
        updatedAt: '2025-04-25T04:51:02.990Z',
      },
    ];
    const distributionsData = [
      {
        id: 1,
        financialYearId: 1,
        instituteId: 1,
        employeeName: 'Shreya',
        location: 'Building A',
        documents: 'receipt.pdf',
        remark: 'Issued for project use',
        createdAt: '2025-04-25T04:37:50.729Z',
        updatedAt: '2025-04-25T04:37:50.729Z',
      },
    ];
    const distributionItemsData = [
      {
        id: 1,
        distributionId: 1,
        itemId: 2,
        issueQuantity: 10,
        createdAt: '2025-04-25T04:37:50.749Z',
        updatedAt: '2025-04-25T04:37:50.749Z',
      },
      {
        id: 2,
        distributionId: 1,
        itemId: 1,
        issueQuantity: 50,
        createdAt: '2025-04-25T04:37:50.749Z',
        updatedAt: '2025-04-25T04:37:50.749Z',
      },
    ];
    const itemsData = [
      { id: 1, itemName: 'Keyboard' },
      { id: 2, itemName: 'Laptop' },
    ];
    const financialYearsData = [{ id: 1, name: '2024-2025' }];
    const institutesData = [{ id: 1, name: 'Main Campus' }];

    setReturns(returnsData);
    setReturnItems(returnItemsData);
    setDistributions(distributionsData);
    setDistributionItems(distributionItemsData);
    setItems(itemsData);
    setFinancialYears(financialYearsData);
    setInstitutes(institutesData);
  }, []);

  // Form handling
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
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
      alert('At least one item is required');
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
    if (!formData.employeeName) newErrors.employeeName = 'Employee name is required';
    if (!formData.location) newErrors.location = 'Location is required';
    formData.items.forEach((item, index) => {
      if (!item.itemId) newErrors[`items[${index}].itemId`] = 'Item is required';
      if (!item.returnQuantity || Number(item.returnQuantity) <= 0)
        newErrors[`items[${index}].returnQuantity`] = 'Return quantity must be positive';
      if (formData.items.some((i, iIdx) => i.itemId === item.itemId && iIdx !== index))
        newErrors[`items[${index}].itemId`] = 'Duplicate item selected';
      if (formData.distributionId && item.itemId) {
        const distItems = distributionItems.filter((di) => di.distributionId === Number(formData.distributionId));
        if (!distItems.some((di) => di.itemId === Number(item.itemId)))
          newErrors[`items[${index}].itemId`] = 'Item not associated with selected distribution';
      }
    });
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const documentPath = formData.documents ? formData.documents.name : formData.documents;

    if (isEditMode) {
      setReturns((prev) =>
        prev.map((ret) =>
          ret.id === editId
            ? {
                ...formData,
                id: editId,
                distributionId: Number(formData.distributionId),
                financialYearId: Number(formData.financialYearId),
                instituteId: Number(formData.instituteId),
                documents: documentPath,
                createdAt: ret.createdAt,
                updatedAt: new Date().toISOString(),
              }
            : ret
        )
      );
      const updatedItems = formData.items.map((item, index) => ({
        id:
          returnItems.find((ri) => ri.returnId === editId && ri.itemId === Number(item.itemId))?.id ||
          Math.max(...returnItems.map((i) => i.id), 0) + index + 1,
        returnId: editId,
        itemId: Number(item.itemId),
        returnQuantity: Number(item.returnQuantity),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      setReturnItems((prev) => [
        ...prev.filter((ri) => ri.returnId !== editId),
        ...updatedItems,
      ]);
    } else {
      const newId = Math.max(...returns.map((ret) => ret.id), 0) + 1;
      setReturns((prev) => [
        ...prev,
        {
          ...formData,
          id: newId,
          distributionId: Number(formData.distributionId),
          financialYearId: Number(formData.financialYearId),
          instituteId: Number(formData.instituteId),
          documents: documentPath,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);
      const newItems = formData.items.map((item, index) => ({
        id: Math.max(...returnItems.map((i) => i.id), 0) + index + 1,
        returnId: newId,
        itemId: Number(item.itemId),
        returnQuantity: Number(item.returnQuantity),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      setReturnItems((prev) => [...prev, ...newItems]);
    }

    resetForm();
    setIsFormVisible(false);
  };

  const resetForm = () => {
    setFormData({
      distributionId: '',
      financialYearId: '',
      instituteId: '',
      employeeName: '',
      location: '',
      documents: null,
      remark: '',
      items: [{ itemId: '', returnQuantity: '' }],
    });
    setErrors({});
    setIsEditMode(false);
    setEditId(null);
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
      format: (value) => financialYears.find((fy) => fy.id === value)?.name || value,
    },
    {
      key: 'instituteId',
      label: 'Institute',
      format: (value) => institutes.find((inst) => inst.id === value)?.name || value,
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
      format: (value) => items.find((i) => i.id === value)?.itemName || 'N/A',
    },
    { key: 'returnQuantity', label: 'Return Quantity' },
  ];

  // Table actions
  const actions = [
    {
      label: 'Edit',
      onClick: (row) => {
        setIsEditMode(true);
        setEditId(row.id);
        const retItems = returnItems
          .filter((ri) => ri.returnId === row.id)
          .map((ri) => ({
            itemId: ri.itemId.toString(),
            returnQuantity: ri.returnQuantity.toString(),
          }));
        setFormData({
          distributionId: row.distributionId.toString(),
          financialYearId: row.financialYearId.toString(),
          instituteId: row.instituteId.toString(),
          employeeName: row.employeeName,
          location: row.location,
          documents: row.documents,
          remark: row.remark,
          items: retItems.length > 0 ? retItems : [{ itemId: '', returnQuantity: '' }],
        });
        setIsFormVisible(true);
      },
      className: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      label: 'Delete',
      onClick: (row) => {
        if (window.confirm(`Delete Return ${row.id}?`)) {
          setReturns((prev) => prev.filter((ret) => ret.id !== row.id));
          setReturnItems((prev) => prev.filter((ri) => ri.returnId !== row.id));
          resetForm();
        }
      },
      className: 'bg-red-500 hover:bg-red-600',
    },
    {
      label: 'View Items',
      onClick: (row) => {
        setExpandedReturnId(expandedReturnId === row.id ? null : row.id);
      },
      className: 'bg-green-500 hover:bg-green-600',
    },
  ];

  // react-select options
  const distributionOptions = distributions.map((dist) => ({
    value: dist.id.toString(),
    label: `Distribution ${dist.id}`,
  }));
  const financialYearOptions = financialYears.map((fy) => ({
    value: fy.id.toString(),
    label: fy.name,
  }));
  const instituteOptions = institutes.map((inst) => ({
    value: inst.id.toString(),
    label: inst.name,
  }));
  const getItemOptions = (distributionId) => {
    if (!distributionId) return [];
    const distItems = distributionItems.filter((di) => di.distributionId === Number(distributionId));
    return distItems.map((di) => ({
      value: di.itemId.toString(),
      label: items.find((i) => i.id === di.itemId)?.itemName || 'N/A',
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
                className="bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-red-600"
              >
                {isFormVisible ? 'Hide Form' : 'Manage Return'}
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-6 mb-6">
            {isFormVisible && (
              <div>
                <h3 className="text-base sm:text-lg font-medium text-brand-secondary mb-4">
                  {isEditMode ? 'Edit Return' : 'Add Return'}
                </h3>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">Distribution</label>
                    <Select
                      options={distributionOptions}
                      value={distributionOptions.find((option) => option.value === formData.distributionId)}
                      onChange={(option) => handleChange({ target: { name: 'distributionId', value: option ? option.value : '' } })}
                      className="mt-1 text-xs sm:text-sm"
                      classNamePrefix="select"
                      placeholder="Select Distribution"
                      isClearable
                    />
                    {errors.distributionId && (
                      <p className="mt-1 text-xs text-red-600">{errors.distributionId}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">Financial Year</label>
                    <Select
                      options={financialYearOptions}
                      value={financialYearOptions.find((option) => option.value === formData.financialYearId)}
                      onChange={(option) => handleChange({ target: { name: 'financialYearId', value: option ? option.value : '' } })}
                      className="mt-1 text-xs sm:text-sm"
                      classNamePrefix="select"
                      placeholder="Select Financial Year"
                      isClearable
                    />
                    {errors.financialYearId && (
                      <p className="mt-1 text-xs text-red-600">{errors.financialYearId}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">Institute</label>
                    <Select
                      options={instituteOptions}
                      value={instituteOptions.find((option) => option.value === formData.instituteId)}
                      onChange={(option) => handleChange({ target: { name: 'instituteId', value: option ? option.value : '' } })}
                      className="mt-1 text-xs sm:text-sm"
                      classNamePrefix="select"
                      placeholder="Select Institute"
                      isClearable
                    />
                    {errors.instituteId && (
                      <p className="mt-1 text-xs text-red-600">{errors.instituteId}</p>
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
                    className="w-full text-xs sm:text-sm"
                  />
                  <FormInput
                    label="Location"
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    error={errors.location}
                    required
                    className="w-full text-xs sm:text-sm"
                  />
                  <FormInput
                    label="Documents"
                    type="file"
                    name="documents"
                    onChange={handleChange}
                    error={errors.documents}
                    required={false}
                    className="w-full text-xs sm:text-sm"
                  />
                  <FormInput
                    label="Remark"
                    type="textarea"
                    name="remark"
                    value={formData.remark}
                    onChange={handleChange}
                    error={errors.remark}
                    required={false}
                    className="w-full text-xs sm:text-sm"
                  />
                  <div className="col-span-1 sm:col-span-2 lg:col-span-3">
                    <h4 className="text-sm sm:text-md font-medium text-brand-secondary mb-2">Return Items</h4>
                    {formData.items.map((item, index) => (
                      <div key={index} className="flex flex-col gap-4 mb-4 p-4 border rounded-md">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700">Item</label>
                            <Select
                              options={getItemOptions(formData.distributionId)}
                              value={getItemOptions(formData.distributionId).find((option) => option.value === item.itemId)}
                              onChange={(option) =>
                                handleItemChange(index, { target: { name: 'itemId', value: option ? option.value : '' } })
                              }
                              className="mt-1 text-xs sm:text-sm"
                              classNamePrefix="select"
                              placeholder="Select Item"
                              isClearable
                              isDisabled={!formData.distributionId}
                            />
                            {errors[`items[${index}].itemId`] && (
                              <p className="mt-1 text-xs text-red-600">{errors[`items[${index}].itemId`]}</p>
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
                            className="w-full text-xs sm:text-sm"
                            min="1"
                          />
                          <div className="flex items-end">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(index)}
                              className="w-full sm:w-auto text-red-600 hover:text-red-800 text-xs sm:text-sm mt-2"
                              disabled={formData.items.length === 1}
                            >
                              Remove Item
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="w-full sm:w-auto bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 text-xs sm:text-sm"
                    >
                      Add Item
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