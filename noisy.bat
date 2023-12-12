@echo off
chcp 65001 > nul
if exist node_modules\ (
  npm run dev
) else (
    echo Библиотеки не обнаружены, устанавливаем
  npm i 
  cls
  npm run dev
)

pause