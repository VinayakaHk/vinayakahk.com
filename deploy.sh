#!/bin/bash
cd "$(dirname "$0")"
hugo && sudo rsync -a public/ /var/www/vinayakahk.com/
