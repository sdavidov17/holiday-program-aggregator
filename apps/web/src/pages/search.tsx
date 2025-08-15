import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { PremiumFeatureGuard } from '~/components/PremiumFeatureGuard';

const SearchPage: NextPage = () => {
  const { data: session } = useSession();

  return (
    <>
      <Head>
        <title>Search Programs - Holiday Program Aggregator</title>
        <meta name="description" content="Search for holiday programs" />
      </Head>

      <main className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold">Program Search</h1>
            <Link href="/profile" className="text-blue-600 hover:text-blue-800">
              Back to Profile
            </Link>
          </div>

          <PremiumFeatureGuard>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Search Holiday Programs</h2>
              <p className="text-gray-600 mb-6">
                Welcome {session?.user?.name || session?.user?.email}! Use our advanced search to
                find the perfect holiday programs for your children.
              </p>

              {/* Placeholder for search functionality */}
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="location"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Location
                  </label>
                  <input
                    id="location"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter suburb or postcode"
                  />
                </div>

                <div>
                  <label
                    htmlFor="age-group"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Age Group
                  </label>
                  <select
                    id="age-group"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option>Select age group</option>
                    <option>5-7 years</option>
                    <option>8-10 years</option>
                    <option>11-13 years</option>
                    <option>14-16 years</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="activity-type"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Activity Type
                  </label>
                  <select
                    id="activity-type"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option>All activities</option>
                    <option>Sports</option>
                    <option>Arts & Crafts</option>
                    <option>Science & Technology</option>
                    <option>Music & Drama</option>
                    <option>Adventure</option>
                  </select>
                </div>

                <button
                  type="button"
                  className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition"
                >
                  Search Programs
                </button>
              </div>

              <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  This is a demo search interface. Full search functionality will be implemented in
                  Epic 2.
                </p>
              </div>
            </div>
          </PremiumFeatureGuard>
        </div>
      </main>
    </>
  );
};

export default SearchPage;
