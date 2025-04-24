import React, { useState, useEffect } from 'react';
import Table from '../components/Table';
import FormInput from '../components/FormInput';

function Unit() {
  const [units, setUnits] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    unitId: '',
    uniteName: '',
    uniteCode: '',
    remark: '',
  });
  const [errors, setErrors] = useState({});
  const [editId, setEditId] = useState(null);

  // Initialize with dummy data
  useEffect(() => {
    setUnits([
      { unitId: 1, uniteName: 'Piece', uniteCode: 'PC', remark: 'Standard unit' },
      { unitId: 2, uniteName: 'Kilogram', uniteCode: 'KG', remark: 'Weight unit' },
      { unitId: 3, uniteName: 'Meter', uniteCode: 'MTR', remark: 'Length unit' },
    ]);
  }, []);

  // Table columns
  const columns = [
    { key: 'unitId', label: 'ID' },
    { key: 'uniteName', label: 'Name' },
    { key: 'uniteCode', label: 'Code' },
    { key: 'remark', label: 'Remark' },
  ];

  // Table actions
  const actions = [
    {
      label: 'Edit',
      onClick: (row) => {
        setIsEditMode(true);
        setEditId(row.unitId);
        setFormData({
          unitId: row.unitId,
          uniteName: row.uniteName,
          uniteCode: row.uniteCode,
          remark: row.remark,
        });
        setIsFormVisible(true);
      },
      className: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      label: 'Delete',
      onClick: (row) => {
        if (window.confirm(`Delete unit ${row.uniteName}?`)) {
          setUnits((prev) => prev.filter((u) => u.unitId !== row.unitId));
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
    if (!formData.uniteName) newErrors.uniteName = 'Unit name is required';
    if (!formData.uniteCode) newErrors.uniteCode = 'Unit code is required';
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
      setUnits((prev) =>
        prev.map((u) => (u.unitId === editId ? { ...formData, unitId: editId } : u))
      );
    } else {
      const newId = Math.max(...units.map((u) => u.unitId), 0) + 1;
      setUnits((prev) => [...prev, { ...formData, unitId: newId }]);
    }

    resetForm();
    setIsFormVisible(false);
  };

  const resetForm = () => {
    setFormData({ unitId: '', uniteName: '', uniteCode: '', remark: '' });
    setErrors({});
    setIsEditMode(false);
    setEditId(null);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className='flex justify-between items-center mb-4'>
        <h2 className="text-2xl font-semibold text-brand-secondary mb-4">Units</h2> 
        <div>
          <button
            onClick={() => setIsFormVisible(!isFormVisible)}
            className="bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-red-600"
          >
            {isFormVisible ? 'Hide Form' : 'Add Unit'}
          </button>
        </div>
      </div>
     
      <div className="flex flex-col gap-6 mb-6">
         {isFormVisible && (
          <div>
            <h3 className="text-lg font-medium text-brand-secondary mb-4">
              {isEditMode ? 'Edit Unit' : 'Add Unit'}
            </h3>
            <form onSubmit={handleSubmit}>
              <FormInput
                label="Unit Name"
                type="text"
                name="uniteName"
                value={formData.uniteName}
                onChange={handleChange}
                error={errors.uniteName}
                required
              />
              <FormInput
                label="Unit Code"
                type="text"
                name="uniteCode"
                value={formData.uniteCode}
                onChange={handleChange}
                error={errors.uniteCode}
                required
              />
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
          <Table columns={columns} data={units} actions={actions} />
        </div>
      </div>
    </div>
  );
}

export default Unit;