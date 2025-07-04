import React from 'react';
import PropTypes from 'prop-types';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const QuickGRNDetails = ({ quickGRN, quickGRNItems, institutes, financialYears, vendors, items, units, onBack }) => {
  if (!quickGRN) {
    return <div className="text-center p-6">No Quick GRN selected</div>;
  }
  

  const institute = institutes.find((inst) => inst.instituteId === quickGRN.instituteId);
  const financialYear = financialYears.find((year) => year.financialYearId === quickGRN.financialYearId);
  const vendor = vendors.find((vend) => vend.vendorId === quickGRN.vendorId);

  const handleDocumentDownload = (documentPath) => {
    try {
      if (documentPath) {
        // Construct full URL using the backend base URL
        const documentUrl = `http://localhost:5000/${documentPath}`;
        window.open(documentUrl, '_blank');
      } else {
        MySwal.fire({
          icon: 'warning',
          title: 'No Document',
          text: 'This document is not available.',
        });
      }
    } catch (error) {
      console.error('Error accessing document:', error);
      MySwal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to access document. Please try again later.',
      });
    }
  };

  return (
    <div className="">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-brand-secondary">Quick GRN Details</h2>
        <button
          onClick={onBack}
          className="bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-brand-primary-hover text-xs sm:text-sm"
        >
          Back to List
        </button>
      </div>

      {/* Details Section */}
      <div className="p-6 bg-gray-50 rounded-md shadow mb-6">
        <h3 className="text-sm sm:text-base font-medium text-brand-secondary mb-4">Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-semibold text-gray-700">Quick GRN Number</span>
            <span className="text-xs sm:text-sm text-gray-900">{quickGRN.qGRNNo}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-semibold text-gray-700">Quick GRN Date</span>
            <span className="text-xs sm:text-sm text-gray-900">
              {new Date(quickGRN.qGRNDate).toLocaleDateString()}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-semibold text-gray-700">Institute</span>
            <span className="text-xs sm:text-sm text-gray-900">{institute?.instituteName || 'N/A'}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-semibold text-gray-700">Financial Year</span>
            <span className="text-xs sm:text-sm text-gray-900">{financialYear?.year || 'N/A'}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-semibold text-gray-700">Vendor</span>
            <span className="text-xs sm:text-sm text-gray-900">{vendor?.name || 'N/A'}</span>
          </div>
        
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-semibold text-gray-700">Items</span>
            {quickGRN.items &&
              quickGRN.items.map((item, index) => (
                <div key={index} className="flex flex-col">
                  <span className="text-xs sm:text-sm text-gray-900">{item.itemName}</span>
                  <span className="text-xs sm:text-sm text-gray-900">{item.quantity}</span>
                </div>
              ))}
          </div>
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-semibold text-gray-700">Challan Number</span>
            <span className="text-xs sm:text-sm text-gray-900">{quickGRN.challanNo || 'N/A'}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-semibold text-gray-700">Challan Date</span>
            <span className="text-xs sm:text-sm text-gray-900">
              {quickGRN.challanDate ? new Date(quickGRN.challanDate).toLocaleDateString() : 'N/A'}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-semibold text-gray-700">Requested By</span>
            <span className="text-xs sm:text-sm text-gray-900">{quickGRN.requestedBy}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-semibold text-gray-700">Remark</span>
            <span className="text-xs sm:text-sm text-gray-900">{quickGRN.remark || 'N/A'}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-semibold text-gray-700">Documents</span>
            {quickGRN.document && quickGRN.document.length > 0 ? (
              <div className="flex flex-col gap-2">
                {quickGRN.document.map((doc, index) => (
                  <button
                    key={index}
                    onClick={() => handleDocumentDownload(doc)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-xs sm:text-sm w-48"
                  >
                    Document {index + 1}
                  </button>
                ))}
              </div>
            ) : (
              <span className="text-xs sm:text-sm text-gray-900">No documents available.</span>
            )}
          </div>
        </div>
      </div>

      {/* Items Section */}
      <div>
        <h3 className="text-sm sm:text-base font-medium text-brand-secondary mb-4">Items</h3>
        {/* Mobile View */}
        <div className="sm:hidden space-y-4">
          {quickGRNItems.map((item) => (
            <div key={item.qGRNItemid} className="p-4 border rounded-md bg-gray-50">
              <p className="text-xs">
                <strong>Item ID:</strong> {item.qGRNItemid}
              </p>
              <p className="text-xs">
              <strong>Item Name:</strong> {items.find((i) => i.itemId === item.itemId)?.itemName || 'N/A'}
              </p>
              <p className="text-xs">
                <strong>Quantity:</strong> {item.quantity}
              </p>
              <p className="text-xs">
                <strong>Rate:</strong> ₹{parseFloat(item.rate).toFixed(2)}
              </p>
              <p className="text-xs">
                <strong>Amount:</strong> ₹{parseFloat(item.amount).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
        {/* Desktop View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-900">
            <thead className="text-xs uppercase bg-gray-200">
              <tr>
                <th scope="col" className="px-6 py-3">Item Name</th>
                <th scope="col" className="px-6 py-3">Unit </th>
                <th scope="col" className="px-6 py-3">Quantity</th>
                <th scope="col" className="px-6 py-3">Rate</th>
                <th scope="col" className="px-6 py-3">Amount</th>
              </tr>
            </thead>
            <tbody>
              {quickGRNItems.map((item) => (
                <tr key={item.qGRNItemid} className="bg-white border-b">
                  <td className="px-6 py-4">{items.find((i) => i.itemId === item.itemId)?.itemName || 'N/A'}</td>
                  <td className="px-6 py-4">
                    {units.find((unit) => unit.unitId === item.unitId)?.uniteName || 'N/A'}
                  </td>
                  <td className="px-6 py-4">{item.quantity}</td>
                  <td className="px-6 py-4">₹{parseFloat(item.rate).toFixed(2)}</td>
                  <td className="px-6 py-4">₹{parseFloat(item.amount).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

QuickGRNDetails.propTypes = {
  quickGRN: PropTypes.shape({
    qGRNId: PropTypes.number,
    qGRNNo: PropTypes.string,
    qGRNDate: PropTypes.string,
    instituteId: PropTypes.number,
    financialYearId: PropTypes.number,
    vendorId: PropTypes.number,
    document: PropTypes.string,
    challanNo: PropTypes.string,
    challanDate: PropTypes.string,
    requestedBy: PropTypes.string,
    remark: PropTypes.string,
    createdAt: PropTypes.string,
    updatedAt: PropTypes.string,
  }),
  quickGRNItems: PropTypes.arrayOf(
    PropTypes.shape({
      qGRNItemid: PropTypes.number,
      qGRNId: PropTypes.number,
      itemId: PropTypes.number,
      quantity: PropTypes.number,
      rate: PropTypes.number,
      amount: PropTypes.number,
      receivedQuantity: PropTypes.number,
      rejectedQuantity: PropTypes.number,
      createdAt: PropTypes.string,
      updatedAt: PropTypes.string,
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
      year: PropTypes.string,
    })
  ).isRequired,
  vendors: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
    })
  ).isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
    })
  ).isRequired,
  onBack: PropTypes.func.isRequired,
};

QuickGRNDetails.defaultProps = {
  quickGRN: null,
};

export default QuickGRNDetails;