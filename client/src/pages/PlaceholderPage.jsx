import { useLocation } from 'react-router-dom';
import { Construction } from 'lucide-react';

const pageNames = {
  '/students': 'Students',
  '/fees': 'Fee Management',
  '/payments/record': 'Record Payment',
  '/payment-history': 'Payment History',
  '/fee-modifications': 'Fee Modifications',
  '/approvals': 'Approvals',
  '/reports': 'Reports',
  '/notifications': 'Notifications',
  '/audit-logs': 'Audit Logs',
  '/academic-years': 'Academic Years',
  '/fee-structures': 'Fee Structures',
  '/settings': 'Settings',
};

const PlaceholderPage = () => {
  const location = useLocation();
  const pageName = pageNames[location.pathname] || 'Page';

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center p-4 bg-amber-50 dark:bg-amber-900/20 rounded-full mb-4">
          <Construction className="h-10 w-10 text-amber-600 dark:text-amber-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{pageName}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          This page will be implemented in upcoming phases. Stay tuned!
        </p>
      </div>
    </div>
  );
};

export default PlaceholderPage;
