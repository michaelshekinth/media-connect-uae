type MediaCategory = 'OOH' | 'TV' | 'Radio' | 'Press' | 'ContentCreators'

export const defaultSubcategories: { categoryId: MediaCategory; name: string; sortOrder: number }[] = [
  { categoryId: 'OOH', name: 'Billboard', sortOrder: 1 },
  { categoryId: 'OOH', name: 'Digital Screen', sortOrder: 2 },
  { categoryId: 'OOH', name: 'DOOH', sortOrder: 3 },
  { categoryId: 'OOH', name: 'Bus Shelter', sortOrder: 4 },
  { categoryId: 'OOH', name: 'Mall', sortOrder: 5 },
  { categoryId: 'OOH', name: 'Transit', sortOrder: 6 },
  { categoryId: 'TV', name: 'Prime Time', sortOrder: 1 },
  { categoryId: 'TV', name: 'Daytime', sortOrder: 2 },
  { categoryId: 'TV', name: 'Drive Time', sortOrder: 3 },
  { categoryId: 'Radio', name: 'Morning Show', sortOrder: 1 },
  { categoryId: 'Radio', name: 'Drive Time', sortOrder: 2 },
  { categoryId: 'Radio', name: 'Evening', sortOrder: 3 },
  { categoryId: 'Press', name: 'Full Page', sortOrder: 1 },
  { categoryId: 'Press', name: 'Half Page', sortOrder: 2 },
  { categoryId: 'Press', name: 'Supplement', sortOrder: 3 },
  { categoryId: 'ContentCreators', name: 'Instagram', sortOrder: 1 },
  { categoryId: 'ContentCreators', name: 'YouTube', sortOrder: 2 },
  { categoryId: 'ContentCreators', name: 'TikTok', sortOrder: 3 },
  { categoryId: 'ContentCreators', name: 'Snapchat', sortOrder: 4 },
]
