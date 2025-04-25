import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import Table from '../components/Table';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

function Dashboard() {
  const [distributions, setDistributions] = useState([]);
  const [distributionItems, setDistributionItems] = useState([]);
  const [returns, setReturns] = useState([]);
  const [returnItems, setReturnItems] = useState([]);
  const [items, setItems] = useState([]);
  const [institutes, setInstitutes] = useState([]);

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
    const institutesData = [{ id: 1, name: 'Main Campus' }];

    setDistributions(distributionsData);
    setDistributionItems(distributionItemsData);
    setReturns(returnsData);
    setReturnItems(returnItemsData);
    setItems(itemsData);
    setInstitutes(institutesData);
  }, []);

  // Metrics
  const totalDistributions = distributions.length;
  const totalReturns = returns.length;
  const totalItemsDistributed = distributionItems.reduce((sum, di) => sum + di.issueQuantity, 0);
  const totalItemsReturned = returnItems.reduce((sum, ri) => sum + ri.returnQuantity, 0);

  // Bar Chart: Items Distributed vs Returned
  const barData = {
    labels: items.map((item) => item.itemName),
    datasets: [
      {
        label: 'Distributed',
        data: items.map((item) =>
          distributionItems
            .filter((di) => di.itemId === item.id)
            .reduce((sum, di) => sum + di.issueQuantity, 0)
        ),
        backgroundColor: '#EF4444',
      },
      {
        label: 'Returned',
        data: items.map((item) =>
          returnItems
            .filter((ri) => ri.itemId === item.id)
            .reduce((sum, ri) => sum + ri.returnQuantity, 0)
        ),
        backgroundColor: '#123458',
      },
    ],
  };

  // Pie Chart: Distribution by Institute
  const pieData = {
    labels: institutes.map((inst) => inst.name),
    datasets: [
      {
        data: institutes.map((inst) =>
          distributions.filter((dist) => dist.instituteId === inst.id).length
        ),
        backgroundColor: ['#EF4444', '#123458', '#10B981', '#F59E0B'],
      },
    ],
  };

  // Recent Activity: Combine Distributions and Returns
  const recentActivity = [
    ...distributions.map((dist) => ({
      ...dist,
      type: 'Distribution',
    })),
    ...returns.map((ret) => ({
      ...ret,
      type: 'Return',
    })),
  ]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const recentColumns = [
    { key: 'type', label: 'Type' },
    { key: 'id', label: 'ID' },
    { key: 'employeeName', label: 'Employee Name' },
    { key: 'location', label: 'Location' },
    { key: 'createdAt', label: 'Date', format: (value) => new Date(value).toLocaleDateString() },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-lg sm:text-xl font-semibold text-brand-secondary mb-4">Dashboard</h2>
      <div className="flex flex-col gap-6">
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-brand-primary text-white rounded-md shadow">
            <h3 className="text-xs sm:text-sm font-medium">Total Distributions</h3>
            <p className="text-lg sm:text-xl font-bold">{totalDistributions}</p>
          </div>
          <div className="p-4 bg-brand-secondary text-white rounded-md shadow">
            <h3 className="text-xs sm:text-sm font-medium">Total Returns</h3>
            <p className="text-lg sm:text-xl font-bold">{totalReturns}</p>
          </div>
          <div className="p-4 bg-green-500 text-white rounded-md shadow">
            <h3 className="text-xs sm:text-sm font-medium">Items Distributed</h3>
            <p className="text-lg sm:text-xl font-bold">{totalItemsDistributed}</p>
          </div>
          <div className="p-4 bg-purple-500 text-white rounded-md shadow">
            <h3 className="text-xs sm:text-sm font-medium">Items Returned</h3>
            <p className="text-lg sm:text-xl font-bold">{totalItemsReturned}</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-4 bg-gray-50 rounded-md shadow">
            <h3 className="text-sm sm:text-base font-medium text-brand-secondary mb-4">Items Distributed vs Returned</h3>
            <div className="h-64 sm:h-80">
              <Bar
                data={barData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'top' } },
                  scales: { y: { beginAtZero: true } },
                }}
              />
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-md shadow">
            <h3 className="text-sm sm:text-base font-medium text-brand-secondary mb-4">Distributions by Institute</h3>
            <div className="h-64 sm:h-80">
              <Pie
                data={pieData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'top' } },
                }}
              />
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h3 className="text-sm sm:text-base font-medium text-brand-secondary mb-4">Recent Activity</h3>
          <div className="sm:hidden space-y-4">
            {recentActivity.map((item) => (
              <div key={`${item.type}-${item.id}`} className="p-4 border rounded-md bg-gray-50">
                <p className="text-xs"><strong>Type:</strong> {item.type}</p>
                <p className="text-xs"><strong>ID:</strong> {item.id}</p>
                <p className="text-xs"><strong>Employee Name:</strong> {item.employeeName}</p>
                <p className="text-xs"><strong>Location:</strong> {item.location}</p>
                <p className="text-xs"><strong>Date:</strong> {new Date(item.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
          <div className="hidden sm:block overflow-x-auto">
            <Table columns={recentColumns} data={recentActivity} actions={[]} className="text-sm" />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/masters/distribution"
            className="w-full sm:w-auto bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-red-600 text-xs sm:text-sm text-center"
          >
            Manage Distributions
          </Link>
          <Link
            to="/masters/return"
            className="w-full sm:w-auto bg-brand-secondary text-white px-4 py-2 rounded-md hover:bg-blue-800 text-xs sm:text-sm text-center"
          >
            Manage Returns
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;