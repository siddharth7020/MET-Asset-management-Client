import React, { useState, useEffect } from 'react';
import Table from '../components/Table';
import FormInput from '../components/FormInput';
import VendorDetails from './VendorDetails';

function Vendor() {
  const [vendors, setVendors] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    vendorId: '',
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

  // Initialize with dummy data
  useEffect(() => {
    setVendors([
      {
        vendorId: 1,
        name: 'John Doe',
        companyName: 'ABC Supplies',
        address: '123 Main St, City',
        email: 'john@abcsupplies.com',
        mobileNo: '9876543210',
        pancardNo: 'ABCDE1234F',
        gstNo: '22AAAAA0000A1Z5',
        bankName: 'State Bank',
        accountNo: '123456789012',
        ifscCode: 'SBIN0001234',
        tanNo: 'ABCD12345E',
        website: 'https://abcsupplies.com',
        remark: 'Reliable supplier',
      },
      {
        vendorId: 2,
        name: 'Jane Smith',
        companyName: 'XYZ Traders',
        address: '456 Elm St, Town',
        email: 'jane@xyztraders.com',
        mobileNo: '8765432109',
        pancardNo: 'FGHIJ5678K',
        gstNo: '33BBBBB1111B2Y6',
        bankName: 'HDFC Bank',
        accountNo: '987654321098',
        ifscCode: 'HDFC0005678',
        tanNo: 'WXYZ67890F',
        website: '',
        remark: 'New vendor',
      },
    ]);
  }, []);

  // Table columns
  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'companyName', label: 'Company' },
    { key: 'email', label: 'Email' },
    { key: 'mobileNo', label: 'Mobile' },
  ];

  // Table actions
  const actions = [
    {
      label: 'Edit',
      onClick: (row) => {
        setIsEditMode(true);
        setEditId(row.vendorId);
        setFormData({
          vendorId: row.vendorId,
          name: row.name,
          companyName: row.companyName,
          address: row.address,
          email: row.email,
          mobileNo: row.mobileNo,
          pancardNo: row.pancardNo,
          gstNo: row.gstNo,
          bankName: row.bankName,
          accountNo: row.accountNo,
          ifscCode: row.ifscCode,
          tanNo: row.tanNo,
          website: row.website,
          remark: row.remark,
        });
        setIsFormVisible(true);
      },
      className: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      label: 'Delete',
      onClick: (row) => {
        if (window.confirm(`Delete vendor ${row.name}?`)) {
          setVendors((prev) => prev.filter((v) => v.vendorId !== row.vendorId));
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
    if (!formData.name) newErrors.name = 'Name is required';
    else if (formData.name.length < 3 || formData.name.length > 50) {
      newErrors.name = 'Name must be between 3 to 50 characters';
    }
    if (!formData.companyName) newErrors.companyName = 'Company name is required';
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.mobileNo) newErrors.mobileNo = 'Mobile number is required';
    else if (!/^\d{10}$/.test(formData.mobileNo)) {
      newErrors.mobileNo = 'Mobile number must be 10 digits';
    }
    if (!formData.pancardNo) newErrors.pancardNo = 'PAN card number is required';
    else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pancardNo)) {
      newErrors.pancardNo = 'Invalid PAN card number format';
    }
    if (!formData.gstNo) newErrors.gstNo = 'GST number is required';
    if (!formData.bankName) newErrors.bankName = 'Bank name is required';
    if (!formData.accountNo) newErrors.accountNo = 'Account number is required';
    if (!formData.ifscCode) newErrors.ifscCode = 'IFSC code is required';
    if (!formData.tanNo) newErrors.tanNo = 'TAN number is required';
    if (!formData.remark) newErrors.remark = 'Remark is required';
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
      setVendors((prev) =>
        prev.map((v) => (v.vendorId === editId ? { ...formData, vendorId: editId } : v))
      );
    } else {
      const newId = Math.max(...vendors.map((v) => v.vendorId), 0) + 1;
      setVendors((prev) => [...prev, { ...formData, vendorId: newId }]);
    }

    resetForm();
    setIsFormVisible(false);
  };

  const resetForm = () => {
    setFormData({
      vendorId: '',
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

  // Handle row click to show details
  const handleRowClick = (row) => {
    setSelectedVendorId(row.vendorId);
  };

  // Handle back to table view
  const handleBack = () => {
    setSelectedVendorId(null);
  };

  // Get selected vendor data
  const selectedVendor = vendors.find((v) => v.vendorId === selectedVendorId);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {selectedVendorId ? (
        <VendorDetails vendor={selectedVendor} onBack={handleBack} />
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-brand-secondary mb-4">Vendors</h2>
            <div>
              <button
                onClick={() => setIsFormVisible(!isFormVisible)}
                className="bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-red-600"
              >
                {isFormVisible ? 'Hide Form' : 'Add Vendor'}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-6 mb-6">
            {isFormVisible && (
              <div>
                <h3 className="text-lg font-medium text-brand-secondary mb-4">
                  {isEditMode ? 'Edit Vendor' : 'Add Vendor'}
                </h3>
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                      label="Name"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      error={errors.name}
                      required
                      className="w-full text-xs sm:text-sm"
                    />
                    <FormInput
                      label="Company Name"
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      error={errors.companyName}
                      required
                      className="w-full text-xs sm:text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                      label="Address"
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      error={errors.address}
                      required
                      className="w-full text-xs sm:text-sm"
                    />
                    <FormInput
                      label="Email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      error={errors.email}
                      required
                      className="w-full text-xs sm:text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                      label="Mobile Number"
                      type="text"
                      name="mobileNo"
                      value={formData.mobileNo}
                      onChange={handleChange}
                      error={errors.mobileNo}
                      required
                      className="w-full text-xs sm:text-sm"
                    />
                    <FormInput
                      label="PAN Card Number"
                      type="text"
                      name="pancardNo"
                      value={formData.pancardNo}
                      onChange={handleChange}
                      error={errors.pancardNo}
                      required
                      className="w-full text-xs sm:text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                      label="GST Number"
                      type="text"
                      name="gstNo"
                      value={formData.gstNo}
                      onChange={handleChange}
                      error={errors.gstNo}
                      required
                      className="w-full text-xs sm:text-sm"
                    />
                    <FormInput
                      label="Bank Name"
                      type="text"
                      name="bankName"
                      value={formData.bankName}
                      onChange={handleChange}
                      error={errors.bankName}
                      required
                      className="w-full text-xs sm:text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                      label="Account Number"
                      type="text"
                      name="accountNo"
                      value={formData.accountNo}
                      onChange={handleChange}
                      error={errors.accountNo}
                      required
                      className="w-full text-xs sm:text-sm"
                    />
                    <FormInput
                      label="IFSC Code"
                      type="text"
                      name="ifscCode"
                      value={formData.ifscCode}
                      onChange={handleChange}
                      error={errors.ifscCode}
                      required
                      className="w-full text-xs sm:text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                      label="TAN Number"
                      type="text"
                      name="tanNo"
                      value={formData.tanNo}
                      onChange={handleChange}
                      error={errors.tanNo}
                      required
                      className="w-full text-xs sm:text-sm"
                    />
                    <FormInput
                      label="Website"
                      type="text"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      error={errors.website}
                      required={false}
                      className="w-full text-xs sm:text-sm"
                    />
                  </div>
                  <FormInput
                    label="Remark"
                    type="text"
                    name="remark"
                    value={formData.remark}
                    onChange={handleChange}
                    error={errors.remark}
                    required
                    className="w-full text-xs sm:text-sm"
                  />
                  <div className="flex space-x-2 mt-4">
                    <button
                      type="submit"
                      className="bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-red-600 text-xs sm:text-sm"
                    >
                      {isEditMode ? 'Update' : 'Add'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        resetForm();
                        setIsFormVisible(false);
                      }}
                      className="px-4 py-2 text-gray-600 rounded-md hover:bg-gray-100 text-xs sm:text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
            <div>
              <Table
                columns={columns}
                data={vendors}
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

export default Vendor;