Add-Type -AssemblyName System.Drawing
$files = @("android-icon-foreground.png", "android-icon-monochrome.png", "android-icon-background.png", "splash-icon.png")
foreach ($f in $files) {
    $path = Join-Path $PWD "assets\$f"
    if (Test-Path $path) {
        Write-Host "Converting $f"
        $img = [System.Drawing.Image]::FromFile($path)
        $tempPath = Join-Path $PWD "assets\temp_$f"
        $img.Save($tempPath, [System.Drawing.Imaging.ImageFormat]::Png)
        $img.Dispose()
        Remove-Item -Path $path -Force
        Rename-Item -Path $tempPath -NewName $f
    }
}
Write-Host "Done"
