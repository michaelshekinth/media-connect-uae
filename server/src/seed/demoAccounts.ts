import bcrypt from 'bcryptjs'
import { connectDb, disconnectDb } from '../db/connect.js'
import { User } from '../models/User.js'
import { OwnerProfile } from '../models/OwnerProfile.js'
import { Agency } from '../models/Agency.js'
import { Listing } from '../models/Listing.js'
import { ChatThread } from '../models/Chat.js'
import { QuoteRequest } from '../models/QuoteRequest.js'
import { CustomQuote } from '../models/CustomQuote.js'

export const DEMO_CREDENTIALS = {
  advertiser: { email: 'test.advertiser@media.ae', password: 'TestMedia2026!' },
  owner: { email: 'test.owner@media.ae', password: 'TestMedia2026!' },
  admin: { email: 'admin@mediaconnect.ae', password: 'admin123' },
} as const

export const DEMO_OWNER_AGENCY_ID = 'agency_demo_test_owner'

const TINY_PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

const resetFlow = process.argv.includes('--reset-flow') || process.env.SEED_RESET_FLOW === '1'

function buildOwnerProfile(userId: string) {
  const now = new Date().toISOString()
  return {
    agencyId: DEMO_OWNER_AGENCY_ID,
    userId,
    companyLegalName: 'Demo Media UAE LLC',
    authorizedPerson: 'Test Owner',
    jobTitle: 'Managing Director',
    businessEmail: DEMO_CREDENTIALS.owner.email,
    phone: '+971501234567',
    city: 'Dubai',
    address: 'Business Bay, Dubai',
    website: 'https://demo-media.example.com',
    licenseNumber: 'DED-TEST-001',
    licenseExpiry: '2027-12-31',
    licenseDocument: TINY_PNG,
    licenseDocumentName: 'trade-license.png',
    vatTrn: '100000000000003',
    mediaCategories: ['OOH/DOOH', 'TV'],
    companyDescription:
      'Demo media owner for E2E testing. We operate premium OOH and TV inventory across the UAE.',
    logoUrl: TINY_PNG,
    documents: [
      {
        id: 'doc_trade_license',
        type: 'trade_license',
        label: 'Trade license',
        fileName: 'trade-license.png',
        mimeType: 'image/png',
        data: TINY_PNG,
        uploadedAt: now,
      },
    ],
    rejectionReason: null,
  }
}

async function clearOwnerTransactionalData(agencyId: string, advertiserId?: string) {
  await Listing.deleteMany({ agencyId })
  await QuoteRequest.deleteMany({ agencyId })
  await CustomQuote.deleteMany({ agencyId })
  if (advertiserId) {
    await ChatThread.deleteMany({ agencyId, advertiserId })
  } else {
    await ChatThread.deleteMany({ agencyId })
  }
}

export async function seedDemoAccounts(options?: { resetFlow?: boolean }) {
  const doReset = options?.resetFlow ?? resetFlow
  await connectDb()

  const advHash = await bcrypt.hash(DEMO_CREDENTIALS.advertiser.password, 10)
  const ownerHash = await bcrypt.hash(DEMO_CREDENTIALS.owner.password, 10)

  let advertiser = await User.findOne({ email: DEMO_CREDENTIALS.advertiser.email })
  if (!advertiser) {
    advertiser = await User.create({
      email: DEMO_CREDENTIALS.advertiser.email,
      passwordHash: advHash,
      fullName: 'Test Advertiser',
      role: 'advertiser',
    })
    console.log('Created advertiser:', DEMO_CREDENTIALS.advertiser.email)
  } else {
    advertiser.passwordHash = advHash
    advertiser.fullName = 'Test Advertiser'
    await advertiser.save()
    console.log('Updated advertiser:', DEMO_CREDENTIALS.advertiser.email)
  }

  let owner = await User.findOne({ email: DEMO_CREDENTIALS.owner.email })
  if (!owner) {
    owner = await User.create({
      email: DEMO_CREDENTIALS.owner.email,
      passwordHash: ownerHash,
      fullName: 'Test Owner',
      phone: '+971501234567',
      companyName: 'Demo Media UAE LLC',
      role: 'media_owner',
      agencyId: DEMO_OWNER_AGENCY_ID,
      ownerProfileComplete: true,
      ownerApprovalStatus: doReset ? 'submitted' : 'approved',
    })
    console.log('Created media owner:', DEMO_CREDENTIALS.owner.email)
  } else {
    owner.passwordHash = ownerHash
    owner.agencyId = DEMO_OWNER_AGENCY_ID
    owner.companyName = 'Demo Media UAE LLC'
    owner.ownerProfileComplete = true
    owner.ownerApprovalStatus = doReset ? 'submitted' : 'approved'
    await owner.save()
    console.log('Updated media owner:', DEMO_CREDENTIALS.owner.email)
  }

  const profileData = buildOwnerProfile(owner._id.toString())
  await OwnerProfile.findOneAndUpdate(
    { agencyId: DEMO_OWNER_AGENCY_ID },
    { $set: profileData },
    { upsert: true },
  )

  await clearOwnerTransactionalData(DEMO_OWNER_AGENCY_ID, advertiser._id.toString())

  if (doReset) {
    await Agency.deleteOne({ agencyId: DEMO_OWNER_AGENCY_ID })
    console.log('Reset flow: owner profile submitted, listings/chats cleared, agency removed')
  } else {
    await Agency.findOneAndUpdate(
      { agencyId: DEMO_OWNER_AGENCY_ID },
      {
        agencyId: DEMO_OWNER_AGENCY_ID,
        ownerUserId: owner._id.toString(),
        name: profileData.companyLegalName,
        initials: 'DM',
        about: profileData.companyDescription,
        city: profileData.city,
        address: profileData.address,
        mediaTypes: profileData.mediaCategories,
        businessEmail: profileData.businessEmail,
        phone: profileData.phone,
        verified: true,
        featured: true,
        status: 'approved',
      },
      { upsert: true },
    )
    console.log('Owner approved with agency ready for listings')
  }

  await disconnectDb()
  console.log('Demo accounts seed complete')
  console.log('  Advertiser:', DEMO_CREDENTIALS.advertiser.email, '/', DEMO_CREDENTIALS.advertiser.password)
  console.log('  Media owner:', DEMO_CREDENTIALS.owner.email, '/', DEMO_CREDENTIALS.owner.password)
  console.log('  Super admin:', DEMO_CREDENTIALS.admin.email, '/', DEMO_CREDENTIALS.admin.password)
}

if (process.argv[1]?.includes('demoAccounts')) {
  seedDemoAccounts().catch((e) => {
    console.error(e)
    process.exit(1)
  })
}
