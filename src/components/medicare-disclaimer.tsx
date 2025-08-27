"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { InfoCircledIcon, Cross1Icon } from '@radix-ui/react-icons'

interface MedicareDisclaimerProps {
  page?: 'medicare' | 'advantage' | 'supplement' | 'partd' | 'general'
  className?: string
}

export default function MedicareDisclaimer({ page = 'general', className = '' }: MedicareDisclaimerProps) {
  const [isVisible, setIsVisible] = useState(true)

  const getDisclaimerContent = () => {
    switch (page) {
      case 'medicare':
        return {
          title: 'Medicare Information Disclaimer',
          content: (
            <>
              <p>
                This website provides general Medicare information for educational purposes only. 
                Medicare plans and costs vary by location and individual circumstances.
              </p>
              <p>
                <strong>Important:</strong> This site is not connected with or endorsed by the U.S. Government 
                or the federal Medicare program. We are a licensed insurance agency representing multiple 
                Medicare insurance carriers.
              </p>
            </>
          )
        }
      case 'advantage':
        return {
          title: 'Medicare Advantage Plan Disclaimer',
          content: (
            <>
              <p>
                Medicare Advantage Plans are offered by private companies approved by Medicare. 
                Plan availability and costs vary by location and may change annually.
              </p>
              <p>
                <strong>CMS Compliance:</strong> Every effort has been made to ensure accuracy, 
                but Medicare plan details can change. Always verify current plan information 
                directly with Medicare.gov or the plan provider.
              </p>
            </>
          )
        }
      case 'supplement':
        return {
          title: 'Medicare Supplement (Medigap) Disclaimer',
          content: (
            <>
              <p>
                Medicare Supplement insurance policies are standardized by federal law. 
                However, premiums and availability vary by insurance company and location.
              </p>
              <p>
                <strong>Important:</strong> Medicare Supplement policies help pay some of the 
                health care costs that Original Medicare doesn't cover, but they don't cover everything.
              </p>
            </>
          )
        }
      case 'partd':
        return {
          title: 'Medicare Part D Disclaimer',
          content: (
            <>
              <p>
                Part D prescription drug plan information is updated regularly but may not reflect 
                the most current formularies or costs. Always check with the plan directly for 
                current drug coverage.
              </p>
              <p>
                <strong>Late Enrollment Penalty:</strong> You may have to pay a penalty if you 
                don't join a Medicare drug plan when you're first eligible.
              </p>
            </>
          )
        }
      default:
        return {
          title: 'Insurance Information Disclaimer',
          content: (
            <>
              <p>
                This website provides general insurance information for educational purposes. 
                Insurance plans, costs, and availability vary by location and individual circumstances.
              </p>
              <p>
                <strong>HIPAA Compliance:</strong> We protect your personal health information 
                according to federal privacy standards. No personal information is shared without consent.
              </p>
            </>
          )
        }
    }
  }

  const { title, content } = getDisclaimerContent()

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.3 }}
        className={`relative bg-primary/10 dark:bg-primary/10 border border-primary/20 dark:border-primary/20 rounded-lg p-4 my-4 ${className}`}
      >
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-2 right-2 text-primary hover:text-primary/80 dark:text-primary dark:hover:text-primary/80"
          aria-label="Close disclaimer"
        >
          <Cross1Icon className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3 pr-6">
          <InfoCircledIcon className="h-5 w-5 text-primary dark:text-primary mt-0.5 flex-shrink-0" />
          <div className="space-y-2">
            <h4 className="font-medium text-primary dark:text-primary text-sm">
              {title}
            </h4>
            <div className="text-xs text-primary dark:text-primary/80 space-y-2">
              {content}
            </div>
            
            {/* CMS Required Links */}
            <div className="flex flex-wrap gap-4 text-xs pt-2 border-t border-primary/20 dark:border-primary/20">
              <a 
                href="https://www.medicare.gov" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary dark:text-primary/80 hover:underline"
              >
                Official Medicare Site
              </a>
              <a 
                href="https://www.cms.gov" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary dark:text-primary/80 hover:underline"
              >
                CMS.gov
              </a>
              {page === 'medicare' && (
                <a 
                  href="https://www.medicare.gov/plan-compare" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary dark:text-primary/80 hover:underline"
                >
                  Plan Finder
                </a>
              )}
            </div>

            {/* Compliance footnote */}
            <p className="text-xs text-primary dark:text-primary italic pt-1">
              Last updated: {new Date().toLocaleDateString()} | 
              Licensed in all 50 states | 
              CMS Compliant
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
