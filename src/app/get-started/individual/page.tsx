import GetStartedFlow from "@/components/GetStartedFlow"

export default function IndividualGetStartedPage() {
  return (
    <div className="relative min-h-screen">
      <div className="relative z-10">
        <GetStartedFlow initialClientType="individual" />
      </div>
    </div>
  )
}
