'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { User, FileText, Star } from 'lucide-react';
import api from '@/lib/api';

interface Candidate {
  id: number;
  userId: number;
  name: string;
  skills: string[];
  experience: string;
  resumeUrl: string;
  matchScore: number;
  matchingSkills: string[];
}

interface Job {
  id: number;
  title: string;
}

export default function CandidatesPage() {
  const searchParams = useSearchParams();
  const jobId = searchParams.get('jobId');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<string>(jobId || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await api.get('/recruiters/jobs');
        setJobs(response.data);
        if (!selectedJob && response.data.length > 0) {
          setSelectedJob(response.data[0].id.toString());
        }
      } catch (error) {
        console.error('Error fetching jobs:', error);
      }
    };

    fetchJobs();
  }, []);

  useEffect(() => {
    const fetchCandidates = async () => {
      if (!selectedJob) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await api.get(`/jobs/match/${selectedJob}`);
        setCandidates(response.data);
      } catch (error) {
        console.error('Error fetching candidates:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, [selectedJob]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Candidates</h1>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Job to View Matching Candidates
        </label>
        <select
          value={selectedJob}
          onChange={(e) => setSelectedJob(e.target.value)}
          className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">Select a job</option>
          {jobs.map((job) => (
            <option key={job.id} value={job.id}>
              {job.title}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : candidates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {candidates.map((candidate) => (
            <div key={candidate.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {candidate.name || 'Anonymous'}
                    </h3>
                    <div className="flex items-center mt-1">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      <span className="text-sm text-gray-600">
                        {candidate.matchScore}% match
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {candidate.matchingSkills && candidate.matchingSkills.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-2">Matching Skills:</p>
                  <div className="flex flex-wrap gap-1">
                    {candidate.matchingSkills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {candidate.skills && candidate.skills.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-2">All Skills:</p>
                  <div className="flex flex-wrap gap-1">
                    {candidate.skills.slice(0, 5).map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                    {candidate.skills.length > 5 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{candidate.skills.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {candidate.resumeUrl && (
                <a
                  href={candidate.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex items-center text-indigo-600 hover:text-indigo-500 text-sm"
                >
                  <FileText className="h-4 w-4 mr-1" />
                  View Resume
                </a>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">
            {selectedJob
              ? 'No matching candidates found for this job.'
              : 'Select a job to view matching candidates.'}
          </p>
        </div>
      )}
    </div>
  );
}
