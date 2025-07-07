import React from 'react';
import PropTypes from 'prop-types';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const DistributionDetails = ({ distribution, distributionItems, items, financialYears, institutes, onBack, units }) => {
  if (!distribution) {
    return <div className="text-center p-6">No Distribution selected</div>;
  }

  console.log('Distribution Details:', distribution);

  const financialYear = financialYears.find((year) => year.financialYearId === distribution.financialYearId);
  const institute = institutes.find((inst) => inst.instituteId === distribution.instituteId);

  const handleDocumentDownload = (documentPath) => {
    try {
      if (documentPath) {
        // Ensure the path doesn't start with a slash to avoid double slashes
        const cleanPath = documentPath.replace(/^\/+/, '');
        // Encode the file path to handle special characters
        const encodedPath = encodeURI(cleanPath);
        const documentUrl = `http://localhost:5000/${encodedPath}`;
        console.log('Downloading document from:', documentUrl); // Debugging
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-brand-secondary">Distribution Details</h2>
        <button
          onClick={onBack}
          className="bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-brand-primary-hover text-xs sm:text-sm"
        >
          Back to List
        </button>
      </div>

      <div className="p-6 bg-gray-50 rounded-md shadow mb-6">
        <h3 className="text-sm sm:text-base font-medium text-brand-secondary mb-4">Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-semibold text-gray-700">Distribution No</span>
            <span className="text-xs sm:text-sm text-gray-900">{distribution.distributionNo}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-semibold text-gray-700">Financial Year</span>
            <span className="text-xs sm:text-sm text-gray-900">
              {financialYear?.year || 'N/A'}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-semibold text-gray-700">Institute</span>
            <span className="text-xs sm:text-sm text-gray-900">
              {institute?.instituteName || 'N/A'}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-semibold text-gray-700">Employee Name</span>
            <span className="text-xs sm:text-sm text-gray-900">{distribution.employeeName}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-semibold text-gray-700">Floor</span>
            <span className="text-xs sm:text-sm text-gray-900">{distribution.floor || 'N/A'}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-semibold text-gray-700">Classroom</span>
            <span className="text-xs sm:text-sm text-gray-900">{distribution.rooms || 'N/A'}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-semibold text-gray-700">Documents</span>
            {distribution.document && distribution.document.length > 0 ? (
              <div className="flex flex-col gap-2">
                {distribution.document.map((doc, index) => (
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
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-semibold text-gray-700">Remark</span>
            <span className="text-xs sm:text-sm text-gray-900">{distribution.remark || 'N/A'}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-semibold text-gray-700">Date</span>
            <span className="text-xs sm:text-sm text-gray-900">{new Date(distribution.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm sm:text-base font-medium text-brand-secondary mb-4">Items</h3>
        <div className="sm:hidden space-y-4">
          {distributionItems.map((item) => (
            <div key={item.id} className="p-4 border rounded-md bg-gray-50">
              <p className="text-xs">
                <strong>Item ID:</strong> {item.id}
              </p>
              <p className="text-xs">
                <strong>Item Name:</strong> {items.find((i) => i.id === item.itemId)?.itemName || 'N/A'}
              </p>
              <p className="text-xs">
                <strong>Issue Quantity:</strong> {item.issueQuantity}
              </p>
            </div>
          ))}
        </div>
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-900">
            <thead className="text-xs uppercase bg-gray-200">
              <tr>
                <th scope="col" className="px-6 py-3">Item Name</th>
                <th scope="col" className="px-6 py-3">Unit</th>
                <th scope="col" className="px-6 py-3">Issue Quantity</th>
              </tr>
            </thead>
            <tbody>
              {distributionItems.map((item) => (
                <tr key={item.id} className="bg-white border-b">
                  <td className="px-6 py-4">{items.find((i) => i.itemId === item.itemId)?.itemName || 'N/A'}</td>
                  <td className="px-6 py-4">
                    {units.find((u) => u.unitId === item.unitId)?.uniteCode || 'N/A'}
                  </td>
                  <td className="px-6 py-4">{item.issueQuantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

DistributionDetails.propTypes = {
  distribution: PropTypes.shape({
    id: PropTypes.number,
    financialYearId: PropTypes.number,
    instituteId: PropTypes.number,
    employeeName: PropTypes.string,
    location: PropTypes.string,
    document: PropTypes.arrayOf(PropTypes.string),
    remark: PropTypes.string,
    createdAt: PropTypes.string,
    updatedAt: PropTypes.string,
  }),
  distributionItems: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      distributionId: PropTypes.number,
      itemId: PropTypes.number,
      unitId: PropTypes.number,
      issueQuantity: PropTypes.number,
      createdAt: PropTypes.string,
      updatedAt: PropTypes.string,
    })
  ).isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      itemName: PropTypes.string,
    })
  ).isRequired,
  financialYears: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
    })
  ).isRequired,
  institutes: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
    })
  ).isRequired,
  onBack: PropTypes.func.isRequired,
  units: PropTypes.arrayOf(
    PropTypes.shape({
      unitId: PropTypes.number,
      uniteCode: PropTypes.string,
    })
  ).isRequired,
};

DistributionDetails.defaultProps = {
  distribution: null,
};

export default DistributionDetails;