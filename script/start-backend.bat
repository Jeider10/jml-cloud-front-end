@echo off
REM --- Moverse a la carpeta donde está el bat ---
cd /d %~dp0

REM --- Ubicación del JDK portable ---
set JAVA_HOME=%~dp0jdk\jdk-21.0.7
set PATH=%JAVA_HOME%\bin;%PATH%

REM --- Ejecutar el VBScript sin mostrar consola ---
wscript start-backend.vbs

exit
