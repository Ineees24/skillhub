import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import {
  desinscrireAtelier,
  fetchAteliers,
  fetchMesInscriptions,
} from "../services/atelierService";
import { getCategoryVisualByKey } from "../utils/categoryVisuals";
import "./Dashboard.css";

const fallbackApprenantFormations = [
  {
    id: 1,
    titre: "Introduction à React",
    description:
      "Découvrez les bases de React et créez votre première application interactive.",
    categorie: "developpement",
    duree: 4,
    prix: 89,
    statut: "en-cours",
    dateInscription: "2024-02-20",
    progression: 60,
  },
  {
    id: 2,
    titre: "UI Design avec Figma",
    description:
      "Maîtrisez Figma pour créer des interfaces modernes et professionnelles.",
    categorie: "design",
    duree: 3,
    prix: 75,
    statut: "termine",
    dateInscription: "2024-01-15",
    progression: 100,
  },
  {
    id: 3,
    titre: "SEO pour débutants",
    description:
      "Apprenez les techniques de référencement naturel pour améliorer votre visibilité.",
    categorie: "marketing",
    duree: 2,
    prix: 49,
    statut: "termine",
    dateInscription: "2024-01-10",
    progression: 100,
  },
  {
    id: 4,
    titre: "Communication assertive",
    description:
      "Développez votre capacité à communiquer avec confiance et clarté.",
    categorie: "soft-skills",
    duree: 3,
    prix: 65,
    statut: "en-cours",
    dateInscription: "2024-02-25",
    progression: 30,
  },
  {
    id: 5,
    titre: "Montage vidéo avec Premiere Pro",
    description:
      "Maîtrisez Premiere Pro pour créer des vidéos professionnelles.",
    categorie: "creation-contenu",
    duree: 6,
    prix: 95,
    statut: "termine",
    dateInscription: "2024-01-05",
    progression: 100,
  },
];

const categories = {
  developpement: "Developpement",
  design: "Design",
  marketing: "Marketing",
  "soft-skills": "Soft Skills",
  "creation-contenu": "Creation de Contenu",
  entrepreneuriat: "Entrepreneuriat",
};

const priceRanges = [
  { value: "0-50", label: "0€ - 50€" },
  { value: "50-100", label: "50€ - 100€" },
  { value: "100-150", label: "100€ - 150€" },
  { value: "150+", label: "Plus de 150€" },
];

const durationOptions = [2, 3, 4, 6, 8];

