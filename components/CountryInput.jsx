import { useState, useEffect } from "react";
import axios from "axios";
import { showSuccessToast, showErrorToast } from "@/lib/swal";
import {Earth , Plus} from 'lucide-react'
export default function CountryInput({ value = [], onChange }) {
  const [input, setInput] = useState("");
  const [countries, setCountries] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selected, setSelected] = useState(value); // 👈 initial from props

  useEffect(() => {
    axios.get("https://restcountries.com/v3.1/all")
      .then(res => {
        const names = res.data.map(c => c.name.common).sort();
        setCountries(names);
      })
      .catch(() => showErrorToast("โหลดชื่อประเทศไม่สำเร็จ"));
  }, []);

  // 👇 Sync props.value to internal state when it changes
  useEffect(() => {
    setSelected(value);
  }, [value]);

  const handleFilter = (value) => {
    setInput(value);
    const suggestions = countries.filter((c) =>
      c.toLowerCase().includes(value.toLowerCase())
    );
    setFiltered(suggestions.slice(0, 5));
  };

  const handleAdd = () => {
    const val = input.trim();
    if (!val) return;

    if (!countries.includes(val)) {
      showErrorToast("ไม่มีประเทศนี้ในรายการ");
      return;
    }

    if (selected.includes(val)) {
      showErrorToast("เพิ่มประเทศนี้ไปแล้ว");
      return;
    }

    const newList = [...selected, val];
    setSelected(newList);
    onChange && onChange(newList);
    setInput("");
    setFiltered([]);
  };

  const removeTag = (name) => {
    const newList = selected.filter((tag) => tag !== name);
    setSelected(newList);
    onChange && onChange(newList);
  };

  const handleDropdownSelect = (name) => {
    setInput(name);
    setFiltered([]);
  };

  return (
    <div className="CountryInput mb-2">
      <label htmlFor="detail" className="form-label d-flex align-items-center">
        <Earth size={18} className="me-1" /> Country 
      </label>
      <div className="position-relative">
        <div className="input-group">
          <input
            type="text"
            className="form-control input-outline-dark"
            placeholder="เลือกประเทศ"
            value={input}
            onChange={(e) => handleFilter(e.target.value)}
          />
          <button type="button" className="btn div-outline-white" onClick={handleAdd}>
            <Plus size={18} />
          </button>
        </div>

        {filtered.length > 0 && (
          <ul className="list-group position-absolute w-100 z-3" style={{ maxHeight: "200px", overflowY: "auto" }}>
            {filtered.map((c, i) => (
              <li
                key={i}
                className="list-group-item list-group-item-action"
                style={{ cursor: "pointer" }}
                onClick={() => handleDropdownSelect(c)}
              >
                {c}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="my-2 d-flex flex-wrap gap-2">
        {selected.map((tag, index) => (
          <span
            key={index}
            className="badge d-flex align-items-center px-2 py-2 "
            style={{
              color: "#212529",
              border: "1px solid #212529",
              fontWeight: "500",
              fontSize: "0.9rem",
            }}
          >
            {tag}
            <button
              type="button"
              className="btn-close btn-sm ms-2"
              aria-label="Close"
              onClick={() => removeTag(tag)}
              style={{
                filter: "invert(0)"
              }}
            ></button>
          </span>
        ))}
      </div>
    </div>
  );
}
