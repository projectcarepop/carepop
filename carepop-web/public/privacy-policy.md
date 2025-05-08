DRAFT - Privacy Policy for CarePoP/QueerCare
Effective Date: [Date]
1. Introduction & Scope
The Family Planning Organization of the Philippines (FPOP) ("We", "Us", "Our") is committed to protecting the privacy and security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use the CarePoP/QueerCare Platform (the "Platform"), which includes our native mobile application (carepop-nativeapp) and our web application (carepop-web), collectively referred to as the "Services".
This Policy applies to all users ("User", "You") of the Platform and Services and is designed to comply with the Republic Act No. 10173, also known as the Data Privacy Act of 2012 (DPA), and its Implementing Rules and Regulations (IRR). Please read this Privacy Policy carefully. By using the Platform, you signify your understanding and agreement with these practices.
2. Information We Collect
We collect different types of information in connection with the Services:
A. Information You Provide Directly:
Account Information: When you register, we collect information such as your name, email address, password (hashed securely via Supabase Auth), date of birth, contact number, and potentially address details.
Demographic Information: We may ask for optional demographic information (e.g., gender identity, pronouns, ethnicity) to help us provide inclusive services and understand community needs. Providing this information is voluntary.
Health Information You Input: Information you voluntarily enter into tracking features like the Pill Tracker (medication name, dose, schedule, status) or Menstrual Tracker (cycle dates, flow, symptoms, notes). This is considered Sensitive Personal Information (SPI) under the DPA.
Assessment Information: Information you provide when using features like the AI-assisted health assessment (symptoms, health history). This may constitute SPI.
Communications: Information you provide when you contact us for support or feedback.
Appointment Information: Details related to appointments booked through the Platform (requested time, provider, reason - if provided).
B. Information Collected Automatically:
Usage Data: Information about how you access and use the Platform, such as features used, pages viewed, search queries (within the directory), timestamps of activity, and interaction patterns. This is collected via standard logging (Supabase, Google Cloud Logging).
Device Information: Information about the device you use to access the Services, including device type, operating system version, unique device identifiers (as permitted by OS), IP address (potentially anonymized where feasible), browser type (for web).
Cookies and Similar Technologies (Web Application): Our web application (carepop-web) may use cookies and similar tracking technologies to enhance user experience, analyze usage, and manage sessions. You can control cookie preferences through your browser settings.
C. Sensitive Personal Information (SPI):
As defined by the DPA, SPI includes information about an individual's health, sex life, race, ethnicity, genetics, etc. We explicitly recognize that information collected through the Health Tracking features (Pill Tracker, Menstrual Tracker) and potentially parts of the AI Health Assessment constitutes SPI. We handle this data with the highest level of care and security, and its processing is primarily based on your explicit consent.
3. How We Use Your Information
We use the information we collect for the following purposes:
To Provide and Operate the Services: To create and manage your account, facilitate appointment booking, provide access to the provider directory, enable health tracking features, and deliver other core functionalities of the Platform.
To Authenticate Users: To verify your identity when you log in, using Supabase Authentication.
To Communicate With You: To send important notices, confirmations, appointment reminders (ensuring sensitive health details are NOT included directly in push notifications/SMS), updates about the Services, respond to your inquiries, and provide support.
To Improve the Services: To understand how users interact with the Platform, analyze usage trends, gather feedback, and enhance the features, usability, and performance of both the native and web applications. Aggregated and anonymized data may be used for this purpose.
To Ensure Security and Prevent Fraud: To monitor for and prevent fraudulent activity, security breaches, and misuse of the Platform.
To Comply with Legal Obligations: To meet legal and regulatory requirements under Philippine law, respond to lawful requests from authorities, and enforce our Terms of Service.
Reporting & Research (Anonymized/Aggregated): To generate anonymized and aggregated reports for FPOP's internal analysis, operational efficiency, and potentially for public health insights or research purposes, ensuring individual users cannot be re-identified (reference COMPLIANCE-8).
4. Legal Basis for Processing Your Information
We process your personal information based on the following legal grounds under the DPA:
Consent: We rely on your explicit consent for processing Sensitive Personal Information (SPI), such as data entered into the Health Tracking features. Consent is obtained during registration or when you first use such features. You have the right to withdraw your consent at any time for future processing.
Performance of a Contract: Processing necessary account and operational data is required to provide the Services you requested under our Terms of Service.
Legitimate Interests: We process certain usage and device data for legitimate interests such as improving the service, ensuring security, and preventing fraud, provided these interests are not overridden by your fundamental rights and freedoms.
Legal Obligation: We may process information to comply with applicable laws and regulations.
5. Data Sharing and Disclosure
We do not sell your personal information. We may share your information only in the following limited circumstances:
With FPOP Staff: Authorized FPOP healthcare providers and administrative staff may access relevant portions of your information strictly as needed to provide care (e.g., view scheduled appointments, access consented health records) or support services, based on defined roles and permissions enforced by our access control systems (RBAC/RLS).
With Service Providers: We engage trusted third-party companies to perform functions and provide services to us, such as cloud hosting (Google Cloud Platform), database and authentication services (Supabase), analytics providers, notification delivery services, and potentially AI/NLP providers. We share information with these providers only to the extent necessary for them to perform their services, and we require them contractually (through Data Processing Agreements and potentially Business Associate Agreements where HIPAA is relevant) to protect your data according to strict security and confidentiality standards aligned with DPA requirements.
For Legal Reasons: We may disclose information if required by law, subpoena, court order, or other governmental request, or if we believe in good faith that disclosure is necessary to protect our rights, protect your safety or the safety of others, investigate fraud, or respond to a government request.
Aggregated or Anonymized Data: We may share aggregated or anonymized information (which cannot reasonably identify you) for research, statistical analysis, reporting, or public health purposes.
With Your Consent: We may share information with other third parties if we have your explicit consent to do so.
6. Data Security
We implement reasonable and appropriate technical, physical, and organizational security measures designed to protect your personal information against unauthorized access, disclosure, alteration, destruction, and loss. These measures include:
Encryption: Application-level encryption (AES-256-GCM) for sensitive data (SPI/PHI) at rest before storage in Supabase, and TLS/HTTPS encryption for data in transit.
Access Controls: Robust Role-Based Access Control (RBAC) implemented primarily via Supabase Row Level Security (RLS) and supplemented by application-level checks in our backend services, adhering to the principle of least privilege.
Secure Infrastructure: Utilizing secure cloud infrastructure provided by Google Cloud Platform and Supabase, configured with security best practices.
Secure Development Practices: Following secure coding guidelines and conducting regular security reviews and testing (SAST, DAST, Dependency Scanning).
Secrets Management: Using Google Cloud Secret Manager for secure storage and access to API keys, encryption keys, and other secrets.
Regular Audits: Performing periodic security assessments and audits.
While we strive to protect your information, no security system is impenetrable. We cannot guarantee the absolute security of your data.
7. Data Retention
We will retain your personal information only for as long as is necessary to fulfill the purposes for which it was collected, including providing the Services, complying with our legal obligations, resolving disputes, and enforcing our agreements, or as permitted by law. Specific retention periods are defined in our internal data retention policy (reference COMPLIANCE-4) based on data type and legal requirements. Upon expiry of the retention period, data will be securely deleted or anonymized.
8. International Data Transfers
Our service providers (including Supabase and Google Cloud Platform) may store and process your data in servers located outside the Philippines. If we transfer your personal information outside the Philippines, we will ensure that appropriate safeguards are in place as required by the DPA to protect your data (e.g., through contractual clauses, adequacy decisions, or reliance on provider compliance certifications).
9. Your Data Rights (Under the Data Privacy Act)
As a data subject under the DPA, you have the following rights regarding your personal information:
Right to be Informed: To know how your data is processed.
Right to Access: To request access to the personal information we hold about you.
Right to Object: To object to the processing of your data in certain circumstances.
Right to Erasure or Blocking: To request the deletion or blocking of your data under specific conditions.
Right to Rectification: To correct inaccurate or incomplete data.
Right to Data Portability: To receive your data in a structured, commonly used format (where applicable).
Right to File a Complaint: To file a complaint with the National Privacy Commission (NPC) if you believe your privacy rights have been violated.
Right to Damages: To claim compensation if you suffered damages due to inaccurate, incomplete, outdated, false, unlawfully obtained, or unauthorized use of personal data.
How to Exercise Your Rights: To exercise these rights, please contact us using the information provided in Section 13. We will respond to your request in accordance with the DPA. We may need to verify your identity before processing your request.
10. Children's Privacy
The Platform is not intended for use by individuals under the age of [Specify Minimum Age, e.g., 18] without parental or guardian consent where required by law. We do not knowingly collect personal information from children under this age without verifiable parental consent. If you believe we have inadvertently collected such information, please contact us so we can promptly obtain consent or delete the information. [Note: Policy for minors requires specific FPOP/Legal input].
11. Third-Party Links
Our Services may contain links to other websites not operated by us. If you click a third-party link, you will be directed to that third party's site. We strongly advise you to review the Privacy Policy of every site you visit. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services.
12. Changes to This Privacy Policy
We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Effective Date" at the top. For material changes, we may provide more prominent notice (e.g., via email or in-app notification). You are advised to review this Privacy Policy periodically for any changes.
13. Contact Information
If you have any questions or concerns about this Privacy Policy or our data practices, or if you wish to exercise your data subject rights, please contact FPOP or our Data Protection Officer (if appointed) at:
Family Planning Organization of the Philippines (FPOP)
[FPOP Full Contact Address]
[FPOP Privacy Contact Email, e.g., privacy@fpop1969.org]
[FPOP Contact Phone Number]
[If a DPO is appointed, include:]
Data Protection Officer Contact:
[DPO Name or Title]
[DPO Email]
[DPO Phone/Address if different] 