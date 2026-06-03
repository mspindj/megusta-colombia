export const metadata = {
  title: "Terms of Service — Me Gusta Colombia",
  description: "Terms of Service for Me Gusta Colombia",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-[#aaaaaa] py-16 px-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Terms of Service</h1>
        <p className="text-sm text-[#555] mb-10">Last updated: June 3, 2026</p>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-3">1. Acceptance</h2>
          <p>By using megusta.com.co or purchasing our guides, you agree to these Terms of Service. If you do not agree, please do not use our services.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-3">2. Our services</h2>
          <p>Me Gusta Colombia provides travel intelligence guides and resources for travelers visiting Colombia. Our content is for informational purposes only. We do not guarantee specific outcomes from following our recommendations.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-3">3. Purchases</h2>
          <p>City guides are sold as digital products via Gumroad. All sales are final. If you experience a technical issue accessing your purchase, contact <a href="mailto:hola@megusta.com.co" className="text-[#d4a843]">hola@megusta.com.co</a> within 7 days.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-3">4. Intellectual property</h2>
          <p>All content on megusta.com.co — including guides, text, and images — is owned by Me Gusta Colombia. You may not reproduce or redistribute our content without written permission.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-3">5. Disclaimer</h2>
          <p>Travel involves inherent risks. Our guides provide general information and are not a substitute for professional advice. Safety conditions in Colombia change — always verify current information with local authorities and your government&apos;s travel advisory.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-3">6. Limitation of liability</h2>
          <p>Me Gusta Colombia is not liable for any damages arising from the use of our content or services, including personal injury, loss of property, or financial loss.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-3">7. Contact</h2>
          <p><a href="mailto:hola@megusta.com.co" className="text-[#d4a843]">hola@megusta.com.co</a></p>
        </section>
      </div>
    </main>
  );
}