function DashboardApprenant() {
  const navigate = useNavigate();
  const [formations, setFormations] = useState(fallbackApprenantFormations);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedDurations, setSelectedDurations] = useState([]);
  const [selectedPrices, setSelectedPrices] = useState([]);
  const [selectedStatuts, setSelectedStatuts] = useState([]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setApiError("");

    const mapAteliersToDashboard = (rows) =>
      rows.map((f, index) => {
        const termine = index % 3 === 0;
        const progression = termine ? 100 : 20 + ((index * 13) % 70);
        return {
          id: f.id,
          titre: f.titre,
          description: f.description || "",
          categorie: f.categorie || "developpement",
          duree: Number(f.duree || 0),
          prix: Number(f.prix || 0),
          statut: termine ? "termine" : "en-cours",
          dateInscription: new Date().toISOString().slice(0, 10),
          progression,
        };
      });

    fetchMesInscriptions()
      .then((data) => {
        if (!alive) return;
        const inscriptions = Array.isArray(data?.inscriptions)
          ? data.inscriptions
          : [];
        if (inscriptions.length > 0) {
          setFormations(inscriptions);
          return;
        }

        return fetchAteliers().then((allData) => {
          if (!alive) return;
          const rows = Array.isArray(allData?.liste_atelier)
            ? allData.liste_atelier
            : [];
          if (rows.length > 0) {
            setFormations(mapAteliersToDashboard(rows));
            setApiError(
              "Aucune inscription trouvée, affichage de la liste générale.",
            );
          } else {
            setApiError("Aucune formation récupérée depuis le backend.");
          }
        });
      })
      .catch(() => {
        if (!alive) return;
        setApiError("Backend indisponible, affichage des données locales.");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  const filteredFormations = useMemo(() => {
    return formations.filter((formation) => {
      if (
        search &&
        !formation.titre.toLowerCase().includes(search.toLowerCase()) &&
        !formation.description.toLowerCase().includes(search.toLowerCase())
      ) {
        return false;
      }

      if (
        selectedCategories.length > 0 &&
        !selectedCategories.includes(formation.categorie)
      ) {
        return false;
      }

      if (
        selectedDurations.length > 0 &&
        !selectedDurations.includes(formation.duree.toString())
      ) {
        return false;
      }

      if (selectedPrices.length > 0) {
        const priceMatch = selectedPrices.some((range) => {
          if (range === "0-50")
            return formation.prix >= 0 && formation.prix <= 50;
          if (range === "50-100")
            return formation.prix > 50 && formation.prix <= 100;
          if (range === "100-150")
            return formation.prix > 100 && formation.prix <= 150;
          if (range === "150+") return formation.prix > 150;
          return false;
        });
        if (!priceMatch) return false;
      }

      if (
        selectedStatuts.length > 0 &&
        !selectedStatuts.includes(formation.statut)
      ) {
        return false;
      }

      return true;
    });
  }, [
    formations,
    search,
    selectedCategories,
    selectedDurations,
    selectedPrices,
    selectedStatuts,
  ]);

  const handleCategoryChange = (categorie) => {
    setSelectedCategories((prev) =>
      prev.includes(categorie)
        ? prev.filter((c) => c !== categorie)
        : [...prev, categorie],
    );
  };

  const handleDurationChange = (duree) => {
    setSelectedDurations((prev) =>
      prev.includes(duree)
        ? prev.filter((d) => d !== duree)
        : [...prev, duree],
    );
  };

  const handlePriceChange = (price) => {
    setSelectedPrices((prev) =>
      prev.includes(price)
        ? prev.filter((p) => p !== price)
        : [...prev, price],
    );
  };

  const handleStatutChange = (statut) => {
    setSelectedStatuts((prev) =>
      prev.includes(statut)
        ? prev.filter((s) => s !== statut)
        : [...prev, statut],
    );
  };

  const resetFilters = () => {
    setSearch("");
    setSelectedCategories([]);
    setSelectedDurations([]);
    setSelectedPrices([]);
    setSelectedStatuts([]);
  };

  const handleSuivre = (id) => {
    navigate(`/apprenant/suivi/${id}`);
  };

  const handleNePlusSuivre = (id) => {
    const ok = globalThis.confirm(
      "Voulez-vous vraiment ne plus suivre cette formation ?",
    );
    if (!ok) return;
    desinscrireAtelier(id)
      .then(() => {
        setFormations((prev) => prev.filter((f) => f.id !== id));
      })
      .catch((err) => {
        const msg =
          err.response?.data?.message || "Erreur lors de la désinscription.";
        globalThis.alert(msg);
      });
  };

  const stats = {
    total: formations.length,
    enCours: formations.filter((f) => f.statut === "en-cours").length,
    termine: formations.filter((f) => f.statut === "termine").length,
    progressionMoyenne: Math.round(
      formations.reduce((sum, f) => sum + f.progression, 0) /
        (formations.length || 1),
    ),
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="container">
          <h1 className="dashboard-title">
            <i className="fa-solid fa-user-graduate" aria-hidden="true"></i>
            {" "}Tableau de bord Apprenant
          </h1>
          <nav className="dashboard-nav">
            <Link to="/apprenant" className="active">
              Mes formations
            </Link>
          </nav>
        </div>
      </header>

      <div className="container dashboard-content">
        <div className="dashboard-stats">
          <div className="stat-card">
            <i className="fa-solid fa-book-open stat-icon" aria-hidden="true"></i>
            <h3>{stats.total}</h3>
            <p>Formations totales</p>
          </div>
          <div className="stat-card">
            <i className="fa-solid fa-play stat-icon" aria-hidden="true"></i>
            <h3>{stats.enCours}</h3>
            <p>En cours</p>
          </div>
          <div className="stat-card">
            <i className="fa-solid fa-circle-check stat-icon" aria-hidden="true"></i>
            <h3>{stats.termine}</h3>
            <p>Terminées</p>
          </div>
          <div className="stat-card">
            <i className="fa-solid fa-chart-line stat-icon" aria-hidden="true"></i>
            <h3>{stats.progressionMoyenne}{" "}%</h3>
            <p>Progression moyenne</p>
          </div>
        </div>

        <div className="search-section">
          <input
            type="text"
            placeholder="Rechercher une formation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="dashboard-layout">
          <aside className="filters-sidebar">
            <h2>Filtres</h2>

            <div className="filter-group">
              <h3>Statut</h3>
              <label>
                <input
                  type="checkbox"
                  checked={selectedStatuts.includes("en-cours")}
                  onChange={() => handleStatutChange("en-cours")}
                />{" "}
                En cours
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={selectedStatuts.includes("termine")}
                  onChange={() => handleStatutChange("termine")}
                />{" "}
                Terminé
              </label>
            </div>

            <div className="filter-group">
              <h3>Catégorie</h3>
              {Object.entries(categories).map(([key, label]) => (
                <label key={key}>
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(key)}
                    onChange={() => handleCategoryChange(key)}
                  />{" "}
                  {label}
                </label>
              ))}
            </div>

            <div className="filter-group">
              <h3>Durée</h3>
              {durationOptions.map((duree) => (
                <label key={duree}>
                  <input
                    type="checkbox"
                    checked={selectedDurations.includes(duree.toString())}
                    onChange={() => handleDurationChange(duree.toString())}
                  />{" "}
                  {duree}{" "}heures
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
                    onChange={() => handlePriceChange(range.value)}
                  />{" "}
                  {range.label}
                </label>
              ))}
            </div>

            <button onClick={resetFilters} className="btn-reset">
              Réinitialiser
            </button>
          </aside>

          <main className="formations-list">
            <div className="results-header">
              <p>
                {filteredFormations.length}{" "}
                formation{filteredFormations.length > 1 ? "s" : ""}{" "}
                trouvée{filteredFormations.length > 1 ? "s" : ""}
              </p>
              {loading && <p>Chargement des formations...</p>}
              {!loading && apiError && (
                <p style={{ color: "#fca5a5" }}>{apiError}</p>
              )}
            </div>

            {filteredFormations.length === 0 ? (
              <div className="no-results">
                <h3>Aucune formation trouvée</h3>
                <p>Essayez de modifier vos critères de recherche</p>
              </div>
            ) : (
              <div className="formations-grid">
                {filteredFormations.map((formation) => (
                  <div key={formation.id} className="formation-card">
                    <div className="formation-header">
                      <span className={`badge badge-${formation.statut}`}>
                        {formation.statut === "en-cours"
                          ? "En cours"
                          : "Terminé"}
                      </span>
                      <span className="formation-category">
                        <i
                          className={`${getCategoryVisualByKey(formation.categorie).icon} meta-icon`}
                          aria-hidden="true"
                        ></i>
                        {" "}{categories[formation.categorie]}
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
                        {" "}{formation.duree}h
                      </span>
                      <span className="formation-price">{formation.prix}€</span>
                    </div>

                    {formation.progression !== undefined && (
                      <div className="progression-bar">
                        <div
                          className="progression-fill"
                          style={{ width: `${formation.progression}%` }}
                        ></div>
                        <span className="progression-text">
                          {formation.progression}% complété
                        </span>
                      </div>
                    )}

                    <p className="formation-date">
                      Inscrit le{" "}
                      {new Date(formation.dateInscription).toLocaleDateString("fr-FR")}
                    </p>

                    <div className="formation-actions">
                      <button
                        onClick={() => handleSuivre(formation.id)}
                        className="btn-follow"
                      >
                        Suivre
                      </button>
                      <button
                        onClick={() => handleNePlusSuivre(formation.id)}
                        className="btn-unfollow"
                      >
                        Ne plus suivre
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

export default DashboardApprenant;