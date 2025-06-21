'use client';

import '@/styles/navbar.css'; 
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { UserCircle, LogOut, LayoutDashboard, LogIn, UserPlus , Map, Ticket, Wallet2, Route ,UserRoundCheck ,Moon,Sun} from "lucide-react";
import { logoutUser } from "@/utils/logout"; 
import Cookies from 'js-cookie';

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const res = await fetch("/api/auth/check", { cache: "no-store" });
        const data = await res.json();
        setIsLoggedIn(data.ok);
        if (data.ok) {
          const user = data.user;
          setUser({
            userId: user._id,
            email: user.email,
            name: user.name,
            avatar: user.avatar,
            type_user: user.type_user,
          });
        }
      } catch (error) {
        console.error("Login check failed:", error);
        setIsLoggedIn(false);
        setUser(undefined);
      }
    };
    checkLogin();
  }, []);

  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleLogout = async () => {
    logoutUser();
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const match = pathname.match(/^\/trip\/(?!create$)([^/]+)(\/.*)?$/);
  const isTripPage = !!match;
  const baseTripPath = match ? `/trip/${match[1]}` : "";

  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-bs-theme', newTheme);
    Cookies.set('theme', newTheme, { expires: 30 }); // เก็บ cookie ไว้ 30 วัน
  };

  // โหลดค่าธีมจาก cookie ตอนโหลดหน้า
  useEffect(() => {
    const savedTheme = Cookies.get('theme');
    if (savedTheme === 'dark' || savedTheme === 'light') {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-bs-theme', savedTheme);
    } else {
      // fallback ถ้าไม่มี cookie
      document.documentElement.setAttribute('data-bs-theme', theme);
    }
  }, []);

  return (
    <nav className="navbar fixed-top navbar-expand-lg bg-body-tertiary shadow-sm">
      <div className="container">
        <Link href="/" className="navbar-brand fw-bold">TravelGo</Link>
        <ul className="navbar-nav ms-auto align-items-center gap-2 d-flex flex-row flex-wrap">
          {isLoggedIn && isTripPage && (
            <>
              <li className="nav-item">
                <Link className="nav-link d-flex align-items-center gap-2" href={baseTripPath}>
                  <Map size={18} /> 
                  <span>ThisTrip</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link d-flex align-items-center gap-2" href={`${baseTripPath}/plan`}>
                  <Route size={18} /> 
                  <span>Plan</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link d-flex align-items-center gap-2" href={`${baseTripPath}/ticket`}>
                  <Ticket size={18} /> 
                  <span>Ticket</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link d-flex align-items-center gap-2" href={`${baseTripPath}/wallet`}>
                  <Wallet2 size={18} />
                  <span>Wallet</span>
                </Link>
              </li>
            </>
          )}

          {isLoggedIn && !isTripPage && (
            <li>
              <Link className="dropdown-item d-flex align-items-center gap-2" href="/dashboard">
                <LayoutDashboard size={18} /> 
                dashboard
              </Link>
            </li>
          )}

          {isLoggedIn && (
            <li ref={dropdownRef} className="nav-item dropdown position-relative">
              <div
                className="d-flex align-items-center ms-2"
                onClick={toggleDropdown}
                style={{ cursor: 'pointer' }}
              >
                <img
                  src={user.avatar}
                  width={32}
                  height={32}
                  className="rounded-circle"
                  alt="Avatar"
                />
              </div>

              {dropdownOpen && (
                <ul
                  className="dropdown-menu show"
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '0.5rem',
                    zIndex: 1050,
                  }}
                > 
                  <li>
                    <div className="dropdown-item d-flex align-items-center gap-2">
                      <UserRoundCheck size={18} /> 
                      <label>{user.name}</label>
                    </div>
                  </li>
                  <li>
                    <Link className="dropdown-item d-flex align-items-center gap-2" href="/profile">
                      <UserCircle size={18} /> 
                      <label>Profile</label>
                    </Link>
                  </li>
                  {isTripPage && (
                    <li>
                      <Link className="dropdown-item d-flex align-items-center gap-2" href="/dashboard">
                        <LayoutDashboard size={18} /> 
                        <label>Dashboard</label>
                      </Link>
                    </li>
                  )}
                  <li>
                    <button
                      className="dropdown-item d-flex align-items-center gap-2 "
                      onClick={toggleTheme}
                    >
                      {theme === 'light' ? (
                        <>
                          <Moon size={18}/>
                          <label>Dark mode</label>
                        </>
                        
                      )  : (
                        <>
                          <Sun size={18}/>
                          <label>Light mode</label>
                        </>
                      )}

                      
                    </button>
                  </li>
                  <li>
                    <button
                      className="dropdown-item d-flex align-items-center gap-2 text-danger"
                      onClick={handleLogout}
                    >
                      <LogOut size={18} /> 
                      <label>Logout</label>
                    </button>
                  </li>
                </ul>
              )}
            </li>
          )}

          {!isLoggedIn && (
            <>
              <li className="nav-item">
                <Link className="nav-link d-flex align-items-center gap-2" href="/login">
                  <LogIn size={18} /> 
                  <label>Login</label>
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link d-flex align-items-center gap-2" href="/register">
                  <UserPlus size={18} /> 
                  <label>Register</label>
                </Link>
              </li>
              <li className="nav-item">
                <button
                  className="dropdown-item d-flex align-items-center "
                  onClick={toggleTheme}
                >
                  {theme === 'light' ? (
                    <>
                      <Sun size={18}/>
                    </>
                  )  : (
                    <>
                      <Moon size={18}/>
                    </>
                  )}
                </button>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}
