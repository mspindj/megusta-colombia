export const metadata = {
  title: "Privacy Policy — Me Gusta Colombia",
  description: "Privacy Policy for Me Gusta Colombia",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-[#aaaaaa] py-16 px-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
        <p className="text-sm text-[#555] mb-10">Last updated: June 3, 2026</p>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-3">1. Who we are</h2>
          <p>Me Gusta Colombia (<strong className="text-white">megusta.com.co</strong>) is a travel intelligence platform providing city guides and safety resources for travelers visiting Colombia. Contact: <a href="mailto:hola@megusta.com.co" className="text-[#d4a843]">hola@megusta.com.co</a></p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-3">2. Information we collect</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong className="text-white">Email address</strong> — when you subscribe to our free guide or newsletter.</li>
            <li><strong className="text-white">Usage data</strong> — pages visited, time on site, via Meta Pixel and analytics tools.</li>
            <li><strong className="text-white">Transaction data</strong> — purchase records if you buy a city guide via Gumroad (processed by Gumroad, not stored by us).</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-3">3. How we use your information</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Send you the free Colombia Arrival Cheat Sheet you requested.</li>
            <li>Send travel intelligence updates and city guide promotions (you can unsubscribe at any time).</li>
            <li>Improve our website and measure the effectiveness of our content.</li>
            <li>Show you relevant ads on Meta platforms (Facebook and Instagram) via Meta Pixel.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-3">4. Meta Pixel</h2>
          <p>We use the Meta Pixel (ID: 1525809615712600) to measure conversions and show relevant ads to users who visit our site. This may involve sharing hashed email addresses and behavioral data with Meta Platforms, Inc. You can opt out via <a href="https://www.facebook.com/settings/?tab=ads" className="text-[#d4a843]" target="_blank" rel="noreferrer">Meta Ads Settings</a>.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-3">5. Data sharing</h2>
          <p>We do not sell your personal data. We share data only with:</p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li><strong className="text-white">Brevo</strong> — email delivery service.</li>
            <li><strong className="text-white">Supabase</strong> — database and backend infrastructure.</li>
            <li><strong className="text-white">Meta Platforms</strong> — for advertising measurement.</li>
            <li><strong className="text-white">Vercel</strong> — website hosting.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-3">6. Your rights</h2>
          <p>You may request access to, correction of, or deletion of your personal data at any time by emailing <a href="mailto:hola@megusta.com.co" className="text-[#d4a843]">hola@megusta.com.co</a>. EU residents have additional rights under GDPR. Colombian residents have rights under Law 1581 of 2012.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-3">7. Data retention</h2>
          <p>We retain email addresses until you unsubscribe. Usage data is retained for up to 12 months. You can request deletion at any time.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-3">8. Cookies</h2>
          <p>We use cookies for analytics and advertising measurement. You can disable cookies in your browser settings, though this may affect site functionality.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-3">9. Contact</h2>
          <p>For any privacy questions or requests: <a href="mailto:hola@megusta.com.co" className="text-[#d4a843]">hola@megusta.com.co</a></p>
        </section>
      </div>
    </main>
  );
}
