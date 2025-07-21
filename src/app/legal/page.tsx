"use client";

import { useEffect, useState } from "react";
import Button from "@/components/atom/button";
import { ArrowLeftIcon } from "lucide-react";

type HostInfo = {
    city: string;
    regionName: string;
    country: string;
    zip: string;
    isp: string;
    org: string;
};

const MentionsLegales = () => {

    const [hostInfo, setHostInfo] = useState<HostInfo | null>(null);

    useEffect(() => {
        fetch("http://ip-api.com/json/31.97.177.250")
            .then((res) => res.json())
            .then((data) => {
                if (data.status === "success") {
                    setHostInfo({
                        city: data.city,
                        regionName: data.regionName,
                        country: data.country,
                        zip: data.zip,
                        isp: data.isp,
                        org: data.org,
                    });
                }
            })
            .catch((err) => console.error("Erreur de récupération IP API", err));
    }, []);
    return (
        <div className="max-w-4xl mx-auto px-4 py-8 text-gray-800 bg-white relative">
            <div className="absolute top-5 left-5">
                <Button type="button" openLink="/welcome" iconLeft={<ArrowLeftIcon />} size="default" variant="link" className="w-10 h-10 bg-primary-100 rounded-full flex justify-center items-center" />
            </div>
            <h1 className="text-3xl font-bold mb-6 mt-10">Mentions légales</h1>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-2">1. Éditeur du site</h2>
                <p><strong>Nom du projet :</strong> Dresss</p>
                <p><strong>Responsable de la publication :</strong> Bilel Dounar</p>
                <p><strong>Adresse e-mail :</strong> bilel.dounar.pro@gmail.com</p>
                <p><strong>Statut :</strong> Projet personnel dans le cadre d&apos;une formation DWWM</p>
                <p><strong>Hébergement :</strong>
                    {hostInfo ? (
                        <>
                            {` ${hostInfo.org}, ${hostInfo.city} (${hostInfo.regionName}), ${hostInfo.zip}, ${hostInfo.country}`}
                            <br />
                            <span className="text-sm text-gray-600">Fourni par {hostInfo.isp}</span>
                        </>
                    ) : (
                        " Chargement..."
                    )}
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-2">2. Propriété intellectuelle</h2>
                <p>
                    Tout le contenu présent sur Dresss (textes, images, logos, codes, etc.) est protégé
                    par le droit de la propriété intellectuelle. Toute reproduction ou diffusion sans
                    autorisation est interdite.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-2">3. Données personnelles</h2>
                <p>
                    Des données personnelles sont collectées lors de l&apos;utilisation du site pour assurer le bon
                    fonctionnement des fonctionnalités (inscription, préférences, publications).
                </p>
                <ul className="list-disc list-inside">
                    <li><strong>Base légale :</strong> Intérêt légitime (article 6 du RGPD)</li>
                    <li><strong>Responsable :</strong> Bilel Dounar</li>
                    <li><strong>Données collectées :</strong> nom, prénom, email, pseudo, mot de passe hashé, préférences, etc.</li>
                    <li><strong>Droits :</strong> accès, rectification, suppression (RGPD articles 15 à 22)</li>
                    <li><strong>Contact :</strong> bilel.dounar.pro@gmail.com</li>
                    <li><strong>Conservation :</strong> 3 ans après la dernière activité</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-2">4. Cookies</h2>
                <p>
                    Des cookies peuvent être utilisés pour améliorer l&apos;expérience utilisateur et mesurer l&apos;audience.
                    Vous pouvez les refuser via les paramètres de votre navigateur.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-2">5. Responsabilité</h2>
                <p>
                    L&apos;éditeur ne peut être tenu responsable d&apos;éventuelles erreurs, dysfonctionnements ou contenus
                    externes accessibles via des liens présents sur le site.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-2">6. Accessibilité</h2>
                <p>
                    Dresss est conçu pour respecter l&apos;accessibilité (contrastes, navigation clavier, responsive, etc.),
                    conformément au RGAA. Contactez bilel.dounar.pro@gmail.com pour signaler un problème d&apos;accessibilité.
                </p>
            </section>

            <section>
                <h2 className="text-xl font-semibold mb-2">7. Droit applicable</h2>
                <p>
                    Ces mentions légales sont soumises au droit français. En cas de litige, les juridictions françaises sont seules compétentes.
                </p>
            </section>
        </div>
    );
};

export default MentionsLegales;
