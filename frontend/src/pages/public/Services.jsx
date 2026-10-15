import { useEffect, useState } from "react";
import { publicApi } from "../../api/client.js";
import ServiceCard from "../../components/ServiceCard.jsx";
import Loader from "../../components/Loader.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import ErrorAlert from "../../components/ErrorAlert.jsx";
import SectionHeading from "../../components/SectionHeading.jsx";

export default function Services() {
  const [state, setState] = useState({ loading: true, error: null, items: [] });

  useEffect(() => {
    publicApi
      .getServices()
      .then((r) => setState({ loading: false, error: null, items: r.data.data || [] }))
      .catch((e) => setState({ loading: false, error: e.message, items: [] }));
  }, []);

  return (
    <section className="section">
      <div className="container">
        <SectionHeading
          eyebrow="Services"
          title="What we offer"
          description="High-quality services to design, build, ship and scale your product."
          center
        />
        <ErrorAlert message={state.error} />
        {state.loading ? (
          <Loader />
        ) : state.items.length === 0 ? (
          <EmptyState icon="bi-gear" title="No services yet" />
        ) : (
          <div className="row g-4">
            {state.items.map((s) => (
              <div className="col-md-6 col-lg-4" key={s.id}>
                <ServiceCard service={s} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}