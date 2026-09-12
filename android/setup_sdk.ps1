$env:JAVA_HOME = "D:\Fintrack\android\jdk17\jdk-17.0.10+7"
$env:Path = "$env:JAVA_HOME\bin;" + $env:Path

Write-Host "Accepting Android SDK Licenses and Installing Android 34 Platform & Build Tools..."
& "D:\Fintrack\android\sdk\cmdline-tools\latest\bin\sdkmanager.bat" --sdk_root="D:\Fintrack\android\sdk" --licenses
& "D:\Fintrack\android\sdk\cmdline-tools\latest\bin\sdkmanager.bat" --sdk_root="D:\Fintrack\android\sdk" "platforms;android-34" "build-tools;34.0.0" "platform-tools"
Write-Host "SDK Setup Complete!"
