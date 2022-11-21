#!/bin/sh

rm -f /tmp/server.pid
bin/rails db:migrate
bin/rails s -b 0.0.0.0 --pid /tmp/server.pid
