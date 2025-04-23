import React, { useState, useEffect } from 'react';
import Table from '../components/Table';
import FormInput from '../components/FormInput';

function Institute() {
  const [institutes, setInstitutes] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    instituteId: '',
    instituteName: '',
    intituteCode: '',
  });
  const [errors, setErrors] = useState({});
  const [editId, setEditId] = useState(null);

  // Initialize with dummy data
  useEffect(() => {
    setInstitutes([
      { instituteId: 1, instituteName: 'Central University', intituteCode: 'CU001' },
      { instituteId: 2, instituteName: 'State College', intituteCode: 'SC002' },
      { instituteId: 3, instituteName: 'Tech Institute', intituteCode: 'TI003' },
    ]);
  }, []);

  // Table columns
  const columns = [
    { key: 'instituteId', label: 'ID' },
    { key: 'instituteName', label: 'Name' },
    { key: 'intituteCode', label: 'Code' },
  ];

  // Table actions
  const actions = [
    {
      label: 'Edit',
      onClick: (row) => {
        setIsEditMode(true);
        setEditId(row.instituteId);
        setFormData({
          instituteId: row.instituteId,
          instituteName: row.instituteName,
          intituteCode: row.intituteCode,
        });
        setIsFormVisible(true);
      },
      className: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      label: 'Delete',
      onClick: (row) => {
        if (window.confirm(`Delete institute ${row.instituteName}?`)) {
          setInstitutes((prev) => prev.filter((inst) => inst.instituteId !== row.instituteId));
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
    if (!formData.instituteName) newErrors.instituteName = 'Institute name is required';
    if (!formData.intituteCode) {
      newErrors.intituteCode = 'Institute code is required';
    } else if (formData.intituteCode.length < 3 || formData.intituteCode.length > 50) {
      newErrors.intituteCode = 'Institute code must be between 3 to 50 characters';
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
      setInstitutes((prev) =>
        prev.map((inst) =>
          inst.instituteId === editId ? { ...formData, instituteId: editId } : inst
        )
      );
    } else {
      const newId = Math.max(...institutes.map((inst) => inst.instituteId), 0) + 1;
      setInstitutes((prev) => [
        ...prev,
        { ...formData, instituteId: newId },
      ]);
    }

    resetForm();
    setIsFormVisible(false);
  };

  const resetForm = () => {
    setFormData({ instituteId: '', instituteName: '', intituteCode: '' });
    setErrors({});
    setIsEditMode(false);
    setEditId(null);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-brand-secondary mb-4">Institutes</h2>
      <div className="flex flex-col gap-6 mb-6">
        <div>
          <button
            onClick={() => setIsFormVisible(!isFormVisible)}
            className="bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-red-600"
          >
            {isFormVisible ? 'Hide Form' : 'Manage Institute'}
          </button>
        </div>
        {isFormVisible && (
          <div>
            <h3 className="text-lg font-medium text-brand-secondary mb-4">
              {isEditMode ? 'Edit Institute' : 'Add Institute'}
            </h3>
            <form onSubmit={handleSubmit}>
              <FormInput
                label="Institute ID"
                type="text"
                name="instituteId"
                value={formData.instituteId}
                onChange={handleChange}
                disabled
                required={false}
              />
              <FormInput
                label="Institute Name"
                type="text"
                name="instituteName"
                value={formData.instituteName}
                onChange={handleChange}
                error={errors.instituteName}
                required
              />
              <FormInput
                label="Institute Code"
                type="text"
                name="intituteCode"
                value={formData.intituteCode}
                onChange={handleChange}
                error={errors.intituteCode}
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
          <Table columns={columns} data={institutes} actions={actions} />
        </div>
      </div>
    </div>
  );
}

export default Institute;