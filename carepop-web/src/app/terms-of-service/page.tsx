import React from 'react';

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto px-6 py-12 max-w-4xl bg-white shadow-lg rounded-lg">
      <header className="mb-10 pb-6 border-b border-gray-300">
        <h1 className="text-4xl font-bold text-center text-gray-900">Terms of Service</h1>
      </header>
      <main className="prose prose-lg max-w-none prose-headings:text-gray-800 prose-p:text-gray-700 prose-li:text-gray-700 prose-strong:text-gray-800 prose-a:text-blue-600 hover:prose-a:text-blue-700">
        <h3 className="text-xl font-semibold mt-4 mb-2 text-gray-700">Effective Date: [Date]</h3>
        
        <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-800">1. Introduction &amp; Acceptance of Terms</h2>
        <p className="mb-4 text-gray-700 leading-relaxed">Welcome to CarePoP/QueerCare (the "Platform"), operated in partnership with the Family Planning Organization of the Philippines (FPOP) ("We", "Us", "Our"). The Platform provides access to healthcare information, provider directories, appointment scheduling, personal health tracking tools, and related services (collectively, the "Services") via our native mobile application (`carepop-nativeapp` for iOS and Android) and our web application (`carepop-web` accessible via web browsers).</p>
        <p className="mb-4 text-gray-700 leading-relaxed">These Terms of Service ("Terms") govern your access to and use of the Platform and Services. By accessing or using the Platform, creating an account, or clicking to accept these Terms when presented, you ("User", "You") agree to be bound by these Terms and our Privacy Policy ([Link to Privacy Policy when available]). If you do not agree to these Terms, you must not access or use the Platform or Services.</p>

        <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-800">2. Description of Service</h2>
        <p className="mb-4 text-gray-700 leading-relaxed">CarePoP/QueerCare is a digital platform designed to enhance healthcare accessibility and efficiency, particularly for diverse and underserved communities in Quezon City, Philippines. Core features available through both the native mobile app and the web application include:</p>
        <ul className="list-disc list-inside pl-4 mb-4 space-y-1">
          <li className="text-gray-700 leading-relaxed">User account management for secure access.</li>
          <li className="text-gray-700 leading-relaxed">Online appointment scheduling with participating providers/clinics.</li>
          <li className="text-gray-700 leading-relaxed">A directory of healthcare providers and facilities.</li>
          <li className="text-gray-700 leading-relaxed">Tools for personal health tracking (e.g., Pill Tracker, Menstrual Tracker).</li>
          <li className="text-gray-700 leading-relaxed">Access to view personal health information summaries or results where applicable and made available by providers (subject to consent and provider participation).</li>
          <li className="text-gray-700 leading-relaxed">Web-based administrative interfaces for FPOP staff (covered by internal FPOP policies in addition to these terms where applicable).</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-800">3. Healthcare Disclaimers - VERY IMPORTANT</h2>
        <ul className="list-disc list-inside pl-4 mb-4 space-y-1">
          <li className="text-gray-700 leading-relaxed"><strong>Not Medical Advice:</strong> The content and tools provided on the Platform (including information displayed, tracking summaries, directory listings, or any AI-assisted features) are for informational purposes only. The Platform <strong>DOES NOT PROVIDE MEDICAL ADVICE, DIAGNOSIS, OR TREATMENT RECOMMENDATIONS.</strong> Always seek the advice of your physician or other qualified healthcare provider with any questions you may have regarding a medical condition. Never disregard professional medical advice or delay in seeking it because of something you have read or used on the Platform.</li>
          <li className="text-gray-700 leading-relaxed"><strong>No Doctor-Patient Relationship:</strong> Use of the Platform does not create a doctor-patient relationship between you and FPOP or the Platform operators. Interaction with providers via the Platform is subject to their separate professional responsibilities and agreements.</li>
          <li className="text-gray-700 leading-relaxed"><strong>Not for Emergencies:</strong> <strong>DO NOT USE THE PLATFORM FOR MEDICAL EMERGENCIES.</strong> If you are experiencing a medical emergency, call your local emergency number immediately or go to the nearest emergency room.</li>
          <li className="text-gray-700 leading-relaxed"><strong>AI Features (If Applicable):</strong> Any features using artificial intelligence for assessment or information are provided for informational purposes only, are limited in scope, and are explicitly not a substitute for professional medical evaluation.</li>
          <li className="text-gray-700 leading-relaxed"><strong>User Responsibility:</strong> You are solely responsible for any decisions or actions you take based on the information or tools provided by the Platform. Accuracy of provider information in the directory is maintained to the best of our ability but relies on provider updates; verify details with providers directly.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-800">4. User Accounts &amp; Registration</h2>
        <ul className="list-disc list-inside pl-4 mb-4 space-y-1">
          <li className="text-gray-700 leading-relaxed"><strong>Eligibility:</strong> You must meet the minimum age requirement (e.g., 18 years old, or specify FPOP's policy for minors accessing services with consent, requiring legal review) and reside in the Philippines to create an account and use most Services. Public informational pages of the web application may be accessible without an account.</li>
          <li className="text-gray-700 leading-relaxed"><strong>Accurate Information:</strong> You agree to provide accurate, current, and complete information during registration and to keep your profile information updated via your account settings.</li>
          <li className="text-gray-700 leading-relaxed"><strong>Account Security:</strong> You are responsible for maintaining the confidentiality of your account password and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account. We are not liable for any loss or damage arising from your failure to protect your password or account information. Authentication is managed via Supabase Auth.</li>
          <li className="text-gray-700 leading-relaxed"><strong>Account Usage:</strong> Your account is for your personal use only (unless you are an authorized FPOP administrator using designated admin interfaces). You may not authorize others to use your account.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-800">5. User Conduct &amp; Acceptable Use</h2>
        <p className="mb-4 text-gray-700 leading-relaxed">You agree not to use the Platform or Services to:</p>
        <ul className="list-disc list-inside pl-4 mb-4 space-y-1">
          <li className="text-gray-700 leading-relaxed">Violate any applicable laws or regulations of the Republic of the Philippines, including the Data Privacy Act of 2012.</li>
          <li className="text-gray-700 leading-relaxed">Infringe upon the rights of others (including privacy, intellectual property).</li>
          <li className="text-gray-700 leading-relaxed">Upload, post, or transmit any content that is unlawful, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, invasive of another's privacy, hateful, or racially, ethnically, or otherwise objectionable.</li>
          <li className="text-gray-700 leading-relaxed">Impersonate any person or entity or falsely state or otherwise misrepresent your affiliation.</li>
          <li className="text-gray-700 leading-relaxed">Attempt to gain unauthorized access to the Platform, other user accounts, or computer systems or networks connected to the Platform.</li>
          <li className="text-gray-700 leading-relaxed">Introduce viruses, worms, or other malicious code.</li>
          <li className="text-gray-700 leading-relaxed">Interfere with or disrupt the Platform, its servers (Supabase, Google Cloud Run), or networks connected to it.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-800">6. Intellectual Property</h2>
        <p className="mb-4 text-gray-700 leading-relaxed">The Platform, including its software (for `carepop-nativeapp`, `carepop-web`, `carepop-backend`), design, text, graphics, logos, content (excluding user-generated content), and the arrangement thereof, is the property of FPOP or its licensors and is protected by copyright, trademark, and other intellectual property laws. You are granted a limited, non-exclusive, non-transferable, revocable license to access and use the Platform and Services strictly in accordance with these Terms for your personal, non-commercial use. You may not modify, copy, distribute, transmit, display, perform, reproduce, publish, license, create derivative works from, transfer, or sell any information, software, products, or services obtained from the Platform without our express prior written permission.</p>

        <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-800">7. User-Generated Content (If Applicable)</h2>
        <p className="mb-4 text-gray-700 leading-relaxed">If the Platform allows you to submit or share content (e.g., notes in trackers, feedback), you retain ownership of your content. However, by submitting content, you grant FPOP a worldwide, non-exclusive, royalty-free, sublicensable, and transferable license to use, reproduce, distribute, prepare derivative works of, display, and perform the content in connection with the Service and FPOP's mission, primarily for providing and improving the Services to you, and for anonymized, aggregated reporting as outlined in our Privacy Policy. You represent and warrant that you have all necessary rights to grant this license.</p>

        <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-800">8. Third-Party Links &amp; Services</h2>
        <p className="mb-4 text-gray-700 leading-relaxed">The Platform may contain links to third-party websites or services (e.g., external health resources) that are not owned or controlled by us. We are not responsible for the content, privacy policies, or practices of any third-party websites or services. Your interactions with such third parties are solely between you and them. The Platform relies on services from Supabase and Google Cloud Platform for its operation, governed by their respective terms.</p>

        <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-800">9. Termination and Suspension</h2>
        <p className="mb-4 text-gray-700 leading-relaxed">We reserve the right to suspend or terminate your access to the Platform and Services, without prior notice or liability, for any reason, including, but not limited to, a breach of these Terms or engaging in activity that we deem harmful to the Platform, its users, or FPOP. You may terminate your account at any time by following the instructions within the Platform settings or by contacting us at `[Contact Email for Account Deletion]`. Upon termination, your right to use the Services will immediately cease. Data retention upon termination will be handled according to our Privacy Policy and applicable laws.</p>

        <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-800">10. Disclaimers of Warranties</h2>
        <p className="mt-4 mb-4 font-semibold text-gray-800">THE PLATFORM AND SERVICES ARE PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS. TO THE FULLEST EXTENT PERMITTED BY LAW, FPOP AND ITS AFFILIATES, OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, AND LICENSORS EXPRESSLY DISCLAIM ALL WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICES WILL BE UNINTERRUPTED, TIMELY, SECURE, ERROR-FREE, OR FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS, NOR DO WE WARRANT THE ACCURACY, COMPLETENESS, OR RELIABILITY OF ANY INFORMATION (INCLUDING PROVIDER DIRECTORY LISTINGS) OBTAINED THROUGH THE PLATFORM.</p>
        
        <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-800">11. Limitation of Liability</h2>
        <p className="mt-4 mb-4 font-semibold text-gray-800">TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL FPOP, ITS AFFILIATES, OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, OR LICENSORS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM (A) YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS OR USE THE PLATFORM OR SERVICES; (B) ANY CONDUCT OR CONTENT OF ANY THIRD PARTY ON THE PLATFORM; (C) ANY CONTENT OBTAINED FROM THE PLATFORM; OR (D) UNAUTHORIZED ACCESS, USE, OR ALTERATION OF YOUR TRANSMISSIONS OR CONTENT, WHETHER BASED ON WARRANTY, CONTRACT, TORT (INCLUDING NEGLIGENCE), STATUTE, OR ANY OTHER LEGAL THEORY, WHETHER OR NOT WE HAVE BEEN INFORMED OF THE POSSIBILITY OF SUCH DAMAGE. OUR TOTAL LIABILITY TO YOU FOR ALL CLAIMS ARISING FROM OR RELATING TO THE SERVICES SHALL NOT EXCEED `[Specify Amount, e.g., One Thousand Philippine Pesos (PHP 1,000.00) or a nominal amount - LEGAL REVIEW MANDATORY]`.</p>

        <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-800">12. Indemnification</h2>
        <p className="mb-4 text-gray-700 leading-relaxed">You agree to defend, indemnify, and hold harmless FPOP and its affiliates, officers, directors, employees, and agents from and against any and all claims, damages, obligations, losses, liabilities, costs or debt, and expenses (including but not limited to attorney's fees) arising from: (a) your use of and access to the Platform and Services; (b) your violation of any term of these Terms; or (c) your violation of any law or the rights of any third party, including without limitation any copyright, property, or privacy right.</p>

        <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-800">13. Governing Law and Dispute Resolution</h2>
        <p className="mb-4 text-gray-700 leading-relaxed">These Terms shall be governed by and construed in accordance with the laws of the Republic of the Philippines, without regard to its conflict of law principles. You agree that any legal action or proceeding arising out of or relating to these Terms or the Services shall be brought exclusively in the competent courts of Quezon City, Philippines. [<strong>Note:</strong> Consider adding alternative dispute resolution clauses like mediation or arbitration after legal review].</p>

        <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-800">14. Changes to Terms</h2>
        <p className="mb-4 text-gray-700 leading-relaxed">We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will endeavor to provide at least `[Number, e.g., 15 or 30]` days' notice prior to any new terms taking effect (e.g., via email to your registered address or an in-app/on-site notification). What constitutes a material change will be determined at our sole discretion. By continuing to access or use our Platform after any revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, you must stop using the Service.</p>

        <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-800">15. Contact Information</h2>
        <p className="mb-4 text-gray-700 leading-relaxed">If you have any questions about these Terms, please contact FPOP at:</p>
        <p className="mb-4 text-gray-700 leading-relaxed">Family Planning Organization of the Philippines (FPOP)<br />
        `[FPOP Main Office Address]`<br />
        `[Official Contact Email for CarePoP/Platform Inquiries]`<br />
        `[Official Contact Phone Number]`</p>

        <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-800">16. Miscellaneous</h2>
        <ul className="list-disc list-inside pl-4 mb-4 space-y-1">
          <li className="text-gray-700 leading-relaxed"><strong>Entire Agreement:</strong> These Terms, together with the Privacy Policy, constitute the entire agreement between you and FPOP concerning your use of the Platform and Services.</li>
          <li className="text-gray-700 leading-relaxed"><strong>Severability:</strong> If any provision of these Terms is held by a court of competent jurisdiction to be invalid, illegal, or unenforceable for any reason, such provision shall be eliminated or limited to the minimum extent such that the remaining provisions of the Terms will continue in full force and effect.</li>
          <li className="text-gray-700 leading-relaxed"><strong>No Waiver:</strong> No waiver by FPOP of any term or condition set forth in these Terms shall be deemed a further or continuing waiver of such term or condition or a waiver of any other term or condition, and any failure of FPOP to assert a right or provision under these Terms shall not constitute a waiver of such right or provision.</li>
          <li className="text-gray-700 leading-relaxed"><strong>Assignment:</strong> You may not assign these Terms or any of your rights or obligations hereunder, whether by operation of law or otherwise, without our prior written consent. We may assign these Terms or any of our rights or obligations hereunder without your consent.</li>
        </ul>
      </main>
      <footer className="mt-16 pt-8 border-t border-gray-300 text-center text-sm text-gray-600">
        <p>Last Updated: [Date]</p>
        <p className="mt-1">Please replace [Date] with the actual effective date upon finalization.</p>
        <p className="mt-2">
          For any questions regarding these Terms, please contact us at{' '}
          <a href="mailto:[Official Contact Email for CarePoP/Platform Inquiries]" className="text-blue-600 hover:underline">
            [Official Contact Email for CarePoP/Platform Inquiries]
          </a>
          .
        </p>
      </footer>
    </div>
  );
} 