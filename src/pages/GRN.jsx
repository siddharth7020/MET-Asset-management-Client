import React, { useState, useEffect } from 'react';
import Table from '../components/Table';
import FormInput from '../components/FormInput';
import GrnDetails from './GRNDetail';
import { getPurchaseOrders, getPurchaseOrder } from '../api/purchaseOrderService';
import { getGrns, getGrnById, createGrn, updateGrn } from '../api/grnService';
import axios from '../api/axiosInstance';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

function GRN() {
  const [grns, setGrns] = useState([]);
  const [grnItems, setGrnItems] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    poId: '',
    grnNo: '',
    grnDate: '',
    challanNo: '',
    challanDate: '',
    documents: [],
    existingDocuments: [],
    remark: '',
    grnItems: [{
      orderItemId: '',
      itemId: '',
      unitId: '',
      storeCode: '',
      receivedQuantity: '',
      rejectedQuantity: ''
    }],
  });
  const [errors, setErrors] = useState({});
  const [editId, setEditId] = useState(null);
  const [selectedGrnId, setSelectedGrnId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState([]);
  const [units, setUnits] = useState([]);
  const MySwal = withReactContent(Swal);

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

        const itemsResponse = await axios.get('/items');
        if (Array.isArray(itemsResponse.data.items)) {
          setItems(itemsResponse.data.items);
        } else {
          console.error('Expected items data to be an array, but got:', itemsResponse.data.items);
        }

        const unitsResponse = await axios.get('/units');
        if (Array.isArray(unitsResponse.data.data)) {
          setUnits(unitsResponse.data.data);
          console.log('Units fetched successfully:', unitsResponse.data.data);
          
        } else {
          console.error('Expected units data to be an array, but got:', unitsResponse.data.data);
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

  useEffect(() => {
    if (formData.poId && !isEditMode) {
      const fetchOrderItems = async () => {
        try {
          const poResponse = await getPurchaseOrder(formData.poId);
          const orderItems = poResponse.data.orderItems || [];
          setFormData(prev => ({
            ...prev,
            grnItems: orderItems.map(item => ({
              orderItemId: item.id,
              itemId: item.itemId,
              unitId: item.unitId || '',
              storeCode: '',
              itemName: item.item?.name || 'N/A',
              receivedQuantity: item.quantity || '',
              rejectedQuantity: '0',
            })),
          }));
        } catch (error) {
          console.error('Error fetching order items:', error);
          MySwal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to fetch order items. Please try again.',
          });
        }
      };
      fetchOrderItems();
    } else if (!isEditMode) {
      setFormData(prev => ({
        ...prev,
        grnItems: [{
          orderItemId: '',
          itemId: '',
          unitId: '',
          storeCode: '',
          receivedQuantity: '',
          rejectedQuantity: ''
        }],
      }));
    }
  }, [formData.poId, isEditMode]);

  const filteredGrns = grns.filter((grn) => {
    const searchLower = searchQuery.toLowerCase();
    const poNo = purchaseOrders.find((po) => po.poId === grn.poId)?.poNo?.toLowerCase() || '';
    const grnNo = grn.grnNo ? grn.grnNo.toLowerCase() : '';
    const challanNo = grn.challanNo ? grn.challanNo.toLowerCase() : '';
    return (
      poNo.includes(searchLower) ||
      grnNo.includes(searchLower) ||
      challanNo.includes(searchLower)
    );
  });

  const handleRowClick = (row) => {
    setSelectedGrnId(row.id);
  };

  const handleBack = () => {
    setSelectedGrnId(null);
  };

  const grnColumns = [
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
  ];

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
            documents: [],
            existingDocuments: grn.document || [],
            remark: grn.remark || '',
            grnItems: grn.grnItems.map(gi => ({
              id: gi.id,
              orderItemId: gi.orderItemId,
              itemId: gi.itemId,
              unitId: gi.unitId || '',
              storeCode: gi.storeCode || '',
              itemName: gi.orderItem?.item?.name || 'N/A',
              receivedQuantity: gi.receivedQuantity,
              rejectedQuantity: gi.rejectedQuantity || '0',
            })) || [{
              orderItemId: '',
              itemId: '',
              unitId: '',
              storeCode: '',
              receivedQuantity: '',
              rejectedQuantity: ''
            }],
          });
          setIsFormVisible(true);
        } catch (error) {
          console.error('Error fetching GRN:', error);
          MySwal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to fetch GRN details. Please try again.',
          });
        }
      },
      className: 'bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-sm',
    },
  ];

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'documents') {
      setFormData((prev) => ({
        ...prev,
        documents: Array.from(files),
      }));
      setErrors((prev) => ({ ...prev, documents: '' }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleGrnItemChange = (index, e) => {
    const { name, value } = e.target;
    const updatedGrnItems = [...formData.grnItems];
    updatedGrnItems[index] = { ...updatedGrnItems[index], [name]: value };
    setFormData((prev) => ({ ...prev, grnItems: updatedGrnItems }));
    setErrors((prev) => ({ ...prev, [`grnItems[${index}].${name}`]: '' }));
  };




  const removeExistingDocument = (index) => {
    setFormData((prev) => ({
      ...prev,
      existingDocuments: prev.existingDocuments.filter((_, i) => i !== index),
    }));
  };

  const resetForm = () => {
    setFormData({
      poId: '',
      grnNo: '',
      grnDate: '',
      challanNo: '',
      challanDate: '',
      documents: [],
      existingDocuments: [],
      remark: '',
      grnItems: [{
        orderItemId: '',
        itemId: '',
        unitId: '',
        storeCode: '',
        receivedQuantity: '',
        rejectedQuantity: ''
      }],
    });
    setErrors({});
    setIsEditMode(false);
    setEditId(null);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.poId) newErrors.poId = 'Purchase Order is required';
    if (!formData.grnDate) newErrors.grnDate = 'GRN date is required';
    if (!formData.challanNo) newErrors.challanNo = 'Challan number is required';
    if (!formData.challanDate) newErrors.challanDate = 'Challan date is required';
    formData.documents.forEach((file, index) => {
      if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) {
        newErrors[`documents[${index}]`] = `File ${file.name}: Only PDF, JPEG, or PNG files are allowed`;
      }
      if (file.size > 10 * 1024 * 1024) {
        newErrors[`documents[${index}]`] = `File ${file.name}: Size must not exceed 10MB`;
      }
    });

    formData.grnItems.forEach((gi, index) => {
      if (!gi.orderItemId) newErrors[`grnItems[${index}].orderItemId`] = 'Order item is required';
      if (!gi.itemId) newErrors[`grnItems[${index}].itemId`] = 'Item is required';
      if (!gi.receivedQuantity || Number(gi.receivedQuantity) < 0) {
        newErrors[`grnItems[${index}].receivedQuantity`] = 'Received quantity must be non-negative';
      }
      if (gi.rejectedQuantity && Number(gi.rejectedQuantity) < 0) {
        newErrors[`grnItems[${index}].rejectedQuantity`] = 'Rejected quantity must be non-negative';
      }
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

    const apiFormData = new FormData();
    apiFormData.append('grnNo', formData.grnNo);
    apiFormData.append('grnDate', formData.grnDate);
    apiFormData.append('challanNo', formData.challanNo);
    apiFormData.append('challanDate', formData.challanDate);
    apiFormData.append('remark', formData.remark);
    apiFormData.append('grnItems', JSON.stringify(formData.grnItems.map(gi => ({
      ...(isEditMode && gi.id ? { id: gi.id } : {}),
      orderItemId: Number(gi.orderItemId),
      itemId: Number(gi.itemId),
      receivedQuantity: Number(gi.receivedQuantity),
      rejectedQuantity: gi.rejectedQuantity ? Number(gi.rejectedQuantity) : 0,
    }))));
    apiFormData.append('existingDocuments', JSON.stringify(formData.existingDocuments));
    formData.documents.forEach((file) => {
      apiFormData.append('documents', file);
    });

    try {
      if (isEditMode) {
        await updateGrn(formData.poId, editId, apiFormData);
        const grnResponse = await getGrnById(editId);
        setGrns((prev) =>
          prev.map((grn) => (grn.id === editId ? grnResponse.data : grn))
        );
        setGrnItems((prev) => [
          ...prev.filter((gi) => gi.grnId !== editId),
          ...grnResponse.data.grnItems,
        ]);
        MySwal.fire({
          icon: 'success',
          title: 'Success',
          text: 'GRN updated successfully!',
        });
      } else {
        const response = await createGrn(formData.poId, apiFormData);
        setGrns((prev) => [...prev, response.data]);
        setGrnItems((prev) => [...prev, ...response.data.grnItems]);
        MySwal.fire({
          icon: 'success',
          title: 'Success',
          text: 'GRN created successfully!',
        });
      }
      resetForm();
      setIsFormVisible(false);
    } catch (error) {
      console.error('Error saving GRN:', error);
      MySwal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Items quantity must be less than order quantity.',
      });
    }
  };

  const handleCancel = async () => {
    const hasChanges = Object.values(formData).some(
      (value) =>
        (typeof value === 'string' && value !== '') ||
        (Array.isArray(value) && value.length > 0 && value.some(v =>
          typeof v === 'string' ? v !== '' : v instanceof File ||
          (typeof v === 'object' && Object.values(v).some(v2 => v2 !== ''))))
    );

    if (hasChanges) {
      const result = await MySwal.fire({
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

    resetForm();
    setIsFormVisible(false);
  };

  const selectedGrn = grns.find((grn) => grn.id === selectedGrnId);
  const selectedGrnItems = grnItems.filter((gi) => gi.grnId === selectedGrnId);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {selectedGrnId ? (
        <GrnDetails
          grn={selectedGrn}
          grnItems={selectedGrnItems}
          purchaseOrders={purchaseOrders}
          onBack={handleBack}
          items={items}
          units={units}
        />
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-brand-secondary">Goods Received Notes</h2>
            <div className="flex items-center space-x-4">
              <input
                type="text"
                placeholder="Search by PO Number, GRN Number, or Challan Number"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 border border-gray-300 rounded-md shadow-sm p-2 focus:ring-brand-primary focus:border-brand-primary text-sm"
              />
              <button
                onClick={() => setIsFormVisible(!isFormVisible)}
                className="bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-brand-primary-dark text-sm"
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
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Documents</label>
                    <input
                      type="file"
                      name="documents"
                      multiple
                      onChange={handleChange}
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                    />
                    {errors.documents && <p className="mt-1 text-sm text-red-600">{errors.documents}</p>}
                    {formData.documents.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-600">Selected files:</p>
                        <ul className="list-disc pl-5 text-xs text-gray-600">
                          {formData.documents.map((file, index) => (
                            <li key={index}>{file.name}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {isEditMode && formData.existingDocuments.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-600">Existing documents:</p>
                        <ul className="list-disc pl-5 text-xs text-gray-600">
                          {formData.existingDocuments.map((doc, index) => (
                            <li key={index} className="flex items-center">
                              <span>{doc.split('/').pop()}</span>
                              <button
                                type="button"
                                onClick={() => removeExistingDocument(index)}
                                className="ml-2 text-red-600 hover:text-red-800 text-xs"
                              >
                                Remove
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
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
                  <div className="col-span-1 md:col-span-3">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-md font-medium text-brand-secondary">GRN Items</h4>
                    </div>
                    {formData.grnItems.map((gi, index) => (
                      <div key={index} className="flex flex-col gap-4 mb-4 p-4 border rounded-md">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Item Name</label>
                            <input
                              type="text"
                              value={items.find((item) => item.itemId === gi.itemId)?.itemName || ''}
                              disabled
                              className="block w-full border border-gray-300 rounded-md shadow-sm px-2 py-2 bg-gray-100 text-sm"
                            />
                            {errors[`grnItems[${index}].itemId`] && (
                              <p className="mt-1 text-sm text-red-600">
                                {errors[`grnItems[${index}].itemId`]}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Unit</label>
                            <input
                              type="text"
                              value={units.find((unit) => unit.unitId === gi.unitId)?.uniteCode || ''}
                              disabled
                              className="block w-full border border-gray-300 rounded-md shadow-sm px-2 py-2 bg-gray-100 text-sm"
                            />
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

                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="col-span-1 md:col-span-3 flex space-x-4">
                    <button
                      type="submit"
                      className="bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-brand-primary-dark text-sm"
                    >
                      {isEditMode ? 'Update GRN' : 'Create GRN'}
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
                columns={grnColumns}
                data={filteredGrns}
                actions={actions}
                onRowClick={handleRowClick}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default GRN;