import GetStartedFlow from "@/components/GetStartedFlow"

export default function FamilyGetStartedPage() {
  return (
    <div className="relative min-h-screen">
      <div className="relative z-10">
        <GetStartedFlow initialClientType="family" />
      </div>
    </div>
  )
}
