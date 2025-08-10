import { AdminLayout } from "~/components/AdminLayout";
import { api } from "~/utils/api";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import type { FormEvent } from "react";

export default function EditProviderPage() {
  const router = useRouter();
  const { id } = router.query as { id: string };
  
  const { data: provider, isLoading } = api.provider.getById.useQuery(
    { id },
    { enabled: !!id }
  );
  
  const updateProvider = api.provider.update.useMutation({
    onSuccess: () => {
      void router.push("/admin/providers");
    },
  });

  const [formData, setFormData] = useState({
    businessName: "",
    contactName: "",
    description: "",
    website: "",
    email: "",
    phone: "",
    abn: "",
    address: "",
    suburb: "",
    state: "",
    postcode: "",
    logoUrl: "",
    bannerUrl: "",
    capacity: 0,
    ageGroups: "",
    specialNeeds: false,
    specialNeedsDetails: "",
    isVetted: false,
    isPublished: false,
  });

  useEffect(() => {
    if (provider) {
      setFormData({
        businessName: provider.businessName || "",
        contactName: provider.contactName || "",
        description: provider.description || "",
        website: provider.website || "",
        email: provider.email || "",
        phone: provider.phone || "",
        abn: provider.abn || "",
        address: provider.address || "",
        suburb: provider.suburb || "",
        state: provider.state || "",
        postcode: provider.postcode || "",
        logoUrl: provider.logoUrl || "",
        bannerUrl: provider.bannerUrl || "",
        capacity: provider.capacity || 0,
        ageGroups: provider.ageGroups ? JSON.parse(provider.ageGroups).join(", ") : "",
        specialNeeds: provider.specialNeeds || false,
        specialNeedsDetails: provider.specialNeedsDetails || "",
        isVetted: provider.isVetted,
        isPublished: provider.isPublished,
      });
    }
  }, [provider]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    updateProvider.mutate({
      id,
      ...formData,
      ageGroups: formData.ageGroups ? formData.ageGroups.split(",").map((t: string) => t.trim()) : undefined,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  if (isLoading) {
    return (
      <AdminLayout title="Edit Provider">
        <div>Loading...</div>
      </AdminLayout>
    );
  }

  if (!provider) {
    return (
      <AdminLayout title="Edit Provider">
        <div>Provider not found</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={`Edit Provider: ${provider.businessName}`}>
      <div className="mx-auto max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-6 rounded-lg bg-white p-6 shadow">
          {/* Basic Information */}
          <div>
            <h3 className="mb-4 text-lg font-medium text-gray-900">Basic Information</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">
                  Business Name *
                </label>
                <input
                  type="text"
                  id="businessName"
                  name="businessName"
                  required
                  value={formData.businessName}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                  Website
                </label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <h3 className="mb-4 text-lg font-medium text-gray-900">Location</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Address
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="suburb" className="block text-sm font-medium text-gray-700">
                  Suburb
                </label>
                <input
                  type="text"
                  id="suburb"
                  name="suburb"
                  value={formData.suburb}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                  State
                </label>
                <select
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Select State</option>
                  <option value="NSW">New South Wales</option>
                  <option value="VIC">Victoria</option>
                  <option value="QLD">Queensland</option>
                  <option value="WA">Western Australia</option>
                  <option value="SA">South Australia</option>
                  <option value="TAS">Tasmania</option>
                  <option value="ACT">Australian Capital Territory</option>
                  <option value="NT">Northern Territory</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="postcode" className="block text-sm font-medium text-gray-700">
                  Postcode
                </label>
                <input
                  type="text"
                  id="postcode"
                  name="postcode"
                  value={formData.postcode}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Media */}
          <div>
            <h3 className="mb-4 text-lg font-medium text-gray-900">Media</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="logoUrl" className="block text-sm font-medium text-gray-700">
                  Logo URL
                </label>
                <input
                  type="url"
                  id="logoUrl"
                  name="logoUrl"
                  value={formData.logoUrl}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="bannerImageUrl" className="block text-sm font-medium text-gray-700">
                  Banner Image URL
                </label>
                <input
                  type="url"
                  id="bannerImageUrl"
                  name="bannerImageUrl"
                  value={formData.bannerUrl}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div>
            <h3 className="mb-4 text-lg font-medium text-gray-900">Additional Information</h3>
            <div className="space-y-4">
              
              <div>
                <label htmlFor="ageGroups" className="block text-sm font-medium text-gray-700">
                  Age Groups (comma-separated)
                </label>
                <input
                  type="text"
                  id="ageGroups"
                  name="ageGroups"
                  value={formData.ageGroups}
                  onChange={handleChange}
                  placeholder="e.g., 5-7, 8-10, 11-13, 14-17"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Status */}
          <div>
            <h3 className="mb-4 text-lg font-medium text-gray-900">Status</h3>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isVetted"
                  checked={formData.isVetted}
                  onChange={handleChange}
                  className="mr-2 rounded border-gray-300"
                />
                <span className="text-sm font-medium text-gray-700">Mark as Vetted</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isPublished"
                  checked={formData.isPublished}
                  onChange={handleChange}
                  disabled={!formData.isVetted}
                  className="mr-2 rounded border-gray-300"
                />
                <span className="text-sm font-medium text-gray-700">
                  Publish Provider {!formData.isVetted && "(must be vetted first)"}
                </span>
              </label>
            </div>
            
            {provider.vettingDate && (
              <p className="mt-2 text-sm text-gray-500">
                Vetted on {new Date(provider.vettingDate).toLocaleDateString()}
              </p>
            )}
          </div>

          {/* Programs Section */}
          <div>
            <h3 className="mb-4 text-lg font-medium text-gray-900">Programs</h3>
            {provider.programs.length > 0 ? (
              <div className="space-y-2">
                {provider.programs.map((program) => (
                  <div key={program.id} className="flex items-center justify-between rounded border p-3">
                    <div>
                      <p className="font-medium">{program.name}</p>
                      <p className="text-sm text-gray-500">{program.category}</p>
                    </div>
                    <span className={`rounded-full px-2 py-1 text-xs ${
                      program.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                    }`}>
                      {program.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No programs added yet</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateProvider.isPending}
              className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {updateProvider.isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>

          {updateProvider.error && (
            <div className="rounded bg-red-50 p-4 text-sm text-red-600">
              Error: {updateProvider.error.message}
            </div>
          )}
        </form>
      </div>
    </AdminLayout>
  );
}