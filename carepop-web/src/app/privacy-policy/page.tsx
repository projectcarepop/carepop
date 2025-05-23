import React from 'react';

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-6 py-12 max-w-4xl bg-white shadow-lg rounded-lg">
      <header className="mb-10 pb-6 border-b border-gray-300">
        <h1 className="text-4xl font-bold text-center text-gray-900">Privacy Policy</h1>
      </header>
      <main className="prose prose-lg max-w-none prose-headings:text-gray-800 prose-p:text-gray-700 prose-li:text-gray-700 prose-strong:text-gray-800 prose-a:text-blue-600 hover:prose-a:text-blue-700">
        <h3 className="text-xl font-semibold mt-4 mb-2 text-gray-700">Effective Date: [Date]</h3>

        <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-800">1. Our Commitment to Your Privacy</h2>
        <p className="mb-4 text-gray-700 leading-relaxed">The Family Planning Organization of the Philippines (FPOP) ("We", "Us", "Our") is deeply committed to protecting the privacy, confidentiality, and security of your personal information and sensitive personal information. This Privacy Policy outlines how we collect, use, process, share, secure, and retain your data when you use the CarePoP/QueerCare Platform (the "Platform"), which includes our native mobile application (`carepop-nativeapp` for iOS and Android) and our web application (`carepop-web`) (collectively, the "Services").</p>
        <p className="mb-4 text-gray-700 leading-relaxed">This Policy is in compliance with the Republic Act No. 10173, also known as the Data Privacy Act of 2012 (DPA), its Implementing Rules and Regulations (IRR), and other relevant issuances from the National Privacy Commission (NPC). We encourage you to read this Policy carefully to understand our data practices. By using the Platform, you consent to the collection, use, and sharing of your information as described herein.</p>

        <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-800">2. Information We Collect</h2>
        <p className="mb-4 text-gray-700 leading-relaxed">We collect various types of information to provide and improve our Services:</p>
        
        <h4 className="text-lg font-semibold mt-3 mb-1 text-gray-700">A. Personal Information You Provide:</h4>
        <ul className="list-disc list-inside pl-4 mb-4 space-y-1">
          <li className="text-gray-700 leading-relaxed"><strong>Account Registration Information:</strong> When you create an account, we collect your name (or chosen display name), email address, password (securely hashed via Supabase Auth), date of birth, contact number, and address details.</li>
          <li className="text-gray-700 leading-relaxed"><strong>Profile Information:</strong> Additional details you may choose to provide in your user profile, such as pronouns, emergency contact information, and other preferences.</li>
          <li className="text-gray-700 leading-relaxed"><strong>Demographic Information (Optional):</strong> You may optionally provide demographic data (e.g., gender identity, ethnicity) to help us understand our community better and improve inclusivity.</li>
          <li className="text-gray-700 leading-relaxed"><strong>Appointment Details:</strong> Information related to appointments booked through the Platform, such as selected provider, service type (if provided), date, and time.</li>
          <li className="text-gray-700 leading-relaxed"><strong>Communication Data:</strong> Any information you provide when you communicate with us for support, feedback, or inquiries.</li>
        </ul>

        <h4 className="text-lg font-semibold mt-3 mb-1 text-gray-700">B. Sensitive Personal Information (SPI) You Provide:</h4>
        <ul className="list-disc list-inside pl-4 mb-4 space-y-1">
          <li className="text-gray-700 leading-relaxed"><strong>Health Tracking Data:</strong> Information you voluntarily input into features like the <strong>Pill Tracker</strong> (e.g., medication name, dose, schedule, adherence status) and the <strong>Menstrual Tracker</strong> (e.g., cycle start/end dates, flow intensity, symptoms, related notes).</li>
          <li className="text-gray-700 leading-relaxed"><strong>AI Health Assessment Data:</strong> Symptoms, medical history details, and lifestyle factors you provide to the AI-assisted health assessment feature.</li>
          <li className="text-gray-700 leading-relaxed"><strong>Other Health Information:</strong> Any other health-related information you explicitly enter or upload to the Platform (e.g., personal notes related to your health, responses to health questionnaires if any).</li>
          <li className="text-gray-700 leading-relaxed"><strong>Collection and Processing of SPI requires your explicit consent.</strong> We will seek this consent at the point of collection or before you use features processing SPI.</li>
        </ul>

        <h4 className="text-lg font-semibold mt-3 mb-1 text-gray-700">C. Information Collected Automatically When You Use the Services:</h4>
        <ul className="list-disc list-inside pl-4 mb-4 space-y-1">
          <li className="text-gray-700 leading-relaxed"><strong>Usage Data:</strong> Details of your interactions with the Platform, such as features used, pages or screens viewed, search queries (e.g., within the provider directory), content accessed, timestamps of activity, frequency of use, and other user engagement patterns. This is collected via Supabase logs and Google Cloud Logging for Cloud Run.</li>
          <li className="text-gray-700 leading-relaxed"><strong>Device and Technical Information:</strong></li>
        </ul>
        <ul className="list-disc list-inside pl-8 mb-4 space-y-1"> {/* Nested List */} 
          <li className="text-gray-700 leading-relaxed">For `carepop-nativeapp`: Device type, operating system, OS version, Expo application version, unique device identifiers (where permitted and necessary), IP address (may be truncated or anonymized), app crash reports.</li>
          <li className="text-gray-700 leading-relaxed">For `carepop-web`: Browser type, operating system, IP address, referring URLs, pages visited, device type (desktop/mobile).</li>
        </ul>
        <ul className="list-disc list-inside pl-4 mb-4 space-y-1">
          <li className="text-gray-700 leading-relaxed"><strong>Cookies and Similar Technologies (Web Application):</strong> Our web application (`carepop-web`) uses cookies (small text files stored on your device) and similar technologies (e.g., web beacons, pixels) to provide functionality, enhance user experience, analyze usage, remember your preferences (like login sessions), and for security purposes. You can manage your cookie preferences through your browser settings. For more details, see our [Link to Cookie Policy if separate, or elaborate here].</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-800">3. How We Use Your Information (Purposes of Processing)</h2>
        <p className="mb-4 text-gray-700 leading-relaxed">Your personal information and SPI are processed for the following legitimate and declared purposes:</p>
        <ul className="list-disc list-inside pl-4 mb-4 space-y-1">
          <li className="text-gray-700 leading-relaxed"><strong>To Provide, Operate, and Maintain the Services:</strong> To facilitate account creation, authenticate users, enable appointment booking and management, operate the provider directory, provide health tracking functionalities, and deliver all other features of the Platform.</li>
          <li className="text-gray-700 leading-relaxed"><strong>To Personalize Your Experience:</strong> To tailor content or features based on your preferences or usage (e.g., showing relevant providers).</li>
          <li className="text-gray-700 leading-relaxed"><strong>To Communicate With You:</strong> To send service-related notifications (appointment confirmations/reminders – ensuring sensitive details are omitted from unsecure channels like basic push/SMS text), security alerts, policy updates, respond to your inquiries and support requests.</li>
          <li className="text-gray-700 leading-relaxed"><strong>To Improve and Develop Our Services:</strong> To analyze usage patterns, conduct research and development (using anonymized/aggregated data where possible), troubleshoot issues, and enhance the usability, features, and performance of both `carepop-nativeapp` and `carepop-web`.</li>
          <li className="text-gray-700 leading-relaxed"><strong>To Ensure Security, Safety, and Prevent Fraud:</strong> To protect the Platform and our users by monitoring for suspicious activity, investigating potential breaches, and enforcing our Terms ofService.</li>
          <li className="text-gray-700 leading-relaxed"><strong>To Comply with Legal and Regulatory Obligations:</strong> To adhere to the requirements of the DPA, respond to lawful requests from government authorities, and fulfill our legal duties.</li>
          <li className="text-gray-700 leading-relaxed"><strong>Reporting and Analytics (Anonymized/Aggregated):</strong> To create statistical reports and perform analytics for FPOP's internal operational planning, service improvement, and potentially for public health research/reporting initiatives. All such data used for external reporting will be anonymized and aggregated to ensure individual users cannot be identified (reference COMPLIANCE-8).</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-800">4. Legal Basis for Processing Your Information</h2>
        <p className="mb-4 text-gray-700 leading-relaxed">We process your data on the following legal bases under the DPA:</p>
        <ul className="list-disc list-inside pl-4 mb-4 space-y-1">
          <li className="text-gray-700 leading-relaxed"><strong>Consent:</strong> Primarily for <strong>Sensitive Personal Information (SPI)</strong> related to your health (e.g., tracker data, AI assessment inputs). We obtain your explicit, informed consent before collecting or processing such SPI. You have the right to withdraw your consent at any time, though this may affect your ability to use certain features.</li>
          <li className="text-gray-700 leading-relaxed"><strong>Contract:</strong> Processing your account information and usage data is necessary for the performance of our agreement with you (our Terms of Service) to provide the Platform and its Services.</li>
          <li className="text-gray-700 leading-relaxed"><strong>Legitimate Interests:</strong> For processing non-sensitive data related to service improvement, security, fraud prevention, and operational analytics, where our legitimate interests are not overridden by your fundamental rights and freedoms.</li>
          <li className="text-gray-700 leading-relaxed"><strong>Legal Obligation:</strong> To comply with applicable laws and regulations of the Philippines.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-800">5. Sharing and Disclosure of Your Information</h2>
        <p className="mb-4 text-gray-700 leading-relaxed">We are committed to not selling your personal information. We share your information only in limited, specific circumstances:</p>
        <ul className="list-disc list-inside pl-4 mb-4 space-y-1">
          <li className="text-gray-700 leading-relaxed"><strong>With Your Healthcare Providers (via FPOP):</strong> Authorized FPOP healthcare providers whom you book appointments with, or to whom you grant access, may view relevant portions of your information (e.g., appointment details, consented health records/tracker data) to provide you with healthcare services through the Platform. Access is role-based and governed by the principle of least privilege.</li>
          <li className="text-gray-700 leading-relaxed"><strong>With FPOP Administrative Staff:</strong> Limited, authorized FPOP administrative staff may access necessary information for operational support, user support, managing the provider directory, or system administration, under strict confidentiality obligations and role-based access.</li>
          <li className="text-gray-700 leading-relaxed"><strong>With Our Service Providers:</strong> We use third-party vendors to support the operation of our Platform. These include:</li>
        </ul>
        <ul className="list-disc list-inside pl-8 mb-4 space-y-1"> {/* Nested List */} 
          <li className="text-gray-700 leading-relaxed"><strong>Supabase:</strong> For database hosting, authentication, storage, RLS, and backend functions.</li>
          <li className="text-gray-700 leading-relaxed"><strong>Google Cloud Platform (GCP):</strong> For hosting custom backend logic (Cloud Run), secure key management (Secret Manager), logging, and scheduling.</li>
          <li className="text-gray-700 leading-relaxed"><strong>(Future):</strong> Notification delivery services, AI/NLP providers, analytics providers.</li>
        </ul>
        <p className="mb-4 text-gray-700 leading-relaxed">These providers are contractually bound (via Data Processing Agreements and/or Business Associate Agreements where applicable) to protect your information and process it only for the purposes we specify, adhering to DPA standards.</p>
        <ul className="list-disc list-inside pl-4 mb-4 space-y-1">
          <li className="text-gray-700 leading-relaxed"><strong>For Legal Reasons or Safety:</strong> We may disclose your information if required by law or in good faith belief that such action is necessary to: (a) comply with a legal obligation or a lawful request by public authorities; (b) protect and defend the rights or property of FPOP or CarePoP/QueerCare; (c) prevent or investigate possible wrongdoing in connection with the Service; (d) protect the personal safety of users of the Service or the public; (e) protect against legal liability.</li>
          <li className="text-gray-700 leading-relaxed"><strong>Anonymized and Aggregated Data:</strong> We may share data that has been anonymized and aggregated (meaning it cannot be used to identify you) for research, statistical analysis, public health initiatives, or service improvement purposes.</li>
          <li className="text-gray-700 leading-relaxed"><strong>Business Transfers (Future):</strong> If FPOP or the CarePoP/QueerCare platform undergoes a merger, acquisition, or asset sale, your information may be transferred as part of that transaction, subject to undertakings of confidentiality by the acquiring party.</li>
          <li className="text-gray-700 leading-relaxed"><strong>With Your Explicit Consent:</strong> We will share your information with other third parties only with your prior explicit consent.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-800">6. Data Security</h2>
        <p className="mb-4 text-gray-700 leading-relaxed">We implement and maintain reasonable and appropriate organizational, physical, and technical security measures designed to protect the confidentiality, integrity, and availability of your personal and sensitive personal information from accidental or unlawful destruction, alteration, and disclosure, as well as against any other unlawful processing. Key measures include:</p>
        <ul className="list-disc list-inside pl-4 mb-4 space-y-1">
          <li className="text-gray-700 leading-relaxed"><strong>Application-Level Encryption:</strong> Sensitive Personal Information (e.g., health tracking data) is encrypted using AES-256-GCM (via a backend Cloud Run utility - SEC-E-2) before it is stored in the Supabase database.</li>
          <li className="text-gray-700 leading-relaxed"><strong>Encryption in Transit:</strong> All data transmitted between your device/browser and our servers (Supabase, Cloud Run) is encrypted using TLS/HTTPS.</li>
          <li className="text-gray-700 leading-relaxed"><strong>Access Controls:</strong> Supabase Row Level Security (RLS) and Role-Based Access Controls (RBAC) are implemented in the backend to restrict data access based on user roles and permissions.</li>
          <li className="text-gray-700 leading-relaxed"><strong>Secure Authentication:</strong> User authentication is managed via Supabase Auth, with secure password hashing.</li>
          <li className="text-gray-700 leading-relaxed"><strong>Secure Infrastructure:</strong> Utilizing secure cloud infrastructure (Supabase, GCP) configured with security best practices.</li>
          <li className="text-gray-700 leading-relaxed"><strong>Secrets Management:</strong> Securely managing API keys, database credentials, and encryption keys using Google Cloud Secret Manager.</li>
          <li className="text-gray-700 leading-relaxed"><strong>Regular Security Assessments:</strong> Performing vulnerability scans and planning for penetration testing.</li>
          <li className="text-gray-700 leading-relaxed"><strong>Data Minimization:</strong> Collecting only the data necessary for the declared purposes.</li>
        </ul>
        <p className="mb-4 text-gray-700 leading-relaxed">Despite these measures, no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Information, we cannot guarantee its absolute security.</p>

        <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-800">7. Data Retention</h2>
        <p className="mb-4 text-gray-700 leading-relaxed">We retain your personal information and SPI only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law (e.g., for medical record keeping requirements where applicable, DPA provisions, or other legal obligations). When your information is no longer needed, or upon a valid deletion request, it will be securely deleted or anonymized in accordance with our Data Retention Policy (reference COMPLIANCE-4).</p>

        <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-800">8. Your Rights as a Data Subject</h2>
        <p className="mb-4 text-gray-700 leading-relaxed">In accordance with the Data Privacy Act of 2012, you are entitled to the following rights:</p>
        <ul className="list-disc list-inside pl-4 mb-4 space-y-1">
          <li className="text-gray-700 leading-relaxed"><strong>The Right to be Informed</strong> about the collection and processing of your personal data.</li>
          <li className="text-gray-700 leading-relaxed"><strong>The Right to Access</strong> your personal data.</li>
          <li className="text-gray-700 leading-relaxed"><strong>The Right to Object</strong> to the processing of your personal data.</li>
          <li className="text-gray-700 leading-relaxed"><strong>The Right to Erasure or Blocking</strong> of your personal data.</li>
          <li className="text-gray-700 leading-relaxed"><strong>The Right to Rectification</strong> of inaccurate personal data.</li>
          <li className="text-gray-700 leading-relaxed"><strong>The Right to Data Portability</strong> of your personal data in a commonly used electronic format.</li>
          <li className="text-gray-700 leading-relaxed"><strong>The Right to File a Complaint</strong> with the National Privacy Commission (NPC).</li>
          <li className="text-gray-700 leading-relaxed"><strong>The Right to Damages</strong> in case of any violation of your rights.</li>
        </ul>
        <p className="mb-4 text-gray-700 leading-relaxed">You can exercise these rights by contacting us using the details provided in Section 12. We will respond to your requests within the timeframes prescribed by the DPA. We may require you to verify your identity before acting on your request.</p>

        <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-800">9. International Data Transfers</h2>
        <p className="mb-4 text-gray-700 leading-relaxed">The CarePoP/QueerCare platform and its backend services (Supabase, Google Cloud Platform) may involve storing or processing your data on servers located outside of the Philippines. When we transfer personal data outside the Philippines, we will ensure that such transfers comply with DPA requirements, implementing appropriate safeguards such as adequacy decisions, standard contractual clauses, or reliance on the service provider's binding corporate rules or compliance certifications.</p>

        <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-800">10. Children's Privacy</h2>
        <p className="mb-4 text-gray-700 leading-relaxed">Our Services are not directed to individuals under the age of `[Specify FPOP's defined minimum age for independent access, e.g., 18]`. We do not knowingly collect Personal Information from children under this age without verified parental or legal guardian consent. If we become aware that we have collected Personal Information from a child under this age without such consent, we will take steps to delete that information. If you are a parent or guardian and you are aware that your child has provided us with Personal Information without your consent, please contact us. [<strong>Note:</strong> The specific age and process for minor's access requires legal/FPOP definition based on service scope and Philippine law.]</p>

        <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-800">11. Third-Party Websites and Services</h2>
        <p className_="mb-4 text-gray-700 leading-relaxed">Our Platform may contain links to third-party websites or services. This Privacy Policy does not apply to those third-party services. We encourage you to review the privacy policies of any third-party services you visit.</p>

        <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-800">12. Contact Us – Data Privacy Officer</h2>
        <p className="mb-4 text-gray-700 leading-relaxed">If you have any questions, concerns, or complaints about this Privacy Policy, our data practices, or if you wish to exercise your rights as a data subject, please contact our Data Protection Officer (DPO) [or designated privacy contact for FPOP] at:</p>
        <p className="mb-4 text-gray-700 leading-relaxed">Data Protection Officer (CarePoP/QueerCare)<br />
        c/o Family Planning Organization of the Philippines (FPOP)<br />
        `[FPOP Main Office Address]`<br />
        `[Designated Privacy Email Address, e.g., dpo.carepop@fpop1969.org]`<br />
        `[Designated Privacy Contact Phone Number]`</p>

        <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-800">13. Changes to This Privacy Policy</h2>
        <p className="mb-4 text-gray-700 leading-relaxed">We may update this Privacy Policy from time to time to reflect changes in our practices, legal requirements, or service offerings. We will notify you of any material changes by posting the new Privacy Policy on our Platform (`carepop-web` and within `carepop-nativeapp`) and updating the "Effective Date" at the top. We encourage you to review this Privacy Policy periodically. Your continued use of the Services after any changes constitutes your acceptance of the new Privacy Policy.</p>
      </main>
      <footer className="mt-16 pt-8 border-t border-gray-300 text-center text-sm text-gray-600">
        <p>Last Updated: [Date]</p>
        <p className="mt-1">Please replace [Date] with the actual effective date upon finalization.</p>
        <p className="mt-2">
          For any questions regarding this Privacy Policy, please contact our Data Protection Officer at{' '}
          <a href="mailto:[Designated Privacy Email Address, e.g., dpo.carepop@fpop1969.org]" className="text-blue-600 hover:underline">
            [Designated Privacy Email Address, e.g., dpo.carepop@fpop1969.org]
          </a>
          .
        </p>
      </footer>
    </div>
  );
} 