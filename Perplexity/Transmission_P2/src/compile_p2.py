import os, subprocess, zipfile, shutil, hashlib

root = os.path.abspath(r'c:\Users\sauze\Desktop\AP 1')
lib_dir = os.path.join(root, 'scratch', 'lib')
src_file = os.path.join(root, 'scratch', 'src', 'fm', 'joystick', 'hub', 'JoyStickHub.java')
bin_dir = os.path.join(root, 'scratch', 'bin_p2')
output_jar = os.path.join(root, 'scratch', 'JoyStickHub-1.6.0-p2.jar')

if os.path.exists(bin_dir):
    shutil.rmtree(bin_dir)
os.makedirs(bin_dir, exist_ok=True)

cp_jars = [os.path.join(lib_dir, f) for f in os.listdir(lib_dir) if f.endswith('.jar')]
we_jar = os.path.join(root, 'scratch', 'staging_p0_2', 'data', 'plugins', 'WorldEdit.jar')
if os.path.exists(we_jar):
    cp_jars.append(we_jar)
classpath = ';'.join(cp_jars)

print('[1/4] Compilation avec javac...')
cmd = ['javac', '-cp', classpath, '-d', bin_dir, src_file]
res = subprocess.run(cmd, capture_output=True, text=True)
if res.returncode != 0:
    print('ERREUR de compilation :')
    print(res.stderr)
    exit(1)
print('-> Compilation réussie avec code 0.')

print('[2/4] Copie des ressources plugin.yml et config.yml...')
shutil.copy2(os.path.join(root, 'scratch', 'src', 'plugin.yml'), os.path.join(bin_dir, 'plugin.yml'))
shutil.copy2(os.path.join(root, 'scratch', 'src', 'config.yml'), os.path.join(bin_dir, 'config.yml'))

print(f'[3/4] Emballage dans {output_jar}...')
with zipfile.ZipFile(output_jar, 'w', zipfile.ZIP_DEFLATED) as zf:
    for foldername, subfolders, filenames in os.walk(bin_dir):
        for filename in filenames:
            filepath = os.path.join(foldername, filename)
            arcname = os.path.relpath(filepath, bin_dir)
            zf.write(filepath, arcname)

h = hashlib.sha256()
with open(output_jar, 'rb') as f:
    for chunk in iter(lambda: f.read(65536), b''):
        h.update(chunk)

print(f'[4/4] JAR généré avec succès !')
print(f'Taille : {os.path.getsize(output_jar)} octets')
print(f'SHA256 : {h.hexdigest()}')
