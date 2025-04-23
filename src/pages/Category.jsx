import React, { useState, useEffect } from 'react';
import Table from '../components/Table';
import FormInput from '../components/FormInput';

function Category() {
  const [categories, setCategories] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    categoryID: '',
    categoryName: '',
  });
  const [errors, setErrors] = useState({});
  const [editId, setEditId] = useState(null);

  // Initialize with dummy data
  useEffect(() => {
    setCategories([
      { categoryID: 1, categoryName: 'Electronics' },
      { categoryID: 2, categoryName: 'Furniture' },
      { categoryID: 3, categoryName: 'Stationery' },
    ]);
  }, []);

  // Table columns
  const columns = [
    { key: 'categoryID', label: 'ID' },
    { key: 'categoryName', label: 'Name' },
  ];

  // Table actions
  const actions = [
    {
      label: 'Edit',
      onClick: (row) => {
        setIsEditMode(true);
        setEditId(row.categoryID);
        setFormData({
          categoryID: row.categoryID,
          categoryName: row.categoryName,
        });
        setIsFormVisible(true);
      },
      className: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      label: 'Delete',
      onClick: (row) => {
        if (window.confirm(`Delete category ${row.categoryName}?`)) {
          setCategories((prev) => prev.filter((cat) => cat.categoryID !== row.categoryID));
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
    if (!formData.categoryName) newErrors.categoryName = 'Category name is required';
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
      setCategories((prev) =>
        prev.map((cat) =>
          cat.categoryID === editId ? { ...formData, categoryID: editId } : cat
        )
      );
    } else {
      const newId = Math.max(...categories.map((cat) => cat.categoryID), 0) + 1;
      setCategories((prev) => [...prev, { ...formData, categoryID: newId }]);
    }

    resetForm();
    setIsFormVisible(false);
  };

  const resetForm = () => {
    setFormData({ categoryID: '', categoryName: '' });
    setErrors({});
    setIsEditMode(false);
    setEditId(null);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-brand-secondary mb-4">Categories</h2>
      <div className="flex flex-col gap-6 mb-6">
        <div>
          <button
            onClick={() => setIsFormVisible(!isFormVisible)}
            className="bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-red-600"
          >
            {isFormVisible ? 'Hide Form' : 'Manage Category'}
          </button>
        </div>
        {isFormVisible && (
          <div>
            <h3 className="text-lg font-medium text-brand-secondary mb-4">
              {isEditMode ? 'Edit Category' : 'Add Category'}
            </h3>
            <form onSubmit={handleSubmit}>
              <FormInput
                label="Category ID"
                type="text"
                name="categoryID"
                value={formData.categoryID}
                onChange={handleChange}
                disabled
                required={false}
              />
              <FormInput
                label="Category Name"
                type="text"
                name="categoryName"
                value={formData.categoryName}
                onChange={handleChange}
                error={errors.categoryName}
                required
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
          <Table columns={columns} data={categories} actions={actions} />
        </div>
      </div>
    </div>
  );
}

export default Category;