' VBScript wrapper to launch Python Local Agent silently with 0 window style
Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

strScriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
strPythonExe = strScriptDir & "\venv\Scripts\python.exe"

If Not fso.FileExists(strPythonExe) Then
    strPythonExe = "python.exe"
End If

strAgentPy = strScriptDir & "\agent.py"

' Run hidden (0 = hide window, False = don't wait for completion)
WshShell.Run """" & strPythonExe & """ """ & strAgentPy & """", 0, False
