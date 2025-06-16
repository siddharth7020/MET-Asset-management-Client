import React, { useState, useEffect } from 'react';
import Table from '../components/Table';
import FormInput from '../components/FormInput';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from '../api/categoryService';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

function Category() {
  const [categories, setCategories] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    categoryName: '',
  });
  const [errors, setErrors] = useState({});
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await getCategories();
      setCategories(res.data.categories || []);
    } catch (err) {
      console.error('Fetch error:', err.message);
      MySwal.fire('Error', 'Failed to fetch categories', 'error');
    }
     finally {
      setLoading(false);
    }
  };

  const columns = [{ key: 'categoryName', label: 'Name' }];

  const actions = [
    {
      label: 'Edit',
      onClick: (row) => {
        setIsEditMode(true);
        setEditId(row.categoryID);
        setFormData({ categoryName: row.categoryName });
        setIsFormVisible(true);
      },
      className: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      label: 'Delete',
      onClick: async (row) => {
        const result = await MySwal.fire({
          title: `Delete ${row.categoryName}?`,
          text: 'This action cannot be undone!',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6',
          confirmButtonText: 'Yes, delete it!',
        });

        if (result.isConfirmed) {
          try {
            await deleteCategory(row.categoryID);
            await fetchCategories();
            resetForm();
            MySwal.fire('Deleted!', 'Category has been deleted.', 'success');
          } catch (err) {
            console.error('Delete failed:', err);
            MySwal.fire('Error', 'Failed to delete category.', 'error');
          }
        }
      },
      className: 'bg-red-500 hover:bg-red-600',
    },
  ];

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      if (isEditMode) {
        await updateCategory(editId, formData);
        MySwal.fire('Updated', 'Category updated successfully', 'success');
      } else {
        await createCategory(formData);
        MySwal.fire('Created', 'Category added successfully', 'success');
      }
      await fetchCategories();
      resetForm();
      setIsFormVisible(false);
    } catch (err) {
      console.error('Submit error:', err);
      MySwal.fire('Error', 'Failed to save category', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ categoryName: '' });
    setErrors({});
    setIsEditMode(false);
    setEditId(null);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className='flex justify-between items-center mb-4'>
        <h2 className="text-2xl font-semibold text-brand-secondary mb-4">Categories</h2>
        <button
          onClick={() => setIsFormVisible(!isFormVisible)}
          className="bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-red-600"
        >
          {isFormVisible ? 'Hide Form' : 'Add Category'}
        </button>
      </div>

      <div className="flex flex-col gap-6 mb-6">
        {isFormVisible && (
          <div>
            <h3 className="text-lg font-medium text-brand-secondary mb-4">
              {isEditMode ? 'Edit Category' : 'Add Category'}
            </h3>
            <form onSubmit={handleSubmit}>
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
          </div>
        )}

        <div>
          {loading ? (
            <div className="flex justify-center items-center py-6">
              <div className="loader border-t-4 border-brand-primary h-10 w-10 rounded-full animate-spin"></div>
            </div>
          ) : (
            <Table columns={columns} data={categories || []} actions={actions} />
          )}
        </div>
      </div>
    </div>
  );
}

export default Category;
