'use client';

import { useEffect, useState, useCallback } from 'react'; // 1. เพิ่ม useCallback
import { useTrip } from '@/components/TripContext';
import Overviewcard from './Overviewcard';
import './wallet.css';
import { Wallet, CheckCircle, XCircle, SquarePen, Settings2, Search, X } from 'lucide-react';
import axios from 'axios';
import CreateWallet from '@/components/CreateWallet';
import ShowDetailBox from './ShowDetailBox'
import { showErrorToast , showSuccessToast, confirmBox} from "@/lib/swal";

export default function WalletPage() {
  const { userType, userId, id_trip } = useTrip();
  const [transactions, setTransactions] = useState([]);
  const [users, setUsers] = useState([]);
  const [filterType, setFilterType] = useState('ทั้งหมด');
  const [searchText, setSearchText] = useState('');
  const [editmode, setEditmode] = useState(false);
  const [chooseList, setChooseList] = useState([]);
  const [showCreateWallet, setShowCreateWallet] = useState(false);
  const [showShowDetailBox, setShowShowDetailBox] = useState(false);
  const [overview, setOverview] = useState(null);
  const [exchangeRates , setExchangeRates] = useState(null);
  const [isLoading,setIsLoading] = useState(false)
  const [showDetailData , setShowDetailData] = useState(null);

  const fetchData = useCallback(async () => {
    if (!userId || !id_trip) return; 
    try {
      const [txRes, userRes , overviewRes] = await Promise.all([
        axios.get(`/api/trip/${userId}/${id_trip}/wallet_transaction`),
        axios.get(`/api/trip/${userId}/${id_trip}/user`),
        axios.get(`/api/trip/${userId}/${id_trip}/wallet_transaction/overview`),
      ]);
      setTransactions(txRes.data);
      setUsers(userRes.data);
      setOverview(overviewRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }finally{
        setIsLoading(false)
    }
  }, [userId, id_trip]); 

  useEffect(() => {
    setIsLoading(true)
    fetchData();
  }, [fetchData]); 

  const handleCreateSuccess = () => {
    fetchData(); 
    setShowCreateWallet(false); 
  };

  useEffect(() => {
    const fetchRates = async () => {
      try {
        console.log("Fetching currency rates once...");
        const response = await axios.get('https://api.frankfurter.app/latest?from=THB');
        setExchangeRates(response.data.rates);
      } catch (error) {
        console.error("Failed to fetch currency rates on mount:", error);
        showErrorToast("ไม่สามารถโหลดอัตราแลกเปลี่ยนได้");
      }
    };
    fetchRates();
  }, []); 

  const getUserName = (id) => {
    const user = users.find(u => u._id === id);
    return user ? user.name : 'Unknown';
  };

  const getUserAvatar = (id) => {
    const user = users.find(u => u._id === id);
    return user ? user.avatar : '/images/userprofile.jpg';
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
    const hostName = getUserName(tx.host).toLowerCase();
    const fromName = getUserName(tx.user_from).toLowerCase();
    const toName = getUserName(tx.user_to).toLowerCase();
    const priceStr = tx.amount.price.toString();
    const timeStr = formatDate(tx.time).toLowerCase();
    const search = searchText.toLowerCase();
    const matchesSearch =
      hostName.includes(search) ||
      fromName.includes(search) ||
      toName.includes(search) ||
      priceStr.includes(search) ||
      timeStr.includes(search) ||
      (tx.description && tx.description.toLowerCase().includes(search));

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

  const updateLaodIsPaid = async (id_list) => {
      if (id_list.length === 0) {
        showErrorToast("กรุณาเลือกรายการที่ต้องการอัปเดต");
        return;
      }

      // 3. ตรวจสอบว่า State exchangeRates โหลดเสร็จหรือยัง
      if (!exchangeRates) {
        showErrorToast("ยังไม่สามารถโหลดอัตราแลกเปลี่ยนได้, กรุณาลองใหม่อีกครั้ง");
        return;
      }

      let totalAmountInTHB = 0;
      const selectedTransactions = transactions.filter(tx => id_list.includes(tx._id));

      // 4. คำนวณยอดรวมโดยใช้ข้อมูลจาก State exchangeRates
      for (const tx of selectedTransactions) {
        const { price, currency } = tx.amount;
        if (currency === 'THB') {
          totalAmountInTHB += price;
        } else {
          if (exchangeRates[currency]) {
            const amountInTHB = price / exchangeRates[currency];
            totalAmountInTHB += amountInTHB;
          } else {
            showErrorToast(`ไม่พบอัตราแลกเปลี่ยนสำหรับ ${currency}`);
            return;
          }
        }
      }

      const formattedTotal = new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(totalAmountInTHB);

      let result
      result = await confirmBox({
        title: `ที่ต้องชำระคือ ${formattedTotal}`,
        text: `คุณต้องการยืนยันการคืนหรือไม่?`,
        icon: 'question',
        confirmButtonText: 'ใช่, ยืนยัน',
        cancelButtonText: 'ยกเลิก',
      });

      if (result.isConfirmed) {
        try {
          await axios.put(`/api/trip/${userId}/${id_trip}/wallet_transaction`, id_list);
          showSuccessToast("อัปเดตรายการสำเร็จ!");
          fetchData();
          handleCancelEditMode();
        } catch (error) {
          showErrorToast("เกิดข้อผิดพลาดในการอัปเดต");
          console.error("Update error:", error);
        }
      }
    };

  const handleCancelEditMode = () => {
    setEditmode(false); 
    setChooseList([]);  
  };

  const handleDetailUpdateSuccess = () => {
      fetchData();
      setShowShowDetailBox(false);
  };

  const showdetailbox = (transaction_id) => {
      const transactionData = transactions.find(tx => tx._id === transaction_id);
      if (transactionData) {
          setShowDetailData(transactionData);
          setShowShowDetailBox(true);
      } else {
          console.error("Transaction not found!");
          showErrorToast("ไม่พบข้อมูลรายการนี้");
      }
  }

  return (
    <>
      <div className='WalletPage container'>
        <div className="head mt-3">
          <Overviewcard userId={userId} id_trip={id_trip} overview={overview} />
        </div>
        <div className="button-link mt-2 d-flex align-items-center justify-content-between gap-4">
          <h4 className="d-flex align-items-center mb-0">
            <Wallet size={24} className="me-2" />
            Wallet
          </h4>
          <button className='btn custom-dark-hover' onClick={() => setShowCreateWallet(true)}>
            เพิ่มการเงิน
          </button>
        </div>
        <div className="head border-bottom d-flex flex-wrap align-items-center gap-2 py-2">
          {/* ✅ เปลี่ยน flex-wrap เป็น nowrap และเพิ่ม overflow-x */}
          <div
            className="button-filter d-flex gap-2 py-1"
            style={{
              overflowX: 'auto',
              whiteSpace: 'nowrap',
              flexWrap: 'nowrap',
              scrollbarWidth: 'thin',
              paddingBottom: '4px',
            }}
          >
            {['ทั้งหมด', 'เฉพาะฉัน', 'หนี้ที่ฉันยังไม่คืน', 'ใช้จ่ายของฉัน', 'ลูกหนี้ของฉัน', 'ลูกหนี้ของฉันที่ยังไม่คืน'].map(
              (label) => (
                <button
                  key={label}
                  className={`btn btn-sm input-outline-dark ${
                    filterType === label ? 'active' : ''
                  }`}
                  onClick={() => {
                    setFilterType(label);
                    setChooseList([]);
                  }}
                  style={{ flexShrink: 0 }} // ✅ ป้องกันปุ่มย่อ
                >
                  {label}
                </button>
              )
            )}
          </div>

          <div className="seach-box ms-auto d-flex align-items-center gap-2 flex-shrink-0 mt-md-0">
            <div className="input-group">
              <input
                type="text"
                className="form-control form-control-sm input-outline-dark"
                placeholder="ค้นหา..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ minWidth: '150px' }}
              />
              <span className="input-group-text input-outline-dark">
                <Search size={16} />
              </span>
            </div>

            {editmode ? (
              <>
                <button
                  className="btn btn-sm btn-danger d-flex align-items-center"
                  onClick={handleCancelEditMode}
                >
                  <X size={18} />
                </button>
                <button
                  className="btn btn-sm btn-success d-flex align-items-center"
                  onClick={() => updateLaodIsPaid(chooseList)}
                >
                  <CheckCircle size={18} />
                  <label className="ms-2" style={{ minWidth: '90px' }}>
                    คืนเงินหลายชุด
                  </label>
                </button>
              </>
            ) : (
              <button
                className="btn btn-sm custom-dark-hover d-flex align-items-center"
                onClick={() => setEditmode(true)}
              >
                <CheckCircle size={18} />
                <label className="ms-2" style={{ minWidth: '120px' }}>
                  คืนเงินแบบหลายชุด
                </label>
              </button>
            )}
          </div>
        </div>
        <div className="table-responsive">
          <table className="table table-borderless table-custom table-hover">
            <tbody>
              {filteredTransactions.map((tx) => (
                // main tr
                <tr key={tx._id} className='border-bottom align-middle' onClick={() => showdetailbox(tx._id)}>
                  {editmode && (
                    <td>
                      {(tx.user_to == userId && !tx.isPaid) && (
                       <input
                          className="form-check-input"
                          type="checkbox"
                          checked={chooseList.includes(tx._id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleSelect(tx._id, e.target.checked);
                          }}
                          onClick={(e) => e.stopPropagation()}
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
                      <td className='small ' style={{ minWidth: "120px" }} >{formatDate(tx.time)}</td>
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
                      <td className='small' style={{ minWidth: "120px" }}>{formatDate(tx.time)}</td>
                      <td className="d-flex align-items-center" style={{ minWidth: "600px" }}>
                        <img
                          src={getUserAvatar(tx.user_to)}
                          className="rounded-circle me-2"
                          style={{ width: "28px", height: "28px", objectFit: "cover" }}
                        />
                        <span className="fw-medium text-danger">{getUserName(tx.user_to)}</span>
                        <span className="mx-2">ยืมเงิน</span>
                        <img
                          src={getUserAvatar(tx.user_from) }
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
              {isLoading && (
                <tr>
                  <td colSpan="5" className="text-center text-muted py-4">
                    <div className="spinner-border spinner-border-sm" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <label className='ms-2'>Loading...</label>
                  </td>
                </tr>
              )}
              {(filteredTransactions.length === 0 && !isLoading) && (
                <tr>
                  <td colSpan="5" className="text-center text-muted py-4">ไม่มีข้อมูล</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {showCreateWallet && (
        <CreateWallet
          userId={userId}
          id_trip={id_trip}
          user_list={users}
          onClose={() => setShowCreateWallet(false)}
          onSuccess={handleCreateSuccess}
        />
      )}
      {showShowDetailBox && (
          <ShowDetailBox
              userId={userId}
              id_trip={id_trip}
              onClose={() => setShowShowDetailBox(false)}
              onSuccess={handleDetailUpdateSuccess}
              data={showDetailData}
              user_list={users}
              exchangeRates = {exchangeRates}
          />
      )}
    </>
  );
}