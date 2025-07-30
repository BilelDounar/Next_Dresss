"use client";

import Button from "@/components/atom/button";
import { ArrowLeftIcon } from "lucide-react";
import React from "react";

const PolitiqueConfidentialite = () => {
    return (
        <div className="max-w-4xl mx-auto px-4 py-8 text-gray-800 bg-white relative">
            <div className="absolute top-5 left-5">
                <Button type="button" openLink="/welcome" iconLeft={<ArrowLeftIcon />} size="default" variant="link" className="w-10 h-10 bg-primary-100 rounded-full flex justify-center items-center" />
            </div>
            <h1 className="text-3xl font-bold mb-6 mt-10">Politique de confidentialité</h1>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-2">1. Introduction</h2>
                <p>
                    Cette politique de confidentialité décrit la manière dont l&apos;application <strong>Dresss </strong>
                    collecte, utilise et protège les données personnelles des utilisateurs. En utilisant le site, vous acceptez les conditions décrites ci-dessous.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-2">2. Données collectées</h2>
                <ul className="list-disc list-inside">
                    <li><strong>Lors de l’inscription :</strong> nom, prénom, email, pseudo, mot de passe (hashé)</li>
                    <li><strong>Dans le profil :</strong> préférences vestimentaires, date de naissance, genre</li>
                    <li><strong>Activité sur le site :</strong> likes, commentaires, favoris, publications</li>
                    <li><strong>Données techniques :</strong> adresse IP, navigateur, appareil, logs d’accès</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-2">3. Utilisation des données</h2>
                <p>Les données collectées sont utilisées pour :</p>
                <ul className="list-disc list-inside">
                    <li>Créer et gérer les comptes utilisateurs</li>
                    <li>Personnaliser les recommandations de tenues</li>
                    <li>Améliorer les fonctionnalités de la plateforme</li>
                    <li>Assurer la sécurité et prévenir les abus</li>
                    <li>Envoyer des notifications relatives à l’activité de l’utilisateur</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-2">4. Stockage et sécurité</h2>
                <p>
                    Les données sont stockées sur des serveurs sécurisés (MongoDB + PostgreSQL) hébergés via un VPS (Coolify).
                    Les mots de passe sont hashés et non stockés en clair. Des mécanismes de contrôle d’accès et de journalisation sont en place.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-2">5. Partage des données</h2>
                <p>
                    Les données personnelles ne sont <strong>jamais vendues</strong> ni cédées à des tiers.
                    Elles peuvent être partagées uniquement :
                </p>
                <ul className="list-disc list-inside">
                    <li>Avec des prestataires techniques strictement nécessaires (hébergement, base de données)</li>
                    <li>En cas d’obligation légale (réquisition judiciaire, enquête, etc.)</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-2">6. Droits des utilisateurs</h2>
                <p>Conformément au RGPD, vous disposez des droits suivants :</p>
                <ul className="list-disc list-inside">
                    <li>Droit d’accès à vos données</li>
                    <li>Droit de rectification</li>
                    <li>Droit à l’effacement (droit à l’oubli)</li>
                    <li>Droit d’opposition</li>
                    <li>Droit à la portabilité</li>
                </ul>
                <p>Pour toute demande : <strong>bilel.dounar.pro@gmail.com</strong></p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-2">7. Cookies</h2>
                <p>
                    Des cookies peuvent être utilisés pour des mesures d’audience et pour retenir les préférences utilisateurs.
                    Vous pouvez les désactiver via les paramètres de votre navigateur.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-2">8. Durée de conservation</h2>
                <p>
                    Les données sont conservées pendant 3 ans à compter de la dernière activité, ou supprimées à la demande de l’utilisateur.
                </p>
            </section>

            <section>
                <h2 className="text-xl font-semibold mb-2">9. Modifications</h2>
                <p>
                    La présente politique peut être modifiée à tout moment pour des raisons légales ou techniques. Vous serez informé en cas de changements significatifs.
                </p>
            </section>
        </div>
    );
};

export default PolitiqueConfidentialite;
