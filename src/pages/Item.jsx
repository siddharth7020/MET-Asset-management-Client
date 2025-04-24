import React, { useState, useEffect } from 'react';
import Table from '../components/Table';
import FormInput from '../components/FormInput';

function Item() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    itemId: '',
    itemName: '',
    itemCategory: '',
    unit: '',
    remark: '',
  });
  const [errors, setErrors] = useState({});
  const [editId, setEditId] = useState(null);

  // Initialize with dummy data
  useEffect(() => {
    setItems([
      {
        itemId: 1,
        itemName: 'Laptop',
        itemCategory: 1,
        unit: 1,
        remark: 'High-performance laptop',
      },
      {
        itemId: 2,
        itemName: 'Office Chair',
        itemCategory: 2,
        unit: 1,
        remark: 'Ergonomic chair',
      },
      {
        itemId: 3,
        itemName: 'Notebook',
        itemCategory: 3,
        unit: 1,
        remark: 'A4 size notebook',
      },
    ]);
    setCategories([
      { categoryID: 1, categoryName: 'Electronics' },
      { categoryID: 2, categoryName: 'Furniture' },
      { categoryID: 3, categoryName: 'Stationery' },
    ]);
    setUnits([
      { unitId: 1, uniteName: 'Piece', uniteCode: 'PC', remark: 'Standard unit' },
      { unitId: 2, uniteName: 'Kilogram', uniteCode: 'KG', remark: 'Weight unit' },
      { unitId: 3, uniteName: 'Meter', uniteCode: 'MTR', remark: 'Length unit' },
    ]);
  }, []);

  // Table columns
  const columns = [
    { key: 'itemId', label: 'ID' },
    { key: 'itemName', label: 'Name' },
    {
      key: 'itemCategory',
      label: 'Category',
      format: (value) => categories.find((cat) => cat.categoryID === value)?.categoryName || 'N/A',
    },
    {
      key: 'unit',
      label: 'Unit',
      format: (value) => units.find((u) => u.unitId === value)?.uniteName || 'N/A',
    },
    { key: 'remark', label: 'Remark' },
  ];

  // Table actions
  const actions = [
    {
      label: 'Edit',
      onClick: (row) => {
        setIsEditMode(true);
        setEditId(row.itemId);
        setFormData({
          itemId: row.itemId,
          itemName: row.itemName,
          itemCategory: row.itemCategory,
          unit: row.unit,
          remark: row.remark,
        });
        setIsFormVisible(true);
      },
      className: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      label: 'Delete',
      onClick: (row) => {
        if (window.confirm(`Delete item ${row.itemName}?`)) {
          setItems((prev) => prev.filter((item) => item.itemId !== row.itemId));
          resetForm();
        }
      },
      className: 'bg-red-500 hover:bg-red-600',
    },
  ];

  // Form handling
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.itemName) newErrors.itemName = 'Item name is required';
    if (!formData.itemCategory) newErrors.itemCategory = 'Category is required';
    else if (!categories.some((cat) => cat.categoryID === Number(formData.itemCategory))) {
      newErrors.itemCategory = 'Invalid category';
    }
    if (!formData.unit) newErrors.unit = 'Unit is required';
    else if (!units.some((u) => u.unitId === Number(formData.unit))) {
      newErrors.unit = 'Invalid unit';
    }
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (isEditMode) {
      setItems((prev) =>
        prev.map((item) =>
          item.itemId === editId
            ? { ...formData, itemId: editId, itemCategory: Number(formData.itemCategory), unit: Number(formData.unit) }
            : item
        )
      );
    } else {
      const newId = Math.max(...items.map((item) => item.itemId), 0) + 1;
      setItems((prev) => [
        ...prev,
        { ...formData, itemId: newId, itemCategory: Number(formData.itemCategory), unit: Number(formData.unit) },
      ]);
    }

    resetForm();
    setIsFormVisible(false);
  };

  const resetForm = () => {
    setFormData({ itemId: '', itemName: '', itemCategory: '', unit: '', remark: '' });
    setErrors({});
    setIsEditMode(false);
    setEditId(null);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className='flex justify-between items-center mb-4'>
        <h2 className="text-2xl font-semibold text-brand-secondary mb-4">Items</h2>
        <div>
          <button
            onClick={() => setIsFormVisible(!isFormVisible)}
            className="bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-red-600"
          >
            {isFormVisible ? 'Hide Form' : 'Add Item'}
          </button>
        </div>
      </div>
      
      <div className="flex flex-col gap-6 mb-6">
       
        {isFormVisible && (
          <div>
            <h3 className="text-lg font-medium text-brand-secondary mb-4">
              {isEditMode ? 'Edit Item' : 'Add Item'}
            </h3>
            <form onSubmit={handleSubmit}>
            <FormInput
                  label="Item Name"
                  type="text"
                  name="itemName"
                  value={formData.itemName}
                  onChange={handleChange}
                  error={errors.itemName}
                  required
                />
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <select
                    name="itemCategory"
                    value={formData.itemCategory}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-brand-primary focus:border-brand-primary"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.categoryID} value={cat.categoryID}>
                        {cat.categoryName}
                      </option>
                    ))}
                  </select>
                  {errors.itemCategory && (
                    <p className="mt-1 text-sm text-red-600">{errors.itemCategory}</p>
                  )}
                </div>
                <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Unit</label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-brand-primary focus:border-brand-primary"
                  required
                >
                  <option value="">Select Unit</option>
                  {units.map((u) => (
                    <option key={u.unitId} value={u.unitId}>
                      {u.uniteName}
                    </option>
                  ))}
                </select>
                {errors.unit && <p className="mt-1 text-sm text-red-600">{errors.unit}</p>}
              </div>
              </div>

           
              <FormInput
                label="Remark"
                type="text"
                name="remark"
                value={formData.remark}
                onChange={handleChange}
                error={errors.remark}
                required={false}
              />
              <div className="flex space-x-2 mt-4">
                <button
                  type="submit"
                  className="bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-red-600"
                >
                  {isEditMode ? 'Update' : 'Add'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setIsFormVisible(false);
                  }}
                  className="px-4 py-2 text-gray-600 rounded-md hover:bg-gray-100"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
        <div>
          <Table columns={columns} data={items} actions={actions} />
        </div>
      </div>
    </div>
  );
}

export default Item;