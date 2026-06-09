import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApprovalGate } from '../../components/owner/ApprovalGate'
import { CreateListingForm } from '../../components/owner/CreateListingForm'
import { UnderReviewModal } from '../../components/owner/UnderReviewModal'
import { useOwnerAuth } from '../../context/OwnerAuthContext'
import { addOwnerListing } from '../../services/ownerStore'
import type { OwnerListing } from '@shared/types/owner'

export function CreateListingPage() {
  const { user } = useOwnerAuth()
  const navigate = useNavigate()
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [submittedTitle, setSubmittedTitle] = useState('')

  if (!user?.agencyId) return null

  const handleSubmit = async (listing: OwnerListing) => {
    await addOwnerListing(user.agencyId!, listing)
    setSubmittedTitle(listing.title)
    setShowReviewModal(true)
  }

  const goToListings = () => {
    setShowReviewModal(false)
    navigate('/dashboard/listings')
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <ApprovalGate message="You need admin approval before creating listings.">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <CreateListingForm agencyId={user.agencyId} onSubmit={handleSubmit} />
        </div>
      </ApprovalGate>

      <UnderReviewModal
        open={showReviewModal}
        title="Waiting to approve"
        message={`"${submittedTitle}" has been submitted. An admin will review and approve it before it goes live on the marketplace.`}
        buttonLabel="Go to listings"
        onContinue={goToListings}
      />
    </div>
  )
}
