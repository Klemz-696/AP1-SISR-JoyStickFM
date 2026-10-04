import os

# Fichier de sortie
OUTPUT_FILE = "projet_complet.txt"

# Extensions à inclure (on ignore les images, mp3, etc.)
EXTENSIONS_TEXTE = ['.html', '.css', '.js', '.php', '.md', '.txt', '.sql']

def afficher_arborescence(chemin, prefix=""):
    resultat = ""
    fichiers_et_dossiers = sorted(os.listdir(chemin))
    
    # Ignorer les dossiers cachés (ex: .git) ET le fichier de sortie lui-même
    fichiers_et_dossiers = [f for f in fichiers_et_dossiers if not f.startswith('.') and f != OUTPUT_FILE]
    
    for index, nom in enumerate(fichiers_et_dossiers):
        chemin_complet = os.path.join(chemin, nom)
        est_dernier = (index == len(fichiers_et_dossiers) - 1)
        connecteur = " ┗ " if est_dernier else " ┣ "
        
        resultat += prefix + connecteur + nom + "\n"
        
        if os.path.isdir(chemin_complet):
            extension_prefix = "   " if est_dernier else " ┃ "
            resultat += afficher_arborescence(chemin_complet, prefix + extension_prefix)
            
    return resultat

def ecrire_contenu_fichiers(chemin_racine, fichier_sortie):
    # Registre pour garder une trace des fichiers déjà traités et éviter tout doublon
    fichiers_traites = set()
    
    for racine, dossiers, fichiers in os.walk(chemin_racine):
        # Ignorer les dossiers cachés
        dossiers[:] = [d for d in dossiers if not d.startswith('.')]
        
        for fichier in fichiers:
            # Sécurité 1 : Ne JAMAIS traiter le fichier de sortie lui-même
            if fichier == OUTPUT_FILE:
                continue
                
            _, ext = os.path.splitext(fichier)
            if ext.lower() in EXTENSIONS_TEXTE:
                chemin_complet = os.path.join(racine, fichier)
                chemin_absolu = os.path.abspath(chemin_complet)
                
                # Sécurité 2 : Vérifier si le fichier a déjà été ajouté au document
                if chemin_absolu in fichiers_traites:
                    continue
                
                # Marquer le fichier comme traité
                fichiers_traites.add(chemin_absolu)
                chemin_relatif = os.path.relpath(chemin_complet, chemin_racine)
                
                fichier_sortie.write(f"\n\n{'='*50}\n")
                fichier_sortie.write(f"FICHIER : {chemin_relatif}\n")
                fichier_sortie.write(f"{'='*50}\n\n")
                
                try:
                    with open(chemin_complet, 'r', encoding='utf-8') as f:
                        fichier_sortie.write(f.read())
                except Exception as e:
                    fichier_sortie.write(f"[Erreur de lecture du fichier : {e}]\n")

if __name__ == "__main__":
    dossier_projet = "." # Dossier courant
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as out:
        out.write("ARBORESCENCE DU PROJET :\n")
        out.write("Site-Web-WordPress\n")
        out.write(afficher_arborescence(dossier_projet))
        out.write("\n\nCONTENU DES FICHIERS :\n")
        ecrire_contenu_fichiers(dossier_projet, out)
        
    print(f"Documentation générée avec succès dans : {OUTPUT_FILE}")