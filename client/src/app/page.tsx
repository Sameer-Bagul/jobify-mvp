'use client';

import Link from 'next/link';
import { Briefcase, Mail, Users, CheckCircle } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Briefcase className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">JobSeeker Pro</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-gray-600 hover:text-gray-900">
                Login
              </Link>
              <Link
                href="/signup"
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            Land Your Dream Job with
            <span className="text-indigo-600"> Cold Email Automation</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Connect with recruiters, send personalized emails, and track your job applications - all in one platform.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <Link
              href="/signup"
              className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
            >
              Get Started Free
            </Link>
          </div>
        </div>

        <div className="mt-24 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
              <Briefcase className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Browse Jobs</h3>
            <p className="mt-2 text-gray-500">
              Access thousands of job listings from top companies and recruiters.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
              <Mail className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Cold Email Automation</h3>
            <p className="mt-2 text-gray-500">
              Send up to 20 personalized emails daily directly to recruiters with your resume attached.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">For Recruiters</h3>
            <p className="mt-2 text-gray-500">
              Post jobs and find matching candidates with our smart matching algorithm.
            </p>
          </div>
        </div>

        <div className="mt-24 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Pricing</h2>
          <div className="max-w-md mx-auto bg-indigo-50 rounded-lg p-6 border-2 border-indigo-500">
            <h3 className="text-xl font-semibold text-gray-900">Premium Plan</h3>
            <p className="mt-2 text-3xl font-bold text-indigo-600">Rs. 500<span className="text-lg text-gray-500">/month</span></p>
            <ul className="mt-4 space-y-2">
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span>20 cold emails per day</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span>Resume attachment</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span>Email tracking</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span>Unlimited job browsing</span>
              </li>
            </ul>
          </div>
        </div>
      </main>

      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>Copyright 2024 JobSeeker Pro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
