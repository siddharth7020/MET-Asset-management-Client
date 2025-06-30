import React, { useState, useEffect } from 'react';
import Table from '../components/Table';
import { getAllStockStorage, getStockStorageByItemId } from '../api/stockService';
import { getGrns } from '../api/grnService';
import { getQuickGRNs } from '../api/quickGRNServices';
import { getPurchaseOrders } from '../api/purchaseOrderService';
import axios from '../api/axiosInstance';
import Swal from 'sweetalert2';

function Stock() {
  const [stockEntries, setStockEntries] = useState([]);
  const [items, setItems] = useState([]);
  const [units, setUnits] = useState([]);
  const [grns, setGrns] = useState([]);
  const [quickGRNs, setQuickGRNs] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [filteredStock, setFilteredStock] = useState(null);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [formData, setFormData] = useState({ itemId: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all necessary data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Fetch stock entries
        const stockResponse = await getAllStockStorage();
        setStockEntries(stockResponse.data);
        console.log('Stock entries fetched successfully:', stockResponse.data);

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
          setItems([]);
        }

        // Fetch units
        const unitsResponse = await axios.get('/units');
        if (Array.isArray(unitsResponse.data.data)) {
          setUnits(unitsResponse.data.data);
          console.log('Units fetched successfully:', unitsResponse.data.data);
        } else {
          console.error('Expected units data to be an array, but got:', unitsResponse.data.data);
          setUnits([]);
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
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Table columns for StockStorage
  const stockColumns = [
    {
      key: 'itemId',
      label: 'Item',
      format: (value) => items.find((item) => item.itemId === Number(value))?.itemName || '-',
    },
    {
      key: 'poId',
      label: 'PO',
      format: (value) => purchaseOrders.find((po) => po.poId === Number(value))?.poNo || '-',
    },
    {
      key: 'grnId',
      label: 'GRN',
      format: (value) => grns.find((grn) => grn.id === Number(value))?.grnNo || '-',
    },
    {
      key: 'qGRNId',
      label: 'Quick GRN',
      format: (value) => quickGRNs.find((qgrn) => qgrn.qGRNId === Number(value))?.qGRNNo || '-',
    },
    { key: 'storeCode', label: 'Store Code' },
    {
      key: 'unitId',
      label: 'Unit',
      format: (value) => units.find((unit) => unit.unitId === Number(value))?.uniteCode || '-',
    },
    { key: 'quantity', label: 'Quantity' },

  ];

  // Table columns for filtered stock details
  const filteredStockColumns = [
    {
      key: 'itemId',
      label: 'Item',
      format: (value) => items.find((item) => item.itemId === Number(value))?.itemName || '-',
    },
    {
      key: 'poId',
      label: 'PO Number',
      format: (value) => purchaseOrders.find((po) => po.poId === Number(value))?.poNo || '-',
    },
    {
      key: 'grnId',
      label: 'GRN Number',
      format: (value) => grns.find((grn) => grn.id === Number(value))?.grnNo || '-',
    },
    {
      key: 'qGRNId',
      label: 'Quick GRN Number',
      format: (value) => quickGRNs.find((qgrn) => qgrn.qGRNId === Number(value))?.qGRNNo || '-',
    },
    { key: 'storeCode', label: 'Store Code' },
    {
      key: 'unitId',
      label: 'Unit',
      format: (value) => units.find((unit) => unit.unitId === Number(value))?.uniteCode || '-',
    },
    { key: 'quantity', label: 'Quantity' },
    { key: 'totalQuantity', label: 'Total Quantity' },
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
      newErrors.itemId = 'Please select a valid item';
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
      const response = await getStockStorageByItemId(Number(formData.itemId));
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
  const handleCancel = async () => {
    const hasChanges = formData.itemId !== '';
    if (hasChanges) {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: 'You have unsaved changes. Do you want to cancel?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, cancel',
        cancelButtonText: 'No, keep editing',
        reverseButtons: true,
      });

      if (!result.isConfirmed) {
        return;
      }
    }

    setFormData({ itemId: '' });
    setErrors({});
    setIsFilterVisible(false);
  };

  // Reset filtered view to show all stock
  const handleBack = () => {
    setFilteredStock(null);
    setFormData({ itemId: '' });
  };

  // Get item name for filtered stock
  const getItemName = (itemId) => {
    const item = items.find((i) => i.itemId === Number(itemId));
    return item ? item.itemName : 'N/A';
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {isLoading ? (
        <div>Loading...</div>
      ) : filteredStock ? (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-brand-secondary">
              Stock Details for {getItemName(filteredStock.itemId)}
            </h2>
            <button
              onClick={handleBack}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 text-sm"
            >
              Back to All Stock
            </button>
          </div>
          <div className="flex flex-col gap-4 mb-6 bg-white shadow-md p-6 rounded-xl border border-gray-200 transition-transform duration-200 hover:scale-[1.01]">
            <p className="text-gray-700 text-base">
              <strong className="text-gray-900">Item ID:</strong> {getItemName(filteredStock.itemId)}
            </p>
            <p className="text-gray-700 text-base">
              <strong className="text-gray-900">Total Quantity:</strong> {filteredStock.totalItemCount}
            </p>
            <p className="text-gray-700 text-base">
              <strong className="text-gray-900">GRN Count:</strong> {filteredStock.grnCount}
            </p>
          </div>

          <Table
            columns={filteredStockColumns}
            data={filteredStock.grnDetails}
          />
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-brand-secondary">Stock Storage</h2>
            <div>
              <button
                onClick={() => setIsFilterVisible(!isFilterVisible)}
                className="bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-brand-primary-dark text-sm"
              >
                {isFilterVisible ? 'Hide Filter' : 'Filter by Item'}
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-6">
            {isFilterVisible && (
              <div>
                <h3 className="text-lg font-medium text-brand-secondary mb-4">Filter Stock by Item</h3>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <div className="col-span-1 md:col-span-3 flex space-x-4">
                    <button
                      type="submit"
                      className="bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-brand-primary-dark text-sm"
                    >
                      Apply Filter
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100 text-sm"
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