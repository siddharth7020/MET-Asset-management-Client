import React from 'react';
import PropTypes from 'prop-types';

const VendorDetails = ({ vendor, onBack }) => {
  if (!vendor) {
    return <div className="text-center p-6">No vendor selected</div>;
  }

  return (
    <div className="">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-brand-secondary">Vendor Details</h2>
        <button
          onClick={onBack}
          className="bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-red-600 text-xs sm:text-sm"
        >
          Back to List
        </button>
      </div>

      {/* Details Section */}
      <div className="p-6 bg-gray-50 rounded-md shadow mb-6">
        <h3 className="text-sm sm:text-base font-medium text-brand-secondary mb-4">Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-semibold text-gray-700">Vendor ID</span>
            <span className="text-xs sm:text-sm text-gray-900">{vendor.vendorId}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-semibold text-gray-700">Name</span>
            <span className="text-xs sm:text-sm text-gray-900">{vendor.name}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-semibold text-gray-700">Company Name</span>
            <span className="text-xs sm:text-sm text-gray-900">{vendor.companyName}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-semibold text-gray-700">Email</span>
            <span className="text-xs sm:text-sm text-gray-900">{vendor.email}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-semibold text-gray-700">Mobile Number</span>
            <span className="text-xs sm:text-sm text-gray-900">{vendor.mobileNo}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-semibold text-gray-700">Address</span>
            <span className="text-xs sm:text-sm text-gray-900">{vendor.address}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-semibold text-gray-700">PAN Card Number</span>
            <span className="text-xs sm:text-sm text-gray-900">{vendor.pancardNo}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-semibold text-gray-700">GST Number</span>
            <span className="text-xs sm:text-sm text-gray-900">{vendor.gstNo}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-semibold text-gray-700">Bank Name</span>
            <span className="text-xs sm:text-sm text-gray-900">{vendor.bankName}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-semibold text-gray-700">Account Number</span>
            <span className="text-xs sm:text-sm text-gray-900">{vendor.accountNo}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-semibold text-gray-700">IFSC Code</span>
            <span className="text-xs sm:text-sm text-gray-900">{vendor.ifscCode}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-semibold text-gray-700">TAN Number</span>
            <span className="text-xs sm:text-sm text-gray-900">{vendor.tanNo}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-semibold text-gray-700">Website</span>
            <span className="text-xs sm:text-sm text-gray-900">{vendor.website || 'N/A'}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-semibold text-gray-700">Remark</span>
            <span className="text-xs sm:text-sm text-gray-900">{vendor.remark}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

VendorDetails.propTypes = {
  vendor: PropTypes.shape({
    vendorId: PropTypes.number,
    name: PropTypes.string,
    companyName: PropTypes.string,
    address: PropTypes.string,
    email: PropTypes.string,
    mobileNo: PropTypes.string,
    pancardNo: PropTypes.string,
    gstNo: PropTypes.string,
    bankName: PropTypes.string,
    accountNo: PropTypes.string,
    ifscCode: PropTypes.string,
    tanNo: PropTypes.string,
    website: PropTypes.string,
    remark: PropTypes.string,
  }),
  onBack: PropTypes.func.isRequired,
};

VendorDetails.defaultProps = {
  vendor: null,
};

export default VendorDetails;