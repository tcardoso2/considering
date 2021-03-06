#!/bin/bash

export MOCHA_BADGE_SUBJECT=mocha
export MOCHA_BADGE_OK_COLOR=green
export MOCHA_BADGE_KO_COLOR=orange
export MOCHA_BADGE_STYLE=flat

#Reporter
mocha --reporter mocha-reporter-badge | sed -n -e '/<svg/,$p' > badge.svg

mocha
