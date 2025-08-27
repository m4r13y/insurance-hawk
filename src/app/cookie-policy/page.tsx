"use client"

import MedicareDisclaimer from "@/components/medicare-disclaimer"

export default function CookiePolicy() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl mt-16">
      <MedicareDisclaimer page="general" />
      
      <h1 className="text-3xl font-bold mb-8">Cookie Policy</h1>
      
      <div className="prose prose-lg dark:prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4">What Are Cookies?</h2>
          <p className="text-muted-foreground leading-relaxed">
            Cookies are small text files that are stored on your device when you visit our website. 
            They help us provide you with a better experience by remembering your preferences and 
            enabling certain website features.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Types of Cookies We Use</h2>
          
          <div className="space-y-4">
            <div className="bg-success/10 dark:bg-success/10 border border-success/20 dark:border-success/20 rounded-lg p-4">
              <h3 className="font-semibold text-success dark:text-success mb-2">
                Necessary Cookies (Always Active)
              </h3>
              <p className="text-sm text-success/80 dark:text-success/80 mb-2">
                These cookies are essential for the website to function properly and cannot be disabled.
              </p>
              <ul className="text-xs text-success/70 dark:text-success/70 space-y-1">
                <li>• Session management and authentication</li>
                <li>• Security and fraud prevention</li>
                <li>• HIPAA compliance and data protection</li>
                <li>• Quote data storage and retrieval</li>
              </ul>
            </div>

            <div className="bg-primary/10 dark:bg-primary/10 border border-primary/20 dark:border-primary/20 rounded-lg p-4">
              <h3 className="font-semibold text-primary dark:text-primary mb-2">
                Functional Cookies
              </h3>
              <p className="text-sm text-primary/80 dark:text-primary/80 mb-2">
                These cookies enable enhanced features and personalization.
              </p>
              <ul className="text-xs text-primary/70 dark:text-primary/70 space-y-1">
                <li>• Saved insurance quotes and comparisons</li>
                <li>• User preferences and settings</li>
                <li>• Accessibility options (font size, contrast)</li>
                <li>• Language and location preferences</li>
              </ul>
            </div>

            <div className="bg-warning/10 dark:bg-warning/10 border border-warning/20 dark:border-warning/20 rounded-lg p-4">
              <h3 className="font-semibold text-warning dark:text-warning mb-2">
                Analytics Cookies
              </h3>
              <p className="text-sm text-warning/80 dark:text-warning/80 mb-2">
                These cookies help us understand how you use our website (data is anonymized).
              </p>
              <ul className="text-xs text-warning/70 dark:text-warning/70 space-y-1">
                <li>• Google Analytics (anonymized)</li>
                <li>• Page views and user journeys</li>
                <li>• Error tracking and performance monitoring</li>
                <li>• A/B testing for website improvements</li>
              </ul>
            </div>

            <div className="bg-destructive/10 dark:bg-destructive/10 border border-destructive/20 dark:border-destructive/20 rounded-lg p-4">
              <h3 className="font-semibold text-destructive dark:text-destructive mb-2">
                Marketing Cookies
              </h3>
              <p className="text-sm text-destructive/80 dark:text-destructive/80 mb-2">
                These cookies enable personalized content and relevant insurance offers.
              </p>
              <ul className="text-xs text-destructive/70 dark:text-destructive/70 space-y-1">
                <li>• Personalized insurance recommendations</li>
                <li>• Targeted advertising and retargeting</li>
                <li>• Social media integration</li>
                <li>• Carrier partnership tracking</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Managing Your Cookie Preferences</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            You can control cookies through several methods:
          </p>
          
          <div className="bg-secondary p-4 rounded-lg">
            <h3 className="font-medium mb-2">Cookie Consent Banner</h3>
            <p className="text-sm text-muted-foreground mb-2">
              When you first visit our site, you can choose which types of cookies to accept 
              through our consent banner.
            </p>
          </div>

          <div className="bg-secondary p-4 rounded-lg mt-2">
            <h3 className="font-medium mb-2">Browser Settings</h3>
            <p className="text-sm text-muted-foreground">
              Most web browsers allow you to control cookies through their settings. You can 
              typically block or delete cookies, though this may impact website functionality.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Third-Party Cookies</h2>
          <p className="text-muted-foreground leading-relaxed">
            Some cookies on our site are set by third-party services we use:
          </p>
          <ul className="list-disc ml-6 space-y-2 text-muted-foreground mt-2">
            <li><strong>Google Analytics:</strong> Website usage analytics (anonymized)</li>
            <li><strong>Insurance Carriers:</strong> Quote comparison and enrollment</li>
            <li><strong>Customer Support:</strong> Live chat and help desk functionality</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Healthcare Data Protection</h2>
          <p className="text-muted-foreground leading-relaxed">
            As an insurance service, we take extra precautions with health-related data:
          </p>
          <ul className="list-disc ml-6 space-y-2 text-muted-foreground mt-2">
            <li>All health information is encrypted in transit and at rest</li>
            <li>HIPAA-compliant data handling and storage</li>
            <li>Limited data sharing only with authorized insurance partners</li>
            <li>Regular security audits and compliance checks</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
          <p className="text-muted-foreground leading-relaxed">
            If you have questions about our use of cookies or want to update your preferences:
          </p>
          <div className="bg-secondary p-4 rounded-lg mt-2">
            <p className="text-sm">
              Email: info@hawkinsig.com<br />
              Phone: 1-800-HAWK-INS<br />
              Or use our cookie consent banner to update preferences
            </p>
          </div>
        </section>

        <section className="border-t pt-6">
          <p className="text-sm text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}<br />
            This cookie policy complies with GDPR, CCPA, and healthcare privacy regulations.
          </p>
        </section>
      </div>
    </div>
  )
}
