import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Table from '../components/Table';
import FormInput from '../components/FormInput';

function GRN() {
  const [grns, setGrns] = useState([]);
  const [grnItems, setGrnItems] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
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

  // Initialize dummy data
  useEffect(() => {
    const grnsData = [
      {
        id: 1,
        poId: 2,
        grnNo: 'GRN0010',
        grnDate: '2025-04-16',
        challanNo: 'CH0003',
        challanDate: '2025-04-16',
        document: 'grn_doc.pdf',
        remark: 'error testing grn',
        createdAt: '2025-04-24T06:58:36.038Z',
        updatedAt: '2025-04-24T06:58:36.038Z',
      },
    ];
    const grnItemsData = [
      {
        id: 1,
        grnId: 1,
        orderItemId: 3,
        receivedQuantity: 50,
        rejectedQuantity: 50,
        createdAt: '2025-04-24T06:58:36.061Z',
        updatedAt: '2025-04-24T06:58:36.061Z',
      },
      {
        id: 2,
        grnId: 1,
        orderItemId: 4,
        receivedQuantity: 100,
        rejectedQuantity: 400,
        createdAt: '2025-04-24T06:58:36.061Z',
        updatedAt: '2025-04-24T06:58:36.061Z',
      },
    ];
    const purchaseOrdersData = [
      { poId: 1, poNo: 'PO001' },
      { poId: 2, poNo: 'PO002' },
    ];
    const orderItemsData = [
      { id: 3, poId: 2, itemId: 3, itemName: 'Notebook' },
      { id: 4, poId: 2, itemId: 2, itemName: 'Office Chair' },
    ];

    setGrns(grnsData);
    setGrnItems(grnItemsData);
    setPurchaseOrders(purchaseOrdersData);
    setOrderItems(orderItemsData);
    console.log('GRNs:', grnsData, 'GRNItems:', grnItemsData); // Debug
  }, []);

  // Table columns for GRN
  const grnColumns = [
    { key: 'id', label: 'ID' },
    { key: 'poId', label: 'PO Number', format: (value) => purchaseOrders.find((po) => po.poId === value)?.poNo || 'N/A' },
    { key: 'grnNo', label: 'GRN Number' },
    { key: 'grnDate', label: 'GRN Date', format: (value) => new Date(value).toLocaleDateString() },
    { key: 'challanNo', label: 'Challan Number' },
    { key: 'challanDate', label: 'Challan Date', format: (value) => new Date(value).toLocaleDateString() },
    { key: 'remark', label: 'Remark' },
  ];

  // Table columns for GRNItem
  const grnItemColumns = [
    { key: 'id', label: 'ID' },
    { key: 'orderItemId', label: 'Item', format: (value) => orderItems.find((oi) => oi.id === value)?.itemName || 'N/A' },
    { key: 'receivedQuantity', label: 'Received Quantity' },
    { key: 'rejectedQuantity', label: 'Rejected Quantity' },
  ];

  // Table actions
  const actions = [
    {
      label: 'Edit',
      onClick: (row) => {
        setIsEditMode(true);
        setEditId(row.id);
        const items = grnItems
          .filter((gi) => gi.grnId === row.id)
          .map((gi) => ({
            id: gi.id,
            orderItemId: gi.orderItemId,
            receivedQuantity: gi.receivedQuantity,
            rejectedQuantity: gi.rejectedQuantity,
          }));
        setFormData({
          id: row.id,
          poId: row.poId,
          grnNo: row.grnNo,
          grnDate: row.grnDate.split('T')[0],
          challanNo: row.challanNo,
          challanDate: row.challanDate.split('T')[0],
          document: row.document,
          remark: row.remark,
          grnItems: items.length > 0 ? items : [{ orderItemId: '', receivedQuantity: '' }],
        });
        setIsFormVisible(true);
      },
      className: 'bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-sm',
    },
    {
      label: 'Delete',
      onClick: (row) => {
        if (window.confirm(`Delete GRN ${row.grnNo}?`)) {
          setGrns((prev) => prev.filter((grn) => grn.id !== row.id));
          setGrnItems((prev) => prev.filter((gi) => gi.grnId !== row.id));
          resetForm();
        }
      },
      className: 'bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm',
    },
    {
      label: 'View Items',
      onClick: (row) => {
        console.log('Toggling items for grnId:', row.id); // Debug
        setExpandedGrnId(expandedGrnId === row.id ? null : row.id);
      },
      className: 'bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-sm',
    },
    {
      label: 'View Details',
      className: 'bg-purple-500 hover:bg-purple-600 text-white px-2 py-1 rounded text-sm',
      render: (row) => (
        <Link
          to={`/masters/grn/${row.id}`}
          className="bg-purple-500 hover:bg-purple-600 text-white px-2 py-1 rounded text-sm"
        >
          View Details
        </Link>
      ),
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

  const addGrnItem = () => {
    setFormData((prev) => ({
      ...prev,
      grnItems: [...prev.grnItems, { orderItemId: '', receivedQuantity: '' }],
    }));
  };

  const removeGrnItem = (index) => {
    if (formData.grnItems.length === 1) {
      alert('At least one GRN item is required');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      grnItems: prev.grnItems.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.poId) newErrors.poId = 'Purchase Order is required';
    if (!formData.grnNo) newErrors.grnNo = 'GRN number is required';
    else if (grns.some((grn) => grn.grnNo === formData.grnNo && grn.id !== editId)) {
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (isEditMode) {
      setGrns((prev) =>
        prev.map((grn) =>
          grn.id === editId
            ? { ...formData, id: editId, poId: Number(formData.poId) }
            : grn
        )
      );
      const existingIds = grnItems.filter((gi) => gi.grnId === editId).map((gi) => gi.id);
      const updatedItems = formData.grnItems.map((gi, index) => ({
        id: gi.id || existingIds[index] || Math.max(...grnItems.map((g) => g.id), 0) + index + 1,
        grnId: editId,
        orderItemId: Number(gi.orderItemId),
        receivedQuantity: Number(gi.receivedQuantity),
        rejectedQuantity: Number(gi.rejectedQuantity || 0),
      }));
      setGrnItems((prev) => [
        ...prev.filter((gi) => gi.grnId !== editId),
        ...updatedItems,
      ]);
    } else {
      const newGrnId = Math.max(...grns.map((grn) => grn.id), 0) + 1;
      setGrns((prev) => [
        ...prev,
        {
          ...formData,
          id: newGrnId,
          poId: Number(formData.poId),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);
      const newGrnItems = formData.grnItems.map((gi, index) => ({
        id: Math.max(...grnItems.map((g) => g.id), 0) + index + 1,
        grnId: newGrnId,
        orderItemId: Number(gi.orderItemId),
        receivedQuantity: Number(gi.receivedQuantity),
        rejectedQuantity: Number(gi.rejectedQuantity || 0),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      setGrnItems((prev) => [...prev, ...newGrnItems]);
    }

    resetForm();
    setIsFormVisible(false);
  };

  const resetForm = () => {
    setFormData({
      id: '',
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

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className='flex justify-between items-center mb-4'>
        <h2 className="text-2xl font-semibold text-brand-secondary mb-4">Goods Received Notes</h2>
        <div>
          <button
            onClick={() => setIsFormVisible(!isFormVisible)}
            className="bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-red-600 text-sm"
          >
            {isFormVisible ? 'Hide Form' : 'Manage GRN'}
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
              <FormInput
                label="GRN ID"
                type="text"
                name="id"
                value={formData.id}
                onChange={handleChange}
                disabled
                required={false}
                className="w-full text-sm"
              />
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
                {errors.poId && (
                  <p className="mt-1 text-sm text-red-600">{errors.poId}</p>
                )}
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
                type="text"
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
                        <label className="block text-sm font-medium text-gray-700">Order Item</label>
                        <select
                          name="orderItemId"
                          value={gi.orderItemId}
                          onChange={(e) => handleGrnItemChange(index, e)}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-brand-primary focus:border-brand-primary text-sm"
                          required
                        >
                          <option value="">Select Item</option>
                          {orderItems
                            .filter((oi) => oi.poId === Number(formData.poId))
                            .map((oi) => (
                              <option key={oi.id} value={oi.id}>
                                {oi.itemName}
                              </option>
                            ))}
                        </select>
                        {errors[`grnItems[${index}].orderItemId`] && (
                          <p className="mt-1 text-sm text-red-600">{errors[`grnItems[${index}].orderItemId`]}</p>
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
                    <button
                      type="button"
                      onClick={() => removeGrnItem(index)}
                      className="text-red-600 hover:text-red-800 text-sm mt-2"
                    >
                      Remove Item
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addGrnItem}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 text-sm"
                >
                  Add GRN Item
                </button>
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
            expandable={{
              expandedRowRender: (row) => {
                const items = grnItems.filter((gi) => gi.grnId === Number(row.id));
                console.log('Rendering items for grnId:', row.id, items); // Debug
                return (
                  <div className="p-4 bg-gray-50">
                    <h4 className="text-md font-medium text-brand-secondary mb-2">GRN Items</h4>
                    <Table
                      columns={grnItemColumns}
                      data={items}
                      actions={[]}
                      className="text-sm"
                    />
                  </div>
                );
              },
              rowExpandable: (row) => grnItems.some((gi) => gi.grnId === Number(row.id)),
              expandedRowKeys: expandedGrnId ? [Number(expandedGrnId)] : [],
            }}
            className="text-sm"
          />
        </div>
      </div>
    </div>
  );
}

export default GRN;