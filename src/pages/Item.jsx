import React, { useState, useEffect } from 'react';
import Table from '../components/Table';
import FormInput from '../components/FormInput';
import {
  getItems,
  createItem,
  updateItem,
  deleteItem
} from '../api/itemService';
import { getCategories } from '../api/categoryService';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

function Item() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    itemName: '',
    itemCategory: '',
    remark: '',
  });
  const [errors, setErrors] = useState({});
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [itemRes, categoryRes] = await Promise.all([
        getItems(),
        getCategories(),
      ]);
      setItems(itemRes.data.items || []);
      setCategories(categoryRes.data.categories || []);
    } catch (err) {
      console.error('Fetch error:', err);
      MySwal.fire('Error', err.response?.data?.message || 'Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'itemName', label: 'Name' },
    {
      key: 'itemCategory',
      label: 'Category',
      format: (value) => {
        const category = categories.find((cat) => cat.categoryID === value);
        return category?.categoryName || 'N/A';
      },
    },
    { key: 'remark', label: 'Remark' },
  ];

  const actions = [
    {
      label: 'Edit',
      onClick: (row) => {
        setIsEditMode(true);
        setEditId(row.itemId);
        setFormData({
          itemName: row.itemName,
          itemCategory: row.itemCategory,
          remark: row.remark || '',
        });
        setIsFormVisible(true);
      },
      className: 'bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded',
    },
    {
      label: 'Delete',
      onClick: async (row) => {
        const result = await MySwal.fire({
          title: `Delete ${row.itemName}?`,
          text: 'This action cannot be undone!',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6',
          confirmButtonText: 'Yes, delete it!',
        });

        if (result.isConfirmed) {
          try {
            await deleteItem(row.itemId);
            await fetchInitialData();
            resetForm();
            MySwal.fire('Deleted!', 'Item has been deleted.', 'success');
          } catch (err) {
            console.error('Delete failed:', err);
            MySwal.fire('Error', err.response?.data?.message || 'Failed to delete item.', 'error');
          }
        }
      },
      className: 'bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded',
    },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.itemName) newErrors.itemName = 'Item name is required';
    if (!formData.itemCategory) newErrors.itemCategory = 'Category is required';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        itemName: formData.itemName,
        itemCategory: Number(formData.itemCategory),
        remark: formData.remark || null,
      };
      if (isEditMode) {
        await updateItem(editId, payload);
        MySwal.fire('Updated', 'Item updated successfully', 'success');
      } else {
        await createItem(payload);
        MySwal.fire('Created', 'Item added successfully', 'success');
      }
      await fetchInitialData();
      resetForm();
      setIsFormVisible(false);
    } catch (err) {
      console.error('Submit error:', err);
      MySwal.fire('Error', err.response?.data?.message || 'Failed to save item', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      itemName: '',
      itemCategory: '',
      remark: '',
    });
    setErrors({});
    setIsEditMode(false);
    setEditId(null);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-brand-secondary">Items</h2>
        <button
          onClick={() => setIsFormVisible(!isFormVisible)}
          className="bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-red-600"
        >
          {isFormVisible ? 'Hide Form' : 'Add Item'}
        </button>
      </div>

      {isFormVisible && (
        <form onSubmit={handleSubmit} className="mb-6">
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <FormInput
              label="Item Name"
              type="text"
              name="itemName"
              value={formData.itemName}
              onChange={handleChange}
              error={errors.itemName}
              required
            />
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select
                name="itemCategory"
                value={formData.itemCategory}
                onChange={handleChange}
                className="block w-full border border-gray-300 rounded-md shadow-sm p-2"
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
            <FormInput
              label="Remark"
              type="text"
              name="remark"
              value={formData.remark}
              onChange={handleChange}
              error={errors.remark}
            />
          </div>
          <div className="flex space-x-2 mt-4">
            <button
              type="submit"
              className="bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-red-600"
              disabled={loading}
            >
              {loading ? 'Saving...' : isEditMode ? 'Update' : 'Add'}
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
      )}

      {loading ? (
        <div className="flex justify-center items-center py-6">
          <div className="loader border-t-4 border-brand-primary h-10 w-10 rounded-full animate-spin"></div>
        </div>
      ) : (
        <Table columns={columns} data={items} actions={actions} />
      )}
    </div>
  );
}

export default Item;