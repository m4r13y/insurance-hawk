import GetStartedFlow from "@/components/GetStartedFlow"

export default function BusinessGetStartedPage() {
  return (
    <div className="relative min-h-screen">
      <div className="relative z-10">
        <GetStartedFlow initialClientType="business" />
      </div>
    </div>
  )
}
