import React, { useState, useEffect } from 'react';
import Table from '../components/Table';
import FormInput from '../components/FormInput';
import {
  getUnits,
  createUnit,
  updateUnit,
  deleteUnit
} from '../api/unitService';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

function Unit() {
  const [units, setUnits] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    uniteName: '',
    uniteCode: '',
    remark: '',
  });
  const [errors, setErrors] = useState({});
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUnits();
  }, []);

  const fetchUnits = async () => {
    setLoading(true);
    try {
      const res = await getUnits();
      setUnits(res.data.data);
    } catch (error) {
      console.error('Fetch error:', error);
      MySwal.fire('Error', 'Failed to load units', 'error');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'uniteName', label: 'Name' },
    { key: 'uniteCode', label: 'Code' },
    { key: 'remark', label: 'Remark' },
  ];

  const actions = [
    {
      label: 'Edit',
      onClick: (row) => {
        setIsEditMode(true);
        setEditId(row.unitId);
        setFormData({
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
      onClick: async (row) => {
        const result = await MySwal.fire({
          title: `Delete ${row.uniteName}?`,
          text: 'This action cannot be undone!',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6',
          confirmButtonText: 'Yes, delete it!',
        });

        if (result.isConfirmed) {
          try {
            await deleteUnit(row.unitId);
            await fetchUnits();
            resetForm();
            MySwal.fire('Deleted!', 'Unit has been deleted.', 'success');
          } catch (err) {
            console.error('Delete failed:', err);
            MySwal.fire('Error', 'Failed to delete unit.', 'error');
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
    if (!formData.uniteName) newErrors.uniteName = 'Unit name is required';
    if (!formData.uniteCode) newErrors.uniteCode = 'Unit code is required';
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
        await updateUnit(editId, formData);
        MySwal.fire('Updated', 'Unit updated successfully', 'success');
      } else {
        await createUnit(formData);
        MySwal.fire('Created', 'Unit added successfully', 'success');
      }
      await fetchUnits();
      resetForm();
      setIsFormVisible(false);
    } catch (err) {
      console.error('Submit error:', err);
      MySwal.fire('Error', 'Failed to save unit', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ uniteName: '', uniteCode: '', remark: '' });
    setErrors({});
    setIsEditMode(false);
    setEditId(null);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className='flex justify-between items-center mb-4'>
        <h2 className="text-2xl font-semibold text-brand-secondary mb-4">Units</h2> 
        <button
          onClick={() => setIsFormVisible(!isFormVisible)}
          className="bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-red-600"
        >
          {isFormVisible ? 'Hide Form' : 'Add Unit'}
        </button>
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
            <Table columns={columns} data={units} actions={actions} />
          )}
        </div>
      </div>
    </div>
  );
}

export default Unit;
