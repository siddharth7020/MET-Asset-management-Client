import React, { useState, useEffect } from 'react';
import Table from '../components/Table';
import FormInput from '../components/FormInput';
import {
  getFinancialYears,
  createFinancialYear,
  updateFinancialYear,
  deleteFinancialYear,
} from '../api/financialYearService';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';


function FinancialYear() {
  const [financialYears, setFinancialYears] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    year: '',
    startDate: '',
    endDate: '',
  });
  const [errors, setErrors] = useState({});
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  const MySwal = withReactContent(Swal);

  useEffect(() => {
    fetchFinancialYears();
  }, []);

  const fetchFinancialYears = async () => {
    setLoading(true);
    try {
      const res = await getFinancialYears();
      setFinancialYears(res.data.data);
    } catch (error) {
      console.error('Error fetching financial years:', error);
    } finally {
      setLoading(false);
    }
  };


  const columns = [
    { key: 'year', label: 'Financial Year' },
    {
      key: 'startDate',
      label: 'Start Date',
      format: (value) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'endDate',
      label: 'End Date',
      format: (value) => new Date(value).toLocaleDateString(),
    },
  ];

  const actions = [
    {
      label: 'Edit',
      onClick: (row) => {
        setIsEditMode(true);
        setEditId(row.financialYearId);
        setFormData({
          year: row.year,
          startDate: row.startDate.split('T')[0] || row.startDate,
          endDate: row.endDate.split('T')[0] || row.endDate,
        });
        setIsFormVisible(true);
      },
      className: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      label: 'Delete',
      onClick: async (row) => {
        const result = await MySwal.fire({
          title: `Delete ${row.year}?`,
          text: 'This action cannot be undone!',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6',
          confirmButtonText: 'Yes, delete it!',
        });

        if (result.isConfirmed) {
          try {
            await deleteFinancialYear(row.financialYearId);
            await fetchFinancialYears();
            resetForm();
            MySwal.fire('Deleted!', 'The financial year has been deleted.', 'success');
          } catch (err) {
            console.error('Delete failed:', err);
            MySwal.fire('Error', 'Something went wrong during deletion.', 'error');
          }
        }
      }
      ,
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
    if (!formData.year) {
      newErrors.year = 'Year is required';
    } else if (!/^\d{4}-\d{4}$/.test(formData.year)) {
      newErrors.year = 'Year must be in YYYY-YYYY format';
    } else {
      const [start, end] = formData.year.split('-').map(Number);
      if (end !== start + 1) {
        newErrors.year = 'Year must be a valid range (e.g., 2024-2025)';
      }
    }
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    else if (formData.startDate && new Date(formData.endDate) <= new Date(formData.startDate)) {
      newErrors.endDate = 'End date must be after start date';
    }
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
        await updateFinancialYear(editId, formData);
      } else {
        await createFinancialYear(formData);
      }
      await fetchFinancialYears();
      resetForm();
      setIsFormVisible(false);

      MySwal.fire({
        icon: 'success',
        title: isEditMode ? 'Updated successfully!' : 'Added successfully!',
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (err) {
      console.error('Submit error:', err);
    } finally {
      setLoading(false);
    }
  };


  const resetForm = () => {
    setFormData({ year: '', startDate: '', endDate: '' });
    setErrors({});
    setIsEditMode(false);
    setEditId(null);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className='flex justify-between items-center mb-4'>
        <h2 className="text-2xl font-semibold text-brand-secondary mb-4">Financial Years</h2>
        <button
          onClick={() => setIsFormVisible(!isFormVisible)}
          className="bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-red-600"
        >
          {isFormVisible ? 'Hide Form' : 'Add Financial Year'}
        </button>
      </div>
      <div className="flex flex-col gap-6 mb-6">
        {isFormVisible && (
          <div>
            <h3 className="text-lg font-medium text-brand-secondary mb-4">
              {isEditMode ? 'Edit Financial Year' : 'Add Financial Year'}
            </h3>
            <form onSubmit={handleSubmit}>

              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <FormInput
                  label="Year (YYYY-YYYY)"
                  type="text"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  error={errors.year}
                  required
                />
                <FormInput
                  label="Start Date"
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  error={errors.startDate}
                  required
                />
                <FormInput
                  label="End Date"
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  error={errors.endDate}
                  required
                />
              </div>
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
          {loading ? (
            <div className="flex justify-center items-center py-6">
              <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-10 w-10"></div>
            </div>
          ) : (
            <Table columns={columns} data={financialYears} actions={actions} />
          )}

        </div>
      </div>
    </div>
  );
}

export default FinancialYear;
