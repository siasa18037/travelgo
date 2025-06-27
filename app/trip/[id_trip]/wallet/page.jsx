'use client';

import { useEffect, useState } from 'react';
import { useTrip } from '@/components/TripContext';
import Overviewcard from './Overviewcard';
import './wallet.css';
import { Wallet, CheckCircle, XCircle , SquarePen,Settings2,Search ,X} from 'lucide-react';
import axios from 'axios';

export default function WalletPage() {
  const { userType, userId, id_trip } = useTrip();
  const [transactions, setTransactions] = useState([]);
  const [users, setUsers] = useState([]);
  const [filterType, setFilterType] = useState('ทั้งหมด');
  const [searchText, setSearchText] = useState('');
  const [editmode , setEditmode] = useState(false);
  const [chooseList , setChooseList] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [txRes, userRes] = await Promise.all([
          axios.get(`/api/trip/${userId}/${id_trip}/wallet_transaction`),
          axios.get('/api/user')
        ]);
        setTransactions(txRes.data);
        setUsers(userRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [userId, id_trip]);

  const getUserName = (id) => {
    const user = users.find(u => u._id === id);
    return user ? user.name : 'Unknown';
  };

  const getUserAvatar = (id) => {
    const user = users.find(u => u._id === id);
    return user ? user.avatar : 'Unknown';
  };

  const getLoadStatus = (user_from, user_to, userID) => {
    if (user_from === userID || user_to === userID) {
      if (user_from === userID) {
        return (
          <span className="ms-3 small text-white bg-warning status-pill">
            คุณจะได้เงินคืน
          </span>
        );
      } else {
        return (
          <span className="ms-3 small text-white bg-danger  status-pill">
            คุณต้องคืนเงิน
          </span>
        );
      }
    } else {
      return null;
    }
  };

  const truncate = (str, len = 20) => {
    if (!str) return '';
    return str.length > len ? str.substring(0, len) + '...' : str;
  };
  const formatPrice = (price) => {return new Intl.NumberFormat('th-TH').format(price);};
  const formatDate = (iso) => new Date(iso).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' });

  const filteredTransactions = transactions.filter((tx) => {
    // รวมข้อมูลที่ต้องการค้นหา
    const hostName = getUserName(tx.host).toLowerCase();
    const fromName = getUserName(tx.user_from).toLowerCase();
    const toName = getUserName(tx.user_to).toLowerCase();
    const priceStr = tx.amount.price.toString();
    const timeStr = formatDate(tx.time).toLowerCase();

    // เช็กว่าตรงกับ search ไหม
    const search = searchText.toLowerCase();
    const matchesSearch =
      hostName.includes(search) ||
      fromName.includes(search) ||
      toName.includes(search) ||
      priceStr.includes(search) ||
      timeStr.includes(search) ||
      (tx.description && tx.description.toLowerCase().includes(search));

    // กรองตาม filter
    let matchesFilter = true;
    if (filterType === 'เฉพาะฉัน') {
      matchesFilter = tx.host === userId || tx.user_from === userId || tx.user_to === userId;
    } else if (filterType === 'หนี้ที่ฉันยังไม่คืน') {
      matchesFilter = tx.type === 'loan' && !tx.isPaid && tx.user_to === userId;
    } else if (filterType === 'ใช้จ่ายของฉัน') {
      matchesFilter = tx.type === 'expense' && tx.host === userId;
    } else if (filterType === 'ลูกหนี้ของฉัน') {
      matchesFilter = tx.type === 'loan' && tx.user_from === userId;
    } else if (filterType === 'ลูกหนี้ของฉันที่ยังไม่คืน') {
      matchesFilter = tx.type === 'loan' && tx.user_from === userId && !tx.isPaid ;
    }

    return matchesSearch && matchesFilter;
  });

  const handleSelect = (id, checked) => {
    if (checked) {
      setChooseList((prev) => [...prev, id]);
    } else {
      setChooseList((prev) => prev.filter((item) => item !== id));
    }
  };


  const updateLaodIsPaid = (id_list) => {
    console.log(id_list)
  }

  return (
    <div className='WalletPage container'>
      <div className="head mt-3">
        <Overviewcard userId={userId} id_trip={id_trip} />
      </div>
      <div className="button-link mt-2 d-flex align-items-center justify-content-between gap-4">
        <h4 className="d-flex align-items-center mb-0">
          <Wallet size={24} className="me-2" />
          Wallet
        </h4>
        <button className='btn custom-dark-hover'>
          เพิ่มการเงิน
        </button>
      </div>
      <div className="head border-bottom d-flex flex-wrap align-items-center gap-2 py-2">
          <div className="button-filter d-flex gap-2 flex-wrap">
            {['ทั้งหมด', 'เฉพาะฉัน', 'หนี้ที่ฉันยังไม่คืน', 'ใช้จ่ายของฉัน', 'ลูกหนี้ของฉัน' , 'ลูกหนี้ของฉันที่ยังไม่คืน'].map((label) => (
              <button
                key={label}
                className={`btn btn-sm input-outline-dark ${filterType === label ? 'active' : ''}`}
                onClick={() => setFilterType(label)}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="seach-box ms-auto d-flex align-items-center gap-2">
            <div className="input-group" >
              <input
                type="text"
                className="form-control form-control-sm input-outline-dark"
                placeholder="ค้นหา..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ minWidth: '150px' }}
              />
              <span className="input-group-text input-outline-dark"><Search size={16}/></span>
            </div>
            {editmode ? (
                <>
                <button
                    className="btn btn-sm btn-danger d-flex align-items-center"
                    onClick={() => setEditmode(false)}
                  >
                    <X size={18}/>
                </button>
                <button 
                  className="btn btn-sm btn-success d-flex align-items-center"
                  onClick={() => updateLaodIsPaid(chooseList)}
                >
                    <CheckCircle size={18} />
                    <label className='ms-2 ' style={{minWidth:'90px'}}>คืนเงินหลายชุด</label>
                </button>
                </>
              ) : (
                <button
                    className="btn btn-sm custom-dark-hover d-flex align-items-center"
                    onClick={() => setEditmode(true)}
                  >
                    <CheckCircle size={18} />
                    <label className='ms-2 ' style={{minWidth:'120px'}}>คืนเงินเเบบหลายชุด</label>
                </button>
              )}
          </div>
      </div>
      <div className="table-responsive">
        <table className="table table-borderless table-custom table-hover">
          <tbody>
            {filteredTransactions.map((tx) => (
              <tr key={tx._id} className='border-bottom align-middle'>
                {editmode && (
                  <td>
                    {(tx.user_to && !tx.isPaid) && (
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={chooseList.includes(tx._id)}
                        onChange={(e) => handleSelect(tx._id, e.target.checked)}
                      />
                    )}
                  </td>
                )}
                {tx.type === 'expense' ? (
                  <>
                    <td style={{ width: "20px" }} >
                      <span title="รายจ่าย">
                        <svg height="18" width="18">
                          <circle r="9" cx="9" cy="9" fill="green" />
                        </svg>
                      </span>
                    </td>
                    <td className='small ' style={{ minWidth: "110px" }} >{formatDate(tx.time)}</td>
                    <td className="d-flex align-items-center" style={{ minWidth: "600px" }}>
                      <img
                        src={getUserAvatar(tx.host)}
                        className="rounded-circle me-2"
                        style={{ width: "28px", height: "28px", objectFit: "cover" }}
                      />
                      <div className="fw-medium ">{getUserName(tx.host)}</div>
                      <div className="text-muted ms-3">{tx.description}</div>
                    </td>
                    <td className="text-end" style={{ minWidth: "150px" }}>
                      {formatPrice(tx.amount.price)} {tx.amount.currency}
                    </td>
                    <td style={{ minWidth: "110px", maxWidth: "120px" }}></td>
                    <td > 
                      { tx.host == userId && (<SquarePen size={16} />)}
                    </td>
                  </>
                ) : (
                  <>
                    <td style={{ width: "20px" }}>
                      <span title="ยืมเงิน">
                        <svg height="18" width="18">
                          <circle r="9" cx="9" cy="9" fill="red" />
                        </svg>
                      </span>
                    </td>
                    <td className='small' style={{ minWidth: "110px" }}>{formatDate(tx.time)}</td>
                    <td className="d-flex align-items-center" style={{ minWidth: "600px" }}>
                      <img
                        src={getUserAvatar(tx.user_to)}
                        className="rounded-circle me-2"
                        style={{ width: "28px", height: "28px", objectFit: "cover" }}
                      />
                      <span className="fw-medium text-danger">{getUserName(tx.user_to)}</span>
                      <span className="mx-2">ยืมเงิน</span>
                      <img
                        src={getUserAvatar(tx.user_from)}
                        className="rounded-circle me-2"
                        style={{ width: "28px", height: "28px", objectFit: "cover" }}
                      />
                      <span className="fw-medium text-primary">{getUserName(tx.user_from)}</span>
                      <span className="text-muted ms-3">{truncate(tx.description)}</span>
                      {getLoadStatus(tx.user_from , tx.user_to, userId)}
                    </td>
                    <td className="text-end" style={{ minWidth: "150px" }}>
                      {formatPrice(tx.amount.price)} {tx.amount.currency}
                    </td>
                    <td style={{ minWidth: "110px", maxWidth: "120px" }}>
                      {tx.isPaid ? (
                        <span className="status-pill bg-success text-white">
                          <CheckCircle size={16} /> คืนแล้ว
                        </span>
                      ) : (
                        <span className="status-pill bg-danger text-white">
                          <XCircle size={16} /> ยังไม่คืน
                        </span>
                      )}
                    </td>
                    <td > 
                      { tx.host == userId && (<SquarePen size={16} />)}
                    </td>
                  </>
                )}
              </tr>
            ))}
            {filteredTransactions.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center text-muted py-4">ไม่มีข้อมูล</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
