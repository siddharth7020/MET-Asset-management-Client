import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import Table from '../components/Table';
import FormInput from '../components/FormInput';
import DistributionDetails from './DistributionDetails';

function Distribution() {
  const [distributions, setDistributions] = useState([]);
  const [distributionItems, setDistributionItems] = useState([]);
  const [items, setItems] = useState([]);
  const [financialYears, setFinancialYears] = useState([]);
  const [institutes, setInstitutes] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    financialYearId: '',
    instituteId: '',
    employeeName: '',
    location: '',
    documents: null,
    remark: '',
    items: [{ itemId: '', issueQuantity: '' }],
  });
  const [errors, setErrors] = useState({});
  const [editId, setEditId] = useState(null);
  const [selectedDistributionId, setSelectedDistributionId] = useState(null);

  // Initialize dummy data
  useEffect(() => {
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
      items: [...prev.items, { itemId: '', issueQuantity: '' }],
    }));
  };

  const handleRemoveItem = (index) => {
    setFormData((prev) => {
      const newItems = prev.items.filter((_, i) => i !== index);
      return { ...prev, items: newItems };
    });
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
    if (!formData.financialYearId) newErrors.financialYearId = 'Financial year is required';
    if (!formData.instituteId) newErrors.instituteId = 'Institute is required';
    if (!formData.employeeName) newErrors.employeeName = 'Employee name is required';
    if (!formData.location) newErrors.location = 'Location is required';
    if (formData.items.length === 0) newErrors.items = 'At least one item is required';
    formData.items.forEach((item, index) => {
      if (!item.itemId) newErrors[`items[${index}].itemId`] = 'Item is required';
      if (!item.issueQuantity || Number(item.issueQuantity) < 0)
        newErrors[`items[${index}].issueQuantity`] = 'Issue quantity must be non-negative';
      if (formData.items.some((i, iIdx) => i.itemId === item.itemId && iIdx !== index))
        newErrors[`items[${index}].itemId`] = 'Duplicate item selected';
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
      setDistributions((prev) =>
        prev.map((dist) =>
          dist.id === editId
            ? {
                ...formData,
                id: editId,
                documents: documentPath,
                createdAt: dist.createdAt,
                updatedAt: new Date().toISOString(),
              }
            : dist
        )
      );
      const updatedItems = formData.items.map((item, index) => ({
        id:
          distributionItems.find((di) => di.distributionId === editId && di.itemId === Number(item.itemId))?.id ||
          Math.max(...distributionItems.map((i) => i.id), 0) + index + 1,
        distributionId: editId,
        itemId: Number(item.itemId),
        issueQuantity: Number(item.issueQuantity),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      setDistributionItems((prev) => [
        ...prev.filter((di) => di.distributionId !== editId),
        ...updatedItems,
      ]);
    } else {
      const newId = Math.max(...distributions.map((dist) => dist.id), 0) + 1;
      setDistributions((prev) => [
        ...prev,
        {
          ...formData,
          id: newId,
          documents: documentPath,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);
      const newItems = formData.items.map((item, index) => ({
        id: Math.max(...distributionItems.map((i) => i.id), 0) + index + 1,
        distributionId: newId,
        itemId: Number(item.itemId),
        issueQuantity: Number(item.issueQuantity),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      setDistributionItems((prev) => [...prev, ...newItems]);
    }

    resetForm();
    setIsFormVisible(false);
  };

  const resetForm = () => {
    setFormData({
      financialYearId: '',
      instituteId: '',
      employeeName: '',
      location: '',
      documents: null,
      remark: '',
      items: [{ itemId: '', issueQuantity: '' }],
    });
    setErrors({});
    setIsEditMode(false);
    setEditId(null);
  };

  // Table columns for Distribution
  const distributionColumns = [
    { key: 'financialYearId', label: 'Financial Year', format: (value) => financialYears.find((fy) => fy.id === value)?.name || value },
    { key: 'instituteId', label: 'Institute', format: (value) => institutes.find((inst) => inst.id === value)?.name || value },
    { key: 'employeeName', label: 'Employee Name' },
    { key: 'location', label: 'Location' },
    { key: 'remark', label: 'Remark' },
  ];

  // Table actions
  const actions = [
    {
      label: 'Edit',
      onClick: (row) => {
        setIsEditMode(true);
        setEditId(row.id);
        const distItems = distributionItems
          .filter((di) => di.distributionId === row.id)
          .map((di) => ({
            itemId: di.itemId.toString(),
            issueQuantity: di.issueQuantity.toString(),
          }));
        setFormData({
          financialYearId: row.financialYearId.toString(),
          instituteId: row.instituteId.toString(),
          employeeName: row.employeeName,
          location: row.location,
          documents: row.documents,
          remark: row.remark,
          items: distItems.length > 0 ? distItems : [{ itemId: '', issueQuantity: '' }],
        });
        setIsFormVisible(true);
      },
      className: 'bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs sm:text-sm',
    },
    {
      label: 'Delete',
      onClick: (row) => {
        if (window.confirm(`Delete Distribution ${row.id}?`)) {
          setDistributions((prev) => prev.filter((dist) => dist.id !== row.id));
          setDistributionItems((prev) => prev.filter((di) => di.distributionId !== row.id));
          resetForm();
        }
      },
      className: 'bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs sm:text-sm',
    },
  ];

  // Handle row click to show details
  const handleRowClick = (row) => {
    setSelectedDistributionId(row.id);
  };

  // Handle back to table view
  const handleBack = () => {
    setSelectedDistributionId(null);
  };

  // react-select options
  const financialYearOptions = financialYears.map((fy) => ({
    value: fy.id.toString(),
    label: fy.name,
  }));
  const instituteOptions = institutes.map((inst) => ({
    value: inst.id.toString(),
    label: inst.name,
  }));
  const itemOptions = items.map((item) => ({
    value: item.id.toString(),
    label: item.itemName,
  }));

  // Get selected Distribution data
  const selectedDistribution = distributions.find((dist) => dist.id === selectedDistributionId);
  const selectedDistributionItems = distributionItems.filter((di) => di.distributionId === selectedDistributionId);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {selectedDistributionId ? (
        <DistributionDetails
          distribution={selectedDistribution}
          distributionItems={selectedDistributionItems}
          items={items}
          financialYears={financialYears}
          institutes={institutes}
          onBack={handleBack}
        />
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-brand-secondary mb-4">Distributions</h2>
            <div>
              <button
                onClick={() => setIsFormVisible(!isFormVisible)}
                className="bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-red-600"
              >
                {isFormVisible ? 'Hide Form' : 'Add Distribution'}
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-6 mb-6">
            {isFormVisible && (
              <div>
                <h3 className="text-base sm:text-lg font-medium text-brand-secondary mb-4">
                  {isEditMode ? 'Edit Distribution' : 'Add Distribution'}
                </h3>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                    <h4 className="text-sm sm:text-md font-medium text-brand-secondary mb-2">Items</h4>
                    {formData.items.map((item, index) => (
                      <div key={index} className="flex flex-col gap-2 mb-4 p-4 border rounded-md">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700">Item</label>
                            <Select
                              options={itemOptions}
                              value={itemOptions.find((option) => option.value === item.itemId)}
                              onChange={(option) =>
                                handleItemChange(index, { target: { name: 'itemId', value: option ? option.value : '' } })
                              }
                              className="mt-1 text-xs sm:text-sm"
                              classNamePrefix="select"
                              placeholder="Select Item"
                              isClearable
                            />
                            {errors[`items[${index}].itemId`] && (
                              <p className="mt-1 text-xs text-red-600">{errors[`items[${index}].itemId`]}</p>
                            )}
                          </div>
                          <FormInput
                            label="Issue Quantity"
                            type="number"
                            name="issueQuantity"
                            value={item.issueQuantity}
                            onChange={(e) => handleItemChange(index, e)}
                            error={errors[`items[${index}].issueQuantity`]}
                            required
                            min="0"
                            className="w-full text-xs sm:text-sm"
                          />
                          <div className="flex items-end">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(index)}
                              className="w-full sm:w-auto bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600 text-xs sm:text-sm"
                              disabled={formData.items.length === 1}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {errors.items && (
                      <p className="mt-1 text-xs text-red-600">{errors.items}</p>
                    )}
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="mt-2 w-full sm:w-auto bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-red-600 text-xs sm:text-sm"
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
                columns={distributionColumns}
                data={distributions}
                actions={actions}
                onRowClick={handleRowClick}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Distribution;