import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Table from '../components/Table';
import FormInput from '../components/FormInput';
import GrnDetails from './GRNDetail';
import { getPurchaseOrders, getPurchaseOrder } from '../api/purchaseOrderService';
import { getGrns, getGrnById, createGrn, updateGrn, deleteGrn } from '../api/grnService';

function GRN() {
  const [grns, setGrns] = useState([]);
  const [grnItems, setGrnItems] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [orderItem, setOrderItem] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    poId: '',
    grnNo: '',
    grnDate: '',
    challanNo: '',
    challanDate: '',
    document: '',
    remark: '',
    grnItems: [{ orderItemId: '', receivedQuantity: '' }],
  });
  const [errors, setErrors] = useState({});
  const [editId, setEditId] = useState(null);
  const [expandedGrnId, setExpandedGrnId] = useState(null);
  const [selectedGrnId, setSelectedGrnId] = useState(null);

  // Fetch purchase orders and GRNs on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const poResponse = await getPurchaseOrders();
        setPurchaseOrders(poResponse.data);

        const grnResponse = await getGrns();
        const grnsData = grnResponse.data;
        const grnItemsData = grnsData.flatMap(grn => grn.grnItems || []);

        setGrns(grnsData);
        setGrnItems(grnItemsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  // Fetch order items and pre-populate grnItems when poId changes
  useEffect(() => {
    if (formData.poId && !isEditMode) {
      const fetchOrderItems = async () => {
        try {
          const poResponse = await getPurchaseOrder(formData.poId);
          const items = poResponse.data.orderItems || [];
          console.log('Fetched order items:', items);
          setOrderItem(items);
          console.log('Fetched order items:', orderItem);
          
          
          
          // Pre-populate grnItems with order items
          setFormData(prev => ({
            ...prev,
            grnItems: items.map(item => ({
              orderItemId: item.id,
              receivedQuantity: item.quantity || '',
              rejectedQuantity: '',
            })),
          }));
        } catch (error) {
          console.error('Error fetching order items:', error);
        }
      };
      fetchOrderItems();
    } else {
      setOrderItem([]);
      if (!isEditMode) {
        setFormData(prev => ({
          ...prev,
          grnItems: [{ orderItemId: '', receivedQuantity: '' }],
        }));
      }
    }
  }, [formData.poId, isEditMode]);

  // Handle row click to show details
  const handleRowClick = (row) => {
    setSelectedGrnId(row.id);
  };

  // Handle back to table view
  const handleBack = () => {
    setSelectedGrnId(null);
  };

  // Table columns for GRN
  const grnColumns = [
    { key: 'id', label: 'ID' },
    {
      key: 'poId',
      label: 'PO Number',
      format: (value) => purchaseOrders.find((po) => po.poId === value)?.poNo || 'N/A',
    },
    { key: 'grnNo', label: 'GRN Number' },
    {
      key: 'grnDate',
      label: 'GRN Date',
      format: (value) => new Date(value).toLocaleDateString(),
    },
    { key: 'challanNo', label: 'Challan Number' },
    {
      key: 'challanDate',
      label: 'Challan Date',
      format: (value) => new Date(value).toLocaleDateString(),
    },
    { key: 'remark', label: 'Remark' },
  ];

  // Table columns for GRNItem
  const grnItemColumns = [
    { key: 'id', label: 'ID' },
    {
      key: 'orderItemId',
      label: 'Item',
      format: (value) => orderItem.find((oi) => oi.id === value)?.itemName || 'N/A',
    },
    { key: 'receivedQuantity', label: 'Received Quantity' },
    { key: 'rejectedQuantity', label: 'Rejected Quantity' },
  ];

  // Table actions
  const actions = [
    {
      label: 'Edit',
      onClick: async (row) => {
        try {
          const grnResponse = await getGrnById(row.id);
          const grn = grnResponse.data;
          setIsEditMode(true);
          setEditId(row.id);
          setFormData({
            poId: grn.poId,
            grnNo: grn.grnNo,
            grnDate: grn.grnDate.split('T')[0],
            challanNo: grn.challanNo,
            challanDate: grn.challanDate.split('T')[0],
            document: grn.document || '',
            remark: grn.remark || '',
            grnItems: grn.grnItems.map(gi => ({
              id: gi.id,
              orderItemId: gi.orderItemId,
              receivedQuantity: gi.receivedQuantity,
              rejectedQuantity: gi.rejectedQuantity || '',
            })) || [{ orderItemId: '', receivedQuantity: '' }],
          });
          setIsFormVisible(true);
        } catch (error) {
          console.error('Error fetching GRN:', error);
        }
      },
      className: 'bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-sm',
    },
    {
      label: 'Delete',
      onClick: async (row) => {
        if (window.confirm(`Delete GRN ${row.grnNo}?`)) {
          try {
            await deleteGrn(row.poId, row.id);
            setGrns((prev) => prev.filter((grn) => grn.id !== row.id));
            setGrnItems((prev) => prev.filter((gi) => gi.grnId !== row.id));
            resetForm();
          } catch (error) {
            console.error('Error deleting GRN:', error);
          }
        }
      },
      className: 'bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm',
    },
    {
      label: 'View Items',
      onClick: (row) => {
        setExpandedGrnId(expandedGrnId === row.id ? null : row.id);
      },
      className: 'bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-sm',
    },
  ];

  // Form handling
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleGrnItemChange = (index, e) => {
    const { name, value } = e.target;
    const updatedGrnItems = [...formData.grnItems];
    updatedGrnItems[index] = { ...updatedGrnItems[index], [name]: value };
    setFormData((prev) => ({ ...prev, grnItems: updatedGrnItems }));
    setErrors((prev) => ({ ...prev, [`grnItems[${index}].${name}`]: '' }));
  };

  const resetForm = () => {
    setFormData({
      poId: '',
      grnNo: '',
      grnDate: '',
      challanNo: '',
      challanDate: '',
      document: '',
      remark: '',
      grnItems: [{ orderItemId: '', receivedQuantity: '' }],
    });
    setErrors({});
    setIsEditMode(false);
    setEditId(null);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.poId) newErrors.poId = 'Purchase Order is required';
    if (!formData.grnNo) newErrors.grnNo = 'GRN number is required';
    else if (!isEditMode && grns.some((grn) => grn.grnNo === formData.grnNo)) {
      newErrors.grnNo = 'GRN number must be unique';
    }
    if (!formData.grnDate) newErrors.grnDate = 'GRN date is required';
    if (!formData.challanNo) newErrors.challanNo = 'Challan number is required';
    if (!formData.challanDate) newErrors.challanDate = 'Challan date is required';

    formData.grnItems.forEach((gi, index) => {
      if (!gi.orderItemId) newErrors[`grnItems[${index}].orderItemId`] = 'Order item is required';
      if (!gi.receivedQuantity || gi.receivedQuantity < 0) {
        newErrors[`grnItems[${index}].receivedQuantity`] = 'Received quantity must be non-negative';
      }
    });

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const grnData = {
      grnNo: formData.grnNo,
      grnDate: formData.grnDate,
      challanNo: formData.challanNo,
      challanDate: formData.challanDate,
      document: formData.document || undefined,
      remark: formData.remark || undefined,
      grnItems: formData.grnItems.map(gi => ({
        ...(isEditMode && gi.id ? { id: gi.id } : {}),
        orderItemId: Number(gi.orderItemId),
        receivedQuantity: Number(gi.receivedQuantity),
        rejectedQuantity: Number(gi.rejectedQuantity || 0),
      })),
    };

    try {
      if (isEditMode) {
        // Update GRN
        await updateGrn(formData.poId, editId, grnData);
        const grnResponse = await getGrnById(editId);
        setGrns((prev) =>
          prev.map((grn) => (grn.id === editId ? grnResponse.data : grn))
        );
        setGrnItems((prev) => [
          ...prev.filter((gi) => gi.grnId !== editId),
          ...grnResponse.data.grnItems,
        ]);
      } else {
        // Create GRN
        const response = await createGrn(formData.poId, grnData);
        setGrns((prev) => [...prev, response.data]);
        setGrnItems((prev) => [...prev, ...response.data.grnItems]);
      }
      resetForm();
      setIsFormVisible(false);
    } catch (error) {
      console.error('Error saving GRN:', error);
      setErrors({ submit: 'Failed to save GRN. Please try again.' });
    }
  };

  // Get selected GRN data
  const selectedGrn = grns.find((grn) => grn.id === selectedGrnId);
  const selectedGrnItems = grnItems.filter((gi) => gi.grnId === selectedGrnId);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {selectedGrnId ? (
        <GrnDetails
          grn={selectedGrn}
          grnItems={selectedGrnItems}
          purchaseOrders={purchaseOrders}
          orderItem={orderItem}
          onBack={handleBack}
        />
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-brand-secondary mb-4">Goods Received Notes</h2>
            <div>
              <button
                onClick={() => setIsFormVisible(!isFormVisible)}
                className="bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-red-600 text-sm"
              >
                {isFormVisible ? 'Hide Form' : 'Create GRN'}
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-6">
            {isFormVisible && (
              <div>
                <h3 className="text-lg font-medium text-brand-secondary mb-4">
                  {isEditMode ? 'Edit GRN' : 'Add GRN'}
                </h3>
                <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Purchase Order</label>
                    <select
                      name="poId"
                      value={formData.poId}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-brand-primary focus:border-brand-primary text-sm"
                      required
                    >
                      <option value="">Select PO</option>
                      {purchaseOrders.map((po) => (
                        <option key={po.poId} value={po.poId}>
                          {po.poNo}
                        </option>
                      ))}
                    </select>
                    {errors.poId && <p className="mt-1 text-sm text-red-600">{errors.poId}</p>}
                  </div>
                  <FormInput
                    label="GRN Number"
                    type="text"
                    name="grnNo"
                    value={formData.grnNo}
                    onChange={handleChange}
                    error={errors.grnNo}
                    required
                    className="w-full text-sm"
                  />
                  <FormInput
                    label="GRN Date"
                    type="date"
                    name="grnDate"
                    value={formData.grnDate}
                    onChange={handleChange}
                    error={errors.grnDate}
                    required
                    className="w-full text-sm"
                  />
                  <FormInput
                    label="Challan Number"
                    type="text"
                    name="challanNo"
                    value={formData.challanNo}
                    onChange={handleChange}
                    error={errors.challanNo}
                    required
                    className="w-full text-sm"
                  />
                  <FormInput
                    label="Challan Date"
                    type="date"
                    name="challanDate"
                    value={formData.challanDate}
                    onChange={handleChange}
                    error={errors.challanDate}
                    required
                    className="w-full text-sm"
                  />
                  <FormInput
                    label="Document"
                    type="file"
                    name="document"
                    value={formData.document}
                    onChange={handleChange}
                    error={errors.document}
                    required={false}
                    className="w-full text-sm"
                  />
                  <FormInput
                    label="Remark"
                    type="text"
                    name="remark"
                    value={formData.remark}
                    onChange={handleChange}
                    error={errors.remark}
                    required={false}
                    className="w-full text-sm"
                  />
                  <div className="col-span-3">
                    <h4 className="text-md font-medium text-brand-secondary mb-2">GRN Items</h4>
                    {formData.grnItems.map((gi, index) => (
                      <div key={index} className="flex flex-col gap-4 mb-4 p-4 border rounded-md">
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Item Name</label>
                            <input
                              type="text"
                              value={orderItem.find((oi) => oi.id === gi.orderItemId)?.itemName || ''}
                              disabled
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-100 text-sm"
                            />
                            {errors[`grnItems[${index}].orderItemId`] && (
                              <p className="mt-1 text-sm text-red-600">
                                {errors[`grnItems[${index}].orderItemId`]}
                              </p>
                            )}
                          </div>
                          <FormInput
                            label="Received Quantity"
                            type="number"
                            name="receivedQuantity"
                            value={gi.receivedQuantity}
                            onChange={(e) => handleGrnItemChange(index, e)}
                            error={errors[`grnItems[${index}].receivedQuantity`]}
                            required
                            className="w-full text-sm"
                          />
                          <FormInput
                            label="Rejected Quantity"
                            type="number"
                            name="rejectedQuantity"
                            value={gi.rejectedQuantity || ''}
                            onChange={(e) => handleGrnItemChange(index, e)}
                            required={false}
                            className="w-full text-sm"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="col-span-3 flex space-x-4">
                    <button
                      type="submit"
                      className="bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-red-600 text-sm"
                    >
                      {isEditMode ? 'Update' : 'Add'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        resetForm();
                        setIsFormVisible(false);
                      }}
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
                columns={grnColumns}
                data={grns}
                actions={actions}
                onRowClick={handleRowClick}
                expandable={{
                  expandedRowRender: (row) => (
                    <div className="p-4 bg-gray-50">
                      <h4 className="text-md font-medium text-brand-secondary mb-2">GRN Items</h4>
                      <Table
                        columns={grnItemColumns}
                        data={grnItems.filter((gi) => gi.grnId === row.id)}
                        actions={[]}
                      />
                    </div>
                  ),
                  rowExpandable: (row) => grnItems.some((gi) => gi.grnId === row.id),
                  expandedRowKeys: expandedGrnId ? [expandedGrnId] : [],
                }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default GRN;