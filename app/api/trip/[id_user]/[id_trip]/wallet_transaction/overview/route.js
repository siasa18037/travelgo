import Trip from '@/models/Trip';
import { connectDB } from '@/lib/db';
import { NextResponse } from 'next/server';
import fetch from 'node-fetch';

// Cache exchange rates globally
let exchangeRatesCache = null;
let lastFetchedTime = 0;
const CACHE_DURATION = 1000 * 60 * 60; // 1 ชั่วโมง

async function fetchExchangeRates() {
  const now = Date.now();
  if (exchangeRatesCache && (now - lastFetchedTime < CACHE_DURATION)) {
    return exchangeRatesCache;
  }

  try {
    const res = await fetch('https://api.frankfurter.app/latest?from=THB');
    const data = await res.json();

    if (!data?.rates) {
      throw new Error('Rates missing');
    }

    exchangeRatesCache = data.rates; // THB → others
    lastFetchedTime = now;
    return exchangeRatesCache;
  } catch (err) {
    console.error('Exchange API failed:', err);
    return {};
  }
}

// THB → Other = rates[currency]
// แต่เราต้องการ Other → THB = 1 / rate
async function convertToTHB(priceObj) {
  if (!priceObj) return 0;
  const amount = priceObj.price ?? 0;
  const currency = priceObj.currency ?? 'THB';

  if (currency === 'THB') return amount;

  const rates = await fetchExchangeRates();
  const rateTHB = rates[currency];

  if (!rateTHB || rateTHB === 0) {
    console.warn(`No exchange rate for ${currency}, fallback to 1:1`);
    return amount;
  }

  return amount / rateTHB; // เพราะเรามี THB → currency, ต้องกลับทาง
}


// รวม async ราคาหลายตัว
async function asyncSum(arr, { divideByPerPerson = false } = {}) {
  const promises = arr.map(async (item) => {
    let value = await convertToTHB(item.amount);
    if (divideByPerPerson) {
      const perPerson = item.Price_per_person || 1;
      value = value / perPerson;
    }
    return value;
  });
  const values = await Promise.all(promises);
  return values.reduce((acc, val) => acc + val, 0);
}


export async function GET(req, { params }) {
  try {
    const { id_user, id_trip } = await params;
    await connectDB();

    const trip = await Trip.findById(id_trip).lean();
    if (!trip) {
      return NextResponse.json({ message: 'Trip not found' }, { status: 404 });
    }

    const userExists = trip.user.some(u => u.id_user === id_user);
    if (!userExists) {
      return NextResponse.json({ message: 'User not in this trip' }, { status: 403 });
    }

    const wallet = trip.wallet_transaction || [];
    const plans = trip.plan || [];

    // คำนวณแบบ async
    const [
      totalPlanAmount,
      totalWalletAmount,
      totalExpense,
      totalLoan,
      totalExpenseByUser,
      totalLoanFromUser,
      totalLoanToUser,
      unpaidLoanFromUser,
      unpaidLoanToUser
    ] = await Promise.all([
      asyncSum(plans, { divideByPerPerson: true }),
      asyncSum(wallet),
      asyncSum(wallet.filter(w => w.type === 'expense')),
      asyncSum(wallet.filter(w => w.type === 'loan')),
      asyncSum(wallet.filter(w => w.type === 'expense' && w.user_from?.toString() === id_user)),
      asyncSum(wallet.filter(w => w.type === 'loan' && w.user_from?.toString() === id_user)),
      asyncSum(wallet.filter(w => w.type === 'loan' && w.user_to?.toString() === id_user)),
      asyncSum(wallet.filter(w => w.type === 'loan' && !w.isPaid && w.user_from?.toString() === id_user)),
      asyncSum(wallet.filter(w => w.type === 'loan' && !w.isPaid && w.user_to?.toString() === id_user)),
    ]);

    return NextResponse.json({
      totalPlanAmount,
      totalWalletAmount,
      totalExpense,
      totalLoan,
      totalExpenseByUser,
      totalLoanFromUser,
      totalLoanToUser,
      unpaidLoanFromUser,
      unpaidLoanToUser
    }, { status: 200 });

  } catch (error) {
    console.error('GET Error:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}
