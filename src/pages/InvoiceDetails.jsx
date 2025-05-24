import React from 'react';
import PropTypes from 'prop-types';

const InvoiceDetails = ({ invoice, invoiceItems, purchaseOrders, orderItems, onBack }) => {
  if (!invoice) {
    return <div className="text-center p-6">No invoice selected</div>;
  }

  const purchaseOrder = purchaseOrders.find((po) => po.poId === invoice.poId);
  console.log(invoiceItems);
  

  return (
    <div className="">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-brand-secondary">Invoice Details</h2>
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
            <span className="text-xs sm:text-sm font-semibold text-gray-700">Invoice Number</span>
            <span className="text-xs sm:text-sm text-gray-900">{invoice.invoiceNo}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-semibold text-gray-700">Purchase Order</span>
            <span className="text-xs sm:text-sm text-gray-900">{purchaseOrder?.poNo || 'N/A'}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-semibold text-gray-700">Invoice Date</span>
            <span className="text-xs sm:text-sm text-gray-900">
              {new Date(invoice.invoiceDate).toLocaleDateString()}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-semibold text-gray-700">Subtotal</span>
            <span className="text-xs sm:text-sm text-gray-900">₹{parseFloat(invoice.subtotal).toFixed(2)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-semibold text-gray-700">Total Tax</span>
            <span className="text-xs sm:text-sm text-gray-900">₹{parseFloat(invoice.totalTax).toFixed(2)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-semibold text-gray-700">Invoice Amount</span>
            <span className="text-xs sm:text-sm text-gray-900">₹{parseFloat(invoice.invoiceAmount).toFixed(2)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-semibold text-gray-700">Payment Details</span>
            <span className="text-xs sm:text-sm text-gray-900">{invoice.paymentDetails || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Items Section */}
      <div>
        <h3 className="text-sm sm:text-base font-medium text-brand-secondary mb-4">Items</h3>
        {/* Mobile View */}
        <div className="sm:hidden space-y-4">
          {invoiceItems.map((item) => (
            <div key={item.id} className="p-4 border rounded-md bg-gray-50">
          
              <p className="text-xs">
                <strong>Item Name:</strong> {item.orderItemId}
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
              {invoiceItems.map((item) => (
                <tr key={item.id} className="bg-white border-b">
                  <td className="px-6 py-4">{orderItems.find((oi) => oi.id === item.orderItemId)?.itemName || 'N/A'}</td>
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

InvoiceDetails.propTypes = {
  invoice: PropTypes.shape({
    id: PropTypes.number,
    invoiceNo: PropTypes.string,
    poId: PropTypes.number,
    invoiceDate: PropTypes.string,
    subtotal: PropTypes.number,
    totalTax: PropTypes.number,
    invoiceAmount: PropTypes.number,
    paymentDetails: PropTypes.string,
    paymentDate: PropTypes.string,
    createdAt: PropTypes.string,
    updatedAt: PropTypes.string,
  }),
  invoiceItems: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      invoiceId: PropTypes.number,
      orderItemId: PropTypes.number,
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
  purchaseOrders: PropTypes.arrayOf(
    PropTypes.shape({
      poId: PropTypes.number,
      poNo: PropTypes.string,
    })
  ).isRequired,
  orderItems: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      poId: PropTypes.number,
      itemId: PropTypes.number,
      itemName: PropTypes.string,
    })
  ).isRequired,
  onBack: PropTypes.func.isRequired,
};

InvoiceDetails.defaultProps = {
  invoice: null,
};

export default InvoiceDetails;