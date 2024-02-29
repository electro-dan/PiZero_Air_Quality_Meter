# Raspberry Pi (Zero) IR and Thermal Camera - Setup Steps

## Recommended - change mirror
see https://www.raspbian.org/RaspbianMirrors

`sudo nano /etc/apt/sources.list`

`sudo apt update`

## Prerequisites
in /boot/config.txt:

```
dtparam=i2c_arm=on
[all]
enable_uart=1
```

`sudo sh -c "echo i2c-dev >> /etc/modules"`

Install tools

`sudo apt install -y git cmake gcc g++`

`sudo apt install -y zram-tools`

`sudo apt install -y i2c-tools`

## Python Requirements
`sudo apt install -y python3-pip python3-bottle python3-influxdb python3-serial`

## Clone libraries
`git clone https://github.com/pi3g/bme68x-python-library`

Put the BSEC zip in the bme68x-python-library directory that is created and unzip it there (unzip bsec_2-0-6-1_generic_release_04302021.zip). The folder BSEC_2.0.6.1_Generic_Release_04302021 should be created inside bme68x-python-library. 

`cd ~/bme68x-python-library`

`sudo python3 setup.py install`

## Clone this repo
`git clone https://github.com/electro-dan/PiZero_Air_Quality_Meter.git`

`mv PiZero_Air_Quality_Meter/* ~`

## InfluxDB
`wget -q https://repos.influxdata.com/influxdata-archive_compat.key`

`echo '393e8779c89ac8d958f81f942f9ad7fb82a25e133faddaf92e15b16e6ac9ce4c influxdata-archive_compat.key' | sha256sum -c && cat influxdata-archive_compat.key | gpg --dearmor | sudo tee /etc/apt/trusted.gpg.d/influxdata-archive_compat.gpg > /dev/null`

`echo 'deb [signed-by=/etc/apt/trusted.gpg.d/influxdata-archive_compat.gpg] https://repos.influxdata.com/debian stable main' | sudo tee /etc/apt/sources.list.d/influxdata.list`

`sudo apt update`

`sudo apt install influxdb`

`sudo service influxdb start`

## Burn-In
`git clone https://github.com/mcalisterkm/p-sensors`

`cd ~/p-sensors/src/1.3.0/BurnIn/`

`nohup python3 burn_in.py &`

Wait 24h. Put hand cleanser gel (60 / 70% alcohol) in front of sensor for a short while during burn in.

Copy new conf_ and state_ files from conf subfolder to conf subfolder in home (or where PiZero_Air_Quality_Meter is cloned to).

Update airqread.py with filename.

## Web Service NGINX reverse proxy
`sudo apt install -y nginx`

`sudo cp ~/nginx/sites-available/default /etc/nginx/sites-available/default`

`sudo systemctl restart nginx.service`

## Setup Services
`sudo cp services/system/*.service /etc/systemd/system/`

`sudo systemctl daemon-reload`

`sudo systemctl enable bottleweb.service`

`sudo systemctl enable airqread.service`

## Recommended

Automatic updates

`sudo apt-get install unattended-upgrades`

`sudo dpkg-reconfigure --priority=low unattended-upgrades`

Firewall

`sudo apt install ufw`

`sudo ufw allow 22`

`sudo ufw limit 22`

`sudo ufw allow 80`

`sudo ufw allow 443`

`sudo ufw enable`

Reduce SD card writes

Adjust journald.conf and replace rsyslog

`sudo nano /etc/systemd/journald.conf`

```
[Journal]
Storage=volatile
...
RuntimeMaxUse=64M
...
ForwardToConsole=no
ForwardToWall=no
...
```

`sudo systemctl restart systemd-journald`

`sudo apt-get install -y busybox-syslogd`

`sudo dpkg --purge rsyslog`

# Tweak influxdb

`sudo nano /etc/influxdb/influxdb.conf`

```
...
  query-log-enabled = false
...
  cache-max-memory-size = "100m"
...
  cache-snapshot-memory-size = "25m"
...
  cache-snapshot-write-cold-duration = "1h"
...
[monitor]
  # Whether to record statistics internally.
  store-enabled = false
...
```

`sudo systemctl restart influxd.service`
