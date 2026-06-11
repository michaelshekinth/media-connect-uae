import { connectDb, disconnectDb } from '../db/connect.js'
import { Subcategory } from '../models/Subcategory.js'
import { Listing } from '../models/Listing.js'
import { defaultSubcategories } from './defaultSubcategories.js'
import { newId } from '../utils/id.js'
import { normalizeMediaType } from '../utils/categories.js'

async function migrateCategories() {
  await connectDb()

  for (const sub of defaultSubcategories) {
    const subcategoryId = `sub_${sub.categoryId.toLowerCase()}_${sub.name.toLowerCase().replace(/\s+/g, '_')}`
    await Subcategory.findOneAndUpdate(
      { subcategoryId },
      { $set: { ...sub, subcategoryId, active: true } },
      { upsert: true },
    )
  }
  console.log('Seeded default subcategories')

  const listings = await Listing.find()
  for (const l of listings) {
    const mediaCategory = normalizeMediaType(l.mediaCategory || l.mediaType)
    const mediaType = mediaCategory
    const emirate = l.emirate || l.city
  if (l.mediaCategory !== mediaCategory || l.mediaType !== mediaType || !l.emirate) {
      l.mediaCategory = mediaCategory
      l.mediaType = mediaType
      l.emirate = emirate
      if (!l.aboutPlacement && l.descriptionLong) l.aboutPlacement = l.descriptionLong
      await l.save()
    }
  }
  console.log(`Migrated ${listings.length} listings`)

  await disconnectDb()
  console.log('Category migration complete')
}

if (process.argv[1]?.includes('migrateCategories')) {
  migrateCategories().catch((e) => {
    console.error(e)
    process.exit(1)
  })
}

export { migrateCategories }
