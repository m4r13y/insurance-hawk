"use client"

import MedicareDisclaimer from "@/components/medicare-disclaimer"

export default function CookiePolicy() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
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
            <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                Necessary Cookies (Always Active)
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300 mb-2">
                These cookies are essential for the website to function properly and cannot be disabled.
              </p>
              <ul className="text-xs text-green-600 dark:text-green-400 space-y-1">
                <li>• Session management and authentication</li>
                <li>• Security and fraud prevention</li>
                <li>• HIPAA compliance and data protection</li>
                <li>• Quote data storage and retrieval</li>
              </ul>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                Functional Cookies
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                These cookies enable enhanced features and personalization.
              </p>
              <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                <li>• Saved insurance quotes and comparisons</li>
                <li>• User preferences and settings</li>
                <li>• Accessibility options (font size, contrast)</li>
                <li>• Language and location preferences</li>
              </ul>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                Analytics Cookies
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-2">
                These cookies help us understand how you use our website (data is anonymized).
              </p>
              <ul className="text-xs text-yellow-600 dark:text-yellow-400 space-y-1">
                <li>• Google Analytics (anonymized)</li>
                <li>• Page views and user journeys</li>
                <li>• Error tracking and performance monitoring</li>
                <li>• A/B testing for website improvements</li>
              </ul>
            </div>

            <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
              <h3 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">
                Marketing Cookies
              </h3>
              <p className="text-sm text-purple-700 dark:text-purple-300 mb-2">
                These cookies enable personalized content and relevant insurance offers.
              </p>
              <ul className="text-xs text-purple-600 dark:text-purple-400 space-y-1">
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
              Email: cookies@insurancehawk.com<br />
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
