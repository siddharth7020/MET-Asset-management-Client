import React, { useState, useEffect } from 'react';
import Table from '../components/Table';
import FormInput from '../components/FormInput';
import {
  getInstitutes,
  createInstitute,
  updateInstitute,
  deleteInstitute
} from '../api/instituteService';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

function Institute() {
  const [institutes, setInstitutes] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    instituteName: '',
    intituteCode: '',
  });
  const [errors, setErrors] = useState({});
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchInstitutes();
  }, []);

  const fetchInstitutes = async () => {
    setLoading(true);
    try {
      const res = await getInstitutes();
      setInstitutes(res.data.data);
    } catch (error) {
      console.error('Error fetching institutes:', error);
      MySwal.fire('Error', 'Failed to fetch institutes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'instituteName', label: 'Name' },
    { key: 'intituteCode', label: 'Code' },
  ];

  const actions = [
    {
      label: 'Edit',
      onClick: (row) => {
        setIsEditMode(true);
        setEditId(row.instituteId);
        setFormData({
          instituteName: row.instituteName,
          intituteCode: row.intituteCode,
        });
        setIsFormVisible(true);
      },
      className: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      label: 'Delete',
      onClick: async (row) => {
        const result = await MySwal.fire({
          title: `Delete ${row.instituteName}?`,
          text: 'This action cannot be undone!',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6',
          confirmButtonText: 'Yes, delete it!',
        });

        if (result.isConfirmed) {
          try {
            await deleteInstitute(row.instituteId);
            await fetchInstitutes();
            resetForm();
            MySwal.fire('Deleted!', 'Institute deleted successfully.', 'success');
          } catch (err) {
            console.error('Delete failed:', err);
            MySwal.fire('Error', 'Failed to delete institute.', 'error');
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    try {
      if (isEditMode) {
        await updateInstitute(editId, formData);
        MySwal.fire('Updated', 'Institute updated successfully', 'success');
      } else {
        await createInstitute(formData);
        MySwal.fire('Created', 'Institute added successfully', 'success');
      }

      await fetchInstitutes();
      resetForm();
      setIsFormVisible(false);
    } catch (err) {
      console.error('Submit failed:', err);
      MySwal.fire('Error', 'Failed to save institute', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ instituteName: '', intituteCode: '' });
    setErrors({});
    setIsEditMode(false);
    setEditId(null);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-brand-secondary mb-4">Institutes</h2>
        <button
          onClick={() => setIsFormVisible(!isFormVisible)}
          className="bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-red-600"
        >
          {isFormVisible ? 'Hide Form' : 'Add Institute'}
        </button>
      </div>

      <div className="flex flex-col gap-6 mb-6">
        {isFormVisible && (
          <div>
            <h3 className="text-lg font-medium text-brand-secondary mb-4">
              {isEditMode ? 'Edit Institute' : 'Add Institute'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
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
          </div>
        )}
        <div>
          {loading ? (
            <div className="flex justify-center items-center py-6">
              <div className="loader border-t-4 border-brand-primary h-10 w-10 rounded-full animate-spin"></div>
            </div>
          ) : (
            <Table columns={columns} data={institutes} actions={actions} />
          )}
        </div>
      </div>
    </div>
  );
}

export default Institute;
