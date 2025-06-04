import React, { useState, useEffect } from 'react';
import Table from '../components/Table';
import FormInput from '../components/FormInput';
import {
  getLocations,
  createLocation,
  updateLocation,
  deleteLocation
} from '../api/locationService';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const TagInput = ({ label, name, value, onChange, error }) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      onChange({ target: { name, value: [...value, inputValue.trim()] } });
      setInputValue('');
    }
  };

  const removeTag = (index) => {
    onChange({ target: { name, value: value.filter((_, i) => i !== index) } });
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="mt-1 flex flex-wrap gap-2 p-2 border rounded-md">
        {value.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-brand-primary text-white"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="ml-2 text-white hover:text-gray-200"
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 border-none focus:ring-0"
          placeholder="Type a room and press Enter"
        />
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

function Location() {
  const [locations, setLocations] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    floor: '',
    room: [],
  });
  const [errors, setErrors] = useState({});
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const res = await getLocations();
      setLocations(res.data);
    } catch (error) {
      console.error('Fetch error:', error);
      MySwal.fire('Error', 'Failed to load locations', 'error');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'floor', label: 'Floor' },
    { key: 'room', label: 'Room', render: (row) => row.room.join(',') },
  ];

  const actions = [
    {
      label: 'Edit',
      onClick: (row) => {
        setIsEditMode(true);
        setEditId(row.locationID);
        setFormData({
          floor: row.floor,
          room: row.room,
        });
        setIsFormVisible(true);
      },
      className: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      label: 'Delete',
      onClick: async (row) => {
        const result = await MySwal.fire({
          title: `Delete ${row.floor}?`,
          text: 'This action cannot be undone!',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6',
          confirmButtonText: 'Yes, delete it!',
        });

        if (result.isConfirmed) {
          try {
            await deleteLocation(row.locationID);
            await fetchLocations();
            resetForm();
            MySwal.fire('Deleted!', 'Location has been deleted.', 'success');
          } catch (err) {
            console.error('Delete failed:', err);
            MySwal.fire('Error', 'Failed to delete location.', 'error');
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
    if (!formData.floor) newErrors.floor = 'Floor is required';
    if (!formData.room.length) newErrors.room = 'At least one room is required';
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
      const data = {
        floor: formData.floor,
        room: formData.room,
      };

      if (isEditMode) {
        await updateLocation(editId, data);
        MySwal.fire('Updated', 'Location updated successfully', 'success');
      } else {
        await createLocation(data);
        MySwal.fire('Created', 'Location added successfully', 'success');
      }
      await fetchLocations();
      resetForm();
      setIsFormVisible(false);
    } catch (err) {
      console.error('Submit error:', err);
      MySwal.fire('Error', 'Failed to save location', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ floor: '', room: [] });
    setErrors({});
    setIsEditMode(false);
    setEditId(null);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className='flex justify-between items-center mb-4'>
        <h2 className="text-2xl font-semibold text-brand-secondary mb-4">Locations</h2> 
        <button
          onClick={() => setIsFormVisible(!isFormVisible)}
          className="bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-red-600"
        >
          {isFormVisible ? 'Hide Form' : 'Add Location'}
        </button>
      </div>

      <div className="flex flex-col gap-6 mb-6">
        {isFormVisible && (
          <div>
            <h3 className="text-lg font-medium text-brand-secondary mb-4">
              {isEditMode ? 'Edit Location' : 'Add Location'}
            </h3>
            <form onSubmit={handleSubmit}>
              <FormInput
                label="Floor"
                type="text"
                name="floor"
                value={formData.floor}
                onChange={handleChange}
                error={errors.floor}
                required
              />
              <TagInput
                label="Rooms"
                name="room"
                value={formData.room}
                onChange={handleChange}
                error={errors.room}
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
            <Table columns={columns} data={locations} actions={actions} />
          )}
        </div>
      </div>
    </div>
  );
}

export default Location;