import React, { useEffect, useState } from "react";
import axios from "axios";
import { Search, Ticket, Trash } from 'lucide-react';
import { showSuccessToast, showErrorToast } from "@/lib/swal";


export default function TicketInputList({ value = [], onChange, userId, id_trip }) {
  const [input, setInput] = useState("");
  const [tickets, setTickets] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [ticketsMap, setTicketsMap] = useState({});
  const [users, setUsers] = useState({});

  useEffect(() => {
    axios
      .get(`/api/trip/${userId}/${id_trip}/ticket_pass?mode=all`)
      .then((res) => {
        setTickets(res.data);
        const map = {};
        res.data.forEach((ticket) => {
          map[ticket._id] = ticket;
        });
        setTicketsMap(map);
      })
      .catch((err) => {
        console.error("โหลดข้อมูลล้มเหลว", err);
        showErrorToast("Failed to load tickets.");
      });
  }, []);

  useEffect(() => {
    axios.get('/api/user')
        .then(res => {
        const map = {};
        res.data.forEach(user => {
            map[user._id] = user.name;
        });
        setUsers(map);
        })
        .catch(err => {
        console.error("โหลดข้อมูลผู้ใช้ล้มเหลว", err);
        showErrorToast("Failed to load users.");
        });
    }, []);

  const handleAddTicket = (ticketId) => {
    if (!value.includes(ticketId)) {
      onChange([...value, ticketId]);
      setInput("");
      setFiltered([]);
      showSuccessToast("Ticket added successfully.");
    }
  };

  const getTicketTypeLabel = (type) => {
        if (type === "public") return "สาธารณะ";
        if (type === "private") return "ในทริปนี้";
        if (users[type]) return users[type];
        return "ไม่ทราบประเภท";
    };


  const handleRemove = (ticketId) => {
    onChange(value.filter((id) => id !== ticketId));
    showSuccessToast("Ticket removed.");
  };

  const handleSearch = (text) => {
    setInput(text);
    if (!text.trim()) return setFiltered([]);
    const lower = text.toLowerCase();
    setFiltered(
      tickets.filter(
        (t) =>
          t.name.toLowerCase().includes(lower) ||
          (t.type && t.type.toLowerCase().includes(lower))
      )
    );
  };

  return (
    <div className="position-relative mb-3">
      <label className="form-label d-flex align-items-center">
        <Ticket size={18} className="me-1" /> Select Ticket
      </label>

      <div className="input-group mb-2">
        <input
          type="text"
          className="form-control input-outline-dark"
          placeholder="Search ticket..."
          value={input}
          onChange={(e) => handleSearch(e.target.value)}
        />
        <button className="btn div-outline-white input-outline-dark d-flex align-items-center" type="button" disabled>
          <Search size={18} />
        </button>
      </div>

      {filtered.length > 0 && (
        <div className="dropdown-menu show w-100 shadow-sm" style={{ maxHeight: '250px', overflowY: 'auto' }}>
          {filtered
            .filter((t) => !value.includes(t._id))
            .map((ticket) => (
              <button
                key={ticket._id}
                className="dropdown-item d-flex align-items-center gap-3"
                type="button"
                onClick={() => handleAddTicket(ticket._id)}
              >
                <img
                  src={ticket.img}
                  alt={ticket.name}
                  className="rounded"
                  style={{ width: "32px", height: "32px", objectFit: "cover" }}
                />
                <div>
                  <div className="fw-semibold">{ticket.name}</div>
                  <div className="text-muted" style={{ fontSize: "0.8rem" }}>
                    {getTicketTypeLabel(ticket.type)}
                  </div>
                </div>
              </button>
            ))}
        </div>
      )}

      {value.length > 0 && (
        <ul className="list-group" style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {value.map((ticketId) => {
            const ticket = ticketsMap[ticketId];
            if (!ticket) return null;

            return (
              <li key={ticketId} className="list-group-item d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-3">
                  <img
                    src={ticket.img}
                    alt={ticket.name}
                    className="rounded"
                    style={{ width: "40px", height: "40px", objectFit: "cover" }}
                  />
                  <div>
                    <div className="fw-semibold">{ticket.name}</div>
                    <div className="text-muted" style={{ fontSize: "0.9rem" }}>
                      {getTicketTypeLabel(ticket.type)}
                    </div>
                  </div>
                </div>
                <button className="btn btn-sm text-danger" onClick={() => handleRemove(ticketId)}>
                  <Trash size={18} />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
