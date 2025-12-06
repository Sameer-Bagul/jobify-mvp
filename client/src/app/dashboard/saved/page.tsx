'use client';

import { Bookmark } from 'lucide-react';

export default function SavedPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Saved Jobs</h1>

      <div className="bg-white rounded-lg shadow p-8 text-center">
        <Bookmark className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-lg font-medium text-gray-900 mb-2">No saved jobs yet</h2>
        <p className="text-gray-500">
          When you save jobs, they will appear here for easy access.
        </p>
      </div>
    </div>
  );
}
