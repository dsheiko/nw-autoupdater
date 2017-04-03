#!/bin/bash

for i in "$@"
do
case $i in
  --app-path=*)
    APP_PATH="${i#*=}"
    shift
    ;;
  --bak-path=*)
    BAK_PATH="${i#*=}"
    shift
    ;;
  --update-path=*)
    UPDATE_PATH="${i#*=}"
    shift
    ;;
  --runner=*)
    RUNNER="${i#*=}"
    shift
    ;;
    *)
            # unknown option
    ;;
esac
done

rm -rf ${BAK_PATH}
cp -rf ${APP_PATH} ${BAK_PATH}
cp -rf ${UPDATE_PATH} ${APP_PATH}
open -a $($RUNNER)