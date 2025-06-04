import { Routes, Route } from 'react-router-dom';
import Layout from '../layout/Layout';
import Dashboard from '../pages/Dashboard';
import FinancialYear from '../pages/FinancialYear';
import Institute from '../pages/Institute';
import Location from '../pages/location';
import Vendor from '../pages/Vendor';
import Unit from '../pages/Unit';
import Category from '../pages/Category';
import Item from '../pages/Item';
import PurchaseOrder from '../pages/PurchaseOrder';
import GRN from '../pages/GRN';
import Invoice from '../pages/Invoice';
import QuickGRN from '../pages/QuickGRN';
import QuickInvoice from '../pages/QuickInvoice';
import Stock from '../pages/stockStorage';
import DistributionItem from '../pages/DistributionItem';
import ReturnItem from '../pages/ReturnItem';
import Report from '../pages/Report';
import Login from '../pages/Login';

const Routers = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/masters/financial-year" element={<FinancialYear />} />
        <Route path="/masters/institute" element={<Institute />} />
        <Route path="/masters/location" element={<Location />} />
        <Route path="/masters/vendor" element={<Vendor />} />
        <Route path="/masters/unit" element={<Unit />} />
        <Route path="/masters/category" element={<Category />} />
        <Route path="/masters/item" element={<Item />} />
        <Route path="/purchase/purchase-order" element={<PurchaseOrder />} />
        <Route path="/purchase/grn" element={<GRN />} />
        <Route path="/purchase/invoice" element={<Invoice />} />
        <Route path="/quick-purchase/quick-grn" element={<QuickGRN />} />
        <Route path="/quick-purchase/quick-invoice" element={<QuickInvoice />} />
        <Route path="/stock/stock-storage" element={<Stock />} />
        <Route path="/distribution/distribution-item" element={<DistributionItem />} />
        <Route path="/distribution/return-item" element={<ReturnItem />} />
        <Route path="/reports" element={<Report />} />
      </Route>
    </Routes>
  );
};

export default Routers;