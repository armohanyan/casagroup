$ErrorActionPreference = "Stop"

$mysqlBin = "C:\Program Files\MySQL\MySQL Server 8.4\bin"
$ini = "C:\Users\Dev\casagroup-mysql.ini"

if (Get-Process mysqld -ErrorAction SilentlyContinue) {
    Write-Host "MySQL already running."
    exit 0
}

Start-Process -FilePath "$mysqlBin\mysqld.exe" -ArgumentList "--defaults-file=$ini" -WindowStyle Hidden
Start-Sleep -Seconds 6

& "$mysqlBin\mysql.exe" -u root --protocol=TCP -P 3306 -e "SELECT VERSION();"
Write-Host "MySQL started on localhost:3306"
