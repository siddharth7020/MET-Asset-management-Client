import React, { useState, useEffect } from 'react';
import Table from '../components/Table';
import { getAllStockStorage, getStockStorageByItemId } from '../api/stockService';
import { getGrns, getGrnById } from '../api/grnService';
import { getQuickGRNs, getQuickGRNById } from '../api/quickGRNServices';
import { getPurchaseOrders } from '../api/purchaseOrderService';
import axios from '../api/axiosInstance';
import Swal from 'sweetalert2';

function Stock() {
  const [stockEntries, setStockEntries] = useState([]);
  const [items, setItems] = useState([]);
  const [grns, setGrns] = useState([]);
  const [quickGRNs, setQuickGRNs] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [filteredStock, setFilteredStock] = useState(null);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [formData, setFormData] = useState({ itemId: '' });
  const [errors, setErrors] = useState({});

  // Fetch all necessary data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch stock entries
        const stockResponse = await getAllStockStorage();
        setStockEntries(stockResponse.data);

        // Fetch items
        const itemsResponse = await axios.get('/items');
        if (Array.isArray(itemsResponse.data.items)) {
          setItems(itemsResponse.data.items);
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Data Error',
            text: 'Failed to load items data.',
          });
        }

        // Fetch GRNs
        const grnResponse = await getGrns();
        setGrns(grnResponse.data);

        // Fetch Quick GRNs
        const quickGRNResponse = await getQuickGRNs();
        setQuickGRNs(quickGRNResponse.data);

        // Fetch Purchase Orders
        const poResponse = await getPurchaseOrders();
        setPurchaseOrders(poResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        Swal.fire({
          icon: 'error',
          title: 'Fetch Error',
          text: 'Failed to load data. Please try again.',
        });
      }
    };
    fetchData();
  }, []);

  // Table columns for StockStorage
  const stockColumns = [
    {
      key: 'itemId',
      label: 'Item',
      format: (value) => items.find((item) => item.itemId === value)?.itemName || 'N/A',
    },
    {
      key: 'poId',
      label: 'Purchase Order',
      format: (value) => purchaseOrders.find((po) => po.poId === value)?.poNo || 'N/A',
    },
    {
      key: 'grnId',
      label: 'GRN',
      format: (value) => grns.find((grn) => grn.id === value)?.grnNo || 'N/A',
    },
    {
      key: 'qGRNId',
      label: 'Quick GRN',
      format: (value) => quickGRNs.find((qgrn) => qgrn.qGRNId === value)?.qGRNNo || 'N/A',
    },
    { key: 'quantity', label: 'Quantity' },
    { key: 'remark', label: 'Remark' },
    {
      key: 'createdAt',
      label: 'Created At',
      format: (value) => new Date(value).toLocaleDateString(),
    },
  ];

  // Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  // Validate filter form
  const validateForm = () => {
    const newErrors = {};
    if (!formData.itemId || Number(formData.itemId) <= 0 || !items.some((item) => item.itemId === Number(formData.itemId))) {
      newErrors.itemId = 'A valid item is required';
    }
    return newErrors;
  };

  // Handle filter submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please select a valid item.',
      });
      return;
    }

    try {
      const response = await getStockStorageByItemId(formData.itemId);
      setFilteredStock(response.data);
      setIsFilterVisible(false);
    } catch (error) {
      console.error('Error fetching stock by itemId:', error);
      Swal.fire({
        icon: 'error',
        title: 'Fetch Error',
        text: 'Failed to load stock data for the selected item.',
      });
    }
  };

  // Handle cancel filter
  const handleCancel = () => {
    setFormData({ itemId: '' });
    setErrors({});
    setIsFilterVisible(false);
    setFilteredStock(null);
  };

  // Reset filtered view to show all stock
  const handleBack = () => {
    setFilteredStock(null);
    setFormData({ itemId: '' });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {filteredStock ? (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-brand-secondary">
              Stock Details for {filteredStock.itemName}
            </h2>
            <button
              onClick={handleBack}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 text-sm"
            >
              Back to All Stock
            </button>
          </div>
          <div className="mb-4">
            <p><strong>Item ID:</strong> {filteredStock.itemId}</p>
            <p><strong>Total Quantity:</strong> {filteredStock.totalItemCount}</p>
            <p><strong>GRN Count:</strong> {filteredStock.grnCount}</p>
          </div>
          <Table
            columns={[
              { key: 'grnId', label: 'GRN ID' },
              { key: 'grnNo', label: 'GRN Number' },
              {
                key: 'grnDate',
                label: 'GRN Date',
                format: (value) => new Date(value).toLocaleDateString(),
              },
              { key: 'poId', label: 'PO ID' },
              { key: 'poNo', label: 'PO Number' },
              { key: 'totalQuantity', label: 'Quantity' },
            ]}
            data={filteredStock.grnDetails}
          />
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-brand-secondary mb-4">Stock Storage</h2>
            <div>
              <button
                onClick={() => setIsFilterVisible(!isFilterVisible)}
                className="bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-red-600 text-sm"
              >
                {isFilterVisible ? 'Hide Filter' : 'Filter by Item'}
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-6">
            {isFilterVisible && (
              <div>
                <h3 className="text-lg font-medium text-brand-secondary mb-4">Filter Stock by Item</h3>
                <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Item</label>
                    <select
                      name="itemId"
                      value={formData.itemId}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-brand-primary focus:border-brand-primary text-sm"
                      required
                    >
                      <option value="">Select Item</option>
                      {items.map((item) => (
                        <option key={item.itemId} value={item.itemId}>
                          {item.itemName}
                        </option>
                      ))}
                    </select>
                    {errors.itemId && (
                      <p className="mt-1 text-sm text-red-600">{errors.itemId}</p>
                    )}
                  </div>
                  <div className="col-span-3 flex space-x-4">
                    <button
                      type="submit"
                      className="bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-red-600 text-sm"
                    >
                      Apply Filter
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-4 py-2 text-gray-600 rounded-md hover:bg-gray-100 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
            <div>
              <Table
                columns={stockColumns}
                data={stockEntries}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Stock;