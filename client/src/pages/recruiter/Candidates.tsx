import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Users, MapPin, Briefcase, Star } from 'lucide-react';
import api from '@/lib/api';

interface Job {
  _id: string;
  title: string;
}

interface Candidate {
  _id: string;
  fullName: string;
  location: string;
  currentJobTitle: string;
  skills: string[];
  experienceYears: number;
  matchScore: number;
}

export default function Candidates() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<string>('');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.get('/recruiters/jobs');
        setJobs(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Failed to fetch jobs:', err);
      }
    };
    fetchJobs();
  }, []);

  useEffect(() => {
    if (selectedJob) {
      fetchCandidates();
    } else {
      setCandidates([]);
    }
  }, [selectedJob]);

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/jobs/match/${selectedJob}`);
      setCandidates(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to fetch candidates:', err);
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Candidates</h1>
          <p className="text-gray-400">Find matching candidates for your job postings</p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">Select a job</label>
          <select
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
            className="input-dark max-w-md"
          >
            <option value="">Choose a job posting...</option>
            {jobs.map((job) => (
              <option key={job._id} value={job._id}>
                {job.title}
              </option>
            ))}
          </select>
        </div>

        {!selectedJob ? (
          <div className="card text-center py-16">
            <div className="w-16 h-16 rounded-full bg-dark-600 flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Select a job</h3>
            <p className="text-gray-400">
              Choose a job posting to see matching candidates
            </p>
          </div>
        ) : loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : candidates.length === 0 ? (
          <div className="card text-center py-16">
            <p className="text-gray-400">No matching candidates found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {candidates.map((candidate) => (
              <div key={candidate._id} className="card">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-white">{candidate.fullName}</h3>
                      <div className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm">
                        <Star className="h-4 w-4" />
                        {candidate.matchScore}% match
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-4">
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-4 w-4" />
                        {candidate.currentJobTitle}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {candidate.location}
                      </span>
                      <span>{candidate.experienceYears} years exp.</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {candidate.skills.slice(0, 6).map((skill) => (
                        <span
                          key={skill}
                          className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                      {candidate.skills.length > 6 && (
                        <span className="px-3 py-1 bg-dark-600 text-gray-400 rounded-full text-sm">
                          +{candidate.skills.length - 6} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
