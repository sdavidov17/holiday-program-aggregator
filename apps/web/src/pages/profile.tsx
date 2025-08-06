import { type GetServerSidePropsContext } from "next";
import { signOut } from "next-auth/react";
import { getServerAuthSession } from "~/server/auth";
import { useState } from "react";
import { api } from "~/utils/api";
import Link from "next/link";

interface ProfileProps {
  user: {
    id: string;
    email: string | null;
    name: string | null;
    image: string | null;
  };
}

export default function Profile({ user }: ProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name || "");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");

  const updateProfile = api.user.updateProfile.useMutation({
    onSuccess: () => {
      setIsEditing(false);
      alert("Profile updated successfully!");
    },
    onError: (error) => {
      alert(`Error updating profile: ${error.message}`);
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
      <div style={{ marginBottom: "20px" }}>
        <h2 style={{ marginBottom: "10px" }}>Subscription</h2>
        <Link 
          href="/subscription" 
          style={{
            display: "inline-block",
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "white",
            textDecoration: "none",
            borderRadius: "4px",
            marginBottom: "20px",
          }}
        >
          Manage Subscription →
        </Link>
      </div>

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