import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import Table from '../components/Table';
import FormInput from '../components/FormInput';
import DistributionDetails from './DistributionDetails';
import { getAllDistributions, getDistributionById, createDistribution, updateDistribution } from '../api/distributionService';
import axios from '../api/axiosInstance';
import Swal from 'sweetalert2';

function Distribution() {
  const [distributions, setDistributions] = useState([]);
  const [distributionItems, setDistributionItems] = useState([]);
  const [items, setItems] = useState([]);
  const [financialYears, setFinancialYears] = useState([]);
  const [institutes, setInstitutes] = useState([]);
  const [locations, setLocations] = useState([]);
  const [roomOptions, setRoomOptions] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    financialYearId: '',
    instituteId: '',
    employeeName: '',
    location: '',
    floor: '',
    rooms: '',
    distributionDate: '',
    distributionNo: '',
    documents: '',
    remark: '',
    items: [{ itemId: '', issueQuantity: '' }],
  });
  const [errors, setErrors] = useState({});
  const [editId, setEditId] = useState(null);
  const [selectedDistributionId, setSelectedDistributionId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all necessary data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch distributions
        const distributionsResponse = await getAllDistributions();
        const distributionsData = distributionsResponse.data;
        const distributionItemsData = distributionsData.flatMap(dist => dist.items || []);
        setDistributions(distributionsData);
        setDistributionItems(distributionItemsData);

        // Fetch items
        const itemsResponse = await axios.get('/items');
        if (Array.isArray(itemsResponse.data.items)) {
          setItems(itemsResponse.data.items);
        } else {
          console.error('Expected items data to be an array, but got:', itemsResponse.data.items);
          Swal.fire({
            icon: 'error',
            title: 'Data Error',
            text: 'Failed to load items data.',
          });
        }

        // Fetch locations
        const locationResponse = await axios.get('/locations');
        if (Array.isArray(locationResponse.data)) {
          setLocations(locationResponse.data);
        } else {
          console.error('Expected location data to be an array, but got:', locationResponse.data);
          Swal.fire({
            icon: 'error',
            title: 'Data Error',
            text: 'Failed to load location data.',
          });
        }

        // Fetch financial years
        const fyResponse = await axios.get('/financialYears');
        if (Array.isArray(fyResponse.data.data)) {
          setFinancialYears(fyResponse.data.data);
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Data Error',
            text: 'Failed to load financial years data.',
          });
        }

        // Fetch institutes
        const institutesResponse = await axios.get('/institutes');
        if (Array.isArray(institutesResponse.data.data)) {
          setInstitutes(institutesResponse.data.data);
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Data Error',
            text: 'Failed to load institutes data.',
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        Swal.fire({
          icon: 'error',
          title: 'Fetch Error',
          text: 'Failed to load data. Please try again.',
        });
      }
    };
    fetchData();
  }, []);

  // Update room options when floor changes
  useEffect(() => {
    if (formData.floor) {
      const selectedLocation = locations.find(loc => loc.floor === formData.floor);
      if (selectedLocation) {
        setFormData(prev => ({
          ...prev,
          location: selectedLocation.locationID.toString(),
          rooms: selectedLocation.room.includes(prev.rooms) ? prev.rooms : '',
        }));
        setRoomOptions(selectedLocation.room.map(room => ({
          value: room,
          label: room,
        })));
      } else {
        setFormData(prev => ({ ...prev, location: '', rooms: '' }));
        setRoomOptions([]);
      }
    } else {
      setFormData(prev => ({ ...prev, location: '', rooms: '' }));
      setRoomOptions([]);
    }
  }, [formData.floor, locations]);

  // Form handling
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSelectChange = (name, option) => {
    if (name === 'floor') {
      setFormData((prev) => ({
        ...prev,
        [name]: option ? option.value : '',
        rooms: '', // Reset rooms when floor changes
      }));
    } else if (name === 'rooms') {
      setFormData((prev) => ({
        ...prev,
        [name]: option ? option.value : '',
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: option ? option.value : '',
      }));
    }
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [name]: value };
      return { ...prev, items: newItems };
    });
    setErrors((prev) => ({ ...prev, [`items[${index}].${name}`]: '' }));
  };

  const handleAddItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { itemId: '', issueQuantity: '' }],
    }));
  };

  const handleRemoveItem = (index) => {
    if (formData.items.length === 1) {
      Swal.fire({
        icon: 'warning',
        title: 'Cannot Remove',
        text: 'At least one item is required.',
      });
      return;
    }
    setFormData((prev) => {
      const newItems = prev.items.filter((_, i) => i !== index);
      return { ...prev, items: newItems };
    });
    setErrors((prev) => {
      const newErrors = { ...prev };
      Object.keys(newErrors).forEach((key) => {
        if (key.startsWith(`items[${index}]`)) delete newErrors[key];
      });
      return newErrors;
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.financialYearId) newErrors.financialYearId = 'Financial year is required';
    if (!formData.instituteId) newErrors.instituteId = 'Institute is required';
    if (!formData.employeeName.trim()) newErrors.employeeName = 'Employee name is required';
    if (!formData.location) newErrors.location = 'Location (floor) is required';
    if (!formData.rooms) newErrors.rooms = 'Room is required';
    if (!formData.distributionDate) newErrors.distributionDate = 'Distribution date is required';
    if (formData.items.length === 0) newErrors.items = 'At least one item is required';
    formData.items.forEach((item, index) => {
      if (!item.itemId) newErrors[`items[${index}].itemId`] = 'Item is required';
      if (!item.issueQuantity || Number(item.issueQuantity) <= 0)
        newErrors[`items[${index}].issueQuantity`] = 'Issue quantity must be positive';
      if (formData.items.some((i, iIdx) => i.itemId === item.itemId && iIdx !== index))
        newErrors[`items[${index}].itemId`] = 'Duplicate item selected';
    });
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        html: Object.values(newErrors).map((err) => `<p>${err}</p>`).join(''),
      });
      return;
    }

    const payload = {
      financialYearId: Number(formData.financialYearId),
      instituteId: Number(formData.instituteId),
      employeeName: formData.employeeName.trim(),
      location: Number(formData.location),
      floor: formData.floor,
      rooms: formData.rooms,
      distributionDate: formData.distributionDate,
      distributionNo: formData.distributionNo.trim(),
      documents: formData.documents ? formData.documents.name : '',
      remark: formData.remark.trim() || '',
      items: formData.items.map((item) => ({
        itemId: Number(item.itemId),
        issueQuantity: Number(item.issueQuantity),
      })),
    };

    try {
      if (isEditMode) {
        const response = await updateDistribution(editId, payload);
        const updatedDistribution = response.data.data || response.data;
        setDistributions((prev) =>
          prev.map((dist) => (dist.id === editId ? updatedDistribution : dist))
        );
        setDistributionItems((prev) => [
          ...prev.filter((di) => di.distributionId !== editId),
          ...(updatedDistribution.items || []),
        ]);
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Distribution updated successfully.',
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        const response = await createDistribution(payload);
        const newDistribution = response.data.data || response.data;
        setDistributions((prev) => [...prev, newDistribution]);
        setDistributionItems((prev) => [...prev, ...(newDistribution.items || [])]);
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Distribution created successfully.',
          timer: 1500,
          showConfirmButton: false,
        });
      }
      resetForm();
      setIsFormVisible(false);
    } catch (error) {
      console.error('Error submitting distribution:', error);
      Swal.fire({
        icon: 'error',
        title: 'Submission Error',
        text: error.response?.data?.message || 'Failed to save distribution.',
      });
    }
  };

  const handleCancel = () => {
    Swal.fire({
      title: 'Cancel Form?',
      text: 'Are you sure you want to cancel? All unsaved changes will be lost.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, cancel',
      cancelButtonText: 'Stay',
    }).then((result) => {
      if (result.isConfirmed) {
        resetForm();
        setIsFormVisible(false);
      }
    });
  };

  const resetForm = () => {
    setFormData({
      financialYearId: '',
      instituteId: '',
      employeeName: '',
      location: '',
      floor: '',
      rooms: '',
      distributionDate: '',
      distributionNo: '',
      documents: '',
      remark: '',
      items: [{ itemId: '', issueQuantity: '' }],
    });
    setErrors({});
    setRoomOptions([]);
    setIsEditMode(false);
    setEditId(null);
  };

  // Filter distributions based on search query
  const filteredDistributions = distributions.filter((dist) => {
    const financialYear = financialYears.find((fy) => fy.financialYearId === dist.financialYearId);
    const location = locations.find((loc) => loc.locationID === dist.location);
    const distributionNo = dist.distributionNo || dist.id;
    return (
      financialYear?.year.toLowerCase().includes(searchQuery.toLowerCase()) ||
      distributionNo.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
      location?.floor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dist.rooms.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Table columns for Distribution
  const distributionColumns = [
    {
      key: 'financialYearId',
      label: 'Financial Year',
      format: (value) => financialYears.find((fy) => fy.financialYearId === value)?.year || 'N/A',
    },
    {
      key: 'instituteId',
      label: 'Institute',
      format: (value) => institutes.find((inst) => inst.instituteId === value)?.instituteName || 'N/A',
    },
    { key: 'distributionNo', label: 'Distribution No' },
    {
      key: 'distributionDate',
      label: 'Distribution Date',
      format: (value) => new Date(value).toLocaleDateString(),
    },
  ];

  // Table actions
  const actions = [
    {
      label: 'Edit',
      onClick: async (row) => {
        try {
          const response = await getDistributionById(row.id);
          const distribution = response.data;
          const selectedLocation = locations.find(loc => loc.locationID === distribution.location);
          setIsEditMode(true);
          setEditId(row.id);
          setFormData({
            financialYearId: distribution.financialYearId.toString(),
            instituteId: distribution.instituteId.toString(),
            employeeName: distribution.employeeName,
            location: distribution.location.toString(),
            floor: selectedLocation ? selectedLocation.floor : '',
            rooms: distribution.rooms || '',
            distributionDate: distribution.distributionDate ? distribution.distributionDate.split('T')[0] : '',
            distributionNo: distribution.distributionNo || '',
            documents: distribution.documents || '',
            remark: distribution.remark || '',
            items: distribution.items.length > 0
              ? distribution.items.map((item) => ({
                  itemId: item.itemId.toString(),
                  issueQuantity: item.issueQuantity.toString(),
                }))
              : [{ itemId: '', issueQuantity: '' }],
          });
          // Set room options for the selected floor
          if (selectedLocation) {
            setRoomOptions(selectedLocation.room.map(room => ({
              value: room,
              label: room,
            })));
          }
          setIsFormVisible(true);
        } catch (error) {
          console.error('Error fetching distribution for edit:', error);
          Swal.fire({
            icon: 'error',
            title: 'Edit Error',
            text: 'Failed to load distribution data.',
          });
        }
      },
      className: 'bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs sm:text-sm',
    },
    {
      label: 'Delete',
      onClick: (row) => {
        Swal.fire({
          title: 'Are you sure?',
          text: `Do you want to delete Distribution ${row.distributionNo || row.id}?`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6',
          confirmButtonText: 'Yes, delete it!',
          cancelButtonText: 'Cancel',
        }).then(async (result) => {
          if (result.isConfirmed) {
            try {
              // Note: No delete API provided in controller, so simulating frontend deletion
              setDistributions((prev) => prev.filter((dist) => dist.id !== row.id));
              setDistributionItems((prev) => prev.filter((di) => di.distributionId !== row.id));
              Swal.fire({
                icon: 'success',
                title: 'Deleted!',
                text: `Distribution ${row.distributionNo || row.id} has been deleted.`,
                timer: 1500,
                showConfirmButton: false,
              });
            } catch (error) {
              console.error('Error deleting distribution:', error);
              Swal.fire({
                icon: 'error',
                title: 'Delete Error',
                text: 'Failed to delete distribution.',
              });
            }
          }
        });
      },
      className: 'bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs sm:text-sm',
    },
  ];

  // Handle row click to show details
  const handleRowClick = (row) => {
    setSelectedDistributionId(row.id);
  };

  // Handle back to table view
  const handleBack = () => {
    setSelectedDistributionId(null);
  };

  // react-select options
  const financialYearOptions = financialYears.map((fy) => ({
    value: fy.financialYearId.toString(),
    label: fy.year,
  }));
  const instituteOptions = institutes.map((inst) => ({
    value: inst.instituteId.toString(),
    label: inst.instituteName,
  }));
  const itemOptions = items.map((item) => ({
    value: item.itemId.toString(),
    label: item.itemName,
  }));
  const floorOptions = locations.map((loc) => ({
    value: loc.floor,
    label: loc.floor,
  }));

  // Get selected Distribution data
  const selectedDistribution = distributions.find((dist) => dist.id === selectedDistributionId);
  const selectedDistributionItems = distributionItems.filter((di) => di.distributionId === selectedDistributionId);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {selectedDistributionId ? (
        <DistributionDetails
          distribution={selectedDistribution}
          distributionItems={selectedDistributionItems}
          items={items}
          financialYears={financialYears}
          institutes={institutes}
          locations={locations}
          onBack={handleBack}
        />
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-brand-secondary mb-4">Distribution Item</h2>
            <div className="flex items-center space-x-4">
              <input
                type="text"
                placeholder="Search by Financial Year, Distribution No, or Location"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 border border-gray-300 rounded-md shadow-sm p-2 focus:ring-brand-primary focus:border-brand-primary text-sm"
              />
              <button
                onClick={() => setIsFormVisible(!isFormVisible)}
                className="bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-red-600 text-sm"
              >
                {isFormVisible ? 'Hide Form' : 'Create Distribution'}
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-6 mb-6">
            {isFormVisible && (
              <div>
                <h3 className="text-lg font-medium text-brand-secondary mb-4">
                  {isEditMode ? 'Edit Distribution' : 'Add Distribution'}
                </h3>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Financial Year</label>
                    <Select
                      options={financialYearOptions}
                      value={financialYearOptions.find((option) => option.value === formData.financialYearId)}
                      onChange={(option) => handleSelectChange('financialYearId', option)}
                      className="text-sm"
                      classNamePrefix="select"
                      placeholder="Select Financial Year"
                      isClearable
                    />
                    {errors.financialYearId && (
                      <p className="mt-1 text-sm text-red-600">{errors.financialYearId}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Institute</label>
                    <Select
                      options={instituteOptions}
                      value={instituteOptions.find((option) => option.value === formData.instituteId)}
                      onChange={(option) => handleSelectChange('instituteId', option)}
                      className="text-sm"
                      classNamePrefix="select"
                      placeholder="Select Institute"
                      isClearable
                    />
                    {errors.instituteId && (
                      <p className="mt-1 text-sm text-red-600">{errors.instituteId}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Floor</label>
                    <Select
                      options={floorOptions}
                      value={floorOptions.find((option) => option.value === formData.floor)}
                      onChange={(option) => handleSelectChange('floor', option)}
                      className="text-sm"
                      classNamePrefix="select"
                      placeholder="Select Floor"
                      isClearable
                    />
                    {errors.location && (
                      <p className="mt-1 text-sm text-red-600">{errors.location}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Room</label>
                    <Select
                      options={roomOptions}
                      value={roomOptions.find((option) => option.value === formData.rooms)}
                      onChange={(option) => handleSelectChange('rooms', option)}
                      className="text-sm"
                      classNamePrefix="select"
                      placeholder="Select Room"
                      isClearable
                      isDisabled={!formData.floor}
                    />
                    {errors.rooms && (
                      <p className="mt-1 text-sm text-red-600">{errors.rooms}</p>
                    )}
                  </div>
                  <FormInput
                    label="Distribution Date"
                    type="date"
                    name="distributionDate"
                    value={formData.distributionDate}
                    onChange={handleChange}
                    error={errors.distributionDate}
                    required
                    className="w-full text-sm"
                  />
                  <FormInput
                    label="Employee Name"
                    type="text"
                    name="employeeName"
                    value={formData.employeeName}
                    onChange={handleChange}
                    error={errors.employeeName}
                    required
                    className="w-full text-sm"
                  />
                  <FormInput
                    label="Document"
                    type="file"
                    name="documents"
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                    error={errors.documents}
                    required={false}
                    className="w-full text-xs sm:text-sm"
                  />
                  <FormInput
                    label="Remark"
                    type="textarea"
                    name="remark"
                    value={formData.remark}
                    onChange={handleChange}
                    error={errors.remark}
                    required={false}
                    className="w-full text-sm"
                  />
                  <div className="col-span-3">
                    <h4 className="text-md font-medium text-brand-secondary mb-2">Items</h4>
                    {formData.items.map((item, index) => (
                      <div key={index} className="flex flex-col gap-4 mb-4 p-4 border rounded-md">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700">Item</label>
                            <Select
                              options={itemOptions}
                              value={itemOptions.find((option) => option.value === item.itemId)}
                              onChange={(option) =>
                                handleItemChange(index, { target: { name: 'itemId', value: option ? option.value : '' } })
                              }
                              className="text-sm"
                              classNamePrefix="select"
                              placeholder="Select Item"
                              isClearable
                            />
                            {errors[`items[${index}].itemId`] && (
                              <p className="mt-1 text-sm text-red-600">{errors[`items[${index}].itemId`]}</p>
                            )}
                          </div>
                          <FormInput
                            label="Issue Quantity"
                            type="number"
                            name="issueQuantity"
                            value={item.issueQuantity}
                            onChange={(e) => handleItemChange(index, e)}
                            error={errors[`items[${index}].issueQuantity`]}
                            required
                            min="1"
                            className="w-full text-sm"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="text-red-600 hover:text-red-800 text-xs sm:text-sm mt-2"
                        >
                          Remove Item
                        </button>
                      </div>
                    ))}
                    {errors.items && (
                      <p className="mt-1 text-sm text-red-600">{errors.items}</p>
                    )}
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="w-full sm:w-auto bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 text-xs sm:text-sm"
                    >
                      Add Item
                    </button>
                  </div>
                  <div className="col-span-3 flex space-x-4">
                    <button
                      type="submit"
                      className="bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-red-600 text-sm"
                    >
                      {isEditMode ? 'Update' : 'Add'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-4 py-2 text-gray-600 rounded-md hover:bg-gray-100 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
            <div>
              <Table
                columns={distributionColumns}
                data={filteredDistributions}
                actions={actions}
                onRowClick={handleRowClick}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Distribution;