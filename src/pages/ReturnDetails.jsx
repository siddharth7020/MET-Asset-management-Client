import React from 'react';
import PropTypes from 'prop-types';

const ReturnDetails = ({ returnData, returnItems, institutes, financialYears, distributions, items, onBack }) => {
  if (!returnData) {
    return <div className="text-center p-6">No return selected</div>;
  }

  const institute = institutes.find((inst) => inst.id === returnData.instituteId);
  const financialYear = financialYears.find((fy) => fy.id === returnData.financialYearId);
  const distribution = distributions.find((dist) => dist.id === returnData.distributionId);

  return (
    <div className="">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-brand-secondary">Return Details</h2>
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
            <span className="text-xs sm:text-sm font-semibold text-gray-700">Return ID</span>
            <span className="text-xs sm:text-sm text-gray-900">{returnData.id}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-semibold text-gray-700">Distribution ID</span>
            <span className="text-xs sm:text-sm text-gray-900">{distribution?.id || 'N/A'}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-semibold text-gray-700">Institute</span>
            <span className="text-xs sm:text-sm text-gray-900">{institute?.name || 'N/A'}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-semibold text-gray-700">Financial Year</span>
            <span className="text-xs sm:text-sm text-gray-900">{financialYear?.name || 'N/A'}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-semibold text-gray-700">Employee Name</span>
            <span className="text-xs sm:text-sm text-gray-900">{returnData.employeeName}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-semibold text-gray-700">Location</span>
            <span className="text-xs sm:text-sm text-gray-900">{returnData.location}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-semibold text-gray-700">Created At</span>
            <span className="text-xs sm:text-sm text-gray-900">
              {new Date(returnData.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-semibold text-gray-700">Documents</span>
            <span className="text-xs sm:text-sm text-gray-900">{returnData.documents || 'N/A'}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-semibold text-gray-700">Remark</span>
            <span className="text-xs sm:text-sm text-gray-900">{returnData.remark || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Items Section */}
      <div>
        <h3 className="text-sm sm:text-base font-medium text-brand-secondary mb-4">Items</h3>
        {/* Mobile View */}
        <div className="sm:hidden space-y-4">
          {returnItems.map((item) => (
            <div key={item.id} className="p-4 border rounded-md bg-gray-50">
              <p className="text-xs">
                <strong>Item ID:</strong> {item.id}
              </p>
              <p className="text-xs">
                <strong>Item Name:</strong> {items.find((i) => i.id === item.itemId)?.itemName || 'N/A'}
              </p>
              <p className="text-xs">
                <strong>Return Quantity:</strong> {item.returnQuantity}
              </p>
            </div>
          ))}
        </div>
        {/* Desktop View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-900">
            <thead className="text-xs uppercase bg-gray-200">
              <tr>
                <th scope="col" className="px-6 py-3">Item ID</th>
                <th scope="col" className="px-6 py-3">Item Name</th>
                <th scope="col" className="px-6 py-3">Return Quantity</th>
              </tr>
            </thead>
            <tbody>
              {returnItems.map((item) => (
                <tr key={item.id} className="bg-white border-b">
                  <td className="px-6 py-4">{item.id}</td>
                  <td className="px-6 py-4">{items.find((i) => i.id === item.itemId)?.itemName || 'N/A'}</td>
                  <td className="px-6 py-4">{item.returnQuantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

ReturnDetails.propTypes = {
  returnData: PropTypes.shape({
    id: PropTypes.number,
    distributionId: PropTypes.number,
    financialYearId: PropTypes.number,
    instituteId: PropTypes.number,
    employeeName: PropTypes.string,
    location: PropTypes.string,
    documents: PropTypes.string,
    remark: PropTypes.string,
    createdAt: PropTypes.string,
  }),
  returnItems: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      itemId: PropTypes.number,
      returnQuantity: PropTypes.number,
    })
  ).isRequired,
  institutes: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
    })
  ).isRequired,
  financialYears: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
    })
  ).isRequired,
  distributions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      employeeName: PropTypes.string,
    })
  ).isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      itemName: PropTypes.string,
    })
  ).isRequired,
  onBack: PropTypes.func.isRequired,
};

ReturnDetails.defaultProps = {
  returnData: null,
};

export default ReturnDetails;