export const defaultAdminConfig = {
  categories: [
    { id: 'ooh', label: 'OOH', mediaType: 'OOH', active: true, sortOrder: 1 },
    { id: 'dooh', label: 'DOOH', mediaType: 'DOOH', active: true, sortOrder: 2 },
    { id: 'tc', label: 'TC', mediaType: 'TC', active: true, sortOrder: 3 },
    { id: 'radio_print', label: 'Radio & Print', mediaType: 'Radio & Print', active: true, sortOrder: 4 },
    { id: 'influencers', label: 'Influencers', mediaType: 'Influencers', active: true, sortOrder: 5 },
  ],
  subscriptionPackages: [
    { id: 'pkg_starter', name: 'Starter', priceAed: 299, durationDays: 30, contactViewsIncluded: 5, features: ['5 contact reveals', 'Email support'], active: true },
    { id: 'pkg_pro', name: 'Professional', priceAed: 799, durationDays: 30, contactViewsIncluded: 25, features: ['25 contact reveals', 'Priority support'], active: true },
    { id: 'pkg_enterprise', name: 'Enterprise', priceAed: 2499, durationDays: 90, contactViewsIncluded: 100, features: ['100 contact reveals', 'Dedicated manager'], active: true },
  ],
  listingFees: [{ id: 'lf_global', scope: 'global', billing: 'per_listing', amountAed: 500, active: true }],
  leadGenFees: [{ id: 'lgf_global', scope: 'global', amountAed: 50, active: true, meta: { label: 'Default per RFQ' } }],
  commissionRules: [{ id: 'comm_global', scope: 'global', percent: 10, active: true, meta: { label: 'Platform default' } }],
  cmsPages: [
    { slug: 'about', title: 'About MediaConnect UAE', body: 'The UAE marketplace connecting advertisers with verified media owners.' },
    { slug: 'contact', title: 'Contact Us', body: 'Email: support@mediaconnect.ae' },
    { slug: 'privacy', title: 'Privacy Policy', body: 'Your data is handled per UAE regulations.' },
    { slug: 'terms', title: 'Terms of Service', body: 'Standard marketplace terms apply.' },
  ],
  emailTemplates: [
    { id: 'tpl_profile_approved', name: 'Profile Approved', subject: 'Your profile is approved', body: 'Hello {{name}}, your media owner profile has been approved.', active: true },
    { id: 'tpl_listing_approved', name: 'Listing Approved', subject: 'Listing is live', body: 'Your listing "{{title}}" is now live.', active: true },
    { id: 'tpl_rfq_received', name: 'RFQ Received', subject: 'New RFQ', body: 'You received a new quote request from {{advertiser}}.', active: true },
    { id: 'tpl_subscription', name: 'Subscription Confirmed', subject: 'Subscription active', body: 'Your {{package}} subscription is now active.', active: true },
  ],
  settings: {
    platformName: 'MediaConnect UAE',
    supportEmail: 'support@mediaconnect.ae',
    defaultCity: 'Dubai',
    maintenanceMode: false,
  },
}
