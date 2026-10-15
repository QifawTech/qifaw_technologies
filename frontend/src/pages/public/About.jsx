
import { useEffect, useState } from "react";
import { publicApi } from "../../api/client.js";
import SectionHeading from "../../components/SectionHeading.jsx";
import Reveal from "../../components/Reveal.jsx";

export default function About() {
  const [content, setContent] = useState({});

  useEffect(() => {
    publicApi
      .getPageContent("about")
      .then((res) => setContent(res.data.data || {}))
      .catch(() => {});
  }, []);

  const story = content.story || {
    title: "Our Story",
    body: "Founded with a mission to make great software accessible to everyone.",
  };

  return (
    <>
      <section
        style={{
          background: "var(--charcoal)",
          color: "var(--white)",
          padding: "5rem 0 4rem",
        }}
      >
        <div className="container">
          <Reveal>
            <div style={{ maxWidth: 720 }}>
              <div
                className="d-inline-block mb-3 px-3 py-1 rounded-pill"
                style={{
                  background: "rgba(201,243,106,.15)",
                  color: "var(--lime)",
                  fontWeight: 700,
                  fontSize: ".8rem",
                  letterSpacing: ".08em",
                }}
              >
                ABOUT US
              </div>
              <h1 style={{ color: "var(--white)", fontSize: "clamp(2rem, 4vw, 3rem)" }}>
                {story.title}
              </h1>
              <p style={{ color: "#B8BDB6", fontSize: "1.05rem" }}>{story.body}</p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="row g-4 mb-5">
            <div className="col-md-6">
              <Reveal>
                <div className="card-clean p-4 h-100">
                  <i className="bi bi-bullseye" style={{ fontSize: 32, color: "var(--charcoal)" }} />
                  <h4 className="mt-3">Our Mission</h4>
                  <p className="text-muted mb-0">
                    Empower businesses with reliable, modern, and scalable software solutions
                    that drive real growth.
                  </p>
                </div>
              </Reveal>
            </div>
            <div className="col-md-6">
              <Reveal delay={100}>
                <div className="card-clean p-4 h-100">
                  <i className="bi bi-eye" style={{ fontSize: 32, color: "var(--charcoal)" }} />
                  <h4 className="mt-3">Our Vision</h4>
                  <p className="text-muted mb-0">
                    To become the most trusted partner for digital product engineering
                    across the globe.
                  </p>
                </div>
              </Reveal>
            </div>
          </div>

          <Reveal>
            <SectionHeading eyebrow="Values" title="What we stand for" center />
          </Reveal>
          <div className="row g-4">
            {[
              { icon: "bi-shield-check", title: "Integrity", desc: "We do what we say — always." },
              { icon: "bi-lightning-charge", title: "Innovation", desc: "Always learning, always shipping." },
              { icon: "bi-people", title: "Collaboration", desc: "Great work is a team sport." },
              { icon: "bi-award", title: "Quality", desc: "Craftsmanship in every line of code." },
            ].map((v, i) => (
              <div className="col-md-6 col-lg-3" key={i}>
                <Reveal delay={i * 80}>
                  <div className="card-clean p-4 text-center h-100">
                    <i className={`bi ${v.icon}`} style={{ fontSize: 28, color: "var(--charcoal)" }} />
                    <h6 className="mt-3 mb-1">{v.title}</h6>
                    <p className="text-muted small mb-0">{v.desc}</p>
                  </div>
                </Reveal>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ background: "var(--white)" }}>
        <div className="container">
          <Reveal>
            <SectionHeading eyebrow="Our Journey" title="Milestones" center />
          </Reveal>
          <div className="row g-4">
            {[
              { year: "2019", title: "Founded", desc: "Started with a small, focused team." },
              { year: "2021", title: "First SaaS Launch", desc: "Shipped our flagship product." },
              { year: "2023", title: "100+ Clients", desc: "Trusted by teams worldwide." },
              { year: "2025", title: "Global Expansion", desc: "Serving customers in 10+ countries." },
            ].map((m, i) => (
              <div className="col-md-6 col-lg-3" key={i}>
                <Reveal delay={i * 80}>
                  <div className="card-clean p-4 h-100">
                    <div
                      className="fw-bold mb-2"
                      style={{ color: "#5A6B14", fontSize: ".85rem", letterSpacing: ".08em" }}
                    >
                      {m.year}
                    </div>
                    <h6>{m.title}</h6>
                    <p className="text-muted small mb-0">{m.desc}</p>
                  </div>
                </Reveal>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal>
            <div
              style={{
                background: "var(--charcoal)",
                color: "var(--white)",
                borderRadius: 24,
                padding: "4rem 2rem",
                textAlign: "center",
              }}
            >
              <h2 style={{ color: "var(--white)" }} className="mb-3">
                Want to work with us?
              </h2>
              <p style={{ color: "#B8BDB6" }} className="mb-4">
                Let's build something great together.
              </p>
              <a href="/contact" className="btn btn-lime btn-lg">
                Contact Us <i className="bi bi-arrow-right ms-1" />
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}