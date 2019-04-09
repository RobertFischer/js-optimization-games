#!/bin/bash -exu

cd `dirname $0`

YARN=$(which yarn || "npx yarn")

rm -r -f ./node_modules
$YARN install

for FILE in ./suites/*.js
do
	echo "Running $FILE using Node $(node -v)"
	$YARN run cathedra "$FILE"
done
