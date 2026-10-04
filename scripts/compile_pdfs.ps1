$baseDir = "c:\Users\sauze\Desktop\TS2 SIO\AP\AP 1"
$seance1Dir = Join-Path $baseDir "01_Journal_de_Bord\Seance_01_2026-09-08"
$seance2Dir = Join-Path $baseDir "01_Journal_de_Bord\Seance_02_2026-09-22"
$livrablesDir = Join-Path $baseDir "Livrables_Officiels"
$chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"

# 1. Compilation Plan d'Adressage (Séance 1)
$html1 = Join-Path $seance1Dir "AP1_Plan_d_Adressage_Complet.html"
$pdf1_seance = Join-Path $seance1Dir "AP1_Plan_d_Adressage_Sauzede_Duthilleul.pdf"
$pdf1_livrable = Join-Path $livrablesDir "AP1_Plan_d_Adressage_Sauzede_Duthilleul.pdf"

$tempProfile1 = Join-Path $env:TEMP ("chrome_pdf_" + (Get-Random))
Remove-Item -Force $pdf1_seance -ErrorAction SilentlyContinue
Write-Host "Compilation de $pdf1_seance ..."
& $chromePath --headless --disable-gpu --no-sandbox "--user-data-dir=$tempProfile1" --no-pdf-header-footer "--print-to-pdf=$pdf1_seance" "$html1"
Start-Sleep -Seconds 3
Remove-Item -Recurse -Force $tempProfile1 -ErrorAction SilentlyContinue
Copy-Item -Force $pdf1_seance $pdf1_livrable
Write-Host "PDF 1 généré et copié dans Livrables_Officiels."

# 2. Compilation Résumé d'Avancement (Séance 1)
$html2 = Join-Path $seance1Dir "Resume_Avancement_2026-09-08.html"
$pdf2_seance = Join-Path $seance1Dir "Resume_Avancement_2026-09-08.pdf"
$pdf2_livrable = Join-Path $livrablesDir "Resume_Avancement_2026-09-08.pdf"

$tempProfile2 = Join-Path $env:TEMP ("chrome_pdf_" + (Get-Random))
Remove-Item -Force $pdf2_seance -ErrorAction SilentlyContinue
Write-Host "Compilation de $pdf2_seance ..."
& $chromePath --headless --disable-gpu --no-sandbox "--user-data-dir=$tempProfile2" --no-pdf-header-footer "--print-to-pdf=$pdf2_seance" "$html2"
Start-Sleep -Seconds 3
Remove-Item -Recurse -Force $tempProfile2 -ErrorAction SilentlyContinue
Copy-Item -Force $pdf2_seance $pdf2_livrable
Write-Host "PDF 2 généré et copié dans Livrables_Officiels."

# 3. Compilation Résumé d'Avancement (Séance 2 - 22/09/2026)
$html3 = Join-Path $seance2Dir "Resume_Avancement_2026-09-22.html"
$pdf3_seance = Join-Path $seance2Dir "Resume_Avancement_2026-09-22.pdf"
$pdf3_livrable = Join-Path $livrablesDir "Resume_Avancement_2026-09-22.pdf"

$tempProfile3 = Join-Path $env:TEMP ("chrome_pdf_" + (Get-Random))
Remove-Item -Force $pdf3_seance -ErrorAction SilentlyContinue
Write-Host "Compilation de $pdf3_seance ..."
& $chromePath --headless --disable-gpu --no-sandbox "--user-data-dir=$tempProfile3" --no-pdf-header-footer "--print-to-pdf=$pdf3_seance" "$html3"
Start-Sleep -Seconds 3
Remove-Item -Recurse -Force $tempProfile3 -ErrorAction SilentlyContinue
Copy-Item -Force $pdf3_seance $pdf3_livrable
Write-Host "PDF 3 (Séance 2) généré et copié dans Livrables_Officiels."

# 4. Compilation Résumé d'Avancement (Séance 3 - 28/09/2026)
$seance3Dir = Join-Path $baseDir "01_Journal_de_Bord\Seance_03_2026-09-28"
$html4 = Join-Path $seance3Dir "Resume_Avancement_2026-09-28.html"
$pdf4_seance = Join-Path $seance3Dir "Resume_Avancement_2026-09-28.pdf"
$pdf4_livrable = Join-Path $livrablesDir "Resume_Avancement_2026-09-28.pdf"

$tempProfile4 = Join-Path $env:TEMP ("chrome_pdf_" + (Get-Random))
Remove-Item -Force $pdf4_seance -ErrorAction SilentlyContinue
Write-Host "Compilation de $pdf4_seance ..."
& $chromePath --headless --disable-gpu --no-sandbox "--user-data-dir=$tempProfile4" --no-pdf-header-footer "--print-to-pdf=$pdf4_seance" "$html4"
Start-Sleep -Seconds 3
Remove-Item -Recurse -Force $tempProfile4 -ErrorAction SilentlyContinue
Copy-Item -Force $pdf4_seance $pdf4_livrable
Write-Host "PDF 4 (Séance 3) généré et copié dans Livrables_Officiels."

# 5. Compilation Résumé d'Avancement (Séance 4 - 04/10/2026)
$seance4Dir = Join-Path $baseDir "01_Journal_de_Bord\Seance_04_2026-10-04"
$html5 = Join-Path $seance4Dir "Resume_Avancement_2026-10-04.html"
$pdf5_seance = Join-Path $seance4Dir "Resume_Avancement_2026-10-04.pdf"
$pdf5_livrable = Join-Path $livrablesDir "Resume_Avancement_2026-10-04.pdf"

$tempProfile5 = Join-Path $env:TEMP ("chrome_pdf_" + (Get-Random))
Remove-Item -Force $pdf5_seance -ErrorAction SilentlyContinue
Write-Host "Compilation de $pdf5_seance ..."
& $chromePath --headless --disable-gpu --no-sandbox "--user-data-dir=$tempProfile5" --no-pdf-header-footer "--print-to-pdf=$pdf5_seance" "$html5"
Start-Sleep -Seconds 3
Remove-Item -Recurse -Force $tempProfile5 -ErrorAction SilentlyContinue
Copy-Item -Force $pdf5_seance $pdf5_livrable
Write-Host "PDF 5 (Séance 4) généré et copié dans Livrables_Officiels."

