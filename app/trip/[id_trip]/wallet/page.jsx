'use client';

import { useEffect, useState } from 'react';
import { useTrip } from '@/components/TripContext';
import Overviewcard from './Overviewcard';
import './wallet.css';
import { Wallet, CheckCircle, XCircle , SquarePen} from 'lucide-react';
import axios from 'axios';

export default function WalletPage() {
  const { userType, userId, id_trip } = useTrip();
  const [transactions, setTransactions] = useState([]);
  const [users, setUsers] = useState([]);

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

  return (
    <div className='WalletPage container'>
      <div className="head mt-3">
        <Overviewcard userId={userId} id_trip={id_trip} />
      </div>

      <div className="button-link mt-2 d-flex align-items-center gap-4">
        <h4 className="d-flex align-items-center mb-0">
          <Wallet size={24} className="me-2" />
          Wallet
        </h4>
        <button className='btn custom-dark-hover'>
          เพิ่มการเงิน
        </button>
      </div>
      

      <div className="table-responsive mt-3">
        <table className="table table-borderless table-custom">
         
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx._id} className='border-bottom align-middle'> 
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
            {transactions.length === 0 && (
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
