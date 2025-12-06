import { Link } from 'react-router-dom';
import { ArrowRight, Briefcase, Mail, Users, Zap, Shield, TrendingUp } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-dark-900 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-mesh opacity-50" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px]" />

      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
            <Briefcase className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">JobSeeker Pro</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="px-4 py-2 text-gray-300 hover:text-white transition-colors">
            Login
          </Link>
          <Link to="/signup" className="btn-primary flex items-center gap-2">
            Get Started <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-8 pt-20 pb-32">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8">
            <Zap className="h-4 w-4 text-yellow-400" />
            <span className="text-sm text-gray-300">AI-Powered Job Search Platform</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="text-white">Land Your Dream Job</span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-pink-400 bg-clip-text text-transparent">
              With Cold Email Automation
            </span>
          </h1>
          
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
            Connect directly with recruiters, automate your outreach, and stand out from the crowd 
            with personalized cold emails that get responses.
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <Link to="/signup" className="btn-primary text-lg px-8 py-4 flex items-center gap-2">
              Start Free Trial <ArrowRight className="h-5 w-5" />
            </Link>
            <Link to="/login" className="btn-secondary text-lg px-8 py-4">
              Sign In
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-32">
          <div className="card hover:border-purple-500/30 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-purple-600/20 flex items-center justify-center mb-4">
              <Mail className="h-6 w-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Cold Email Automation</h3>
            <p className="text-gray-400">
              Send personalized emails to recruiters with your resume attached. Up to 20 emails per day.
            </p>
          </div>
          
          <div className="card hover:border-blue-500/30 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-blue-600/20 flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Smart Matching</h3>
            <p className="text-gray-400">
              Get matched with jobs based on your skills and experience. Find opportunities that fit you.
            </p>
          </div>
          
          <div className="card hover:border-pink-500/30 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-pink-600/20 flex items-center justify-center mb-4">
              <TrendingUp className="h-6 w-6 text-pink-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Track Progress</h3>
            <p className="text-gray-400">
              Monitor your email campaigns, track responses, and optimize your job search strategy.
            </p>
          </div>
        </div>

        <div className="mt-32 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">For Recruiters</h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Post jobs and find qualified candidates with our skill-based matching algorithm.
          </p>
          <Link 
            to="/signup" 
            className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
          >
            <Shield className="h-5 w-5" />
            Sign up as a recruiter
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>

      <footer className="relative z-10 border-t border-white/5 py-8">
        <div className="max-w-7xl mx-auto px-8 text-center text-gray-500">
          <p>&copy; 2024 JobSeeker Pro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
