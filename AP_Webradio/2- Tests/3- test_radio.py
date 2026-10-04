import socket
import threading
import time

TARGET_IP = "192.168.2.241"
TARGET_PORT = 8000
MOUNT_POINT = "/joystick-fm"
TOTAL_USERS = 150

accepted = 0
refused = 0

def connect_listener(id_auditeur):
    global accepted, refused
    try:
        # Création d'une connexion TCP directe
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(5)
        s.connect((TARGET_IP, TARGET_PORT))
        
        # Envoi de la requête HTTP brute (comme un navigateur)
        request = f"GET {MOUNT_POINT} HTTP/1.1\r\nHost: {TARGET_IP}\r\nUser-Agent: RadioTester/1.0\r\n\r\n"
        s.send(request.encode())
        
        # Lecture de la réponse d'Icecast
        response = s.recv(1024).decode(errors='ignore')
        
        if "200 OK" in response:
            accepted += 1
            print(f"[+] Auditeur {id_auditeur:03d} : Connecté (En écoute...)")
            # On simule un auditeur qui reste écouter pendant 60 secondes
            time.sleep(60) 
        else:
            refused += 1
            print(f"[-] Auditeur {id_auditeur:03d} : REJETÉ (Limite atteinte ou erreur)")
            
        s.close()
    except Exception as e:
        refused += 1
        print(f"[!] Auditeur {id_auditeur:03d} : Erreur de connexion -> {e}")

print(f"🚀 Lancement de l'assaut : {TOTAL_USERS} auditeurs sur {TARGET_IP}:{TARGET_PORT}{MOUNT_POINT}")

# On lance les utilisateurs virtuels (un thread par auditeur)
threads = []
for i in range(1, TOTAL_USERS + 1):
    t = threading.Thread(target=connect_listener, args=(i,))
    threads.append(t)
    t.start()
    time.sleep(0.05) # Petite pause pour attaquer le serveur de manière réaliste

# On attend que tout le monde ait fini (ou soit rejeté)
for t in threads:
    t.join()

print("\n📊 --- RÉSULTAT DU TEST ---")
print(f"✅ Auditeurs acceptés : {accepted}")
print(f"❌ Auditeurs rejetés  : {refused}")