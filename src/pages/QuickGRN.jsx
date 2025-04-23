import React, { useState } from 'react';
import FormInput from '../components/FormInput';

function QuickGRN() {
  const [formData, setFormData] = useState({
    challanNo: '',
    quantity: 0,
    itemId: '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.challanNo) newErrors.challanNo = 'Challan number is required';
    if (formData.quantity <= 0) newErrors.quantity = 'Quantity must be greater than 0';
    if (!formData.itemId) newErrors.itemId = 'Item is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Submit form (replace with API call)
    alert(`Submit Quick GRN: ${JSON.stringify(formData)}`);
    // Example: fetch('/api/quick-purchase/quick-grn', { method: 'POST', body: JSON.stringify(formData) });
  };

  const itemOptions = [
    { value: '1', label: 'Laptop' },
    { value: '2', label: 'Projector' },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-brand-secondary mb-4">Create Quick GRN</h2>
      <form onSubmit={handleSubmit}>
        <FormInput
          label="Challan Number"
          type="text"
          name="challanNo"
          value={formData.challanNo}
          onChange={handleChange}
          error={errors.challanNo}
          required
        />
        <FormInput
          label="Quantity"
          type="number"
          name="quantity"
          value={formData.quantity}
          onChange={handleChange}
          error={errors.quantity}
          required
        />
        <FormInput
          label="Item"
          type="select"
          name="itemId"
          value={formData.itemId}
          onChange={handleChange}
          error={errors.itemId}
          options={itemOptions}
          required
        />
        <button
          type="submit"
          className="mt-4 bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-red-600"
        >
          Submit
        </button>
      </form>
    </div>
  );
}

export default QuickGRN;