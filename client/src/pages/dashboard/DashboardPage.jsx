import { useAuth } from '@/contexts/AuthContext';
import StatCard from '@/components/ui/StatCard';
import { Users, IndianRupee, Clock, TrendingUp } from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Welcome back, {user?.fullName}! Here's an overview of your school fee management.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value="0"
          icon={Users}
          color="primary"
        />
        <StatCard
          title="Total Collected"
          value="₹0"
          icon={IndianRupee}
          color="green"
        />
        <StatCard
          title="Total Pending"
          value="₹0"
          icon={Clock}
          color="yellow"
        />
        <StatCard
          title="Today's Collection"
          value="₹0"
          icon={TrendingUp}
          color="blue"
        />
      </div>

      {/* Placeholder message */}
      <div className="card p-8 text-center">
        <div className="max-w-sm mx-auto">
          <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-full inline-flex mb-4">
            <TrendingUp className="h-8 w-8 text-primary-600 dark:text-primary-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Dashboard Statistics
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Dashboard will display real-time statistics, charts, and recent activity
            once student and fee data has been added.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
