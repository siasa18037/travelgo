import { Schema, model, models } from 'mongoose';

// Checklist schema
const ChecklistSchema = new Schema({
  name: { type: String, required: true },
  detail: { type: String },
  status: { type: String, enum: ['pending', 'done'], default: 'pending' }
});

// time
const TimeWithZoneSchema = new Schema({
  datetime: { type: Date, required: true },
  timezone: { type: String, required: true }
});

// Location schema
const LocationSchema = new Schema({
  name: String,
  lat: Number,
  lng: Number,
  address: { type: String }
});

// Plan Data Types
const HotelDataSchema = new Schema({
  name: String,
  name_hotel: String,
  start: TimeWithZoneSchema,
  end: TimeWithZoneSchema,
  location_name: String,
  location_detail: String,
  location: LocationSchema,
  hotel_booking_detail: String
});

const TransportDataSchema = new Schema({
  name: String,
  transport_type: {
    type: String,
    enum: ['public_transport','car', 'plane', 'train', 'walking', 'bicycle']
  },
  transport_name: String,
  start: TimeWithZoneSchema,
  end: TimeWithZoneSchema,
  origin: LocationSchema,
  destination: LocationSchema,
  transport_booking_detail: String
});

const EatOrActivityDataSchema = new Schema({
  name: String,
  start: TimeWithZoneSchema,
  end: TimeWithZoneSchema,
  location_name: String,
  location_detail: String,
  location: LocationSchema
});

// Price schema
const PriceSchema = new Schema({
  price: { type: Number},
  currency: { type: String  }
});


// Plan Schema
const PlanSchema = new Schema({
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed', 'skipped', 'cancelled'],
    default: 'not_started'
  },
  name: { type: String },
  start: TimeWithZoneSchema,
  end: TimeWithZoneSchema,
  type: { type: String, enum: ['hotel', 'transport', 'eat', 'Activities'] },
  data: {
    type: Schema.Types.Mixed // Dynamic schema based on `type`
  },
  Tiket_pass: [{ type: Schema.Types.ObjectId, ref: 'TicketPass' }],
  image: [{ type: String }],
  detail: { type: String },
  amount:  PriceSchema,
  Price_per_person: { type: Number },
  note: { type: String },
  checklist: [ChecklistSchema]
}, { timestamps: true });

// User trip relation
const UserTripSchema = new Schema({
  id_user: { type: String  },
  type: { type: String, enum: ['admin', 'user'], default: 'user' }
});


// TicketPass schema
const TicketPassSchema = new Schema({
  type: { type: String}, //public , private , [id_user]
  name: { type: String },
  detail: { type: String },
  booking_Tiket_pass: { type: String },
  price: PriceSchema,
  start: TimeWithZoneSchema,
  end: TimeWithZoneSchema,
  img: { type: String },
  location_use: { type: String }
}, { timestamps: true });

// WalletTransaction schema
const WalletTransactionSchema = new Schema({
  plan_id: { type: Schema.Types.ObjectId },
  time: { type: Date, default: Date.now },
  amount: { type: Number },
  from: { type: Schema.Types.ObjectId, ref: 'User' },
  to: { type: Schema.Types.ObjectId, ref: 'User' },
  isPaid: { type: Boolean, default: false },
  note: { type: String }
}, { timestamps: true });

// Trip schema (Main)
const TripSchema = new Schema({
  name: { type: String },
  description: { type: String },
  start_date: TimeWithZoneSchema,
  end_date: TimeWithZoneSchema,
  detail: { type: String },
  plan: [PlanSchema],
  user: [UserTripSchema],
  ticket_pass: [TicketPassSchema],
  wallet_transaction: [WalletTransactionSchema],
  profile_image:{ type: String },
  image: [{ type: String }],
  country :[{ type: String }],
}, { timestamps: true });


const Trip = models.Trip || model('Trip', TripSchema);
export default Trip;

