import GetStartedFlow from "@/components/GetStartedFlow"

export default function AgentGetStartedPage() {
  return (
    <div className="relative min-h-screen">
      <div className="relative z-10">
        <GetStartedFlow initialClientType="agent" />
      </div>
    </div>
  )
}
