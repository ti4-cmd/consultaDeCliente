@echo off
for /f "skip=5 tokens=1" %%p in ('wmic process where "name='node.exe'" get processid 2^>nul ^| findstr /r "[0-9]"') do (
    taskkill /PID %%p /F >nul 2>&1
)
echo Processos Node.exe encerrados.
