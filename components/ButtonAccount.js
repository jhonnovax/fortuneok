/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import apiClient from "@/libs/api";
import ButtonSupport from "@/components/ButtonSupport";

// A button to show user some account actions
//  1. Billing: open a Stripe Customer Portal to manage their billing (cancel subscription, update payment method, etc.).
//     You have to manually activate the Customer Portal in your Stripe Dashboard (https://dashboard.stripe.com/test/settings/billing/portal)
//     This is only available if the customer has a customerId (they made a purchase previously)
//  2. Logout: sign out and go back to homepage
const ButtonAccount = ({ onAddAsset }) => {
  const dropdownRef = useRef(null);
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const menuItemRefs = useRef({});
  const isDashboard = pathname === "/dashboard";

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
      setHighlightedIndex(-1);
    }
  }

  function handleKeyDown(e) {
    // Only handle keys when dropdown is open
    if (!openDropdown) {
      // Allow Tab to work normally when dropdown is closed
      if (e.key === 'Tab') return;
      return;
    }

    const menuItems = [];
    if (isDashboard) {
      menuItems.push('addAsset');
      menuItems.push('support');
    }
    menuItems.push('logout');

    const currentIndex = highlightedIndex;

    switch (e.key) {
      case 'Escape': {
        e.preventDefault();
        setOpenDropdown(false);
        setHighlightedIndex(-1);
        break;
      }
      case 'ArrowDown': {
        e.preventDefault();
        const nextIndex = currentIndex < menuItems.length - 1 ? currentIndex + 1 : 0;
        setHighlightedIndex(nextIndex);
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : menuItems.length - 1;
        setHighlightedIndex(prevIndex);
        break;
      }
      case 'Enter': {
        if (currentIndex >= 0 && currentIndex < menuItems.length) {
          e.preventDefault();
          if (menuItems[currentIndex] === 'addAsset') {
            handleAddAsset();
          } else if (menuItems[currentIndex] === 'support') {
            const supportLink = menuItemRefs.current[currentIndex];
            if (supportLink) {
              supportLink.click();
            }
          } else if (menuItems[currentIndex] === 'logout') {
            handleLogout();
          }
        }
        break;
      }
      default:
        break;
    }
  }

  // Handle click outside to close the dropdown
  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Reset highlighted index when dropdown opens/closes
  useEffect(() => {
    if (openDropdown) {
      setHighlightedIndex(0);
    } else {
      setHighlightedIndex(-1);
    }
  }, [openDropdown]);

  // Focus management for keyboard navigation
  useEffect(() => {
    if (openDropdown && highlightedIndex >= 0) {
      const menuItem = menuItemRefs.current[highlightedIndex];
      if (menuItem) {
        menuItem.focus();
      }
    }
  }, [highlightedIndex, openDropdown]);

  // Don't show anything if not authenticated (we don't have any info about the user)
  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div 
      ref={dropdownRef} 
      className="dropdown dropdown-end"
      onKeyDown={handleKeyDown}
    >
      <button 
        type="button" 
        className="btn btn-tertiary focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus:ring-2 focus:ring-black focus:ring-offset-2" 
        onClick={() => setOpenDropdown(!openDropdown)}
        aria-expanded={openDropdown}
        aria-haspopup="true"
        tabIndex={0}
      >
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
      <ul 
        className={`absolute right-0 z-[1] menu p-2 shadow bg-base-100 rounded-box w-full min-w-40 mt-1 ${openDropdown ? 'block' : 'hidden'}`}
        role="menu"
      >
        {isDashboard && (
          <>
            <li role="menuitem">
              <button
                className={`flex items-center gap-2 hover:bg-base-300 duration-200 py-1.5 px-4 w-full rounded-lg font-medium ${highlightedIndex === 0 ? 'bg-base-300' : ''}`}
                onClick={handleAddAsset}
                ref={(ref) => {
                  menuItemRefs.current[0] = ref;
                }}
                onMouseEnter={() => setHighlightedIndex(0)}
                tabIndex={highlightedIndex === 0 ? 0 : -1}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Add Asset
              </button>
            </li>
            <li role="menuitem">
              <ButtonSupport 
                className="w-full hover:bg-base-300" 
                onClick={() => setOpenDropdown(false)}
                ref={(ref) => {
                  menuItemRefs.current[1] = ref;
                }}
                onMouseEnter={() => setHighlightedIndex(1)}
                tabIndex={highlightedIndex === 1 ? 0 : -1}
              />
            </li>
          </>
        )}
        <li role="menuitem">
          <button
            className={`flex items-center gap-2 hover:bg-error/20 duration-200 py-1.5 px-4 w-full rounded-lg font-medium ${highlightedIndex === (isDashboard ? 2 : 0) ? 'bg-error/20' : ''}`}
            onClick={handleLogout}
            ref={(ref) => {
              menuItemRefs.current[isDashboard ? 2 : 0] = ref;
            }}
            onMouseEnter={() => setHighlightedIndex(isDashboard ? 2 : 0)}
            tabIndex={highlightedIndex === (isDashboard ? 2 : 0) ? 0 : -1}
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
