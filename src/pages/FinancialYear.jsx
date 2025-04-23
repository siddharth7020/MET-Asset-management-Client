import React, { useState, useEffect } from 'react';
import Table from '../components/Table';
import FormInput from '../components/FormInput';

function FinancialYear() {
  const [financialYears, setFinancialYears] = useState([]);
  const [formData, setFormData] = useState({
    year: '',
    startDate: '',
    endDate: '',
  });
  const [errors, setErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);

  // Fetch financial years
  useEffect(() => {
    fetchFinancialYears();
  }, []);

  const fetchFinancialYears = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/financialYears');
      const result = await response.json();
      if (response.ok) {
        setFinancialYears(result.data);
      } else {
        console.error(result.message);
      }
    } catch (error) {
      console.error('Error fetching financial years:', error);
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    const yearPattern = /^\d{4}-\d{4}$/;
    if (!formData.year) {
      newErrors.year = 'Year is required';
    } else if (!yearPattern.test(formData.year)) {
      newErrors.year = 'Year must be in YYYY-YYYY format (e.g., 2024-2025)';
    } else {
      const [startYear, endYear] = formData.year.split('-').map(Number);
      if (endYear !== startYear + 1) {
        newErrors.year = 'Year must be a valid range (e.g., 2024-2025)';
      }
    }
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    } else if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      newErrors.endDate = 'End date must be after start date';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const url = isEditing
        ? `http://localhost:5000/api/updateFinancialYear/${editId}`
        : 'http://localhost:5000/api/createFinancialYear';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await response.json();

      if (response.ok) {
        fetchFinancialYears();
        resetForm();
        setIsFormVisible(false);
      } else {
        if (result.errors) {
          const newErrors = {};
          result.errors.forEach((err) => {
            if (err.path) newErrors[err.path] = err.message;
          });
          setErrors(newErrors);
        } else {
          console.error(result.message);
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  // Handle edit
  const handleEdit = (row) => {
    setFormData({
      year: row.year,
      startDate: row.startDate.split('T')[0], // Format for input type="date"
      endDate: row.endDate.split('T')[0],
    });
    setIsEditing(true);
    setEditId(row.financialYearId);
    setIsFormVisible(true);
  };

  // Handle delete
  const handleDelete = async (row) => {
    if (!window.confirm(`Are you sure you want to delete ${row.year}?`)) return;

    try {
      const response = await fetch(`http://localhost:5000/api/deleteFinancialYear/${row.financialYearId}`, {
        method: 'DELETE',
      });
      const result = await response.json();

      if (response.ok) {
        fetchFinancialYears();
      } else {
        console.error(result.message);
      }
    } catch (error) {
      console.error('Error deleting financial year:', error);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({ year: '', startDate: '', endDate: '' });
    setErrors({});
    setIsEditing(false);
    setEditId(null);
  };

  // Table columns
  const columns = [
    { key: 'financialYearId', label: 'ID' },
    { key: 'year', label: 'Year' },
    { key: 'startDate', label: 'Start Date', render: (row) => new Date(row.startDate).toLocaleDateString() },
    { key: 'endDate', label: 'End Date', render: (row) => new Date(row.endDate).toLocaleDateString() },
  ];

  // Table actions
  const actions = [
    {
      label: 'Edit',
      onClick: handleEdit,
      className: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      label: 'Delete',
      onClick: handleDelete,
      className: 'bg-red-500 hover:bg-red-600',
    },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-brand-secondary">Financial Years</h2>
        <button
          onClick={() => {
            resetForm();
            setIsFormVisible(!isFormVisible);
          }}
          className="bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-red-600"
        >
          {isFormVisible ? 'Close Form' : 'Add Financial Year'}
        </button>
      </div>

      {isFormVisible && (
        <form onSubmit={handleSubmit} className="mb-6">
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
          <button
            type="submit"
            className="mt-4 bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-red-600"
          >
            {isEditing ? 'Update' : 'Create'}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={() => {
                resetForm();
                setIsFormVisible(false);
              }}
              className="mt-4 ml-2 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
            >
              Cancel
            </button>
          )}
        </form>
      )}

      <Table
        columns={columns}
        data={financialYears}
        actions={actions}
      />
    </div>
  );
}

export default FinancialYear;