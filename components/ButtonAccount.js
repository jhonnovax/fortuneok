/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import apiClient from "@/libs/api";

// A button to show user some account actions
//  1. Billing: open a Stripe Customer Portal to manage their billing (cancel subscription, update payment method, etc.).
//     You have to manually activate the Customer Portal in your Stripe Dashboard (https://dashboard.stripe.com/test/settings/billing/portal)
//     This is only available if the customer has a customerId (they made a purchase previously)
//  2. Logout: sign out and go back to homepage
const ButtonAccount = ({ onAddAsset }) => {
  const dropdownRef = useRef(null);
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  async function handleBilling() {
    setIsLoading(true);

    try {
      const { url } = await apiClient.post("/stripe/create-portal", {
        returnUrl: window.location.href,
      });

      window.location.href = url;
    } catch (e) {
      console.error(e);
    }

    setIsLoading(false);
  }

  function handleAddAsset() {
    setOpenDropdown(false);
    onAddAsset();
  }

  function handleLogout() {
    setOpenDropdown(false);
    handleSignOut();
  }

  function handleClickOutside(e) {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setOpenDropdown(false);
    }
  }

  // Handle click outside to close the dropdown
  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Don't show anything if not authenticated (we don't have any info about the user)
  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div ref={dropdownRef} className="dropdown dropdown-end">
      <button type="button" className="btn btn-tertiary" onClick={() => setOpenDropdown(!openDropdown)}>
        {session?.user?.image ? (
              <img
                src={session?.user?.image}
                alt={session?.user?.name || "Account"}
                className="w-6 h-6 rounded-full shrink-0"
                referrerPolicy="no-referrer"
                width={24}
                height={24}
              />
            ) : (
              <span className="w-6 h-6 bg-base-300 flex justify-center items-center rounded-full shrink-0">
                {session?.user?.name?.charAt(0) || session?.user?.email?.charAt(0)}
              </span>
            )}

            <span className="lowercase">
              <span className="md:hidden capitalize">{session?.user?.name || "Account"}</span>
              <span className="hidden md:inline">{session?.user?.email || "Account"}</span>
            </span>

            {isLoading && (
              <span className="loading loading-spinner loading-xs"></span>
            )}
            {!isLoading && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className={`w-5 h-5 duration-200 ${
                  openDropdown ? "transform rotate-180 " : ""
                }`}
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            )}
      </button>
      <ul className={`absolute right-0 z-[1] menu p-2 shadow bg-base-100 rounded-box w-full min-w-40 mt-1 ${openDropdown ? 'block' : 'hidden'}`}>
        <li>
          <button
            className="flex items-center gap-2 hover:bg-base-300 duration-200 py-1.5 px-4 w-full rounded-lg font-medium"
            onClick={handleAddAsset}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Asset
          </button>
        </li>
        <li>
          <button
            className="flex items-center gap-2 hover:bg-error/20 hover:text-error duration-200 py-1.5 px-4 w-full rounded-lg font-medium"
            onClick={handleLogout}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path
                fillRule="evenodd"
                d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z"
                clipRule="evenodd"
              />
              <path
                fillRule="evenodd"
                d="M6 10a.75.75 0 01.75-.75h9.546l-1.048-.943a.75.75 0 111.004-1.114l2.5 2.25a.75.75 0 010 1.114l-2.5 2.25a.75.75 0 11-1.004-1.114l1.048-.943H6.75A.75.75 0 016 10z"
                clipRule="evenodd"
              />
            </svg>
            Logout
          </button>
        </li>
      </ul>
    </div>
  )
};

export default ButtonAccount;
