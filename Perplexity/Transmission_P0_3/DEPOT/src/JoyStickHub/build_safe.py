#!/usr/bin/env python3
"""Local, explicit Java build. Does not deploy, use SSH, Docker or RCON."""
import argparse, hashlib, json, pathlib, re, shutil, subprocess, tempfile, zipfile

VERSION='1.5.3-player-menu-review'

def sha(path):
    with path.open('rb') as f: return hashlib.file_digest(f,'sha256').hexdigest()

def pack(classes, output):
    with zipfile.ZipFile(output,'w',zipfile.ZIP_DEFLATED) as z:
        for p in sorted(classes.rglob('*')):
            if not p.is_file(): continue
            info=zipfile.ZipInfo(p.relative_to(classes).as_posix(),date_time=(1980,1,1,0,0,0))
            info.compress_type=zipfile.ZIP_DEFLATED;info.external_attr=0o644<<16
            z.writestr(info,p.read_bytes())

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--classpath-dir',required=True,type=pathlib.Path)
    parser.add_argument('--compile',action='store_true',help='Explicit local compilation, no deployment')
    args=parser.parse_args()
    here=pathlib.Path(__file__).resolve().parent
    source=here/'src/main/java/fm/joystick/hub/JoyStickHub.java'
    descriptor=here/'src/main/resources/plugin.yml'
    if not source.is_file() or not descriptor.is_file(): raise SystemExit('Sources/resources absent')
    classpath_dir=args.classpath_dir.resolve()
    if not classpath_dir.is_dir(): raise SystemExit('Classpath directory absent; no auto-download')
    jars=sorted(p for p in classpath_dir.glob('*.jar') if p.is_file())
    if not jars: raise SystemExit('No classpath JARs provided')
    api_found=False;deps=[]
    for jar in jars:
        dep={'name':jar.name,'sha256':sha(jar)}
        with zipfile.ZipFile(jar) as z:
            if 'org/bukkit/plugin/java/JavaPlugin.class' in z.namelist(): api_found=True
            prop='META-INF/maven/io.papermc.paper/paper-api/pom.properties'
            if prop in z.namelist():
                data=z.read(prop).decode('utf-8',errors='replace')
                v=re.search(r'^version=(.+)$',data,re.M)
                if v: dep['declared_paper_api_version']=v.group(1).strip()
        deps.append(dep)
    if not api_found: raise SystemExit('Classpath does not contain a Bukkit/Paper JavaPlugin API')
    plan={'version':VERSION,'source_sha256':sha(source),'descriptor_sha256':sha(descriptor),
          'release':25,'dependencies':deps,'deploys':False,'status':'PLAN_ONLY'}
    if not args.compile:
        print(json.dumps(plan,ensure_ascii=False,indent=2));return
    compiler=shutil.which('javac')
    if not compiler: raise SystemExit('javac absent; use an audited JDK 25 toolchain')
    version=subprocess.check_output([compiler,'-version'],stderr=subprocess.STDOUT,text=True).strip()
    m=re.search(r'javac (\d+)',version)
    if not m or int(m.group(1))<25: raise SystemExit('JDK 25+ required for release 25')
    target=here/'target/safe-build'
    target.mkdir(parents=True,exist_ok=True)
    import os
    with tempfile.TemporaryDirectory(prefix='classes-',dir=target) as temp:
        classes=pathlib.Path(temp)
        command=[compiler,'--release','25','-encoding','UTF-8','-cp',os.pathsep.join(map(str,jars)),
                 '-d',str(classes),str(source)]
        result=subprocess.run(command,text=True,capture_output=True)
        (target/'javac.log').write_text(result.stdout+result.stderr,encoding='utf-8')
        if result.returncode: raise SystemExit('Compilation failed; inspect target/safe-build/javac.log')
        shutil.copyfile(descriptor,classes/'plugin.yml')
        output=target/('JoyStickHub-'+VERSION+'.jar')
        pack(classes,output)
    plan.update({'status':'COMPILED_LOCAL_ONLY','javac':version,'jar':output.name,'jar_sha256':sha(output)})
    (target/'BUILD_MANIFEST.json').write_text(json.dumps(plan,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps(plan,ensure_ascii=False,indent=2))

if __name__=='__main__': main()
