import SectionHeading from "../../components/SectionHeading.jsx";
import Reveal from "../../components/Reveal.jsx";

export default function Terms() {
  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 900 }}>
        <Reveal>
          <SectionHeading eyebrow="Legal" title="Terms & Conditions" />
          <p style={{ color: "var(--muted)" }}>Last updated: January 2025</p>
        </Reveal>

        <Reveal delay={80}>
          <div className="mt-5">
            <h5 className="mt-4">1. Acceptance of Terms</h5>
            <p style={{ color: "var(--text-soft)" }}>
              By accessing or using this website, you agree to be bound by these Terms
              &amp; Conditions and our Privacy Policy. If you do not agree, please do not
              use our services.
            </p>

            <h5 className="mt-4">2. Use of Website</h5>
            <p style={{ color: "var(--text-soft)" }}>
              You agree to use this website for lawful purposes only and not to interfere with
              its operation or security.
            </p>

            <h5 className="mt-4">3. Intellectual Property</h5>
            <p style={{ color: "var(--text-soft)" }}>
              All content on this site — including text, graphics, logos, and code — is owned
              by us or our licensors and protected by applicable copyright and trademark laws.
            </p>

            <h5 className="mt-4">4. User Submissions</h5>
            <p style={{ color: "var(--text-soft)" }}>
              By submitting information (such as contact forms or job applications), you grant
              us permission to use it to respond to you and provide our services.
            </p>

            <h5 className="mt-4">5. Limitation of Liability</h5>
            <p style={{ color: "var(--text-soft)" }}>
              We are not liable for any indirect, incidental, or consequential damages arising
              from your use of this website or our services.
            </p>

            <h5 className="mt-4">6. Changes to Terms</h5>
            <p style={{ color: "var(--text-soft)" }}>
              We may update these terms at any time. Continued use of the site constitutes
              acceptance of the updated terms.
            </p>

            <h5 className="mt-4">7. Governing Law</h5>
            <p style={{ color: "var(--text-soft)" }}>
              These terms are governed by the laws of India. Any disputes will be subject to
              the exclusive jurisdiction of the courts in India.
            </p>

            <h5 className="mt-4">8. Contact</h5>
            <p style={{ color: "var(--text-soft)" }}>
              For questions about these terms, please reach out via our contact page.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}