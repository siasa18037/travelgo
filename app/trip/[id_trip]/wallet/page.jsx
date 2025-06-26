'use client';

import { useTrip } from '@/components/TripContext';
import Overviewcard from './Overviewcard'
import './wallet.css'
import { Wallet, CircleDollarSign, Handshake, HandCoins } from 'lucide-react';

export default function WalletPage() {
  const { userType, userId, id_trip } = useTrip();

  return (
    <div className='WalletPage container'>
      <div className="head mt-3">
        <Overviewcard userId={userId} id_trip={id_trip}/>
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

      {/* main table */}
      
    </div>
  );
}
