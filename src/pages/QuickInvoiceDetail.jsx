import React from 'react';
import PropTypes from 'prop-types';

const QuickInvoiceDetails = ({ quickInvoice, quickInvoiceItems, quickGRNs, items, onBack }) => {
  // Debug log for items prop


  if (!quickInvoice) {
    return <div className="text-center p-6">No Quick Invoice selected</div>;
  }

  return (
    <div className="">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-brand-secondary">Quick Invoice Details</h2>
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
            <span className="text-xs sm:text-sm font-semibold text-gray-700">Quick Invoice Number</span>
            <span className="text-xs sm:text-sm text-gray-900">{quickInvoice.qInvoiceNo}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-semibold text-gray-700">Quick Invoice Date</span>
            <span className="text-xs sm:text-sm text-gray-900">
              {new Date(quickInvoice.qInvoiceDate).toLocaleDateString()}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-semibold text-gray-700">Quick GRNs</span>
            <span className="text-xs sm:text-sm text-gray-900">
              {quickInvoice.qGRNIds
                .map((id) => quickGRNs.find((g) => g.qGRNId === id)?.qGRNNo || id)
                .join(', ')}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-semibold text-gray-700">Total Amount</span>
            <span className="text-xs sm:text-sm text-gray-900">
              ₹{parseFloat(quickInvoice.totalAmount).toFixed(2)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-semibold text-gray-700">Remark</span>
            <span className="text-xs sm:text-sm text-gray-900">{quickInvoice.remark || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Items Section */}
      <div>
        <h3 className="text-sm sm:text-base font-medium text-brand-secondary mb-4">Items</h3>
        {/* Mobile View */}
        <div className="sm:hidden space-y-4">
          {quickInvoiceItems.map((item) => (
            <div key={item.qInvoiceItemId} className="p-4 border rounded-md bg-gray-50">
              <p className="text-xs">
                <strong>Item ID:</strong> {item.qInvoiceItemId}
              </p>
              <p className="text-xs">
                <strong>Quick GRN:</strong> {quickGRNs.find((g) => g.qGRNId === item.qGRNId)?.qGRNNo || item.qGRNId}
              </p>
              <p className="text-xs">
                <strong>GRN Item ID:</strong> {item.qGRNItemid}
              </p>
              <p className="text-xs">
                <strong>Item Name:</strong> {items.itemId}
              </p>
              <p className="text-xs">
                <strong>Quantity:</strong> {item.quantity}
              </p>
              <p className="text-xs">
                <strong>Rate:</strong> ₹{parseFloat(item.rate).toFixed(2)}
              </p>
              <p className="text-xs">
                <strong>Discount:</strong> ₹{parseFloat(item.discount).toFixed(2)}
              </p>
              <p className="text-xs">
                <strong>Tax %:</strong> {parseFloat(item.taxPercentage).toFixed(2)}%
              </p>
              <p className="text-xs">
                <strong>Tax Amount:</strong> ₹{parseFloat(item.taxAmount).toFixed(2)}
              </p>
              <p className="text-xs">
                <strong>Total Amount:</strong> ₹{parseFloat(item.totalAmount).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
        {/* Desktop View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-900">
            <thead className="text-xs uppercase bg-gray-200">
              <tr>
                <th scope="col" className="px-6 py-3">GRN Item ID</th>
                <th scope="col" className="px-6 py-3">Item Name</th>
                <th scope="col" className="px-6 py-3">Quantity</th>
                <th scope="col" className="px-6 py-3">Rate</th>
                <th scope="col" className="px-6 py-3">Discount</th>
                <th scope="col" className="px-6 py-3">Tax %</th>
                <th scope="col" className="px-6 py-3">Tax Amount</th>
                <th scope="col" className="px-6 py-3">Total Amount</th>
              </tr>
            </thead>
            <tbody>
              {quickInvoiceItems.map((item) => (
                <tr key={item.qInvoiceItemId} className="bg-white border-b">
                  <td className="px-6 py-4">{item.qGRNItemid}</td>
                  <td className="px-6 py-4">{items.find((i) => i.itemId === item.itemId)?.itemName}</td>
                  <td className="px-6 py-4">{item.quantity}</td>
                  <td className="px-6 py-4">₹{parseFloat(item.rate).toFixed(2)}</td>
                  <td className="px-6 py-4">₹{parseFloat(item.discount).toFixed(2)}</td>
                  <td className="px-6 py-4">{parseFloat(item.taxPercentage).toFixed(2)}%</td>
                  <td className="px-6 py-4">₹{parseFloat(item.taxAmount).toFixed(2)}</td>
                  <td className="px-6 py-4">₹{parseFloat(item.totalAmount).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

QuickInvoiceDetails.propTypes = {
  quickInvoice: PropTypes.shape({
    qInvoiceId: PropTypes.number,
    qInvoiceNo: PropTypes.string,
    qInvoiceDate: PropTypes.string,
    qGRNIds: PropTypes.arrayOf(PropTypes.number),
    totalAmount: PropTypes.number,
    remark: PropTypes.string,
    createdAt: PropTypes.string,
    updatedAt: PropTypes.string,
  }),
  quickInvoiceItems: PropTypes.arrayOf(
    PropTypes.shape({
      qInvoiceItemId: PropTypes.number,
      qInvoiceId: PropTypes.number,
      qGRNId: PropTypes.number,
      qGRNItemid: PropTypes.number,
      itemId: PropTypes.number,
      quantity: PropTypes.number,
      rate: PropTypes.number,
      discount: PropTypes.number,
      taxPercentage: PropTypes.number,
      taxAmount: PropTypes.number,
      totalAmount: PropTypes.number,
      createdAt: PropTypes.string,
      updatedAt: PropTypes.string,
    })
  ).isRequired,
  quickGRNs: PropTypes.arrayOf(
    PropTypes.shape({
      qGRNId: PropTypes.number,
      qGRNNo: PropTypes.string,
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

QuickInvoiceDetails.defaultProps = {
  quickInvoice: null,
};

export default QuickInvoiceDetails;