Set fso = CreateObject("Scripting.FileSystemObject")
vbsFolder = fso.GetParentFolderName(WScript.ScriptFullName)

Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = vbsFolder

' Ejecutar el JAR en segundo plano totalmente oculto
' 0 = ventana oculta, True = espera a que termine (no queremos esperar)
WshShell.Run "java -jar """ & vbsFolder & "\jml-cloud-authentication-serverless-service-1.0-SNAPSHOT.jar""", 0, False
Set WshShell = Nothing
