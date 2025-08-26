"use client"

import { createContext, useContext, useState, ReactNode } from 'react'

interface WaitlistFormData {
  name: string
  email: string
  feature: string
}

interface InformationRequestData {
  name: string
  email: string
  service: string
  requestType: 'information' | 'quote' | 'consultation'
}

interface ComingSoonData {
  title: string
  description: string
  feature: string
}

interface ContactFormData {
  memberName: string
  memberPhone: string
  memberEmail: string
}

interface ModalContextType {
  isSignInModalOpen: boolean
  setIsSignInModalOpen: (open: boolean) => void
  isWaitlistModalOpen: boolean
  setIsWaitlistModalOpen: (open: boolean) => void
  waitlistFormData: WaitlistFormData
  setWaitlistFormData: (data: WaitlistFormData) => void
  isInformationRequestModalOpen: boolean
  setIsInformationRequestModalOpen: (open: boolean) => void
  informationRequestData: InformationRequestData
  setInformationRequestData: (data: InformationRequestData) => void
  isComingSoonModalOpen: boolean
  setIsComingSoonModalOpen: (open: boolean) => void
  comingSoonData: ComingSoonData
  setComingSoonData: (data: ComingSoonData) => void
  isContactFormModalOpen: boolean
  setIsContactFormModalOpen: (open: boolean) => void
  contactFormData: ContactFormData
  setContactFormData: (data: ContactFormData) => void
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

export function ModalProvider({ children }: { children: ReactNode }) {
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false)
  const [isWaitlistModalOpen, setIsWaitlistModalOpen] = useState(false)
  const [waitlistFormData, setWaitlistFormData] = useState<WaitlistFormData>({
    name: '',
    email: '',
    feature: ''
  })
  const [isInformationRequestModalOpen, setIsInformationRequestModalOpen] = useState(false)
  const [informationRequestData, setInformationRequestData] = useState<InformationRequestData>({
    name: '',
    email: '',
    service: '',
    requestType: 'information'
  })
  const [isComingSoonModalOpen, setIsComingSoonModalOpen] = useState(false)
  const [comingSoonData, setComingSoonData] = useState<ComingSoonData>({
    title: 'Coming Soon!',
    description: 'This feature is currently in development.',
    feature: ''
  })
  const [isContactFormModalOpen, setIsContactFormModalOpen] = useState(false)
  const [contactFormData, setContactFormData] = useState<ContactFormData>({
    memberName: '',
    memberPhone: '',
    memberEmail: ''
  })

  return (
    <ModalContext.Provider value={{
      isSignInModalOpen,
      setIsSignInModalOpen,
      isWaitlistModalOpen,
      setIsWaitlistModalOpen,
      waitlistFormData,
      setWaitlistFormData,
      isInformationRequestModalOpen,
      setIsInformationRequestModalOpen,
      informationRequestData,
      setInformationRequestData,
      isComingSoonModalOpen,
      setIsComingSoonModalOpen,
      comingSoonData,
      setComingSoonData,
      isContactFormModalOpen,
      setIsContactFormModalOpen,
      contactFormData,
      setContactFormData
    }}>
      {children}
    </ModalContext.Provider>
  )
}

export function useModal() {
  const context = useContext(ModalContext)
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider')
  }
  return context
}

export type { WaitlistFormData, InformationRequestData, ComingSoonData, ContactFormData }
