export default function TermsPage() {
  const sections = [
    {
      title: "1. Acceptance of Terms",
      body: "By downloading, installing, activating, or using this application, you agree to these Terms of Service. If you do not agree, discontinue use immediately."
    },
    {
      title: "2. Purpose of this Application",
      body: "This application is an independent CV drafting tool created to help students prepare resumes before using their institution's official CV platform. It is not affiliated with, endorsed by, or sponsored by any university or placement office unless explicitly stated."
    },
    {
      title: "3. User Responsibility",
      body: "You are solely responsible for all information entered, generated, exported, or submitted using this application. Always verify your CV before using it."
    },
    {
      title: "4. No Official Affiliation",
      body: "This software is an independent project. Any institutional CV format is used only to assist users in preparing their resumes."
    },
    {
      title: "5. No Warranty",
      body: "The application is provided 'AS IS' and 'AS AVAILABLE' without warranties of any kind, express or implied."
    },
    {
      title: "6. Limitation of Liability",
      body: "The developer shall not be liable for placement outcomes, academic consequences, data loss, software errors, formatting mistakes, financial loss, or any indirect or consequential damages."
    },
    {
      title: "7. License Verification",
      body: "A valid license may be required. Licenses may be bound to a device and verified online. Fraudulent or shared licenses may be revoked."
    },
    {
      title: "8. Acceptable Use",
      body: "You agree not to reverse engineer, redistribute, modify, bypass licensing, share license keys, or use the application for unlawful purposes."
    },
    {
      title: "9. Intellectual Property",
      body: "All software, source code, UI, branding, and documentation remain the intellectual property of the developer unless otherwise stated."
    },
    {
      title: "10. Privacy",
      body: "By using this application, you also agree to the accompanying Privacy Policy."
    },
    {
      title: "11. Updates",
      body: "The developer may update, modify, or discontinue the application at any time."
    },
    {
      title: "12. Termination",
      body: "Access may be suspended or revoked if these Terms are violated."
    },
    {
      title: "13. Indemnification",
      body: "You agree to indemnify and hold harmless the developer from any claims arising from your misuse of the application."
    },
    {
      title: "14. Governing Law",
      body: "These Terms shall be governed by the laws applicable in the jurisdiction where the developer operates."
    },
    {
      title: "15. Contact",
      body: "Questions regarding these Terms may be sent to: your@email.com"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6 font-sans text-white">
      <div className="max-w-5xl w-full bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl overflow-hidden">
        <div className="border-b border-gray-800 p-8 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-blue-900/30 border border-blue-500/30 flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6M7 4h7l5 5v11a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2z"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold">Terms of Service</h1>
          <p className="text-gray-400 mt-2">
            Please read these terms carefully before using CV Builder Studio.
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Last Updated: July 2026
          </p>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-8">
          <div className="mb-8 bg-gray-950 border border-gray-800 rounded-xl p-5">
            <h2 className="text-lg font-semibold text-blue-400 mb-3">Quick Summary</h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-300">
              <li>This is an independent CV drafting tool.</li>
              <li>You are responsible for your CV and its contents.</li>
              <li>No affiliation with any institution unless stated.</li>
              <li>The application is provided without warranties.</li>
              <li>Misuse or license abuse may result in termination.</li>
            </ul>
          </div>

          {sections.map((s) => (
            <section key={s.title} className="mb-8">
              <h2 className="text-xl font-semibold text-blue-400 mb-3">
                {s.title}
              </h2>
              <p className="text-gray-300 leading-8">
                {s.body}
              </p>
            </section>
          ))}

          <div className="mt-10 border-t border-gray-800 pt-6">
            <p className="text-gray-400 leading-7">
              By clicking <strong>"I Agree"</strong>, activating your license,
              or continuing to use this application, you acknowledge that you
              have read, understood, and agree to be legally bound by these
              Terms of Service. You also acknowledge that the developer is not
              responsible for decisions, submissions, placement outcomes, or
              damages arising from your use of this software.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
