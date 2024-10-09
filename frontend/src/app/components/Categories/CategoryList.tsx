import React from 'react';
import Link from 'next/link';
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
          <li key={category.id} className="text-gray-700">
            <Link href={`/category/${category.title.toLowerCase()}`}>
              <span className="hover:text-blue-500 cursor-pointer">{category.title}</span>
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-4 text-center">
        <button
          className="text-xs text-gray-600 hover:text-blue-500 transition duration-300 ease-in-out focus:outline-none"
        >
          + Add Category
        </button>
      </div>
    </div>
  );
};