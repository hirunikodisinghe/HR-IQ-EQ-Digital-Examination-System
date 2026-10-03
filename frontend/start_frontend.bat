@echo off
cd /d "C:\Users\hiruni\hiruni_gri\IQ_EQ_paper\frontend"

set "PATH=C:\Program Files\nodejs;%PATH%"

call "C:\Program Files\nodejs\npm.cmd" run dev -- --host 0.0.0.0