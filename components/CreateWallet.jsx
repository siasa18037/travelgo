import { useEffect, useState } from "react";
import { MoveRight, Users, X ,CircleDollarSign ,NotebookPen,NotebookText} from "lucide-react";
import { showSuccessToast, showErrorToast } from "@/lib/swal";
import Select from 'react-select';
import axios from 'axios';

// รับ userId เข้ามาเพื่อใช้กรอง
export default function CreateWallet({ userId, id_trip, id_plan = '', onClose , user_list , onSuccess }) {
  const [type, setType] = useState('loan')
  const [loanMode, setLoanMode] = useState('lend') //lend , borrow
  const [note, setNote] = useState('')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState({
    price: '',
    currency: "THB",
  })
  const [userBorrowList, setUserBorrowList] = useState([])
  const [userLend, setUserLend] = useState('')
  const [currencies, setCurrencies] = useState([]); 
  const [loanBorrowProportion , setLoanBorrowProportion] = useState(1)
  const [isLoading,setIsLoading] = useState(false)
  
    const handleSubmit = async () => {
        
        
        
        if (!amount.price || parseFloat(amount.price) <= 0) {
            showErrorToast("กรุณากรอกจำนวนเงินให้ถูกต้อง");
            return;
        }
        if (!description) {
        showErrorToast("กรุณากรอก Description");
        return;
        }

        let data_list = [];

        // สร้าง object พื้นฐานก่อน
        const baseData = {
            description: description,
            note: note,
            isPaid: false, // จะถูก override ทีหลังถ้าเป็น expense
        };

        // เพิ่ม plan_id เข้าไปถ้ามีค่าเท่านั้น
        if (id_plan) {
            baseData.plan_id = id_plan;
        }

        if (type === 'loan') {
            if (loanMode === 'borrow') {
                const data = {
                    ...baseData,
                    type: 'loan',
                    host: userId,
                    user_from: userLend,
                    user_to: userId,
                    amount: { ...amount, price: parseFloat(amount.price) },
                };
                data_list.push(data);
            } else { // loanMode === 'lend'
                const pricePerPerson = parseFloat(amount.price) / (loanBorrowProportion + 1);
                for (let i = 0; i < userBorrowList.length; i++) {
                    const data = {
                        ...baseData,
                        type: 'loan',
                        host: userId,
                        user_from: userId,
                        user_to: userBorrowList[i],
                        amount: { ...amount, price: pricePerPerson },
                    };
                    data_list.push(data);
                }
            }
        } else { // type === 'expense'
            const data = {
                ...baseData,
                type: 'expense',
                host: userId,
                user_from: userId,
                amount: { ...amount, price: parseFloat(amount.price) },
                isPaid: true, // สำหรับ expense
            };
            data_list.push(data);
        }
        setIsLoading(true)
        try {
            await axios.post(`/api/trip/${userId}/${id_trip}/wallet_transaction`, data_list);
            showSuccessToast("เพิ่มรายการสำเร็จ");
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Failed to create transaction:", error);
            showErrorToast(error.response?.data?.message || "Failed to create transaction");
        }finally{
            setIsLoading(false)
        }
    };

  // --- 1. กรอง user_list เพื่อเอา user ปัจจุบันออก ---
  const filteredUserList = user_list.filter(user => user._id !== userId);


  const formatOptionLabel = ({ value, label, avatar }) => (
    <div style={{ display: "flex", alignItems: "center" }}>
      <img
        src={avatar}
        alt={label}
        style={{
          width: "24px",
          height: "24px",
          borderRadius: "50%",
          marginRight: "10px",
          objectFit: "cover"
        }}
      />
      <span>{label}</span>
    </div>
  );

  // --- 2. ใช้ filteredUserList แทน user_list เดิม ---
  const userOptions = filteredUserList.map(user => ({
    value: user._id,
    label: user.name,
    avatar: user.avatar
  }));

 useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const response = await axios.get('https://api.frankfurter.app/latest?from=THB');
        const currencyKeys = Object.keys(response.data.rates);
        setCurrencies(['THB', ...currencyKeys].sort());
      } catch (error) {
        console.error("Failed to fetch currencies:", error);
        setCurrencies(['THB', 'USD', 'EUR', 'JPY', 'GBP' , 'CNY']);
        showErrorToast("ไม่สามารถโหลดรายการสกุลเงินได้");
      }
    };
    fetchCurrencies();
  }, []);

  console.log(amount)

  return (
    <div className="overlay" onClick={onClose} >
      <div
        className="CreateWallet card p-3 bg-body rounded"
        onClick={(e) => e.stopPropagation()}
        style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        maxWidth: "500px", 
        width: "100%" 
        }}
    >
        {/* ... (ส่วนหัวและปุ่มเลือกประเภทเหมือนเดิม) ... */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">Create Transaction</h5>
          <button className="btn btn-sm" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="mb-2">
            <div className="btn-group btn-group-toggle w-100" data-toggle="buttons">
                <button
                    className={`btn btn-secondary w-100 input-outline-dark d-flex align-items-center justify-content-center ${type === 'loan' ? 'active bg-black' : ''}`}
                    onClick={() => setType('loan')}
                >
                    <span >กู้ยืมเงิน</span>
                </button>
                <button
                    className={`btn btn-secondary w-100 input-outline-dark d-flex align-items-center justify-content-center ${type === 'expense' ? 'active bg-black' : ''}`}
                    onClick={() => setType('expense')}
                >
                    <span >บันทึกรายจ่าย</span>
                </button>
            </div>
        </div>


        {type === "loan" && (
          <>
            <div className="mb-3">
                <div className="btn-group btn-group-toggle w-100" data-toggle="buttons">
                    <button
                        className={`btn btn-secondary w-100 input-outline-dark d-flex align-items-center justify-content-center ${loanMode === 'lend' ? 'active bg-black' : ''}`}
                        onClick={() => setLoanMode('lend')}
                    >
                        <span className="text-success">ให้ยืม</span>
                    </button>
                    <button
                        className={`btn btn-secondary w-100 input-outline-dark d-flex align-items-center justify-content-center ${loanMode === 'borrow' ? 'active bg-black' : ''}`}
                        onClick={() => setLoanMode('borrow')}
                    >
                        <span className="text-danger">ยืมเงิน</span>
                    </button>
                </div>
            </div>
            <div className="mb-3">
                <div className="tittle d-flex align-items-center gap-2 mb-2">
                    <Users size={18} />
                    <label className="form-label mb-0">{loanMode === 'lend' ? 'เลือกลูกหนี้' : 'เลือกเจ้าหนี้'}</label>
                </div>
                
                {loanMode === 'lend' ? (
                    <>
                    <div className="d-flex flex-wrap gap-2">
                        {/* --- 3. ใช้ filteredUserList ในการ map ปุ่ม --- */}
                        {filteredUserList.map((user) => (
                        <button
                            key={user._id}
                            type="button"
                            className={`btn btn-sm ${userBorrowList.includes(user._id) ? 'btn-success' : 'btn-outline-secondary'}`}
                            onClick={() => {
                            if (userBorrowList.includes(user._id)) {
                                setUserBorrowList(userBorrowList.filter((id) => id !== user._id));
                            } else {
                                setUserBorrowList([...userBorrowList, user._id]);
                            }
                            }}
                        >
                            <img
                            src={user.avatar}
                            alt={user.name}
                            className="rounded-circle me-1"
                            style={{ width: "24px", height: "24px", objectFit: "cover" }}
                            />
                            {user.name}
                        </button>
                        ))}
                    </div>
                    </>
                ) : (
                   <Select
                        // options จะถูกสร้างจาก filteredUserList อยู่แล้ว
                        options={userOptions}
                        formatOptionLabel={formatOptionLabel}
                        value={userOptions.find(option => option.value === userLend)}
                        onChange={(selectedOption) => setUserLend(selectedOption ? selectedOption.value : '')}
                        placeholder="เลือกเจ้าหนี้..."
                        isClearable
                    />
                )}
                </div>
          </>
        )}

        {/* price */}
        <div className="mb-2">
            <label className="form-label d-flex align-items-center">
                <CircleDollarSign size={18} className="me-1" /> Price
            </label>
            <div className="input-group overflow-hidden">
                <span className="input-group-text input-outline-dark">ราคา</span>
                <input 
                type="number" 
                min={0}
                className="form-control input-outline-dark" 
                value={amount.price}
                onChange={(e) => setAmount({
                    ...amount,
                    price: e.target.value
                    }
                )}
                />
                <select
                className="form-select input-outline-dark"
                value={amount.currency}
                onChange={(e) => setAmount({
                    ...amount,
                    currency: e.target.value
                    }
                )}
                >
                {currencies.map((code) => (
                    <option key={code} value={code}>
                    {code}
                    </option>
                ))}
                </select>
            </div>
        </div>


        {/* more option for loan */}
        {(loanMode == "lend" && type=='loan') && (
        <div className="mb-2">
            <div className="tittle d-flex align-items-center gap-1">
                <Users size={15} />
                <label className="form-label mb-0 small">ลูกหนี้ {userBorrowList.length} คน</label>
            </div>
            { (userBorrowList.length) > 1 && (
            <div className="btn-group btn-group-toggle w-100 mt-2" data-toggle="buttons">
                <button
                    className={`btn btn-secondary w-100 input-outline-dark d-flex align-items-center justify-content-center ${loanBorrowProportion == 1 ? 'active bg-black' : ''}`}
                    onClick={() => setLoanBorrowProportion(1)}
                >
                    <span className="">คนละ</span>
                </button>
                <button
                    className={`btn btn-secondary w-100 input-outline-dark d-flex align-items-center justify-content-center ${loanBorrowProportion == userBorrowList.length ? 'active bg-black' : ''}`}
                    onClick={() => setLoanBorrowProportion(userBorrowList.length)}
                >
                    <span className="">หารกัน (รวมฉัน)</span>
                </button>
            </div>
            )}
        </div>
        )}

        {/* description */}
        <div className="mb-2">
          <div className="tittle d-flex align-items-center gap-1 mb-1">
            <NotebookText size={15} />
            <label className="form-label mb-0">Description</label>
          </div>
          <input
            placeholder="จ่ายค่าข้าว"
            className="form-control form-control-sm input-outline-dark"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        
        {/* Note */}
        <div className="mb-2">
          <div className="tittle d-flex align-items-center gap-1 mb-1">
            <NotebookPen size={15} />
            <label className="form-label mb-0">Note</label>
          </div>
          <textarea
            className="form-control form-control-sm input-outline-dark"
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
        
        <div className="mt-2">
          <button
            type="button"
            className="btn custom-dark-hover w-100 d-flex align-items-center justify-content-center p-2"
            disabled={isLoading}
            onClick={() => handleSubmit()}
            >
            {isLoading ? (
                <>
                <div className="spinner-border spinner-border-sm me-2" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                Creating...
                </>
            ) : (
                "Create Transaction"
            )}
            </button>
        </div>
      </div>
    </div>
  );
}