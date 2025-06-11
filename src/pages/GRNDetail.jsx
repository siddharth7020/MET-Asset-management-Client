import React from 'react';
import PropTypes from 'prop-types';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const GrnDetails = ({ grn, grnItems, purchaseOrders, onBack, items }) => {
  if (!grn) {
    return <div className="text-center p-6">No GRN selected</div>;
  }

  const purchaseOrder = purchaseOrders.find((po) => po.poId === grn.poId);

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
        <h2 className="text-lg sm:text-xl font-semibold text-brand-secondary">GRN Details</h2>
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
            <span className="text-xs sm:text-sm font-semibold text-gray-700">GRN Number</span>
            <span className="text-xs sm:text-sm text-gray-900">{grn.grnNo}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-semibold text-gray-700">Purchase Order</span>
            <span className="text-xs sm:text-sm text-gray-900">{purchaseOrder?.poNo || 'N/A'}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-semibold text-gray-700">GRN Date</span>
            <span className="text-xs sm:text-sm text-gray-900">
              {new Date(grn.grnDate).toLocaleDateString()}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-semibold text-gray-700">Challan Number</span>
            <span className="text-xs sm:text-sm text-gray-900">{grn.challanNo}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-semibold text-gray-700">Challan Date</span>
            <span className="text-xs sm:text-sm text-gray-900">
              {new Date(grn.challanDate).toLocaleDateString()}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-semibold text-gray-700">Documents</span>
            {grn.document && grn.document.length > 0 ? (
              <div className="flex flex-col gap-2">
                {grn.document.map((doc, index) => (
                  <button
                    key={index}
                    onClick={() => handleDocumentDownload(doc)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-xs sm:text-sm w-48"
                  >
                    View Document {index + 1}
                  </button>
                ))}
              </div>
            ) : (
              <span className="text-xs sm:text-sm text-gray-900">No documents available</span>
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-semibold text-gray-700">Remark</span>
            <span className="text-xs sm:text-sm text-gray-900">{grn.remark || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Items Section */}
      <div>
        <h3 className="text-sm sm:text-base font-medium text-brand-secondary mb-4">GRN Items</h3>
        {/* Mobile View */}
        <div className="sm:hidden space-y-4">
          {grnItems.map((item) => (
            <div key={item.id} className="p-4 border rounded-md bg-gray-50">
              <p className="text-xs">
                <strong>Item Name:</strong> {items.find((i) => i.itemId === item.itemId)?.itemName || 'N/A'}
              </p>
              <p className="text-xs">
                <strong>Received Quantity:</strong> {item.receivedQuantity}
              </p>
              <p className="text-xs">
                <strong>Rejected Quantity:</strong> {item.rejectedQuantity || 'N/A'}
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
                <th scope="col" className="px-6 py-3">Received Quantity</th>
                <th scope="col" className="px-6 py-3">Rejected Quantity</th>
              </tr>
            </thead>
            <tbody>
              {grnItems.map((item) => (
                <tr key={item.id} className="bg-white border-b">
                  <td className="px-6 py-4">
                    {items.find((i) => i.itemId === item.itemId)?.itemName || 'N/A'}
                  </td>
                  <td className="px-6 py-4">{item.receivedQuantity}</td>
                  <td className="px-6 py-4">{item.rejectedQuantity || '0'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

GrnDetails.propTypes = {
  grn: PropTypes.shape({
    id: PropTypes.number,
    poId: PropTypes.number,
    grnNo: PropTypes.string,
    grnDate: PropTypes.string,
    challanNo: PropTypes.string,
    challanDate: PropTypes.string,
    document: PropTypes.arrayOf(PropTypes.string), // Updated to array of strings
    remark: PropTypes.string,
  }),
  grnItems: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      orderItemId: PropTypes.number,
      itemId: PropTypes.number,
      receivedQuantity: PropTypes.number,
      rejectedQuantity: PropTypes.number,
    })
  ).isRequired,
  purchaseOrders: PropTypes.arrayOf(
    PropTypes.shape({
      poId: PropTypes.number,
      poNo: PropTypes.string,
    })
  ).isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      itemId: PropTypes.number,
      itemName: PropTypes.string,
    })
  ).isRequired,
  onBack: PropTypes.func.isRequired,
};

GrnDetails.defaultProps = {
  grn: null,
};

export default GrnDetails;