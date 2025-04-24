import React, { useState, useEffect } from 'react';
import Table from '../components/Table';
import FormInput from '../components/FormInput';

function FinancialYear() {
  const [financialYears, setFinancialYears] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    financialYearId: '',
    year: '',
    startDate: '',
    endDate: '',
  });
  const [errors, setErrors] = useState({});
  const [editId, setEditId] = useState(null);

  // Initialize with dummy data
  useEffect(() => {
    setFinancialYears([
      {
        financialYearId: 1,
        year: '2023-2024',
        startDate: '2023-04-01',
        endDate: '2024-03-31',
      },
      {
        financialYearId: 2,
        year: '2024-2025',
        startDate: '2024-04-01',
        endDate: '2025-03-31',
      },
      {
        financialYearId: 3,
        year: '2025-2026',
        startDate: '2025-04-01',
        endDate: '2026-03-31',
      },
    ]);
  }, []);

  // Table columns
  const columns = [
    { key: 'financialYearId', label: 'ID' },
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

  // Table actions
  const actions = [
    {
      label: 'Edit',
      onClick: (row) => {
        setIsEditMode(true);
        setEditId(row.financialYearId);
        setFormData({
          financialYearId: row.financialYearId,
          year: row.year,
          startDate: row.startDate.split('T')[0] || row.startDate, // Ensure date format
          endDate: row.endDate.split('T')[0] || row.endDate,
        });
        setIsFormVisible(true); // Show form on edit
      },
      className: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      label: 'Delete',
      onClick: (row) => {
        if (window.confirm(`Delete financial year ${row.year}?`)) {
          setFinancialYears((prev) => prev.filter((fy) => fy.financialYearId !== row.financialYearId));
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (isEditMode) {
      // Update existing financial year
      setFinancialYears((prev) =>
        prev.map((fy) =>
          fy.financialYearId === editId
            ? { ...formData, financialYearId: editId }
            : fy
        )
      );
    } else {
      // Add new financial year
      const newId = Math.max(...financialYears.map((fy) => fy.financialYearId), 0) + 1;
      setFinancialYears((prev) => [
        ...prev,
        { ...formData, financialYearId: newId },
      ]);
    }

    resetForm();
    setIsFormVisible(false); // Hide form after submit
  };

  const resetForm = () => {
    setFormData({ financialYearId: '', year: '', startDate: '', endDate: '' });
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
        {/* Form (conditionally rendered) */}
        {isFormVisible && (
          <div>
            <h3 className="text-lg font-medium text-brand-secondary mb-4">
              {isEditMode ? 'Edit Financial Year' : 'Add Financial Year'}
            </h3>
            <form onSubmit={handleSubmit}>
              <FormInput
                label="Year (YYYY-YYYY)"
                type="text"
                name="year"
                value={formData.year}
                onChange={handleChange}
                error={errors.year}
                required
              />
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
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
        {/* Table */}
        <div>
          <Table columns={columns} data={financialYears} actions={actions} />
        </div>
      </div>
    </div>
  );
}

export default FinancialYear;