
import React from 'react';
import Card from '../shared/Card';

interface StatCardProps {
  title: string;
  value: string;
  icon: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => {
  return (
    <Card className="flex items-center">
      <div className={`p-4 rounded-full ${color}`}>
        <i className={`fas ${icon} fa-2x text-white`}></i>
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">{title}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
    </Card>
  );
};

export default StatCard;
