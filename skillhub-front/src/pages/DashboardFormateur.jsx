import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import api from "../services/axios";
import { getUser, logout } from "../services/authService";
import { getCategoryIconByName } from "../utils/categoryVisuals";
import "./Dashboard.css";

const priceRanges = [
  { value: "0-50", label: "0€ - 50€" },
  { value: "50-100", label: "50€ - 100€" },
  { value: "100-150", label: "100€ - 150€" },
  { value: "150+", label: "Plus de 150€" },
];

const durationOptions = [2, 3, 4, 6, 8];

const emptyForm = {
  titre: "",
  description: "",
  duree: "",
  prix: "",
  niveauRequis: "",
  idCategorie: "",
  statut: "brouillon",
};

function ModalFormation({ formation, categories, onClose, onSave }) {
  const isEdit = !!formation;
  const [form, setForm] = useState(
    isEdit
      ? {
          titre: formation.titre,
          description: formation.description || "",
          duree: formation.duree || "",
          prix: formation.prix || "",
          niveauRequis: formation.niveauRequis || "",
          idCategorie: formation.idCategorie || "",
          statut: formation.statut || "brouillon",
        }
      : { ...emptyForm },
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.titre.trim()) {
      setError("Le titre est obligatoire");
      return;
    }
    setSaving(true);
    try {
      let data;
      if (isEdit) {
        const res = await api.put(`/formations/${formation.id}`, form);
        data = res.data;
      } else {
        const res = await api.post("/formations", form);
        data = res.data;
      }
      onSave(data, isEdit);
      onClose();
    } catch (err) {
      setError(
        isEdit
          ? "Erreur lors de la modification"
          : "Erreur lors de la création",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEdit ? "Modifier la formation" : "Nouvelle formation"}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Fermer">
            <i className="fa-solid fa-xmark" aria-hidden="true"></i>
          </button>
        </div>

        {error && <p className="modal-error">{error}</p>}

        <div className="modal-body">
          <div className="form-group">
            <label>Titre *</label>
            <input
              name="titre"
              value={form.titre}
              onChange={handleChange}
              placeholder="Ex: Introduction à React"
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="Décrivez votre formation..."
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Durée (heures)</label>
              <input
                name="duree"
                type="number"
                min="1"
                value={form.duree}
                onChange={handleChange}
                placeholder="Ex: 4"
              />
            </div>
            <div className="form-group">
              <label>Prix (€)</label>
              <input
                name="prix"
                type="number"
                min="0"
                value={form.prix}
                onChange={handleChange}
                placeholder="Ex: 99"
              />
            </div>
          </div>
          <div className="form-group">
            <label>Niveau requis</label>
            <select
              name="niveauRequis"
              value={form.niveauRequis}
              onChange={handleChange}
            >
              <option value="">-- Choisir --</option>
              <option value="Débutant">Débutant</option>
              <option value="Intermédiaire">Intermédiaire</option>
              <option value="Avancé">Avancé</option>
              <option value="Tous niveaux">Tous niveaux</option>
            </select>
          </div>
          <div className="form-group">
            <label>Catégorie</label>
            <select
              name="idCategorie"
              value={form.idCategorie}
              onChange={handleChange}
            >
              <option value="">-- Choisir --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nomCategorie}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Statut</label>
            <select name="statut" value={form.statut} onChange={handleChange}>
              <option value="brouillon">Brouillon</option>
              <option value="publié">Publié</option>
            </select>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>
            Annuler
          </button>
          <button className="btn-save" onClick={handleSubmit} disabled={saving}>
            {saving
              ? "Enregistrement..."
              : isEdit
                ? "Enregistrer"
                : "Créer la formation"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalModules({ formation, onClose }) {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    titre: "",
    duree: "",
    contenu: "",
  });

  const fetchModules = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/formations/${formation.id}/modules`);
      setModules(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setError("Impossible de charger les modules.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, [formation.id]);

  const handleAddModule = async () => {
    if (!form.titre.trim()) {
      setError("Le titre du module est obligatoire.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = {
        titre: form.titre,
        duree: form.duree ? Number(form.duree) : null,
        contenu: form.contenu || null,
      };
      const res = await api.post(
        `/formations/${formation.id}/modules`,
        payload,
      );
      setModules((prev) => [...prev, res.data]);
      setForm({ titre: "", duree: "", contenu: "" });
    } catch (e) {
      setError("Erreur lors de l ajout du module.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Modules - {formation.titre}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Fermer">
            <i className="fa-solid fa-xmark" aria-hidden="true"></i>
          </button>
        </div>

        {error && <p className="modal-error">{error}</p>}

        <div className="modal-body">
          <div className="form-group">
            <label>Titre du module *</label>
            <input
              value={form.titre}
              onChange={(e) =>
                setForm((p) => ({ ...p, titre: e.target.value }))
              }
              placeholder="Ex: Module 1 - Introduction"
            />
          </div>
          <div className="form-group">
            <label>Durée (minutes)</label>
            <input
              type="number"
              min="1"
              value={form.duree}
              onChange={(e) =>
                setForm((p) => ({ ...p, duree: e.target.value }))
              }
              placeholder="Ex: 45"
            />
          </div>
          <div className="form-group">
            <label>Contenu pédagogique</label>
            <textarea
              rows={3}
              value={form.contenu}
              onChange={(e) =>
                setForm((p) => ({ ...p, contenu: e.target.value }))
              }
              placeholder="Texte, liens vidéo, ressources..."
            />
          </div>

          <button
            className="btn-save"
            onClick={handleAddModule}
            disabled={saving}
          >
            {saving ? "Ajout..." : "Ajouter le module"}
          </button>

          <hr style={{ borderColor: "#374151", width: "100%" }} />

          <h3 style={{ marginBottom: "8px" }}>Liste des modules</h3>
          {loading ? (
            <p>Chargement...</p>
          ) : modules.length === 0 ? (
            <p>Aucun module pour cette formation.</p>
          ) : (
            <ul className="detail-list">
              {modules.map((m) => (
                <li key={m.id}>
                  <strong>{m.titre}</strong>
                  {m.duree ? ` - ${m.duree} min` : ""}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function DashboardFormateur() {
  const navigate = useNavigate();
  const user = getUser();

  const [formations, setFormations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedDurations, setSelectedDurations] = useState([]);
  const [selectedPrices, setSelectedPrices] = useState([]);
  const [formationToEdit, setFormationToEdit] = useState(null);
  const [formationForModules, setFormationForModules] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [formRes, catRes] = await Promise.all([
          api.get("/formations"),
          api.get("/categories"),
        ]);
        setFormations(formRes.data);
        setCategories(catRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleDelete = async (id) => {
    if (
      window.confirm("Êtes-vous sûr de vouloir supprimer cette formation ?")
    ) {
      try {
        await api.delete(`/formations/${id}`);
        setFormations((prev) => prev.filter((f) => f.id !== id));
      } catch (err) {
        alert("Erreur lors de la suppression");
      }
    }
  };

  const handleSave = (data, isEdit) => {
    if (isEdit) {
      setFormations((prev) =>
        prev.map((f) => (f.id === data.id ? { ...f, ...data } : f)),
      );
    } else {
      setFormations((prev) => [...prev, data]);
    }
  };

  const stats = {
    total: formations.length,
    publie: formations.filter((f) => f.statut === "publié").length,
    brouillon: formations.filter((f) => f.statut === "brouillon").length,
    totalVues: formations.reduce((sum, f) => sum + (f.vues || 0), 0),
  };

  const filteredFormations = useMemo(() => {
    return formations.filter((formation) => {
      if (
        search &&
        !formation.titre.toLowerCase().includes(search.toLowerCase()) &&
        !formation.description?.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      if (
        selectedCategories.length > 0 &&
        !selectedCategories.includes(String(formation.idCategorie))
      )
        return false;
      if (
        selectedDurations.length > 0 &&
        !selectedDurations.includes(String(formation.duree))
      )
        return false;
      if (selectedPrices.length > 0) {
        const match = selectedPrices.some((range) => {
          if (range === "0-50") return formation.prix <= 50;
          if (range === "50-100")
            return formation.prix > 50 && formation.prix <= 100;
          if (range === "100-150")
            return formation.prix > 100 && formation.prix <= 150;
          if (range === "150+") return formation.prix > 150;
          return false;
        });
        if (!match) return false;
      }
      return true;
    });
  }, [
    formations,
    search,
    selectedCategories,
    selectedDurations,
    selectedPrices,
  ]);

  return (
    <div className="dashboard">
      {formationToEdit && (
        <ModalFormation
          formation={formationToEdit}
          categories={categories}
          onClose={() => setFormationToEdit(null)}
          onSave={handleSave}
        />
      )}

      {showCreateModal && (
        <ModalFormation
          formation={null}
          categories={categories}
          onClose={() => setShowCreateModal(false)}
          onSave={handleSave}
        />
      )}

      {formationForModules && (
        <ModalModules
          formation={formationForModules}
          onClose={() => setFormationForModules(null)}
        />
      )}

      <header className="dashboard-header">
        <div className="container">
          <h1 className="dashboard-title">
            <i className="fa-solid fa-chalkboard-user" aria-hidden="true"></i>
            Bonjour {user?.prenom} {user?.nom}
          </h1>
          <nav className="dashboard-nav">
            <Link to="/formateur" className="active">
              Mes formations
            </Link>
            <button
              onClick={handleLogout}
              className="btn-reset"
              style={{ width: "auto", padding: "8px 16px" }}
            >
              Déconnexion
            </button>
          </nav>
        </div>
      </header>

      <div className="container dashboard-content">
        {/* 4 Statistiques */}
        <div className="dashboard-stats">
          <div className="stat-card">
            <i
              className="fa-solid fa-layer-group stat-icon"
              aria-hidden="true"
            ></i>
            <h3>{stats.total}</h3>
            <p>Formations totales</p>
          </div>
          <div className="stat-card">
            <i className="fa-solid fa-globe stat-icon" aria-hidden="true"></i>
            <h3>{stats.publie}</h3>
            <p>Publiées</p>
          </div>
          <div className="stat-card">
            <i
              className="fa-solid fa-pen-to-square stat-icon"
              aria-hidden="true"
            ></i>
            <h3>{stats.brouillon}</h3>
            <p>Brouillons</p>
          </div>
          <div className="stat-card">
            <i className="fa-solid fa-eye stat-icon" aria-hidden="true"></i>
            <h3>{stats.totalVues}</h3>
            <p>Vues totales</p>
          </div>
        </div>

        {/* Barre de recherche + bouton créer */}
        <div
          className="search-section"
          style={{ display: "flex", gap: "12px", alignItems: "center" }}
        >
          <input
            type="text"
            placeholder="Rechercher une formation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
            style={{ flex: 1 }}
          />
          <button
            className="btn-create"
            onClick={() => setShowCreateModal(true)}
          >
            <i className="fa-solid fa-plus" aria-hidden="true"></i>
            Nouvelle formation
          </button>
        </div>

        <div className="dashboard-layout">
          <aside className="filters-sidebar">
            <h2>Filtres</h2>

            <div className="filter-group">
              <h3>Catégorie</h3>
              {categories.map((cat) => (
                <label key={cat.id}>
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(String(cat.id))}
                    onChange={() =>
                      setSelectedCategories((prev) =>
                        prev.includes(String(cat.id))
                          ? prev.filter((c) => c !== String(cat.id))
                          : [...prev, String(cat.id)],
                      )
                    }
                  />
                  <i
                    className={`${getCategoryIconByName(cat.nomCategorie)} meta-icon`}
                    aria-hidden="true"
                  ></i>
                  {cat.nomCategorie}
                </label>
              ))}
            </div>

            <div className="filter-group">
              <h3>Durée</h3>
              {durationOptions.map((duree) => (
                <label key={duree}>
                  <input
                    type="checkbox"
                    checked={selectedDurations.includes(String(duree))}
                    onChange={() =>
                      setSelectedDurations((prev) =>
                        prev.includes(String(duree))
                          ? prev.filter((d) => d !== String(duree))
                          : [...prev, String(duree)],
                      )
                    }
                  />
                  {duree} heures
                </label>
              ))}
            </div>

            <div className="filter-group">
              <h3>Prix</h3>
              {priceRanges.map((range) => (
                <label key={range.value}>
                  <input
                    type="checkbox"
                    checked={selectedPrices.includes(range.value)}
                    onChange={() =>
                      setSelectedPrices((prev) =>
                        prev.includes(range.value)
                          ? prev.filter((p) => p !== range.value)
                          : [...prev, range.value],
                      )
                    }
                  />
                  {range.label}
                </label>
              ))}
            </div>

            <button
              onClick={() => {
                setSearch("");
                setSelectedCategories([]);
                setSelectedDurations([]);
                setSelectedPrices([]);
              }}
              className="btn-reset"
            >
              Réinitialiser
            </button>
          </aside>

          <main className="formations-list">
            <div className="results-header">
              <p>
                {filteredFormations.length} formation
                {filteredFormations.length > 1 ? "s" : ""} trouvée
                {filteredFormations.length > 1 ? "s" : ""}
              </p>
            </div>

            {loading ? (
              <div className="no-results">
                <p>Chargement...</p>
              </div>
            ) : filteredFormations.length === 0 ? (
              <div className="no-results">
                <h3>Aucune formation trouvée</h3>
                <p>
                  Essayez de modifier vos critères ou{" "}
                  <button
                    className="btn-link"
                    onClick={() => setShowCreateModal(true)}
                  >
                    créez une formation
                  </button>
                </p>
              </div>
            ) : (
              <div className="formations-grid">
                {filteredFormations.map((formation) => (
                  <div key={formation.id} className="formation-card">
                    <div className="formation-header">
                      <span className={`badge badge-${formation.statut}`}>
                        {formation.statut === "publié" ? "Publié" : "Brouillon"}
                      </span>
                      <span className="formation-category">
                        <i
                          className={`${getCategoryIconByName(formation.categorie?.nomCategorie)} meta-icon`}
                          aria-hidden="true"
                        ></i>
                        {formation.categorie?.nomCategorie || "Non classe"}
                      </span>
                    </div>
                    <h3>{formation.titre}</h3>
                    <p className="formation-description">
                      {formation.description}
                    </p>
                    <div className="formation-meta">
                      <span>
                        <i
                          className="fa-solid fa-clock meta-icon"
                          aria-hidden="true"
                        ></i>
                        {formation.duree}h
                      </span>
                      <span>
                        <i
                          className="fa-solid fa-signal meta-icon"
                          aria-hidden="true"
                        ></i>
                        {formation.niveauRequis}
                      </span>
                      <span>
                        <i
                          className="fa-solid fa-eye meta-icon"
                          aria-hidden="true"
                        ></i>
                        {formation.vues || 0} vues
                      </span>
                      <span className="formation-price">{formation.prix}€</span>
                    </div>
                    <p className="formation-date">
                      Créé le{" "}
                      {new Date(formation.created_at).toLocaleDateString(
                        "fr-FR",
                      )}
                    </p>
                    <div className="formation-actions">
                      <button
                        className="btn-modify"
                        onClick={() => setFormationToEdit(formation)}
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(formation.id)}
                        className="btn-delete"
                      >
                        Supprimer
                      </button>
                      <Link
                        to={`/ateliers/${formation.id}`}
                        className="btn-details"
                      >
                        Voir détails
                      </Link>
                      <button
                        className="btn-details"
                        onClick={() => setFormationForModules(formation)}
                      >
                        Modules
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default DashboardFormateur;
