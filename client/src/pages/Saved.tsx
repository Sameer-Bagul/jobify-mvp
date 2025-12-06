import Layout from '@/components/Layout';
import { Bookmark } from 'lucide-react';

export default function Saved() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Saved Jobs</h1>
          <p className="text-gray-400">Jobs you've bookmarked for later</p>
        </div>

        <div className="card text-center py-16">
          <div className="w-16 h-16 rounded-full bg-dark-600 flex items-center justify-center mx-auto mb-4">
            <Bookmark className="h-8 w-8 text-gray-500" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No saved jobs yet</h3>
          <p className="text-gray-400 mb-6">
            Browse jobs and save the ones you're interested in
          </p>
          <a href="/dashboard/jobs" className="btn-primary inline-flex">
            Browse Jobs
          </a>
        </div>
      </div>
    </Layout>
  );
}
