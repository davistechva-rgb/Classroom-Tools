; Classroom Tools installer - Davis Tech Support
; Installs for the current user only (no admin rights needed). Saved work in Documents\Classroom Tools is never touched.
Unicode true
!include "MUI2.nsh"
!ifndef VERSION
  !define VERSION "1.0.0"
!endif
!define APP "Classroom Tools"
!define UNKEY "Software\Microsoft\Windows\CurrentVersion\Uninstall\ClassroomTools"
Name "${APP}"
OutFile "dist\Classroom-Tools-Setup-${VERSION}.exe"
InstallDir "$LOCALAPPDATA\Programs\${APP}"
InstallDirRegKey HKCU "${UNKEY}" "InstallLocation"
RequestExecutionLevel user
SetCompressor /SOLID lzma
BrandingText "Davis Tech Support · davis-tech-support.com"
VIProductVersion "${VERSION}.0"
VIAddVersionKey "ProductName" "${APP}"
VIAddVersionKey "CompanyName" "Davis Tech Support"
VIAddVersionKey "FileDescription" "${APP} installer"
VIAddVersionKey "FileVersion" "${VERSION}"
VIAddVersionKey "LegalCopyright" "© Davis Tech Support"
!define MUI_ICON "build\icon.ico"
!define MUI_UNICON "build\icon.ico"
!define MUI_WELCOMEPAGE_TITLE "Welcome to Classroom Tools"
!define MUI_WELCOMEPAGE_TEXT "This will install Classroom Tools: over 350 games, timers, quizzes and teacher tools that work without the internet.$\r$\n$\r$\nYour work is saved automatically in Documents\Classroom Tools.$\r$\n$\r$\nNo administrator password is needed."
!define MUI_FINISHPAGE_RUN "$INSTDIR\${APP}.exe"
!define MUI_FINISHPAGE_RUN_TEXT "Open Classroom Tools now"
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH
!define MUI_UNCONFIRMPAGE_TEXT_TOP "Classroom Tools will be removed. Your saved classes and backups in Documents\Classroom Tools will be kept."
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_LANGUAGE "English"
Section "Install"
  ; close the app if it is open so files can be replaced
  nsExec::Exec 'taskkill /IM "${APP}.exe" /F'
  Sleep 1500
  SetOutPath "$INSTDIR"
  RMDir /r "$INSTDIR\resources"
  File /r "dist\win-unpacked\*"
  WriteUninstaller "$INSTDIR\Uninstall ${APP}.exe"
  CreateShortCut "$DESKTOP\${APP}.lnk" "$INSTDIR\${APP}.exe"
  CreateShortCut "$SMPROGRAMS\${APP}.lnk" "$INSTDIR\${APP}.exe"
  WriteRegStr HKCU "${UNKEY}" "DisplayName" "${APP}"
  WriteRegStr HKCU "${UNKEY}" "DisplayVersion" "${VERSION}"
  WriteRegStr HKCU "${UNKEY}" "Publisher" "Davis Tech Support"
  WriteRegStr HKCU "${UNKEY}" "URLInfoAbout" "https://davis-tech-support.com"
  WriteRegStr HKCU "${UNKEY}" "DisplayIcon" "$INSTDIR\${APP}.exe"
  WriteRegStr HKCU "${UNKEY}" "InstallLocation" "$INSTDIR"
  WriteRegStr HKCU "${UNKEY}" "UninstallString" '"$INSTDIR\Uninstall ${APP}.exe"'
  WriteRegDWORD HKCU "${UNKEY}" "NoModify" 1
  WriteRegDWORD HKCU "${UNKEY}" "NoRepair" 1
SectionEnd
Function .onInstSuccess
  ; after an automatic update (silent install), open the app again
  IfSilent 0 +2
  Exec '"$INSTDIR\${APP}.exe"'
FunctionEnd
Section "Uninstall"
  nsExec::Exec 'taskkill /IM "${APP}.exe" /F'
  Delete "$DESKTOP\${APP}.lnk"
  Delete "$SMPROGRAMS\${APP}.lnk"
  RMDir /r "$INSTDIR"
  DeleteRegKey HKCU "${UNKEY}"
SectionEnd
