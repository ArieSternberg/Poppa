import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function TermsOfUse() {
  return (
    <div className="min-h-screen bg-green-50">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-primary mb-8">Terms of Use</h1>
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
          <p className="mb-4">
            Welcome to Poppa.AI, a service provided by Poppa Services Inc.! These Terms of Use (&quot;Terms&quot;) govern your
            access to and use of our services, including our website, web app, SMS, and WhatsApp communications. By
            accessing or using our services, you agree to comply with these Terms, our Privacy Policy, and any other
            guidelines provided. If you don&apos;t agree with any part of these Terms, you must refrain from using Poppa.AI
            services.
          </p>

          <h2 className="text-2xl font-semibold mb-4">2. Definitions</h2>
          <ul className="list-disc list-inside mb-4">
            <li>&quot;Platform&quot;: Refers to the Poppa.AI website, web app, SMS, and WhatsApp communication systems.</li>
            <li>&quot;User&quot;: Any individual using the platform, including Senior Parents and Caregivers.</li>
            <li>&quot;Content&quot;: All information provided through the platform, including reminders, and communications.</li>
            <li>&quot;Services&quot;: Refers to all Poppa.AI functionalities, features, and products.</li>
          </ul>

          <h2 className="text-2xl font-semibold mb-4">3. Eligibility</h2>
          <p className="mb-4">
            You must be at least 18 years old to register as a caregiver or use any part of the Poppa.AI platform. By
            accessing our services, you confirm that you meet this requirement and that you will adhere to all
            applicable laws and regulations while using the platform. The service is only available in the United
            States, excluding California.
          </p>

          <h2 className="text-2xl font-semibold mb-4">4. User Registration and Account Security</h2>
          <ul className="list-disc list-inside mb-4">
            <li>
              Account Creation: To use Poppa.AI, you must register an account by providing accurate, current, and
              complete information.
            </li>
            <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
            <li>
              Account Confidentiality: Users are prohibited from sharing account details with others. Each account is
              intended for individual use only.
            </li>
            <li>
              Account Security: You must notify Poppa.AI immediately if you suspect any unauthorized access or security
              breach.
            </li>
            <li>
              Poppa.AI is not liable for any loss or damage arising from your failure to protect your account
              credentials.
            </li>
          </ul>

          <h2 className="text-2xl font-semibold mb-4">5. Service Description</h2>
          <ul className="list-disc list-inside mb-4">
            <li>
              Purpose: Poppa.AI provides a virtual concierge service to Senior Parents and their Caregivers,
              facilitating reminders and enhancing communication to simplify daily tasks.
            </li>
            <li>The platform operates through SMS and WhatsApp, minimizing complexity for elder users.</li>
          </ul>

          <h2 className="text-2xl font-semibold mb-4">6. Acceptable Use</h2>
          <p className="mb-4">Users must use Poppa.AI responsibly and in accordance with these guidelines:</p>
          <p className="font-semibold">Prohibited Conduct:</p>
          <ul className="list-disc list-inside mb-4">
            <li>Do not engage in activities that disrupt or interfere with the functionality of the platform.</li>
            <li>Avoid providing false or misleading information.</li>
            <li>Do not attempt to access other users&apos; accounts or the platform&apos;s backend without authorization.</li>
            <li>Refrain from spamming or sending harmful or offensive messages.</li>
          </ul>
          <p className="mb-4">
            Consequences: Violation of acceptable use standards may result in account suspension or termination.
          </p>

          <h2 className="text-2xl font-semibold mb-4">7. Data Privacy and Security</h2>
          <ul className="list-disc list-inside mb-4">
            <li>
              Data Ownership: Users own the data they input, but grant Poppa.AI a license to use anonymized data for
              service enhancement and quality improvement.
            </li>
            <li>Data Deletion: Upon termination of service, all personal information will be permanently deleted.</li>
            <li>
              Security Measures: Poppa.AI employs industry-standard encryption protocols to protect data. Users are
              responsible for secure password management.
            </li>
          </ul>

          <h2 className="text-2xl font-semibold mb-4">8. Intellectual Property</h2>
          <p className="mb-4">
            Poppa.AI owns all intellectual property rights to the platform, including its design, technology, and
            software. Unauthorized modification, distribution, or commercial use of the platform&apos;s content is
            prohibited.
          </p>

          <h2 className="text-2xl font-semibold mb-4">9. Third-Party Services</h2>
          <ul className="list-disc list-inside mb-4">
            <li>
              Integration: Poppa.AI integrates with third-party services (e.g., Twilio, Infobip) for communication
              purposes.
            </li>
            <li>
              While we strive to maintain seamless integration, Poppa.AI is not liable for technical failures or data
              breaches caused by third-party providers.
            </li>
          </ul>

          <h2 className="text-2xl font-semibold mb-4">10. Limitations of Liability</h2>
          <ul className="list-disc list-inside mb-4">
            <li>
              Accuracy: While we aim to ensure accurate information, Poppa.AI is not liable for errors arising from
              missed information.
            </li>
            <li>
              Security: Poppa.AI employs robust security measures but cannot guarantee absolute protection against
              unauthorized access or breaches, except in cases of gross negligence on our part.
            </li>
          </ul>

          <h2 className="text-2xl font-semibold mb-4">11. Disclaimers</h2>
          <p className="mb-4">
            Poppa.AI is not responsible for any actions or outcomes resulting from the use of the platform.
          </p>

          <h2 className="text-2xl font-semibold mb-4">12. User Rights and Content Ownership</h2>
          <ul className="list-disc list-inside mb-4">
            <li>
              User Data: Users retain ownership of the data they provide but grant Poppa.AI a license to utilize
              anonymized data for research, service improvement, and market analysis.
            </li>
            <li>
              Data Termination: Upon the end of service, all user-provided data will be securely deleted as described in
              the Data Privacy section.
            </li>
          </ul>

          <h2 className="text-2xl font-semibold mb-4">13. Subscription and Billing</h2>
          <ul className="list-disc list-inside mb-4">
            <li>Payment Models: Poppa.AI offers subscription plans and pay-per-use services.</li>
            <li>Details of these plans are available on our website.</li>
            <li>Refunds: Refunds are considered on a case-by-case basis.</li>
            <li>Any approved refunds will adhere to the conditions outlined on our platform.</li>
          </ul>

          <h2 className="text-2xl font-semibold mb-4">14. Termination and Account Suspension</h2>
          <ul className="list-disc list-inside mb-4">
            <li>
              Termination by Poppa.AI: We reserve the right to suspend or terminate accounts that violate these Terms,
              engage in prohibited activities, or fail to comply with subscription payments.
            </li>
            <li>
              User-Initiated Termination: Users may terminate their accounts at any time, with personal data handled
              according to the Data Deletion policy.
            </li>
          </ul>

          <h2 className="text-2xl font-semibold mb-4">15. Changes to Terms of Use</h2>
          <p className="mb-4">
            Poppa.AI reserves the right to modify these Terms at any time. Significant changes will be communicated via
            email or through a platform notice. Continued use of the platform after changes implies acceptance of the
            updated Terms.
          </p>

          <h2 className="text-2xl font-semibold mb-4">16. Governing Law and Dispute Resolution</h2>
          <ul className="list-disc list-inside mb-4">
            <li>Jurisdiction: These Terms are governed by the laws of the United States, excluding California.</li>
            <li>
              Dispute Resolution: Any disputes arising from these Terms shall be resolved through binding arbitration,
              following the governing laws.
            </li>
          </ul>

          <h2 className="text-2xl font-semibold mb-4">17. Notices</h2>
          <p className="mb-4">Written notices to Poppa Services Inc. may be addressed as follows:</p>
          <p className="mb-4">
            Poppa Services Inc.
            <br />
            ATTN: Legal Team
            <br />
            19790 W Dixie Hwy, #1207 Aventura, FL 33180
            <br />
            United States of America
          </p>
        </div>
        <div className="mt-8">
          <Button asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

