# Site — Fleuriste May Flower (Tunis)

Site vitrine statique : HTML, CSS et JavaScript, sans framework ni dépendance côté visiteur.
Il peut être hébergé tel quel (Netlify, Vercel, GitHub Pages, OVH, o2switch…).

```
index.html            page unique (sections : univers, créations, galerie, livraison, avis, contact)
css/styles.css        styles (couleurs et typographies en variables en haut du fichier)
js/main.js            menu mobile, apparitions, visionneuse, horaires « ouvert / fermé »
assets/img/           images optimisées (WebP 640 / 1200 / 1800 px) — générées automatiquement
assets/og-image.webp   image de partage réseaux sociaux (1200×630)
source-photos/        photos originales (c’est ici que l’on remplace les images)
tools/                script d’optimisation des images
robots.txt, sitemap.xml
```

## Voir le site en local

```
npm install
npm run serve      →  http://localhost:4321
```

## Remplacer ou ajouter une photo

1. Déposez la nouvelle photo dans `source-photos/` **avec le même nom de fichier**
   (ex. `corbeille-roses-lys.webp` (ou .jpg) pour la photo principale du hero).
2. Lancez `npm run images` : les versions WebP sont régénérées dans `assets/img/`.
3. Si le format change (portrait ↔ paysage), mettez à jour `width` / `height` de la balise `<img>` dans `index.html`.

Pour **ajouter** une photo à la galerie, copiez un bloc `<figure class="g-item">` dans `index.html`,
changez les noms de fichiers, le texte `alt`, la légende et l’attribut `data-cats`
(`bouquets`, `compositions`, `roses`, `saison`, `occasions`) : la photo apparaîtra
automatiquement dans la catégorie correspondante de la section « Nos créations ».

| Fichier source | Emplacement sur le site |
|---|---|
| corbeille-roses-lys.webp | Hero (grande image), galerie, image de partage |
| bouquet-roses-rouges.webp | Hero (vignette), créations « Roses », galerie |
| boutique-devanture.webp | Notre univers, galerie |
| gerberas-boutique.webp | Notre univers, galerie |
| bouquet-gerberas-roses.webp | Créations « Bouquets », galerie |
| composition-lys-roses.webp | Créations « Compositions », galerie |
| tulipes-jaunes.webp | Créations « Fleurs de saison », galerie |
| bouquet-bon-retablissement.webp | Créations « Occasions », Livraison, galerie |
| bouquet-roses-kraft.webp, bouquet-blanc-lys.webp, bouquet-rond-lys-roses.webp | Galerie |

## Provenance des contenus

- **Photos** : 10 photos publiques de la fiche Google Maps (accessibles sans compte) et 1 photo de la page
  Facebook officielle (tulipes). Ce sont des photos publiées sur la fiche de l’établissement ; certaines
  peuvent avoir été déposées par des clients. Faites valider leur utilisation par le fleuriste.
- **Prestations** : reprises de la présentation de la page Facebook officielle
  (bouquets, compositions, décoration florale de voiture de mariage et de salles des fêtes, plantes, bacs et pots).
- **Horaires** : fiche Google Maps (tous les jours, 7h30 – 21h00), relevés le 24/11/2026.
- **Adresse / e-mail** : page Facebook officielle. **Note** : 4,9/5, 77 avis (Google).
- **Avis** : courts extraits d’avis Google publics, prénom + initiale (accords grammaticaux corrigés).
- Aucun tarif, produit ni témoignage n’a été inventé.

## Avant la mise en ligne

- Remplacer `https://www.example.com/` par le vrai nom de domaine dans `index.html`
  (canonical, Open Graph, JSON-LD), `robots.txt` et `sitemap.xml`.
- Vérifier que le numéro +216 22 727 629 est bien actif sur WhatsApp.
- Revendiquer la fiche Google Business Profile (elle est encore « non revendiquée ») et y ajouter l’adresse du site.
