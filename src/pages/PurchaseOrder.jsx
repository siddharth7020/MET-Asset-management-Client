import React, { useState, useEffect } from 'react';
import Table from '../components/Table';
import FormInput from '../components/FormInput';
import Details from '../components/Details';
import { getPurchaseOrders, createPurchaseOrder, updatePurchaseOrder, deletePurchaseOrder } from '../api/purchaseOrderService';
import axios from '../api/axiosInstance';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

function PurchaseOrder() {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [institutes, setInstitutes] = useState([]);
  const [financialYears, setFinancialYears] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [items, setItems] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    poId: '',
    poDate: '',
    poNo: '',
    instituteId: '',
    financialYearId: '',
    vendorId: '',
    document: '',
    requestedBy: '',
    remark: '',
    orderItems: [{ itemId: '', quantity: '', rate: '', amount: '', discount: '', totalAmount: '' }],
  });
  const [errors, setErrors] = useState({});
  const [editId, setEditId] = useState(null);
  const [expandedPoId, setExpandedPoId] = useState(null);
  const [selectedPoId, setSelectedPoId] = useState(null);
  const [currentLayout, setCurrentLayout] = useState(null);

  const MySwal = withReactContent(Swal);

  // Fetch data from APIs
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch purchase orders
        const poResponse = await getPurchaseOrders();
        setPurchaseOrders(poResponse.data);

        const institutesResponse = await axios.get('/institutes');
        if (Array.isArray(institutesResponse.data.data)) {
          setInstitutes(institutesResponse.data.data);
        } else {
          console.error('Expected institutes data to be an array, but got:', institutesResponse.data.data);
        }

        // Fetch financial years
        const fyResponse = await axios.get('/financialYears');
        if (Array.isArray(fyResponse.data.data)) {
          setFinancialYears(fyResponse.data.data);
        } else {
          console.error('Expected financial years data to be an array, but got:', fyResponse.data.data);
        }

        // Fetch vendors
        const vendorsResponse = await axios.get('/vendors');
        if (Array.isArray(vendorsResponse.data.data)) {
          setVendors(vendorsResponse.data.data);
        } else {
          console.error('Expected vendors data to be an array, but got:', vendorsResponse.data.data);
        }

        // Fetch items
        const itemsResponse = await axios.get('/items');
        if (Array.isArray(itemsResponse.data.items)) {
          setItems(itemsResponse.data.items);
        } else {
          console.error('Expected items data to be an array, but got:', itemsResponse.data.items);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        MySwal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to fetch data. Please try again.',
        });
      }
    };

    fetchData();
  }, []);

  // Table columns for PurchaseOrder
  const poColumns = [
    {
      key: 'poDate',
      label: 'Date',
      format: (value) => new Date(value).toLocaleDateString(),
    },
    { key: 'poNo', label: 'PO Number' },
    {
      key: 'instituteId',
      label: 'Institute',
      format: (value) => institutes?.find((inst) => inst.instituteId === value)?.instituteName || 'N/A',
    },
    {
      key: 'financialYearId',
      label: 'Financial Year',
      format: (value) => financialYears?.find((year) => year.financialYearId === value)?.year || 'N/A',
    },
    {
      key: 'vendorId',
      label: 'Vendor',
      format: (value) => vendors?.find((vend) => vend.vendorId === value)?.name || 'N/A',
    },
  ];

  // Table columns for OrderItem (in collapsible section)
  const orderItemColumns = [
    {
      key: 'itemId',
      label: 'Item',
      format: (value) => items?.find((item) => item.itemId === value)?.itemName || 'N/A',
    },
    { key: 'quantity', label: 'Quantity' },
    { key: 'rate', label: 'Rate' },
    { key: 'amount', label: 'Amount' },
    { key: 'totalAmount', label: 'Total Amount' },
  ];

  // Handle row click to show details
  const handleRowClick = (row) => {
    setSelectedPoId(row.poId);
    setCurrentLayout('details');
  };

  // Handle back to table view
  const handleBack = () => {
    setSelectedPoId(null);
    setCurrentLayout(null);
  };

  // Table actions
  const actions = [
    {
      label: 'Edit',
      onClick: (row) => {
        setIsEditMode(true);
        setEditId(row.poId);
        const poItems = row.orderItems.map((oi) => ({
          id: oi.id,
          itemId: oi.itemId,
          quantity: oi.quantity,
          rate: oi.rate,
          amount: oi.amount,
          discount: oi.discount,
          totalAmount: oi.totalAmount,
        }));
        setFormData({
          poId: row.poId,
          poDate: row.poDate.split('T')[0],
          poNo: row.poNo,
          instituteId: row.instituteId,
          financialYearId: row.financialYearId,
          vendorId: row.vendorId,
          document: row.document,
          requestedBy: row.requestedBy,
          remark: row.remark,
          orderItems: poItems.length > 0 ? poItems : [{ itemId: '', quantity: '', rate: '', amount: '', discount: '', totalAmount: '' }],
        });
        setIsFormVisible(true);
      },
      className: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      label: 'Delete',
      onClick: async (row) => {
        const result = await MySwal.fire({
          title: 'Are you sure?',
          text: `Do you want to delete purchase order ${row.poNo}?`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes, delete it!',
          cancelButtonText: 'No, cancel!',
          reverseButtons: true,
        });

        if (result.isConfirmed) {
          try {
            await deletePurchaseOrder(row.poId);
            setPurchaseOrders((prev) => prev.filter((po) => po.poId !== row.poId));
            resetForm();
            MySwal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'Purchase order has been deleted successfully.',
            });
          } catch (error) {
            console.error('Error deleting purchase order:', error);
            MySwal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Failed to delete purchase order. Please try again.',
            });
          }
        }
      },
      className: 'bg-red-500 hover:bg-red-600',
    },
    {
      label: 'View Items',
      onClick: (row) => {
        setExpandedPoId(expandedPoId === row.poId ? null : row.poId);
      },
      className: 'bg-green-500 hover:bg-green-600',
    },
  ];

  const handleOrderItemChange = (index, e) => {
    const { name, value } = e.target;
    const updatedOrderItems = [...formData.orderItems];
    updatedOrderItems[index] = { ...updatedOrderItems[index], [name]: value };

    // Calculate amount and totalAmount
    const quantity = parseFloat(updatedOrderItems[index].quantity) || 0;
    const rate = parseFloat(updatedOrderItems[index].rate) || 0;
    const discount = parseFloat(updatedOrderItems[index].discount) || 0;
    const amount = quantity * rate;
    const totalAmount = amount - discount;

    updatedOrderItems[index].amount = amount.toFixed(2);
    updatedOrderItems[index].totalAmount = totalAmount.toFixed(2);

    setFormData((prev) => ({ ...prev, orderItems: updatedOrderItems }));
    setErrors((prev) => ({ ...prev, [`orderItems[${index}].${name}`]: '' }));
  };

  const addOrderItem = () => {
    setFormData((prev) => ({
      ...prev,
      orderItems: [...prev.orderItems, { itemId: '', quantity: '', rate: '', amount: '', discount: '', totalAmount: '' }],
    }));
  };

  const removeOrderItem = (index) => {
    if (formData.orderItems.length === 1) {
      MySwal.fire({
        icon: 'warning',
        title: 'Cannot Remove',
        text: 'At least one order item is required.',
      });
      return;
    }
    setFormData((prev) => ({
      ...prev,
      orderItems: prev.orderItems.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.poDate) newErrors.poDate = 'PO date is required';
    if (!formData.instituteId) newErrors.instituteId = 'Institute is required';
    if (!formData.financialYearId) newErrors.financialYearId = 'Financial year is required';
    if (!formData.vendorId) newErrors.vendorId = 'Vendor is required';
    if (!formData.requestedBy) newErrors.requestedBy = 'Requested by is required';

    formData.orderItems.forEach((oi, index) => {
      if (!oi.itemId) newErrors[`orderItems[${index}].itemId`] = 'Item is required';
      if (!oi.quantity || oi.quantity < 0) newErrors[`orderItems[${index}].quantity`] = 'Quantity must be non-negative';
      if (!oi.rate || oi.rate < 0) newErrors[`orderItems[${index}].rate`] = 'Rate must be non-negative';
      if (oi.discount < 0) newErrors[`orderItems[${index}].discount`] = 'Discount must be non-negative';
    });

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      MySwal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please fill all required fields correctly.',
      });
      return;
    }

    const payload = {
      ...formData,
      instituteId: Number(formData.instituteId),
      financialYearId: Number(formData.financialYearId),
      vendorId: Number(formData.vendorId),
      orderItems: formData.orderItems.map((oi) => ({
        itemId: Number(oi.itemId),
        quantity: Number(oi.quantity),
        rate: Number(oi.rate),
        amount: Number(oi.amount),
        discount: Number(oi.discount),
        totalAmount: Number(oi.totalAmount),
      })),
    };

    try {
      if (isEditMode) {
        // Update PurchaseOrder
        await updatePurchaseOrder(editId, payload);
        setPurchaseOrders((prev) =>
          prev.map((po) => (po.poId === editId ? { ...payload, poId: editId } : po))
        );
        MySwal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Purchase order updated successfully!',
        });
      } else {
        // Add new PurchaseOrder
        const response = await createPurchaseOrder(payload);
        setPurchaseOrders((prev) => [...prev, response.data]);
        MySwal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Purchase order created successfully!',
        });
      }
      resetForm();
      setIsFormVisible(false);
    } catch (error) {
      console.error('Error saving purchase order:', error);
      MySwal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to save purchase order. Please try again.',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      poId: '',
      poDate: '',
      poNo: '',
      instituteId: '',
      financialYearId: '',
      vendorId: '',
      document: '',
      requestedBy: '',
      remark: '',
      orderItems: [{ itemId: '', quantity: '', rate: '', amount: '', discount: '', totalAmount: '' }],
    });
    setErrors({});
    setIsEditMode(false);
    setEditId(null);
  };

  // Get selected purchase order data
  const selectedPo = purchaseOrders.find((po) => po.poId === selectedPoId);
  const selectedOrderItems = selectedPo?.orderItems || [];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {selectedPoId ? (
        <Details
          purchaseOrder={selectedPo}
          orderItems={selectedOrderItems}
          institutesData={institutes}
          financialYears={financialYears}
          vendors={vendors}
          items={items}
          onBack={handleBack}
        />
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-brand-secondary mb-4">Purchase Orders</h2>
            <div>
              <button
                onClick={() => setIsFormVisible(!isFormVisible)}
                className="bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-red-600"
              >
                {isFormVisible ? 'Hide Form' : 'Add Purchase Order'}
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-6 mb-6">
            {isFormVisible && (
              <div>
                <h3 className="text-base sm:text-lg font-medium text-brand-secondary mb-4">
                  {isEditMode ? 'Edit Purchase Order' : 'Add Purchase Order'}
                </h3>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <FormInput
                    label="PO Date"
                    type="date"
                    name="poDate"
                    value={formData.poDate}
                    onChange={(e) => setFormData({ ...formData, poDate: e.target.value })}
                    error={errors.poDate}
                    required
                    className="w-full text-xs sm:text-sm"
                  />
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">Institute</label>
                    <select
                      name="instituteId"
                      value={formData.instituteId}
                      onChange={(e) => setFormData({ ...formData, instituteId: e.target.value })}
                      className="block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-brand-primary focus:border-brand-primary text-xs sm:text-sm"
                      required
                    >
                      <option value="">Select Institute</option>
                      {institutes.map((inst) => (
                        <option key={inst.instituteId} value={inst.instituteId}>
                          {inst.instituteName}
                        </option>
                      ))}
                    </select>
                    {errors.instituteId && <p className="mt-1 text-xs text-red-600">{errors.instituteId}</p>}
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">Financial Year</label>
                    <select
                      name="financialYearId"
                      value={formData.financialYearId}
                      onChange={(e) => setFormData({ ...formData, financialYearId: e.target.value })}
                      className="block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-brand-primary focus:border-brand-primary text-xs sm:text-sm"
                      required
                    >
                      <option value="">Select Financial Year</option>
                      {financialYears.map((fy) => (
                        <option key={fy.financialYearId} value={fy.financialYearId}>
                          {fy.year}
                        </option>
                      ))}
                    </select>
                    {errors.financialYearId && <p className="mt-1 text-xs text-red-600">{errors.financialYearId}</p>}
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">Vendor</label>
                    <select
                      name="vendorId"
                      value={formData.vendorId}
                      onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}
                      className="block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-brand-primary focus:border-brand-primary text-xs sm:text-sm"
                      required
                    >
                      <option value="">Select Vendor</option>
                      {vendors.map((v) => (
                        <option key={v.vendorId} value={v.vendorId}>
                          {v.name}
                        </option>
                      ))}
                    </select>
                    {errors.vendorId && <p className="mt-1 text-xs text-red-600">{errors.vendorId}</p>}
                  </div>
                  <FormInput
                    label="Document"
                    type="file"
                    name="document"
                    onChange={(e) => setFormData({ ...formData, document: e.target.files[0] })}
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                    error={errors.document}
                    required={false}
                    className="w-full text-xs sm:text-sm"
                  />
                  <FormInput
                    label="Requested By"
                    type="text"
                    name="requestedBy"
                    value={formData.requestedBy}
                    onChange={(e) => setFormData({ ...formData, requestedBy: e.target.value })}
                    error={errors.requestedBy}
                    required
                    className="w-full text-xs sm:text-sm"
                  />
                  <FormInput
                    label="Remark"
                    type="text"
                    name="remark"
                    value={formData.remark}
                    onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                    error={errors.remark}
                    required={false}
                    className="w-full text-xs sm:text-sm"
                  />
                  <div className="col-span-1 sm:col-span-2 lg:col-span-3">
                    <h4 className="text-sm sm:text-md font-medium text-brand-secondary mb-2">Order Items</h4>
                    {formData.orderItems.map((oi, index) => (
                      <div key={index} className="flex flex-col gap-4 mb-4 p-4 border rounded-md">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700">Item</label>
                            <select
                              name="itemId"
                              value={oi.itemId}
                              onChange={(e) => handleOrderItemChange(index, e)}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-brand-primary focus:border-brand-primary text-xs sm:text-sm"
                              required
                            >
                              <option value="">Select Item</option>
                              {items.map((item) => (
                                <option key={item.itemId} value={item.itemId}>
                                  {item.itemName}
                                </option>
                              ))}
                            </select>
                            {errors[`orderItems[${index}].itemId`] && (
                              <p className="mt-1 text-xs text-red-600">{errors[`orderItems[${index}].itemId`]}</p>
                            )}
                          </div>
                          <FormInput
                            label="Quantity"
                            type="number"
                            name="quantity"
                            value={oi.quantity}
                            onChange={(e) => handleOrderItemChange(index, e)}
                            error={errors[`orderItems[${index}].quantity`]}
                            required
                            className="w-full text-xs sm:text-sm"
                          />
                          <FormInput
                            label="Rate"
                            type="number"
                            name="rate"
                            value={oi.rate}
                            onChange={(e) => handleOrderItemChange(index, e)}
                            error={errors[`orderItems[${index}].rate`]}
                            required
                            className="w-full text-xs sm:text-sm"
                          />
                          <FormInput
                            label="Amount"
                            type="text"
                            name="amount"
                            value={oi.amount}
                            disabled
                            required={false}
                            className="w-full text-xs sm:text-sm"
                          />
                          <FormInput
                            label="Discount Amount"
                            type="number"
                            name="discount"
                            value={oi.discount}
                            onChange={(e) => handleOrderItemChange(index, e)}
                            error={errors[`orderItems[${index}].discount`]}
                            required={false}
                            className="w-full text-xs sm:text-sm"
                          />
                          <FormInput
                            label="Total Amount"
                            type="text"
                            name="totalAmount"
                            value={oi.totalAmount}
                            disabled
                            required={false}
                            className="w-full text-xs sm:text-sm"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeOrderItem(index)}
                          className="text-red-600 hover:text-red-800 text-xs sm:text-sm mt-2"
                        >
                          Remove Item
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addOrderItem}
                      className="w-full sm:w-auto bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 text-xs sm:text-sm"
                    >
                      Add Order Item
                    </button>
                  </div>
                  <div className="col-span-1 sm:col-span-2 lg:col-span-3 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                    <button
                      type="submit"
                      className="w-full sm:w-auto bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-red-600 text-xs sm:text-sm"
                    >
                      {isEditMode ? 'Update' : 'Add'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        resetForm();
                        setIsFormVisible(false);
                      }}
                      className="w-full sm:w-auto px-4 py-2 text-gray-600 rounded-md hover:bg-gray-100 text-xs sm:text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
            <div>
              {currentLayout ? (
                <Details />
              ) : (
                <Table
                  columns={poColumns}
                  data={purchaseOrders}
                  actions={actions}
                  onRowClick={handleRowClick}
                  expandable={{
                    expandedRowRender: (row) => (
                      <div className="p-4 bg-gray-50">
                        <h4 className="text-md font-medium text-brand-secondary mb-2">Order Items</h4>
                        <Table columns={orderItemColumns} data={row.orderItems} actions={[]} />
                      </div>
                    ),
                    rowExpandable: (row) => row.orderItems && row.orderItems.length > 0,
                    expandedRowKeys: expandedPoId ? [expandedPoId] : [],
                  }}
                />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default PurchaseOrder;