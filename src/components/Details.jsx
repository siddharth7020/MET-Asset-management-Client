import React from 'react';
import PropTypes from 'prop-types';
import Table from './Table';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const Details = ({ purchaseOrder, orderItems, institutesData, financialYears, vendors, items, units, onBack }) => {
  if (!purchaseOrder) {
    return <div className="text-center p-6 text-gray-700">No purchase order selected</div>;
  }

  const institute = institutesData.find((inst) => inst.instituteId === purchaseOrder.instituteId);
  const financialYear = financialYears.find((year) => year.financialYearId === purchaseOrder.financialYearId);
  const vendor = vendors.find((vend) => vend.vendorId === purchaseOrder.vendorId);

  console.log(units);

  const handleDocumentDownload = () => {
    try {
      if (purchaseOrder.document) {
        // Construct full URL using the backend base URL
        const documentUrl = `http://localhost:5000/${purchaseOrder.document}`;
        window.open(documentUrl, '_blank');
      } else {
        MySwal.fire({
          icon: 'warning',
          title: 'No Document',
          text: 'No document is available for this purchase order.',
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

  // Table columns for Order Items (consistent with PurchaseOrder.js)
  const orderItemColumns = [
    {
      key: 'itemId',
      label: 'Item',
      format: (value) => items?.find((item) => item.itemId === value)?.itemName || 'N/A',
    },
    {
      key: 'unitId',
      label: 'Unit',
      format: (value) => units?.find((unit) => unit.unitId === value)?.uniteName || 'N/A',
    },
    { key: 'quantity', label: 'Quantity' },
    { key: 'rate', label: 'Rate' },
    { key: 'amount', label: 'Amount' },
    { key: 'discount', label: 'Discount Amount' },
    { key: 'totalAmount', label: 'Total Amount' },
  ];

  return (
    <div className="p-6">
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
            <span className="text-xs sm:text-sm text-gray-900">{purchaseOrder.poNo || 'N/A'}</span>
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
            <span className="text-xs sm:text-sm text-gray-900">{purchaseOrder.requestedBy || 'N/A'}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-semibold text-gray-700">PO Date</span>
            <span className="text-xs sm:text-sm text-gray-900">
              {purchaseOrder.poDate ? new Date(purchaseOrder.poDate).toLocaleDateString() : 'N/A'}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-semibold text-gray-700">Document</span>
            {purchaseOrder.document ? (
              <button
                onClick={handleDocumentDownload}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-xs sm:text-sm w-48"
              >
                View Document
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
        <Table
          columns={orderItemColumns}
          data={orderItems}
          expandable={null}
        />
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
      unitId: PropTypes.number,
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
  units: PropTypes.arrayOf(
    PropTypes.shape({
      unitId: PropTypes.number,
      uniteName: PropTypes.string,
    })
  ).isRequired,
  onBack: PropTypes.func.isRequired,
};

Details.defaultProps = {
  purchaseOrder: null,
};

export default Details;