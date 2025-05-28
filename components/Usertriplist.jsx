import React, { useEffect, useState } from "react";
import axios from "axios";
import { Search, Users} from 'lucide-react';
import { showSuccessToast, showErrorToast } from "@/lib/swal";

export default function UserSelectList({ value = [], onChange, userId_host }) {
  const [input, setInput] = useState("");
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [usersMap, setUsersMap] = useState({});

  useEffect(() => {
    axios
      .get("/api/user")
      .then((res) => setUsers(res.data))
      .catch((err) => console.error("โหลดข้อมูลผู้ใช้ล้มเหลว", err));
  }, []);

  useEffect(() => {
    const map = {};
    value.forEach((u) => {
      const found = users.find((user) => user._id === u.id_user);
      if (found) map[u.id_user] = found;
    });
    setUsersMap(map);
  }, [value, users]);

  const handleAddUser = (user) => {
    if (value.some((u) => u.id_user === user._id)) return;
    onChange([...value, { id_user: user._id, type: "user" }]);
    setInput("");
    setFiltered([]);
    showSuccessToast('เพิ่ม User สำเร็จ')
  };

  const handleRemove = (userId) => {
    if (userId === userId_host) return;
    onChange(value.filter((u) => u.id_user !== userId));
    showSuccessToast('ลบ User สำเร็จ')
  };

  const handleTypeChange = (userId, newType) => {
    const updated = value.map((u) =>
      u.id_user === userId ? { ...u, type: newType } : u
    );
    onChange(updated);
  };

  const handleSearch = (text) => {
    setInput(text);
    if (!text.trim()) return setFiltered([]);
    const lower = text.toLowerCase();
    setFiltered(
      users.filter(
        (u) =>
          u.name.toLowerCase().includes(lower) ||
          u.email.toLowerCase().includes(lower)
      )
    );
  };

  return (
    <div className="position-relative mb-3">
        <label htmlFor="description" className="form-label d-flex align-items-center">
            <Users size={18} className="me-1" /> Member
        </label>

        <div className="position-relative">
            <div className="input-group">
            <input
                type="text"
                className="form-control mb-2 input-outline-dark"
                placeholder="ค้นหาผู้ใช้..."
                value={input}
                onChange={(e) => handleSearch(e.target.value)}
            />
            <button className="btn mb-2 div-outline-white" disabled>
                <Search size={18} />
            </button>
            </div>
        </div>

    {filtered.length > 0 && (
        <div className="dropdown-menu show w-100 shadow-sm" style={{ maxHeight: '250px', overflowY: 'auto' }}>
        {filtered
            .filter((user) => !value.some((u) => u.id_user === user._id)) 
            .map((user) => (
            <button
                key={user._id}
                className="dropdown-item d-flex align-items-center justify-content-between"
                type="button"
                onClick={() => handleAddUser(user)}
            >
                <div className="d-flex align-items-center gap-3">
                <img
                    src={user.avatar}
                    alt={user.name}
                    className="rounded-circle"
                    style={{ width: "32px", height: "32px", objectFit: "cover" }}
                />
                <div>
                    <div className="fw-semibold">{user.name}</div>
                    <div className="text-muted" style={{ fontSize: "0.8rem" }}>
                    {user.email}
                    </div>
                </div>
                </div>
            </button>
            ))}
        </div>
    )}

      {value.length > 0 && (
        <>
          <ul className="list-group " style={{ maxHeight: '400px', overflowY: 'auto'}}>
            {value.map((u) => {
              const user = usersMap[u.id_user];
              if (!user) return null;

              return (
                <li
                  key={u.id_user}
                  className="list-group-item d-flex align-items-center justify-content-between"
                >
                  <div className="d-flex align-items-center gap-3">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="rounded-circle"
                      style={{
                        width: "40px",
                        height: "40px",
                        objectFit: "cover",
                      }}
                    />
                    <div>
                      <div className="fw-semibold">{user.name}</div>
                      <div className="text-muted" style={{ fontSize: "0.9rem" }}>
                        {user.email}
                      </div>
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-3">
                    {u.id_user == userId_host && (
                       <div className="text-muted" style={{ fontSize: "0.9rem" }}>
                        Admin(Owner)
                      </div>
                    )}
                    {u.id_user !== userId_host && (
                    <>
                        <select
                            className="form-select form-select-sm"
                            value={u.type}
                            onChange={(e) =>
                                handleTypeChange(u.id_user, e.target.value)
                            }
                            >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                        <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleRemove(u.id_user)}
                        >
                            ลบ
                        </button>
                    </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
