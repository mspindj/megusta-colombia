export const metadata = {
  title: "Data Deletion — Me Gusta Colombia",
  description: "How to request deletion of your data from Me Gusta Colombia",
};

export default function DataDeletionPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-[#aaaaaa] py-16 px-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Data Deletion Instructions</h1>
        <p className="text-sm text-[#555] mb-10">Last updated: June 3, 2026</p>

        <section className="mb-8">
          <p className="mb-4">
            If you used Facebook or Instagram to interact with Me Gusta Colombia and would like to
            delete your data from our systems, you can request deletion by following these steps:
          </p>

          <div className="bg-[#141414] rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-white mb-4">How to request data deletion</h2>
            <ol className="list-decimal pl-5 space-y-3">
              <li>Send an email to <a href="mailto:hola@megusta.com.co" className="text-[#d4a843]">hola@megusta.com.co</a> with subject: <strong className="text-white">"Data Deletion Request"</strong></li>
              <li>Include the email address associated with your account or Facebook profile.</li>
              <li>We will process your request within <strong className="text-white">30 days</strong> and confirm deletion via email.</li>
            </ol>
          </div>

          <p>Data we will delete upon request:</p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>Your email address from our mailing list</li>
            <li>Any profile data received via Facebook/Instagram login</li>
            <li>Purchase and interaction records linked to your identity</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-3">Automatic unsubscribe</h2>
          <p>Every email we send includes an unsubscribe link. Clicking it removes your email from all future communications immediately.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-3">Questions</h2>
          <p>Contact us at <a href="mailto:hola@megusta.com.co" className="text-[#d4a843]">hola@megusta.com.co</a></p>
        </section>
      </div>
    </main>
  );
}
