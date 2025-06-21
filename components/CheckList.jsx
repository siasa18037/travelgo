import { useEffect, useState } from 'react';
import axios from 'axios';
import { Trash } from 'lucide-react';

export default function CheckList({mode, id_user, id_trip, id_plan }) {
  const [checklist, setChecklist] = useState([]);
  const [newItem, setNewItem] = useState('');

  // Load checklist
  useEffect(() => {
    fetchChecklist();
  }, []);

  const fetchChecklist = async () => {
    try {
      const res = await axios.get(`/api/trip/${id_user}/${id_trip}/plan/${id_plan}/checklist`);
      setChecklist(res.data);
    } catch (err) {
      console.error('Error fetching checklist', err);
    }
  };

  const addChecklistItem = async () => {
    if (!newItem.trim()) return;
    try {
      await axios.post(`/api/trip/${id_user}/${id_trip}/plan/${id_plan}/checklist`, {
        name: newItem,
      });
      setNewItem('');
      fetchChecklist();
    } catch (err) {
      console.error('Error adding item', err);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      await axios.put(`/api/trip/${id_user}/${id_trip}/plan/${id_plan}/checklist`, {
        _id: id,
        status: currentStatus === 'pending' ? 'done' : 'pending',
      });
      fetchChecklist();
    } catch (err) {
      console.error('Error updating status', err);
    }
  };

  const deleteItem = async (id) => {
    try {
      await axios.delete(`/api/trip/${id_user}/${id_trip}/plan/${id_plan}/checklist`, {
        data: { _id: id },
      });
      fetchChecklist();
    } catch (err) {
      console.error('Error deleting item', err);
    }
  };


  return (
    <div className="CheckList">
      {/* Input */}
      {mode=='edit' && (
        <div className="input-group mb-2 ">
            <input
            type="text"
            className="form-control input-outline-dark "
            placeholder="Add new CheckList"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            />
            <button className="btn btn-primary custom-dark-hover" onClick={addChecklistItem}>
            Add
            </button>
        </div>
      )}
      
      {/* List */}
      <ul className="list-group p-0 border border-0">
        {checklist.map((item) => (
            <li
            key={item._id}
            className="list-group-item d-flex justify-content-between align-items-center border-bottom border-start border-end border-secondary"
            >
            <div className="form-check m-0">
                <input
                className="form-check-input mb-0 me-2"
                type="checkbox"
                checked={item.status === 'done'}
                onChange={() => toggleStatus(item._id, item.status)}
                style={{
                    '--bs-form-check-bg': item.status === 'done' ? 'var(--bs-body-color)' : 'var(--bs-body-bg)',
                    '--bs-border-color': 'var(--bs-body-color)',
                    backgroundColor: item.status === 'done' ? 'var(--bs-body-color)' : 'var(--bs-body-bg)',
                    borderColor: 'var(--bs-body-color)',
                }}
                />
                <label className={`form-check-label`}>
                    {item.name}
                </label>
            </div>
            {mode === 'edit' ? (
                <button
                    className="btn btn-sm text-danger"
                    onClick={() => deleteItem(item._id)}
                >
                    <Trash size={16} />
                </button>
                ) : (
                item.status === 'done' && (
                    <button
                    className="btn btn-sm  text-success"
                    disabled
                    >
                    ทำเเล้ว
                    </button>
                )
                )}
            </li>
        ))}
        </ul>

    </div>
  );
}
