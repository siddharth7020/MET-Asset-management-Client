import React from 'react';
import PropTypes from 'prop-types';

const Details = ({ purchaseOrder, orderItems, institutesData, financialYears, vendors, items, onBack }) => {
  if (!purchaseOrder) {
    return <div className="text-center p-6">No purchase order selected</div>;
  }

  const institute = institutesData.find((inst) => inst.instituteId === purchaseOrder.instituteId);
  const financialYear = financialYears.find((year) => year.financialYearId === purchaseOrder.financialYearId);
  const vendor = vendors.find((vend) => vend.vendorId === purchaseOrder.vendorId);

  const handleDocumentDownload = () => {
    try {
      // Check if document is a valid URL
      if (purchaseOrder.document && purchaseOrder.document.startsWith('http')) {
        const link = document.createElement('a');
        link.href = purchaseOrder.document;
        link.target = '_blank';
        link.download = purchaseOrder.poNo ? `PO_${purchaseOrder.poNo}.pdf` : 'document.pdf';
        link.click();
      } else if (purchaseOrder.document && purchaseOrder.document.startsWith('data:')) {
        // Handle base64 or data URL
        const link = document.createElement('a');
        link.href = purchaseOrder.document;
        link.download = purchaseOrder.poNo ? `PO_${purchaseOrder.poNo}.pdf` : 'document.pdf';
        link.click();
      } else {
        console.error('Invalid document URL or data:', purchaseOrder.document);
        alert('Unable to download document. Invalid document source.');
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Error downloading document. Please try again later.');
    }
  };

  return (
    <div className="">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-brand-secondary">Purchase Order Details</h2>
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
            <span className="text-xs sm:text-sm font-semibold text-gray-700">PO Number</span>
            <span className="text-xs sm:text-sm text-gray-900">{purchaseOrder.poNo}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-semibold text-gray-700">Vendor</span>
            <span className="text-xs sm:text-sm text-gray-900">{vendor?.name || 'N/A'}</span>
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
            <span className="text-xs sm:text-sm font-semibold text-gray-700">Requested By</span>
            <span className="text-xs sm:text-sm text-gray-900">{purchaseOrder.requestedBy}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-semibold text-gray-700">PO Date</span>
            <span className="text-xs sm:text-sm text-gray-900">
              {new Date(purchaseOrder.poDate).toLocaleDateString()}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-semibold text-gray-700">Document</span>
            {purchaseOrder.document ? (
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-xs sm:text-sm w-50"
                onClick={handleDocumentDownload}
              >
                Download Document
              </button>
            ) : (
              <span className="text-xs sm:text-sm text-gray-900">No document available</span>
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-semibold text-gray-700">Remark</span>
            <span className="text-xs sm:text-sm text-gray-900">{purchaseOrder.remark || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Items Section */}
      <div>
        <h3 className="text-sm sm:text-base font-medium text-brand-secondary mb-4">Items</h3>
        {/* Mobile View */}
        <div className="sm:hidden space-y-4">
          {orderItems.map((item) => (
            <div key={item.id} className="p-4 border rounded-md bg-gray-50">
              <p className="text-xs">
                <strong>Item ID:</strong> {item.id}
              </p>
              <p className="text-xs">
                <strong>Item Name:</strong> {items.find((i) => i.itemId === item.itemId)?.itemName || 'N/A'}
              </p>
              <p className="text-xs">
                <strong>Quantity:</strong> {item.quantity}
              </p>
              <p className="text-xs">
                <strong>Rate:</strong> {item.rate}
              </p>
              <p className="text-xs">
                <strong>Amount:</strong> {item.amount}
              </p>
              <p className="text-xs">
                <strong>Discount Amount:</strong> {item.discount}
              </p>
              <p className="text-xs">
                <strong>Total Amount:</strong> {item.totalAmount}
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
                <th scope="col" className="px-6 py-3">Quantity</th>
                <th scope="col" className="px-6 py-3">Rate</th>
                <th scope="col" className="px-6 py-3">Amount</th>
                <th scope="col" className="px-6 py-3">Discount Amount</th>
                <th scope="col" className="px-6 py-3">Total Amount</th>
              </tr>
            </thead>
            <tbody>
              {orderItems.map((item) => (
                <tr key={item.id} className="bg-white border-b">
                  <td className="px-6 py-4">{items.find((i) => i.itemId === item.itemId)?.itemName || 'N/A'}</td>
                  <td className="px-6 py-4">{item.quantity}</td>
                  <td className="px-6 py-4">{item.rate}</td>
                  <td className="px-6 py-4">{item.amount}</td>
                  <td className="px-6 py-4">{item.discount}</td>
                  <td className="px-6 py-4">{item.totalAmount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

Details.propTypes = {
  purchaseOrder: PropTypes.shape({
    poId: PropTypes.number,
    poNo: PropTypes.string,
    poDate: PropTypes.string,
    instituteId: PropTypes.number,
    financialYearId: PropTypes.number,
    vendorId: PropTypes.number,
    document: PropTypes.string,
    requestedBy: PropTypes.string,
    remark: PropTypes.string,
  }),
  orderItems: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      itemId: PropTypes.number,
      quantity: PropTypes.number,
      rate: PropTypes.number,
      amount: PropTypes.number,
      discount: PropTypes.number,
      totalAmount: PropTypes.number,
    })
  ).isRequired,
  institutesData: PropTypes.arrayOf(
    PropTypes.shape({
      instituteId: PropTypes.number,
      instituteName: PropTypes.string,
    })
  ).isRequired,
  financialYears: PropTypes.arrayOf(
    PropTypes.shape({
      financialYearId: PropTypes.number,
      year: PropTypes.string,
    })
  ).isRequired,
  vendors: PropTypes.arrayOf(
    PropTypes.shape({
      vendorId: PropTypes.number,
      name: PropTypes.string,
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

Details.defaultProps = {
  purchaseOrder: null,
};

export default Details;