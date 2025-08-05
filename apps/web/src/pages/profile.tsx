import { type GetServerSidePropsContext } from "next";
import { signOut } from "next-auth/react";
import { getServerAuthSession } from "~/server/auth";
import { useState } from "react";
import { api } from "~/utils/api";
import { useRouter } from "next/router";
import Link from "next/link";
import { SubscriptionStatus } from "@prisma/client";

interface ProfileProps {
  user: {
    id: string;
    email: string | null;
    name: string | null;
    image: string | null;
  };
}

export default function Profile({ user }: ProfileProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name || "");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  
  const { data: subscriptionStatus } = api.subscription.getSubscriptionStatus.useQuery();

  const createCheckoutSession = api.subscription.createCheckoutSession.useMutation({
    onSuccess: async (data) => {
      if (data.url) {
        await router.push(data.url);
      }
    },
    onError: (error) => {
      alert(`Error creating checkout session: ${error.message}`);
    },
  });

  const updateProfile = api.user.updateProfile.useMutation({
    onSuccess: () => {
      setIsEditing(false);
      alert("Profile updated successfully!");
    },
    onError: (error) => {
      alert(`Error updating profile: ${error.message}`);
    },
  });

  const cancelSubscription = api.subscription.cancelSubscription.useMutation({
    onSuccess: () => {
      alert("Subscription will be cancelled at the end of the billing period.");
      void router.reload();
    },
    onError: (error) => {
      alert(`Error cancelling subscription: ${error.message}`);
    },
  });

  const handleSaveProfile = () => {
    updateProfile.mutate({
      name,
      phoneNumber,
      address,
      dateOfBirth,
    });
  };

  return (
    <div style={{ maxWidth: "600px", margin: "50px auto", padding: "20px" }}>
      <h1>Profile</h1>
      
      {user.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img 
          src={user.image} 
          alt="Profile" 
          style={{ width: "100px", height: "100px", borderRadius: "50%", marginBottom: "20px" }} 
        />
      )}

      <div style={{ marginBottom: "20px" }}>
        <strong>Email:</strong> {user.email}
      </div>

      {isEditing ? (
        <>
          <div style={{ marginBottom: "15px" }}>
            <label htmlFor="name" style={{ display: "block", marginBottom: "5px" }}>
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label htmlFor="phoneNumber" style={{ display: "block", marginBottom: "5px" }}>
              Phone Number (will be encrypted)
            </label>
            <input
              id="phoneNumber"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label htmlFor="dateOfBirth" style={{ display: "block", marginBottom: "5px" }}>
              Date of Birth (will be encrypted)
            </label>
            <input
              id="dateOfBirth"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label htmlFor="address" style={{ display: "block", marginBottom: "5px" }}>
              Address (will be encrypted)
            </label>
            <textarea
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
              style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <button
              onClick={handleSaveProfile}
              disabled={updateProfile.isPending}
              style={{
                padding: "10px 20px",
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: updateProfile.isPending ? "not-allowed" : "pointer",
                marginRight: "10px",
              }}
            >
              {updateProfile.isPending ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => setIsEditing(false)}
              style={{
                padding: "10px 20px",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </>
      ) : (
        <>
          <div style={{ marginBottom: "15px" }}>
            <strong>Name:</strong> {user.name || "Not set"}
          </div>

          <button
            onClick={() => setIsEditing(true)}
            style={{
              padding: "10px 20px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              marginBottom: "20px",
            }}
          >
            Edit Profile
          </button>
        </>
      )}

      <hr style={{ margin: "20px 0" }} />

      {/* Subscription Information */}
      {subscriptionStatus && (
        <div style={{ marginBottom: "20px", padding: "20px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
          <h2 style={{ marginBottom: "15px" }}>Subscription</h2>
          {subscriptionStatus.hasSubscription && subscriptionStatus.status === SubscriptionStatus.ACTIVE ? (
            <>
              <p style={{ marginBottom: "10px" }}>
                <strong>Status:</strong> Active ✓
              </p>
              <p style={{ marginBottom: "10px" }}>
                <strong>Valid until:</strong> {subscriptionStatus?.currentPeriodEnd ? 
                  new Date(subscriptionStatus.currentPeriodEnd).toLocaleDateString() : 
                  'N/A'}
              </p>
              {subscriptionStatus?.cancelAtPeriodEnd ? (
                <p style={{ color: "#dc3545", marginBottom: "10px" }}>
                  Will cancel at period end
                </p>
              ) : (
                <button
                  onClick={() => cancelSubscription.mutate()}
                  disabled={cancelSubscription.isPending}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#dc3545",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: cancelSubscription.isPending ? "not-allowed" : "pointer",
                    opacity: cancelSubscription.isPending ? 0.7 : 1,
                  }}
                >
                  {cancelSubscription.isPending ? "Cancelling..." : "Cancel Subscription"}
                </button>
              )}
              
              <div style={{ marginTop: "20px" }}>
                <Link href="/search" style={{
                  padding: "10px 20px",
                  backgroundColor: "#007bff",
                  color: "white",
                  textDecoration: "none",
                  borderRadius: "4px",
                  display: "inline-block",
                }}>
                  Go to Program Search →
                </Link>
              </div>
            </>
          ) : (
            <>
              <p style={{ marginBottom: "15px" }}>No active subscription</p>
              <button
                onClick={() => createCheckoutSession.mutate({})}
                disabled={createCheckoutSession.isPending}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: createCheckoutSession.isPending ? "not-allowed" : "pointer",
                  opacity: createCheckoutSession.isPending ? 0.7 : 1,
                }}
              >
                {createCheckoutSession.isPending ? "Loading..." : "Subscribe Now - $99/year"}
              </button>
            </>
          )}
        </div>
      )}

      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        style={{
          padding: "10px 20px",
          backgroundColor: "#dc3545",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Sign Out
      </button>
    </div>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerAuthSession({ req: context.req, res: context.res });

  if (!session) {
    return {
      redirect: {
        destination: "/auth/signin",
        permanent: false,
      },
    };
  }

  return {
    props: {
      user: session.user,
    },
  };
}