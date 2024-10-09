import React from 'react';
import { Category } from '../../types/models';

interface CategoryListProps {
  categories: Category[];
}

export const CategoryList: React.FC<CategoryListProps> = ({ categories }) => {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Categories</h2>
      <ul className="space-y-2">
        {categories.map((category) => (
          <li key={category.id} className="text-gray-700">{category.title}</li>
        ))}
      </ul>
    </div>
  );
};