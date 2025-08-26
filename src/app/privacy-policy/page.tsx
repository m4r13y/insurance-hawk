"use client"

import MedicareDisclaimer from "@/components/medicare-disclaimer"

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <MedicareDisclaimer page="general" />
      
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
      
      <div className="prose prose-lg dark:prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
          <p className="text-muted-foreground leading-relaxed">
            We collect information you provide directly to us, such as when you request insurance quotes, 
            create an account, or contact us for support. This may include your name, email address, 
            phone number, and health information necessary for insurance quotes.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">HIPAA Compliance</h2>
          <p className="text-muted-foreground leading-relaxed">
            As a healthcare-related service, we comply with the Health Insurance Portability and 
            Accountability Act (HIPAA). Your Protected Health Information (PHI) is encrypted, 
            stored securely, and only shared with authorized insurance carriers with your consent.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
          <ul className="list-disc ml-6 space-y-2 text-muted-foreground">
            <li>Provide insurance quotes and plan comparisons</li>
            <li>Connect you with licensed insurance agents</li>
            <li>Comply with Medicare and insurance regulations</li>
            <li>Improve our services and user experience</li>
            <li>Send you relevant insurance information (with consent)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Cookie Policy</h2>
          <p className="text-muted-foreground leading-relaxed">
            We use cookies and similar technologies to provide our services, analyze usage, 
            and improve user experience. You can control cookie preferences through our 
            cookie consent banner or browser settings.
          </p>
          
          <div className="bg-secondary p-4 rounded-lg mt-4">
            <h3 className="font-medium mb-2">Cookie Categories:</h3>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li><strong>Necessary:</strong> Essential for website functionality and security</li>
              <li><strong>Functional:</strong> Enable features like quote saving and preferences</li>
              <li><strong>Analytics:</strong> Help us understand website usage (anonymized)</li>
              <li><strong>Marketing:</strong> Personalize content and advertising</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Data Sharing</h2>
          <p className="text-muted-foreground leading-relaxed">
            We may share your information with licensed insurance carriers and agents to provide 
            quotes and enrollment services. We do not sell your personal information to third parties. 
            All sharing is done with your consent and in compliance with applicable privacy laws.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
          <p className="text-muted-foreground leading-relaxed">
            Depending on your location, you may have the right to access, update, delete, or 
            restrict the use of your personal information. You can also opt out of marketing 
            communications at any time.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
          <p className="text-muted-foreground leading-relaxed">
            For questions about this privacy policy or your personal information, contact us at:
          </p>
          <div className="bg-secondary p-4 rounded-lg mt-2">
            <p className="text-sm">
              Email: privacy@insurancehawk.com<br />
              Phone: 1-800-HAWK-INS<br />
              Address: [Your business address]
            </p>
          </div>
        </section>

        <section className="border-t pt-6">
          <p className="text-sm text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}<br />
            This privacy policy complies with HIPAA, GDPR, CCPA, and Medicare regulations.
          </p>
        </section>
      </div>
    </div>
  )
}
