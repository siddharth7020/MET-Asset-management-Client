import React, { useState, useEffect } from 'react';
import Table from '../components/Table';
import FormInput from '../components/FormInput';
import VendorDetails from './VendorDetails';
import {
  getVendors,
  createVendor,
  updateVendor,
  deleteVendor
} from '../api/vendorService';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

function Vendor() {
  const [vendors, setVendors] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    address: '',
    email: '',
    mobileNo: '',
    pancardNo: '',
    gstNo: '',
    bankName: '',
    accountNo: '',
    ifscCode: '',
    tanNo: '',
    website: '',
    remark: '',
  });
  const [errors, setErrors] = useState({});
  const [editId, setEditId] = useState(null);
  const [selectedVendorId, setSelectedVendorId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const res = await getVendors();
      setVendors(res.data.data);
    } catch (error) {
      console.error('Fetch error:', error);
      MySwal.fire('Error', 'Failed to load vendors', 'error');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'companyName', label: 'Company' },
    { key: 'email', label: 'Email' },
    { key: 'mobileNo', label: 'Mobile' },
  ];

  const actions = [
    {
      label: 'Edit',
      onClick: (row) => {
        setIsEditMode(true);
        setEditId(row.vendorId);
        setFormData({ ...row });
        setIsFormVisible(true);
      },
      className: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      label: 'Delete',
      onClick: async (row) => {
        const result = await MySwal.fire({
          title: `Delete ${row.name}?`,
          text: 'This action cannot be undone!',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6',
          confirmButtonText: 'Yes, delete it!',
        });

        if (result.isConfirmed) {
          try {
            await deleteVendor(row.vendorId);
            await fetchVendors();
            resetForm();
            MySwal.fire('Deleted!', 'Vendor has been deleted.', 'success');
          } catch (err) {
            console.error('Delete failed:', err);
            MySwal.fire('Error', 'Failed to delete vendor.', 'error');
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
    if (!formData.name) newErrors.name = 'Name is required';
    else if (formData.name.length < 3 || formData.name.length > 50) {
      newErrors.name = 'Name must be between 3 to 50 characters';
    }
    if (!formData.companyName) newErrors.companyName = 'Company name is required';
    if (!formData.address) newErrors.address = 'Address is required';
    
    
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
        await updateVendor(editId, formData);
        MySwal.fire('Updated', 'Vendor updated successfully', 'success');
      } else {
        await createVendor(formData);
        MySwal.fire('Created', 'Vendor added successfully', 'success');
      }
      await fetchVendors();
      resetForm();
      setIsFormVisible(false);
    } catch (err) {
      console.error('Submit error:', err);
      MySwal.fire('Error', 'Failed to save vendor', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      companyName: '',
      address: '',
      email: '',
      mobileNo: '',
      pancardNo: '',
      gstNo: '',
      bankName: '',
      accountNo: '',
      ifscCode: '',
      tanNo: '',
      website: '',
      remark: '',
    });
    setErrors({});
    setIsEditMode(false);
    setEditId(null);
  };

  const handleRowClick = (row) => {
    setSelectedVendorId(row.vendorId);
  };

  const handleBack = () => {
    setSelectedVendorId(null);
  };

  const selectedVendor = vendors.find((v) => v.vendorId === selectedVendorId);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {selectedVendorId ? (
        <VendorDetails vendor={selectedVendor} onBack={handleBack} />
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-brand-secondary mb-4">Vendors</h2>
            <button
              onClick={() => setIsFormVisible(!isFormVisible)}
              className="bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-red-600"
            >
              {isFormVisible ? 'Hide Form' : 'Add Vendor'}
            </button>
          </div>

          <div className="flex flex-col gap-6 mb-6">
            {isFormVisible && (
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput label="Name" name="name" value={formData.name} onChange={handleChange} error={errors.name} required />
                  <FormInput label="Company Name" name="companyName" value={formData.companyName} onChange={handleChange} error={errors.companyName} required />
                  <FormInput label="Address" name="address" value={formData.address} onChange={handleChange} error={errors.address} required />
                  <FormInput label="Email" name="email" type={'email'} value={formData.email} onChange={handleChange} error={errors.email}  />
                  <FormInput label="Mobile Number" name="mobileNo" type={'number'} value={formData.mobileNo} onChange={handleChange} error={errors.mobileNo}  />
                  <FormInput label="PAN Card Number" name="pancardNo" value={formData.pancardNo} onChange={handleChange} error={errors.pancardNo}  />
                  <FormInput label="GST Number" name="gstNo" value={formData.gstNo} onChange={handleChange} error={errors.gstNo}  />
                  <FormInput label="Bank Name" name="bankName" value={formData.bankName} onChange={handleChange} error={errors.bankName}  />
                  <FormInput label="Account Number" name="accountNo" value={formData.accountNo} onChange={handleChange} error={errors.accountNo}  />
                  <FormInput label="IFSC Code" name="ifscCode" value={formData.ifscCode} onChange={handleChange} error={errors.ifscCode}  />
                  <FormInput label="TAN Number" name="tanNo" value={formData.tanNo} onChange={handleChange} error={errors.tanNo}  />
                  <FormInput label="Website" name="website" type={'url'} value={formData.website} onChange={handleChange} error={errors.website} />
                  <FormInput label="Remark" name="remark" value={formData.remark} onChange={handleChange} error={errors.remark}  />
                </div>
                <div className="flex space-x-2 mt-4">
                  <button type="submit" className="bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-red-600">
                    {isEditMode ? 'Update' : 'Add'}
                  </button>
                  <button type="button" onClick={() => { resetForm(); setIsFormVisible(false); }} className="px-4 py-2 text-gray-600 rounded-md hover:bg-gray-100">
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div>
              {loading ? (
                <div className="flex justify-center items-center py-6">
                  <div className="loader border-t-4 border-brand-primary h-10 w-10 rounded-full animate-spin"></div>
                </div>
              ) : (
                <Table columns={columns} data={vendors} actions={actions} onRowClick={handleRowClick} />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Vendor;