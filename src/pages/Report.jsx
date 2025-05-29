import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import Table from '../components/Table';
import FormInput from '../components/FormInput';

function Reports() {
  const [distributions, setDistributions] = useState([]);
  const [distributionItems, setDistributionItems] = useState([]);
  const [returns, setReturns] = useState([]);
  const [returnItems, setReturnItems] = useState([]);
  const [items, setItems] = useState([]);
  const [financialYears, setFinancialYears] = useState([]);
  const [institutes, setInstitutes] = useState([]);
  const [filters, setFilters] = useState({
    financialYearId: '',
    instituteId: '',
    itemId: '',
    startDate: '',
    endDate: '',
    reportType: 'Both',
  });
  const [filteredData, setFilteredData] = useState([]);
  const [expandedRowId, setExpandedRowId] = useState(null);

  // Initialize dummy data
  useEffect(() => {
    const distributionsData = [
      {
        id: 1,
        financialYearId: 1,
        instituteId: 1,
        employeeName: 'Shreya',
        location: 'Building A',
        documents: 'receipt.pdf',
        remark: 'Issued for project use',
        createdAt: '2025-04-25T04:37:50.729Z',
        updatedAt: '2025-04-25T04:37:50.729Z',
      },
    ];
    const distributionItemsData = [
      {
        id: 1,
        distributionId: 1,
        itemId: 2,
        issueQuantity: 10,
        createdAt: '2025-04-25T04:37:50.749Z',
        updatedAt: '2025-04-25T04:37:50.749Z',
      },
      {
        id: 2,
        distributionId: 1,
        itemId: 1,
        issueQuantity: 50,
        createdAt: '2025-04-25T04:37:50.749Z',
        updatedAt: '2025-04-25T04:37:50.749Z',
      },
    ];
    const returnsData = [
      {
        id: 1,
        distributionId: 1,
        financialYearId: 1,
        instituteId: 1,
        employeeName: 'Shreya',
        location: 'Building A',
        documents: 'return_receipt.pdf',
        remark: 'Returned due to excess',
        createdAt: '2025-04-25T04:51:02.977Z',
        updatedAt: '2025-04-25T04:51:02.977Z',
      },
    ];
    const returnItemsData = [
      {
        id: 1,
        returnId: 1,
        itemId: 1,
        returnQuantity: 15,
        createdAt: '2025-04-25T04:51:02.990Z',
        updatedAt: '2025-04-25T04:51:02.990Z',
      },
    ];
    const itemsData = [
      { id: 1, itemName: 'Keyboard' },
      { id: 2, itemName: 'Laptop' },
    ];
    const financialYearsData = [{ id: 1, name: '2024-2025' }];
    const institutesData = [{ id: 1, name: 'Main Campus' }];

    setDistributions(distributionsData);
    setDistributionItems(distributionItemsData);
    setReturns(returnsData);
    setReturnItems(returnItemsData);
    setItems(itemsData);
    setFinancialYears(financialYearsData);
    setInstitutes(institutesData);
    applyFilters({ ...filters, distributions: distributionsData, returns: returnsData });
  }, []);

  // Filter data
  const applyFilters = (updatedFilters) => {
    const { financialYearId, instituteId, itemId, startDate, endDate, reportType, distributions: dists = distributions, returns: rets = returns } = updatedFilters;

    let data = [];
    if (reportType === 'Distribution' || reportType === 'Both') {
      let filteredDistributions = dists;
      if (financialYearId) {
        filteredDistributions = filteredDistributions.filter((dist) => dist.financialYearId === Number(financialYearId));
      }
      if (instituteId) {
        filteredDistributions = filteredDistributions.filter((dist) => dist.instituteId === Number(instituteId));
      }
      if (startDate) {
        filteredDistributions = filteredDistributions.filter((dist) => new Date(dist.createdAt) >= new Date(startDate));
      }
      if (endDate) {
        filteredDistributions = filteredDistributions.filter((dist) => new Date(dist.createdAt) <= new Date(endDate));
      }
      if (itemId) {
        const distIds = distributionItems
          .filter((di) => di.itemId === Number(itemId))
          .map((di) => di.distributionId);
        filteredDistributions = filteredDistributions.filter((dist) => distIds.includes(dist.id));
      }
      data.push(...filteredDistributions.map((dist) => ({ ...dist, type: 'Distribution' })));
    }
    if (reportType === 'Return' || reportType === 'Both') {
      let filteredReturns = rets;
      if (financialYearId) {
        filteredReturns = filteredReturns.filter((ret) => ret.financialYearId === Number(financialYearId));
      }
      if (instituteId) {
        filteredReturns = filteredReturns.filter((ret) => ret.instituteId === Number(instituteId));
      }
      if (startDate) {
        filteredReturns = filteredReturns.filter((ret) => new Date(ret.createdAt) >= new Date(startDate));
      }
      if (endDate) {
        filteredReturns = filteredReturns.filter((ret) => new Date(ret.createdAt) <= new Date(endDate));
      }
      if (itemId) {
        const retIds = returnItems
          .filter((ri) => ri.itemId === Number(itemId))
          .map((ri) => ri.returnId);
        filteredReturns = filteredReturns.filter((ret) => retIds.includes(ret.id));
      }
      data.push(...filteredReturns.map((ret) => ({ ...ret, type: 'Return' })));
    }
    setFilteredData(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => {
      const updatedFilters = { ...prev, [name]: value };
      applyFilters(updatedFilters);
      return updatedFilters;
    });
  };

  const handleSelectChange = (option, name) => {
    setFilters((prev) => {
      const updatedFilters = { ...prev, [name]: option ? option.value : '' };
      applyFilters(updatedFilters);
      return updatedFilters;
    });
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Type', 'ID', 'Distribution ID', 'Financial Year', 'Institute', 'Employee Name', 'Location', 'Remark', 'Created At'];
    const rows = filteredData.map((item) => [
      item.type,
      item.id,
      item.distributionId || '',
      financialYears.find((fy) => fy.id === item.financialYearId)?.name || item.financialYearId,
      institutes.find((inst) => inst.id === item.instituteId)?.name || item.instituteId,
      item.employeeName,
      item.location,
      item.remark || '',
      new Date(item.createdAt).toLocaleDateString(),
    ]);
    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'report.csv';
    link.click();
  };

  // Table columns
  const columns = [
    { key: 'type', label: 'Type' },
    { key: 'id', label: 'ID' },
    { key: 'distributionId', label: 'Distribution ID', format: (value) => value || 'N/A' },
    { key: 'financialYearId', label: 'Financial Year', format: (value) => financialYears.find((fy) => fy.id === value)?.name || value },
    { key: 'instituteId', label: 'Institute', format: (value) => institutes.find((inst) => inst.id === value)?.name || value },
    { key: 'employeeName', label: 'Employee Name' },
    { key: 'location', label: 'Location' },
    { key: 'remark', label: 'Remark', className: 'hidden sm:table-cell' },
    { key: 'createdAt', label: 'Created At', format: (value) => new Date(value).toLocaleDateString() },
  ];

  const itemColumns = [
    { key: 'id', label: 'Item ID' },
    { key: 'itemId', label: 'Item', format: (value) => items.find((i) => i.id === value)?.itemName || 'N/A' },
    { key: 'quantity', label: 'Quantity', format: (value, row) => row.issueQuantity || row.returnQuantity },
  ];

  // react-select options
  const financialYearOptions = financialYears.map((fy) => ({
    value: fy.id.toString(),
    label: fy.name,
  }));
  const instituteOptions = institutes.map((inst) => ({
    value: inst.id.toString(),
    label: inst.name,
  }));
  const itemOptions = items.map((item) => ({
    value: item.id.toString(),
    label: item.itemName,
  }));
  const reportTypeOptions = [
    { value: 'Distribution', label: 'Distribution' },
    { value: 'Return', label: 'Return' },
    { value: 'Both', label: 'Both' },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-lg sm:text-xl font-semibold text-brand-secondary mb-4">Reports</h2>
      <div className="flex flex-col gap-6">
        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700">Financial Year</label>
            <Select
              options={financialYearOptions}
              value={financialYearOptions.find((option) => option.value === filters.financialYearId)}
              onChange={(option) => handleSelectChange(option, 'financialYearId')}
              className="mt-1 text-xs sm:text-sm"
              classNamePrefix="select"
              placeholder="Select Financial Year"
              isClearable
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700">Institute</label>
            <Select
              options={instituteOptions}
              value={instituteOptions.find((option) => option.value === filters.instituteId)}
              onChange={(option) => handleSelectChange(option, 'instituteId')}
              className="mt-1 text-xs sm:text-sm"
              classNamePrefix="select"
              placeholder="Select Institute"
              isClearable
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700">Item</label>
            <Select
              options={itemOptions}
              value={itemOptions.find((option) => option.value === filters.itemId)}
              onChange={(option) => handleSelectChange(option, 'itemId')}
              className="mt-1 text-xs sm:text-sm"
              classNamePrefix="select"
              placeholder="Select Item"
              isClearable
            />
          </div>
          <FormInput
            label="Start Date"
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleFilterChange}
            className="w-full text-xs sm:text-sm"
          />
          <FormInput
            label="End Date"
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleFilterChange}
            className="w-full text-xs sm:text-sm"
          />
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700">Report Type</label>
            <Select
              options={reportTypeOptions}
              value={reportTypeOptions.find((option) => option.value === filters.reportType)}
              onChange={(option) => handleSelectChange(option, 'reportType')}
              className="mt-1 text-xs sm:text-sm"
              classNamePrefix="select"
              placeholder="Select Report Type"
            />
          </div>
        </div>

        {/* Summary */}
        <div className="p-4 bg-gray-50 rounded-md shadow">
          <h3 className="text-sm sm:text-base font-medium text-brand-secondary mb-2">Summary</h3>
          <p className="text-xs sm:text-sm">Total Records: {filteredData.length}</p>
          <p className="text-xs sm:text-sm">
            Total Items Distributed: {filteredData
              .filter((item) => item.type === 'Distribution')
              .reduce((sum, dist) => {
                const distItems = distributionItems.filter((di) => di.distributionId === dist.id);
                return sum + distItems.reduce((s, di) => s + di.issueQuantity, 0);
              }, 0)}
          </p>
          <p className="text-xs sm:text-sm">
            Total Items Returned: {filteredData
              .filter((item) => item.type === 'Return')
              .reduce((sum, ret) => {
                const retItems = returnItems.filter((ri) => ri.returnId === ret.id);
                return sum + retItems.reduce((s, ri) => s + ri.returnQuantity, 0);
              }, 0)}
          </p>
        </div>

        {/* Report Table */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm sm:text-base font-medium text-brand-secondary">Report Data</h3>
            <button
              onClick={exportToCSV}
              className="bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-red-600 text-xs sm:text-sm"
            >
              Export to CSV
            </button>
          </div>
          <div className="sm:hidden space-y-4">
            {filteredData.map((item) => (
              <div key={`${item.type}-${item.id}`} className="p-4 border rounded-md bg-gray-50">
                <div className="space-y-2">
                  <p className="text-xs"><strong>Type:</strong> {item.type}</p>
                  <p className="text-xs"><strong>ID:</strong> {item.id}</p>
                  <p className="text-xs"><strong>Distribution ID:</strong> {item.distributionId || 'N/A'}</p>
                  <p className="text-xs"><strong>Financial Year:</strong> {financialYears.find((fy) => fy.id === item.financialYearId)?.name || item.financialYearId}</p>
                  <p className="text-xs"><strong>Institute:</strong> {institutes.find((inst) => inst.id === item.instituteId)?.name || item.instituteId}</p>
                  <p className="text-xs"><strong>Employee Name:</strong> {item.employeeName}</p>
                  <p className="text-xs"><strong>Location:</strong> {item.location}</p>
                  <p className="text-xs"><strong>Created At:</strong> {new Date(item.createdAt).toLocaleDateString()}</p>
                </div>
                {expandedRowId === `${item.type}-${item.id}` && (
                  <div className="mt-4">
                    <h4 className="text-xs font-medium text-brand-secondary mb-2">Items</h4>
                    {(item.type === 'Distribution' ? distributionItems.filter((di) => di.distributionId === item.id) : returnItems.filter((ri) => ri.returnId === item.id))
                      .map((di) => (
                        <div key={di.id} className="p-2 border rounded-md bg-white">
                          <p className="text-xs"><strong>Item ID:</strong> {di.id}</p>
                          <p className="text-xs"><strong>Item:</strong> {items.find((i) => i.id === di.itemId)?.itemName || 'N/A'}</p>
                          <p className="text-xs"><strong>Quantity:</strong> {di.issueQuantity || di.returnQuantity}</p>
                        </div>
                      ))}
                  </div>
                )}
                <button
                  onClick={() => setExpandedRowId(expandedRowId === `${item.type}-${item.id}` ? null : `${item.type}-${item.id}`)}
                  className="mt-2 text-xs text-brand-primary hover:underline"
                >
                  {expandedRowId === `${item.type}-${item.id}` ? 'Hide Items' : 'Show Items'}
                </button>
              </div>
            ))}
          </div>
          <div className="hidden sm:block overflow-x-auto">
            <Table
              columns={columns}
              data={filteredData}
              expandable={{
                expandedRowRender: (row) => {
                  const itemsData = row.type === 'Distribution'
                    ? distributionItems.filter((di) => di.distributionId === row.id)
                    : returnItems.filter((ri) => ri.returnId === row.id);
                  return (
                    <div className="p-4 bg-gray-50">
                      <h4 className="text-sm font-medium text-brand-secondary mb-2">Items</h4>
                      <Table columns={itemColumns} data={itemsData}  className="text-sm" />
                    </div>
                  );
                },
                rowExpandable: (row) => (row.type === 'Distribution'
                  ? distributionItems.some((di) => di.distributionId === row.id)
                  : returnItems.some((ri) => ri.returnId === row.id)),
                expandedRowKeys: expandedRowId ? [expandedRowId] : [],
              }}
              className="text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;