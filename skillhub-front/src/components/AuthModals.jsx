import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { login, register } from "../services/authService";

function setFieldBorder(field, valid) {
  if (!field) return;
  field.style.borderColor = valid ? "#374151" : "#ef4444";
}

function apiErrorMessage(err) {
  const d = err.response?.data; // Corps de la réponse HTTP, si disponible
  if (!d) return err.message || "Erreur réseau"; // Pas de réponse = erreur réseau
  if (typeof d.error === "string") return d.error; // L'API renvoie un champ "error"
  if (d.errors) {
    // L'API renvoie un objet "errors"
    const first = Object.values(d.errors)[0];
    return Array.isArray(first) ? first[0] : String(first);
  }
  return "Erreur";
}

function splitNomPrenom(fullName) {
  const t = fullName.trim();
  if (!t) return { nom: "", prenom: "" };
  const parts = t.split(/\s+/); // Découpe sur les espaces
  if (parts.length === 1) return { nom: parts[0], prenom: "-" };
  return { nom: parts[0], prenom: parts.slice(1).join(" ") };
}

export default function AuthModals({
  modal,
  modalData,
  onClose,
  openModal,
  refreshPublicSession,
}) {
  const formConnexionRef = useRef(null);
  const formInscriptionRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();

  const [connError, setConnError] = useState(""); // Message d'erreur affiché
  const [connLoading, setConnLoading] = useState(false); // Désactive le bouton pendant l'appel API
  const [connEmail, setConnEmail] = useState("");

  // États pour la modale d'inscription
  const [regError, setRegError] = useState("");
  const [regLoading, setRegLoading] = useState(false);

  // Le sous-titre de la modale d'inscription change selon la page courante
  const inscriptionSubtitle =
    location.pathname === "/ateliers"
      ? "Créez votre compte en moins de 2 minutes."
      : "Créez votre compte.";

  // Fermer la modale avec la touche Échap
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    // On écoute uniquement quand une modale est ouverte
    if (modal) document.addEventListener("keydown", onKey);
    //  on retire l'écouteur quand la modale se ferme ou que le composant démonte
    return () => document.removeEventListener("keydown", onKey);
  }, [modal, onClose]);

  //Vider les erreurs à chaque ouverture de modale
  useEffect(() => {
    if (modal) {
      setConnError("");
      setRegError("");
    }
  }, [modal]);

  useEffect(() => {
    if (modal === "connexion") {
      setConnEmail(modalData?.prefillEmail ?? "");
    }
  }, [modal, modalData]);

  /**
   * Appelée après une connexion ou inscription réussie.
   * Ferme la modale, rafraîchit la session, et redirige vers l'accueil.
   */
  const redirectAfterPublicAuth = () => {
    onClose();
    refreshPublicSession();
    navigate("/");
  };

  return (
    <>
      <div
        className={`modal${modal === "connexion" ? " active" : ""}`}
        id="modal-connexion"
        role="dialog"
        aria-modal="true"
        // Clic sur l'overlay : ferme la modale

        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="modal-content">
          {/* Bouton croix en haut à droite */}
          <button
            type="button"
            className="close"
            id="close-connexion"
            onClick={onClose}
            aria-label="Fermer"
          >
            ×
          </button>

          <h2>Connexion</h2>
          <p>Connectez-vous à votre compte SkillHub</p>

          {connError && (
            <p
              style={{
                color: "#f87171",
                marginBottom: "12px",
                fontSize: "0.9rem",
              }}
            >
              {connError}
            </p>
          )}

          {/* ── Formulaire de connexion ── */}
          <form
            id="form-connexion"
            ref={formConnexionRef}
            onSubmit={async (e) => {
              e.preventDefault(); // Empêche le rechargement de la page
              setConnError(""); // Réinitialise les erreurs précédentes

              const form = formConnexionRef.current;
              if (!form) return;

              // ── Validation manuelle des champs requis ──
              const required = form.querySelectorAll("[required]");
              let valid = true;
              required.forEach((field) => {
                if (!field.value) {
                  setFieldBorder(field, false); // Bordure rouge si vide
                  valid = false;
                } else {
                  setFieldBorder(field, true); // Bordure normale si rempli
                }
              });
              if (!valid) return;

              // Récupération des valeurs des champs
              const email = connEmail.trim();
              const password =
                form.querySelector("#login-password")?.value ?? "";

              // ── Appel API de connexion ──
              setConnLoading(true);
              try {
                await login(email, password); // Appel au service auth
                form.reset(); // Vide le formulaire
                redirectAfterPublicAuth(); // Redirige vers l'accueil
              } catch (err) {
                setConnError(apiErrorMessage(err)); // Affiche l'erreur API
              } finally {
                setConnLoading(false); // Réactive le bouton dans tous les cas
              }
            }}
          >
            {/* Champ email */}
            <div>
              <label htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                required
                placeholder="votre@email.com"
                value={connEmail}
                onChange={(e) => setConnEmail(e.target.value)}
                disabled={connLoading} // Désactivé pendant le chargement
              />
            </div>

            {/* Champ mot de passe */}
            <div>
              <label htmlFor="login-password">Mot de passe</label>
              <input
                id="login-password"
                type="password"
                required
                placeholder="••••••••"
                disabled={connLoading}
              />
            </div>

            <div>
              <label>
                <input type="checkbox" disabled={connLoading} /> Se souvenir de
                moi
              </label>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={connLoading}
            >
              {connLoading ? "Connexion…" : "Se connecter"}
            </button>

            {/* Lien pour passer à la modale d'inscription */}
            <p
              style={{
                textAlign: "center",
                marginTop: "15px",
                fontSize: "0.9rem",
              }}
            >
              Pas encore de compte ?{" "}
              <a
                href="#"
                id="switch-to-signup"
                style={{ color: "#6366f1" }}
                onClick={(e) => {
                  e.preventDefault();
                  openModal("inscription"); // Ouvre la modale d'inscription
                }}
              >
                S&apos;inscrire
              </a>
            </p>
          </form>
        </div>
      </div>

      <div
        className={`modal${modal === "inscription" ? " active" : ""}`}
        id="modal-inscription"
        role="dialog"
        aria-modal="true"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="modal-content">
          <button
            type="button"
            className="close"
            id="close-inscription"
            onClick={onClose}
            aria-label="Fermer"
          >
            ×
          </button>

          <h2>Rejoindre SkillHub</h2>

          <p id="inscription-subtitle">{inscriptionSubtitle}</p>

          {regError && (
            <p
              style={{
                color: "#f87171",
                marginBottom: "12px",
                fontSize: "0.9rem",
              }}
            >
              {regError}
            </p>
          )}

          {/* ── Formulaire d'inscription ── */}
          <form
            id="form-inscription"
            ref={formInscriptionRef}
            onSubmit={async (e) => {
              e.preventDefault();
              setRegError("");

              const form = formInscriptionRef.current;
              if (!form) return;

              // Validation des champs requis
              const required = form.querySelectorAll("[required]");
              let valid = true;
              required.forEach((field) => {
                const isCheckbox = field.type === "checkbox";
                // Pour une checkbox : on vérifie .checked, pour un input : .value
                const ok = isCheckbox ? field.checked : field.value;
                if (!ok) {
                  setFieldBorder(field, false);
                  valid = false;
                } else {
                  setFieldBorder(field, true);
                }
              });
              if (!valid) return;

              // Récupération des valeurs des champs
              const role = form.querySelector("#signup-role")?.value ?? "";
              const fullName =
                form.querySelector("#signup-name")?.value?.trim() ?? "";
              const email =
                form.querySelector("#signup-email")?.value?.trim() ?? "";
              const password =
                form.querySelector("#signup-password")?.value ?? "";

              // Découpe le nom complet en nom + prénom
              const { nom, prenom } = splitNomPrenom(fullName);
              if (!nom) {
                setRegError("Indiquez au moins un nom.");
                return;
              }

              // ── Appel API d'inscription ──
              setRegLoading(true);
              try {
                await register({ nom, prenom, email, password, role });
                form.reset();
                openModal("connexion", { prefillEmail: email });
              } catch (err) {
                setRegError(apiErrorMessage(err));
              } finally {
                setRegLoading(false);
              }
            }}
          >
            {/* Sélection du rôle : Apprenant ou Formateur */}
            <div>
              <label htmlFor="signup-role">Je suis :</label>
              <select
                id="signup-role"
                required
                defaultValue=""
                disabled={regLoading}
              >
                <option value="">Choisissez...</option>
                <option value="APPRENANT">Apprenant·e</option>
                <option value="FORMATEUR">Formateur·rice</option>
              </select>
            </div>

            {/* Champ nom complet  */}
            <div>
              <label htmlFor="signup-name">Nom et prénom</label>
              <input
                id="signup-name"
                type="text"
                required
                disabled={regLoading}
              />
            </div>

            {/* Champ email */}
            <div>
              <label htmlFor="signup-email">Email</label>
              <input
                id="signup-email"
                type="email"
                required
                disabled={regLoading}
              />
            </div>

            {/* Champ mot de passe avec longueur minimale */}
            <div>
              <label htmlFor="signup-password">Mot de passe</label>
              <input
                id="signup-password"
                type="password"
                required
                minLength={6} // Minimum 6 caractères imposé par HTML
                placeholder="Minimum 6 caractères"
                disabled={regLoading}
              />
            </div>

            {/* Champ objectif  */}
            <div>
              <label htmlFor="signup-objectif">Objectif</label>
              <textarea
                id="signup-objectif"
                rows={3}
                placeholder="Ex : Devenir développeur en 12 mois"
                disabled={regLoading}
              />
            </div>

            <div>
              <span>Format :</span>
              <label>
                <input
                  type="radio"
                  name="format"
                  value="visio"
                  disabled={regLoading}
                />{" "}
                Visio
              </label>
              <label>
                <input
                  type="radio"
                  name="format"
                  value="presentiel"
                  disabled={regLoading}
                />{" "}
                Présentiel
              </label>
              <label>
                <input
                  type="radio"
                  name="format"
                  value="both"
                  disabled={regLoading}
                />{" "}
                Peu importe
              </label>
            </div>

            <div>
              <label>
                <input type="checkbox" required disabled={regLoading} />{" "}
                J&apos;accepte la politique RGPD
              </label>
            </div>

            {/* Bouton de soumission */}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={regLoading}
            >
              {regLoading ? "Création…" : "Créer mon compte"}
            </button>

            {/* Lien pour revenir à la modale de connexion */}
            <p
              style={{
                textAlign: "center",
                marginTop: "15px",
                fontSize: "0.9rem",
              }}
            >
              Déjà un compte ?{" "}
              <a
                href="#"
                id="switch-to-login"
                style={{ color: "#6366f1" }}
                onClick={(e) => {
                  e.preventDefault();
                  openModal("connexion", {
                    prefillEmail:
                      formInscriptionRef.current
                        ?.querySelector("#signup-email")
                        ?.value?.trim() ?? "",
                  });
                }}
              >
                Se connecter
              </a>
            </p>
          </form>
        </div>
      </div>
    </>
  );
}
