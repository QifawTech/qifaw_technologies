import { useEffect, useState } from "react";
import { publicApi } from "../../api/client.js";
import ProductCard from "../../components/ProductCard.jsx";
import Loader from "../../components/Loader.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import ErrorAlert from "../../components/ErrorAlert.jsx";
import SectionHeading from "../../components/SectionHeading.jsx";

export default function Products() {
  const [state, setState] = useState({
    loading: true,
    error: null,
    items: [],
    categories: [],
    total: 0,
    page: 1,
    totalPages: 1,
    category: "",
    search: "",
  });

  const load = async (overrides = {}) => {
    const page = overrides.page ?? state.page;
    const category = overrides.category ?? state.category;
    const search = overrides.search ?? state.search;
    setState((s) => ({ ...s, loading: true, error: null, page, category, search }));
    try {
      const res = await publicApi.getProducts({ page, per_page: 9, category, search });
      const d = res.data.data;
      setState((s) => ({
        ...s,
        loading: false,
        items: d.items,
        total: d.total,
        totalPages: d.total_pages,
      }));
    } catch (e) {
      setState((s) => ({ ...s, loading: false, error: e.message }));
    }
  };

  useEffect(() => {
    load({ page: 1 });
    publicApi
      .getProductCategories()
      .then((r) => setState((s) => ({ ...s, categories: r.data.data || [] })))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearch = (e) => {
    e.preventDefault();
    load({ page: 1 });
  };

  return (
    <section className="section">
      <div className="container">
        <SectionHeading
          eyebrow="Products"
          title="Our Products"
          description="Modern software products built for real businesses."
        />

        <div className="row g-3 mb-4">
          <div className="col-md-6">
            <form onSubmit={onSearch} className="d-flex gap-2">
              <input
                className="form-control"
                placeholder="Search products..."
                value={state.search}
                onChange={(e) => setState((s) => ({ ...s, search: e.target.value }))}
              />
              <button className="btn btn-lime" type="submit">Search</button>
            </form>
          </div>
          <div className="col-md-6">
            <select
              className="form-select"
              value={state.category}
              onChange={(e) => load({ page: 1, category: e.target.value })}
            >
              <option value="">All Categories</option>
              {state.categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <ErrorAlert message={state.error} onClose={() => setState((s) => ({ ...s, error: null }))} />

        {state.loading ? (
          <Loader />
        ) : state.items.length === 0 ? (
          <EmptyState icon="bi-box" title="No products found" message="Try a different filter." />
        ) : (
          <>
            <div className="row g-4">
              {state.items.map((p) => (
                <div className="col-md-6 col-lg-4" key={p.id}>
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
            {state.totalPages > 1 && (
              <nav className="mt-5 d-flex justify-content-center">
                <ul className="pagination">
                  {Array.from({ length: state.totalPages }, (_, i) => i + 1).map((n) => (
                    <li key={n} className={`page-item ${n === state.page ? "active" : ""}`}>
                      <button className="page-link" onClick={() => load({ page: n })}>{n}</button>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
          </>
        )}
      </div>
    </section>
  );
}