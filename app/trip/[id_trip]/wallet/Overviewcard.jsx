import { Wallet, CircleDollarSign, Handshake, HandCoins } from 'lucide-react';

export default function OverviewCard({ overview }) {
  const formatCurrency = (number) => {
    if (typeof number !== 'number') return '0.00';
    return number.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  if (!overview) {
    return <div className="text-center p-4 text-gray-500">ไม่สามารถแสดงข้อมูลได้</div>;
  }

  return (
    <div>
      {/* 🖥 Desktop layout */}
      <div className="d-none d-md-flex row g-3">
        {[
          {
            title: 'ค่าใช้จ่ายรวมของทริป',
            color: 'primary',
            value: overview.totalPlanAmount,
            icon: <Wallet className="text-gray-300" size={25} />,
          },
          {
            title: 'รายจ่ายส่วนตัวทั้งหมด',
            color: 'success',
            value: overview.totalExpenseByUser,
            icon: <CircleDollarSign className="text-gray-300" size={25} />,
          },
          {
            title: 'หนี้ที่ยังไม่ได้จ่ายคืน',
            color: 'danger',
            value: overview.unpaidLoanToUser,
            icon: <Handshake className="text-gray-300" size={25} />,
          },
          {
            title: 'คนอื่นติดหนี้เรา (ยังไม่คืน)',
            color: 'warning',
            value: overview.unpaidLoanFromUser,
            icon: <HandCoins className="text-gray-300" size={25} />,
          },
        ].map((card, i) => (
          <div key={i} className="col-xl-3 col-md-6 col-6 mb-2">
            <div className="card border-0 shadow h-100 py-2">
              <div className="card-body d-flex justify-content-between align-items-center">
                <div>
                  <div className={`text-xs fw-bold text-${card.color} text-uppercase mb-1`}>
                    {card.title}
                  </div>
                  <div className="h6 mb-0 fw-semibold text-gray-800">
                    {formatCurrency(card.value)} ฿
                  </div>
                </div>
                <div className="ms-2">{card.icon}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 📱 Mobile layout (แถวเดียว สไลด์ได้) */}
      <div className="d-flex d-md-none overflow-x-auto gap-3 py-2 px-1" style={{ scrollSnapType: 'x mandatory' }}>
        {[
          {
            title: 'ค่าใช้จ่ายรวมของทริป',
            color: 'primary',
            value: overview.totalPlanAmount,
            icon: <Wallet className="text-gray-300" size={22} />,
          },
          {
            title: 'รายจ่ายส่วนตัวทั้งหมด',
            color: 'success',
            value: overview.totalExpenseByUser,
            icon: <CircleDollarSign className="text-gray-300" size={22} />,
          },
          {
            title: 'หนี้ที่ยังไม่ได้จ่ายคืน',
            color: 'danger',
            value: overview.unpaidLoanToUser,
            icon: <Handshake className="text-gray-300" size={22} />,
          },
          {
            title: 'คนอื่นติดหนี้เรา (ยังไม่คืน)',
            color: 'warning',
            value: overview.unpaidLoanFromUser,
            icon: <HandCoins className="text-gray-300" size={22} />,
          },
        ].map((card, i) => (
          <div
            key={i}
            className="card flex-shrink-0 border-0 shadow-sm p-3"
            style={{
              minWidth: '180px',
              scrollSnapAlign: 'start',
              borderRadius: '12px',
            }}
          >
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <div className={`text-xs fw-bold text-${card.color} text-uppercase mb-1`}>
                  {card.title}
                </div>
                <div className="fw-semibold text-gray-800 small">
                  {formatCurrency(card.value)} ฿
                </div>
              </div>
              <div className="ms-2">{card.icon}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
